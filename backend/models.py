from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id       = Column(Integer, primary_key=True, index=True)
    email    = Column(String, unique=True, index=True, nullable=False)
    handle   = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    pages = relationship("Page", back_populates="owner", cascade="all, delete")


class Page(Base):
    __tablename__ = "pages"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    name       = Column(String, default="我的頁面")
    handle     = Column(String, unique=True, index=True, nullable=False)
    bio        = Column(Text, default="")
    emoji      = Column(String, default="🐦")
    theme      = Column(String, default="ocean")
    socials    = Column(JSON, default=list)
    published  = Column(Integer, default=1)   # 1 = public
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    owner  = relationship("User", back_populates="pages")
    blocks = relationship("Block", back_populates="page",
                          cascade="all, delete", order_by="Block.order")
    clicks = relationship("Click", back_populates="page", cascade="all, delete")


class Block(Base):
    __tablename__ = "blocks"

    id      = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("pages.id"), nullable=False)
    type    = Column(String, nullable=False)   # link | header | divider | socials | image
    order   = Column(Integer, default=0)
    data    = Column(JSON, default=dict)       # title, url, desc, text, platforms …

    page = relationship("Page", back_populates="blocks")


class Click(Base):
    __tablename__ = "clicks"

    id         = Column(Integer, primary_key=True, index=True)
    page_id    = Column(Integer, ForeignKey("pages.id"), nullable=False)
    block_id   = Column(Integer, nullable=True)   # which block was clicked
    ip         = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    page = relationship("Page", back_populates="clicks")
