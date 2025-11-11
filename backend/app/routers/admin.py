# app/routers/admin.py
from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import User, Media

router = APIRouter(prefix="/admin", tags=["admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/users", response_class=HTMLResponse)
def users_table(db: Session = Depends(get_db)):
    rows = db.query(User).order_by(User.id.asc()).all()

    html_rows = []
    for u in rows:
        html_rows.append(
            f"<tr><td>{u.id}</td><td>{u.email}</td>"
            f"<td>{u.hashed_password}</td><td>{u.created_at}</td></tr>"
        )

    html = f"""
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Users</title>
        <style>
          body{{font-family:ui-sans-serif,system-ui,Segoe UI,Arial}}
          table{{border-collapse:collapse;width:100%}}
          th,td{{border:1px solid #ddd;padding:8px}}
          th{{background:#f3f4f6;text-align:left}}
          tr:nth-child(even){{background:#fafafa}}
          .wrap{{max-width:1200px;margin:32px auto}}
          h1{{margin:0 0 12px}}
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>Users</h1>
          <table>
            <thead>
              <tr><th>ID</th><th>Email</th><th>Hashed Password</th><th>Created At</th></tr>
            </thead>
            <tbody>
              {''.join(html_rows) if html_rows else '<tr><td colspan="4">No users</td></tr>'}
            </tbody>
          </table>
        </div>
      </body>
    </html>
    """
    return HTMLResponse(html)

@router.get("/media", response_class=HTMLResponse)
def media_table(db: Session = Depends(get_db)):
    rows = db.query(Media).order_by(Media.id.asc()).all()

    html_rows = []
    for m in rows:
        html_rows.append(
            f"<tr><td>{m.id}</td><td>{m.owner_id}</td><td>{m.filename}</td>"
            f"<td>{m.mimetype}</td><td>{m.size_bytes}</td>"
            f"<td>{m.uv_hash}</td><td>{m.created_at}</td></tr>"
        )

    html = f"""
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Media</title>
        <style>
          body{{font-family:ui-sans-serif,system-ui,Segoe UI,Arial}}
          table{{border-collapse:collapse;width:100%}}
          th,td{{border:1px solid #ddd;padding:8px;vertical-align:top;word-break:break-all}}
          th{{background:#f3f4f6;text-align:left}}
          tr:nth-child(even){{background:#fafafa}}
          .wrap{{max-width:1200px;margin:32px auto}}
          h1{{margin:0 0 12px}}
          code{{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace}}
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>Media</h1>
          <table>
            <thead>
              <tr><th>ID</th><th>Owner ID</th><th>Filename</th><th>Mime</th><th>Size</th><th>UV Hash</th><th>Created At</th></tr>
            </thead>
            <tbody>
              {''.join(html_rows) if html_rows else '<tr><td colspan="7">No media</td></tr>'}
            </tbody>
          </table>
        </div>
      </body>
    </html>
    """
    return HTMLResponse(html)
