from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, pages, analytics

# create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LinkBio API", version="1.0.0")

import os

_origins = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pages.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}
