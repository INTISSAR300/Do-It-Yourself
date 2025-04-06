const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const isAuthenticated = require('../middleware/auth');  // Middleware pour JWT

// Connexion à MongoDB
const url = 'mongodb://localhost:27012';
const dbName = 'diy_app';
const collectionName = 'reservations';
let db, reservations;

MongoClient.connect(url)
  .then(client => {
    db = client.db(dbName);
    reservations = db.collection(collectionName);
    console.log(' Connecté à MongoDB');
  })
  .catch(err => console.error(' Erreur de connexion MongoDB:', err));

const app = express();
app.use(bodyParser.json());

//  Créer une réservation 
app.post('/reservations', isAuthenticated, async (req, res) => {
  try {
    const newReservation = req.body;
    const result = await reservations.insertOne(newReservation);
    res.status(201).json({ message: 'Réservation effectuée', reservation: result.ops[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la réservation', error: err });
  }
});

//  Lire toutes les réservations d'un utilisateur 
app.get('/reservations/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await reservations.find({ userId }).toArray();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la lecture des réservations', error: err });
  }
});

//  Modifier une réservation 
app.put('/reservations/:id', isAuthenticated, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const updateData = req.body;
    const result = await reservations.updateOne({ _id: id }, { $set: updateData });
    if (result.modifiedCount === 0) return res.status(404).json({ message: 'Aucune modification effectuée' });
    res.json({ message: 'Réservation modifiée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err });
  }
});

// Supprimer une réservation 
app.delete('/reservations/:id', isAuthenticated, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await reservations.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Réservation non trouvée' });
    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: err });
  }
});

// Démarrer le serveur
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🛠 Reservation Service running at http://localhost:${PORT}`);
});
