from fastapi import APIRouter

from app.services.comparison_service import (
    get_comparison_summaries
)

router = APIRouter()

@router.get("")
def read_comparison_summaries():

    return get_comparison_summaries()