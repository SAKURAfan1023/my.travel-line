import os
import sys
from fetch_pois import fetch_pois
from clean_data import clean_data
from vectorize_data import vectorize_data

def run_pipeline():
    print("Starting data pipeline...")
    
    # Step 1: Fetch POIs
    try:
        fetch_pois()
    except Exception as e:
        print(f"Error in fetching POIs: {e}")
        return

    # Step 2: Clean Data
    try:
        clean_data()
    except Exception as e:
        print(f"Error in cleaning data: {e}")
        return

    # Step 3: Vectorize Data
    try:
        vectorize_data()
    except Exception as e:
        print(f"Error in vectorization: {e}")
        return

    print("Pipeline completed successfully.")

if __name__ == "__main__":
    run_pipeline()
