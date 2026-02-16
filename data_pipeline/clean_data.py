import pandas as pd
import os
import ast
from config import DATA_DIR

def clean_data():
    input_file = os.path.join(DATA_DIR, "raw_pois.csv")
    if not os.path.exists(input_file):
        print(f"Input file {input_file} not found.")
        return

    print("Cleaning data...")
    df = pd.read_csv(input_file)
    print(f"Original records: {len(df)}")

    # 1. Drop missing location
    df = df.dropna(subset=['location'])
    print(f"After dropping missing location: {len(df)}")

    # 2. Split location into longitude and latitude
    # location is usually "lon,lat" string
    try:
        df[['longitude', 'latitude']] = df['location'].str.split(',', expand=True).astype(float)
    except Exception as e:
        print(f"Error splitting location: {e}")
        return

    # 3. Filter by status (if available)
    # Check for keywords in name that indicate closed status
    closed_keywords = ["暂停开放", "永久关闭", "装修中", "待开业", "停业"]
    df = df[~df['name'].str.contains('|'.join(closed_keywords), na=False)]
    print(f"After filtering closed status by name: {len(df)}")
    
    # 4. Filter by rating (from biz_ext)
    # biz_ext is often a string like "{'rating': '4.5', ...}" or just columns if flattened.
    # Let's try to extract rating from biz_ext if it's a string column.
    if 'biz_ext' in df.columns:
        def get_rating(val):
            try:
                if isinstance(val, str):
                    val = ast.literal_eval(val)
                if isinstance(val, dict):
                    return float(val.get('rating', 0) or 0)
            except:
                pass
            return 0.0
        
        # Note: In the CSV fetched by pandas from JSON list, biz_ext might be already dict or string.
        # But pandas read_csv reads it as string.
        df['rating'] = df['biz_ext'].apply(get_rating)
        
        # Filter low rating (e.g., < 3.0)
        # But be careful, many spots might have 0.0 rating (no rating). We might want to keep them or drop them.
        # User said: "剔除评价数少于 10 条或评分低于 3.0 的小众地点"
        # We'll filter only if rating > 0 and rating < 3.0. If 0 (unknown), maybe keep it?
        # Let's drop strictly < 3.0 if it has a rating.
        df = df[~((df['rating'] > 0) & (df['rating'] < 3.0))]
        print(f"After filtering low ratings: {len(df)}")

    # 5. Remove duplicates
    df = df.drop_duplicates(subset=['id'])
    print(f"After removing duplicates: {len(df)}")

    # Save cleaned data
    output_file = os.path.join(DATA_DIR, "cleaned_pois.csv")
    df.to_csv(output_file, index=False, encoding="utf-8-sig")
    print(f"Saved {len(df)} cleaned POIs to {output_file}")

if __name__ == "__main__":
    clean_data()
