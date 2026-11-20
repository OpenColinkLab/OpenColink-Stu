from datetime import datetime
from pathlib import Path
import time

import cv2

DEVICE = "/dev/video0"
OUTPUT_DIR = Path("/home/wyh/apps/pi-env-31212/video")

DURATION_SECONDS = 10
OUTPUT_FPS = 30


def open_writer(output_path, fps, width, height):
    """优先创建 MP4，失败时改用兼容性更好的 MJPG AVI。"""
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(
        str(output_path), fourcc, fps, (width, height)
    )

    if writer.isOpened():
        return writer, output_path

    writer.release()

    fallback_path = output_path.with_suffix(".avi")
    fourcc = cv2.VideoWriter_fourcc(*"MJPG")
    writer = cv2.VideoWriter(
        str(fallback_path), fourcc, fps, (width, height)
    )

    if not writer.isOpened():
        raise RuntimeError("无法创建视频写入器")

    return writer, fallback_path


OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

cap = cv2.VideoCapture(DEVICE, cv2.CAP_V4L2)

if not cap.isOpened():
    raise RuntimeError(f"无法打开摄像头：{DEVICE}")

try:
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    cap.set(cv2.CAP_PROP_FPS, 60)

    ok, first_frame = cap.read()

    if not ok or first_frame is None:
        raise RuntimeError("摄像头已打开，但读取图像失败")

    height, width = first_frame.shape[:2]

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    requested_path = OUTPUT_DIR / f"camera_video_{timestamp}.mp4"

    writer, output_path = open_writer(
        requested_path,
        OUTPUT_FPS,
        width,
        height,
    )

    print("采集尺寸：", width, "x", height)
    print("视频路径：", output_path)
    print("计划录制：", DURATION_SECONDS, "秒")

    frame_count = 0
    start_time = time.monotonic()

    try:
        writer.write(first_frame)
        frame_count = 1

        while time.monotonic() - start_time < DURATION_SECONDS:
            ok, frame = cap.read()

            if not ok or frame is None:
                print("警告：摄像头停止返回图像")
                break

            # 保证每一帧的尺寸都与 VideoWriter 一致
            if frame.shape[1] != width or frame.shape[0] != height:
                frame = cv2.resize(frame, (width, height))

            writer.write(frame)
            frame_count += 1

            elapsed = time.monotonic() - start_time
            current_fps = frame_count / elapsed if elapsed > 0 else 0

            if frame_count % OUTPUT_FPS == 0:
                print(
                    f"已写入 {frame_count} 帧，"
                    f"平均速度 {current_fps:.1f} FPS"
                )

    finally:
        cap.release()
        writer.release()
        print("摄像头和视频文件已释放")

    elapsed = max(time.monotonic() - start_time, 1e-6)

    print("录制帧数：", frame_count)
    print("平均帧率：", f"{frame_count / elapsed:.1f} FPS")
    print("完成路径：", output_path)

except Exception:
    cap.release()
    raise