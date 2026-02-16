import chromadb
from chromadb.utils import embedding_functions
import os
from config import DATA_DIR

def test_query():
    chroma_path = os.path.join(DATA_DIR, "chroma_db")
    client = chromadb.PersistentClient(path=chroma_path)
    
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    collection = client.get_collection(name="pois", embedding_function=ef)
    
    query_text = "historic buildings" # English model "all-MiniLM-L6-v2" works best with English. 
    # If user wants Chinese support, we should use a multilingual model like "paraphrase-multilingual-MiniLM-L12-v2".
    # But for now, let's try "historic buildings" against our English dummy data.
    
    print(f"Querying: '{query_text}'")
    results = collection.query(
        query_texts=[query_text],
        n_results=2
    )
    
    print("Results:")
    for i, doc in enumerate(results['documents'][0]):
        print(f"{i+1}. {doc}")
        print(f"   Metadata: {results['metadatas'][0][i]}")
        print(f"   Distance: {results['distances'][0][i]}")

if __name__ == "__main__":
    test_query()
