"""Authentication routes — signup, login, logout, Google OAuth via Supabase Auth."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.supabase import supabase
from app.core.config import settings
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Schema for Google OAuth response ──
class GoogleAuthResponse(BaseModel):
    url: str


class GoogleCallbackRequest(BaseModel):
    code: str


@router.post("/signup", response_model=TokenResponse)
async def signup(body: SignupRequest):
    """Register a new user and return an access token.

    The Supabase database trigger ``handle_new_user`` automatically creates
    a profile row and default notification preferences.
    """
    try:
        result = supabase.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
                "options": {
                    "data": {"full_name": body.full_name or ""}
                },
            }
        )

        # If email confirmation is disabled, we get a session immediately
        session = result.session
        if session:
            return TokenResponse(access_token=session.access_token)

        # If email confirmation is enabled, session is None but user is created.
        user = result.user
        if user and user.identities and len(user.identities) > 0:
            try:
                login_result = supabase.auth.sign_in_with_password(
                    {"email": body.email, "password": body.password}
                )
                if login_result.session:
                    return TokenResponse(access_token=login_result.session.access_token)
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_200_OK,
                detail="Account created — please confirm your email to log in",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}",
        )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """Authenticate a user and return an access token."""
    try:
        result = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )

        session = result.session
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        return TokenResponse(access_token=session.access_token)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout():
    """Sign out the current user session."""
    try:
        supabase.auth.sign_out()
    except Exception:
        pass  # Best-effort logout


# ── Google OAuth ──

@router.post("/google", response_model=GoogleAuthResponse)
async def google_sign_in():
    """Initiate Google OAuth sign-in via Supabase.

    Returns the OAuth URL that the frontend should redirect the user to.
    The user will authenticate with Google and be redirected back to the
    frontend callback URL.
    """
    try:
        # Determine the redirect URL (frontend callback page)
        origins = settings.cors_origins
        redirect_url = f"{origins[0]}/auth/callback" if origins else "http://localhost:5173/auth/callback"

        result = supabase.auth.sign_in_with_oauth(
            {
                "provider": "google",
                "options": {"redirect_to": redirect_url},
            }
        )

        return GoogleAuthResponse(url=result.url)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google sign-in failed: {str(e)}",
        )


@router.post("/callback", response_model=TokenResponse)
async def auth_callback(body: GoogleCallbackRequest):
    """Exchange an OAuth authorization code for a session token.

    Called by the frontend after Google redirects back with a code.
    """
    try:
        result = supabase.auth.exchange_code_for_session({"auth_code": body.code})

        session = result.session
        if not session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange code for session",
            )

        return TokenResponse(access_token=session.access_token)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Auth callback failed: {str(e)}",
        )

