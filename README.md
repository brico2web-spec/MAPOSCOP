# Groupe Bahia - Ahmed TOUR 🚗
## Site Web de Location de Voitures

**Location de Voitures | Change de Monnaie | Service Premium**

---

## 📋 Description

Site web complet et système de gestion de réservations pour **Groupe Bahia - Ahmed TOUR**, entreprise de location automobile basée à Kénitra, Maroc.

Le site inclut:
- ✅ Page d'accueil responsive et moderne
- ✅ Catalogue de véhicules interactif
- ✅ Formulaire de réservation avec validation
- ✅ Section services et contact
- ✅ Backend Node.js/Express pour gestion des réservations
- ✅ Système d'email pour confirmations

---

## 🗂️ Structure des Fichiers

```
groupe-bahia-ahmed-tour/
│
├── index.html              # Page principale HTML
├── styles.css              # Feuille de styles (responsive)
├── script.js               # Logique frontend JavaScript
├── server.js               # Backend Node.js/Express
├── package.json            # Dépendances NPM
├── reservations.json       # Stockage des réservations (généré auto)
└── README.md               # Ce fichier
```

---

## 🚀 Installation et Démarrage

### Option 1: Simple (Frontend uniquement)

Si vous voulez juste consulter le site web sans backend:

1. Ouvrez simplement `index.html` dans votre navigateur
2. Aucune installation requise!
3. Le formulaire de réservation fonctionnera en local (données non sauvegardées)

### Option 2: Complet (Frontend + Backend)

Pour un système complet avec sauvegarde des réservations:

#### Prérequis:
- **Node.js** (v14+) - Télécharger depuis https://nodejs.org/
- **npm** (inclus avec Node.js)

#### Étapes:

1. **Installez les dépendances:**
   ```bash
   npm install
   ```

2. **Démarrez le serveur:**
   ```bash
   npm start
   ```
   
   Le serveur démarre sur `http://localhost:3000`

3. **Accédez au site:**
   - Ouvrez votre navigateur
   - Allez à `http://localhost:3000`

---

## 🎨 Caractéristiques du Design

### Couleurs de Marque
- **Rouge primaire:** #D32F2F
- **Gris foncé:** #333333
- **Blanc:** #FFFFFF
- **Gris clair:** #F5F5F5

### Responsive Design
- ✅ Desktop (1200px+)
- ✅ Tablette (768px - 1199px)
- ✅ Mobile (< 768px)

---

## 📱 Pages et Sections

### 1. **En-tête (Header)**
- Logo Groupe Bahia
- Navigation principale
- Sticky (reste visible au scroll)

### 2. **Accueil (Hero)**
- Bannière attrayante
- Call-to-action "Réserver maintenant"
- Animation flottante

### 3. **Services**
- Location de voitures
- Change de monnaie
- Assurance complète
- Disponibilité 24/7

### 4. **Nos Véhicules**
- Galerie interactive
- 6 types de véhicules
- Prix et détails par véhicule
- Catégories: Économique, Confort, Premium

### 5. **Formulaire de Réservation**
- Validation en temps réel
- Champs: Nom, Email, Téléphone, Dates, Type de véhicule
- Calcul automatique du prix
- Message de confirmation

### 6. **Contact**
- Téléphones (mobile + fixe)
- Email
- Adresse physique à Kénitra

---

## 📋 API Endpoints (Backend)

Si vous utilisez le serveur Node.js:

### GET Requests
```
GET /                              # Page d'accueil
GET /api/cars                      # Liste des véhicules (JSON)
GET /api/reservations              # Toutes les réservations (admin)
```

### POST Request (Créer une réservation)
```
POST /api/reservations
Body (JSON):
{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "phone": "0661170182",
  "checkIn": "2024-09-15",
  "checkOut": "2024-09-20",
  "carType": "confort",
  "message": "Message optionnel"
}
```

### PUT Request (Mettre à jour une réservation)
```
PUT /api/reservations/:id
Body (JSON):
{
  "status": "confirmed" // ou "cancelled", "completed"
}
```

