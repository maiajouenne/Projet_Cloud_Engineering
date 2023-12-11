from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import json
import threading
import schedule
import time
import random
import string

app = FastAPI()

class Article(BaseModel):
    nom: str
    prix: float
    quantite: int

class TicketDeCaisse(BaseModel):
    magasin: str
    numero_caisse: int
    nom_vendeur: str
    articles: List[Article]

    def calculer_total_ticket(self):
        total = 0
        for article in self.articles:
            total += article.prix * article.quantite
        return total

    def generer_ticket_json(self):
        ticket_json = {
            "magasin": self.magasin,
            "numero_caisse": self.numero_caisse,
            "nom_vendeur": self.nom_vendeur,
            "articles": [{"nom": article.nom, "prix": article.prix, "quantite": article.quantite} for article in self.articles],
            "total": self.calculer_total_ticket()
        }
        return ticket_json
    
def generer_nom_aleatoire(longueur=8):
    caracteres = string.ascii_letters + string.digits
    return ''.join(random.choice(caracteres) for _ in range(longueur))

# Liste pour stocker les tickets
tickets = []

# Fonction pour générer un ticket toutes les minutes
def generer_ticket_periodiquement():
    magasin = generer_nom_aleatoire()
    vendeur = generer_nom_aleatoire()

    articles = [
        Article(nom=f"Article {i}", prix=round(random.uniform(1.0, 20.0), 2), quantite=random.randint(1, 5))
        for i in range(1, random.randint(2, 5))
    ]

    ticket = TicketDeCaisse(
        magasin=magasin,
        numero_caisse=1,
        nom_vendeur=vendeur,
        articles=articles
    )

    ticket_json = ticket.generer_ticket_json()
    
    # Ajouter le ticket à la liste
    tickets.append(ticket_json)

    with open("tickets.json", "w") as file:
        json.dump(tickets, file)
    print("Ticket généré:", ticket_json)

# Planification de la tâche toutes les minutes
schedule.every(1).minutes.do(generer_ticket_periodiquement)

# Fonction pour exécuter la planification dans un thread
def run_schedule():
    while True:
        schedule.run_pending()
        time.sleep(1)

# Lancement du thread pour exécuter la planification
threading.Thread(target=run_schedule).start()

class TicketReponse(BaseModel):
    magasin: str
    numero_caisse: int
    nom_vendeur: str
    articles: List[Article]
    total: float

@app.post("/dernier_ticket", response_model=TicketReponse)
async def get_dernier_ticket():
    try:
        # Retourner le dernier ticket généré
        dernier_ticket = tickets[-1]
        return dernier_ticket
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du dernier ticket : {str(e)}")
