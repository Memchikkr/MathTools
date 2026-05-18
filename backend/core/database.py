import aiosqlite
from pathlib import Path


async def init_database(db_path: Path):
    db_path.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(db_path) as conn:
        await conn.execute("PRAGMA foreign_keys = ON")
        await conn.executescript("""
            CREATE TABLE IF NOT EXISTS module (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                path TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT
            )
        """)

        cursor = await conn.execute("SELECT COUNT(*) FROM module")
        count = (await cursor.fetchone())[0]
        if count == 0:
            await conn.executemany(
                """
                INSERT INTO module (path, name, description, icon)
                VALUES (?, ?, ?, ?)
            """,
                [
                    (
                        "engineer-calculator",
                        "Инженерный калькулятор",
                        "Вычисление выражений: тригонометрия, логарифмы, степени",
                        "Calculator",
                    ),
                    (
                        "image-converter",
                        "Конвертер изображений",
                        "Пакетная конвертация JPG, PNG, WEBP, SVG и др.",
                        "Photo",
                    ),
                    (
                        "pdf-converter",
                        "Конвертер в PDF",
                        "Объединяет изображения в один PDF-файл",
                        "FilePdf",
                    ),
                    (
                        "matrix-calculator",
                        "Матричный калькулятор",
                        "Сложение, умножение, определитель, собственные значения",
                        "Math",
                    ),
                    (
                        "docx-converter",
                        "Конвертер DOCX в PDF",
                        "Конвертация документов Word в PDF",
                        "FileText",
                    ),
                    (
                        "integral-calculator",
                        "Калькулятор интегралов",
                        "Вычисление определённых и неопределённых интегралов",
                        "MathIntegral",
                    ),
                    (
                        "derivative-calculator",
                        "Калькулятор производных",
                        "Вычисление производных любого порядка",
                        "MathFunction",
                    ),
                ],
            )
            await conn.commit()
