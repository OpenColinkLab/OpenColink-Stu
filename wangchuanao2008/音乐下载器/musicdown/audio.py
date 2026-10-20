import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import httpx
from mutagen import File
from mutagen.flac import FLAC, Picture
from mutagen.id3 import APIC, ID3, ID3NoHeaderError, TALB, TIT2, TPE1
from mutagen.mp3 import MP3
from mutagen.mp4 import MP4, MP4Cover

from .models import DownloadError, Song


def safe_name(value: str) -> str:
    return re.sub(r'[\\/:*?"<>|\x00-\x1f]', "_", value).strip(" .")[:180] or "未命名"


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _find_tool(name: str) -> str | None:
    filename = name + (".exe" if sys.platform == "win32" else "")
    roots = [Path(sys.executable).resolve().parent, Path(__file__).resolve().parents[1]]
    if getattr(sys, "frozen", False):
        roots.insert(0, Path(getattr(sys, "_MEIPASS", roots[0])))
    if sys.platform == "darwin":
        roots.extend([Path("/opt/homebrew/bin"), Path("/usr/local/bin")])
    return next((str(root / filename) for root in roots if (root / filename).is_file()), None) or shutil.which(name)


def find_ffmpeg() -> str | None:
    return _find_tool("ffmpeg")


def find_ffprobe() -> str | None:
    return _find_tool("ffprobe")


def _tool_help() -> str:
    return "请安装 FFmpeg，或将 ffmpeg.exe 和 ffprobe.exe 放在应用旁边" if sys.platform == "win32" else "请运行 brew install ffmpeg"


def _inspect_with_ffprobe(path: Path) -> dict:
    ffprobe = find_ffprobe()
    if not ffprobe:
        raise DownloadError(f"该音频编码需要 ffprobe 检测；{_tool_help()}")
    result = subprocess.run([ffprobe, "-v", "error", "-show_streams", "-show_format",
                             "-of", "json", str(path)], capture_output=True, text=True, timeout=20)
    if result.returncode:
        raise DownloadError("音频文件无法解码识别")
    try:
        info = json.loads(result.stdout)
    except ValueError as exc:
        raise DownloadError("ffprobe 未返回有效的音频检测结果") from exc
    streams = [stream for stream in info.get("streams", []) if stream.get("codec_type") == "audio"]
    video_streams = [stream for stream in info.get("streams", []) if stream.get("codec_type") == "video"]
    if not streams or any(not stream.get("disposition", {}).get("attached_pic") for stream in video_streams):
        raise DownloadError("服务器返回的内容不是纯音频文件")
    stream = streams[0]
    codec_name = stream.get("codec_name", "").lower()
    fmt = info.get("format", {}).get("format_name", "")
    tag = (stream.get("codec_tag_string") or "").lower()
    codec = {"mp3": "MP3", "aac": "AAC", "alac": "ALAC", "flac": "FLAC",
             "ac3": "AC-3", "eac3": "E-AC-3", "opus": "Opus", "vorbis": "Vorbis"}.get(codec_name)
    if tag == "av3a" and ("mp4" in fmt or "mov" in fmt):
        # Stock FFmpeg can demux Audio Vivid, but has no AVS3-P3 audio decoder.
        # Count every packet so a truncated MP4 cannot pass on its header duration.
        packet_result = subprocess.run(
            [ffprobe, "-v", "error", "-count_packets", "-show_entries",
             "stream=index,nb_frames,nb_read_packets", "-of", "json", str(path)],
            capture_output=True, text=True, timeout=60)
        try:
            counted = json.loads(packet_result.stdout)
            packet_stream = next(item for item in counted.get("streams", [])
                                 if item.get("index") == stream.get("index"))
            expected = int(packet_stream.get("nb_frames") or 0)
            actual = int(packet_stream.get("nb_read_packets") or 0)
        except (ValueError, TypeError, StopIteration) as exc:
            raise DownloadError("臻音全景声文件无法核对完整音频包") from exc
        if packet_result.returncode or expected <= 0 or actual != expected or "partial file" in packet_result.stderr.lower():
            raise DownloadError(f"臻音全景声文件不完整（音频包 {actual}/{expected}），未保存")
        duration = float(stream.get("duration") or info.get("format", {}).get("duration") or 0)
        if duration <= 0:
            raise DownloadError("臻音全景声文件没有有效时长")
        bitrate = int(stream.get("bit_rate") or info.get("format", {}).get("bit_rate") or 0)
        return {"extension": "m4a", "codec": "AVS3 Audio Vivid (av3a)", "lossless": False,
                "bitrate_kbps": round(bitrate / 1000), "duration_seconds": duration,
                "sample_rate_hz": int(stream.get("sample_rate") or 0), "bit_depth": 0,
                "channels": int(stream.get("channels") or 0), "decodable": False}
    if not codec:
        raise DownloadError(f"暂不支持检测此音频编码：{codec_name or '未知'}（容器 {fmt or '未知'}，标记 {tag or '未知'}）")
    if "mp4" in fmt or "mov" in fmt:
        ext = "m4a"
    else:
        ext = {"mp3": "mp3", "flac": "flac", "aac": "aac", "ac3": "ac3",
               "eac3": "eac3", "opus": "ogg", "vorbis": "ogg", "alac": "m4a"}.get(codec_name)
    if not ext:
        raise DownloadError(f"暂不支持保存此容器：{fmt or '未知'}")
    duration = float(stream.get("duration") or info.get("format", {}).get("duration") or 0)
    if duration <= 0:
        raise DownloadError("音频文件没有有效时长")
    bitrate = int(stream.get("bit_rate") or info.get("format", {}).get("bit_rate") or 0)
    lossless = codec in {"FLAC", "ALAC"}
    bit_depth = int(stream.get("bits_per_raw_sample") or stream.get("bits_per_sample") or 0) if lossless else 0
    return {"extension": ext, "codec": codec, "lossless": lossless, "decodable": True,
            "bitrate_kbps": round(bitrate / 1000), "duration_seconds": duration,
            "sample_rate_hz": int(stream.get("sample_rate") or 0),
            "bit_depth": bit_depth, "channels": int(stream.get("channels") or 0)}


