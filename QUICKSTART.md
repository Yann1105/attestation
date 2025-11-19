# 🚀 Guide de Démarrage Rapide

## Installation en 5 minutes

### 1️⃣ Prérequis
- ✅ Node.js 18+ installé
- ✅ PostgreSQL 14+ installé et démarré
- ✅ Git installé

### 2️⃣ Installation

```bash
# Cloner le projet
git clone <repository-url>
cd Attestation

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

### 3️⃣ Configuration Base de Données

```bash
# Créer la base de données PostgreSQL
createdb certificate_db

# OU avec psql
psql -U postgres
CREATE DATABASE certificate_db;
\q
```

### 4️⃣ Configuration Backend

```bash
cd backend

# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos paramètres
# Minimum requis:
# - DB_PASSWORD=votre_mot_de_passe_postgres
# - JWT_SECRET=une_clé_secrète_aléatoire
```

**Exemple de .env minimal:**
```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=certificate_db
DB_USER=postgres
DB_PASSWORD=votre_password
JWT_SECRET=changez-moi-en-production-123456789
NODE_ENV=development
```

### 5️⃣ Initialiser la Base de Données

```bash
# Les tables seront créées automatiquement au premier démarrage
# OU exécuter manuellement la migration:
npm run migrate
```

### 6️⃣ Démarrer l'Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend démarré sur http://localhost:3002

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend démarré sur http://localhost:5173

### 7️⃣ Se Connecter

Ouvrez http://localhost:5173 dans votre navigateur

**Identifiants admin:**
- Email: `admin@bimades.com`
- Password: `admin123`

## 🎯 Premiers Pas

### Interface Participant
1. Cliquez sur le bouton "Participant" en haut à droite
2. Remplissez le formulaire de demande
3. Soumettez votre demande

### Interface Admin
1. Cliquez sur le bouton "Admin" en haut à droite
2. Connectez-vous avec les identifiants ci-dessus
3. Explorez le tableau de bord

## 📧 Configuration Email (Optionnel)

Pour envoyer des emails réels, configurez un provider dans `.env`:

### Option 1: Gmail (Recommandé pour test)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-app-password
```

**Note:** Utilisez un [App Password](https://support.google.com/accounts/answer/185833) pour Gmail

### Option 2: Resend (Recommandé pour production)
```env
RESEND_API_KEY=re_votre_clé_api
```

### Option 3: SendGrid
```env
SENDGRID_API_KEY=SG.votre_clé_api
```

## 🐛 Problèmes Courants

### ❌ Erreur: "Cannot connect to database"
**Solution:**
```bash
# Vérifier que PostgreSQL est démarré
# Windows:
services.msc  # Chercher PostgreSQL

# Linux/Mac:
sudo systemctl status postgresql
```

### ❌ Erreur: "Port 3002 already in use"
**Solution:**
```bash
# Changer le port dans backend/.env
PORT=3003
```

### ❌ Erreur: "Invalid token" après login
**Solution:**
```bash
# Vider le localStorage du navigateur
# F12 > Console > localStorage.clear()
```

### ❌ Frontend ne se connecte pas au backend
**Solution:**
```bash
# Vérifier que le backend est démarré
# Vérifier l'URL dans frontend/.env
VITE_API_URL=http://localhost:3002/api
```

## 📚 Ressources

- [README complet](./README.md)
- [Documentation API](./API.md)
- [Guide de contribution](./CONTRIBUTING.md)

## 🆘 Support

Besoin d'aide? 
- 📧 Email: support@bimades.com
- 💬 Issues: [GitHub Issues](lien)

---

**Prêt à commencer! 🎉**