from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from app.core.db import get_session
from app.services.security import decode_access_token
from app.models.user import User

auth_scheme = HTTPBearer()

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(auth_scheme),
    session: Session = Depends(get_session),
) -> User:
    sub = decode_access_token(creds.credentials)
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = session.exec(select(User).where(User.id == int(sub))).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
