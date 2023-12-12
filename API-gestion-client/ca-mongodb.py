from fastapi import FastAPI
from pymongo import MongoClient
import os

app = FastAPI()

host_url = os.getenv("HOST_URL", "http://127.0.0.1:50127")
mongo_client = os.getenv("MONGO_CLIENT", "localhost")
mongo_port = os.getenv("MONGO_PORT", 27017)  

@app.get("/data")
async def get_data():
    client = MongoClient(mongo_client, mongo_port, maxPoolSize=50)
    db = client.localhost
    collection = db["Ticket-valide"]

    data = collection.find({})
    
    ca_dict = {}
    for ticket in data:
        if ticket["magasin"] in ca_dict:
            ca_dict[ticket["magasin"]] += ticket["total"]
        else:
            ca_dict[ticket["magasin"]] = ticket["total"]

    return ca_dict

