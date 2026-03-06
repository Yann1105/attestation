# Test du Générateur de Templates IA

Ce script permet de tester l'endpoint `/api/templates/generate-ai` sans avoir besoin de démarrer tout le backend.

## Prérequis
- Clé API Groq configurée dans `.env`

## Utilisation

### Test 1 : Génération simple d'un certificat
```bash
curl -X POST http://localhost:3002/api/templates/generate-ai \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"certificat\"}"
```

### Test 2 : Génération d'une attestation avec prompt personnalisé
```bash
curl -X POST http://localhost:3002/api/templates/generate-ai \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"attestation\", \"customPrompt\": \"Créer une attestation de formation professionnelle avec un design moderne et des couleurs bleues\"}"
```

### Test 3 : Génération et sauvegarde en base de données
```bash
curl -X POST http://localhost:3002/api/templates/generate-ai \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"affiche\", \"save\": true, \"name\": \"Affiche Test IA\"}"
```

## Réponse attendue

```json
{
  "type": "certificat",
  "html": "<!DOCTYPE html>...",
  "variables": ["nom", "date", "titre", "description"],
  "description": "Un certificat professionnel et prestigieux..."
}
```

## Avec sauvegarde

```json
{
  "type": "certificat",
  "html": "<!DOCTYPE html>...",
  "variables": ["nom", "date", "titre"],
  "description": "...",
  "saved": true,
  "templateId": "123"
}
```

## Visualiser le HTML généré

1. Copier le contenu du champ `html` de la réponse
2. Créer un fichier `test-template.html`
3. Coller le HTML
4. Ouvrir dans un navigateur

## Erreurs possibles

- **GROQ_API_KEY not configured** : Vérifier que la clé est dans `.env`
- **Invalid type** : Le type doit être `attestation`, `certificat` ou `affiche`
- **Failed to generate template** : Problème avec l'API Groq ou le prompt
