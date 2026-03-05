"""FastAPI dependency for extracting the current authenticated user.

Uses Supabase's auth.get_user() to verify tokens, since Supabase issues
ES256-signed JWTs that require its public key for verification.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.supabase import supabase

security_scheme = HTTPBearer()


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    """Extract and validate the current user from the Bearer token.

    Calls Supabase auth.get_user() to verify the token server-side.
    Returns a dict with ``id`` and ``email`` keys.
    Raises HTTP 401 if the token is invalid or expired.
    """
    token = creds.credentials
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
        return {"id": str(user.id), "email": user.email or ""}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired",
        )
