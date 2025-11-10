from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import User

router = APIRouter(prefix="/_debug", tags=["_debug"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    rows = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "created_at": u.created_at.isoformat()
        }
        for u in rows
    ]
