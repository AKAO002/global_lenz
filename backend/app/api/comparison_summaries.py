from fastapi import APIRouter

from app.services.comparison_service import (
    get_comparison_summaries,
    get_comparison_summary_by_id,
    get_comparison_detail
)

router = APIRouter()

@router.get("")
def read_comparison_summaries():

    return get_comparison_summaries()

@router.get("/{summary_id}")
def read_comparison_summary(summary_id: int):

    data = get_comparison_summary_by_id(summary_id)

    if not data:
        return {"message": "データが見つかりません"}

    return data

@router.get("/{id}/detail")
def read_comparison_detail(id: int):

    result = get_comparison_detail(id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Comparison not found"
        )

    return result