from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.app_api import router as api_router

app = FastAPI()

# --- CORS設定の追加_フロントエンドからのアクセスを許可します
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Backendが動きました!!"}