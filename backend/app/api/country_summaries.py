from fastapi import APIRouter

from app.services.country_service import (
    get_country_summaries,
    get_country_summary_by_id 
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