from fastapi import APIRouter

auth_router = APIRouter()


@auth_router.post("/register")
def register():
    pass


@auth_router.post("/login")
def login():
    pass


@auth_router.get("/logout")
def logout():
    pass


@auth_router.get("/profile")
def profile():
    pass
