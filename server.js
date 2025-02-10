require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour traiter les données du formulaire
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Exemple : smtp.gmail.com
  port: process.env.SMTP_PORT || 587, // Par défaut 587 pour TLS
  secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER, // Adresse email de l'expéditeur
    pass: process.env.SMTP_PASS, // Mot de passe ou clé API
  },
});

// Endpoint pour gérer les soumissions de formulaire
app.post('/api/loans', async (req, res) => {
  const { name, email, amount, reason, duration } = req.body;

  if (!name || !email || !amount || !reason || !duration) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  // Contenu de l'email
  const mailOptions = {
    from: process.env.SMTP_USER, // Adresse email expéditeur
    to: process.env.NOTIFY_EMAIL, // Adresse email destinataire (vous-même)
    subject: 'Nouvelle demande de prêt - ALAFIA',
    text: `Une nouvelle demande de prêt a été soumise :

Nom complet : ${name}
Email : ${email}
Montant du prêt : ${amount} FCFA
Motif : ${reason}
Durée de remboursement : ${duration} mois

Merci de vérifier les détails.`,
  };

  try {
    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Demande envoyée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l'envoi de l'email :', error);
    res.status(500).json({ message: 'Une erreur est survenue. Veuillez réessayer plus tard.' });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
