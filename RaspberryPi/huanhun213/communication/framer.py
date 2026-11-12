class DelimiterFramer:
    """
    以固定字节序列结束一帧，切出的帧不含分隔符
    """

    def __init__(self, delimiter: bytes = b'\r\n') -> None:
        if not delimiter:
            raise ValueError("Delimiter cannot be empty.")
        self.delimiter = delimiter
        self.buffer = bytearray()

    def feed(self, chunk:bytes) -> list[bytes]:
        self.buffer.extend(chunk)
        frames = []

        while True:
            index = self.buffer.find(self.delimiter)
            if index == -1:
                break
            frame = self.buffer[:index]
            frames.append(bytes(frame))
            del self.buffer[:index + len(self.delimiter)]

        return frames
    
    @property
    def buffered_bytes(self) -> int:
        return len(self.buffer)
