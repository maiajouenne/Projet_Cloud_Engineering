from fastapi import FastAPI
from pymongo import MongoClient
import os

app = FastAPI()

host_url = os.getenv("HOST_URL", "http://127.0.0.1:50127")  

@app.get("/data")
async def get_data():
    client = MongoClient("localhost", 27017, maxPoolSize=50)
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