### DELETE Request (Supprimer une réservation)
```
DELETE /api/reservations/:id
```

---

## 📧 Configuration des Emails

Pour activer l'envoi d'emails automatiques:

1. **Variables d'environnement** (créez un fichier `.env`):
   ```
   EMAIL_USER=votre-email@gmail.com
   EMAIL_PASS=votre-mot-passe-app
   ```

2. **Gmail:**
   - Activer "Accès des applications moins sécurisées"
   - Ou utiliser un "Mot de passe d'application"
   - Plus d'info: https://support.google.com/accounts/answer/185833

3. **Autres services d'email:**
   - Modifier le service dans `server.js` ligne 25
   - Options: 'gmail', 'outlook', 'yahoo', 'sendgrid', etc.

---

## 🛠️ Développement

### Lancer avec rechargement automatique
```bash
npm run dev
```
(Nécessite nodemon: `npm install -D nodemon`)

### Dépendances
- **express** - Serveur web
- **body-parser** - Parsage des requêtes
- **cors** - Partage de ressources
- **nodemailer** - Envoi d'emails
- **nodemon** (dev) - Rechargement automatique

---

## 💾 Données des Réservations

Les réservations sont stockées dans `reservations.json`:

```json
[
  {
    "id": 1693123456789,
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phone": "0661170182",
    "checkIn": "2024-09-15",
    "checkOut": "2024-09-20",
    "carType": "confort",
    "status": "pending",
    "createdAt": "2024-09-07T15:30:00.000Z"
  }
]
```

---

## 🔐 Sécurité

### Validation Frontend
- Email valide
- Téléphone (10 chiffres)
- Dates cohérentes
- Champs obligatoires

### Validation Backend
- Vérification des champs requis
- Validation email
- Stockage JSON sécurisé

### À améliorer pour production:
- [ ] Base de données (MongoDB, MySQL)
- [ ] Authentification utilisateur
- [ ] HTTPS obligatoire
- [ ] Rate limiting
- [ ] Protection CSRF
- [ ] Paiement en ligne (Stripe, PayPal)

---

## 📞 Informations Contacts

**Groupe Bahia - Ahmed TOUR**
- 📱 Mobile: 06 61 17 01 82
- ☎️ Fixe: 05 37 37 88 89
- 📧 Email: ahmadi2011@live.fr
- 📍 Adresse: Angle Av. Imam Ali & Rue Yarik Ziad, Imm N°10 Mag N°4, Kénitra

---

## 🐛 Dépannage

### Problème: "Impossible d'accéder à http://localhost:3000"
**Solution:** 
- Vérifiez que Node.js est installé: `node --version`
- Vérifiez que le serveur est démarré: `npm start`
- Vérifiez le port 3000 n'est pas utilisé

### Problème: "npm: command not found"
**Solution:**
- Téléchargez et installez Node.js: https://nodejs.org/

### Problème: Les emails ne s'envoient pas
**Solution:**
- Vérifiez les variables d'environnement `.env`
- Vérifiez les logs de la console
- Testez d'abord sans email (frontend fonctionne quand même)

---

## 📈 Améliorations Futures

- [ ] Authentification admin
- [ ] Tableau de bord de gestion
- [ ] Paiement en ligne
- [ ] SMS notifications
- [ ] Photo de véhicules réels
- [ ] Avis clients
- [ ] Application mobile
- [ ] Intégration Google Maps
- [ ] Calcul des coûts multilingue
- [ ] Historique des réservations client

---

## 📄 Licence

MIT License - Libre d'utilisation et modification

---

## 👨‍💼 Support

Pour toute question ou amélioration:
- Email: ahmadi2011@live.fr
- Téléphone: 06 61 17 01 82

**Merci d'avoir choisi Groupe Bahia - Ahmed TOUR! 🚗**

---

**Dernière mise à jour:** Septembre 2024
**Version:** 1.0.0
