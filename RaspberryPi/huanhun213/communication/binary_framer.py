class LengthPrefixedFramer:
    """
    按"同步头 + 长度字段"切帧，能从帧中间开始接收并自行重新对齐。
    """

    def __init__(self, magic: bytes, max_payload: int, trailer_size: int = 0) -> None:
        if not magic:
            raise ValueError("Magic cannot be empty.")
        if not 0 < max_payload <= max_payload:
            raise ValueError("Max payload must be between 1 and {max_payload}.")
        if trailer_size < 0:
            raise ValueError("Trailer size cannot be negative.")

        self.magic = magic
        self.max_payload = max_payload
        self.trailer_size = trailer_size
        self.buffer = bytearray()

        self.resync_bytes = 0
        self.bad_length = 0

    def feed(self, chunk: bytes) -> list[bytes]:
        self.buffer.extend(chunk)
        frames = []

        while True:
            index = self.buffer.find(self.magic)
            if index == -1:
                keep = len(self.magic) - 1
                if keep:
                    if len(self.buffer) > keep:
                        self.resync_bytes += len(self.buffer) - keep
                        del self.buffer[:len(self.buffer) - keep]
                else:
                    self.resync_bytes += len(self.buffer)
                    self.buffer.clear()
                break
            if index:
                self.resync_bytes += index
                del self.buffer[:index]

            header_end = len(self.magic) + 2
            if len(self.buffer) < header_end:
                break

            length = int.from_bytes(self.buffer[len(self.magic):header_end], 'big')
            if length == 0 or length > self.max_payload:
                self.bad_length += 1
                self.resync_bytes += 1
                del self.buffer[:1]
                continue

            total = header_end + length + self.trailer_size
            if len(self.buffer) < total:
                break

            frame.append(bytes(self.buffer[:total]))
            del self.buffer[:total]

        return frames



            