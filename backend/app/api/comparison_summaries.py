from fastapi import APIRouter, HTTPException

from app.services.comparison_service import (
    get_comparison_summaries,
    get_comparison_summary_by_id,
    get_comparison_detail
)

router = APIRouter()

# 一覧取得
@router.get("")
def read_comparison_summaries():

    return get_comparison_summaries()

# 1件取得
@router.get("/{id}")
def read_comparison_summary(id: int):

    data = get_comparison_summary_by_id(id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Country summary not found"
        )

    return data

# 詳細取得
@router.get("/{id}/detail")
def read_comparison_detail(id: int):

    result = get_comparison_detail(id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Comparison not found"
        )

    return result