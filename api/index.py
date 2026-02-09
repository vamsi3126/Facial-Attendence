"""
Vercel serverless entry point for FastAPI app.
This file is used by Vercel to run the FastAPI application as serverless functions.
"""
import os
import sys
from pathlib import Path

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

# Import the FastAPI app
from app.main import app

# Vercel expects a handler function
# FastAPI can be used directly as ASGI app
handler = app
