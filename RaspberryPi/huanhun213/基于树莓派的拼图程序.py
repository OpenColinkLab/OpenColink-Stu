#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MJPG 视频流 + 黑色 A4 工作区 + A/B几何拼图 + C扑克中心对称（稳定识别版）

功能：
1. 从 A4 图像中识别 2~4 块白色碎片；
2. 自动判断碎片位于左半区还是右半区；
3. 用几何边匹配把碎片拼成矩形；
4. 将拼好的矩形整体放到 A4 的另一半，且不缩放碎片；
5. 输出每块碎片的抓取中心、旋转角、放置中心；
6. 同时输出像素坐标、A4 毫米坐标、JSON、CSV 和标注结果图。

坐标约定：
- 图像内部识别坐标仍保持 V8 原样：左上角为原点，x 向右，y 向下；
- 串口发送的机械坐标以相机画面中 A4 右下角为原点；
- 机械 X 轴向上，机械 Y 轴向左；
- 正旋转角表示图像坐标系中的顺时针旋转；
- 默认 A4 实际尺寸为 297 mm × 210 mm。

最终版保留V3窗口和拼图结果显示，加入：
- 黑色A4多候选定位与自适应阈值回退；
- A4边界对比度评分与近景白边二次收紧；
- 碎片左右半区分别评分、多阈值回退和稳定3~5边形拟合；
- 后台线程防止视频窗口未响应；
- 树莓派串口发送，串口不可用时视觉继续运行；
- 启动后只持续识别A4纸和碎片，不自动拼图、不自动发送；按S后才开始拼图并发送；按A时才测量并显示碎片边长；
- 机械臂搬运顺序固定按照识别碎片面积从小到大执行。

安装：
    pip install opencv-python numpy pyserial

使用：
    python mjpg_a4_puzzle_system.py image.jpg
    python mjpg_a4_puzzle_system.py --source 0
    python mjpg_a4_puzzle_system.py --source http://192.168.1.10:8080/video

