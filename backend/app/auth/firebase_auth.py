"""Vérification stricte des Firebase ID Tokens côté FastAPI."""
from typing import Any
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import firebase_admin
from firebase_admin import auth as firebase_auth
from app.core.config import get_settings
from app.schemas.hydrology import UserProfileOut

security_scheme = HTTPBearer(auto_error=False)


def _ensure_firebase_initialized() -> None:
    if not firebase_admin._apps:
        settings = get_settings()
        firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> UserProfileOut | None:
    if credentials is None or not credentials.credentials:
        return None
    token = credentials.credentials
    settings = get_settings()
    try:
        _ensure_firebase_initialized()
        decoded: dict[str, Any] = firebase_auth.verify_id_token(token)
        email = decoded.get("email")
        role = "admin" if email in settings.admin_emails or decoded.get("admin") is True else "viewer"
        return UserProfileOut(
            uid=decoded["uid"],
            email=email,
            display_name=decoded.get("name") or email,
            role=role,
            authenticated=True,
            project_id=settings.firebase_project_id,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Firebase ID Token invalide ou expiré: {exc}",
        ) from exc


async def require_authenticated_user(
    user: UserProfileOut | None = Depends(get_optional_user),
) -> UserProfileOut:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification Firebase requise (Bearer token).",
        )
    return user


async def require_admin_user(
    user: UserProfileOut = Depends(require_authenticated_user),
) -> UserProfileOut:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Droits administrateur requis pour exécuter cette opération.",
        )
    return user