def inspect_audio(path: Path) -> dict:
    if find_ffprobe():
        return _inspect_with_ffprobe(path)
    try:
        obj = File(path)
        if isinstance(obj, MP3):
            ext, codec, lossless = "mp3", "MP3", False
        elif isinstance(obj, MP4):
            raw_codec = str(getattr(obj.info, "codec", "")).lower()
            codec = ("ALAC" if "alac" in raw_codec else "E-AC-3" if "ec-3" in raw_codec else
                     "AC-3" if "ac-3" in raw_codec else "AAC" if "mp4a" in raw_codec else "")
            if not codec:
                return _inspect_with_ffprobe(path)
            if codec in {"E-AC-3", "AC-3"}:
                return _inspect_with_ffprobe(path)
            ext, lossless = "m4a", codec == "ALAC"
        elif isinstance(obj, FLAC):
            ext, codec, lossless = "flac", "FLAC", True
        else:
            return _inspect_with_ffprobe(path)
        info = obj.info
        duration = float(info.length)
        bitrate = round(info.bitrate / 1000) if getattr(info, "bitrate", 0) else 0
        if duration <= 0:
            raise DownloadError("音频文件没有有效时长")
        return {"extension": ext, "codec": codec, "lossless": lossless, "decodable": True,
                "bitrate_kbps": bitrate, "duration_seconds": duration,
                "sample_rate_hz": int(getattr(info, "sample_rate", 0) or 0),
                "bit_depth": int(getattr(info, "bits_per_sample", 0) or 0) if lossless else 0,
                "channels": int(getattr(info, "channels", 0) or 0)}
    except DownloadError:
        raise
    except Exception:
        return _inspect_with_ffprobe(path)


def tag_audio(path: Path, song: Song, cover: bytes | None, suffix: str) -> None:
    if suffix == "mp3":
        try:
            tags = ID3(path)
        except ID3NoHeaderError:
            tags = ID3()
        tags.delall("TIT2"); tags.add(TIT2(encoding=3, text=song.title))
        tags.delall("TPE1"); tags.add(TPE1(encoding=3, text=song.artist))
        tags.delall("TALB"); tags.add(TALB(encoding=3, text=song.album))
        if cover:
            tags.delall("APIC")
            tags.add(APIC(encoding=3, mime="image/png" if cover.startswith(b"\x89PNG") else "image/jpeg",
                          type=3, desc="Cover", data=cover))
        tags.save(path)
    elif suffix == "m4a":
        audio = MP4(path)
        audio["\xa9nam"] = [song.title]; audio["\xa9ART"] = [song.artist]; audio["\xa9alb"] = [song.album]
        if cover:
            fmt = MP4Cover.FORMAT_PNG if cover.startswith(b"\x89PNG") else MP4Cover.FORMAT_JPEG
            audio["covr"] = [MP4Cover(cover, imageformat=fmt)]
        audio.save()
    elif suffix == "flac":
        audio = FLAC(path)
        audio["title"] = song.title; audio["artist"] = song.artist; audio["album"] = song.album
        if cover:
            pic = Picture(); pic.type = 3
            pic.mime = "image/png" if cover.startswith(b"\x89PNG") else "image/jpeg"
            pic.data = cover; audio.clear_pictures(); audio.add_picture(pic)
        audio.save()


def cover_bytes(song: Song, client: httpx.Client) -> bytes | None:
    if not song.cover_url:
        return None
    try:
        response = client.get(song.cover_url, timeout=12)
        response.raise_for_status()
        data = response.content
        if len(data) <= 2_000_000 and (data.startswith(b"\xff\xd8") or data.startswith(b"\x89PNG")):
            return data
    except httpx.HTTPError:
        pass
    return None


