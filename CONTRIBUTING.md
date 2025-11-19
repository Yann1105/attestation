# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer au projet BIMADES Attestations!

## 🚀 Démarrage

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📋 Standards de Code

### TypeScript
- Utilisez TypeScript strict mode
- Définissez des types explicites
- Évitez `any` autant que possible
- Utilisez des interfaces pour les objets complexes

### Naming Conventions
- **Variables/Functions**: camelCase (`getUserData`)
- **Classes/Interfaces**: PascalCase (`UserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case (`user-service.ts`)

### Code Style
```typescript
// ✅ Bon
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

// ❌ Mauvais
const getUser = async (id) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};
```

## 🔒 Sécurité

- Ne committez JAMAIS de secrets (API keys, passwords)
- Utilisez toujours des variables d'environnement
- Validez toutes les entrées utilisateur
- Utilisez des requêtes paramétrées (pas de string concatenation)

```typescript
// ✅ Bon
await query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ Mauvais
await query(`SELECT * FROM users WHERE email = '${email}'`);
```

## 📝 Commits

### Format
```
type(scope): subject

body

footer
```

### Types
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, point-virgules manquants, etc.
- `refactor`: Refactoring du code
- `test`: Ajout de tests
- `chore`: Maintenance

### Exemples
```
feat(auth): add JWT authentication

Implement JWT-based authentication for admin routes
- Add auth middleware
- Create login endpoint
- Add token verification

Closes #123
```

## 🧪 Tests

Avant de soumettre une PR:

1. **Backend:**
```bash
cd backend
npm run build  # Vérifier compilation
npm run test:db  # Tester connexion DB
```

2. **Frontend:**
```bash
cd frontend
npm run build  # Vérifier compilation
npm run lint  # Vérifier linting
```

## 📚 Documentation

- Documentez les nouvelles fonctionnalités
- Mettez à jour le README si nécessaire
- Ajoutez des commentaires pour le code complexe
- Mettez à jour API.md pour les nouveaux endpoints

## 🐛 Rapporter un Bug

Utilisez le template suivant:

```markdown
**Description**
Description claire du bug

**Reproduction**
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Comportement attendu**
Ce qui devrait se passer

**Screenshots**
Si applicable

**Environnement**
- OS: [e.g. Windows 11]
- Node: [e.g. 18.0.0]
- PostgreSQL: [e.g. 14.0]
```

## 💡 Proposer une Fonctionnalité

Utilisez le template suivant:

```markdown
**Problème**
Quel problème cette fonctionnalité résout-elle?

**Solution proposée**
Description de la solution

**Alternatives**
Autres solutions considérées

**Contexte additionnel**
Tout autre contexte pertinent
```

## 🔄 Process de Review

1. Au moins 1 approbation requise
2. Tous les tests doivent passer
3. Code doit respecter les standards
4. Documentation mise à jour
5. Pas de conflits avec main

## 📦 Structure du Projet

```
Attestation/
├── backend/
│   ├── src/
│   │   ├── routes/      # Routes API
│   │   ├── database.ts  # DB connection
│   │   ├── auth.ts      # Authentication
│   │   ├── validation.ts # Validation schemas
│   │   └── server.ts    # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Utilities
│   │   └── types.ts     # TypeScript types
│   └── package.json
└── README.md
```

## 🎯 Priorités

### High Priority
- Corrections de bugs de sécurité
- Corrections de bugs critiques
- Améliorations de performance

### Medium Priority
- Nouvelles fonctionnalités
- Améliorations UX
- Refactoring

### Low Priority
- Documentation
- Tests
- Optimisations mineures

## ❓ Questions?

- Ouvrez une issue
- Contactez: dev@bimades.com

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet.

---

**Merci de contribuer! 🎉**