import httpx
from jose import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co"
JWKS_URL = f"{SUPABASE_URL}/auth/v1/keys"
ALGORITHM = "RS256"

security = HTTPBearer()


# JWKS取得（キャッシュなし簡易版）
async def get_jwks():
    async with httpx.AsyncClient() as client:
        res = await client.get(JWKS_URL)
        return res.json()


# JWT検証
async def verify_jwt(token: str):
    jwks = await get_jwks()

    try:
        header = jwt.get_unverified_header(token)
        kid = header["kid"]

        key = None
        for k in jwks["keys"]:
            if k["kid"] == kid:
                key = k
                break

        if key is None:
            raise HTTPException(status_code=401, detail="Invalid token key")

        payload = jwt.decode(
            token,
            key,
            algorithms=[ALGORITHM],
            audience="authenticated",
            issuer=f"{SUPABASE_URL}/auth/v1",
        )

        return payload

    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")


# FastAPI dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    payload = await verify_jwt(token)

    return {
        "id": payload.get("sub"),
        "email": payload.get("email"),
    }