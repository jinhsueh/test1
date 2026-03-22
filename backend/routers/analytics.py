from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class ClickIn(BaseModel):
    page_handle: str
    block_id: Optional[int] = None

@router.post("/click")
def record_click(body: ClickIn, request: Request, db: Session = Depends(get_db)):
    """Public endpoint — called when a visitor clicks a link."""
    page = db.query(models.Page).filter(models.Page.handle == body.page_handle).first()
    if not page:
        raise HTTPException(404, "頁面不存在")
    ip = request.client.host if request.client else None
    db.add(models.Click(page_id=page.id, block_id=body.block_id, ip=ip))
    db.commit()
    return {"ok": True}

@router.get("/{page_id}")
def get_analytics(page_id: int,
                  user: models.User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    """Returns click stats for the owner."""
    page = db.get(models.Page, page_id)
    if not page or page.user_id != user.id:
        raise HTTPException(404, "頁面不存在")

    total = db.query(func.count(models.Click.id)).filter(
        models.Click.page_id == page_id).scalar()

    # clicks per block
    by_block = db.query(
        models.Click.block_id, func.count(models.Click.id).label("cnt")
    ).filter(models.Click.page_id == page_id).group_by(models.Click.block_id).all()

    # clicks per day (last 30 days)
    by_day = db.query(
        func.date(models.Click.created_at).label("day"),
        func.count(models.Click.id).label("cnt")
    ).filter(models.Click.page_id == page_id).group_by("day").order_by("day").all()

    return {
        "total": total,
        "by_block": [{"block_id": r.block_id, "clicks": r.cnt} for r in by_block],
        "by_day":   [{"day": r.day, "clicks": r.cnt} for r in by_day],
    }
