from fastapi import APIRouter,HTTPException

from app.services.country_service import (
    get_country_summaries,
    get_country_summary_by_id,
    get_country_detail
)

router = APIRouter()

@router.get("")
def read_country_summaries():

    return get_country_summaries()

@router.get("/{summary_id}")
def read_country_summary(summary_id: int):

    data = get_country_summary_by_id(summary_id)

    if not data:
        return {"message": "データが見つかりません"}

    return data

@router.get("/{id}/detail")
def read_country_detail(id: int):

    result = get_country_detail(id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Country summary not found"
        )

    return result
