from fastapi import FastAPI, status 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from main_thread import MainThread

main_thread = MainThread()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:    
        print("Application is beginning...")
        main_thread.start()  # Start the thread
        print("Application is starting up...")
        yield  # This is where the app runs
    finally:
        print("Application is shutting down...")
        main_thread.stop_thread()


app = FastAPI(lifespan=lifespan)
# CORS configuration
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(
    path="/",
    status_code=status.HTTP_200_OK,
    summary="Example on fastAPI",
    tags=["example"]
) 
async def example():
    return main_thread.toggleLightsState()

@app.get("/status")
async def get_status():
    return main_thread.get_all_states()

@app.post("/device/{room}/{device}/{state}")
async def control_device(room: str, device: str, state: int):
    topic = f"home/{room}/{device}"
    return main_thread.set_device_state(topic, state)
