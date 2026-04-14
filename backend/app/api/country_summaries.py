from fastapi import APIRouter,HTTPException

from app.services.country_service import (
    get_country_summaries,
    get_country_summary_by_id,
    get_country_detail,
    get_home_country_summaries
)

router = APIRouter()

# ホーム一覧
@router.get("/home")
def read_home_country_summaries():

    return get_home_country_summaries()

# 一覧取得
@router.get("")
def read_country_summaries():

    return get_country_summaries()

# 1件取得
@router.get("/{id}")
def read_country_summary(id: int):

    data = get_country_summary_by_id(id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Country summary not found"
        )

    return data

# 詳細取得
@router.get("/{id}/detail")
def read_country_detail(id: int):

    result = get_country_detail(id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Country summary not found"
        )

    return result