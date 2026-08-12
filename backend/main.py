import os
from datetime import datetime, UTC
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
DB_NAME = "portfolio"

client: MongoClient = None
db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    yield
    client.close()


app = FastAPI(title="Portfolio Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ContactRequest(BaseModel):
    name: str
    email: EmailStr


class ChatRequest(BaseModel):
    messages: list[dict]


@app.get("/api/contacts")
async def get_contacts():
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    contacts = []
    for doc in db.contacts.find().sort("createdAt", -1):
        doc["_id"] = str(doc["_id"])
        doc["createdAt"] = doc["createdAt"].isoformat()
        contacts.append(doc)

    return {"contacts": contacts, "total": len(contacts)}


@app.post("/api/contact")
async def contact(contact: ContactRequest):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    doc = {
        "name": contact.name,
        "email": contact.email,
        "createdAt": datetime.now(UTC),
    }
    db.contacts.insert_one(doc)

    return {"message": "Thank you! Your message has been received."}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="Server configuration error: Missing API Key")

    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {NVIDIA_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "messages": request.messages,
                    "model": "meta/llama-3.1-8b-instruct",
                    "temperature": 1,
                    "top_p": 0.95,
                    "max_tokens": 2048,
                    "stream": False,
                },
                timeout=60.0,
            )

            data = response.json()

            if response.status_code != 200:
                detail = data.get("error", {}).get("message", "Failed to fetch from NVIDIA API")
                raise HTTPException(status_code=response.status_code, detail=detail)

            return data

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
