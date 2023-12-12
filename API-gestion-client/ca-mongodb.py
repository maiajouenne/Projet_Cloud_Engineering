from fastapi import FastAPI
from pymongo import MongoClient
import os

app = FastAPI()

host_url = os.getenv("HOST_URL", "http://127.0.0.1:8000")  

@app.get("/data")
async def get_data():
    client = MongoClient("localhost", 27017, maxPoolSize=50)
    db = client.localhost
    collection = db["Ticket-valide"]

    data = collection.find({})
    
    ca_dict = {}
    for ticket in data:
        articles = ticket["articles"]
        ca = 0
        for article in articles:
            ca += article[1] * article[2]
        if ticket["magasin"] in ca_dict:
            ca_dict[ticket["magasin"]] += ca
        else:
            ca_dict[ticket["magasin"]] = ca

    return HTTPResponse(str(ca_dict), content_type="application/json")
