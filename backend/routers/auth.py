from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
import models
import auth as auth_utils

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterIn(BaseModel):
    email: str
    handle: str
    password: str

class LoginIn(BaseModel):
    email: str
    password: str

class AuthOut(BaseModel):
    token: str
    user: dict

@router.post("/register", response_model=AuthOut)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email 已被使用")
    if db.query(models.User).filter(models.User.handle == body.handle).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Handle 已被使用")
    user = models.User(
        email=body.email,
        handle=body.handle,
        password=auth_utils.hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # create a default page
    page = models.Page(user_id=user.id, handle=body.handle, name=body.handle)
    db.add(page)
    db.commit()
    return {"token": auth_utils.create_token(user.id),
            "user": {"id": user.id, "email": user.email, "handle": user.handle}}

@router.post("/login", response_model=AuthOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not auth_utils.verify_password(body.password, user.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "帳號或密碼錯誤")
    return {"token": auth_utils.create_token(user.id),
            "user": {"id": user.id, "email": user.email, "handle": user.handle}}

@router.get("/me")
def me(current_user: models.User = Depends(auth_utils.get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "handle": current_user.handle}
