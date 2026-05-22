import multiprocessing
import sys
import uvicorn

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.consts import DB_PATH
from core.database import init_database
from modules.root import router as root_router
from modules.derivative_calculator import router as derivative_calc_router
from modules.calc import router as calc_router
from modules.docx_to_pdf_converter import router as docx_converter_router
from modules.image_converter import router as image_converter_router
from modules.matrix_calculator import router as matrix_calc_router
from modules.pdf_converter import router as to_pdf_converter_router
from modules.integral_calculator import router as integral_calc_router
from modules.base_converter import router as base_converter_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not DB_PATH.exists():
        await init_database(DB_PATH)

    yield


app = FastAPI(title="MathTools API", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "tauri://localhost",
        "https://tauri.localhost",
        "http://tauri.localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(root_router)
app.include_router(calc_router)
app.include_router(matrix_calc_router)
app.include_router(derivative_calc_router)
app.include_router(integral_calc_router)
app.include_router(image_converter_router)
app.include_router(docx_converter_router)
app.include_router(to_pdf_converter_router)
app.include_router(base_converter_router)

if __name__ == "__main__":
    multiprocessing.freeze_support()

    is_frozen = getattr(sys, "frozen", False)

    if is_frozen:
        # PyInstaller exe — передаём объект, reload не нужен
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            reload=False,
        )
    else:
        # Dev режим — передаём строку, reload работает
        uvicorn.run(
            "main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
        )
