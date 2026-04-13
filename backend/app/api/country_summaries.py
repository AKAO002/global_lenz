from fastapi import APIRouter

from app.services.country_service import (
    get_country_summaries
)

router = APIRouter()

@router.get("")
def read_country_summaries():

    return get_country_summaries()