def download_audio(song: Song, sources, target_dir: Path, mp3: bool, client: httpx.Client,
                   cancelled, progress, status, cover: bytes | None) -> tuple[Path, dict]:
    target_dir.mkdir(parents=True, exist_ok=True)
    temp_path = None
    errors = []
    try:
        for source in sources:
            if cancelled.is_set():
                raise DownloadError("已取消")
            fd, name = tempfile.mkstemp(prefix=".musicdown-", suffix=".part", dir=target_dir)
            os.close(fd); temp_path = Path(name)
            try:
                with client.stream("GET", source.url, follow_redirects=True, timeout=45) as response:
                    response.raise_for_status()
                    content_type = response.headers.get("content-type", "").lower()
                    if "html" in content_type or "json" in content_type:
                        raise DownloadError("服务器返回网页而非音频，可能需要权限或链接已失效")
                    total = int(response.headers.get("content-length") or 0)
                    received = 0
                    with temp_path.open("wb") as out:
                        for chunk in response.iter_bytes(131072):
                            if cancelled.is_set():
                                raise DownloadError("已取消")
                            out.write(chunk); received += len(chunk)
                            progress(round(received * 100 / total) if total else -1)
                    if total and received != total:
                        raise DownloadError(f"音频传输不完整（{received}/{total} 字节）")
                details = inspect_audio(temp_path)
                if source.required_lossless and not details["lossless"]:
                    raise DownloadError("实际文件不是无损格式，未按所选音质保存")
                if source.requested_level == "dolby" and details["codec"] not in {"E-AC-3", "AC-3"}:
                    raise DownloadError("实际文件不是杜比编码，未按所选音质保存")
                if song.duration > 0 and details["duration_seconds"] + 3 < song.duration * 0.9:
                    raise DownloadError(f"仅取得试听片段（{details['duration_seconds']:.0f}/{song.duration:.0f} 秒），未保存为完整歌曲")
                break
            except (httpx.HTTPError, DownloadError) as exc:
                errors.append(f"{source.label}：{exc}")
                temp_path.unlink(missing_ok=True); temp_path = None
                if cancelled.is_set():
                    raise DownloadError(str(exc)) from exc
        else:
            reason = "；".join(errors) if errors else "没有可下载的音频"
            if song.restriction and not errors:
                reason = f"{song.restriction}；{reason}"
            raise DownloadError(reason)

        suffix = details["extension"]
        if mp3 and suffix != "mp3":
            if details.get("decodable") is False:
                raise DownloadError("当前 FFmpeg 无法解码 AVS3 Audio Vivid，不能转换为 MP3；请关闭 MP3 转换后保留原始文件")
            ffmpeg = find_ffmpeg()
            if not ffmpeg:
                raise DownloadError(f"转换 MP3 需要 ffmpeg；{_tool_help()}")
            status("转换 MP3 中")
            converted = temp_path.with_suffix(".mp3.part")
            channel_options = ["-ac", "2"] if details.get("channels", 0) > 2 else []
            proc = subprocess.Popen([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(temp_path),
                                     "-vn", "-codec:a", "libmp3lame", "-q:a", "2", *channel_options, "-f", "mp3", str(converted)],
                                    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
            while proc.poll() is None:
                if cancelled.wait(0.2):
                    proc.terminate(); proc.wait(timeout=5); converted.unlink(missing_ok=True)
                    raise DownloadError("已取消")
            err = proc.stderr.read().decode(errors="replace") if proc.stderr else ""
            if proc.returncode:
                converted.unlink(missing_ok=True)
                raise DownloadError(f"MP3 转换失败：{err[-300:]}")
            temp_path.unlink(); temp_path = converted
            details = inspect_audio(temp_path); suffix = "mp3"

        stem = safe_name(f"{song.artist} - {song.title}")
        final = target_dir / f"{stem}.{suffix}"
        if final.exists():
            existing = inspect_audio(final)
            if _sha256(final) == _sha256(temp_path):
                existing["source"] = source.label
                existing["requested_level"] = source.requested_level
                existing["actual_level"] = source.actual_level
                temp_path.unlink(); return final, existing
            final = target_dir / f"{stem} [{song.platform}-{song.song_id}].{suffix}"
            index = 2
            while final.exists():
                if _sha256(final) == _sha256(temp_path):
                    existing = inspect_audio(final)
                    existing["source"] = source.label
                    existing["requested_level"] = source.requested_level
                    existing["actual_level"] = source.actual_level
                    temp_path.unlink(); return final, existing
                final = target_dir / f"{stem} [{song.platform}-{song.song_id}-{index}].{suffix}"
                index += 1
        status("写入歌曲信息")
        try:
            tag_audio(temp_path, song, cover, suffix)
        except Exception:
            # A playable file is preferable to treating optional tagging as a download failure.
            pass
        os.replace(temp_path, final); temp_path = None
        details = inspect_audio(final)
        details["source"] = source.label
        details["requested_level"] = source.requested_level
        details["actual_level"] = source.actual_level
        return final, details
    finally:
        if temp_path:
            temp_path.unlink(missing_ok=True)
