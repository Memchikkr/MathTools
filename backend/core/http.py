from urllib.parse import quote


def content_disposition_attachment(filename: str, fallback: str = "file") -> str:
    """Content-Disposition для скачивания с Unicode-именами (RFC 5987)."""
    ascii_safe = filename.encode("ascii", "ignore").decode("ascii").strip() or fallback
    encoded = quote(filename)
    return f"attachment; filename=\"{ascii_safe}\"; filename*=UTF-8''{encoded}"
