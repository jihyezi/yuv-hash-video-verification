from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from app.core.db import get_session
from app.models.image_hash import ImageHash
from app.services.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/hash", tags=["hash"])

class SaveHashIn(BaseModel):
    hash_hex: str
    filename: str | None = None
    meta_json: str | None = None

@router.post("/save")
def save_hash(
    payload: SaveHashIn,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    rec = ImageHash(
        user_id=user.id,
        hash_hex=payload.hash_hex,
        filename=payload.filename,
        meta_json=payload.meta_json,
    )
    session.add(rec)
    session.commit()
    session.refresh(rec)
    return {"id": rec.id, "user_id": rec.user_id, "hash_hex": rec.hash_hex}
