"""Routes FastAPI complètes pour HydroMonitor."""
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from app.auth.firebase_auth import get_optional_user, require_admin_user, require_authenticated_user
from app.schemas.hydrology import UserProfileOut
from app.services.river_service import RiverService

router = APIRouter()
service = RiverService()


@router.get("/health")
async def health_check() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "hydromonitor-backend",
        "postgis": "enabled",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/api/me", response_model=UserProfileOut)
async def get_current_user_profile(
    user: UserProfileOut = Depends(require_authenticated_user),
) -> UserProfileOut:
    return user


@router.get("/api/rivers")
async def list_rivers(
    country: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    items = service.list_rivers(country=country, limit=limit, offset=offset)
    return {"items": items, "total": len(items), "limit": limit, "offset": offset}


@router.get("/api/rivers/search")
async def search_rivers(q: str = Query(default="", min_length=0)) -> dict[str, Any]:
    results = service.search_rivers(q)
    return {"query": q, "results": results, "count": len(results)}


@router.get("/api/rivers/nearby")
async def get_nearby_rivers(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(default=25.0, gt=0.1, le=500.0),
) -> dict[str, Any]:
    items = service.find_nearby(lat=lat, lon=lon, radius_km=radius_km)
    return {"lat": lat, "lon": lon, "radius_km": radius_km, "items": items}


@router.get("/api/rivers/{river_id}")
async def get_river_detail(river_id: str) -> dict[str, Any]:
    for r in service.list_rivers():
        if r["id"] == river_id or r["river_code"].lower() == river_id.lower():
            return r
    raise HTTPException(status_code=404, detail=f"Cours d'eau '{river_id}' introuvable.")
