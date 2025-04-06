const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const isAuthenticated = require('../middleware/auth');  // Middleware pour JWT

// Connexion à MongoDB
const url = 'mongodb://localhost:27012';
const dbName = 'diy_app';
const collectionName = 'workshops';
let db, workshops;

MongoClient.connect(url)
  .then(client => {
    db = client.db(dbName);
    workshops = db.collection(collectionName);
    console.log(' Connecté à MongoDB');
  })
  .catch(err => console.error(' Erreur de connexion MongoDB:', err));

const app = express();
app.use(bodyParser.json());

//  Ajouter un atelier 
app.post('/workshops', isAuthenticated, async (req, res) => {
  try {
    const newWorkshop = req.body;
    const result = await workshops.insertOne(newWorkshop);
    res.status(201).json({ message: 'Atelier ajouté', workshop: result.ops[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l’ajout', error: err });
  }
});

// Lire tous les ateliers 
app.get('/workshops', async (req, res) => {
  try {
    const result = await workshops.find().toArray();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la lecture', error: err });
  }
});

// Modifier un atelier 
app.put('/workshops/:id', isAuthenticated, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const updateData = req.body;
    const result = await workshops.updateOne({ _id: id }, { $set: updateData });
    if (result.modifiedCount === 0) return res.status(404).json({ message: 'Aucune modification effectuée' });
    res.json({ message: 'Atelier modifié' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err });
  }
});

//  Supprimer un atelier 
app.delete('/workshops/:id', isAuthenticated, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await workshops.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Atelier non trouvé' });
    res.json({ message: 'Atelier supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: err });
  }
});

// Démarrer le serveur
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🛠 Workshop Service running at http://localhost:${PORT}`);
});
