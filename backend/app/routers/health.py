from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "El Inge - Smart Grids API",
        "version": "1.0.0",
    }
