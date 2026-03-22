from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Any
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/api/pages", tags=["pages"])

# ── schemas ──────────────────────────────────────────────
class BlockIn(BaseModel):
    id: Optional[int] = None
    type: str
    order: int
    data: dict = {}

class PageIn(BaseModel):
    name: Optional[str] = None
    handle: Optional[str] = None
    bio: Optional[str] = None
    emoji: Optional[str] = None
    theme: Optional[str] = None
    socials: Optional[List[str]] = None
    blocks: Optional[List[BlockIn]] = None

def page_out(page: models.Page) -> dict:
    return {
        "id": page.id,
        "handle": page.handle,
        "name": page.name,
        "bio": page.bio,
        "emoji": page.emoji,
        "theme": page.theme,
        "socials": page.socials or [],
        "published": page.published,
        "blocks": [
            {"id": b.id, "type": b.type, "order": b.order, "data": b.data or {}}
            for b in page.blocks
        ],
    }

# ── routes ───────────────────────────────────────────────
@router.get("/")
def list_pages(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [page_out(p) for p in user.pages]

@router.post("/", status_code=201)
def create_page(body: PageIn, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    handle = body.handle or f"{user.handle}-{len(user.pages)+1}"
    if db.query(models.Page).filter(models.Page.handle == handle).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Handle 已被使用")
    page = models.Page(user_id=user.id, handle=handle,
                       name=body.name or "我的頁面",
                       bio=body.bio or "", emoji=body.emoji or "🐦",
                       theme=body.theme or "ocean", socials=body.socials or [])
    db.add(page)
    db.commit()
    db.refresh(page)
    return page_out(page)

@router.get("/{page_id}")
def get_page(page_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    page = db.get(models.Page, page_id)
    if not page or page.user_id != user.id:
        raise HTTPException(404, "頁面不存在")
    return page_out(page)

@router.put("/{page_id}")
def update_page(page_id: int, body: PageIn,
                user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    page = db.get(models.Page, page_id)
    if not page or page.user_id != user.id:
        raise HTTPException(404, "頁面不存在")

    if body.name    is not None: page.name    = body.name
    if body.bio     is not None: page.bio     = body.bio
    if body.emoji   is not None: page.emoji   = body.emoji
    if body.theme   is not None: page.theme   = body.theme
    if body.socials is not None: page.socials = body.socials

    if body.blocks is not None:
        # replace all blocks
        for b in page.blocks:
            db.delete(b)
        db.flush()
        for i, bdata in enumerate(body.blocks):
            db.add(models.Block(page_id=page.id, type=bdata.type,
                                order=i, data=bdata.data))

    db.commit()
    db.refresh(page)
    return page_out(page)

@router.delete("/{page_id}", status_code=204)
def delete_page(page_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    page = db.get(models.Page, page_id)
    if not page or page.user_id != user.id:
        raise HTTPException(404, "頁面不存在")
    db.delete(page)
    db.commit()

# ── public endpoint (no auth) ────────────────────────────
@router.get("/public/{handle}")
def get_public_page(handle: str, db: Session = Depends(get_db)):
    page = db.query(models.Page).filter(
        models.Page.handle == handle, models.Page.published == 1
    ).first()
    if not page:
        raise HTTPException(404, "頁面不存在")
    return page_out(page)
