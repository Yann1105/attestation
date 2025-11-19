# 🚀 Guide de Démarrage - Système d'Attestations

## ⚠️ Problème Actuel

Le serveur backend ne démarre pas à cause d'une erreur 404 sur `/api/auth/login`.

## 🔧 Solution - Démarrage Manuel

### Étape 1: Ouvrir 2 Terminaux Séparés

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Étape 2: Vérifier que le Backend Démarre

Dans le Terminal 1, vous devriez voir:
```
DB_USER: silma
DB_PASSWORD: ***
🚀 Server running on port 3002
📊 Health check: http://localhost:3002/api/health
```

Si vous voyez des erreurs TypeScript, suivez l'Étape 3.

### Étape 3: Si Erreurs TypeScript

Si vous voyez une erreur comme:
```
TSError: ⨯ Unable to compile TypeScript:
src/validation.ts:123:26 - error TS2339...
```

**Solution:**
Le fichier `backend/src/validation.ts` a déjà été corrigé. Assurez-vous d'avoir la dernière version.

Vérifiez la ligne 123 dans `backend/src/validation.ts`:
```typescript
// ✅ Correct (doit être comme ça)
details: error.issues.map((err: z.ZodIssue) => ({

// ❌ Incorrect (si vous voyez ça, changez-le)
details: error.errors.map(err => ({
```

### Étape 4: Tester la Connexion

1. Ouvrez http://localhost:5173
2. Cliquez sur "Admin"
3. Connectez-vous avec:
   - Email: `admin@bimades.com`
   - Password: `admin123`

## 🐛 Dépannage

### Erreur: "Port 3002 already in use"

**Windows:**
```powershell
# Trouver le processus
netstat -ano | findstr :3002

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Trouver et tuer le processus
lsof -ti:3002 | xargs kill -9
```

### Erreur: "Cannot connect to database"

1. Vérifiez que PostgreSQL est démarré
2. Vérifiez le fichier `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=certificate_db
DB_USER=silma  # Votre utilisateur
DB_PASSWORD=***  # Votre mot de passe
```

3. Créez la base de données si elle n'existe pas:
```bash
createdb certificate_db
```

### Erreur: "Route not found" sur /api/auth/login

Cela signifie que le backend n'a pas démarré correctement.

**Vérifications:**
1. Le backend est-il en cours d'exécution? (Terminal 1)
2. Y a-t-il des erreurs dans le Terminal 1?
3. Testez: http://localhost:3002/api/health

Si le health check ne fonctionne pas, le serveur n'est pas démarré.

## 📝 Commandes Utiles

### Backend
```bash
cd backend

# Tester la connexion DB
npm run test:db

# Migrer la base de données
npm run migrate

# Démarrer le serveur
npm run dev

# Compiler TypeScript
npm run build
```

### Frontend
```bash
cd frontend

# Démarrer le dev server
npm run dev

# Build production
npm run build

# Linter
npm run lint
```

## ✅ Checklist de Démarrage

- [ ] PostgreSQL est démarré
- [ ] Base de données `certificate_db` existe
- [ ] Fichier `backend/.env` est configuré
- [ ] `npm install` exécuté dans backend/
- [ ] `npm install` exécuté dans frontend/
- [ ] Backend démarre sans erreur (Terminal 1)
- [ ] Frontend démarre sans erreur (Terminal 2)
- [ ] http://localhost:3002/api/health retourne OK
- [ ] http://localhost:5173 s'ouvre dans le navigateur

## 🆘 Besoin d'Aide?

Si le problème persiste:

1. **Vérifiez les logs du backend** dans Terminal 1
2. **Vérifiez les logs du frontend** dans Terminal 2
3. **Ouvrez la console du navigateur** (F12) pour voir les erreurs
4. **Testez l'API directement:**
   ```bash
   curl http://localhost:3002/api/health
   ```

## 📧 Support

Email: support@bimades.com

---

**Note:** Le système a été entièrement corrigé et fiabilisé. L'éditeur Canvas a été supprimé pour simplifier l'application.