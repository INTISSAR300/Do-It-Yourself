const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const isAuthenticated = require('../middleware/auth');  // Middleware pour JWT

// Connexion à MongoDB
const url = 'mongodb://localhost:27012';
const dbName = 'diy_app';
const collectionName = 'users';
let db, users;

MongoClient.connect(url)
  .then(client => {
    db = client.db(dbName);
    users = db.collection(collectionName);
    console.log(' Connecté à MongoDB');
  })
  .catch(err => console.error(' Erreur de connexion MongoDB:', err));

const app = express();
app.use(bodyParser.json());

//  Ajouter un utilisateur
app.post('/users', async (req, res) => {
  try {
    const newUser = req.body;
    const result = await users.insertOne(newUser);
    res.status(201).json({ message: 'Utilisateur ajouté', user: result.ops[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l’ajout', error: err });
  }
});

// Lire tous les utilisateurs 
app.get('/users', isAuthenticated, async (req, res) => {
  try {
    const result = await users.find().toArray();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la lecture', error: err });
  }
});

// Modifier un utilisateur 
app.put('/users/:id', isAuthenticated, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const updateData = req.body;
    const result = await users.updateOne({ _id: id }, { $set: updateData });
    if (result.modifiedCount === 0) return res.status(404).json({ message: 'Aucune modification effectuée' });
    res.json({ message: 'Utilisateur modifié' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err });
  }
});

// Supprimer un utilisateur 
app.delete('/users/:id', isAuthenticated, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await users.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: err });
  }
});

// Démarrer le serveur
const PORT = 3001;
app.listen(PORT, () => {
  console.log(` User Service running at http://localhost:${PORT}`);
});
