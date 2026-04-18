import httpx,os
from jose import jwt
from fastapi import HTTPException, Depends,  status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


ALGORITHMS = ["ES256"]
security = HTTPBearer(auto_error=False)

# JWKS取得（キャッシュなし簡易版）
async def get_jwks():
    # 関数の「中」で環境変数を取得する
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

    # もしここでも None なら、確実にここでエラーを止めて原因を特定する
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print(f"CRITICAL ERROR: URL={SUPABASE_URL}, KEY={SUPABASE_ANON_KEY}") # ログに出力
        raise HTTPException(status_code=500, detail="Backend configuration error (Env vars missing)")

    JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

    async with httpx.AsyncClient() as client:
        res = await client.get(
            JWKS_URL,
            headers={
                "apikey": SUPABASE_ANON_KEY,
            }
        )
        return res.json()
# JWT検証
async def verify_jwt(token: str):
    # URLを検証時にも使うため取得
    supabase_url = os.getenv("SUPABASE_URL")
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
            algorithms=ALGORITHMS,
            audience="authenticated",
            issuer=f"{supabase_url}/auth/v1",
        )
        return payload

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# 必須ログイン用
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    print("DEBUG credentials:", credentials)


    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    try:
        token = credentials.credentials

        payload = await verify_jwt(token)

        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# 任意ログイン用
async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):

    if not credentials:
        return None

    try:
        token = credentials.credentials

        payload = await verify_jwt(token)

        return payload

    except Exception:
        return None