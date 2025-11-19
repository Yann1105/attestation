# 🎓 Système de Gestion d'Attestations BIMADES

Système complet de gestion et génération d'attestations de formation avec interface administrateur et éditeur graphique avancé.

## 🚀 Fonctionnalités

### Interface Participant
- ✅ Formulaire de demande d'attestation
- ✅ Validation des données en temps réel
- ✅ Confirmation par email automatique

### Interface Administrateur
- ✅ Authentification sécurisée (JWT)
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des participants (CRUD)
- ✅ Gestion des formations (CRUD)
- ✅ Éditeur graphique de certificats (type Photoshop/Canva)
- ✅ Génération automatique de PDF
- ✅ Envoi d'emails avec pièces jointes
- ✅ Historique et rapports

### Éditeur de Certificats
- 🎨 Outils de dessin et texte
- 📐 Calques et alignement
- 🖼️ Import d'images et logos
- 🎨 Sélecteur de couleurs
- ↩️ Historique (Undo/Redo)
- 💾 Export PDF haute qualité
- 📥 Import PSD (Photoshop)

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd Attestation
```

### 2. Configuration Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` basé sur `.env.example`:
```bash
cp .env.example .env
```

Configurer les variables d'environnement dans `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=certificate_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key

# Email (choisir un provider)
RESEND_API_KEY=re_xxxxx
# OU
SENDGRID_API_KEY=SG.xxxxx
# OU
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Configuration Frontend

```bash
cd frontend
npm install
```

Créer un fichier `.env` (optionnel):
```env
VITE_API_URL=http://localhost:3002/api
```

### 4. Initialiser la base de données

```bash
# Créer la base de données PostgreSQL
createdb certificate_db

# Les tables seront créées automatiquement au démarrage du serveur
```

## 🚀 Démarrage

### Backend
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:3002`

### Frontend
```bash
cd frontend
npm run dev
```
L'application démarre sur `http://localhost:5173`

## 🔐 Authentification

### Identifiants par défaut
- **Email**: admin@bimades.com
- **Mot de passe**: admin123

⚠️ **Important**: Changez ces identifiants en production!

## 📚 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify` - Vérifier le token

### Participants
- `GET /api/participants` - Liste des participants
- `POST /api/participants` - Créer un participant (public)
- `PUT /api/participants/:id` - Modifier (authentifié)
- `DELETE /api/participants/:id` - Supprimer (authentifié)

### Templates
- `GET /api/templates` - Liste des templates
- `POST /api/templates` - Créer (authentifié)
- `PUT /api/templates/:id` - Modifier (authentifié)
- `DELETE /api/templates/:id` - Supprimer (authentifié)

### Formations
- `GET /api/trainings` - Liste des formations
- `POST /api/trainings` - Créer (authentifié)
- `PUT /api/trainings/:id` - Modifier (authentifié)
- `DELETE /api/trainings/:id` - Supprimer (authentifié)

### Certificats
- `POST /api/certificates/generate` - Générer un certificat

### Email
- `POST /api/email/send-certificate` - Envoyer par email

## 🔒 Sécurité

- ✅ Authentification JWT
- ✅ Rate limiting (100 req/15min par IP)
- ✅ Validation des données (Zod)
- ✅ Protection CORS
- ✅ Sanitization des entrées
- ✅ Gestion sécurisée des erreurs

## 📊 Base de Données

### Tables
- `participants` - Informations des participants
- `trainings` - Formations disponibles
- `templates` - Modèles de certificats
- `certificates` - Certificats générés

### Indexes
- Email des participants
- Statut des demandes
- Numéros de certificat

## 🎨 Technologies

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL
- Zod (validation)
- JWT (authentification)
- Nodemailer/Resend/SendGrid (emails)
- jsPDF (génération PDF)

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Fabric.js (éditeur graphique)
- Lucide React (icônes)
- 20+ Google Fonts

## 📝 Scripts Disponibles

### Backend
```bash
npm run dev      # Développement avec ts-node
npm run build    # Compilation TypeScript
npm start        # Production
```

### Frontend
```bash
npm run dev      # Développement
npm run build    # Build production
npm run preview  # Prévisualiser le build
npm run lint     # Linter
```

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré
- Vérifiez les credentials dans `.env`
- Créez la base de données si elle n'existe pas

### Erreur d'envoi d'email
- Vérifiez la configuration email dans `.env`
- Pour Gmail, utilisez un "App Password"
- Testez avec Ethereal (mode développement)

### Erreur d'authentification
- Vérifiez que `JWT_SECRET` est défini
- Videz le localStorage du navigateur
- Reconnectez-vous

## 📈 Améliorations Futures

- [ ] Tests unitaires et d'intégration
- [ ] Migration vers microservices
- [ ] Cache Redis
- [ ] Upload fichiers vers S3/Cloudinary
- [ ] Notifications en temps réel
- [ ] Audit logs
- [ ] Rôles utilisateurs multiples
- [ ] API GraphQL
- [ ] Mobile app (React Native)

## 📄 Licence

Propriétaire - BIMADES Consulting

## 👥 Support

Pour toute question ou problème:
- Email: support@bimades.com
- Documentation: [lien vers docs]

---

**Développé avec ❤️ pour BIMADES Consulting**