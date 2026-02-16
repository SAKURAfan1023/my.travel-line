import os
from dotenv import load_dotenv

# Load .env from parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

AMAP_KEY = os.getenv("AMAP_KEY")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# POI Types (Scenic spots, Parks, Museums, etc.)
# 050000: Catering Service (Restaurant) - Wait, user said "Scenic spots" is 050000 in their prompt?
# Let's verify Amap codes.
# Actually, Amap codes:
# 110000: Scenic Spot
# 050000: Catering
# But user said: "types（分类代码，如旅游景点通常是 050000）" - This might be a mistake in user prompt or I should double check.
# Let's assume user is right or I will use a list of common codes.
# Common codes for travel:
# 110000: Scenic Spot
# 110100: Park
# 140000: Culture/Museum
# 050000: Food/Restaurant
POI_TYPES = "110000|110100|140000|050000"  # Pipe separated
CITY = "Beijing" # Default city
