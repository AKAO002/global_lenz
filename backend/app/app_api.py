from fastapi import FastAPI

from app.api import country_summaries
from app.api import comparison_summaries
from app.api import favorites

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Hot Reload確認OK"}

app.include_router(
    country_summaries.router,
    prefix="/api/country-summaries",
    tags=["CountrySummaries"]
)

app.include_router(
    comparison_summaries.router,
    prefix="/api/comparison-summaries",
    tags=["ComparisonSummaries"]
)

app.include_router(
    favorites.router,
    prefix="/api/favorites",
    tags=["favorites"]
)
