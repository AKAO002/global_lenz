from fastapi import FastAPI

from app.api import country_summaries

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Hot Reload確認OK"}

app.include_router(
    country_summaries.router,
    prefix="/api/country-summaries",
    tags=["CountrySummaries"]
)