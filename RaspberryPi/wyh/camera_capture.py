from datetime import datetime
from pathlib import Path

import cv2

DEVICE = "/dev/video0"
OUTPUT_DIR = Path("/home/wyh/apps/pi-env-31212/camera picture")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

cap = cv2.VideoCapture(DEVICE, cv2.CAP_V4L2)

if not cap.isOpened():
    raise RuntimeError(f"无法打开摄像头：{DEVICE}")

try:
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    cap.set(cv2.CAP_PROP_FPS, 60)

    ok, frame = cap.read()

    if not ok:
        raise RuntimeError("摄像头已打开，但读取图像失败")

    filename = datetime.now().strftime("camera_%Y%m%d_%H%M%S_%f.jpg")
    output_path = OUTPUT_DIR / filename

    print("图像尺寸：", frame.shape)
    print("保存路径：", output_path)

    saved = cv2.imwrite(str(output_path), frame)
    print("保存结果：", saved)

    if not saved:
        raise RuntimeError("图片保存失败")

finally:
    cap.release()