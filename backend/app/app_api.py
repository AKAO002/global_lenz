from fastapi import FastAPI

from app.api import country_summaries
from app.api import comparison_summaries
from app.api import favorites

router = APIRouter()


@app.get("/")
def root():
    return {"message": "Hot Reload確認OK"}

router.include_router(
    country_summaries.router,
    prefix="/api/country-summaries",
    tags=["CountrySummaries"]
)

router.include_router(
    comparison_summaries.router,
    prefix="/api/comparison-summaries",
    tags=["ComparisonSummaries"]
)

router.include_router(
    favorites.router,
    prefix="/api/favorites",
    tags=["favorites"]
)
