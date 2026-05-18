import io
import zipfile
from pathlib import Path
from typing import List, Tuple
from PIL import Image

SUPPORTED_INPUT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".ico"}
SUPPORTED_OUTPUT = {"jpg", "png", "webp", "bmp", "tiff", "ico"}


def convert_image(
    image_data: bytes,
    original_name: str,
    target_format: str,
    quality: int = 95,
    bg_color: str = "white",
) -> Tuple[bytes, str]:
    """
    Конвертирует изображение в целевой формат.
    Возвращает (bytes_конвертированного_файла, новое_имя_файла)
    """
    # Открываем изображение
    img = Image.open(io.BytesIO(image_data))

    # Конвертируем RGBA в RGB для JPEG и ICO (если нужно)
    if target_format.lower() == "jpg" and img.mode == "RGBA":
        # Создаём белый фон
        bg = Image.new("RGB", img.size, bg_color)
        bg.paste(img, mask=img.split()[3])  # используем альфа-канал как маску
        img = bg
    elif target_format.lower() in ("jpg", "ico") and img.mode != "RGB":
        img = img.convert("RGB")

    # Подготавливаем буфер для сохранения
    output_buffer = io.BytesIO()

    # Определяем формат сохранения
    save_format = target_format.upper()
    if save_format == "JPG":
        save_format = "JPEG"

    # Параметры сохранения
    save_kwargs = {}
    if save_format in ("JPEG", "WEBP"):
        save_kwargs["quality"] = quality
        save_kwargs["optimize"] = True

    # Сохраняем
    img.save(output_buffer, format=save_format, **save_kwargs)

    # Формируем новое имя файла
    original_stem = Path(original_name).stem
    new_name = f"{original_stem}.{target_format.lower()}"

    return output_buffer.getvalue(), new_name


def process_images(
    files: List[Tuple[bytes, str]],
    target_format: str,
    quality: int = 95,
    bg_color: str = "white",
) -> bytes:
    """
    Обрабатывает список файлов (data, original_name).
    Возвращает (zip_bytes, список_ошибок)
    """
    errors = []
    converted_files = []  # список (bytes, new_name)

    for _, (data, original_name) in enumerate(files):
        try:
            # Проверяем расширение исходного файла
            ext = Path(original_name).suffix.lower()
            if ext not in SUPPORTED_INPUT:
                errors.append(f"{original_name}: неподдерживаемый формат ({ext})")
                continue

            conv_data, new_name = convert_image(
                data, original_name, target_format, quality, bg_color
            )
            converted_files.append((conv_data, new_name))
        except Exception as e:
            raise Exception(f"Ошибка конвертации {original_name}: {str(e)}")

    # Создаём ZIP-архив
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for data, name in converted_files:
            zipf.writestr(name, data)

    zip_buffer.seek(0)
    return zip_buffer.getvalue()
