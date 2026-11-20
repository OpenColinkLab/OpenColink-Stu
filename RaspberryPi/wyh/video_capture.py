from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path
import sys
import threading
import time

import cv2


DEFAULT_OUTPUT_DIR = Path(
    "/home/wyh/apps/pi-env-31212/video"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="USB 摄像头定时或手动停止录制"
    )
    parser.add_argument(
        "--duration",
        type=float,
        default=0.0,
        help="最长录制秒数；省略或设为 0 表示一直录制到手动停止",
    )
    parser.add_argument(
        "--device",
        default="/dev/video0",
        help="摄像头设备节点，默认 /dev/video0",
    )
    parser.add_argument(
        "--fps",
        type=float,
        default=15.0,
        help="采集和视频帧率，默认 15；1080p Pi 4 建议先用 15",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=1920,
        help="采集宽度，默认 1920",
    )
    parser.add_argument(
        "--height",
        type=int,
        default=1080,
        help="采集高度，默认 1080",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="视频保存目录",
    )

    args = parser.parse_args()

    if args.duration < 0:
        parser.error("--duration 不能小于 0")
    if args.fps <= 0:
        parser.error("--fps 必须大于 0")
    if args.width <= 0 or args.height <= 0:
        parser.error("宽度和高度必须大于 0")

    return args


def create_video_writer(
    output_path: Path,
    fps: float,
    width: int,
    height: int,
) -> tuple[cv2.VideoWriter, Path]:
    """优先创建 MP4；失败时改用 MJPG AVI。"""

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(
        str(output_path),
        fourcc,
        fps,
        (width, height),
    )

    if writer.isOpened():
        return writer, output_path

    writer.release()

    fallback_path = output_path.with_suffix(".avi")
    fourcc = cv2.VideoWriter_fourcc(*"MJPG")
    writer = cv2.VideoWriter(
        str(fallback_path),
        fourcc,
        fps,
        (width, height),
    )

    if not writer.isOpened():
        raise RuntimeError("无法创建 MP4 或 AVI 视频文件")

    return writer, fallback_path


def listen_for_quit(stop_event: threading.Event) -> None:
    """读取终端输入，输入 q 并回车即可停止录制。"""

    while not stop_event.is_set():
        try:
            line = sys.stdin.readline()
        except (EOFError, OSError):
            return

        if line == "":
            return

        if line.strip().lower() == "q":
            stop_event.set()
            return


def main() -> None:
    args = parse_args()

    duration_seconds = None if args.duration == 0 else args.duration
    output_dir: Path = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(args.device, cv2.CAP_V4L2)

    if not cap.isOpened():
        raise RuntimeError(f"无法打开摄像头：{args.device}")

    writer: cv2.VideoWriter | None = None
    output_path: Path | None = None
    frame_count = 0
    start_time = time.monotonic()

    stop_event = threading.Event()

    try:
        cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.height)
        cap.set(cv2.CAP_PROP_FPS, args.fps)

        ok, first_frame = cap.read()

        if not ok or first_frame is None:
            raise RuntimeError("摄像头已经打开，但读取第一帧失败")

        height, width = first_frame.shape[:2]

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        requested_path = output_dir / f"camera_video_{timestamp}.mp4"

        writer, output_path = create_video_writer(
            requested_path,
            args.fps,
            width,
            height,
        )

        print("摄像头设备：", args.device)
        print("采集尺寸：", f"{width} x {height}")
        print("视频帧率：", args.fps)
        print("视频路径：", output_path)

        if duration_seconds is None:
            print("录制时长：手动停止")
        else:
            print("录制时长：", f"{duration_seconds:g} 秒")

        print("提前停止：输入 q 后按回车，或按 Ctrl+C")
        print("开始录制……")

        threading.Thread(
            target=listen_for_quit,
            args=(stop_event,),
            daemon=True,
        ).start()

        writer.write(first_frame)
        frame_count = 1

        start_time = time.monotonic()

        while not stop_event.is_set():
            elapsed = time.monotonic() - start_time

            if (
                duration_seconds is not None
                and elapsed >= duration_seconds
            ):
                print("\n已达到设定录制时长")
                break

            ok, frame = cap.read()

            if not ok or frame is None:
                print("\n警告：摄像头停止返回图像")
                break

            # VideoWriter 要求每一帧尺寸保持一致
            if frame.shape[1] != width or frame.shape[0] != height:
                frame = cv2.resize(frame, (width, height))

            writer.write(frame)
            frame_count += 1

            if frame_count % max(1, int(args.fps)) == 0:
                current_elapsed = time.monotonic() - start_time
                actual_fps = frame_count / max(
                    current_elapsed, 1e-6
                )
                print(
                    f"已录制 {frame_count} 帧，"
                    f"平均 {actual_fps:.1f} FPS"
                )

    except KeyboardInterrupt:
        print("\n收到 Ctrl+C，正在安全停止录制")

    finally:
        cap.release()

        if writer is not None:
            writer.release()

        elapsed = time.monotonic() - start_time

        print("\n摄像头已释放")

        if output_path is not None:
            print("视频已关闭：", output_path)
            print("录制帧数：", frame_count)
            print(
                "平均帧率：",
                f"{frame_count / max(elapsed, 1e-6):.1f} FPS",
            )

            if output_path.exists():
                size_mb = output_path.stat().st_size / (1024 * 1024)
                print(f"文件大小：{size_mb:.2f} MiB")


if __name__ == "__main__":
    main()
