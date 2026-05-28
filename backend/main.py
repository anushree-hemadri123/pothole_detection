from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import auth, images
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pothole Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.include_router(auth.router,   prefix="/api/auth",   tags=["Auth"])
app.include_router(images.router, prefix="/api/images", tags=["Images"])

@app.get("/")
def root():
    return {"message": "Pothole API running!"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    # Disable reload in production (when port is not 8000)
    reload_mode = True if port == 8000 else False
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_mode)