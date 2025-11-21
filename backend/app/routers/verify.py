from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
import os
import shutil
import uuid
from app.core.supabase_client import supabase
from security.au import generate_user_secret_key
from security.hash import generate_chroma_hash
from security.verify_logic import verify_image

router = APIRouter(prefix="/verify", tags=["Verify"])