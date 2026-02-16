import pandas as pd
import chromadb
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer
import os
from config import DATA_DIR

def vectorize_data():
    input_file = os.path.join(DATA_DIR, "cleaned_pois.csv")
    if not os.path.exists(input_file):
        print(f"Input file {input_file} not found.")
        return

    print("Loading cleaned data...")
    df = pd.read_csv(input_file)
    
    # Construct text for embedding
    # "Name: {name}, Type: {type}, Address: {address}"
    # If there is an intro/description, use it. But usually POI API doesn't give long description.
    # We use what we have.
    df['text_to_embed'] = df.apply(
        lambda x: f"Name: {x['name']}; Type: {x['type']}; Address: {x['address']}; City: {x.get('cityname', '')}", 
        axis=1
    )
    
    documents = df['text_to_embed'].tolist()
    ids = df['id'].astype(str).tolist()
    metadatas = df[['name', 'type', 'address', 'longitude', 'latitude', 'rating']].to_dict(orient='records')
    
    # Handle NaN in metadata
    for meta in metadatas:
        for k, v in meta.items():
            if pd.isna(v):
                meta[k] = ""
            elif isinstance(v, float): # Chroma metadata supports int, float, str, bool
                meta[k] = float(v)

    print("Initializing ChromaDB...")
    chroma_path = os.path.join(DATA_DIR, "chroma_db")
    client = chromadb.PersistentClient(path=chroma_path)
    
    # Use a local embedding model
    # sentence-transformers/all-MiniLM-L6-v2
    # We can use Chroma's built-in support or do it manually.
    # Using built-in is easier.
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    
    collection_name = "pois"
    # Delete if exists to refresh
    try:
        client.delete_collection(collection_name)
    except:
        pass
        
    collection = client.create_collection(name=collection_name, embedding_function=ef)
    
    print(f"Embedding and storing {len(documents)} documents...")
    
    # Add in batches to avoid memory issues if large
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        batch_docs = documents[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        batch_metas = metadatas[i:i+batch_size]
        
        collection.add(
            documents=batch_docs,
            ids=batch_ids,
            metadatas=batch_metas
        )
        print(f"Processed {i + len(batch_docs)}/{len(documents)}")
        
    print("Vectorization complete.")

if __name__ == "__main__":
    vectorize_data()
