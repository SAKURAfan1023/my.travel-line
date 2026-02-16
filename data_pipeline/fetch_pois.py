import requests
import pandas as pd
import time
import os
from config import AMAP_KEY, DATA_DIR, POI_TYPES, CITY

def fetch_pois(city=CITY, keywords="景点", types=POI_TYPES, max_pages=20):
    """
    Fetch POI data from Amap API.
    """
    if not AMAP_KEY:
        print("Error: AMAP_KEY not found.")
        return

    url = "https://restapi.amap.com/v3/place/text"
    all_pois = []
    
    print(f"Fetching POIs for city: {city}, keywords: {keywords}...")

    for page in range(1, max_pages + 1):
        params = {
            "key": AMAP_KEY,
            "keywords": keywords,
            "types": types,
            "city": city,
            "citylimit": "true",
            "offset": 20,
            "page": page,
            "extensions": "all"
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "1":
                pois = data["pois"]
                if not pois:
                    print(f"No more POIs found at page {page}.")
                    break
                
                print(f"Page {page}: Fetched {len(pois)} POIs.")
                all_pois.extend(pois)
                
                # Sleep to avoid rate limiting
                time.sleep(0.5)
            else:
                print(f"Error: {data.get('info')}")
                break
                
        except Exception as e:
            print(f"Request failed: {e}")
            break

    if all_pois:
        df = pd.DataFrame(all_pois)
        # Select relevant columns
        columns = ["id", "name", "type", "typecode", "address", "location", "tel", "pname", "cityname", "adname", "business_area", "photos", "gridcode", "biz_ext"]
        # Filter columns that exist
        df = df[[c for c in columns if c in df.columns]]
        
        output_file = os.path.join(DATA_DIR, "raw_pois.csv")
        df.to_csv(output_file, index=False, encoding="utf-8-sig")
        print(f"Saved {len(df)} POIs to {output_file}")
    else:
        print("No POIs fetched.")

if __name__ == "__main__":
    fetch_pois()