UI按键：A/B/C识别后都先显示真实碎片；随后A/B执行原几何拼图，C执行中心对称拼图，并在完成后显示最终结果。
"""

from __future__ import annotations

import argparse
import atexit
import csv
import gc
import glob
import heapq
import itertools
import json
import math
import os
import signal
import sys
import traceback
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Optional, Sequence, Tuple

# 限制底层数学库的线程池，避免树莓派为少量矩阵运算预留大量虚拟内存。
# setdefault 不会覆盖用户手动设置的环境变量。
os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")

import cv2
import numpy as np

try:
    cv2.setUseOptimized(True)
    cv2.setNumThreads(max(1, min(2, os.cpu_count() or 1)))
    if hasattr(cv2, "ocl"):
        cv2.ocl.setUseOpenCL(False)
except Exception:
    pass


# ---------------------- 树莓派运行跟踪与摄像头保护 ----------------------
TRACE_RUNTIME = True
_ACTIVE_CAPTURE: Optional[cv2.VideoCapture] = None
_ACTIVE_CAPTURE_LOCK = threading.Lock()


def trace_log(stage: str, message: str) -> None:
    if not TRACE_RUNTIME:
        return
    now = time.strftime("%H:%M:%S")
    thread_name = threading.current_thread().name
    print(f"[{now}][{thread_name}][{stage}] {message}", flush=True)


def _set_active_capture(capture: Optional[cv2.VideoCapture]) -> None:
    global _ACTIVE_CAPTURE
    with _ACTIVE_CAPTURE_LOCK:
        _ACTIVE_CAPTURE = capture


def _release_capture_object(capture: Optional[cv2.VideoCapture], reason: str) -> None:
    global _ACTIVE_CAPTURE
    if capture is None:
        return
    try:
        trace_log("摄像头释放", f"开始 release()；原因={reason}")
        capture.release()
        trace_log("摄像头释放", "release() 完成")
    except Exception as exc:
        trace_log("摄像头释放异常", repr(exc))
    with _ACTIVE_CAPTURE_LOCK:
        if _ACTIVE_CAPTURE is capture:
            _ACTIVE_CAPTURE = None


def _atexit_camera_cleanup() -> None:
    global _ACTIVE_CAPTURE
    with _ACTIVE_CAPTURE_LOCK:
        capture = _ACTIVE_CAPTURE
        _ACTIVE_CAPTURE = None
    if capture is not None:
        try:
            capture.release()
        except Exception:
            pass
    try:
        cv2.destroyAllWindows()
    except Exception:
        pass


atexit.register(_atexit_camera_cleanup)


# ----------------------------- 可调参数 ---------------------------------
# 默认摄像头编号：只有一个摄像头通常是0，第二个摄像头通常是1
DEFAULT_CAMERA_SOURCE = "1"
# 两条边长度的最大相对误差。实拍图有透视畸变时可提高到 0.15。
EDGE_LENGTH_TOLERANCE = 0.18

# 多边形轮廓逼近精度，占轮廓周长的比例。
APPROX_EPSILON_RATIO = 0.015

# 忽略面积小于整幅图面积该比例的白色噪点。
MIN_PIECE_AREA_RATIO = 0.003

# 多边形拟合不再使用“面积误差低于固定阈值后无条件选最少顶点”的跳变规则。
# 每增加一个顶点，需要带来足够明显的轮廓面积改善，才会保留这个顶点。
# 这样相邻视频帧中的轻微曝光/锯齿变化不会让同一块碎片在四边形和五边形
# 之间反复切换。题目碎片为3~5边形，因此最终识别严格限制在这个范围内。
POLYGON_VERTEX_COMPLEXITY_PENALTY = 0.012
MAX_POLYGON_AREA_ERROR = 0.180

# 快速阈值路径达到该分数才直接采用；低置信度时自动进入多阈值回退。
MIN_FAST_PIECE_MASK_SCORE = 21.0

# 放置中允许的微小重叠，占较小碎片面积的比例。
MAX_OVERLAP_RATIO = 0.020

# 最终矩形最低填充率。越接近 1，拼接越完整。
MIN_RECT_FILL_RATIO = 0.94

# 拼接后联合面积/碎片面积总和，防止通过互相覆盖“伪造”高填充率。
MIN_AREA_CONSERVATION_RATIO = 0.970

# 最终矩形长宽比范围，对应题目 9×5 cm ~ 12×9 cm，并留少量余量。
MIN_ASPECT_RATIO = 1.00
MAX_ASPECT_RATIO = 2.60

# 搜索最多保留多少个完整候选，避免无意义地继续搜索。
MAX_COMPLETE_CANDIDATES = 300

# 找到填充率达到此值且通过其余严格阈值后立即结束，不再为比较极小分差
# 枚举其余锚点。0.965仍明显高于最终最低填充率0.94。
EARLY_STOP_FILL_RATIO = 0.965

# 每个逐级放宽阶段最多扩展的搜索状态数。达到上限后自动进入下一阶段，
# 防止在“只允许等长边”等无解条件上浪费几十秒。
MAX_SEARCH_STATES_PER_PHASE = 200000

# 每个状态最多继续尝试的候选放置数。候选已经按紧凑度和接触长度排序。
MAX_BRANCHES_PER_STATE = 5000

# 搜索中间状态的最小旋转包围矩形面积上限（相对全部碎片总面积）。
MAX_PARTIAL_RECT_AREA_RATIO = 1.45

# 预览图边距。
OUTPUT_MARGIN = 45

# 拼好的矩形距离A4中线、外边缘和上下边缘的最小像素间距。
# 默认矫正图约3 px/mm，因此40 px约等于13 mm。
TARGET_HALF_MARGIN = 40

# ---------------------- 防重叠缝隙参数 -------------------------------
# 先按原算法求出无缝矩形，再把各碎片“目标中心之间的距离”等比放大。
# 这在几何上等价于：用放大后的虚拟碎片拼图，再用原尺寸碎片执行放置。
# 旋转角不变、整体拼图中心不变，只会让各碎片的放置中心略微向外移动。
# 1.025 表示中心间距扩大 2.5%，通常会形成约 1~3 mm 的小缝隙。
PIECE_GAP_SCALE = 1.25

# 如果原始候选本身仍有少量像素级重叠，程序会自动逐步增大中心间距，
# 直到真实原尺寸碎片不再重叠，或达到此最大比例。
MAX_PIECE_GAP_SCALE = 1.300
PIECE_GAP_SCALE_STEP = 0.008

# 最终原尺寸碎片之间允许的数值误差面积。小于该值视为轮廓取整误差。
MAX_PHYSICAL_OVERLAP_PX2 = 0.50

# A4 横向尺寸。若相机标定后得到的有效纸面尺寸不同，可通过命令行覆盖。
DEFAULT_A4_WIDTH_MM = 297.0
DEFAULT_A4_HEIGHT_MM = 210.0

# 透视矫正后的标准横向 A4 分辨率，约 3 px/mm。
DEFAULT_RECTIFIED_WIDTH = 900
DEFAULT_RECTIFIED_HEIGHT = 636

# 黑色工作区轮廓面积至少占原始画面的比例。
MIN_BOARD_AREA_RATIO = 0.10

# ---------------------- 树莓派串口协议参数 -----------------------------
# 串口只是结果输出通道；打不开或运行中断开时，视觉程序继续运行。
DEFAULT_SERIAL_PORT = "/dev/serial0"
SERIAL_BAUDRATE = 115200
SERIAL_REPLY_TIMEOUT = 0.05

# ---------------------- V3 快速拼图搜索参数 --------------------------
# 每一层保留的最佳局部拼法数量。当前3张测试图中4块拼图约0.5~0.6秒。
BEAM_SEARCH_WIDTH = 32

# 每个局部状态最多保留多少种下一步放置。
BEAM_OPTIONS_PER_STATE = 24

# 快速优先模式：减少无意义的近似候选比较，严格验证阈值保持不变。
BEAM_FALLBACK_WIDTH = 64
BEAM_FALLBACK_OPTIONS = 40
MAX_STRICT_BEAM_WIDTH = 96
MAX_STRICT_BEAM_OPTIONS = 56
FAST_STRICT_MAX_ANCHORS = 2
MEDIUM_MAX_ANCHORS = 2

# 每对碎片优先枚举的边对齐数量。候选先按公共边长度降序、误差升序排列；
# 快速阶段无解后逐步扩大，最大兜底仍开放全部组合。
FAST_ALIGNMENTS_PER_PIECE_PAIR = 18
MEDIUM_ALIGNMENTS_PER_PIECE_PAIR = 36

# 用于候选多样性分组：给实拍误差较大的边保留少量名额，避免长边筛选
# 完全排除“一条长边由多条短边覆盖”的正确情况。
SECOND_EDGE_LENGTH_TOLERANCE = 0.35

# 搜索循环每扩展这些候选检查一次时间，避免单个束状态长时间不响应。
DEADLINE_CHECK_INTERVAL = 32

# 两条候选边中，短边至少应达到长边的该比例。
# 允许一条长边由多条短边依次覆盖。
MIN_EDGE_PAIR_RATIO = 0.17

# 完整拼法允许的总重叠比例。
MAX_FINAL_OVERLAP_RATIO = 0.015

# 碎片之间估计公共边覆盖率的最低值。
MIN_CONTACT_COVERAGE = 0.62

# 栅格评估倍数。2倍在精度和速度之间较均衡。
EVALUATION_SUPERSAMPLE = 2

# UI预览只影响显示流畅度，不参与识别。20 FPS可明显减少树莓派CPU和内存抖动。
UI_REFRESH_INTERVAL_MS = 50
UI_CAMERA_MAX_FPS = 20.0

# 搜索过程中定期只保留当前全局最优状态。该操作与最后统一排序取前K名等价，
# 不改变阈值、评分或候选选择，只避免中间列表瞬间占用大量内存。
GENERATED_STATE_PRUNE_MULTIPLIER = 3


def release_unused_memory() -> None:
    """任务结束后主动回收循环引用，并在Linux/glibc上归还空闲堆内存。"""
    gc.collect()
    if not sys.platform.startswith("linux"):
        return
    try:
        import ctypes

        libc = ctypes.CDLL("libc.so.6")
        trim = getattr(libc, "malloc_trim", None)
        if trim is not None:
            trim(0)
    except Exception:
        pass


PointArray = np.ndarray


@dataclass
class Piece:
    index: int
    contour: PointArray
    polygon: PointArray
    area: float
    center: PointArray


@dataclass
class Transform:
    rotation: PointArray
    translation: PointArray
    angle_deg: float

    def apply(self, points: PointArray) -> PointArray:
        points = np.asarray(points, dtype=np.float64)
        return points @ self.rotation.T + self.translation


@dataclass
class Candidate:
    transforms: Dict[int, Transform]
    score: float
    fill_ratio: float
    aspect_ratio: float
    rectangle: PointArray
    flipped_piece_ids: Tuple[int, ...] = ()


@dataclass
class BeamState:
    """束搜索状态；缓存已变换轮廓，避免每个候选重复计算。"""

    transforms: Dict[int, Transform]
    polygons: Dict[int, PointArray]
    edges_by_id: Dict[int, Tuple[EdgeDescriptor, ...]]
    bounds_by_id: Dict[int, Tuple[float, float, float, float]]
    score: float
    contact_length: float
    overlap_area: float
    placed_area: float


@dataclass
class BeamSearchContext:
    """同一组碎片在不同锚点搜索间复用的不变量。"""

    piece_by_id: Dict[int, Piece]
    ordered_ids: Tuple[int, ...]
    total_area: float
    perimeters_by_id: Dict[int, float]
    # 每项为(相对变换, 对齐接触长度, 两边相对长度误差)。
    relative_alignments: Dict[
        Tuple[int, int],
        Tuple[Tuple[Transform, float, float], ...],
    ]
    complete_metric_cache: Dict[Tuple, Optional[Tuple[float, float, float]]]


def rotation_matrix(angle_rad: float) -> PointArray:
    c, s = math.cos(angle_rad), math.sin(angle_rad)
    return np.array([[c, -s], [s, c]], dtype=np.float64)


def polygon_signed_area(poly: PointArray) -> float:
    x = poly[:, 0]
    y = poly[:, 1]
    return 0.5 * float(np.sum(x * np.roll(y, -1) - y * np.roll(x, -1)))


def ensure_counter_clockwise(poly: PointArray) -> PointArray:
    # 图像坐标 y 向下，因此数学意义的逆时针对应负的鞋带面积。
    if polygon_signed_area(poly) > 0:
        return poly[::-1].copy()
    return poly.copy()


def remove_nearly_collinear(
    poly: PointArray, angle_tolerance_deg: float = 4.0
) -> PointArray:
    """删除轮廓逼近后仍残留的近共线小折点。"""
    pts = [np.asarray(p, dtype=np.float64) for p in poly]
    changed = True
    while changed and len(pts) > 3:
        changed = False
        kept: List[PointArray] = []
        n = len(pts)
        for i in range(n):
            prev_pt, pt, next_pt = pts[(i - 1) % n], pts[i], pts[(i + 1) % n]
            v1 = pt - prev_pt
            v2 = next_pt - pt
            len1, len2 = np.linalg.norm(v1), np.linalg.norm(v2)
            if len1 < 2.0 or len2 < 2.0:
                changed = True
                continue
            cos_value = float(np.dot(v1, v2) / (len1 * len2))
            cos_value = float(np.clip(cos_value, -1.0, 1.0))
            turn_deg = math.degrees(math.acos(cos_value))
            if turn_deg < angle_tolerance_deg:
                changed = True
                continue
            kept.append(pt)
        if len(kept) < 3:
            break
        pts = kept
    return np.asarray(pts, dtype=np.float64)


def _remove_insignificant_piece_corners(poly: PointArray) -> PointArray:
    """
    删除阈值锯齿形成的短小假角点，但保留真实的三角形/四边形/五边形角。

    对每个角同时考察转角、相邻短边长度和移除该点造成的三角形面积损失。
    只有轮廓影响很小的角才会被合并；如果初始逼近仍超过题目规定的5个顶点，
    则优先合并影响最小的角，避免把6边噪声轮廓送入后续拼图搜索。
    """
    points = [np.asarray(point, dtype=np.float64) for point in poly]
    while len(points) > 3:
        array = np.asarray(points, dtype=np.float64)
        polygon_area = max(abs(polygon_signed_area(array)), 1.0)
        perimeter = max(
            float(np.sum(np.linalg.norm(np.roll(array, -1, axis=0) - array, axis=1))),
            1.0,
        )
        candidates = []
        for index in range(len(points)):
            previous = array[(index - 1) % len(array)]
            current = array[index]
            following = array[(index + 1) % len(array)]
            incoming = current - previous
            outgoing = following - current
            incoming_length = float(np.linalg.norm(incoming))
            outgoing_length = float(np.linalg.norm(outgoing))
            if incoming_length < 1e-9 or outgoing_length < 1e-9:
                candidates.append((0.0, index, True))
                continue

            cosine = float(
                np.clip(
                    np.dot(incoming, outgoing)
                    / (incoming_length * outgoing_length),
                    -1.0,
                    1.0,
                )
            )
            turn_deg = math.degrees(math.acos(cosine))
            first = current - previous
            second = following - previous
            cross_value = float(first[0] * second[1] - first[1] * second[0])
            triangle_loss_ratio = 0.5 * abs(cross_value) / polygon_area
            short_edge_ratio = min(incoming_length, outgoing_length) / perimeter

            # 近共线折点直接删除；短边造成的微小倒角只有在面积影响也很小
            # 时才删除，避免吞掉五边形真正的尖角。
            clearly_insignificant = turn_deg < 9.0 or (
                short_edge_ratio < 0.055
                and triangle_loss_ratio < 0.010
                and turn_deg < 32.0
            )
            significance = triangle_loss_ratio + 0.20 * short_edge_ratio
            candidates.append((significance, index, clearly_insignificant))

        removable = [item for item in candidates if item[2]]
        if removable:
            _, remove_index, _ = min(removable)
            del points[remove_index]
            continue

        if len(points) > 5:
            significance, remove_index, _ = min(candidates)
            previous = array[(remove_index - 1) % len(array)]
            current = array[remove_index]
            following = array[(remove_index + 1) % len(array)]
            first = current - previous
            second = following - previous
            cross_value = float(first[0] * second[1] - first[1] * second[0])
            triangle_loss_ratio = 0.5 * abs(cross_value) / polygon_area
            # 超过5个顶点时只合并轮廓贡献很小的角；否则交给更大epsilon
            # 的候选处理，不能强行破坏真实形状。
            if triangle_loss_ratio <= 0.035 and significance <= 0.065:
                del points[remove_index]
                continue
        break

    return np.asarray(points, dtype=np.float64)


def intrinsic_piece_signature(
    polygon: PointArray,
    area: float,
) -> Tuple:
    """生成与平移、旋转及轮廓起始顶点无关的稳定形状排序键。"""
    points = np.asarray(polygon, dtype=np.float64).reshape(-1, 2)
    count = len(points)
    vectors = np.roll(points, -1, axis=0) - points
    lengths = np.linalg.norm(vectors, axis=1)
    perimeter = max(float(np.sum(lengths)), 1.0)

    sequence = []
    for index in range(count):
        previous_vector = points[(index - 1) % count] - points[index]
        next_vector = points[(index + 1) % count] - points[index]
        denominator = max(
            float(np.linalg.norm(previous_vector) * np.linalg.norm(next_vector)),
            1e-9,
        )
        cosine = float(
            np.clip(
                np.dot(previous_vector, next_vector) / denominator,
                -1.0,
                1.0,
            )
        )
        interior_angle = math.degrees(math.acos(cosine))
        sequence.append(
            (
                int(round(100.0 * lengths[index] / perimeter)),
                int(round(interior_angle / 3.0)),
            )
        )

    # approxPolyDP的起始顶点会随碎片位置变化；取循环序列的最小旋转。
    cyclic_variants = [
        tuple(sequence[offset:] + sequence[:offset])
        for offset in range(count)
    ]
    canonical_sequence = min(cyclic_variants)
    return (
        count,
        int(round(float(area) / 200.0)),
        int(round(perimeter / 5.0)),
        canonical_sequence,
    )


def extract_pieces(image: PointArray) -> Tuple[List[Piece], PointArray]:
    """
    从已经清理好的黑底白碎片图中提取多边形。

    使用凸包、多尺度轮廓逼近和连续评分，避免曝光变化与锯齿边缘产生假
    顶点。旧版在面积误差13%附近会突然切换顶点数；新版要求新增顶点必须
    带来足够的轮廓拟合改善，因此同一碎片在相邻帧中更稳定。
    """
    if image is None or image.size == 0:
        raise ValueError("输入图片为空")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    min_area = image.shape[0] * image.shape[1] * MIN_PIECE_AREA_RATIO
    contours = [c for c in contours if cv2.contourArea(c) >= min_area]
    # 这里只保持检测遍历确定性；最终编号不再依赖左右位置。
    contours.sort(key=lambda c: cv2.boundingRect(c)[0])

    pieces: List[Piece] = []
    approximation_ratios = (
        0.006,
        0.008,
        0.010,
        0.012,
        0.015,
        0.018,
        0.022,
        0.028,
        0.035,
        0.045,
        0.060,
    )

    for index, contour in enumerate(contours):
        contour_area = float(cv2.contourArea(contour))
        hull = cv2.convexHull(contour)
        hull_area = max(float(cv2.contourArea(hull)), 1.0)
        perimeter = cv2.arcLength(hull, True)
        options = []

        for ratio in approximation_ratios:
            approx = cv2.approxPolyDP(hull, ratio * perimeter, True)
            poly = approx.reshape(-1, 2).astype(np.float64)
            poly = remove_nearly_collinear(poly, 8.0)
            poly = _remove_insignificant_piece_corners(poly)
            if not 3 <= len(poly) <= 5:
                continue
            polygon_area = abs(polygon_signed_area(poly))
            # 逼近对象是凸包，所以以凸包面积衡量拟合误差。旧版拿原始轮廓
            # 面积比较，边缘阴影造成的小凹口会放大误差并错误减少真实角点。
            area_error = abs(polygon_area - hull_area) / hull_area
            complexity = max(0, len(poly) - 3)
            fit_score = (
                area_error
                + POLYGON_VERTEX_COMPLEXITY_PENALTY * complexity
                + 0.02 * ratio
            )
            options.append((fit_score, area_error, len(poly), ratio, poly))

        reliable = [option for option in options if option[1] <= MAX_POLYGON_AREA_ERROR]
        if reliable:
            selected = min(
                reliable,
                key=lambda option: (option[0], option[1], option[2], option[3]),
            )
        elif options:
            selected = min(
                options,
                key=lambda option: (option[1], option[0], option[2], option[3]),
            )
        else:
            raise ValueError(f"第 {index + 1} 块无法稳定提取多边形")

        poly = ensure_counter_clockwise(selected[4])
        # 使用修复边缘阴影后的凸包中心，抓取中心不会随局部黑边缺口抖动。
        moments = cv2.moments(hull)
        if abs(moments["m00"]) < 1e-9:
            center = np.mean(poly, axis=0)
        else:
            center = np.array(
                [
                    moments["m10"] / moments["m00"],
                    moments["m01"] / moments["m00"],
                ],
                dtype=np.float64,
            )
        pieces.append(
            Piece(
                index=index,
                contour=contour,
                polygon=poly,
                area=contour_area,
                center=center,
            )
        )

    if not 2 <= len(pieces) <= 4:
        raise ValueError(f"识别到 {len(pieces)} 块碎片，题目应为 2~4 块")

    # 按碎片自身几何特征编号。碎片互换左右位置后，只要轮廓相同，P编号和
    # 后续候选生成顺序仍保持一致；完全相同的碎片才使用中心位置打破平局。
    pieces.sort(
        key=lambda piece: (
            intrinsic_piece_signature(piece.polygon, piece.area),
            int(round(float(piece.center[0]) / 10.0)),
            int(round(float(piece.center[1]) / 10.0)),
        )
    )
    for stable_index, piece in enumerate(pieces):
        piece.index = stable_index
    return pieces, mask


def edges(poly: PointArray) -> Iterable[Tuple[int, PointArray, PointArray, float]]:
    for i in range(len(poly)):
        a = poly[i]
        b = poly[(i + 1) % len(poly)]
        yield i, a, b, float(np.linalg.norm(b - a))


def edge_alignment_transform(
    source_a: PointArray,
    source_b: PointArray,
    target_a: PointArray,
    target_b: PointArray,
    align_mode: str = "midpoint",
) -> Transform:
    """
    将 source_a->source_b 旋转到 target_b->target_a。
    两条共享边在两个逆时针多边形上的行进方向应当相反。
    """
    source_vec = source_b - source_a
    target_vec = target_a - target_b
    source_angle = math.atan2(source_vec[1], source_vec[0])
    target_angle = math.atan2(target_vec[1], target_vec[0])
    angle = target_angle - source_angle
    rot = rotation_matrix(angle)

    if align_mode == "source_a_to_target_b":
        # 共享边长度不同时，让其中一端重合，可处理“一条长边由两块短边组成”。
        translation = target_b - rot @ source_a
    elif align_mode == "source_b_to_target_a":
        translation = target_a - rot @ source_b
    else:
        # 长度接近时用中点对齐，更能抵抗一两个像素的轮廓误差。
        source_mid = (source_a + source_b) * 0.5
        target_mid = (target_a + target_b) * 0.5
        translation = target_mid - rot @ source_mid
    angle_deg = math.degrees(math.atan2(rot[1, 0], rot[0, 0]))
    angle_deg = (angle_deg + 180.0) % 360.0 - 180.0
    return Transform(rot, translation, angle_deg)


def compose_transform(parent: Transform, relative: Transform) -> Transform:
    """返回 parent(relative(points))，避免重复计算同一对原始边的atan2。"""
    p = parent.rotation
    r = relative.rotation
    rotation = np.array(
        [
            [
                p[0, 0] * r[0, 0] + p[0, 1] * r[1, 0],
                p[0, 0] * r[0, 1] + p[0, 1] * r[1, 1],
            ],
            [
                p[1, 0] * r[0, 0] + p[1, 1] * r[1, 0],
                p[1, 0] * r[0, 1] + p[1, 1] * r[1, 1],
            ],
        ],
        dtype=np.float64,
    )
    relative_x = float(relative.translation[0])
    relative_y = float(relative.translation[1])
    translation = np.array(
        [
            p[0, 0] * relative_x + p[0, 1] * relative_y + parent.translation[0],
            p[1, 0] * relative_x + p[1, 1] * relative_y + parent.translation[1],
        ],
        dtype=np.float64,
    )
    angle_deg = (parent.angle_deg + relative.angle_deg + 180.0) % 360.0 - 180.0
    return Transform(rotation, translation, angle_deg)


def polygon_bounds(poly: PointArray) -> Tuple[float, float, float, float]:
    """返回多边形的(min_x, min_y, max_x, max_y)。"""
    min_x = max_x = float(poly[0, 0])
    min_y = max_y = float(poly[0, 1])
    for point_index in range(1, len(poly)):
        x_value = float(poly[point_index, 0])
        y_value = float(poly[point_index, 1])
        if x_value < min_x:
            min_x = x_value
        elif x_value > max_x:
            max_x = x_value
        if y_value < min_y:
            min_y = y_value
        elif y_value > max_y:
            max_y = y_value
    return min_x, min_y, max_x, max_y


def bounds_are_separated(
    first: Tuple[float, float, float, float],
    second: Tuple[float, float, float, float],
    margin: float = 0.0,
) -> bool:
    """包围盒间距超过margin时，两多边形不可能重叠或形成公共边。"""
    return (
        first[2] + margin < second[0]
        or second[2] + margin < first[0]
        or first[3] + margin < second[1]
        or second[3] + margin < first[1]
    )


def build_beam_search_context(
    pieces: Sequence[Piece],
    max_edge_relative_error: Optional[float] = None,
    max_alignments_per_piece_pair: Optional[int] = None,
) -> BeamSearchContext:
    """
    预计算碎片两两边匹配的相对变换。

    边长、边方向以及可用对齐模式不会随锚点和局部布局变化。这里一次计算
    后按“可形成的公共边长度降序、边长误差升序”排列。快速阶段可只保留
    每对碎片最靠前的一批，完整兜底阶段仍保留全部候选。
    """
    ordered_pieces = sorted(
        pieces,
        key=lambda piece: (
            intrinsic_piece_signature(piece.polygon, piece.area),
            piece.index,
        ),
    )
    ordered_ids = tuple(piece.index for piece in ordered_pieces)
    piece_by_id = {piece.index: piece for piece in ordered_pieces}
    source_edges_by_id = {
        piece.index: tuple(edges(piece.polygon)) for piece in ordered_pieces
    }
    perimeters_by_id = {
        piece_id: sum(edge[3] for edge in piece_edges)
        for piece_id, piece_edges in source_edges_by_id.items()
    }
    relative_alignments: Dict[
        Tuple[int, int],
        Tuple[Tuple[Transform, float, float], ...],
    ] = {}

    for new_id in ordered_ids:
        source_edges = source_edges_by_id[new_id]
        for placed_id in ordered_ids:
            if placed_id == new_id:
                continue
            templates: List[Tuple[Transform, float, float]] = []
            seen_templates = set()
            target_edges = source_edges_by_id[placed_id]
            for _, ta, tb, target_length in target_edges:
                for _, sa, sb, source_length in source_edges:
                    length_ratio = min(source_length, target_length) / max(
                        source_length, target_length, 1.0
                    )
                    if length_ratio < MIN_EDGE_PAIR_RATIO:
                        continue

                    relative_error = abs(source_length - target_length) / max(
                        source_length, target_length, 1.0
                    )
                    if (
                        max_edge_relative_error is not None
                        and relative_error > max_edge_relative_error
                    ):
                        continue
                    modes = (
                        (
                            "source_a_to_target_b",
                            "source_b_to_target_a",
                            "midpoint",
                        )
                        if relative_error <= 0.23
                        else (
                            "source_a_to_target_b",
                            "source_b_to_target_a",
                        )
                    )
                    for mode in modes:
                        relative_transform = edge_alignment_transform(
                            sa, sb, ta, tb, mode
                        )
                        # 后续内层循环本来也会以更粗的0.5度/2像素精度去重。
                        # 在不改变有效放置集合的前提下，先消除等长边端点/
                        # 中点模式产生的同一刚体变换，避免每个束状态重复复合。
                        template_key = transform_key(new_id, relative_transform)
                        if template_key in seen_templates:
                            continue
                        seen_templates.add(template_key)
                        templates.append(
                            (
                                relative_transform,
                                min(source_length, target_length),
                                relative_error,
                            )
                        )
            templates.sort(
                key=lambda item: (
                    -item[1],
                    item[2],
                    abs(item[0].angle_deg),
                    float(item[0].translation[0]),
                    float(item[0].translation[1]),
                )
            )
            if (
                max_alignments_per_piece_pair is not None
                and len(templates) > max_alignments_per_piece_pair
            ):
                limit = max(1, int(max_alignments_per_piece_pair))
                selected_templates: List[Tuple[Transform, float, float]] = []
                selected_keys = set()
                # 每种边长误差等级至少保留少量候选，防止最长边优先把
                # “长边由短边覆盖”的正确起步完全挤掉。
                for bucket in range(3):
                    bucket_items = [
                        item
                        for item in templates
                        if (
                            0
                            if item[2] <= EDGE_LENGTH_TOLERANCE
                            else 1
                            if item[2] <= SECOND_EDGE_LENGTH_TOLERANCE
                            else 2
                        )
                        == bucket
                    ]
                    for item in bucket_items[:2]:
                        key = transform_key(new_id, item[0])
                        if key not in selected_keys:
                            selected_keys.add(key)
                            selected_templates.append(item)
                for item in templates:
                    if len(selected_templates) >= limit:
                        break
                    key = transform_key(new_id, item[0])
                    if key in selected_keys:
                        continue
                    selected_keys.add(key)
                    selected_templates.append(item)
                templates = sorted(
                    selected_templates[:limit],
                    key=lambda item: (-item[1], item[2]),
                )
            relative_alignments[(new_id, placed_id)] = tuple(templates)

    return BeamSearchContext(
        piece_by_id=piece_by_id,
        ordered_ids=ordered_ids,
        total_area=sum(piece.area for piece in pieces),
        perimeters_by_id=perimeters_by_id,
        relative_alignments=relative_alignments,
        complete_metric_cache={},
    )


def _rank_anchors_by_edge_connectivity(
    pieces: Sequence[Piece],
    context: BeamSearchContext,
) -> List[Piece]:
    """优先选择能与更多碎片形成高质量边接触的中心型锚点。"""
    perimeters = {
        piece.index: max(
            sum(length for _, _, _, length in edges(piece.polygon)),
            1.0,
        )
        for piece in pieces
    }
    intrinsic_position = {
        piece_id: position
        for position, piece_id in enumerate(context.ordered_ids)
    }
    ranked = []
    for anchor in pieces:
        connectivity = 0.0
        tight_connections = 0
        for other in pieces:
            if other.index == anchor.index:
                continue
            best_quality = 0.0
            best_error = 1.0
            perimeter_scale = max(
                min(perimeters[anchor.index], perimeters[other.index]),
                1.0,
            )
            for _transform, contact, relative_error in context.relative_alignments[
                (other.index, anchor.index)
            ]:
                quality = (
                    contact / perimeter_scale
                ) * max(0.05, 1.0 - relative_error)
                if quality > best_quality:
                    best_quality = quality
                    best_error = relative_error
            connectivity += best_quality
            if best_error <= SECOND_EDGE_LENGTH_TOLERANCE:
                tight_connections += 1
        ranked.append(
            (
                tight_connections,
                connectivity,
                intrinsic_position[anchor.index],
                anchor,
            )
        )

    ranked.sort(key=lambda item: (-item[0], -item[1], item[2]))
    result = [item[3] for item in ranked]
    trace_log(
        "拼图搜索",
        "锚点优先级=" + "→".join(f"P{piece.index + 1}" for piece in result),
    )
    return result


def convex_intersection_area(poly_a: PointArray, poly_b: PointArray) -> float:
    a = np.asarray(poly_a, dtype=np.float32)
    b = np.asarray(poly_b, dtype=np.float32)
    try:
        area, _ = cv2.intersectConvexConvex(a, b)
        return max(0.0, float(area))
    except cv2.error:
        # 本题碎片通常为凸多边形。若实拍轮廓轻微非凸，退化为局部掩膜计算。
        all_pts = np.vstack([a, b])
        x, y, w, h = cv2.boundingRect(all_pts.astype(np.int32))
        if w <= 0 or h <= 0:
            return 0.0
        ma = np.zeros((h + 4, w + 4), np.uint8)
        mb = np.zeros_like(ma)
        offset = np.array([x - 2, y - 2], dtype=np.float32)
        cv2.fillPoly(ma, [np.round(a - offset).astype(np.int32)], 255)
        cv2.fillPoly(mb, [np.round(b - offset).astype(np.int32)], 255)
        return float(np.count_nonzero(cv2.bitwise_and(ma, mb)))


def placement_is_valid(
    new_poly: PointArray,
    new_area: float,
    placed_polys: Sequence[Tuple[PointArray, float]],
    total_area: float,
) -> bool:
    for old_poly, old_area in placed_polys:
        overlap = convex_intersection_area(new_poly, old_poly)
        allowed = max(8.0, min(new_area, old_area) * MAX_OVERLAP_RATIO)
        if overlap > allowed:
            return False

    all_pts = np.vstack([new_poly] + [p for p, _ in placed_polys])
    # 正确的局部拼图最终一定能被目标矩形包住，所以当前所有碎片的
    # 最小旋转包围矩形不应明显大于全部碎片总面积。这个下界剪枝比
    # 原来的轴对齐范围判断紧得多，可及早淘汰“边碰上了但布局很松散”的组合。
    rect = cv2.minAreaRect(np.asarray(all_pts, dtype=np.float32))
    rect_area = float(rect[1][0] * rect[1][1])
    if rect_area > total_area * MAX_PARTIAL_RECT_AREA_RATIO:
        return False
    # 新碎片本来就是通过一对候选边贴到已放置碎片上，因此无需再次用某个
    # 顶点判断“是否接触”；那个顶点通常并不在共享边上，会误删正确拼法。
    return True


def collinear_overlap_length(
    a: PointArray,
    b: PointArray,
    c: PointArray,
    d: PointArray,
    line_tolerance: float = 3.0,
    angle_tolerance_deg: float = 2.5,
) -> float:
    """返回两条近共线线段的投影重叠长度（标量快速实现）。"""
    ax, ay = float(a[0]), float(a[1])
    bx, by = float(b[0]), float(b[1])
    cx, cy = float(c[0]), float(c[1])
    dx, dy = float(d[0]), float(d[1])

    ux, uy = bx - ax, by - ay
    vx, vy = dx - cx, dy - cy
    len_u = math.hypot(ux, uy)
    len_v = math.hypot(vx, vy)
    if len_u < 1e-6 or len_v < 1e-6:
        return 0.0

    cross_uv = abs(ux * vy - uy * vx)
    if cross_uv > math.sin(math.radians(angle_tolerance_deg)) * len_u * len_v:
        return 0.0

    inv_len_u = 1.0 / len_u
    unit_x, unit_y = ux * inv_len_u, uy * inv_len_u
    normal_x, normal_y = -unit_y, unit_x
    cax, cay = cx - ax, cy - ay
    dax, day = dx - ax, dy - ay
    if (
        max(
            abs(cax * normal_x + cay * normal_y),
            abs(dax * normal_x + day * normal_y),
        )
        > line_tolerance
    ):
        return 0.0

    c_projection = cax * unit_x + cay * unit_y
    d_projection = dax * unit_x + day * unit_y
    left = max(0.0, min(c_projection, d_projection))
    right = min(len_u, max(c_projection, d_projection))
    return max(0.0, right - left)


# ax, ay, bx, by, ux, uy, length, unit_x, unit_y, normal_x, normal_y
EdgeDescriptor = Tuple[
    float,
    float,
    float,
    float,
    float,
    float,
    float,
    float,
    float,
    float,
    float,
]


def edge_descriptors(poly: PointArray) -> Tuple[EdgeDescriptor, ...]:
    """为公共边检测预计算每条边的方向、长度、单位向量和法向量。"""
    descriptors: List[EdgeDescriptor] = []
    count = len(poly)
    for index in range(count):
        ax = float(poly[index, 0])
        ay = float(poly[index, 1])
        next_index = (index + 1) % count
        bx = float(poly[next_index, 0])
        by = float(poly[next_index, 1])
        ux = bx - ax
        uy = by - ay
        length = math.hypot(ux, uy)
        if length < 1e-6:
            unit_x = unit_y = normal_x = normal_y = 0.0
        else:
            inv_length = 1.0 / length
            unit_x = ux * inv_length
            unit_y = uy * inv_length
            normal_x = -unit_y
            normal_y = unit_x
        descriptors.append(
            (
                ax,
                ay,
                bx,
                by,
                ux,
                uy,
                length,
                unit_x,
                unit_y,
                normal_x,
                normal_y,
            )
        )
    return tuple(descriptors)


def descriptor_overlap_length(
    first: EdgeDescriptor,
    second: EdgeDescriptor,
    line_tolerance: float = 4.5,
    angle_tolerance_sine: float = math.sin(math.radians(5.0)),
) -> float:
    """collinear_overlap_length的预计算版本，数值公式保持一致。"""
    (
        ax,
        ay,
        _bx,
        _by,
        ux,
        uy,
        len_u,
        unit_x,
        unit_y,
        normal_x,
        normal_y,
    ) = first
    cx, cy, dx, dy, vx, vy, len_v, _, _, _, _ = second
    if len_u < 1e-6 or len_v < 1e-6:
        return 0.0
    cross_uv = abs(ux * vy - uy * vx)
    if cross_uv > angle_tolerance_sine * len_u * len_v:
        return 0.0

    cax = cx - ax
    cay = cy - ay
    dax = dx - ax
    day = dy - ay
    if (
        max(
            abs(cax * normal_x + cay * normal_y),
            abs(dax * normal_x + day * normal_y),
        )
        > line_tolerance
    ):
        return 0.0

    c_projection = cax * unit_x + cay * unit_y
    d_projection = dax * unit_x + day * unit_y
    left = max(0.0, min(c_projection, d_projection))
    right = min(len_u, max(c_projection, d_projection))
    return max(0.0, right - left)


def total_contact_length(
    new_poly: PointArray,
    placed_polys: Sequence[Tuple[PointArray, float]],
) -> float:
    """计算新碎片与当前拼图已有边界的总接触长度。"""
    total = 0.0
    for old_poly, _ in placed_polys:
        for _, a, b, _ in edges(new_poly):
            for _, c, d, _ in edges(old_poly):
                total += collinear_overlap_length(a, b, c, d)
    return total


def partial_layout_compactness(
    new_poly: PointArray,
    new_area: float,
    placed_polys: Sequence[Tuple[PointArray, float]],
) -> float:
    """已放置碎片面积与最小包围矩形面积之比，越大通常越接近正确拼法。"""
    all_pts = np.vstack([new_poly] + [poly for poly, _ in placed_polys])
    rect = cv2.minAreaRect(np.asarray(all_pts, dtype=np.float32))
    width, height = rect[1]
    rect_area = max(float(width * height), 1.0)
    piece_area = new_area + sum(area for _, area in placed_polys)
    return min(1.0, piece_area / rect_area)


def raster_union(polygons: Sequence[PointArray]) -> Tuple[PointArray, PointArray]:
    all_pts = np.vstack(polygons)
    minimum = np.floor(np.min(all_pts, axis=0) - 5).astype(int)
    maximum = np.ceil(np.max(all_pts, axis=0) + 5).astype(int)
    size = np.maximum(maximum - minimum + 1, 8)
    mask = np.zeros((int(size[1]), int(size[0])), np.uint8)
    shifted_polys = []
    for poly in polygons:
        shifted = poly - minimum
        shifted_polys.append(shifted)
        cv2.fillPoly(mask, [np.round(shifted).astype(np.int32)], 255)
    return mask, minimum.astype(np.float64)


def _layout_contact_length(polygons_by_id: Dict[int, PointArray]) -> float:
    """计算当前布局中各碎片近共线边的总接触长度。"""
    piece_ids = list(polygons_by_id)
    descriptors_by_id = {
        piece_id: edge_descriptors(polygons_by_id[piece_id]) for piece_id in piece_ids
    }
    total = 0.0
    for position, first_id in enumerate(piece_ids):
        first_edges = descriptors_by_id[first_id]
        for second_id in piece_ids[position + 1 :]:
            second_edges = descriptors_by_id[second_id]
            for first_edge in first_edges:
                for second_edge in second_edges:
                    total += descriptor_overlap_length(first_edge, second_edge)
    return total


def _rasterized_rectangle_metrics(
    polygons: Sequence[PointArray],
    rectangle: PointArray,
    supersample: int = EVALUATION_SUPERSAMPLE,
) -> Tuple[float, float, float, float, float]:
    """
    栅格化计算联合面积、矩形面积、重叠、矩形缺口和矩形外面积。

    与单纯使用 minAreaRect 面积相比，这能明确区分：
    1. 真正填满矩形的拼法；
    2. 仅仅被一个矩形包住、内部仍有大缺口的错误拼法；
    3. 依靠碎片互相覆盖得到高填充率的伪解。
    """
    all_points = np.vstack(list(polygons) + [rectangle])
    minimum = np.floor(np.min(all_points, axis=0) - 4).astype(int)
    maximum = np.ceil(np.max(all_points, axis=0) + 4).astype(int)
    size = np.maximum((maximum - minimum + 1) * supersample, 8).astype(int)

    accumulator = np.zeros((int(size[1]), int(size[0])), np.uint8)
    piece_mask = np.zeros_like(accumulator)
    for polygon in polygons:
        piece_mask.fill(0)
        points = np.round((polygon - minimum) * supersample).astype(np.int32)
        cv2.fillPoly(piece_mask, [points], 1)
        # 最多4块碎片，uint8不会溢出；原地累加避免每块创建两张临时图。
        accumulator += piece_mask

    union = accumulator > 0
    rectangle_mask = np.zeros_like(accumulator)
    rectangle_points = np.round((rectangle - minimum) * supersample).astype(np.int32)
    cv2.fillConvexPoly(rectangle_mask, rectangle_points, 1)
    inside_rectangle = rectangle_mask > 0

    divisor = float(supersample * supersample)
    union_area = float(np.count_nonzero(union)) / divisor
    rectangle_area = float(np.count_nonzero(inside_rectangle)) / divisor
    overlap_area = (
        float(np.maximum(accumulator.astype(np.int16) - 1, 0).sum()) / divisor
    )
    missing_area = float(np.count_nonzero(inside_rectangle & ~union)) / divisor
    outside_area = float(np.count_nonzero(union & ~inside_rectangle)) / divisor
    return union_area, rectangle_area, overlap_area, missing_area, outside_area


def complete_layout_cache_key(
    transforms: Dict[int, Transform],
) -> Tuple[Tuple[int, float, float, float], ...]:
    """按最低编号碎片建立局部坐标，消除完整布局的整体旋转和平移。"""
    piece_ids = sorted(transforms)
    base = transforms[piece_ids[0]]
    base_rotation = base.rotation
    result = []
    for piece_id in piece_ids:
        transform = transforms[piece_id]
        delta_x = float(transform.translation[0] - base.translation[0])
        delta_y = float(transform.translation[1] - base.translation[1])
        # base.rotation.T @ delta 的标量形式。
        relative_x = base_rotation[0, 0] * delta_x + base_rotation[1, 0] * delta_y
        relative_y = base_rotation[0, 1] * delta_x + base_rotation[1, 1] * delta_y
        relative_angle = (transform.angle_deg - base.angle_deg + 180.0) % 360.0 - 180.0
        result.append(
            (
                piece_id,
                round(float(relative_angle), 7),
                round(float(relative_x), 7),
                round(float(relative_y), 7),
            )
        )
    return tuple(result)


def evaluate_complete(
    pieces: Sequence[Piece],
    transforms: Dict[int, Transform],
    metric_cache: Optional[Dict[Tuple, Optional[Tuple[float, float, float]]]] = None,
) -> Optional[Candidate]:
    """严格评估完整布局，返回分数最低的近矩形候选。"""
    cache_key = None
    cached_metrics = None
    if metric_cache is not None:
        cache_key = complete_layout_cache_key(transforms)
        if cache_key in metric_cache:
            cached_metrics = metric_cache[cache_key]
            if cached_metrics is None:
                return None

    polygons_by_id = {
        piece.index: transforms[piece.index].apply(piece.polygon) for piece in pieces
    }
    polygons = [polygons_by_id[piece.index] for piece in pieces]
    all_points = np.vstack(polygons).astype(np.float32)
    rectangle_data = cv2.minAreaRect(all_points)
    width, height = rectangle_data[1]
    if width < 1.0 or height < 1.0:
        if metric_cache is not None and cache_key is not None:
            metric_cache[cache_key] = None
        return None

    rectangle = cv2.boxPoints(rectangle_data).astype(np.float64)
    if cached_metrics is not None:
        score, fill_ratio, aspect_ratio = cached_metrics
        return Candidate(
            transforms=dict(transforms),
            score=score,
            fill_ratio=fill_ratio,
            aspect_ratio=aspect_ratio,
            rectangle=rectangle,
        )

    aspect_ratio = max(width, height) / min(width, height)
    if not MIN_ASPECT_RATIO <= aspect_ratio <= MAX_ASPECT_RATIO:
        if metric_cache is not None and cache_key is not None:
            metric_cache[cache_key] = None
        return None

    # 联合面积不可能大于各多边形面积之和。先用连续几何面积淘汰明显填不满
    # 矩形的布局，可避免为大量错误完整布局分配并绘制2倍栅格掩膜。
    # 预留2个百分点给栅格边界取整，临界候选仍交给原严格评估处理。
    polygon_area_sum = sum(
        abs(polygon_signed_area(polygon)) for polygon in polygons
    )
    geometric_rectangle_area = max(float(width * height), 1.0)
    if (
        polygon_area_sum / geometric_rectangle_area
        < MIN_RECT_FILL_RATIO - 0.020
    ):
        if metric_cache is not None and cache_key is not None:
            metric_cache[cache_key] = None
        return None

    (
        union_area,
        rectangle_area,
        overlap_area,
        missing_area,
        outside_area,
    ) = _rasterized_rectangle_metrics(polygons, rectangle)

    source_area = max(sum(piece.area for piece in pieces), 1.0)
    fill_ratio = union_area / max(rectangle_area, 1.0)
    overlap_ratio = overlap_area / source_area
    missing_ratio = missing_area / source_area
    outside_ratio = outside_area / source_area

    if fill_ratio < MIN_RECT_FILL_RATIO:
        if metric_cache is not None and cache_key is not None:
            metric_cache[cache_key] = None
        return None
    if overlap_ratio > MAX_FINAL_OVERLAP_RATIO:
        if metric_cache is not None and cache_key is not None:
            metric_cache[cache_key] = None
        return None

    total_contact = _layout_contact_length(polygons_by_id)
    total_perimeter = sum(
        cv2.arcLength(polygon.astype(np.float32), True) for polygon in polygons
    )
    expected_internal_contact = max(
        (total_perimeter - 2.0 * (width + height)) * 0.5,
        1.0,
    )
    contact_coverage = total_contact / expected_internal_contact
    required_contact = MIN_CONTACT_COVERAGE if len(pieces) >= 3 else 0.48
    if contact_coverage < required_contact:
        if metric_cache is not None and cache_key is not None:
            metric_cache[cache_key] = None
        return None

    # 缺口是最重要的错误信号；重叠的惩罚更高，防止碎片互相覆盖。
    # 接触率仅作辅助，避免因实拍轮廓的少量边缘误差误删正确拼法。
    aspect_center = (MIN_ASPECT_RATIO + MAX_ASPECT_RATIO) * 0.5
    score = (
        missing_ratio
        + outside_ratio
        + 6.0 * overlap_ratio
        + 0.08 * abs(1.0 - min(contact_coverage, 1.35))
        + 0.002 * abs(aspect_ratio - aspect_center)
    )
    if metric_cache is not None and cache_key is not None:
        metric_cache[cache_key] = (
            float(score),
            float(fill_ratio),
            float(aspect_ratio),
        )
    return Candidate(
        transforms=dict(transforms),
        score=float(score),
        fill_ratio=float(fill_ratio),
        aspect_ratio=float(aspect_ratio),
        rectangle=rectangle,
    )


def transform_key(piece_index: int, transform: Transform) -> Tuple[int, int, int, int]:
    return (
        piece_index,
        int(round(transform.angle_deg * 2.0)),
        int(round(transform.translation[0] / 2.0)),
        int(round(transform.translation[1] / 2.0)),
    )


def _beam_state_key(
    transforms: Dict[int, Transform],
) -> Tuple[Tuple[int, int, int, int], ...]:
    """生成与整体平移无关的局部布局去重键。"""
    piece_ids = sorted(transforms)
    base_translation = transforms[piece_ids[0]].translation
    return tuple(
        (
            piece_id,
            int(round(transforms[piece_id].angle_deg * 5.0)),
            int(
                round((transforms[piece_id].translation[0] - base_translation[0]) * 2.0)
            ),
            int(
                round((transforms[piece_id].translation[1] - base_translation[1]) * 2.0)
            ),
        )
        for piece_id in piece_ids
    )


def _select_diverse_beam(
    states: Iterable[BeamState],
    beam_width: int,
) -> List[BeamState]:
    """保留全局低分状态，同时避免同一碎片子集占满整束。"""
    ordered = sorted(states, key=lambda item: item.score)
    if len(ordered) <= beam_width:
        return ordered

    groups: Dict[Tuple[int, ...], List[BeamState]] = {}
    for state in ordered:
        signature = tuple(sorted(state.transforms))
        groups.setdefault(signature, []).append(state)

    # 一半名额保证每种“已放碎片集合”都有代表，另一半仍按原全局评分。
    quota = max(1, beam_width // max(2 * len(groups), 1))
    selected: List[BeamState] = []
    selected_ids = set()
    for group in groups.values():
        for state in group[:quota]:
            selected.append(state)
            selected_ids.add(id(state))

    for state in ordered:
        if len(selected) >= beam_width:
            break
        if id(state) in selected_ids:
            continue
        selected.append(state)
        selected_ids.add(id(state))
    selected.sort(key=lambda item: item.score)
    return selected[:beam_width]


def _contact_with_layout(
    new_polygon: PointArray,
    placed_polygons: Iterable[PointArray],
) -> float:
    """只计算新碎片与已有布局新增的公共边长度。"""
    total = 0.0
    new_count = len(new_polygon)
    for old_polygon in placed_polygons:
        old_count = len(old_polygon)
        for i in range(new_count):
            a = new_polygon[i]
            b = new_polygon[(i + 1) % new_count]
            for j in range(old_count):
                c = old_polygon[j]
                d = old_polygon[(j + 1) % old_count]
                total += collinear_overlap_length(
                    a,
                    b,
                    c,
                    d,
                    line_tolerance=4.5,
                    angle_tolerance_deg=5.0,
                )
    return total


def _contact_with_precomputed_edges(
    new_edges: Sequence[EdgeDescriptor],
    new_bounds: Tuple[float, float, float, float],
    placed_edges_by_id: Dict[int, Sequence[EdgeDescriptor]],
    placed_bounds_by_id: Dict[int, Tuple[float, float, float, float]],
    excluded_piece_id: int,
) -> float:
    """与_contact_with_layout等价，但复用当前束状态的边和包围盒。"""
    total = 0.0
    for piece_id, old_edges in placed_edges_by_id.items():
        if piece_id == excluded_piece_id:
            continue
        if bounds_are_separated(
            new_bounds,
            placed_bounds_by_id[piece_id],
            margin=4.5,
        ):
            continue
        for new_edge in new_edges:
            for old_edge in old_edges:
                total += descriptor_overlap_length(new_edge, old_edge)
    return total


def _partial_layout_score_cached(
    polygons_by_id: Dict[int, PointArray],
    placed_area: float,
    total_area: float,
    overlap_area: float,
    contact_length: float,
) -> Tuple[float, float]:
    """使用缓存的面积、重叠和接触长度快速评价局部布局。"""
    all_points = np.vstack(tuple(polygons_by_id.values())).astype(np.float32)
    rectangle = cv2.minAreaRect(all_points)
    rectangle_area = max(float(rectangle[1][0] * rectangle[1][1]), 1.0)
    compactness = min(1.0, placed_area / rectangle_area)
    score = (
        (rectangle_area - placed_area) / max(total_area, 1.0)
        + 4.0 * overlap_area / max(total_area, 1.0)
        - 0.0015 * contact_length
        - 0.15 * compactness
    )
    return float(score), rectangle_area


def _partial_rectangle_geometry(
    polygons_by_id: Dict[int, PointArray],
    placed_area: float,
    total_area: float,
    overlap_area: float,
) -> Tuple[float, float]:
    """先计算不依赖公共边长度的局部矩形分数。"""
    all_points = np.vstack(tuple(polygons_by_id.values())).astype(np.float32)
    rectangle = cv2.minAreaRect(all_points)
    rectangle_area = max(float(rectangle[1][0] * rectangle[1][1]), 1.0)
    compactness = min(1.0, placed_area / rectangle_area)
    base_score = (
        (rectangle_area - placed_area) / max(total_area, 1.0)
        + 4.0 * overlap_area / max(total_area, 1.0)
        - 0.15 * compactness
    )
    return float(base_score), rectangle_area


def _solve_puzzle_beam(
    pieces: Sequence[Piece],
    beam_width: int,
    options_per_state: int,
    anchors: Sequence[Piece],
    context: Optional[BeamSearchContext] = None,
    deadline: Optional[float] = None,
    early_stop_fill_ratio: Optional[float] = None,
) -> List[Candidate]:
    """
    低内存束搜索。

    与原算法保持完全相同的候选生成、阈值和评分，仅将每个状态的全部候选
    列表改为固定容量堆，并定期保留全局前 beam_width 名。数学上等价于
    原来的“全部生成后排序取前K”，因此不会降低拼图准确率。
    """
    if context is None:
        context = build_beam_search_context(pieces)
    piece_by_id = context.piece_by_id
    ordered_ids = context.ordered_ids
    total_area = context.total_area
    perimeters_by_id = context.perimeters_by_id
    relative_alignments = context.relative_alignments
    completed: List[Candidate] = []

    for anchor in anchors:
        if deadline is not None and time.perf_counter() >= deadline:
            break
        identity = Transform(np.eye(2), np.zeros(2), 0.0)
        # 搜索阶段的OpenCV几何函数原生使用float32；最终严格评估仍由
        # 原始多边形和float64变换重新计算，因此这里只减少中间数组转换。
        anchor_polygon = anchor.polygon.astype(np.float32, copy=True)
        beam: List[BeamState] = [
            BeamState(
                transforms={anchor.index: identity},
                polygons={anchor.index: anchor_polygon},
                edges_by_id={anchor.index: edge_descriptors(anchor_polygon)},
                bounds_by_id={anchor.index: polygon_bounds(anchor_polygon)},
                score=0.0,
                contact_length=0.0,
                overlap_area=0.0,
                placed_area=anchor.area,
            )
        ]

        for _depth in range(1, len(pieces)):
            generated: Dict[Tuple[Tuple[int, int, int, int], ...], BeamState] = {}
            deadline_hit = False
            deadline_counter = 0
            prune_threshold = max(
                beam_width + 8,
                beam_width * GENERATED_STATE_PRUNE_MULTIPLIER,
            )

            for state in beam:
                if deadline is not None and time.perf_counter() >= deadline:
                    deadline_hit = True
                    break
                transforms = state.transforms
                placed_ids = [
                    piece_id for piece_id in ordered_ids if piece_id in transforms
                ]
                remaining_ids = [
                    piece_id for piece_id in ordered_ids if piece_id not in transforms
                ]
                placed_polygons = state.polygons
                placed_polygon_items = tuple(placed_polygons.items())
                target_edges_by_id = state.edges_by_id
                target_bounds_by_id = state.bounds_by_id

                # 最大堆（用负数模拟）：始终只保留该状态评分最好的N个下一步。
                # 另按“待放碎片+边长误差等级”保留少量名额，防止24个分支
                # 全被等长边的相似姿态占满。这样长边由多条短边覆盖的正确
                # 路径也能留在快速束中，减少进入88宽搜索的概率。
                option_heap: List[Tuple[float, int, BeamState]] = []
                alignment_group_heaps: Dict[
                    Tuple[int, int], List[Tuple[float, int, BeamState]]
                ] = {}
                alignment_group_quota = max(
                    1,
                    options_per_state // max(6 * len(remaining_ids), 1),
                )
                option_order = 0
                local_placements = set()

                for new_id in remaining_ids:
                    new_piece = piece_by_id[new_id]
                    for placed_id in placed_ids:
                        parent_transform = transforms[placed_id]
                        for (
                            relative_transform,
                            aligned_contact,
                            edge_relative_error,
                        ) in relative_alignments[(new_id, placed_id)]:
                            deadline_counter += 1
                            if (
                                deadline is not None
                                and deadline_counter % DEADLINE_CHECK_INTERVAL == 0
                                and time.perf_counter() >= deadline
                            ):
                                deadline_hit = True
                                break
                            transform = compose_transform(
                                parent_transform, relative_transform
                            )
                            placement_key = transform_key(new_id, transform)
                            if placement_key in local_placements:
                                continue
                            local_placements.add(placement_key)

                            new_polygon = transform.apply(new_piece.polygon).astype(
                                np.float32,
                                copy=False,
                            )
                            overlap_increment = 0.0
                            # new_polygon通过placed_id的一对反向边生成，且轮廓
                            # 均来自凸包，因此与该目标块只接触、不可能产生面积
                            # 重叠。只需检查布局中的其他碎片。
                            new_bounds = None
                            if len(placed_ids) > 1:
                                new_bounds = polygon_bounds(new_polygon)
                                for old_id, old_polygon in placed_polygon_items:
                                    if old_id == placed_id:
                                        continue
                                    if bounds_are_separated(
                                        new_bounds,
                                        target_bounds_by_id[old_id],
                                    ):
                                        continue
                                    overlap_increment += convex_intersection_area(
                                        new_polygon, old_polygon
                                    )
                            allowed_overlap = max(
                                12.0,
                                min(new_piece.area, state.placed_area)
                                * MAX_OVERLAP_RATIO,
                            )
                            if overlap_increment > allowed_overlap:
                                continue

                            next_polygons = dict(placed_polygons)
                            next_polygons[new_id] = new_polygon
                            next_overlap = state.overlap_area + overlap_increment
                            next_placed_area = state.placed_area + new_piece.area
                            base_score, rectangle_area = _partial_rectangle_geometry(
                                next_polygons,
                                next_placed_area,
                                total_area,
                                next_overlap,
                            )
                            if (
                                rectangle_area
                                > total_area * MAX_PARTIAL_RECT_AREA_RATIO
                            ):
                                continue

                            mismatch_bucket = (
                                0
                                if edge_relative_error <= EDGE_LENGTH_TOLERANCE
                                else 1
                                if edge_relative_error <= SECOND_EDGE_LENGTH_TOLERANCE
                                else 2
                            )
                            group_key = (new_id, mismatch_bucket)
                            group_heap = alignment_group_heaps.setdefault(
                                group_key,
                                [],
                            )
                            # 公共边计算是内层热点。新碎片与每块旧碎片的接触
                            # 总长都不可能超过自身周长；若使用这个乐观上界后
                            # 仍进不了全局堆和误差分组堆，就可安全跳过昂贵计算。
                            maximum_new_contact = (
                                max(len(placed_ids), 1)
                                * perimeters_by_id[new_id]
                                * 1.05
                            )
                            optimistic_score = base_score - 0.0015 * (
                                state.contact_length + maximum_new_contact
                            )
                            can_enter_global = (
                                len(option_heap) < options_per_state
                                or (optimistic_score, option_order)
                                < (-option_heap[0][0], -option_heap[0][1])
                            )
                            can_enter_group = (
                                len(group_heap) < alignment_group_quota
                                or (optimistic_score, option_order)
                                < (-group_heap[0][0], -group_heap[0][1])
                            )
                            if not can_enter_global and not can_enter_group:
                                option_order += 1
                                continue

                            if new_bounds is None:
                                new_bounds = polygon_bounds(new_polygon)
                            new_edges = edge_descriptors(new_polygon)
                            contact_increment = aligned_contact
                            if len(placed_ids) > 1:
                                contact_increment += _contact_with_precomputed_edges(
                                    new_edges,
                                    new_bounds,
                                    target_edges_by_id,
                                    target_bounds_by_id,
                                    excluded_piece_id=placed_id,
                                )
                            next_contact = state.contact_length + contact_increment
                            partial_score = base_score - 0.0015 * next_contact
                            next_edges_by_id = dict(target_edges_by_id)
                            next_edges_by_id[new_id] = new_edges
                            next_bounds_by_id = dict(target_bounds_by_id)
                            next_bounds_by_id[new_id] = new_bounds
                            next_transforms = dict(transforms)
                            next_transforms[new_id] = transform
                            next_state = BeamState(
                                transforms=next_transforms,
                                polygons=next_polygons,
                                edges_by_id=next_edges_by_id,
                                bounds_by_id=next_bounds_by_id,
                                score=partial_score,
                                contact_length=next_contact,
                                overlap_area=next_overlap,
                                placed_area=next_placed_area,
                            )
                            heap_entry = (
                                -float(partial_score),
                                -option_order,
                                next_state,
                            )
                            if len(option_heap) < options_per_state:
                                heapq.heappush(option_heap, heap_entry)
                            else:
                                worst_score = -option_heap[0][0]
                                worst_order = -option_heap[0][1]
                                if (partial_score, option_order) < (
                                    worst_score,
                                    worst_order,
                                ):
                                    heapq.heapreplace(option_heap, heap_entry)

                            if len(group_heap) < alignment_group_quota:
                                heapq.heappush(group_heap, heap_entry)
                            else:
                                piece_worst_score = -group_heap[0][0]
                                piece_worst_order = -group_heap[0][1]
                                if (partial_score, option_order) < (
                                    piece_worst_score,
                                    piece_worst_order,
                                ):
                                    heapq.heapreplace(group_heap, heap_entry)
                            option_order += 1

                        if deadline_hit:
                            break
                    if deadline_hit:
                        break

                selected_options: Dict[
                    Tuple[Tuple[int, int, int, int], ...],
                    Tuple[float, int, BeamState],
                ] = {}
                # 先放入各碎片、各误差等级的保底名额，再用全局前N名填满。
                for group_heap in alignment_group_heaps.values():
                    for entry in group_heap:
                        state_key = _beam_state_key(entry[2].transforms)
                        previous = selected_options.get(state_key)
                        if previous is None or (-entry[0], -entry[1]) < (
                            -previous[0],
                            -previous[1],
                        ):
                            selected_options[state_key] = entry
                global_options = sorted(
                    option_heap,
                    key=lambda item: (-item[0], -item[1]),
                )
                for entry in global_options:
                    if len(selected_options) >= options_per_state:
                        break
                    state_key = _beam_state_key(entry[2].transforms)
                    selected_options.setdefault(state_key, entry)
                state_options = sorted(
                    selected_options.values(),
                    key=lambda item: (-item[0], -item[1]),
                )
                for _, _, next_state in state_options:
                    state_key = _beam_state_key(next_state.transforms)
                    previous = generated.get(state_key)
                    if previous is None or next_state.score < previous.score:
                        generated[state_key] = next_state

                # 只保留当前已处理候选中的全局前K名。之后若同一键出现更优解，
                # 仍会重新进入；同时给不同的已放碎片集合保留少量名额。
                if len(generated) > prune_threshold:
                    selected_states = _select_diverse_beam(
                        generated.values(),
                        beam_width,
                    )
                    generated = {
                        _beam_state_key(state.transforms): state
                        for state in selected_states
                    }

                if deadline_hit:
                    break

            result_width = beam_width
            if deadline_hit and _depth == len(pieces) - 1:
                # 最后一层已经产生完整布局时，保留少量最优状态完成严格验证。
                result_width = min(24, beam_width)
            beam = _select_diverse_beam(
                generated.values(),
                result_width,
            )
            if deadline_hit:
                if _depth != len(pieces) - 1:
                    beam = []
                break
            if not beam:
                break

        evaluated_after_deadline = 0
        for state in beam:
            if len(state.transforms) != len(pieces):
                continue
            if (
                state.overlap_area / max(total_area, 1.0)
                > MAX_FINAL_OVERLAP_RATIO
            ):
                continue
            if deadline is not None and time.perf_counter() >= deadline:
                if evaluated_after_deadline >= 8:
                    break
                evaluated_after_deadline += 1
            candidate = evaluate_complete(
                pieces,
                state.transforms,
                metric_cache=context.complete_metric_cache,
            )
            if candidate is not None:
                completed.append(candidate)
                if (
                    early_stop_fill_ratio is not None
                    and candidate.fill_ratio >= early_stop_fill_ratio
                ):
                    completed.sort(key=lambda item: item.score)
                    return completed

    completed.sort(key=lambda candidate: candidate.score)
    return completed


def _make_piece_variant(piece: Piece, epsilon_ratio: float) -> Optional[Piece]:
    """按指定轮廓逼近比例生成搜索备用多边形。"""
    hull = cv2.convexHull(piece.contour)
    perimeter = cv2.arcLength(hull, True)
    if perimeter <= 1.0:
        return None
    approx = cv2.approxPolyDP(hull, epsilon_ratio * perimeter, True)
    polygon = approx.reshape(-1, 2).astype(np.float64)
    polygon = remove_nearly_collinear(polygon, 5.0)
    if not 3 <= len(polygon) <= 7:
        return None
    polygon_area = abs(polygon_signed_area(polygon))
    area_error = abs(polygon_area - piece.area) / max(piece.area, 1.0)
    if area_error > 0.22:
        return None
    polygon = ensure_counter_clockwise(polygon)
    return Piece(
        index=piece.index,
        contour=piece.contour,
        polygon=polygon,
        area=piece.area,
        center=piece.center.copy(),
    )


def _piece_set_signature(
    pieces: Sequence[Piece],
) -> Tuple[Tuple[int, Tuple[int, ...]], ...]:
    """用于去除几何上重复的轮廓逼近组合。"""
    signature = []
    for piece in sorted(pieces, key=lambda item: item.index):
        lengths = sorted(
            int(round(length / 2.0)) for _, _, _, length in edges(piece.polygon)
        )
        signature.append((len(piece.polygon), tuple(lengths)))
    return tuple(
        (piece.index, data)
        for piece, data in zip(sorted(pieces, key=lambda item: item.index), signature)
    )


def _global_polygon_variants(pieces: Sequence[Piece]) -> List[List[Piece]]:
    """
    仅在正常搜索无解时使用多组轮廓逼近。

    实拍反光或边缘模糊可能让某一块被固定成错误的 3/5 个顶点；使用几组
    全局 epsilon 重建多边形，可以在不影响正常识别速度的前提下恢复搜索。
    """
    ratios = (0.006, 0.008, 0.010, 0.012, 0.015, 0.019, 0.024, 0.030, 0.038)
    variants: List[List[Piece]] = []
    seen = set()
    for ratio in ratios:
        candidate_set: List[Piece] = []
        valid = True
        for piece in pieces:
            variant = _make_piece_variant(piece, ratio)
            if variant is None:
                valid = False
                break
            candidate_set.append(variant)
        if not valid:
            continue
        signature = tuple(
            (
                item.index,
                len(item.polygon),
                tuple(
                    sorted(
                        int(round(length / 2.0))
                        for _, _, _, length in edges(item.polygon)
                    )
                ),
            )
            for item in sorted(candidate_set, key=lambda value: value.index)
        )
        if signature in seen:
            continue
        seen.add(signature)
        variants.append(candidate_set)
    return variants


def _run_beam_for_all_anchors(
    pieces: Sequence[Piece],
    beam_width: int,
    options_per_state: int,
    context: Optional[BeamSearchContext] = None,
    early_stop_fill_ratio: Optional[float] = None,
    deadline: Optional[float] = None,
    stop_on_first_strict_candidate: bool = False,
    max_anchors: Optional[int] = None,
) -> List[Candidate]:
    if context is None:
        context = build_beam_search_context(pieces)
    anchors = _rank_anchors_by_edge_connectivity(pieces, context)
    if max_anchors is not None:
        anchors = anchors[: max(1, int(max_anchors))]
    completed: List[Candidate] = []
    for anchor_position, anchor in enumerate(anchors, start=1):
        if deadline is not None and time.perf_counter() >= deadline:
            break
        anchor_started = time.perf_counter()
        found = _solve_puzzle_beam(
            pieces,
            beam_width=beam_width,
            options_per_state=options_per_state,
            anchors=[anchor],
            context=context,
            deadline=deadline,
            early_stop_fill_ratio=early_stop_fill_ratio,
        )
        trace_log(
            "拼图搜索",
            f"加宽锚点{anchor_position}/{len(anchors)} P{anchor.index + 1}完成，"
            f"严格候选={len(found)}，本轮{time.perf_counter() - anchor_started:.3f}s",
        )
        if found:
            completed.extend(found)
            # 最终只会按score选择最优候选；提前保留同样的前N名不会改变结果。
            if len(completed) > MAX_COMPLETE_CANDIDATES:
                completed = heapq.nsmallest(
                    MAX_COMPLETE_CANDIDATES,
                    completed,
                    key=lambda candidate: candidate.score,
                )
            if early_stop_fill_ratio is not None:
                best_so_far = min(
                    completed,
                    key=lambda candidate: candidate.score,
                )
                if best_so_far.fill_ratio >= early_stop_fill_ratio:
                    completed.sort(key=lambda candidate: candidate.score)
                    trace_log(
                        "拼图搜索",
                        "当前阶段已得到高置信度完整矩形，跳过其余重复锚点；"
                        f"填充率={best_so_far.fill_ratio:.4f}",
                    )
                    return completed
            if stop_on_first_strict_candidate:
                completed.sort(key=lambda candidate: candidate.score)
                trace_log(
                    "拼图搜索",
                    "当前锚点已得到通过全部严格阈值的矩形，"
                    "跳过其余等价锚点",
                )
                return completed
    completed.sort(key=lambda candidate: candidate.score)
    return completed


def _solve_with_relaxed_limits(
    pieces: Sequence[Piece],
    deadline: Optional[float] = None,
) -> List[Candidate]:
    """仅在严格搜索失败后启用；结束时必定恢复全部全局参数。"""
    global MIN_RECT_FILL_RATIO
    global MAX_FINAL_OVERLAP_RATIO
    global MIN_CONTACT_COVERAGE
    global MAX_PARTIAL_RECT_AREA_RATIO
    global MIN_EDGE_PAIR_RATIO
    global MAX_OVERLAP_RATIO

    old_values = (
        MIN_RECT_FILL_RATIO,
        MAX_FINAL_OVERLAP_RATIO,
        MIN_CONTACT_COVERAGE,
        MAX_PARTIAL_RECT_AREA_RATIO,
        MIN_EDGE_PAIR_RATIO,
        MAX_OVERLAP_RATIO,
    )
    try:
        # 这些限制只用于“严格搜索完全无解”的备用路径。最终仍要求接近矩形，
        # 但允许实拍轮廓边缘带来的少量缺口、长度偏差和公共边损失。
        MIN_RECT_FILL_RATIO = 0.90
        MAX_FINAL_OVERLAP_RATIO = 0.030
        MIN_CONTACT_COVERAGE = 0.43
        MAX_PARTIAL_RECT_AREA_RATIO = 1.72
        MIN_EDGE_PAIR_RATIO = 0.10
        MAX_OVERLAP_RATIO = 0.035
        return _run_beam_for_all_anchors(
            pieces,
            beam_width=MAX_STRICT_BEAM_WIDTH,
            options_per_state=MAX_STRICT_BEAM_OPTIONS,
            deadline=deadline,
            stop_on_first_strict_candidate=True,
            max_anchors=MEDIUM_MAX_ANCHORS,
        )
    finally:
        (
            MIN_RECT_FILL_RATIO,
            MAX_FINAL_OVERLAP_RATIO,
            MIN_CONTACT_COVERAGE,
            MAX_PARTIAL_RECT_AREA_RATIO,
            MIN_EDGE_PAIR_RATIO,
            MAX_OVERLAP_RATIO,
        ) = old_values


def solve_puzzle(
    pieces: Sequence[Piece],
    absolute_deadline: Optional[float] = None,
) -> Candidate:
    """
    无总超时的分阶段搜索：快速预筛后持续执行加宽与轮廓重建。

    正常样本先枚举最长公共边。快速路径无解时依次扩大每对碎片的候选数，
    最后恢复全部边组合；仍无解才重建轮廓并执行宽容搜索。
    """
    if len(pieces) < 2:
        raise ValueError("至少需要两块碎片")

    solver_started = time.perf_counter()
    # 默认没有总截止时间。absolute_deadline只保留给明确需要外部取消的调用者；
    # UI的第一、二、三问均不再传入它，因此会一直搜索到找到解或穷尽候选。
    search_deadline = absolute_deadline
    completed: List[Candidate] = []
    timed_best: Optional[Candidate] = None

    def remember_candidate(found: Sequence[Candidate]) -> None:
        nonlocal timed_best
        if not found:
            return
        candidate = min(found, key=lambda item: item.score)
        if timed_best is None or candidate.score < timed_best.score:
            timed_best = candidate

    def return_or_raise_external_deadline() -> Candidate:
        if timed_best is not None:
            trace_log(
                "拼图搜索",
                "达到外部截止时间，返回已通过严格验证的最佳矩形；"
                f"填充率={timed_best.fill_ratio:.4f}",
            )
            return timed_best
        raise TimeoutError(
            "拼图搜索被外部截止时间中断，尚未找到通过严格验证的拼法"
        )

    def external_deadline_reached() -> bool:
        return (
            search_deadline is not None
            and time.perf_counter() >= search_deadline
        )

    vertex_summary = ", ".join(
        f"P{piece.index + 1}={len(piece.polygon)}边" for piece in pieces
    )

    # 全边候选先只保留公共边最长的一小批。排序的第一关键字是可形成的
    # 公共边长度，边长误差只作为第二关键字，因此真正的长公共边会先枚举。
    strict_context = build_beam_search_context(
        pieces,
        max_alignments_per_piece_pair=FAST_ALIGNMENTS_PER_PIECE_PAIR,
    )
    strict_anchor_order = _rank_anchors_by_edge_connectivity(
        pieces,
        strict_context,
    )
    strict_fast_anchors = strict_anchor_order[:FAST_STRICT_MAX_ANCHORS]
    trace_log(
        "拼图搜索",
        f"开始最长公共边优先搜索（每对最多{FAST_ALIGNMENTS_PER_PIECE_PAIR}个）；"
        f"{vertex_summary}",
    )

    # 第一阶段：32宽搜索按连通性顺序逐个锚点运行；每对碎片只枚举最长的
    # 18个放置候选，一旦得到任一严格候选立即返回。
    strict_fast_deadline = search_deadline
    for anchor_position, anchor in enumerate(strict_fast_anchors, start=1):
        if (
            strict_fast_deadline is not None
            and time.perf_counter() >= strict_fast_deadline
        ):
            break
        anchor_started = time.perf_counter()
        completed = _solve_puzzle_beam(
            pieces,
            beam_width=BEAM_SEARCH_WIDTH,
            options_per_state=BEAM_OPTIONS_PER_STATE,
            anchors=[anchor],
            context=strict_context,
            deadline=strict_fast_deadline,
            early_stop_fill_ratio=EARLY_STOP_FILL_RATIO,
        )
        remember_candidate(completed)
        if completed:
            trace_log(
                "拼图搜索",
                f"快速路径成功：锚点{anchor_position}/{len(strict_fast_anchors)}，"
                f"本轮{time.perf_counter() - anchor_started:.3f}s，"
                f"总耗时{time.perf_counter() - solver_started:.3f}s",
            )
            return completed[0]
        trace_log(
            "拼图搜索",
            f"快速锚点{anchor_position}/{len(strict_fast_anchors)}无解，"
            f"本轮{time.perf_counter() - anchor_started:.3f}s",
        )

    if external_deadline_reached():
        return return_or_raise_external_deadline()

    # 第二阶段：适度放宽每对碎片的候选数，同时使用中等束宽。找到严格候选
    # 就返回；仍无解时，才恢复全部边组合做96宽兜底搜索。
    stage_started = time.perf_counter()
    medium_context = build_beam_search_context(
        pieces,
        max_alignments_per_piece_pair=MEDIUM_ALIGNMENTS_PER_PIECE_PAIR,
    )
    trace_log(
        "拼图搜索",
        f"快速路径无解，每对扩到{MEDIUM_ALIGNMENTS_PER_PIECE_PAIR}个长边候选",
    )
    completed = _run_beam_for_all_anchors(
        pieces,
        beam_width=BEAM_FALLBACK_WIDTH,
        options_per_state=BEAM_FALLBACK_OPTIONS,
        context=medium_context,
        early_stop_fill_ratio=EARLY_STOP_FILL_RATIO,
        deadline=search_deadline,
        stop_on_first_strict_candidate=True,
        max_anchors=MEDIUM_MAX_ANCHORS,
    )
    remember_candidate(completed)
    if completed:
        trace_log(
            "拼图搜索",
            f"中等束宽严格搜索成功：本阶段{time.perf_counter() - stage_started:.3f}s，"
            f"总耗时{time.perf_counter() - solver_started:.3f}s",
        )
        return completed[0]

    if external_deadline_reached():
        return return_or_raise_external_deadline()

    # 第三阶段：中等束宽无解后恢复全部边组合，保证短边组成的正确解不会
    # 因前两阶段的提速筛选而被永久漏掉；此阶段不设内部总超时。
    stage_started = time.perf_counter()
    full_context = build_beam_search_context(pieces)
    trace_log("拼图搜索", "长边候选无解，恢复全部边组合进行最大束宽搜索")
    completed = _run_beam_for_all_anchors(
        pieces,
        beam_width=MAX_STRICT_BEAM_WIDTH,
        options_per_state=MAX_STRICT_BEAM_OPTIONS,
        context=full_context,
        early_stop_fill_ratio=EARLY_STOP_FILL_RATIO,
        deadline=search_deadline,
        stop_on_first_strict_candidate=True,
    )
    remember_candidate(completed)
    if completed:
        trace_log(
            "拼图搜索",
            f"加宽严格搜索成功：本阶段{time.perf_counter() - stage_started:.3f}s，"
            f"总耗时{time.perf_counter() - solver_started:.3f}s",
        )
        return completed[0]

    if external_deadline_reached():
        return return_or_raise_external_deadline()

    # 第四阶段：当前多边形可能因反光/锯齿少了或多了一个角点。
    # 先用不同 epsilon 重建，再用中等束宽尝试严格矩形验证。
    variants = _global_polygon_variants(pieces)
    trace_log(
        "拼图搜索",
        f"加宽严格搜索无解，开始{len(variants)}组轮廓重建",
    )
    for variant_index, variant_pieces in enumerate(variants, start=1):
        variant_started = time.perf_counter()
        completed = _run_beam_for_all_anchors(
            variant_pieces,
            beam_width=72,
            options_per_state=44,
            early_stop_fill_ratio=EARLY_STOP_FILL_RATIO,
            deadline=search_deadline,
            stop_on_first_strict_candidate=True,
            max_anchors=MEDIUM_MAX_ANCHORS,
        )
        remember_candidate(completed)
        if completed:
            trace_log(
                "拼图搜索",
                f"轮廓重建{variant_index}/{len(variants)}成功："
                f"本轮{time.perf_counter() - variant_started:.3f}s，"
                f"总耗时{time.perf_counter() - solver_started:.3f}s",
            )
            return completed[0]
        trace_log(
            "拼图搜索",
            f"轮廓重建{variant_index}/{len(variants)}无解，"
            f"本轮{time.perf_counter() - variant_started:.3f}s",
        )
        if external_deadline_reached():
            return return_or_raise_external_deadline()

    # 第四阶段：只对轮廓变形明显的失败样本放宽小量容差。
    # 候选按分数比较，优先选择填充率更高、重叠更低的方案。
    relaxed_candidates: List[Candidate] = []
    relaxed_sets = variants if variants else [list(pieces)]
    trace_log(
        "拼图搜索",
        f"严格轮廓均无解，开始{len(relaxed_sets)}组宽容搜索",
    )
    for variant_index, variant_pieces in enumerate(relaxed_sets, start=1):
        variant_started = time.perf_counter()
        found = _solve_with_relaxed_limits(
            variant_pieces,
            deadline=search_deadline,
        )
        if found:
            relaxed_candidates.extend(found[:6])
        trace_log(
            "拼图搜索",
            f"宽容搜索{variant_index}/{len(relaxed_sets)}完成，"
            f"候选={len(found)}，本轮{time.perf_counter() - variant_started:.3f}s",
        )
        if external_deadline_reached():
            break
    if relaxed_candidates:
        relaxed_candidates.sort(
            key=lambda candidate: (
                candidate.score,
                -candidate.fill_ratio,
                abs(candidate.aspect_ratio - 1.5),
            )
        )
        best = relaxed_candidates[0]
        trace_log(
            "拼图搜索",
            "宽容搜索找到结果："
            f"填充率={best.fill_ratio:.4f}, 长宽比={best.aspect_ratio:.3f}，"
            f"总耗时{time.perf_counter() - solver_started:.3f}s",
        )
        return best

    if external_deadline_reached():
        return return_or_raise_external_deadline()

    raise RuntimeError(
        "没有找到满足矩形条件的拼法。程序已尝试严格搜索、加宽搜索、"
        "多组轮廓重建和宽容搜索；请保存本次 Rectified recognition input "
        "和终端错误信息用于继续定位。"
    )


def mirror_piece_for_search(piece: Piece) -> Piece:
    """生成某块碎片的镜像搜索副本；中心和原始轮廓仍保持不变。"""
    polygon = piece.polygon.copy()
    polygon[:, 0] = 2.0 * piece.center[0] - polygon[:, 0]
    polygon = ensure_counter_clockwise(polygon)
    return Piece(
        index=piece.index,
        contour=piece.contour,
        polygon=polygon,
        area=piece.area,
        center=piece.center.copy(),
    )


def solve_puzzle_with_flip_detection(
    pieces: Sequence[Piece],
) -> Tuple[Candidate, List[Piece]]:
    """
    先尝试纯旋转拼图；无解时再检查是否有纸片被翻到背面。

    镜像不能由平面旋转实现，因此结果会记录 flipped_piece_ids，供机械臂
    控制程序决定是否有翻面机构可用。
    """
    try:
        return solve_puzzle(pieces), list(pieces)
    except RuntimeError as normal_error:
        last_error: Exception = normal_error

    ids = [piece.index for piece in pieces]
    # 优先寻找翻面数量最少的解；4块时最多只有15种组合。
    for flip_count in range(1, len(ids) + 1):
        for flipped_ids in itertools.combinations(ids, flip_count):
            effective = [
                mirror_piece_for_search(piece) if piece.index in flipped_ids else piece
                for piece in pieces
            ]
            try:
                candidate = solve_puzzle(effective)
                candidate.flipped_piece_ids = tuple(sorted(flipped_ids))
                return candidate, effective
            except RuntimeError as exc:
                last_error = exc
    raise RuntimeError(
        "没有找到填充率达到95%的矩形拼法（已同时检查旋转和翻面组合）"
    ) from last_error


def normalize_solution(
    pieces: Sequence[Piece],
    candidate: Candidate,
) -> Tuple[Dict[int, Transform], PointArray, Tuple[int, int]]:
    """
    把求得的矩形转为长边竖直，并移动到带边距的输出画布。

    矩形长边保持竖直，但不再强制“最大碎片位于上半部”。矩形整体旋转
    180度后形状完全相同，因此程序会比较两个等价方向，优先选择：
    1. 最大单块旋转绝对值更小；
    2. 若最大值相同，则所有碎片旋转绝对值之和更小。
    """
    box = candidate.rectangle
    edge_vectors = np.roll(box, -1, axis=0) - box
    lengths = np.linalg.norm(edge_vectors, axis=1)
    longest = edge_vectors[int(np.argmax(lengths))]
    longest_angle = math.atan2(longest[1], longest[0])

    # 第一种方向：把矩形长边旋转到图像竖直方向。
    base_global_angle = math.pi * 0.5 - longest_angle

    def wrap_angle_deg(angle_deg: float) -> float:
        """把角度规范到[-180, 180)，对应机械臂的较短旋转方向。"""
        return (float(angle_deg) + 180.0) % 360.0 - 180.0

    def rotation_cost(test_global_angle: float) -> Tuple[float, float]:
        """
        返回该整体方向下的旋转代价：
        (最大单块旋转绝对值, 所有旋转绝对值之和)。
        """
        test_global_rot = rotation_matrix(test_global_angle)
        absolute_angles: List[float] = []

        for piece in pieces:
            old_rot = candidate.transforms[piece.index].rotation
            final_rot = test_global_rot @ old_rot
            final_angle = math.degrees(math.atan2(final_rot[1, 0], final_rot[0, 0]))
            absolute_angles.append(abs(wrap_angle_deg(final_angle)))

        if not absolute_angles:
            return 0.0, 0.0
        return max(absolute_angles), sum(absolute_angles)

    # 旋转180度不会改变矩形形状，只会改变每块碎片最终需要旋转的角度。
    direction_candidates = (
        base_global_angle,
        base_global_angle + math.pi,
    )
    costs = [rotation_cost(angle) for angle in direction_candidates]
    best_direction_index = min(
        range(len(direction_candidates)),
        key=lambda index: costs[index],
    )

    global_angle = direction_candidates[best_direction_index]
    global_rot = rotation_matrix(global_angle)

    selected_cost = costs[best_direction_index]
    direction_text = "原方向" if best_direction_index == 0 else "整体翻转180度"
    print(
        "[角度优化] "
        f"{direction_text}，最大旋转={selected_cost[0]:.1f}°，"
        f"总旋转={selected_cost[1]:.1f}°"
    )

    rotated_polys = []
    combined: Dict[int, Transform] = {}
    for piece in pieces:
        old = candidate.transforms[piece.index]
        new_rot = global_rot @ old.rotation
        new_translation = global_rot @ old.translation
        angle_deg = math.degrees(math.atan2(new_rot[1, 0], new_rot[0, 0]))
        angle_deg = wrap_angle_deg(angle_deg)
        combined[piece.index] = Transform(new_rot, new_translation, angle_deg)
        rotated_polys.append(combined[piece.index].apply(piece.polygon))

    all_pts = np.vstack(rotated_polys)
    minimum = np.min(all_pts, axis=0)
    maximum = np.max(all_pts, axis=0)
    shift = np.array([OUTPUT_MARGIN, OUTPUT_MARGIN], dtype=np.float64) - minimum

    for piece in pieces:
        combined[piece.index].translation += shift

    canvas_width = int(math.ceil(maximum[0] - minimum[0] + 2 * OUTPUT_MARGIN))
    canvas_height = int(math.ceil(maximum[1] - minimum[1] + 2 * OUTPUT_MARGIN))
    normalized_box = box @ global_rot.T + shift
    return combined, normalized_box, (canvas_width, canvas_height)


def detect_occupied_half(pieces: Sequence[Piece], image_width: int) -> Tuple[str, str]:
    """
    按碎片面积加权中心判断取料半区。

    返回：
        ("left", "right") 或 ("right", "left")
    """
    total_area = max(sum(piece.area for piece in pieces), 1.0)
    weighted_x = sum(piece.center[0] * piece.area for piece in pieces) / total_area
    if weighted_x < image_width * 0.5:
        return "left", "right"
    return "right", "left"


def _copy_transforms(
    transforms: Dict[int, Transform],
) -> Dict[int, Transform]:
    """深拷贝变换，便于尝试不同缝隙比例而不污染原结果。"""
    return {
        piece_id: Transform(
            transform.rotation.copy(),
            transform.translation.copy(),
            float(transform.angle_deg),
        )
        for piece_id, transform in transforms.items()
    }


def _maximum_pairwise_overlap(
    pieces: Sequence[Piece],
    transforms: Dict[int, Transform],
) -> float:
    """计算最终原尺寸碎片两两之间的最大重叠面积。"""
    transformed = {
        piece.index: transforms[piece.index].apply(piece.polygon) for piece in pieces
    }
    maximum_overlap = 0.0
    for first_index, first_piece in enumerate(pieces):
        for second_piece in pieces[first_index + 1 :]:
            overlap = convex_intersection_area(
                transformed[first_piece.index],
                transformed[second_piece.index],
            )
            maximum_overlap = max(maximum_overlap, float(overlap))
    return maximum_overlap


def add_non_overlap_gap(
    pieces: Sequence[Piece],
    transforms: Dict[int, Transform],
    initial_scale: float = PIECE_GAP_SCALE,
) -> Tuple[Dict[int, Transform], float, float]:
    """
    保持每块旋转角不变，把碎片目标中心之间的距离等比放大。

    数学上等价于：
    1. 将每块碎片围绕自身中心等比放大；
    2. 用放大后的虚拟碎片完成无缝拼接；
    3. 保留虚拟拼接得到的中心和角度，但执行时换回原尺寸碎片。

    因此：
    - 抓取中心完全不变；
    - 每块旋转角完全不变；
    - 整体拼图中心不变；
    - 各块放置中心只向外移动很小距离，从而产生缝隙。
    """
    if not pieces:
        return _copy_transforms(transforms), 1.0, 0.0

    base = _copy_transforms(transforms)
    target_centers = {
        piece.index: base[piece.index].apply(piece.center.reshape(1, 2))[0]
        for piece in pieces
    }

    total_area = max(sum(piece.area for piece in pieces), 1.0)
    assembly_center = (
        sum(target_centers[piece.index] * piece.area for piece in pieces) / total_area
    )

    start_scale = max(1.0, float(initial_scale))
    scales: List[float] = []
    scale = start_scale
    while scale <= MAX_PIECE_GAP_SCALE + 1e-9:
        scales.append(round(scale, 6))
        scale += PIECE_GAP_SCALE_STEP
    if not scales or scales[-1] < MAX_PIECE_GAP_SCALE - 1e-9:
        scales.append(float(MAX_PIECE_GAP_SCALE))

    best_transforms = _copy_transforms(base)
    best_scale = start_scale
    best_overlap = float("inf")

    for test_scale in scales:
        trial = _copy_transforms(base)
        for piece in pieces:
            old_center = target_centers[piece.index]
            new_center = assembly_center + test_scale * (old_center - assembly_center)
            trial[piece.index].translation += new_center - old_center

        overlap = _maximum_pairwise_overlap(pieces, trial)
        if overlap < best_overlap:
            best_transforms = trial
            best_scale = test_scale
            best_overlap = overlap
        if overlap <= MAX_PHYSICAL_OVERLAP_PX2:
            break

    if best_overlap > MAX_PHYSICAL_OVERLAP_PX2:
        raise RuntimeError(
            "增加碎片缝隙后仍检测到重叠："
            f"最大重叠面积={best_overlap:.2f}px²，"
            f"已尝试到中心间距比例={best_scale:.3f}。"
            "请适当增大 MAX_PIECE_GAP_SCALE。"
        )

    print(
        "[防重叠] 保持旋转角和整体中心不变，"
        f"目标中心间距扩大到 {best_scale:.3f} 倍，"
        f"最大剩余重叠={best_overlap:.3f}px²"
    )
    return best_transforms, best_scale, best_overlap


def place_solution_in_other_half(
    pieces: Sequence[Piece],
    candidate: Candidate,
    image_shape: Tuple[int, ...],
    margin: int = TARGET_HALF_MARGIN,
) -> Tuple[Dict[int, Transform], PointArray, str, str]:
    """
    将拼好的矩形放到空白半区的安全区域正中间。

    安全区域由以下边界围成：
    - 靠中线一侧：距离A4中线至少margin像素；
    - 靠外侧一侧：距离A4外边缘至少margin像素；
    - 上下两侧：距离A4上下边缘至少margin像素。

    目标矩形的包围框中心放在该安全区域的正中心，因此它到中线和外边缘
    的实际间距会尽量相等，同时上下间距也会尽量相等。程序不会缩放实际
    碎片，也不会改变前面已经选好的旋转角；只把各碎片目标中心轻微向外
    展开，形成防重叠缝隙，然后再对整个拼图做一次整体平移。
    """
    height, width = image_shape[:2]
    source_half, target_half = detect_occupied_half(pieces, width)
    transforms, normalized_box, _ = normalize_solution(pieces, candidate)

    # 在不改变旋转角和整体中心的前提下，放大各碎片目标中心之间的距离。
    # 最终执行的仍是原尺寸轮廓，因此相邻碎片之间会留下小缝隙。
    transforms, gap_scale, remaining_overlap = add_non_overlap_gap(pieces, transforms)

    target_polys = [transforms[piece.index].apply(piece.polygon) for piece in pieces]
    all_points = np.vstack(target_polys)
    minimum = np.min(all_points, axis=0)
    maximum = np.max(all_points, axis=0)
    puzzle_size = maximum - minimum

    middle_x = width * 0.5

    # 明确构造目标半区的安全矩形。
    if target_half == "right":
        safe_x_min = middle_x + margin
        safe_x_max = width - margin
    else:
        safe_x_min = margin
        safe_x_max = middle_x - margin

    safe_y_min = float(margin)
    safe_y_max = float(height - margin)

    available_width = safe_x_max - safe_x_min
    available_height = safe_y_max - safe_y_min
    if puzzle_size[0] > available_width or puzzle_size[1] > available_height:
        raise RuntimeError(
            "拼好的矩形无法在不缩放的情况下放入安全区域："
            f"拼图尺寸约 {puzzle_size[0]:.1f}×{puzzle_size[1]:.1f}px，"
            f"安全区域约 {available_width:.1f}×{available_height:.1f}px。"
            "请减小 TARGET_HALF_MARGIN，或调整目标矩形方向。"
        )

    # 目标中心就是“中线安全边界”和“A4外边缘安全边界”的正中间。
    target_center = np.array(
        [
            (safe_x_min + safe_x_max) * 0.5,
            (safe_y_min + safe_y_max) * 0.5,
        ],
        dtype=np.float64,
    )
    current_center = (minimum + maximum) * 0.5
    shift = target_center - current_center

    for piece in pieces:
        transforms[piece.index].translation += shift

    # normalized_box来自无缝矩形，仅用于方向参考；产生缝隙后，以真实原尺寸
    # 碎片的最终外接框重新生成显示框，避免预览仍画成无缝矩形。
    final_before_check = np.vstack(
        [transforms[p.index].apply(p.polygon) for p in pieces]
    ).astype(np.float32)
    normalized_box = cv2.boxPoints(cv2.minAreaRect(final_before_check)).astype(
        np.float64
    )

    # 最终边界检查。
    final_points = np.vstack([transforms[p.index].apply(p.polygon) for p in pieces])
    final_min = np.min(final_points, axis=0)
    final_max = np.max(final_points, axis=0)

    if (
        final_min[0] < safe_x_min - 1.0
        or final_max[0] > safe_x_max + 1.0
        or final_min[1] < safe_y_min - 1.0
        or final_max[1] > safe_y_max + 1.0
    ):
        raise RuntimeError("目标拼图超出安全区域，请减小 TARGET_HALF_MARGIN")

    # 输出实际间距，方便现场确认。
    if target_half == "right":
        middle_clearance = final_min[0] - middle_x
        outer_clearance = width - final_max[0]
    else:
        middle_clearance = middle_x - final_max[0]
        outer_clearance = final_min[0]

    top_clearance = final_min[1]
    bottom_clearance = height - final_max[1]

    print(
        "[放置优化] 带缝隙拼图位于安全区域正中间："
        f"中心间距比例={gap_scale:.3f}，"
        f"最大重叠={remaining_overlap:.3f}px²，"
        f"中线间距={middle_clearance:.1f}px，"
        f"外边缘间距={outer_clearance:.1f}px，"
        f"上边缘间距={top_clearance:.1f}px，"
        f"下边缘间距={bottom_clearance:.1f}px"
    )

    return transforms, normalized_box, source_half, target_half


def pixel_to_mm(
    point: Sequence[float],
    image_shape: Tuple[int, ...],
    a4_width_mm: float,
    a4_height_mm: float,
) -> List[float]:
    """把整张 A4 左上角原点的像素坐标换算成毫米坐标。"""
    height, width = image_shape[:2]
    return [
        float(point[0]) * a4_width_mm / width,
        float(point[1]) * a4_height_mm / height,
    ]


def source_board_is_portrait(corners: PointArray) -> bool:
    """
    判断黑色 A4 在原始相机画面中是否为竖放。

    这里只读取 detect_black_a4_board() 已经得到的四个角点，不改变 A4
    检测、透视矫正或碎片识别过程。
    """
    ordered = np.asarray(corners, dtype=np.float64).reshape(4, 2)
    tl, tr, br, bl = ordered
    horizontal = 0.5 * (np.linalg.norm(tr - tl) + np.linalg.norm(br - bl))
    vertical = 0.5 * (np.linalg.norm(bl - tl) + np.linalg.norm(br - tr))
    return bool(vertical > horizontal)


def rectified_point_to_robot_mm(
    point: Sequence[float],
    image_shape: Tuple[int, ...],
    px_per_mm_x: float,
    px_per_mm_y: float,
    board_corners_in_source: PointArray,
) -> List[float]:
    """
    把 V8 矫正图中的点转换为机械坐标 [X, Y]，单位 mm。

    机械坐标约定：
    - 原点：原始相机画面中识别到的 A4 右下角；
    - X 正方向：沿 A4 右边缘向上；
    - Y 正方向：沿 A4 下边缘向左。

    V8 在黑色 A4 竖放时会把矫正图顺时针旋转 90 度，因此竖放与横放
    的坐标换算不同。这里根据原始四角的长宽关系自动选择，保证原点始终
    对应用户在相机画面中看到的右下角。
    """
    height, width = image_shape[:2]
    x_px = float(point[0])
    y_px = float(point[1])
    scale_x = max(float(px_per_mm_x), 1e-9)
    scale_y = max(float(px_per_mm_y), 1e-9)

    if source_board_is_portrait(board_corners_in_source):
        # 原图竖放时，V8 会将 portrait 矫正图顺时针旋转 90°：
        # 原图右下角 -> 矫正图左下角；向上 -> 矫正图向右；向左 -> 向上。
        robot_x_mm = x_px / scale_x
        robot_y_mm = ((height - 1.0) - y_px) / scale_y
    else:
        # 原图横放时没有额外旋转：原图右下角就是矫正图右下角。
        robot_x_mm = ((height - 1.0) - y_px) / scale_y
        robot_y_mm = ((width - 1.0) - x_px) / scale_x

    # 消除浮点计算产生的 -0.0。
    if abs(robot_x_mm) < 1e-9:
        robot_x_mm = 0.0
    if abs(robot_y_mm) < 1e-9:
        robot_y_mm = 0.0
    return [float(robot_x_mm), float(robot_y_mm)]


def draw_cross(
    image: PointArray,
    point: Sequence[float],
    color: Tuple[int, int, int],
    size: int = 7,
) -> None:
    x, y = np.round(point).astype(int)
    cv2.line(image, (x - size, y), (x + size, y), color, 2, cv2.LINE_AA)
    cv2.line(image, (x, y - size), (x, y + size), color, 2, cv2.LINE_AA)


def draw_robot_coordinate_axes_on_source(
    image: PointArray,
    board_corners: PointArray,
) -> PointArray:
    """
    在 MJPG A4 主画面上绘制机械坐标轴。

    四角顺序沿用 V8：左上、右上、右下、左下。坐标轴仅绘制在显示副本
    上，不会参与 A4 检测、碎片阈值、轮廓提取或拼图计算。
    """
    preview = image.copy()
    corners = np.asarray(board_corners, dtype=np.float64).reshape(4, 2)
    _tl, tr, br, bl = corners

    x_vector = tr - br  # 原点沿右边缘向上
    y_vector = bl - br  # 原点沿下边缘向左
    x_length = float(np.linalg.norm(x_vector))
    y_length = float(np.linalg.norm(y_vector))
    if x_length < 2.0 or y_length < 2.0:
        return preview

    # 坐标轴长度随画面中的 A4 大小变化，并限制在便于观察的范围内。
    axis_length = float(np.clip(min(x_length, y_length) * 0.34, 70.0, 190.0))
    x_end = br + x_vector / x_length * axis_length
    y_end = br + y_vector / y_length * axis_length

    origin_i = tuple(np.rint(br).astype(int))
    x_end_i = tuple(np.rint(x_end).astype(int))
    y_end_i = tuple(np.rint(y_end).astype(int))

    # X 轴绿色，Y 轴青色，原点使用用户示意图中的紫色。
    cv2.arrowedLine(
        preview,
        origin_i,
        x_end_i,
        (0, 255, 0),
        5,
        cv2.LINE_AA,
        tipLength=0.13,
    )
    cv2.arrowedLine(
        preview,
        origin_i,
        y_end_i,
        (255, 255, 0),
        5,
        cv2.LINE_AA,
        tipLength=0.13,
    )
    cv2.circle(preview, origin_i, 11, (255, 0, 255), -1, cv2.LINE_AA)
    cv2.circle(preview, origin_i, 14, (255, 255, 255), 2, cv2.LINE_AA)

    cv2.putText(
        preview,
        "X+",
        (x_end_i[0] + 8, x_end_i[1] - 8),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.85,
        (0, 255, 0),
        3,
        cv2.LINE_AA,
    )
    cv2.putText(
        preview,
        "Y+",
        (y_end_i[0] - 42, y_end_i[1] - 10),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.85,
        (255, 255, 0),
        3,
        cv2.LINE_AA,
    )
    cv2.putText(
        preview,
        "O(0,0)",
        (origin_i[0] + 14, origin_i[1] - 14),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.72,
        (255, 0, 255),
        3,
        cv2.LINE_AA,
    )
    return preview


def make_piece_edge_length_preview(
    board: BoardDetection,
) -> Tuple[PointArray, List[dict]]:
    """
    仅在用户按下 A 时测量并显示碎片边长。

    A4 检测、透视矫正和碎片提取仍完全使用原 V8 逻辑。边长按照
    BoardDetection 中的 x/y 像素标定分别换算，避免横纵像素比例的
    微小差异带来误差。
    """
    pieces, _ = extract_pieces(board.recognition)
    preview = board.rectified.copy()
    colors = [
        (60, 180, 255),
        (80, 220, 100),
        (255, 120, 80),
        (210, 80, 220),
    ]
    scale_x = max(float(board.px_per_mm_x), 1e-9)
    scale_y = max(float(board.px_per_mm_y), 1e-9)
    measurements: List[dict] = []

    def put_outlined_text(
        image: PointArray,
        text_value: str,
        position: Tuple[int, int],
        color: Tuple[int, int, int],
        font_scale: float = 0.52,
    ) -> None:
        cv2.putText(
            image,
            text_value,
            position,
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            (0, 0, 0),
            4,
            cv2.LINE_AA,
        )
        cv2.putText(
            image,
            text_value,
            position,
            cv2.FONT_HERSHEY_SIMPLEX,
            font_scale,
            color,
            2,
            cv2.LINE_AA,
        )

    for piece in pieces:
        polygon = np.asarray(piece.polygon, dtype=np.float64)
        color = colors[piece.index % len(colors)]
        cv2.polylines(
            preview,
            [np.rint(polygon).astype(np.int32)],
            True,
            color,
            3,
            cv2.LINE_AA,
        )

        piece_edges = []
        polygon_center = np.mean(polygon, axis=0)
        for edge_index in range(len(polygon)):
            start = polygon[edge_index]
            end_point = polygon[(edge_index + 1) % len(polygon)]
            delta = end_point - start
            length_mm = math.hypot(
                float(delta[0]) / scale_x,
                float(delta[1]) / scale_y,
            )
            piece_edges.append(
                {
                    "edge_id": edge_index + 1,
                    "length_mm": round(float(length_mm), 2),
                }
            )

            midpoint = (start + end_point) * 0.5
            normal = np.array([-delta[1], delta[0]], dtype=np.float64)
            normal_length = float(np.linalg.norm(normal))
            if normal_length > 1e-9:
                normal /= normal_length
                # 标签尽量放到碎片外侧。
                if float(np.dot(normal, midpoint - polygon_center)) < 0.0:
                    normal = -normal
            label_point = midpoint + normal * 15.0
            label = f"{length_mm:.1f}mm"
            put_outlined_text(
                preview,
                label,
                tuple(np.rint(label_point).astype(int)),
                color,
            )

        center = tuple(np.rint(piece.center).astype(int))
        put_outlined_text(
            preview,
            f"P{piece.index + 1}",
            (center[0] - 18, center[1] + 7),
            color,
            font_scale=0.65,
        )
        measurements.append(
            {
                "piece_id": piece.index + 1,
                "edges": piece_edges,
            }
        )

    put_outlined_text(
        preview,
        "Piece edge lengths (mm) - press A to update",
        (18, 32),
        (255, 255, 255),
        font_scale=0.68,
    )
    return preview, measurements


def draw_motion_plan_preview(
    image: PointArray,
    pieces: Sequence[Piece],
    transforms: Dict[int, Transform],
    source_half: str,
    target_half: str,
) -> PointArray:
    """在整张 A4 图像上标注取料中心、运动方向和目标拼图。"""
    preview = image.copy()
    height, width = preview.shape[:2]
    colors = [
        (60, 180, 255),
        (80, 220, 100),
        (255, 120, 80),
        (210, 80, 220),
    ]

    # 半区分界线与说明。
    cv2.line(
        preview,
        (width // 2, 0),
        (width // 2, height - 1),
        (0, 220, 220),
        2,
        cv2.LINE_AA,
    )
    pick_x = 16 if source_half == "left" else width // 2 + 16
    place_x = 16 if target_half == "left" else width // 2 + 16
    cv2.putText(
        preview,
        "PICK AREA",
        (pick_x, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (80, 220, 255),
        2,
        cv2.LINE_AA,
    )
    cv2.putText(
        preview,
        "PLACE AREA",
        (place_x, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (100, 255, 120),
        2,
        cv2.LINE_AA,
    )

    overlay = preview.copy()
    for piece in pieces:
        color = colors[piece.index % len(colors)]
        source_pts = np.round(piece.polygon).astype(np.int32)
        target_poly = transforms[piece.index].apply(piece.polygon)
        target_pts = np.round(target_poly).astype(np.int32)
        source_center = piece.center
        target_center = transforms[piece.index].apply(piece.center.reshape(1, 2))[0]

        cv2.polylines(preview, [source_pts], True, color, 3, cv2.LINE_AA)
        cv2.fillPoly(overlay, [target_pts], color, cv2.LINE_AA)
        cv2.polylines(preview, [target_pts], True, (245, 245, 245), 2, cv2.LINE_AA)
        cv2.arrowedLine(
            preview,
            tuple(np.round(source_center).astype(int)),
            tuple(np.round(target_center).astype(int)),
            color,
            2,
            cv2.LINE_AA,
            tipLength=0.025,
        )
        draw_cross(preview, source_center, color)
        draw_cross(preview, target_center, (255, 255, 255))

        source_label = tuple(np.round(source_center + [-20, -12]).astype(int))
        target_label = tuple(np.round(target_center + [-28, 6]).astype(int))
        cv2.putText(
            preview,
            f"P{piece.index + 1}",
            source_label,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            color,
            2,
            cv2.LINE_AA,
        )
        cv2.putText(
            preview,
            f"P{piece.index + 1} {transforms[piece.index].angle_deg:+.1f}deg",
            target_label,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.48,
            (20, 20, 20),
            2,
            cv2.LINE_AA,
        )

    preview = cv2.addWeighted(overlay, 0.58, preview, 0.42, 0)
    # 重新画中心，防止透明叠加后不够醒目。
    for piece in pieces:
        target_center = transforms[piece.index].apply(piece.center.reshape(1, 2))[0]
        draw_cross(preview, piece.center, colors[piece.index % len(colors)])
        draw_cross(preview, target_center, (255, 255, 255))
    return preview


def draw_motion_plan_preview_real(
    real_image: PointArray,
    pieces: Sequence[Piece],
    transforms: Dict[int, Transform],
    source_half: str,
    target_half: str,
) -> PointArray:
    """第三问专用：使用透视矫正后的真实彩色碎片绘制搬运与拼图结果。

    识别、轮廓和坐标计算仍使用原来的黑白识别图；这里只替换结果页面的
    显示方式。每块碎片从 ``real_image`` 中按真实轮廓裁出，再按最终旋转和平移
    贴到目标半区，因此花色、文字、污点和真实亮度都会保留，不再使用纯色遮罩。
    """
    if real_image is None or real_image.size == 0:
        # 理论上C模式始终保留rectified；若上层未保留，安全回退到原预览。
        return draw_motion_plan_preview(
            real_image, pieces, transforms, source_half, target_half
        )

    preview = real_image.copy()
    height, width = preview.shape[:2]
    colors = [
        (60, 180, 255),
        (80, 220, 100),
        (255, 120, 80),
        (210, 80, 220),
    ]

    # 先把真实碎片纹理贴到目标位置，后续再画轮廓、箭头和文字。
    for piece in pieces:
        contour_i = np.asarray(piece.contour, dtype=np.int32)
        x, y, w, h = cv2.boundingRect(contour_i)
        if w <= 0 or h <= 0:
            continue

        patch = real_image[y : y + h, x : x + w].copy()
        local_mask = np.zeros((h, w), np.uint8)
        shifted_contour = contour_i.copy()
        shifted_contour[:, 0, 0] -= x
        shifted_contour[:, 0, 1] -= y
        cv2.drawContours(
            local_mask,
            [shifted_contour],
            -1,
            255,
            cv2.FILLED,
            cv2.LINE_8,
        )

        transform = transforms[piece.index]
        rotation = np.asarray(transform.rotation, dtype=np.float64)
        offset = rotation @ np.array(
            [float(x), float(y)], dtype=np.float64
        ) + np.asarray(transform.translation, dtype=np.float64)
        affine = np.array(
            [
                [rotation[0, 0], rotation[0, 1], offset[0]],
                [rotation[1, 0], rotation[1, 1], offset[1]],
            ],
            dtype=np.float32,
        )

        warped_patch = cv2.warpAffine(
            patch,
            affine,
            (width, height),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(0, 0, 0),
        )
        warped_mask = cv2.warpAffine(
            local_mask,
            affine,
            (width, height),
            flags=cv2.INTER_NEAREST,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=0,
        )
        selected = warped_mask > 0
        preview[selected] = warped_patch[selected]

    # 半区分界线与说明。
    cv2.line(
        preview,
        (width // 2, 0),
        (width // 2, height - 1),
        (0, 220, 220),
        2,
        cv2.LINE_AA,
    )
    pick_x = 16 if source_half == "left" else width // 2 + 16
    place_x = 16 if target_half == "left" else width // 2 + 16
    cv2.putText(
        preview,
        "PICK AREA",
        (pick_x, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (80, 220, 255),
        2,
        cv2.LINE_AA,
    )
    cv2.putText(
        preview,
        "PLACE AREA",
        (place_x, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (100, 255, 120),
        2,
        cv2.LINE_AA,
    )

    # 在真实图像上保留原来的轮廓、中心、运动箭头和角度信息。
    for piece in pieces:
        color = colors[piece.index % len(colors)]
        source_pts = np.round(piece.polygon).astype(np.int32)
        target_poly = transforms[piece.index].apply(piece.polygon)
        target_pts = np.round(target_poly).astype(np.int32)
        source_center = piece.center
        target_center = transforms[piece.index].apply(piece.center.reshape(1, 2))[0]

        cv2.polylines(preview, [source_pts], True, color, 3, cv2.LINE_AA)
        cv2.polylines(preview, [target_pts], True, color, 3, cv2.LINE_AA)
        cv2.arrowedLine(
            preview,
            tuple(np.round(source_center).astype(int)),
            tuple(np.round(target_center).astype(int)),
            color,
            2,
            cv2.LINE_AA,
            tipLength=0.025,
        )
        draw_cross(preview, source_center, color)
        draw_cross(preview, target_center, (255, 255, 255))

        source_label = tuple(np.round(source_center + [-20, -12]).astype(int))
        target_label = tuple(np.round(target_center + [-28, 6]).astype(int))
        cv2.putText(
            preview,
            f"P{piece.index + 1}",
            source_label,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            color,
            2,
            cv2.LINE_AA,
        )
        # 先画白色粗描边，防止文字被真实牌面花纹遮住。
        angle_text = f"P{piece.index + 1} {transforms[piece.index].angle_deg:+.1f}deg"
        cv2.putText(
            preview,
            angle_text,
            target_label,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.48,
            (255, 255, 255),
            4,
            cv2.LINE_AA,
        )
        cv2.putText(
            preview,
            angle_text,
            target_label,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.48,
            (20, 20, 20),
            2,
            cv2.LINE_AA,
        )

    return preview


def draw_source_preview(image: PointArray, pieces: Sequence[Piece]) -> PointArray:
    preview = image.copy()
    colors = [(60, 180, 255), (80, 220, 100), (255, 120, 80), (210, 80, 220)]
    for piece in pieces:
        color = colors[piece.index % len(colors)]
        cv2.polylines(
            preview,
            [np.round(piece.polygon).astype(np.int32)],
            True,
            color,
            3,
            cv2.LINE_AA,
        )
        for vertex_index, point in enumerate(piece.polygon):
            p = tuple(np.round(point).astype(int))
            cv2.circle(preview, p, 4, color, -1, cv2.LINE_AA)
            cv2.putText(
                preview,
                str(vertex_index),
                (p[0] + 5, p[1] - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                color,
                1,
                cv2.LINE_AA,
            )
        center = tuple(np.round(piece.center).astype(int))
        cv2.putText(
            preview,
            f"P{piece.index + 1}",
            (center[0] - 18, center[1] + 6),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            color,
            2,
            cv2.LINE_AA,
        )
    return preview


def draw_result_preview(
    pieces: Sequence[Piece],
    transforms: Dict[int, Transform],
    canvas_size: Tuple[int, int],
) -> PointArray:
    width, height = canvas_size
    preview = np.full((height, width, 3), 28, np.uint8)
    colors = [(60, 180, 255), (80, 220, 100), (255, 120, 80), (210, 80, 220)]
    for piece in pieces:
        poly = transforms[piece.index].apply(piece.polygon)
        pts = np.round(poly).astype(np.int32)
        color = colors[piece.index % len(colors)]
        cv2.fillPoly(preview, [pts], color, cv2.LINE_AA)
        cv2.polylines(preview, [pts], True, (245, 245, 245), 2, cv2.LINE_AA)
        target_center = transforms[piece.index].apply(piece.center.reshape(1, 2))[0]
        c = tuple(np.round(target_center).astype(int))
        cv2.putText(
            preview,
            f"P{piece.index + 1}",
            (c[0] - 18, c[1] + 7),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (20, 20, 20),
            2,
            cv2.LINE_AA,
        )
    return preview


def make_comparison_preview(
    source_preview: PointArray, result_preview: PointArray
) -> PointArray:
    """生成便于直接查看的“识别结果 | 拼接结果”并排图片。"""
    target_height = max(source_preview.shape[0], result_preview.shape[0])

    def fit_height(image: PointArray) -> PointArray:
        if image.shape[0] == target_height:
            return image
        scale = target_height / image.shape[0]
        width = int(round(image.shape[1] * scale))
        return cv2.resize(image, (width, target_height), interpolation=cv2.INTER_AREA)

    left = fit_height(source_preview)
    right = fit_height(result_preview)
    header_height = 42
    gap = 10
    canvas = np.full(
        (
            target_height + header_height,
            left.shape[1] + gap + right.shape[1],
            3,
        ),
        18,
        np.uint8,
    )
    canvas[header_height:, : left.shape[1]] = left
    canvas[
        header_height:,
        left.shape[1] + gap : left.shape[1] + gap + right.shape[1],
    ] = right
    cv2.putText(
        canvas,
        "Detected pieces",
        (16, 29),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.72,
        (240, 240, 240),
        2,
        cv2.LINE_AA,
    )
    cv2.putText(
        canvas,
        "Motion plan on other half",
        (left.shape[1] + gap + 16, 29),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.72,
        (240, 240, 240),
        2,
        cv2.LINE_AA,
    )
    return canvas


def placement_area_sort_key(item: dict) -> Tuple[float, int]:
    """
    机械臂搬运顺序排序键。

    第一关键字：识别轮廓面积 area_px2，从小到大；
    第二关键字：piece_id，从小到大，用于面积几乎相同时保持顺序稳定。
    """
    try:
        area_value = float(item.get("area_px2", float("inf")))
    except (TypeError, ValueError):
        area_value = float("inf")

    try:
        piece_id = int(item.get("piece_id", 0))
    except (TypeError, ValueError):
        piece_id = 0

    return area_value, piece_id


def sort_placements_small_to_large(
    placements: Sequence[dict],
) -> List[dict]:
    """
    返回按碎片面积从小到大排序的任务，并写入 move_order。

    move_order 从1开始，表示机械臂实际搬运次序。
    """
    ordered = sorted(
        (dict(item) for item in placements),
        key=placement_area_sort_key,
    )
    for order, item in enumerate(ordered, start=1):
        item["move_order"] = order
    return ordered


def make_report(
    image_path: Path,
    pieces: Sequence[Piece],
    candidate: Candidate,
    transforms: Dict[int, Transform],
    elapsed_seconds: float,
) -> dict:
    placements = []
    for piece in pieces:
        transform = transforms[piece.index]
        target_center = transform.apply(piece.center.reshape(1, 2))[0]
        placements.append(
            {
                "piece_id": piece.index + 1,
                "vertex_count": int(len(piece.polygon)),
                "area_px2": round(piece.area, 2),
                "source_center_px": [round(float(v), 2) for v in piece.center],
                "target_center_px": [round(float(v), 2) for v in target_center],
                "rotation_deg": round(float(transform.angle_deg), 3),
                "rotation_matrix": np.round(transform.rotation, 8).tolist(),
                "translation_px": [round(float(v), 3) for v in transform.translation],
            }
        )

    # 输出、显示和后续任务统一按面积从小到大排列。
    placements = sort_placements_small_to_large(placements)

    return {
        "input_image": str(image_path),
        "piece_count": len(pieces),
        "success": True,
        "rectangle_fill_ratio": round(candidate.fill_ratio, 6),
        "rectangle_aspect_ratio": round(candidate.aspect_ratio, 6),
        "search_score": round(candidate.score, 6),
        "elapsed_seconds": round(elapsed_seconds, 4),
        "coordinate_note": "图片坐标：左上角为原点，x向右，y向下；正角度表示图像坐标系顺时针",
        "placements": placements,
    }


def make_motion_report(
    image_path: Path,
    image: PointArray,
    pieces: Sequence[Piece],
    candidate: Candidate,
    transforms: Dict[int, Transform],
    source_half: str,
    target_half: str,
    elapsed_seconds: float,
    a4_width_mm: float,
    a4_height_mm: float,
    px_per_mm_x: float,
    px_per_mm_y: float,
    board_corners_in_source: PointArray,
) -> dict:
    """
    生成机器人取放所需的数据。

    rotation_deg 是“从当前姿态转到目标姿态”所需的相对角度，而不是碎片
    自身长边的绝对方向。正值表示图像坐标系中顺时针。
    """
    placements = []
    target_points = []
    for piece in pieces:
        transform = transforms[piece.index]
        target_points.append(transform.apply(piece.polygon))
        target_center = transform.apply(piece.center.reshape(1, 2))[0]
        source_mm = rectified_point_to_robot_mm(
            piece.center,
            image.shape,
            px_per_mm_x,
            px_per_mm_y,
            board_corners_in_source,
        )
        target_mm = rectified_point_to_robot_mm(
            target_center,
            image.shape,
            px_per_mm_x,
            px_per_mm_y,
            board_corners_in_source,
        )
        placements.append(
            {
                "piece_id": piece.index + 1,
                "vertex_count": int(len(piece.polygon)),
                "area_px2": round(piece.area, 2),
                "pick_center_px": [
                    round(float(piece.center[0]), 2),
                    round(float(piece.center[1]), 2),
                ],
                "pick_center_mm": [
                    round(source_mm[0], 3),
                    round(source_mm[1], 3),
                ],
                "rotation_deg": round(float(transform.angle_deg), 3),
                "place_center_px": [
                    round(float(target_center[0]), 2),
                    round(float(target_center[1]), 2),
                ],
                "place_center_mm": [
                    round(target_mm[0], 3),
                    round(target_mm[1], 3),
                ],
            }
        )

    # 机械臂实际搬运次序：面积最小的碎片优先，面积最大的最后搬运。
    placements = sort_placements_small_to_large(placements)

    all_target_points = np.vstack(target_points)
    target_min = np.min(all_target_points, axis=0)
    target_max = np.max(all_target_points, axis=0)
    middle_x = image.shape[1] * 0.5
    if target_half == "right":
        middle_clearance = target_min[0] - middle_x
    else:
        middle_clearance = middle_x - target_max[0]

    return {
        "input_image": str(image_path),
        "success": True,
        "piece_count": len(pieces),
        "move_order_rule": "area_px2 ascending (smallest piece first)",
        "source_half": source_half,
        "target_half": target_half,
        "a4_size_mm": [a4_width_mm, a4_height_mm],
        "image_size_px": [int(image.shape[1]), int(image.shape[0])],
        "middle_line_x_px": round(float(middle_x), 3),
        "required_middle_line_clearance_px": TARGET_HALF_MARGIN,
        "actual_middle_line_clearance_px": round(float(middle_clearance), 3),
        "target_puzzle_bbox_px": {
            "left": round(float(target_min[0]), 3),
            "top": round(float(target_min[1]), 3),
            "right": round(float(target_max[0]), 3),
            "bottom": round(float(target_max[1]), 3),
        },
        "rectangle_fill_ratio": round(candidate.fill_ratio, 6),
        "rectangle_aspect_ratio": round(candidate.aspect_ratio, 6),
        "elapsed_seconds": round(elapsed_seconds, 4),
        "coordinate_note": (
            "串口/毫米坐标以原始相机画面中A4右下角为原点；"
            "X轴沿A4右边缘向上，Y轴沿A4下边缘向左；"
            "rotation_deg为当前姿态到目标姿态的相对旋转，正值为顺时针"
        ),
        "robot_coordinate_system": {
            "origin": "A4 bottom-right corner in source camera view",
            "x_positive": "up along A4 right edge",
            "y_positive": "left along A4 bottom edge",
            "source_board_orientation": (
                "portrait"
                if source_board_is_portrait(board_corners_in_source)
                else "landscape"
            ),
        },
        "placements": placements,
    }


def write_motion_csv(csv_path: Path, report: dict) -> None:
    """把 JSON 中最常用的取放字段另存为便于串口/表格读取的 CSV。"""
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "move_order",
        "piece_id",
        "area_px2",
        "pick_x_px",
        "pick_y_px",
        "pick_x_mm",
        "pick_y_mm",
        "rotation_deg",
        "place_x_px",
        "place_y_px",
        "place_x_mm",
        "place_y_mm",
    ]
    with csv_path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for item in report["placements"]:
            writer.writerow(
                {
                    "move_order": item.get("move_order"),
                    "piece_id": item["piece_id"],
                    "area_px2": item.get("area_px2"),
                    "pick_x_px": item["pick_center_px"][0],
                    "pick_y_px": item["pick_center_px"][1],
                    "pick_x_mm": item["pick_center_mm"][0],
                    "pick_y_mm": item["pick_center_mm"][1],
                    "rotation_deg": item["rotation_deg"],
                    "place_x_px": item["place_center_px"][0],
                    "place_y_px": item["place_center_px"][1],
                    "place_x_mm": item["place_center_mm"][0],
                    "place_y_mm": item["place_center_mm"][1],
                }
            )


def collect_images(inputs: Sequence[str]) -> List[Path]:
    supported = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"}
    found: List[Path] = []
    for raw in inputs:
        path = Path(raw)
        if path.is_dir():
            found.extend(
                p for p in sorted(path.iterdir()) if p.suffix.lower() in supported
            )
        elif path.is_file() and path.suffix.lower() in supported:
            found.append(path)
        else:
            print(f"[跳过] 不是支持的图片：{path}", file=sys.stderr)
    return found


def read_image_unicode(
    image_path: Path, flags: int = cv2.IMREAD_COLOR
) -> Optional[PointArray]:
    """
    读取包含中文、空格等字符的 Windows 路径。

    Windows 下 cv2.imread() 可能无法打开中文路径，先由 NumPy 读取字节，
    再交给 OpenCV 解码可以避开该问题。
    """
    try:
        encoded_data = np.fromfile(str(image_path), dtype=np.uint8)
        if encoded_data.size == 0:
            return None
        return cv2.imdecode(encoded_data, flags)
    except (OSError, ValueError, cv2.error):
        return None


def write_image_unicode(image_path: Path, image: PointArray) -> bool:
    """保存到包含中文、空格等字符的 Windows 路径。"""
    try:
        image_path.parent.mkdir(parents=True, exist_ok=True)
        extension = image_path.suffix.lower() or ".png"
        success, encoded_data = cv2.imencode(extension, image)
        if not success:
            return False
        encoded_data.tofile(str(image_path))
        return True
    except (OSError, ValueError, cv2.error):
        return False


def choose_images_interactively() -> List[Path]:
    """没有命令行参数时，弹出系统文件选择窗口并只选择一张图片。"""
    try:
        import tkinter as tk
        from tkinter import filedialog

        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        selected = filedialog.askopenfilename(
            title="请选择一张需要拼接的图片",
            filetypes=[
                ("图片文件", "*.png *.jpg *.jpeg *.bmp *.tif *.tiff"),
                ("所有文件", "*.*"),
            ],
        )
        root.destroy()
        return [Path(selected)] if selected else []
    except Exception as exc:
        print(f"[提示] 无法打开图片选择窗口：{exc}", file=sys.stderr)
        return []


def resolve_input_images(inputs: Sequence[str]) -> List[Path]:
    """
    输入优先级：
    1. 命令行指定的图片或文件夹；
    2. 未指定时弹出系统窗口，并且一次只选择一张。
    """
    if inputs:
        return collect_images(inputs)

    print("[提示] 未指定图片，正在打开图片选择窗口……")
    return choose_images_interactively()


@dataclass
class BoardDetection:
    corners: PointArray
    rectified: PointArray
    recognition: PointArray
    binary_mask: PointArray
    divider_x: int
    px_per_mm_x: float
    px_per_mm_y: float
    overlay: PointArray


def order_quad_points(points: PointArray) -> PointArray:
    """把任意四边形顶点排成：左上、右上、右下、左下。"""
    pts = np.asarray(points, dtype=np.float32).reshape(4, 2)
    center = np.mean(pts, axis=0)
    angles = np.arctan2(pts[:, 1] - center[1], pts[:, 0] - center[0])
    pts = pts[np.argsort(angles)]
    start = int(np.argmin(np.sum(pts, axis=1)))
    pts = np.roll(pts, -start, axis=0)
    first = pts[1] - pts[0]
    second = pts[2] - pts[1]
    cross_value = first[0] * second[1] - first[1] * second[0]
    if cross_value < 0:
        pts = pts[[0, 3, 2, 1]]
    return pts.astype(np.float32)


def _quad_from_contour(contour: PointArray) -> Optional[PointArray]:
    hull = cv2.convexHull(contour)
    perimeter = cv2.arcLength(hull, True)
    for ratio in (0.015, 0.02, 0.025, 0.03, 0.04, 0.05):
        approx = cv2.approxPolyDP(hull, ratio * perimeter, True)
        if len(approx) == 4 and cv2.isContourConvex(approx):
            return order_quad_points(approx.reshape(4, 2))
    rect = cv2.minAreaRect(hull)
    box = cv2.boxPoints(rect)
    return order_quad_points(box)


def _quad_edge_contrast(
    frame: PointArray, ordered_quad: PointArray
) -> Tuple[float, int]:
    """评价候选四条边内暗外亮的程度，避免把黑纸内部阴影当成A4边界。"""
    height, width = frame.shape[:2]
    center = np.mean(ordered_quad, axis=0).astype(np.float64)
    sample_offset = max(3.0, min(width, height) * 0.010)
    contrasts = []
    valid_edges = 0

    for edge_index in range(4):
        start = ordered_quad[edge_index].astype(np.float64)
        end = ordered_quad[(edge_index + 1) % 4].astype(np.float64)
        midpoint = 0.5 * (start + end)
        inward = center - midpoint
        inward_length = float(np.linalg.norm(inward))
        if inward_length < 1e-9:
            continue
        inward /= inward_length
        edge_contrasts = []
        for position in np.linspace(0.12, 0.88, 9):
            point = start + position * (end - start)
            inside = point + inward * sample_offset
            outside = point - inward * sample_offset
            ix, iy = int(round(inside[0])), int(round(inside[1]))
            ox, oy = int(round(outside[0])), int(round(outside[1]))
            if not (
                0 <= ix < width
                and 0 <= iy < height
                and 0 <= ox < width
                and 0 <= oy < height
            ):
                continue
            inside_gray = (
                0.114 * float(frame[iy, ix, 0])
                + 0.587 * float(frame[iy, ix, 1])
                + 0.299 * float(frame[iy, ix, 2])
            )
            outside_gray = (
                0.114 * float(frame[oy, ox, 0])
                + 0.587 * float(frame[oy, ox, 1])
                + 0.299 * float(frame[oy, ox, 2])
            )
            edge_contrasts.append(outside_gray - inside_gray)
        if len(edge_contrasts) >= 4:
            valid_edges += 1
            # 中位数不受机械结构、碎屑或局部反光的单点影响。
            contrasts.append(float(np.median(edge_contrasts)))

    if not contrasts:
        return 0.0, 0
    return float(np.mean(contrasts)), valid_edges


def _refine_black_board_quad(
    frame: PointArray, initial_quad: PointArray
) -> PointArray:
    """
    在初始候选的透视小图中重新寻找黑纸真实外轮廓。

    当黑纸接近铺满摄像头画面时，最小旋转矩形可能越过纸边并包含一条白色
    外部区域。这里用最大暗色连通域把四条边向真实纸边收紧；若纸边超出画面，
    暗区会自然贴住预览边界，不会凭空缩小A4。
    """
    preview_width, preview_height = 450, 318
    destination = np.array(
        [
            [0, 0],
            [preview_width - 1, 0],
            [preview_width - 1, preview_height - 1],
            [0, preview_height - 1],
        ],
        dtype=np.float32,
    )
    initial = order_quad_points(initial_quad.astype(np.float32))
    matrix = cv2.getPerspectiveTransform(initial, destination)
    inverse_matrix = cv2.getPerspectiveTransform(destination, initial)
    preview = cv2.warpPerspective(frame, matrix, (preview_width, preview_height))
    gray = cv2.cvtColor(preview, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    threshold_masks = []
    _, otsu_dark = cv2.threshold(
        gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )
    threshold_masks.append(otsu_dark)
    for percentile in (55, 65, 75):
        threshold_value = float(np.percentile(gray, percentile))
        threshold_masks.append((gray < threshold_value).astype(np.uint8) * 255)

    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11))
    best_refined = None
    best_key = None
    preview_area = float(preview_width * preview_height)
    for dark in threshold_masks:
        dark = cv2.morphologyEx(dark, cv2.MORPH_CLOSE, close_kernel)
        dark = cv2.morphologyEx(
            dark,
            cv2.MORPH_OPEN,
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)),
        )
        contours, _ = cv2.findContours(
            dark, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        for contour in contours:
            contour_area = float(cv2.contourArea(contour))
            area_ratio = contour_area / max(preview_area, 1.0)
            if area_ratio < 0.62:
                continue
            hull = cv2.convexHull(contour)
            refined_preview = _quad_from_contour(hull)
            if refined_preview is None:
                continue
            refined_area = abs(float(cv2.contourArea(refined_preview)))
            refined_ratio = refined_area / max(preview_area, 1.0)
            if not 0.62 <= refined_ratio <= 1.04:
                continue
            # 优先保留覆盖充分且四角改动较小的候选。黑纸完全充满初始
            # 预览时，结果基本就是原四边形；出现白边时会自动向内收紧。
            corner_shift = float(
                np.mean(np.linalg.norm(refined_preview - destination, axis=1))
            )
            key = (area_ratio - 0.0015 * corner_shift, -corner_shift)
            if best_key is None or key > best_key:
                best_key = key
                best_refined = refined_preview.astype(np.float32)

    if best_refined is None:
        return initial

    source_points = cv2.perspectiveTransform(
        best_refined.reshape(1, 4, 2), inverse_matrix
    ).reshape(4, 2)
    refined = order_quad_points(source_points.astype(np.float32))
    initial_area = max(abs(float(cv2.contourArea(initial))), 1.0)
    refined_area = abs(float(cv2.contourArea(refined)))
    area_scale = refined_area / initial_area
    mean_shift = float(np.mean(np.linalg.norm(refined - initial, axis=1)))
    frame_diagonal = max(math.hypot(frame.shape[1], frame.shape[0]), 1.0)
    if not 0.62 <= area_scale <= 1.05 or mean_shift > 0.16 * frame_diagonal:
        return initial
    if _score_board_quad_candidate(frame, refined) is None:
        return initial
    return refined


def _line_angle_difference_deg(first: float, second: float) -> float:
    difference = abs(first - second) % 180.0
    return min(difference, 180.0 - difference)


def _mean_parallel_angle_deg(first: float, second: float) -> float:
    """计算无方向直线角度的平均值，正确处理 179° 和 1°。"""
    first_rad = math.radians(2.0 * first)
    second_rad = math.radians(2.0 * second)
    angle = 0.5 * math.degrees(
        math.atan2(
            math.sin(first_rad) + math.sin(second_rad),
            math.cos(first_rad) + math.cos(second_rad),
        )
    )
    return angle % 180.0


def _line_segment_parameters(
    segment: PointArray,
) -> Optional[Tuple[float, float, PointArray, PointArray, float]]:
    x1, y1, x2, y2 = map(float, segment)
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy)
    if length < 1e-9:
        return None
    direction = np.array([dx / length, dy / length], dtype=np.float64)
    normal = np.array([-direction[1], direction[0]], dtype=np.float64)
    angle = math.degrees(math.atan2(direction[1], direction[0])) % 180.0
    rho = float(np.dot(normal, np.array([x1, y1], dtype=np.float64)))
    return length, angle, direction, normal, rho


def _infinite_line_intersection(
    first: PointArray, second: PointArray
) -> Optional[PointArray]:
    x1, y1, x2, y2 = map(float, first)
    x3, y3, x4, y4 = map(float, second)
    matrix = np.array(
        [[x2 - x1, -(x4 - x3)], [y2 - y1, -(y4 - y3)]],
        dtype=np.float64,
    )
    if abs(float(np.linalg.det(matrix))) < 1e-8:
        return None
    vector = np.array([x3 - x1, y3 - y1], dtype=np.float64)
    parameter = float(np.linalg.solve(matrix, vector)[0])
    return np.array(
        [x1 + parameter * (x2 - x1), y1 + parameter * (y2 - y1)],
        dtype=np.float64,
    )


def _score_board_quad_candidate(
    frame: PointArray, quad: PointArray
) -> Optional[Tuple[float, dict]]:
    """
    对一个黑色A4候选四边形评分。

    评分不再把“面积最大”当作第一依据，避免暗光时把外部挡板、地面阴影
    或整幅画面误认为黑纸。优先考虑：A4比例、靠近画面中心、内部整体偏暗、
    以及合理的占画面比例。兼容黑纸几乎铺满画面的离线照片。
    """
    if frame is None or frame.size == 0:
        return None
    height, width = frame.shape[:2]
    ordered = order_quad_points(np.asarray(quad, dtype=np.float32))
    area = abs(float(cv2.contourArea(ordered)))
    area_ratio = area / max(float(width * height), 1.0)
    if not 0.045 <= area_ratio <= 1.04:
        return None

    side_lengths = np.linalg.norm(np.roll(ordered, -1, axis=0) - ordered, axis=1)
    first_size = float((side_lengths[0] + side_lengths[2]) * 0.5)
    second_size = float((side_lengths[1] + side_lengths[3]) * 0.5)
    if min(first_size, second_size) < 30.0:
        return None
    aspect_ratio = max(first_size, second_size) / max(min(first_size, second_size), 1.0)
    if not 1.12 <= aspect_ratio <= 1.85:
        return None

    center = np.mean(ordered, axis=0)
    center_distance = float(
        np.linalg.norm(center - np.array([width * 0.5, height * 0.5]))
        / max(math.hypot(width, height), 1.0)
    )

    preview_width, preview_height = 280, 198
    source = ordered if first_size >= second_size else ordered[[1, 2, 3, 0]]
    destination = np.array(
        [
            [0, 0],
            [preview_width - 1, 0],
            [preview_width - 1, preview_height - 1],
            [0, preview_height - 1],
        ],
        dtype=np.float32,
    )
    matrix = cv2.getPerspectiveTransform(source, destination)
    candidate = cv2.warpPerspective(frame, matrix, (preview_width, preview_height))
    gray = cv2.cvtColor(candidate, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(candidate, cv2.COLOR_BGR2HSV)
    interior = gray[8:-8, 8:-8]
    interior_saturation = hsv[8:-8, 8:-8, 1]
    mean_gray = float(np.mean(interior))
    dark_fraction = float(np.mean(interior < 120))
    mean_saturation = float(np.mean(interior_saturation))
    if dark_fraction < 0.52 or mean_gray > 150.0:
        return None

    aspect_score = math.exp(-10.0 * abs(math.log(aspect_ratio / math.sqrt(2.0))))
    center_score = math.exp(-15.0 * center_distance)
    if 0.07 <= area_ratio <= 0.45:
        area_score = 1.0
    elif area_ratio >= 0.68:
        # 离线近景照片中黑纸可能几乎铺满画面。
        area_score = 0.80
    elif 0.45 < area_ratio < 0.68:
        # 这一区间很容易是“黑纸+旁边挡板”的错误大矩形。
        area_score = 0.25
    else:
        area_score = 0.20
    dark_score = float(np.clip((dark_fraction - 0.55) / 0.40, 0.0, 1.0))
    mean_score = float(np.clip((140.0 - mean_gray) / 100.0, 0.0, 1.0))
    # 彩色挡板会有很高饱和度；暗光白平衡偏色时只轻度惩罚，不能硬拒绝。
    saturation_score = math.exp(-max(0.0, mean_saturation - 55.0) / 40.0)

    edge_contrast, valid_contrast_edges = _quad_edge_contrast(frame, ordered)
    # 纸边落在画面外时无法采样外侧，不作硬拒绝；能看到纸边时，内暗外亮
    # 的候选获得明显加分，从而压过黑纸内部阴影或偏大的旋转矩形。
    if valid_contrast_edges >= 2:
        boundary_score = float(np.clip((edge_contrast - 2.0) / 55.0, 0.0, 1.0))
    else:
        boundary_score = 0.35

    total_score = (
        4.0 * center_score
        + 3.0 * aspect_score
        + 2.0 * area_score
        + 2.0 * dark_score
        + mean_score
        + saturation_score
        + 2.5 * boundary_score
    )
    return total_score, {
        "area_ratio": area_ratio,
        "aspect_ratio": aspect_ratio,
        "center_distance": center_distance,
        "mean_gray": mean_gray,
        "dark_fraction": dark_fraction,
        "mean_saturation": mean_saturation,
        "edge_contrast": edge_contrast,
        "valid_contrast_edges": valid_contrast_edges,
        "boundary_score": boundary_score,
    }


def _detect_board_quad_candidates_from_lines(
    frame: PointArray, max_dimension: float = 900.0
) -> List[Tuple[float, PointArray]]:
    """从长直线组合产生黑色A4候选框。"""
    original_h, original_w = frame.shape[:2]
    scale = min(1.0, max_dimension / max(original_h, original_w))
    small = cv2.resize(frame, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    detector = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD)
    detected = detector.detect(gray)[0]
    if detected is None:
        return []

    height, width = gray.shape
    min_length = min(height, width) * 0.24
    segments = []
    for raw_segment in detected[:, 0, :]:
        parameters = _line_segment_parameters(raw_segment)
        if parameters is not None and parameters[0] >= min_length:
            segments.append((raw_segment.astype(np.float64), parameters))
    segments.sort(key=lambda item: item[1][0], reverse=True)
    segments = segments[:56]
    if len(segments) < 4:
        return []

    parallel_pairs = []
    for first_index in range(len(segments)):
        first_segment, first = segments[first_index]
        for second_index in range(first_index + 1, len(segments)):
            second_segment, second = segments[second_index]
            if _line_angle_difference_deg(first[1], second[1]) > 8.0:
                continue
            first_normal, first_rho = first[3].copy(), first[4]
            second_normal, second_rho = second[3].copy(), second[4]
            if float(np.dot(first_normal, second_normal)) < 0.0:
                second_normal = -second_normal
                second_rho = -second_rho
            separation = abs(second_rho - first_rho)
            if separation < min(height, width) * 0.15:
                continue

            direction = first[2]
            first_projection = sorted(
                (
                    float(np.dot(direction, first_segment[:2])),
                    float(np.dot(direction, first_segment[2:])),
                )
            )
            second_projection = sorted(
                (
                    float(np.dot(direction, second_segment[:2])),
                    float(np.dot(direction, second_segment[2:])),
                )
            )
            overlap = max(
                0.0,
                min(first_projection[1], second_projection[1])
                - max(first_projection[0], second_projection[0]),
            )
            smaller_span = min(
                first_projection[1] - first_projection[0],
                second_projection[1] - second_projection[0],
            )
            if smaller_span <= 1.0 or overlap < smaller_span * 0.35:
                continue
            parallel_pairs.append(
                (
                    first_segment,
                    second_segment,
                    _mean_parallel_angle_deg(first[1], second[1]),
                    separation,
                    first[0] + second[0],
                )
            )

    parallel_pairs.sort(key=lambda pair: -(pair[3] * 0.8 + pair[4] * 0.3))
    parallel_pairs = parallel_pairs[:84]
    candidates: List[Tuple[float, PointArray]] = []

    for first_index in range(len(parallel_pairs)):
        first_pair = parallel_pairs[first_index]
        for second_index in range(first_index + 1, len(parallel_pairs)):
            second_pair = parallel_pairs[second_index]
            angle_difference = _line_angle_difference_deg(first_pair[2], second_pair[2])
            if not 78.0 <= angle_difference <= 102.0:
                continue

            intersections = []
            for first_line in first_pair[:2]:
                for second_line in second_pair[:2]:
                    point = _infinite_line_intersection(first_line, second_line)
                    if point is not None:
                        intersections.append(point)
            if len(intersections) != 4:
                continue
            quad_small = order_quad_points(np.asarray(intersections, dtype=np.float32))
            area_ratio = abs(float(cv2.contourArea(quad_small))) / max(
                float(width * height), 1.0
            )
            if not 0.045 <= area_ratio <= 1.04:
                continue
            if (
                np.any(quad_small[:, 0] < -0.10 * width)
                or np.any(quad_small[:, 0] > 1.10 * width)
                or np.any(quad_small[:, 1] < -0.10 * height)
                or np.any(quad_small[:, 1] > 1.10 * height)
            ):
                continue
            quad = quad_small / scale
            scored = _score_board_quad_candidate(frame, quad)
            if scored is not None:
                candidates.append((scored[0], order_quad_points(quad)))

    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates


def _detect_board_quad_candidates_from_contours(
    frame: PointArray, max_dimension: float = 900.0
) -> List[Tuple[float, PointArray]]:
    """用多个暗色阈值产生候选框，补足直线被遮挡或出画的情况。"""
    original_h, original_w = frame.shape[:2]
    scale = min(1.0, max_dimension / max(original_h, original_w))
    small = cv2.resize(frame, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (7, 7), 0)
    height, width = gray.shape

    threshold_masks = []
    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    threshold_masks.append(otsu)
    for percentile in (25, 35, 45, 55):
        threshold_value = float(np.percentile(gray, percentile))
        threshold_masks.append((gray < threshold_value).astype(np.uint8) * 255)

    candidates: List[Tuple[float, PointArray]] = []
    close_size = max(7, int(round(min(height, width) * 0.012)) | 1)
    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (close_size, close_size))
    open_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))

    for dark in threshold_masks:
        dark = cv2.morphologyEx(dark, cv2.MORPH_CLOSE, close_kernel)
        dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, open_kernel)
        contours, _ = cv2.findContours(dark, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            if cv2.contourArea(contour) < height * width * 0.045:
                continue
            hull = cv2.convexHull(contour)
            quad_options = []
            contour_quad = _quad_from_contour(hull)
            if contour_quad is not None:
                quad_options.append(contour_quad)
            quad_options.append(order_quad_points(cv2.boxPoints(cv2.minAreaRect(hull))))
            for quad_small in quad_options:
                quad = quad_small / scale
                scored = _score_board_quad_candidate(frame, quad)
                if scored is not None:
                    candidates.append((scored[0], order_quad_points(quad)))

    candidates.sort(key=lambda item: item[0], reverse=True)
    deduplicated: List[Tuple[float, PointArray]] = []
    for item in candidates:
        quad = item[1]
        is_duplicate = False
        for existing in deduplicated:
            mean_distance = float(np.mean(np.linalg.norm(quad - existing[1], axis=1)))
            if mean_distance < 18.0:
                is_duplicate = True
                break
        if not is_duplicate:
            deduplicated.append(item)
        if len(deduplicated) >= 30:
            break
    return deduplicated


def _select_black_board_quad(frame: PointArray) -> PointArray:
    candidates = _detect_board_quad_candidates_from_contours(frame)
    candidates.extend(_detect_board_quad_candidates_from_lines(frame))
    if not candidates:
        raise ValueError("没有找到黑色 A4 工作区，请保证四个边角完整出现在画面中")
    candidates.sort(key=lambda item: item[0], reverse=True)
    initial = order_quad_points(candidates[0][1].astype(np.float32))
    return _refine_black_board_quad(frame, initial)


def _longest_bright_run_per_column(binary: PointArray) -> PointArray:
    height, width = binary.shape
    result = np.zeros(width, dtype=np.int32)
    for x in range(width):
        column = binary[:, x].astype(np.int16)
        changes = np.diff(np.concatenate(([0], column, [0])))
        starts = np.flatnonzero(changes == 1)
        ends = np.flatnonzero(changes == -1)
        if len(starts) and len(ends):
            count = min(len(starts), len(ends))
            result[x] = int(np.max(ends[:count] - starts[:count]))
    return result


def _detect_divider_x(rectified: PointArray) -> int:
    """
    在中央区域寻找竖向分界线。

    先用连续亮像素长度定位；当结果明显偏离中心时，再用长竖向形态学开运算
    去除碎片，仅保留贯穿大部分高度的细线。两种方法组合可避免大碎片被误认
    为分界线，同时兼容暗光下较弱的白线。
    """
    gray = cv2.cvtColor(rectified, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    height, width = gray.shape
    search_left = int(width * 0.38)
    search_right = int(width * 0.62)
    center_x = width * 0.5
    background = float(np.percentile(gray, 35))
    best = None
    for delta in (10.0, 15.0, 20.0, 28.0, 36.0, 45.0):
        threshold_value = min(210.0, background + delta)
        bright = (gray > threshold_value).astype(np.uint8)
        runs = _longest_bright_run_per_column(bright)
        for x in range(search_left, search_right):
            run = int(runs[x])
            score = run - 0.20 * abs(x - center_x)
            if best is None or score > best[0]:
                best = (score, x, run)
    run_x = width // 2 if best is None else int(best[1])

    vertical_length = max(31, int(round(height * 0.42))) | 1
    vertical_open = cv2.morphologyEx(
        gray,
        cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_RECT, (3, vertical_length)),
    )
    column_score = np.mean(vertical_open[:, search_left:search_right], axis=0).astype(
        np.float32
    )
    if column_score.size:
        column_score = cv2.GaussianBlur(
            column_score.reshape(1, -1), (0, 0), 2.0
        ).reshape(-1)
        x_values = np.arange(search_left, search_right, dtype=np.float32)
        column_score -= 0.015 * np.abs(x_values - center_x)
        opening_x = search_left + int(np.argmax(column_score))
    else:
        opening_x = width // 2

    # 正常结果应接近中线。只有连续亮线法明显跑偏时才用开运算结果替代，
    # 防止近景照片中竖直碎片边缘影响开运算。
    if abs(run_x - center_x) > width * 0.075:
        if abs(opening_x - center_x) < abs(run_x - center_x):
            return int(opening_x)
    if best is None or best[2] < height * 0.18:
        return int(opening_x)
    return int(run_x)


def _evaluate_piece_mask_candidate(
    gray: PointArray,
    candidate_mask: PointArray,
    x_offset: int,
    full_shape: Tuple[int, int],
) -> Tuple[float, PointArray, int]:
    """清理并评分某一半区的一种阈值结果；仅在连通域局部创建掩膜。"""
    full_height, full_width = full_shape
    component_count, labels, stats, _ = cv2.connectedComponentsWithStats(
        candidate_mask, connectivity=8
    )
    min_piece_area = full_height * full_width * MIN_PIECE_AREA_RATIO
    half_area = float(candidate_mask.shape[0] * candidate_mask.shape[1])
    accepted = []

    for label in range(1, component_count):
        x, y, width, height, area = map(int, stats[label])
        if area < min_piece_area or min(width, height) < 8:
            continue
        if area > half_area * 0.48:
            continue
        aspect = max(width, height) / max(min(width, height), 1)
        if aspect > 10.0:
            continue

        # 原版为每个连通域创建整张半区大小的component，容易造成内存峰值。
        # 这里只创建该连通域包围框大小的局部掩膜，轮廓结果完全一致。
        local_labels = labels[y : y + height, x : x + width]
        component = np.zeros((height, width), np.uint8)
        component[local_labels == label] = 255
        contours, _ = cv2.findContours(
            component, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        if not contours:
            continue
        contour = max(contours, key=cv2.contourArea)
        contour_area = float(cv2.contourArea(contour))
        hull = cv2.convexHull(contour)
        hull_area = max(float(cv2.contourArea(hull)), 1.0)
        solidity = contour_area / hull_area
        if solidity < 0.70:
            continue
        perimeter = cv2.arcLength(hull, True)
        # 不再用单一epsilon判断候选。只要某个尺度能稳定拟合成题目规定的
        # 3~5边形就保留，避免轻微模糊时把真实碎片误判成6~8边噪声。
        polygon_like = False
        for epsilon_ratio in (0.010, 0.014, 0.018, 0.024, 0.032, 0.042):
            approx = cv2.approxPolyDP(hull, epsilon_ratio * perimeter, True)
            poly = approx.reshape(-1, 2).astype(np.float64)
            poly = remove_nearly_collinear(poly, 8.0)
            poly = _remove_insignificant_piece_corners(poly)
            if 3 <= len(poly) <= 5:
                polygon_like = True
                break
        if not polygon_like:
            continue

        global_hull = hull.copy()
        global_hull[:, 0, 0] += x + x_offset
        global_hull[:, 0, 1] += y
        local_gray = gray[y : y + height, x : x + width]
        mean_brightness = float(cv2.mean(local_gray, mask=component)[0])
        accepted.append((int(area), global_hull, solidity, mean_brightness))

    accepted.sort(key=lambda item: item[0], reverse=True)
    discarded_area = 0
    if len(accepted) > 4:
        discarded_area = sum(item[0] for item in accepted[4:])
        accepted = accepted[:4]

    clean = np.zeros((full_height, full_width), np.uint8)
    for _, hull, _, _ in accepted:
        cv2.drawContours(clean, [hull], -1, 255, cv2.FILLED)

    count = len(accepted)
    total_area = float(sum(item[0] for item in accepted))
    area_ratio = total_area / max(half_area, 1.0)
    if 2 <= count <= 4:
        count_score = 18.0
    elif count == 1:
        count_score = 2.0
    else:
        count_score = -8.0 - 4.0 * abs(count - 3)
    if 0.035 <= area_ratio <= 0.45:
        area_score = 6.0
    else:
        area_score = -20.0 * min(abs(area_ratio - 0.15), 0.5)
    solidity_score = (
        3.0 * float(np.mean([item[2] for item in accepted])) if accepted else 0.0
    )
    brightness_score = (
        0.02 * float(np.mean([item[3] for item in accepted])) if accepted else 0.0
    )
    discard_penalty = 10.0 * discarded_area / max(half_area, 1.0)
    score = (
        count_score + area_score + solidity_score + brightness_score - discard_penalty
    )
    return score, clean, count


def _extract_white_piece_mask_fallback(
    rectified: PointArray, divider_x: int
) -> PointArray:
    """
    对左右半区逐个评估阈值候选，只保留当前最佳掩膜。

    阈值、形态学和评分与原版完全相同；原版会同时保存二十余张全尺寸掩膜，
    本版流式处理，显著降低暗光回退路径的内存峰值且不改变最终选择。
    """
    gray_full = cv2.cvtColor(rectified, cv2.COLOR_BGR2GRAY)
    gray_full = cv2.GaussianBlur(gray_full, (5, 5), 0)
    hsv_full = cv2.cvtColor(rectified, cv2.COLOR_BGR2HSV)
    value_full = hsv_full[:, :, 2]
    saturation_full = hsv_full[:, :, 1]
    full_height, full_width = gray_full.shape
    edge = max(5, int(round(min(full_width, full_height) * 0.010)))
    divider_band = max(4, int(round(full_width * 0.006)))

    half_ranges = [
        (edge, max(edge + 1, divider_x - divider_band)),
        (min(full_width - edge - 1, divider_x + divider_band), full_width - edge),
    ]
    close_kernel = np.ones((5, 5), np.uint8)
    open_kernel = np.ones((3, 3), np.uint8)
    best_key: Optional[Tuple[float, int]] = None
    best_clean: Optional[PointArray] = None

    def evaluate_raw(raw_mask: PointArray, gray: PointArray, x0: int) -> None:
        nonlocal best_key, best_clean
        mask = raw_mask
        mask[:edge, :] = 0
        mask[-edge:, :] = 0
        side_edge = max(2, edge // 2)
        mask[:, :side_edge] = 0
        mask[:, -side_edge:] = 0
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, close_kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, open_kernel)
        score, clean, count = _evaluate_piece_mask_candidate(
            gray, mask, x0, (full_height, full_width)
        )
        key = (score, count)
        if best_key is None or key > best_key:
            best_key = key
            best_clean = clean

    for x0, x1 in half_ranges:
        if x1 - x0 < full_width * 0.20:
            continue
        gray = gray_full[:, x0:x1]
        value = value_full[:, x0:x1]
        saturation = saturation_full[:, x0:x1]
        roi = gray[edge : full_height - edge, :]
        if roi.size == 0:
            continue
        background = float(np.percentile(roi, 35))
        bright = float(np.percentile(roi, 96))
        contrast = max(bright - background, 1.0)

        _, otsu_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        evaluate_raw(otsu_mask, gray, x0)

        for fraction in (0.28, 0.36, 0.44, 0.52, 0.60):
            threshold_value = background + fraction * contrast
            evaluate_raw(
                (gray > threshold_value).astype(np.uint8) * 255,
                gray,
                x0,
            )
            evaluate_raw(
                ((value > threshold_value) & (saturation < 170)).astype(np.uint8) * 255,
                gray,
                x0,
            )

    if best_clean is None:
        return np.zeros((full_height, full_width), np.uint8)
    return best_clean


def _extract_white_piece_mask(rectified: PointArray, divider_x: int) -> PointArray:
    """
    快速Otsu主路径。

    旧版先比较左右半区的白色像素总数，反光、分界线残留或局部亮斑可能让
    程序选错半区。新版分别清理和评价两侧的真实连通域，再按碎片数量、面积、
    凸度和亮度综合选边；置信度不足时仍进入原有多阈值回退。
    """
    gray = cv2.cvtColor(rectified, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    height, width = gray.shape
    divider_band = max(4, int(round(width * 0.006)))
    edge = max(5, int(round(min(width, height) * 0.010)))
    half_ranges = (
        (edge, max(edge + 1, divider_x - divider_band)),
        (min(width - edge - 1, divider_x + divider_band), width - edge),
    )
    close_kernel = np.ones((3, 3), np.uint8)
    open_kernel = np.ones((3, 3), np.uint8)
    fast_candidates = []

    # 同时测试整图Otsu和半区局部Otsu。前者快且边缘一致，后者可应对左右
    # 亮度不均；每次只保留清理后的结果，不增加明显内存峰值。
    _, global_otsu = cv2.threshold(
        gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )
    for x0, x1 in half_ranges:
        if x1 - x0 < width * 0.20:
            continue
        local_gray = gray[:, x0:x1]
        _, local_otsu = cv2.threshold(
            local_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )
        for raw in (global_otsu[:, x0:x1].copy(), local_otsu):
            raw[:edge, :] = 0
            raw[-edge:, :] = 0
            side_edge = max(2, edge // 2)
            raw[:, :side_edge] = 0
            raw[:, -side_edge:] = 0
            raw = cv2.morphologyEx(raw, cv2.MORPH_CLOSE, close_kernel)
            raw = cv2.morphologyEx(raw, cv2.MORPH_OPEN, open_kernel)
            score, clean, count = _evaluate_piece_mask_candidate(
                local_gray, raw, x0, (height, width)
            )
            fast_candidates.append((score, count, clean))

    if fast_candidates:
        fast_candidates.sort(key=lambda item: (item[0], item[1]), reverse=True)
        best_score, best_count, best_clean = fast_candidates[0]
        if 2 <= best_count <= 4 and best_score >= MIN_FAST_PIECE_MASK_SCORE:
            return best_clean
    return _extract_white_piece_mask_fallback(rectified, divider_x)


def detect_black_a4_board(
    frame: PointArray,
    rectified_width: int = DEFAULT_RECTIFIED_WIDTH,
    rectified_height: int = DEFAULT_RECTIFIED_HEIGHT,
    a4_width_mm: float = DEFAULT_A4_WIDTH_MM,
    a4_height_mm: float = DEFAULT_A4_HEIGHT_MM,
    retain_rectified: bool = True,
    retain_binary_mask: bool = True,
    create_overlay: bool = True,
) -> BoardDetection:
    """
    稳健定位黑色A4、透视矫正并提取黑底白碎片。

    UI拼图模式可不保留仅用于调试显示的rectified/binary/overlay大图，识别过程
    仍使用完整分辨率，结果和精度不变，但任务内存峰值明显更低。
    """
    if frame is None or frame.size == 0:
        raise ValueError("视频帧为空")

    corners = _select_black_board_quad(frame)
    tl, tr, br, bl = corners
    horizontal = 0.5 * (np.linalg.norm(tr - tl) + np.linalg.norm(br - bl))
    vertical = 0.5 * (np.linalg.norm(bl - tl) + np.linalg.norm(br - tr))

    if horizontal >= vertical:
        out_w, out_h = rectified_width, rectified_height
        destination = np.array(
            [
                [0, 0],
                [out_w - 1, 0],
                [out_w - 1, out_h - 1],
                [0, out_h - 1],
            ],
            dtype=np.float32,
        )
        matrix = cv2.getPerspectiveTransform(corners, destination)
        rectified = cv2.warpPerspective(frame, matrix, (out_w, out_h))
    else:
        portrait_w, portrait_h = rectified_height, rectified_width
        destination = np.array(
            [
                [0, 0],
                [portrait_w - 1, 0],
                [portrait_w - 1, portrait_h - 1],
                [0, portrait_h - 1],
            ],
            dtype=np.float32,
        )
        matrix = cv2.getPerspectiveTransform(corners, destination)
        portrait = cv2.warpPerspective(frame, matrix, (portrait_w, portrait_h))
        rectified = cv2.rotate(portrait, cv2.ROTATE_90_CLOCKWISE)
        del portrait
        out_w, out_h = rectified_width, rectified_height

    divider_x = _detect_divider_x(rectified)
    clean = _extract_white_piece_mask(rectified, divider_x)
    recognition = cv2.cvtColor(clean, cv2.COLOR_GRAY2BGR)

    if create_overlay:
        overlay = frame.copy()
        cv2.polylines(
            overlay,
            [np.rint(corners).astype(np.int32)],
            True,
            (0, 255, 0),
            6,
        )
        for index, point in enumerate(corners, start=1):
            p = tuple(np.rint(point).astype(int))
            cv2.circle(overlay, p, 10, (0, 0, 255), -1)
            cv2.putText(
                overlay,
                str(index),
                (p[0] + 12, p[1] - 8),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.0,
                (0, 0, 255),
                2,
                cv2.LINE_AA,
            )
    else:
        overlay = np.empty((0, 0, 3), dtype=np.uint8)

    stored_rectified = (
        rectified if retain_rectified else np.empty((0, 0, 3), dtype=np.uint8)
    )
    stored_binary = clean if retain_binary_mask else np.empty((0, 0), dtype=np.uint8)

    return BoardDetection(
        corners=corners,
        rectified=stored_rectified,
        recognition=recognition,
        binary_mask=stored_binary,
        divider_x=divider_x,
        px_per_mm_x=out_w / a4_width_mm,
        px_per_mm_y=out_h / a4_height_mm,
        overlay=overlay,
    )


def process_image(
    image_path: Path,
    output_dir: Path,
    a4_width_mm: float = DEFAULT_A4_WIDTH_MM,
    a4_height_mm: float = DEFAULT_A4_HEIGHT_MM,
    precomputed_board: Optional[BoardDetection] = None,
    save_debug_images: bool = False,
) -> Tuple[dict, PointArray]:
    """
    处理一张图片或已经由预览线程识别好的A4。

    加速路径：
    - 视频模式传入precomputed_board，直接复用预览线程的A4检测、透视矫正
      和二值掩膜，不再保存原始帧、重新读取、重新检测A4；
    - comparison_preview直接在内存中返回，显示线程不再从磁盘读取PNG；
    - 默认只保存JSON、CSV和一张08_comparison.png；
    - --save-debug-images时才保存全部中间图片。
    """
    start = time.perf_counter()

    if precomputed_board is None:
        image = read_image_unicode(image_path, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError(f"无法读取图片：{image_path}")
        board = detect_black_a4_board(
            image,
            a4_width_mm=a4_width_mm,
            a4_height_mm=a4_height_mm,
        )
        board_reused = False
    else:
        board = precomputed_board
        board_reused = True

    canonical = board.recognition
    pieces, mask = extract_pieces(canonical)
    # 机械臂只有平移和旋转能力：不尝试镜像/翻面拼法。
    candidate = solve_puzzle(pieces)
    effective_pieces = list(pieces)
    placed_transforms, _, source_half, target_half = place_solution_in_other_half(
        effective_pieces, candidate, canonical.shape
    )
    elapsed = time.perf_counter() - start

    source_preview = draw_source_preview(canonical, pieces)
    motion_preview = draw_motion_plan_preview(
        canonical, effective_pieces, placed_transforms, source_half, target_half
    )
    comparison_preview = make_comparison_preview(source_preview, motion_preview)
    report = make_motion_report(
        image_path,
        canonical,
        effective_pieces,
        candidate,
        placed_transforms,
        source_half,
        target_half,
        elapsed,
        a4_width_mm,
        a4_height_mm,
        board.px_per_mm_x,
        board.px_per_mm_y,
        board.corners,
    )
    report["calibration"] = {
        "coordinate_origin": "source-view A4 bottom-right; X up; Y left",
        "a4_size_mm": [a4_width_mm, a4_height_mm],
        "rectified_size_px": [canonical.shape[1], canonical.shape[0]],
        "px_per_mm_x": round(board.px_per_mm_x, 6),
        "px_per_mm_y": round(board.px_per_mm_y, 6),
        "mm_per_px_x": round(1.0 / board.px_per_mm_x, 6),
        "mm_per_px_y": round(1.0 / board.px_per_mm_y, 6),
        "divider_x_px": board.divider_x,
        "board_corners_in_source_px": np.round(board.corners, 3).tolist(),
    }
    report["performance"] = {
        "reused_preview_board": board_reused,
        "saved_debug_images": bool(save_debug_images),
    }
    report["non_overlap_gap"] = {
        "enabled": True,
        "initial_center_spacing_scale": PIECE_GAP_SCALE,
        "maximum_center_spacing_scale": MAX_PIECE_GAP_SCALE,
        "note": (
            "实际碎片不缩放；旋转角和整体拼图中心保持不变，"
            "仅将各碎片目标中心之间的距离轻微放大以形成缝隙"
        ),
    }
    flipped_piece_numbers = [piece_id + 1 for piece_id in candidate.flipped_piece_ids]
    report["requires_flip"] = bool(flipped_piece_numbers)
    report["flipped_piece_ids"] = flipped_piece_numbers
    for placement in report["placements"]:
        placement["flip_required"] = placement["piece_id"] in flipped_piece_numbers

    stem = image_path.stem
    case_dir = output_dir / stem
    case_dir.mkdir(parents=True, exist_ok=True)

    # 默认只写一张最终对比图，避免树莓派SD卡上的大量PNG/JPG编码与写入。
    comparison_path = case_dir / "08_comparison.png"
    if not write_image_unicode(comparison_path, comparison_preview):
        raise OSError(f"无法保存结果图片：{comparison_path}")

    # 只有明确开启调试保存时，才写全部中间结果。
    if save_debug_images:
        board_overlay_with_axes = draw_robot_coordinate_axes_on_source(
            board.overlay, board.corners
        )
        debug_images = {
            case_dir / "00_source_board_detection.jpg": board_overlay_with_axes,
            case_dir / "01_rectified_a4.jpg": board.rectified,
            case_dir / "02_recognition_input.png": canonical,
            case_dir / "03_binary_mask.png": mask,
            case_dir / "04_detected_pieces.png": source_preview,
            case_dir / "05_motion_plan.png": motion_preview,
        }
        for output_path, output_image in debug_images.items():
            if not write_image_unicode(output_path, output_image):
                raise OSError(f"无法保存调试图片：{output_path}")

    with (case_dir / "06_motion_plan.json").open("w", encoding="utf-8") as file:
        json.dump(report, file, ensure_ascii=False, indent=2)
    write_motion_csv(case_dir / "07_motion_plan.csv", report)

    mode_text = "复用预览A4" if board_reused else "重新检测A4"
    print(
        f"[成功] {image_path.name}: {len(pieces)} 块, "
        f"{source_half} -> {target_half}, "
        f"填充率={candidate.fill_ratio:.4f}, "
        f"长宽比={candidate.aspect_ratio:.3f}, "
        f"耗时={elapsed:.3f}s, {mode_text}"
    )
    if flipped_piece_numbers:
        print(
            "[警告] 以下碎片必须先翻面，不能仅靠平面旋转完成："
            + ", ".join(f"P{piece_id}" for piece_id in flipped_piece_numbers)
        )
    print("[搬运顺序] 按碎片面积从小到大：")
    for placement in report["placements"]:
        print(
            f"  第{placement['move_order']}个 -> "
            f"P{placement['piece_id']} "
            f"(面积={placement['area_px2']:.2f}px²): "
            f"抓取mm={placement['pick_center_mm']}, "
            f"旋转={placement['rotation_deg']:+.2f}°，"
            f"放置mm={placement['place_center_mm']}"
        )
    return report, comparison_preview


def _serial_scaled_int(value: float, scale: float, field_name: str) -> int:
    """把毫米或角度转换为协议要求的整数。"""
    numeric = float(value)
    if not math.isfinite(numeric):
        raise ValueError(f"{field_name} 不是有效数字：{value}")
    return int(round(numeric * scale))


def build_serial_task_packet(report: dict) -> str:
    """
    编码树莓派 -> STM32 简化协议。

    格式：
        P,数量,拾取X,拾取Y,放置X,放置Y,角度,...\n
    坐标单位为 0.1 mm，角度单位为 0.1°，所有字段均为整数。
    坐标为机械坐标：A4右下角原点，X向上，Y向左。
    各碎片任务按识别面积 area_px2 从小到大排列。
    """
    # 串口字段顺序就是机械臂执行顺序：
    # 面积最小的碎片先搬，面积最大的碎片最后搬。
    placements = sort_placements_small_to_large(report.get("placements", []))
    count = len(placements)
    if not 1 <= count <= 4:
        raise ValueError(f"串口协议只允许一次发送1~4片，当前为 {count} 片")

    fields: List[str] = ["P", str(count)]
    for item in placements:
        pick = item.get("pick_center_mm")
        place = item.get("place_center_mm")
        if not isinstance(pick, (list, tuple)) or len(pick) != 2:
            raise ValueError(f"P{item.get('piece_id')} 缺少 pick_center_mm")
        if not isinstance(place, (list, tuple)) or len(place) != 2:
            raise ValueError(f"P{item.get('piece_id')} 缺少 place_center_mm")

        values = (
            _serial_scaled_int(pick[0], 10.0, "pick_x_mm"),
            _serial_scaled_int(pick[1], 10.0, "pick_y_mm"),
            _serial_scaled_int(place[0], 10.0, "place_x_mm"),
            _serial_scaled_int(place[1], 10.0, "place_y_mm"),
            _serial_scaled_int(item["rotation_deg"], 10.0, "rotation_deg"),
        )
        fields.extend(str(value) for value in values)
    return ",".join(fields) + "\n"


class SerialTaskSender:
    """树莓派到 STM32 的 115200、8N1 串口发送器。"""

    def __init__(self, port: str, timeout: float = SERIAL_REPLY_TIMEOUT) -> None:
        self.port = port
        self.timeout = max(0.05, float(timeout))
        self._serial = None

    @property
    def is_open(self) -> bool:
        return self._serial is not None and bool(self._serial.is_open)

    def open(self) -> None:
        try:
            import serial  # type: ignore
        except ImportError as exc:
            raise RuntimeError("缺少 pyserial，请执行：pip install pyserial") from exc

        self._serial = serial.Serial(
            port=self.port,
            baudrate=SERIAL_BAUDRATE,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            timeout=self.timeout,
            write_timeout=self.timeout,
        )
        time.sleep(0.15)
        self._serial.reset_input_buffer()
        self._serial.reset_output_buffer()
        print(f"[串口] 已打开 {self.port}，{SERIAL_BAUDRATE} baud，8N1")

    def close(self) -> None:
        if self._serial is not None:
            try:
                self._serial.close()
            except Exception:
                pass
            finally:
                self._serial = None

    def send_report(self, report: dict) -> Tuple[bool, str, str]:
        """发送一次完整任务并等待 STM32 的 OK/ERR 回复，不自动重发。"""
        if not self.is_open:
            raise RuntimeError("串口未打开")

        packet = build_serial_task_packet(report)
        payload = packet.encode("ascii")
        self._serial.reset_input_buffer()
        written = self._serial.write(payload)
        self._serial.flush()
        if written != len(payload):
            return False, packet.rstrip("\n"), f"只写入 {written}/{len(payload)} 字节"

        raw_reply = self._serial.readline()
        reply = raw_reply.decode("ascii", errors="replace").strip().upper()
        if reply == "OK":
            return True, packet.rstrip("\n"), "OK"
        if reply == "ERR":
            return False, packet.rstrip("\n"), "ERR"
        if not reply:
            return False, packet.rstrip("\n"), "TIMEOUT"
        return False, packet.rstrip("\n"), f"UNKNOWN:{reply}"


# -------------------------- 第三问可调参数 ---------------------------
QUESTION3_MAX_STRICT_CANDIDATES = 12
QUESTION3_WIDE_BEAM_WIDTH = max(BEAM_FALLBACK_WIDTH, 132)
QUESTION3_WIDE_OPTIONS = max(BEAM_FALLBACK_OPTIONS, 72)

# 扣除扑克牌中央特殊花色区域，用于兼容红桃A、黑桃A和奇数牌中央单点花色。
POKER_CENTER_IGNORE_WIDTH_RATIO = 0.34
POKER_CENTER_IGNORE_HEIGHT_RATIO = 0.34

# 外白边检查：正确拼接后，牌面最外圈通常应接近白色。
POKER_OUTER_RING_RATIO = 0.080
POKER_WHITE_GRAY_THRESHOLD = 200
POKER_WHITE_SAT_THRESHOLD = 70

# 候选综合评分权重（越大越重要；最终总分越高越好）
POKER_WEIGHT_SYMMETRY = 0.62
POKER_WEIGHT_OUTER_WHITE = 0.28
POKER_WEIGHT_CORNER = 0.10


@dataclass
class PokerCandidateEvaluation:
    candidate: Candidate
    total_score: float
    symmetry_score: float
    outer_white_score: float
    corner_score: float
    confidence_note: str


# -------------------------- 通用辅助函数 -----------------------------
def _wrap_angle_deg_local(angle_deg: float) -> float:
    return (float(angle_deg) + 180.0) % 360.0 - 180.0


def _solve_puzzle_candidates_strict(
    pieces: Sequence[Piece],
    max_candidates: int = QUESTION3_MAX_STRICT_CANDIDATES,
    deadline: Optional[float] = None,
) -> List[Candidate]:
    """为第三问保留多个严格几何候选。

    这里故意只使用严格几何搜索，不直接把放宽搜索的大量勉强结果送去
    扑克判断，从而降低“本来唯一解却误判为多解”的风险。
    """
    if len(pieces) < 2:
        raise ValueError("至少需要两块碎片")

    unique: Dict[Tuple, Candidate] = {}
    strict_context = build_beam_search_context(pieces)
    anchors = _rank_anchors_by_edge_connectivity(pieces, strict_context)

    def candidate_signature(candidate: Candidate) -> Tuple:
        centers = []
        for piece in pieces:
            transform = candidate.transforms[piece.index]
            center = transform.apply(piece.center.reshape(1, 2))[0]
            angle = _wrap_angle_deg_local(transform.angle_deg)
            centers.append((piece.index, center, angle))
        centroid = np.mean([item[1] for item in centers], axis=0)

        signature_a = []
        signature_b = []
        for piece_id, center, angle in sorted(centers, key=lambda item: item[0]):
            dx = center[0] - centroid[0]
            dy = center[1] - centroid[1]
            signature_a.append(
                (
                    int(piece_id),
                    int(round(dx / 2.0)),
                    int(round(dy / 2.0)),
                    int(round(_wrap_angle_deg_local(angle) * 2.0)),
                )
            )
            signature_b.append(
                (
                    int(piece_id),
                    int(round((-dx) / 2.0)),
                    int(round((-dy) / 2.0)),
                    int(round(_wrap_angle_deg_local(angle + 180.0) * 2.0)),
                )
            )
        return min(tuple(signature_a), tuple(signature_b))

    def add_candidates(found: Sequence[Candidate]) -> None:
        for candidate in found:
            signature = candidate_signature(candidate)
            previous = unique.get(signature)
            if previous is None:
                unique[signature] = candidate
            else:
                better = min(
                    [previous, candidate],
                    key=lambda item: (
                        item.score,
                        -item.fill_ratio,
                        abs(item.aspect_ratio - 1.5),
                    ),
                )
                unique[signature] = better

    # 第一轮：与第二问相同的快速严格搜索，但遍历全部锚点并收集多解。
    for anchor in anchors:
        if deadline is not None and time.perf_counter() >= deadline:
            break
        found = _solve_puzzle_beam(
            pieces,
            beam_width=BEAM_SEARCH_WIDTH,
            options_per_state=BEAM_OPTIONS_PER_STATE,
            anchors=[anchor],
            context=strict_context,
            deadline=deadline,
        )
        if found:
            add_candidates(found)
        if len(unique) >= max_candidates:
            break

    # 第二轮：只有快速严格搜索已经发现至少两个不同解时，才加宽搜索。
    # 若快速搜索只有一个严格解，直接把它视为几何唯一解，避免为了“凑多解”
    # 额外搜索出大量边缘候选，也能明显降低树莓派运行负担。
    if 2 <= len(unique) < min(4, max_candidates):
        found = _run_beam_for_all_anchors(
            pieces,
            beam_width=QUESTION3_WIDE_BEAM_WIDTH,
            options_per_state=QUESTION3_WIDE_OPTIONS,
            context=strict_context,
            deadline=deadline,
        )
        if found:
            add_candidates(found)

    candidates = sorted(
        unique.values(),
        key=lambda item: (item.score, -item.fill_ratio, abs(item.aspect_ratio - 1.5)),
    )

    if not candidates:
        # 作为兜底，仍返回第二问单解，保证第三问至少能运行。
        return [solve_puzzle(pieces, absolute_deadline=deadline)]
    return candidates[:max_candidates]


def _extract_piece_patch_for_poker(
    rectified: PointArray,
    piece: Piece,
) -> Tuple[PointArray, PointArray, Tuple[int, int]]:
    full_mask = np.zeros(rectified.shape[:2], np.uint8)
    cv2.drawContours(full_mask, [piece.contour.astype(np.int32)], -1, 255, cv2.FILLED)
    x, y, w, h = cv2.boundingRect(piece.contour.astype(np.int32))
    patch = rectified[y : y + h, x : x + w].copy()
    mask = full_mask[y : y + h, x : x + w].copy()
    return patch, mask, (x, y)


def _render_candidate_card_preview(
    board: BoardDetection,
    pieces: Sequence[Piece],
    candidate: Candidate,
) -> Tuple[PointArray, PointArray]:
    """把一个候选结果渲染成规范朝向的彩色扑克牌预览图。"""
    normalized_transforms, _box, canvas_size = normalize_solution(pieces, candidate)
    canvas_w, canvas_h = canvas_size
    canvas = np.full((canvas_h, canvas_w, 3), 255, np.uint8)
    union_mask = np.zeros((canvas_h, canvas_w), np.uint8)

    for piece in pieces:
        patch, mask, (x0, y0) = _extract_piece_patch_for_poker(board.rectified, piece)
        transform = normalized_transforms[piece.index]
        rotation = transform.rotation.astype(np.float64)
        offset = rotation @ np.array([x0, y0], dtype=np.float64) + transform.translation
        affine = np.array(
            [
                [rotation[0, 0], rotation[0, 1], offset[0]],
                [rotation[1, 0], rotation[1, 1], offset[1]],
            ],
            dtype=np.float32,
        )
        warped_patch = cv2.warpAffine(
            patch,
            affine,
            (canvas_w, canvas_h),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(255, 255, 255),
        )
        warped_mask = cv2.warpAffine(
            mask,
            affine,
            (canvas_w, canvas_h),
            flags=cv2.INTER_NEAREST,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=0,
        )
        select = warped_mask > 0
        canvas[select] = warped_patch[select]
        union_mask = np.maximum(union_mask, warped_mask)

    if np.count_nonzero(union_mask) == 0:
        return canvas, union_mask

    x, y, w, h = cv2.boundingRect(union_mask)
    # 必须紧贴真实拼图区域裁剪，不能额外添加白色边距。否则外围白边评分
    # 会把程序生成的白色背景误认为扑克牌本身的白边。
    return (
        canvas[y : y + h, x : x + w].copy(),
        union_mask[y : y + h, x : x + w].copy(),
    )


def make_assembled_result_preview(
    card_image: PointArray,
    card_mask: PointArray,
    candidate: Candidate,
    canvas_width: int = 560,
    canvas_height: int = 460,
) -> PointArray:
    """把第三问使用实拍纹理拼成的完整矩形单独显示在结果画布中央。

    这里只负责结果显示，不改变候选选择、中心对称评分、放置规划、
    坐标换算或串口发送。
    """
    canvas_width = max(360, int(canvas_width))
    canvas_height = max(300, int(canvas_height))
    canvas = np.full((canvas_height, canvas_width, 3), 22, np.uint8)

    cv2.putText(
        canvas,
        "ASSEMBLED REAL IMAGE",
        (18, 34),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.78,
        (245, 245, 245),
        2,
        cv2.LINE_AA,
    )
    cv2.putText(
        canvas,
        f"fill={candidate.fill_ratio:.3f}  aspect={candidate.aspect_ratio:.3f}",
        (18, 62),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.52,
        (170, 220, 255),
        1,
        cv2.LINE_AA,
    )

    if not isinstance(card_image, np.ndarray) or card_image.size == 0:
        cv2.putText(
            canvas,
            "NO ASSEMBLED IMAGE",
            (canvas_width // 2 - 145, canvas_height // 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.72,
            (0, 0, 255),
            2,
            cv2.LINE_AA,
        )
        return canvas

    top = 82
    margin = 24
    available_w = max(1, canvas_width - 2 * margin)
    available_h = max(1, canvas_height - top - margin)
    source_h, source_w = card_image.shape[:2]
    scale = min(
        available_w / max(source_w, 1),
        available_h / max(source_h, 1),
    )
    scale = max(scale, 0.01)
    target_w = max(1, int(round(source_w * scale)))
    target_h = max(1, int(round(source_h * scale)))

    resized = cv2.resize(
        card_image,
        (target_w, target_h),
        interpolation=cv2.INTER_AREA if scale < 1.0 else cv2.INTER_LINEAR,
    )
    if isinstance(card_mask, np.ndarray) and card_mask.size > 0:
        resized_mask = cv2.resize(
            card_mask,
            (target_w, target_h),
            interpolation=cv2.INTER_NEAREST,
        )
    else:
        resized_mask = np.full((target_h, target_w), 255, np.uint8)

    x0 = (canvas_width - target_w) // 2
    y0 = top + (available_h - target_h) // 2
    region = canvas[y0 : y0 + target_h, x0 : x0 + target_w]
    select = resized_mask > 0
    region[select] = resized[select]
    cv2.rectangle(
        canvas,
        (max(0, x0 - 2), max(top, y0 - 2)),
        (
            min(canvas_width - 1, x0 + target_w + 1),
            min(canvas_height - 1, y0 + target_h + 1),
        ),
        (230, 230, 230),
        2,
        cv2.LINE_AA,
    )
    return canvas


def make_three_panel_preview(
    source_preview: PointArray,
    assembled_preview: PointArray,
    motion_preview: PointArray,
) -> PointArray:
    """生成“真实识别图 | 真实拼好图 | 搬运规划”三栏结果页面。"""
    images = [source_preview, assembled_preview, motion_preview]
    target_height = max(image.shape[0] for image in images)

    def fit_height(image: PointArray) -> PointArray:
        if image.shape[0] == target_height:
            return image
        scale = target_height / max(image.shape[0], 1)
        target_width = max(1, int(round(image.shape[1] * scale)))
        return cv2.resize(
            image,
            (target_width, target_height),
            interpolation=cv2.INTER_AREA if scale < 1.0 else cv2.INTER_LINEAR,
        )

    fitted = [fit_height(image) for image in images]
    labels = ["DETECTED REAL PIECES", "ASSEMBLED REAL IMAGE", "PLACEMENT PLAN"]
    header_height = 44
    gap = 10
    total_width = sum(image.shape[1] for image in fitted) + gap * 2
    canvas = np.full(
        (target_height + header_height, total_width, 3),
        18,
        np.uint8,
    )

    cursor_x = 0
    for image, label in zip(fitted, labels):
        image_width = image.shape[1]
        canvas[header_height:, cursor_x : cursor_x + image_width] = image
        cv2.putText(
            canvas,
            label,
            (cursor_x + 14, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (235, 235, 235),
            2,
            cv2.LINE_AA,
        )
        cursor_x += image_width + gap
    return canvas


def _white_ratio(image: PointArray, valid_mask: PointArray) -> float:
    if valid_mask is None or np.count_nonzero(valid_mask) == 0:
        return 0.0
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    white = (gray >= POKER_WHITE_GRAY_THRESHOLD) & (
        hsv[:, :, 1] <= POKER_WHITE_SAT_THRESHOLD
    )
    selected = valid_mask > 0
    return float(np.count_nonzero(white & selected)) / max(
        float(np.count_nonzero(selected)), 1.0
    )


def _make_outer_ring_mask(shape: Tuple[int, int]) -> PointArray:
    height, width = shape
    band = max(6, int(round(min(width, height) * POKER_OUTER_RING_RATIO)))
    band = min(band, max(6, min(width, height) // 5))
    ring = np.ones((height, width), np.uint8) * 255
    if width > 2 * band and height > 2 * band:
        ring[band : height - band, band : width - band] = 0
    return ring


def _make_center_ignore_mask(shape: Tuple[int, int]) -> PointArray:
    height, width = shape
    mask = np.ones((height, width), np.uint8) * 255
    half_w = max(2, int(round(width * POKER_CENTER_IGNORE_WIDTH_RATIO * 0.5)))
    half_h = max(2, int(round(height * POKER_CENTER_IGNORE_HEIGHT_RATIO * 0.5)))
    cx = width // 2
    cy = height // 2
    x0 = max(0, cx - half_w)
    x1 = min(width, cx + half_w)
    y0 = max(0, cy - half_h)
    y1 = min(height, cy + half_h)
    mask[y0:y1, x0:x1] = 0
    return mask


def _compute_symmetry_score(
    card_image: PointArray,
    card_mask: PointArray,
) -> float:
    gray = cv2.cvtColor(card_image, cv2.COLOR_BGR2GRAY)
    rotated_gray = cv2.rotate(gray, cv2.ROTATE_180)
    rotated_mask = cv2.rotate(card_mask, cv2.ROTATE_180)

    center_valid = _make_center_ignore_mask(gray.shape)
    # 只比较原图和旋转图都属于真实扑克牌的区域。
    real_card_valid = cv2.bitwise_and(card_mask, rotated_mask)
    valid_mask = cv2.bitwise_and(center_valid, real_card_valid)

    # 重点比较有图案的区域，减轻大面积白底对分数的干扰。
    content_mask = ((gray < 245) | (rotated_gray < 245)).astype(np.uint8) * 255
    combined_mask = cv2.bitwise_and(valid_mask, content_mask)
    if np.count_nonzero(combined_mask) < 0.012 * gray.size:
        combined_mask = valid_mask

    selected = combined_mask > 0
    if np.count_nonzero(selected) == 0:
        gray_score = 0.0
    else:
        gray_diff = np.abs(
            gray.astype(np.int16) - rotated_gray.astype(np.int16)
        ).astype(np.uint8)
        gray_score = 1.0 - float(np.mean(gray_diff[selected])) / 255.0

    edges = cv2.Canny(gray, 50, 140)
    rotated_edges = cv2.rotate(edges, cv2.ROTATE_180)
    edge_selected = valid_mask > 0
    if np.count_nonzero(edge_selected) == 0:
        edge_score = 0.0
    else:
        xor_value = cv2.bitwise_xor(edges, rotated_edges)
        edge_score = 1.0 - float(np.mean(xor_value[edge_selected])) / 255.0

    return float(np.clip(0.70 * gray_score + 0.30 * edge_score, 0.0, 1.0))


def _compute_corner_score(card_image: PointArray) -> float:
    """比较两组对角角标区域的180°一致性，优先关注非白色图案。"""
    height, width = card_image.shape[:2]
    corner_w = max(10, int(round(width * 0.28)))
    corner_h = max(10, int(round(height * 0.28)))

    gray = cv2.cvtColor(card_image, cv2.COLOR_BGR2GRAY)
    top_left = gray[:corner_h, :corner_w]
    bottom_right = cv2.rotate(
        gray[height - corner_h : height, width - corner_w : width],
        cv2.ROTATE_180,
    )
    top_right = gray[:corner_h, width - corner_w : width]
    bottom_left = cv2.rotate(
        gray[height - corner_h : height, :corner_w],
        cv2.ROTATE_180,
    )

    def pair_score(first: PointArray, second: PointArray) -> float:
        if first.shape != second.shape or first.size == 0:
            return 0.0
        selected = (first < 245) | (second < 245)
        if np.count_nonzero(selected) < 0.01 * first.size:
            selected = np.ones(first.shape, dtype=bool)
        diff = np.abs(first.astype(np.int16) - second.astype(np.int16))
        return float(np.clip(1.0 - np.mean(diff[selected]) / 255.0, 0.0, 1.0))

    return 0.65 * pair_score(top_left, bottom_right) + 0.35 * pair_score(
        top_right, bottom_left
    )


def _evaluate_poker_candidate(
    board: BoardDetection,
    pieces: Sequence[Piece],
    candidate: Candidate,
) -> PokerCandidateEvaluation:
    card_image, card_mask = _render_candidate_card_preview(board, pieces, candidate)
    if card_image.size == 0 or np.count_nonzero(card_mask) == 0:
        return PokerCandidateEvaluation(
            candidate=candidate,
            total_score=-1.0,
            symmetry_score=0.0,
            outer_white_score=0.0,
            corner_score=0.0,
            confidence_note="候选渲染失败",
        )

    ring_mask = _make_outer_ring_mask(card_image.shape[:2])

    # 只检查扑克牌真实外沿内侧，避免把候选画布的白色背景算成白边。
    erosion_size = max(1, int(round(min(card_image.shape[:2]) * 0.008)))
    kernel_size = erosion_size * 2 + 1
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    inner_card_mask = cv2.erode(card_mask, kernel, iterations=1)
    valid_outer_ring = cv2.bitwise_and(ring_mask, inner_card_mask)

    ring_pixels = max(float(np.count_nonzero(ring_mask)), 1.0)
    ring_coverage = float(np.count_nonzero(valid_outer_ring)) / ring_pixels
    ring_whiteness = _white_ratio(card_image, valid_outer_ring)
    outer_white = float(np.clip(0.86 * ring_whiteness + 0.14 * ring_coverage, 0.0, 1.0))

    symmetry = _compute_symmetry_score(card_image, card_mask)
    corner = _compute_corner_score(card_image)

    total = (
        POKER_WEIGHT_SYMMETRY * symmetry
        + POKER_WEIGHT_OUTER_WHITE * outer_white
        + POKER_WEIGHT_CORNER * corner
    )

    note_parts = []
    if outer_white < 0.72:
        note_parts.append("外白边较弱")
    if symmetry < 0.70:
        note_parts.append("中心对称较弱")
    if corner < 0.65:
        note_parts.append("角标一致性较弱")
    note = "；".join(note_parts) if note_parts else "正常"

    return PokerCandidateEvaluation(
        candidate=candidate,
        total_score=float(total),
        symmetry_score=float(symmetry),
        outer_white_score=float(outer_white),
        corner_score=float(corner),
        confidence_note=note,
    )


def select_candidate_question3(
    pieces: Sequence[Piece],
    board: BoardDetection,
) -> Candidate:
    candidates = _solve_puzzle_candidates_strict(
        pieces,
        max_candidates=QUESTION3_MAX_STRICT_CANDIDATES,
        deadline=None,
    )
    print(f"[第三问] 严格几何候选数：{len(candidates)}")

    evaluations = []
    for candidate in candidates:
        evaluations.append(_evaluate_poker_candidate(board, pieces, candidate))
    evaluations.sort(
        key=lambda item: (
            item.total_score,
            item.symmetry_score,
            item.outer_white_score,
            item.corner_score,
        ),
        reverse=True,
    )

    for index, evaluation in enumerate(evaluations[:8], start=1):
        print(
            f"[第三问候选{index}] 综合={evaluation.total_score:.4f}, "
            f"对称={evaluation.symmetry_score:.4f}, "
            f"外白边={evaluation.outer_white_score:.4f}, "
            f"角标={evaluation.corner_score:.4f}, "
            f"几何={evaluation.candidate.score:.4f}, 备注={evaluation.confidence_note}"
        )

    if not evaluations:
        print("[第三问] 没有得到扑克候选，回退到第二问结果。")
        return solve_puzzle(pieces)

    best = evaluations[0]
    if len(evaluations) >= 2:
        gap = best.total_score - evaluations[1].total_score
        if gap < 0.025:
            print(f"[第三问] 前两名得分接近（差值={gap:.4f}），建议重点核对结果图。")
        else:
            print(f"[第三问] 最优候选领先第二名 {gap:.4f}")

    print(
        "[第三问] 采用扑克判定最佳候选："
        f"综合={best.total_score:.4f}, 对称={best.symmetry_score:.4f}, "
        f"外白边={best.outer_white_score:.4f}, 角标={best.corner_score:.4f}"
    )
    return best.candidate


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="MJPG/图片中的黑色A4半区拼图：透视矫正、标定和取放规划"
    )
    parser.add_argument(
        "inputs",
        nargs="*",
        help=("一张或多张图片，也可以是包含图片的文件夹；填写图片时进入离线测试模式"),
    )
    parser.add_argument(
        "--source",
        default=None,
        help=(
            "视频源：USB摄像头编号（如0）或MJPG网址；未给图片和视频源时默认打开摄像头0"
        ),
    )
    parser.add_argument("--camera-width", type=int, default=1280)
    parser.add_argument("--camera-height", type=int, default=720)
    parser.add_argument("--camera-fps", type=float, default=30.0)
    parser.add_argument(
        "--process-interval",
        type=float,
        default=1.0,
        help="保留的兼容参数；当前版本启动自动识别一次，之后仅按S识别",
    )
    parser.add_argument(
        "--serial-port",
        default=DEFAULT_SERIAL_PORT,
        help=(
            "连接STM32的串口设备，树莓派默认 /dev/serial0；"
            "USB转串口常见为 /dev/ttyUSB0 或 /dev/ttyACM0"
        ),
    )
    parser.add_argument(
        "--serial-timeout",
        type=float,
        default=SERIAL_REPLY_TIMEOUT,
        help="等待STM32回复OK/ERR的超时秒数，默认0.05",
    )
    parser.add_argument(
        "--no-serial",
        action="store_true",
        help="不打开串口，仅运行原V3视觉程序",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="a4_half_results",
        help="结果目录，默认 a4_half_results",
    )
    parser.add_argument(
        "--a4-width-mm",
        type=float,
        default=DEFAULT_A4_WIDTH_MM,
        help="整张图像对应的A4宽度，默认297 mm",
    )
    parser.add_argument(
        "--a4-height-mm",
        type=float,
        default=DEFAULT_A4_HEIGHT_MM,
        help="整张图像对应的A4高度，默认210 mm",
    )
    parser.add_argument(
        "--no-display",
        action="store_true",
        help="不弹出结果窗口（在无桌面的服务器上运行时使用）",
    )
    parser.add_argument(
        "--save-debug-images",
        action="store_true",
        help=(
            "保存A4检测、矫正图、掩膜等全部中间图片；"
            "默认只保存JSON、CSV和08_comparison.png以提高速度"
        ),
    )
    return parser.parse_args()


def open_mjpg_stream(
    source: str, width: int, height: int, fps: float
) -> cv2.VideoCapture:
    """树莓派优先使用V4L2，并打印摄像头打开全过程。"""
    actual_source: object = int(source) if source.strip().isdigit() else source
    trace_log("摄像头", f"准备打开 source={source!r}，请求={width}x{height}@{fps:.1f}")
    if os.name == "posix":
        nodes = sorted(glob.glob("/dev/video*"))
        trace_log("摄像头", f"当前视频节点={nodes if nodes else '无'}")

    attempts: List[Tuple[str, int]]
    if isinstance(actual_source, int) and os.name == "posix":
        attempts = [("V4L2", cv2.CAP_V4L2), ("DEFAULT", cv2.CAP_ANY)]
    else:
        attempts = [("DEFAULT", cv2.CAP_ANY)]

    errors: List[str] = []
    for backend_name, backend in attempts:
        capture: Optional[cv2.VideoCapture] = None
        try:
            trace_log("摄像头", f"尝试后端={backend_name}")
            capture = cv2.VideoCapture(actual_source, backend)
            if isinstance(actual_source, int):
                capture.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
                capture.set(cv2.CAP_PROP_FRAME_WIDTH, width)
                capture.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
                capture.set(cv2.CAP_PROP_FPS, fps)
                capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            if not capture.isOpened():
                errors.append(f"{backend_name}: isOpened=False")
                trace_log("摄像头", f"{backend_name} 打开失败")
                capture.release()
                continue

            first_ok = False
            for index in range(15):
                ok, frame = capture.read()
                if ok and frame is not None and frame.size > 0:
                    trace_log("摄像头", f"预热第{index + 1}帧成功，shape={frame.shape}")
                    first_ok = True
                    break
                time.sleep(0.04)
            if not first_ok:
                errors.append(f"{backend_name}: opened but no valid frame")
                trace_log("摄像头", f"{backend_name} 已打开但读不到有效帧")
                capture.release()
                continue

            _set_active_capture(capture)
            try:
                backend_actual = capture.getBackendName()
            except Exception:
                backend_actual = backend_name
            actual_w = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
            actual_h = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
            actual_fps = float(capture.get(cv2.CAP_PROP_FPS))
            trace_log(
                "摄像头已打开",
                f"backend={backend_actual}，实际={actual_w}x{actual_h}@{actual_fps:.2f}",
            )
            return capture
        except Exception as exc:
            errors.append(f"{backend_name}: {exc!r}")
            trace_log("摄像头异常", f"{backend_name}: {exc!r}")
            if capture is not None:
                try:
                    capture.release()
                except Exception:
                    pass

    raise OSError(
        f"无法打开视频源：{source}；"
        + "; ".join(errors)
        + "。可执行 sudo fuser -v /dev/video* 检查占用。"
    )


def process_board_in_memory(
    board: BoardDetection,
    scene_name: str,
    a4_width_mm: float = DEFAULT_A4_WIDTH_MM,
    a4_height_mm: float = DEFAULT_A4_HEIGHT_MM,
    candidate_selector: Optional[
        Callable[[Sequence[Piece], BoardDetection], Candidate]
    ] = None,
    use_real_texture_preview: bool = False,
    pieces_detected_callback: Optional[Callable[[PointArray, int], None]] = None,
    show_assembled_only: bool = False,
) -> Tuple[dict, PointArray]:
    """
    直接处理按钮按下瞬间的A4识别结果，不向磁盘保存图片、JSON或CSV。

    该函数与原 process_image() 使用完全相同的碎片识别、拼图、放置规划、
    坐标换算和串口报告生成逻辑，只省略文件写入，适合单窗口UI实时运行。
    """
    start = time.perf_counter()
    canonical = board.recognition
    pieces, _mask = extract_pieces(canonical)
    del _mask
    contour_summary = []
    for piece in pieces:
        edge_lengths = [length for _, _, _, length in edges(piece.polygon)]
        contour_summary.append(
            f"P{piece.index + 1}:{len(piece.polygon)}边/"
            + "-".join(f"{length:.1f}" for length in edge_lengths)
        )
    trace_log("碎片轮廓", "；".join(contour_summary) + "（像素）")

    # A/B/C在完成碎片识别后都先把真实碎片显示到UI，然后才继续拼图。
    # 这里只增加显示阶段，不修改A4识别、碎片轮廓、几何搜索或中心对称逻辑。
    if pieces_detected_callback is not None:
        rectified_available = (
            isinstance(board.rectified, np.ndarray) and board.rectified.size > 0
        )
        preview_source = board.rectified if rectified_available else canonical
        detected_preview = draw_source_preview(preview_source, pieces)
        pieces_detected_callback(detected_preview, len(pieces))

        # A/B最终结果仍沿用原来的几何遮罩显示，因此真实矫正图在中间预览
        # 发布后即可释放；C还要用它进行中心对称评分和真实纹理结果渲染。
        if rectified_available and not use_real_texture_preview:
            board.rectified = np.empty((0, 0, 3), dtype=np.uint8)

    # A/B继续使用原来的几何拼图；C只替换“多个几何候选中的最终选择”逻辑。
    # A4定位、透视矫正、碎片掩膜、轮廓提取和后续搬运规划全部共用原流程。
    if candidate_selector is None:
        candidate = solve_puzzle(pieces)
    else:
        candidate = candidate_selector(pieces, board)
    effective_pieces = list(pieces)
    placed_transforms, _, source_half, target_half = place_solution_in_other_half(
        effective_pieces, candidate, canonical.shape
    )
    elapsed = time.perf_counter() - start

    # A/B保持原来的遮罩预览；C仅在结果页面改用真实彩色图像。
    # 拼图选择、中心对称评分、坐标和串口数据都不受此显示切换影响。
    real_preview_available = (
        use_real_texture_preview
        and isinstance(board.rectified, np.ndarray)
        and board.rectified.size > 0
    )
    if real_preview_available:
        # 第三问最终结果使用同一套真实纹理渲染函数。根据UI模式可以只显示
        # 拼好的完整牌面；运动规划仍照常计算并用于报告和串口发送。
        assembled_card, assembled_mask = _render_candidate_card_preview(
            board, effective_pieces, candidate
        )
        assembled_preview = make_assembled_result_preview(
            assembled_card, assembled_mask, candidate
        )
        if show_assembled_only:
            comparison_preview = assembled_preview.copy()
        else:
            source_preview = draw_source_preview(board.rectified, pieces)
            motion_preview = draw_motion_plan_preview_real(
                board.rectified,
                effective_pieces,
                placed_transforms,
                source_half,
                target_half,
            )
            comparison_preview = make_three_panel_preview(
                source_preview, assembled_preview, motion_preview
            )
            del source_preview, motion_preview
        del assembled_card, assembled_mask, assembled_preview
    else:
        source_preview = draw_source_preview(canonical, pieces)
        motion_preview = draw_motion_plan_preview(
            canonical,
            effective_pieces,
            placed_transforms,
            source_half,
            target_half,
        )
        comparison_preview = make_comparison_preview(source_preview, motion_preview)
        del source_preview, motion_preview

    report = make_motion_report(
        Path(scene_name),
        canonical,
        effective_pieces,
        candidate,
        placed_transforms,
        source_half,
        target_half,
        elapsed,
        a4_width_mm,
        a4_height_mm,
        board.px_per_mm_x,
        board.px_per_mm_y,
        board.corners,
    )
    report["calibration"] = {
        "coordinate_origin": "source-view A4 bottom-right; X up; Y left",
        "a4_size_mm": [a4_width_mm, a4_height_mm],
        "rectified_size_px": [canonical.shape[1], canonical.shape[0]],
        "px_per_mm_x": round(board.px_per_mm_x, 6),
        "px_per_mm_y": round(board.px_per_mm_y, 6),
        "mm_per_px_x": round(1.0 / board.px_per_mm_x, 6),
        "mm_per_px_y": round(1.0 / board.px_per_mm_y, 6),
        "divider_x_px": board.divider_x,
        "board_corners_in_source_px": np.round(board.corners, 3).tolist(),
    }
    report["performance"] = {
        "ui_in_memory": True,
        "saved_files": False,
        "real_texture_result_preview": bool(real_preview_available),
        "assembled_real_image_panel": bool(real_preview_available),
    }
    report["candidate_selection_mode"] = (
        "question3_poker_symmetry"
        if candidate_selector is not None
        else "question2_geometry"
    )
    report["non_overlap_gap"] = {
        "enabled": True,
        "initial_center_spacing_scale": PIECE_GAP_SCALE,
        "maximum_center_spacing_scale": MAX_PIECE_GAP_SCALE,
        "note": (
            "实际碎片不缩放；旋转角和整体拼图中心保持不变，"
            "仅将各碎片目标中心之间的距离轻微放大以形成缝隙"
        ),
    }

    flipped_piece_numbers = [piece_id + 1 for piece_id in candidate.flipped_piece_ids]
    report["requires_flip"] = bool(flipped_piece_numbers)
    report["flipped_piece_ids"] = flipped_piece_numbers
    for placement in report["placements"]:
        placement["flip_required"] = placement["piece_id"] in flipped_piece_numbers

    print(
        f"[UI成功] {scene_name}: {len(pieces)}块, "
        f"{source_half}->{target_half}, "
        f"填充率={candidate.fill_ratio:.4f}, "
        f"长宽比={candidate.aspect_ratio:.3f}, "
        f"耗时={elapsed:.3f}s"
    )
    print("[搬运顺序] 按碎片面积从小到大：")
    for placement in report["placements"]:
        print(
            f"  第{placement['move_order']}个 -> "
            f"P{placement['piece_id']} "
            f"(面积={placement['area_px2']:.2f}px²): "
            f"抓取mm={placement['pick_center_mm']}, "
            f"旋转={placement['rotation_deg']:+.2f}°，"
            f"放置mm={placement['place_center_mm']}"
        )
    return report, comparison_preview


def run_video_stream(args: argparse.Namespace, output_dir: Path) -> int:
    """
    单程序 Tkinter UI：摄像头、识别、拼图、串口和界面全部在本文件中。

    运行规则：
    - 启动后只显示原始MJPG画面，不检测A4、不识别碎片；
    - 点击A或B时，截取当前帧并执行原来的几何拼图程序；
    - 点击C时，A4和碎片识别完全不变，使用第三问扑克中心对称/外围白边逻辑选择拼法；
    - 点击“调试”时，只识别A4并测量碎片边长，不拼图、不发串口；
    - 识别和求解在后台线程执行，视频和窗口不会卡死；
    - UI模式所有结果只保存在内存，不写入设备磁盘。
    """
    try:
        import tkinter as tk
        from tkinter import messagebox, font as tkfont
        from PIL import Image, ImageTk
    except Exception as exc:
        raise RuntimeError(
            "单窗口UI需要 tkinter 和 Pillow。请安装 Pillow：pip install pillow"
        ) from exc

    source = args.source if args.source is not None else DEFAULT_CAMERA_SOURCE
    trace_log("UI主流程", f"开始运行，PID={os.getpid()}，source={source}")
    capture = open_mjpg_stream(
        source, args.camera_width, args.camera_height, args.camera_fps
    )

    serial_sender: Optional[SerialTaskSender] = None
    serial_state = {"offline_reason": ""}
    if not args.no_serial:
        candidate_sender = SerialTaskSender(args.serial_port, args.serial_timeout)
        try:
            candidate_sender.open()
            serial_sender = candidate_sender
        except Exception as exc:
            serial_state["offline_reason"] = str(exc)
            candidate_sender.close()
            print(f"[串口不可用] {args.serial_port}: {exc}", file=sys.stderr)
            print("[继续运行] 串口打不开不影响视觉和UI。", file=sys.stderr)

    state_lock = threading.Lock()
    stop_event = threading.Event()
    processing_event = threading.Event()
    camera_state: Dict[str, object] = {
        "frame": None,
        "frame_id": 0,
        "error": "",
        "failed_reads": 0,
    }
    ui_state: Dict[str, object] = {
        "view": "live",  # live / result
        "result_image": None,
        "result_id": 0,
        "result_kind": "",
        "success": 0,
    }

    def camera_worker() -> None:
        """只读取MJPG视频；退出时先结束本线程，再释放VideoCapture。"""
        trace_log("摄像头线程", "线程启动")
        target_interval = 1.0 / max(5.0, min(UI_CAMERA_MAX_FPS, args.camera_fps))
        read_count = 0
        try:
            while not stop_event.is_set():
                loop_start = time.perf_counter()

                if processing_event.is_set():
                    # 求解期间仅grab；增加短暂睡眠，避免树莓派CPU满载。
                    ok = capture.grab()
                    if not ok and not stop_event.is_set():
                        time.sleep(0.02)
                    else:
                        time.sleep(0.005)
                    continue

                ok, frame = capture.read()
                if stop_event.is_set():
                    break
                if not ok or frame is None:
                    with state_lock:
                        failed = int(camera_state["failed_reads"]) + 1
                        camera_state["failed_reads"] = failed
                        if failed >= 30:
                            camera_state["error"] = "连续30帧读取失败，视频流可能已断开"
                    if failed in (1, 10, 30):
                        trace_log("摄像头线程", f"读取失败累计={failed}")
                    time.sleep(0.02)
                    continue
                read_count += 1
                with state_lock:
                    camera_state["frame"] = frame
                    camera_state["frame_id"] = int(camera_state["frame_id"]) + 1
                    camera_state["failed_reads"] = 0
                    camera_state["error"] = ""
                if read_count == 1:
                    trace_log("摄像头线程", f"第一帧进入UI，shape={frame.shape}")

                remaining = target_interval - (time.perf_counter() - loop_start)
                if remaining > 0:
                    time.sleep(remaining)
        except Exception as exc:
            trace_log("摄像头线程异常", repr(exc))
            traceback.print_exc()
        finally:
            trace_log("摄像头线程", f"线程退出，累计有效帧={read_count}")

    camera_thread = threading.Thread(
        target=camera_worker,
        name="mjpg-camera-reader",
        daemon=True,
    )
    camera_thread.start()

    root = tk.Tk()
    root.title("E题拼图装置")
    root.configure(bg="#f2f2f2")

    # Windows 和树莓派分别选择可用字体。直接写死 Microsoft YaHei 时，
    # 树莓派没有该字体会把中文显示成一排问号。
    available_fonts = set(tkfont.families(root))
    default_font_family = str(tkfont.nametofont("TkDefaultFont").actual("family"))
    ui_font_family = default_font_family
    for font_candidate in (
        "Microsoft YaHei",
        "Noto Sans CJK SC",
        "Noto Sans CJK TC",
        "WenQuanYi Micro Hei",
        "WenQuanYi Zen Hei",
        "SimHei",
        "Arial Unicode MS",
    ):
        if font_candidate in available_fonts:
            ui_font_family = font_candidate
            break

    # 根据实际屏幕尺寸自适应。树莓派常用的 800×480 屏幕不能设置
    # 820×620 这样的最小窗口，否则按钮会被挤到屏幕外面。
    screen_w = max(int(root.winfo_screenwidth()), 480)
    screen_h = max(int(root.winfo_screenheight()), 320)
    compact_ui = screen_w < 1000 or screen_h < 700

    window_w = min(1280, max(480, int(screen_w * 0.98)))
    window_h = min(900, max(320, int(screen_h * 0.96)))
    window_w = min(window_w, screen_w)
    window_h = min(window_h, screen_h)
    pos_x = max((screen_w - window_w) // 2, 0)
    pos_y = max((screen_h - window_h) // 2, 0)
    root.geometry(f"{window_w}x{window_h}+{pos_x}+{pos_y}")

    # 最小尺寸永远不超过当前屏幕，防止小屏幕上窗口被系统强制放大。
    root.minsize(
        min(640, screen_w),
        min(400, screen_h),
    )

    outer_pad = 8 if compact_ui else 18
    title_font_size = 11 if compact_ui else 16
    button_font_size = 14 if compact_ui else 20
    status_font_size = 9 if compact_ui else 12
    title_pad_y = 5 if compact_ui else 10
    button_height = 1 if compact_ui else 2

    # 使用 grid 固定四个区域：标题、视频、按钮、状态栏。
    # 只有视频区域允许伸缩，按钮和状态栏始终保留在窗口底部。
    root.grid_columnconfigure(0, weight=1)
    root.grid_rowconfigure(0, weight=0)
    root.grid_rowconfigure(1, weight=1)
    root.grid_rowconfigure(2, weight=0)
    root.grid_rowconfigure(3, weight=0)

    title_var = tk.StringVar(value="Camera starting...")
    title_label = tk.Label(
        root,
        textvariable=title_var,
        bg="black",
        fg="#00ff38",
        anchor="w",
        padx=10 if compact_ui else 18,
        pady=title_pad_y,
        font=(ui_font_family, title_font_size, "bold"),
    )
    title_label.grid(
        row=0,
        column=0,
        sticky="ew",
        padx=outer_pad,
        pady=(outer_pad, 0),
    )

    video_frame = tk.Frame(root, bg="black", bd=1, relief="sunken")
    video_frame.grid(
        row=1,
        column=0,
        sticky="nsew",
        padx=outer_pad,
        pady=(0, 6 if compact_ui else 12),
    )
    # 禁止图像控件的请求尺寸反过来撑大 video_frame，消除视频越刷越大的问题。
    video_frame.grid_propagate(False)
    video_label = tk.Label(
        video_frame,
        bg="black",
        cursor="hand2",
        bd=0,
        highlightthickness=0,
    )
    video_label.place(x=0, y=0, relwidth=1.0, relheight=1.0)

    button_frame = tk.Frame(root, bg="#f2f2f2")
    button_frame.grid(
        row=2,
        column=0,
        sticky="ew",
        padx=outer_pad,
        pady=(0, 4 if compact_ui else 8),
    )
    for column in range(4):
        button_frame.grid_columnconfigure(column, weight=1, uniform="ui_button")

    status_var = tk.StringVar(
        value="待机：只显示视频；按 A、B 或 C 后才识别 A4 并开始拼图"
    )
    status_label = tk.Label(
        root,
        textvariable=status_var,
        bg="#f2f2f2",
        fg="#303030",
        pady=3 if compact_ui else 7,
        font=(ui_font_family, status_font_size),
        anchor="center",
    )
    status_label.grid(
        row=3,
        column=0,
        sticky="ew",
        padx=outer_pad,
        pady=(0, 3 if compact_ui else 8),
    )

    buttons: List[tk.Button] = []

    def set_buttons_enabled(enabled: bool) -> None:
        state_value = tk.NORMAL if enabled else tk.DISABLED
        for button in buttons:
            button.configure(state=state_value)

    def set_status(text_value: str, top_value: Optional[str] = None) -> None:
        status_var.set(text_value)
        if top_value is not None:
            title_var.set(top_value)

    def return_to_live(_event: object = None) -> None:
        with state_lock:
            ui_state["view"] = "live"
            ui_state["result_image"] = None
            ui_state["result_id"] = int(ui_state["result_id"]) + 1
        root.after(100, release_unused_memory)
        set_status(
            "实时视频显示中；A/B为几何拼图，C为扑克中心对称拼图",
            "LIVE - 未执行 A4 识别",
        )

    video_label.bind("<Button-1>", return_to_live)

    def send_report_over_serial(report: dict) -> Tuple[bool, str]:
        nonlocal serial_sender
        packet = build_serial_task_packet(report).rstrip("\n")
        if serial_sender is None:
            if args.no_serial:
                print(f"[串口禁用] 本应发送：{packet}")
                return False, "串口已禁用，结果未发送"
            reason = serial_state["offline_reason"] or "串口未连接"
            print(f"[串口离线] {reason}", file=sys.stderr)
            print(f"[未发送报文] {packet}")
            return False, f"串口离线：{reason}"

        try:
            sent_ok, sent_packet, reply = serial_sender.send_report(report)
            print(f"[串口发送] {sent_packet}")
            print(f"[STM32回复] {reply}")
            if sent_ok:
                return True, f"STM32回复：{reply or 'OK'}"
            return False, f"STM32未确认：{reply or '无回复'}"
        except Exception as exc:
            serial_state["offline_reason"] = str(exc)
            print(f"[串口错误] {exc}", file=sys.stderr)
            try:
                serial_sender.close()
            finally:
                serial_sender = None
            print(f"[未发送报文] {packet}")
            return False, f"串口错误：{exc}"

    def show_processing_result(
        mode_name: str,
        image: PointArray,
        piece_count: int,
    ) -> None:
        """碎片识别完成后立即显示，后台继续拼图且按钮保持禁用。"""
        if stop_event.is_set() or not isinstance(image, np.ndarray):
            return
        with state_lock:
            ui_state["result_image"] = image
            ui_state["result_id"] = int(ui_state["result_id"]) + 1
            ui_state["view"] = "result"
            ui_state["result_kind"] = f"{mode_name}_pieces"
        solving_text = (
            "正在计算中心对称拼法……" if mode_name == "C" else "正在计算几何拼法……"
        )
        set_status(
            f"已识别到 {piece_count} 块真实碎片，{solving_text}",
            f"{mode_name} - 碎片识别完成，正在拼图",
        )

    def finish_action(
        mode_name: str,
        image: Optional[PointArray],
        message: str,
        success: bool,
    ) -> None:
        if stop_event.is_set():
            return
        with state_lock:
            if isinstance(image, np.ndarray):
                ui_state["result_image"] = image
                ui_state["result_id"] = int(ui_state["result_id"]) + 1
                ui_state["view"] = "result"
                ui_state["result_kind"] = mode_name
            if success:
                ui_state["success"] = int(ui_state["success"]) + 1
        processing_event.clear()
        set_buttons_enabled(True)
        if success:
            set_status(
                message + "；点击图像可返回实时视频",
                f"{mode_name} DONE",
            )
        else:
            set_status(message, f"{mode_name} ERROR")

    def action_worker(mode_name: str, frame_snapshot: PointArray) -> None:
        """按钮按下后才识别A4；打印每个关键阶段，便于定位卡点。"""
        started_at = time.perf_counter()
        trace_log("任务", f"{mode_name}线程开始，快照shape={frame_snapshot.shape}")
        try:
            debug_mode = mode_name == "调试"
            question3_mode = mode_name == "C"
            trace_log("任务", f"{mode_name}：开始识别黑色A4并透视矫正")
            board = detect_black_a4_board(
                frame_snapshot,
                a4_width_mm=args.a4_width_mm,
                a4_height_mm=args.a4_height_mm,
                retain_rectified=True,  # A/B/C都要先显示真实碎片
                retain_binary_mask=False,
                create_overlay=False,
            )
            trace_log(
                "任务", f"{mode_name}：A4识别完成，矫正图={board.recognition.shape}"
            )
            # A4透视结果已独立生成，尽早释放摄像头全帧快照。
            del frame_snapshot

            if debug_mode:
                measured_preview, measured_data = make_piece_edge_length_preview(board)
                del board
                print("[碎片边长] 单位：mm")
                for item in measured_data:
                    lengths_text = ", ".join(
                        f"E{edge['edge_id']}={edge['length_mm']:.2f}"
                        for edge in item["edges"]
                    )
                    print(f"  P{item['piece_id']}: {lengths_text}")
                message = f"调试完成：识别到 {len(measured_data)} 块碎片并显示边长"
                root.after(
                    0,
                    lambda: finish_action(mode_name, measured_preview, message, True),
                )
                return

            # A/B使用原几何拼图；C只替换为第三问中心对称候选选择器。
            selector = select_candidate_question3 if question3_mode else None

            def publish_detected_pieces(
                detected_image: PointArray,
                detected_count: int,
            ) -> None:
                # 先让主线程真正完成一次UI刷新，再开始耗时拼图。这样A/B/C
                # 都能稳定看到“已识别碎片”页面，而不是直接跳到最终结果。
                preview_shown = threading.Event()

                def apply_preview(
                    image: PointArray = detected_image,
                    count: int = detected_count,
                ) -> None:
                    try:
                        show_processing_result(mode_name, image, count)
                        trace_log(
                            "任务",
                            f"{mode_name}：已在UI显示{count}块识别碎片",
                        )
                    finally:
                        preview_shown.set()

                root.after(0, apply_preview)
                preview_shown.wait(timeout=0.8)

            trace_log("任务", f"{mode_name}：开始碎片提取和拼图搜索")
            report, comparison = process_board_in_memory(
                board,
                scene_name=f"UI_{mode_name}_{time.strftime('%Y%m%d_%H%M%S')}.jpg",
                a4_width_mm=args.a4_width_mm,
                a4_height_mm=args.a4_height_mm,
                candidate_selector=selector,
                use_real_texture_preview=question3_mode,
                pieces_detected_callback=publish_detected_pieces,
                show_assembled_only=question3_mode,
            )
            trace_log("任务", f"{mode_name}：拼图与放置规划完成")
            del board
            report["ui_button"] = mode_name
            trace_log("任务", f"{mode_name}：开始串口发送")
            _sent_ok, serial_message = send_report_over_serial(report)
            trace_log("任务", f"{mode_name}：串口步骤完成，{serial_message}")
            piece_count = len(report.get("placements", []))
            result_type = "第三问中心对称" if question3_mode else "几何"
            message = (
                f"{mode_name}完成：{piece_count}块{result_type}拼图，"
                f"耗时{report.get('elapsed_seconds', 0.0):.2f}s；{serial_message}"
            )
            root.after(
                0,
                lambda: finish_action(mode_name, comparison, message, True),
            )
        except Exception as exc:
            error_message = f"{mode_name}失败：{exc}"
            trace_log("任务异常", f"{mode_name}: {exc!r}")
            traceback.print_exc()
            try:
                root.after(
                    0,
                    lambda: finish_action(mode_name, None, error_message, False),
                )
            except Exception:
                processing_event.clear()
        finally:
            # 清理搜索状态、临时掩膜和OpenCV数组，尽量避免长期运行后进入swap。
            release_unused_memory()
            trace_log(
                "任务",
                f"{mode_name}线程结束，总耗时={time.perf_counter() - started_at:.3f}s",
            )

    def start_action(mode_name: str) -> None:
        if processing_event.is_set():
            set_status("上一次任务仍在处理中，请稍候")
            return

        with state_lock:
            current_frame = camera_state["frame"]
        if not isinstance(current_frame, np.ndarray):
            set_status("摄像头尚未取得有效画面，请稍候再按")
            return

        trace_log("按键", f"收到{mode_name}，复制当前完整分辨率帧并启动后台任务")
        processing_event.set()
        set_buttons_enabled(False)
        task_text = (
            "第三问中心对称拼图"
            if mode_name == "C"
            else ("碎片边长测量" if mode_name == "调试" else "几何拼图")
        )
        set_status(
            f"{mode_name}正在执行{task_text}，请不要移动A4纸和碎片……",
            f"{mode_name} - 正在识别 A4",
        )
        worker = threading.Thread(
            target=action_worker,
            args=(mode_name, current_frame.copy()),
            name=f"ui-action-{mode_name}",
            daemon=True,
        )
        worker.start()

    button_specs = (
        ("A", lambda: start_action("A")),
        ("B", lambda: start_action("B")),
        ("C", lambda: start_action("C")),
        ("调试", lambda: start_action("调试")),
    )
    for column, (text_value, command) in enumerate(button_specs):
        button = tk.Button(
            button_frame,
            text=text_value,
            command=command,
            height=button_height,
            bg="#f7f7f7",
            activebackground="#e5e5e5",
            relief="raised",
            bd=2,
            font=(ui_font_family, button_font_size, "bold"),
        )
        button.grid(
            row=0,
            column=column,
            sticky="nsew",
            padx=(0 if column == 0 else (3 if compact_ui else 7), 0),
            pady=1 if compact_ui else 2,
        )
        buttons.append(button)

    display_cache: Dict[str, object] = {
        "token": None,
        "photo": None,
        "photo_size": None,
    }

    def bgr_to_pil(image_bgr: PointArray) -> Image.Image:
        """只生成实际图像区域，不再为每帧额外创建整块黑色PIL画布。"""
        target_w = max(int(video_frame.winfo_width()) - 2, 2)
        target_h = max(int(video_frame.winfo_height()) - 2, 2)
        image_h, image_w = image_bgr.shape[:2]
        scale = min(target_w / image_w, target_h / image_h)
        resized_w = max(1, int(round(image_w * scale)))
        resized_h = max(1, int(round(image_h * scale)))
        interpolation = cv2.INTER_AREA if scale < 1.0 else cv2.INTER_LINEAR
        resized = cv2.resize(
            image_bgr,
            (resized_w, resized_h),
            interpolation=interpolation,
        )
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        return Image.fromarray(rgb)

    first_frame_announced = False

    def refresh_ui() -> None:
        nonlocal first_frame_announced
        if stop_event.is_set():
            return
        with state_lock:
            view_mode = str(ui_state["view"])
            result_image = ui_state["result_image"]
            result_id = int(ui_state["result_id"])
            live_frame = camera_state["frame"]
            frame_id = int(camera_state["frame_id"])
            camera_error = str(camera_state["error"])

        selected_image: Optional[PointArray] = None
        source_id = -1
        if view_mode == "result" and isinstance(result_image, np.ndarray):
            selected_image = result_image
            source_id = result_id
        elif isinstance(live_frame, np.ndarray):
            selected_image = live_frame
            source_id = frame_id
            if not first_frame_announced:
                first_frame_announced = True
                set_status(
                    "实时视频显示中；A/B为几何拼图，C为扑克中心对称拼图",
                    "LIVE - 未执行 A4 识别",
                )

        if isinstance(selected_image, np.ndarray):
            target_size = (
                max(int(video_frame.winfo_width()) - 2, 2),
                max(int(video_frame.winfo_height()) - 2, 2),
            )
            token = (view_mode, source_id, target_size)
            if token != display_cache["token"]:
                pil_image = bgr_to_pil(selected_image)
                photo = display_cache["photo"]
                if (
                    isinstance(photo, ImageTk.PhotoImage)
                    and display_cache["photo_size"] == pil_image.size
                ):
                    # 复用同一个Tk图片对象，避免每秒创建20个Tcl图片资源。
                    photo.paste(pil_image)
                else:
                    photo = ImageTk.PhotoImage(pil_image)
                    display_cache["photo"] = photo
                    display_cache["photo_size"] = pil_image.size
                video_label.configure(image=photo, text="")
                video_label.image = photo
                display_cache["token"] = token
        elif camera_error:
            display_cache["token"] = None
            video_label.configure(
                image="",
                text=camera_error,
                fg="red",
                font=(ui_font_family, 18, "bold"),
            )
            video_label.image = None
        else:
            display_cache["token"] = None
            video_label.configure(
                image="",
                text="正在打开摄像头……",
                fg="white",
                font=(ui_font_family, 18),
            )
            video_label.image = None

        root.after(UI_REFRESH_INTERVAL_MS, refresh_ui)

    cleanup_lock = threading.Lock()
    cleanup_state = {"done": False}

    def cleanup_resources(reason: str) -> None:
        """严格按“停线程→等待→释放摄像头”的顺序清理，避免V4L2被锁死。"""
        with cleanup_lock:
            if cleanup_state["done"]:
                return
            cleanup_state["done"] = True

        trace_log("退出清理", f"开始，原因={reason}")
        stop_event.set()
        set_buttons_enabled(False)
        display_cache["token"] = None
        display_cache["photo"] = None
        video_label.image = None

        # 旧版在摄像头线程仍调用read/grab时直接release，存在竞争。
        # 先等待线程自然退出；若read阻塞，再release用于解除阻塞。
        if camera_thread.is_alive() and threading.current_thread() is not camera_thread:
            trace_log("退出清理", "等待摄像头线程自然退出")
            camera_thread.join(timeout=1.5)
        if camera_thread.is_alive():
            trace_log("退出清理", "摄像头线程仍存活，release以解除阻塞")
            _release_capture_object(capture, f"{reason}/unblock")
            camera_thread.join(timeout=1.5)
        else:
            _release_capture_object(capture, reason)
        trace_log("退出清理", f"摄像头线程alive={camera_thread.is_alive()}")

        if serial_sender is not None:
            try:
                serial_sender.close()
                trace_log("退出清理", "串口已关闭")
            except Exception as exc:
                trace_log("退出清理", f"串口关闭异常={exc!r}")
        try:
            cv2.destroyAllWindows()
        except Exception:
            pass
        trace_log("退出清理", "全部资源清理完成")

    def close_app() -> None:
        if cleanup_state["done"]:
            return
        cleanup_resources("UI关闭")
        try:
            root.destroy()
        except Exception:
            pass

    root.protocol("WM_DELETE_WINDOW", close_app)
    root.bind("<Escape>", lambda _event: close_app())
    root.bind("<KeyPress-a>", lambda _event: start_action("A"))
    root.bind("<KeyPress-A>", lambda _event: start_action("A"))
    root.bind("<KeyPress-b>", lambda _event: start_action("B"))
    root.bind("<KeyPress-B>", lambda _event: start_action("B"))
    root.bind("<KeyPress-c>", lambda _event: start_action("C"))
    root.bind("<KeyPress-C>", lambda _event: start_action("C"))

    print(f"[视频] 已打开：{source}")
    print(
        "[UI] 启动后仅显示视频；A/B执行原几何拼图；C执行第三问扑克中心对称拼图；调试测量边长。"
    )
    print("[UI] 视频模式不保存图片、JSON或CSV。")
    print("[低内存] 预览20FPS、求解时暂停JPEG解码、搜索状态固定容量保留。")

    refresh_ui()
    try:
        root.mainloop()
    except KeyboardInterrupt:
        trace_log("退出信号", "收到KeyboardInterrupt")
    finally:
        cleanup_resources("Tk mainloop finally")

    with state_lock:
        success = int(ui_state["success"])
    print(f"[视频结束] 成功处理 {success} 个场景")
    return 0


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output)

    # 实时UI模式全部在内存中运行，不创建结果目录、不保存任何文件。
    if not args.inputs:
        return run_video_stream(args, output_dir)

    # 只有离线图片测试模式才保留原程序的结果文件输出。
    output_dir.mkdir(parents=True, exist_ok=True)

    images = collect_images(args.inputs)
    if not images:
        print("没有找到可处理的图片。", file=sys.stderr)
        return 2
    all_reports = []
    failed = 0
    display_available = not args.no_display
    for image_path in images:
        try:
            report, comparison = process_image(
                image_path,
                output_dir,
                args.a4_width_mm,
                args.a4_height_mm,
                save_debug_images=args.save_debug_images,
            )
            all_reports.append(report)
            if display_available:
                try:
                    cv2.imshow(
                        "A4 Half Puzzle Motion Plan - any key next, Q hide",
                        comparison,
                    )
                    key = cv2.waitKey(0) & 0xFF
                    if key in (ord("q"), ord("Q"), 27):
                        display_available = False
                        cv2.destroyAllWindows()
                except cv2.error:
                    display_available = False
                    print("[提示] 当前环境不能弹出窗口，结果图片已经保存到输出目录。")
        except Exception as exc:
            failed += 1
            print(f"[失败] {image_path.name}: {exc}", file=sys.stderr)

    summary = {
        "total": len(images),
        "success": len(all_reports),
        "failed": failed,
        "results": all_reports,
    }
    with (output_dir / "summary.json").open("w", encoding="utf-8") as file:
        json.dump(summary, file, ensure_ascii=False, indent=2)
    if not args.no_display:
        cv2.destroyAllWindows()
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        trace_log("主程序", "用户中断")
        raise SystemExit(130)
    except Exception as exc:
        trace_log("主程序未捕获异常", repr(exc))
        traceback.print_exc()
        raise
