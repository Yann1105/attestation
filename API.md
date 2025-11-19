# 📡 Documentation API

Base URL: `http://localhost:3002/api`

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT dans le header:
```
Authorization: Bearer <token>
```

### POST /auth/login
Connexion administrateur

**Request:**
```json
{
  "email": "admin@bimades.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@bimades.com",
      "name": "Administrateur BIMADES"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /auth/verify
Vérifier la validité du token

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@bimades.com",
      "name": "Administrateur BIMADES"
    }
  }
}
```

## 👥 Participants

### GET /participants
Liste tous les participants

**Response:**
```json
[
  {
    "id": "1",
    "participantName": "Alice Traoré",
    "email": "alice@example.com",
    "phone": "+226 70 12 34 56",
    "organization": "Ministère de la Santé",
    "trainingTitle": "Planification Opérationnelle",
    "trainingDate": "2024-02-15",
    "trainingLocation": "Ouagadougou",
    "trainingDuration": "30 heures",
    "instructor": "Aimé SAWADO",
    "certificateNumber": "CERT-2024-001",
    "requestDate": "2024-02-01",
    "status": "approved",
    "approvalDate": "2024-02-02",
    "createdAt": "2024-02-01T10:00:00Z",
    "updatedAt": "2024-02-02T14:30:00Z"
  }
]
```

### POST /participants
Créer un nouveau participant (public - pas d'auth requise)

**Request:**
```json
{
  "participantName": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+226 70 11 22 33",
  "organization": "ONG Développement",
  "trainingTitle": "Gestion de Projet",
  "trainingDate": "2024-03-15",
  "trainingLocation": "Ouagadougou",
  "trainingDuration": "25 heures",
  "instructor": "Judith SOMDA"
}
```

**Response:**
```json
{
  "id": "2",
  "participantName": "Jean Dupont",
  "email": "jean@example.com",
  "status": "pending",
  "requestDate": "2024-03-01",
  ...
}
```

### PUT /participants/:id
Mettre à jour un participant (🔒 Auth requise)

**Request:**
```json
{
  "status": "approved",
  "certificateNumber": "CERT-2024-002",
  "approvalDate": "2024-03-02"
}
```

### DELETE /participants/:id
Supprimer un participant (🔒 Auth requise)

**Response:**
```json
{
  "success": true
}
```

## 📋 Templates

### GET /templates
Liste tous les templates

**Response:**
```json
[
  {
    "id": "1",
    "name": "Template BIMADES Gold",
    "description": "Template officiel doré",
    "type": "bimades-gold",
    "elements": [...],
    "canvasData": "...",
    "content": "<html>...</html>",
    "placeholders": ["participantName", "certificateNumber"],
    "filePath": "./uploads/templates/template_1234567890.html",
    "backgroundColor": "#FFFFFF",
    "width": 1200,
    "height": 850,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /templates
Créer un template Canvas (🔒 Auth requise)

**Request:**
```json
{
  "name": "Mon Template",
  "description": "Description du template",
  "type": "custom",
  "elements": [],
  "canvasData": "...",
  "backgroundColor": "#FFFFFF",
  "width": 1200,
  "height": 850
}
```

### POST /templates/upload-template
Uploader un template HTML (🔒 Auth requise)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `template`: Fichier HTML
- `name`: Nom du template (optionnel)
- `description`: Description (optionnel)

**Response:**
```json
{
  "id": "2",
  "name": "Template Uploadé",
  "description": "Template HTML uploadé",
  "content": "<html>...</html>",
  "placeholders": ["participantName", "certificateNumber"],
  "filePath": "./uploads/templates/template_1234567890.html",
  "createdAt": "2024-03-01T10:00:00Z",
  "updatedAt": "2024-03-01T10:00:00Z"
}
```

### POST /templates/upload-image
Uploader une image pour les templates (🔒 Auth requise)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image`: Fichier image (PNG, JPG, GIF)

**Response:**
```json
{
  "imageUrl": "/uploads/images/image_1234567890.png"
}
```

### GET /templates/:id/content
Récupérer le contenu HTML d'un template

**Response:** Contenu HTML brut

### PUT /templates/:id
Mettre à jour un template (🔒 Auth requise)

### DELETE /templates/:id
Supprimer un template (🔒 Auth requise)

## 🎓 Trainings

### GET /trainings
Liste toutes les formations

**Response:**
```json
[
  {
    "id": "1",
    "title": "Planification Opérationnelle avec MS Project",
    "description": "Formation complète sur MS Project",
    "date": "2024-02-15",
    "location": "Ouagadougou",
    "duration": "30 heures",
    "instructor": "Aimé SAWADO",
    "organization": "BIMADES Consulting",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /trainings
Créer une formation (🔒 Auth requise)

**Request:**
```json
{
  "title": "Nouvelle Formation",
  "description": "Description de la formation",
  "date": "2024-04-15",
  "location": "Bobo-Dioulasso",
  "duration": "20 heures",
  "instructor": "Judith SOMDA",
  "organization": "BIMADES Consulting"
}
```

### PUT /trainings/:id
Mettre à jour une formation (🔒 Auth requise)

### DELETE /trainings/:id
Supprimer une formation (🔒 Auth requise)

## 📜 Certificates

### GET /certificates/generate-number
Générer un numéro de certificat unique

**Response:**
```json
{
  "success": true,
  "certificateNumber": "CERT1731340000000123"
}
```

### POST /certificates/generate
Générer un certificat (🔒 Auth requise)

**Request:**
```json
{
  "templateId": "1",
  "participantData": {
    "id": "1",
    "participantName": "Alice Traoré",
    "email": "alice@example.com",
    "certificateNumber": "CERT-2024-001"
  },
  "formData": {
    "trainingTitle": "Planification Opérationnelle",
    "trainingDate": "2024-02-15",
    "trainingLocation": "Ouagadougou",
    "trainingDuration": "30 heures",
    "instructor": "Aimé SAWADO",
    "organization": "BIMADES Consulting"
  },
  "isQuickApproval": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "html": "<!DOCTYPE html>...",
    "certificateData": {...},
    "metadata": {
      "generatedAt": "2024-03-01T10:00:00Z",
      "templateUsed": "1",
      "isQuickApproval": false
    }
  }
}
```

### POST /certificates/generate-advanced
Générer un certificat avec options avancées (🔒 Auth requise)

**Request:**
```json
{
  "data": {
    "participantName": "Alice Traoré",
    "certificateNumber": "CERT-2024-001",
    "trainingTitle": "Planification Opérationnelle",
    "trainingDate": "2024-02-15",
    "trainingLocation": "Ouagadougou",
    "trainingDuration": "30 heures",
    "instructor": "Aimé SAWADO",
    "organization": "BIMADES Consulting",
    "issueDate": "2024-02-15"
  },
  "format": "pdf",
  "options": {
    "quality": "high",
    "pdfOptions": {
      "format": "A4",
      "orientation": "landscape",
      "margin": {
        "top": "0",
        "right": "0",
        "bottom": "0",
        "left": "0"
      },
      "printBackground": true
    },
    "pngOptions": {
      "width": 1200,
      "height": 850,
      "deviceScaleFactor": 2
    },
    "htmlOptions": {
      "includeMeta": true,
      "minify": false
    },
    "enableRollback": true
  },
  "outputPath": "./certificates/custom_certificate.pdf",
  "customTemplate": "<html>...</html>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "./certificates/custom_certificate.pdf",
    "format": "pdf",
    "options": {...}
  }
}
```

### POST /certificates/generate-batch
Générer plusieurs certificats en lot (avec SSE optionnel) (🔒 Auth requise)

**Request:**
```json
{
  "csvData": "participantName,trainingTitle,certificateNumber\nAlice Traoré,Formation MS Project,CERT001\nJean Dupont,Gestion Projet,CERT002",
  "outputDir": "./certificates/batch",
  "format": "pdf",
  "useSSE": true
}
```

**Response (sans SSE):**
```json
{
  "success": true,
  "data": {
    "files": ["./certificates/batch/certificate_Alice_Traoré_1.pdf"],
    "count": 2,
    "errors": [],
    "errorCount": 0,
    "outputDir": "./certificates/batch"
  }
}
```

**Response SSE (avec useSSE: true):**
```
data: {"type": "start", "message": "Début de la génération en lot"}

data: {"type": "progress", "current": 1, "total": 2, "success": 1, "errors": 0, "currentFile": "certificate_Alice_Traoré_1"}

data: {"type": "complete", "files": [...], "count": 2, "errors": [], "errorCount": 0, "outputDir": "./certificates/batch"}
```

### POST /certificates/validate-csv
Valider les données CSV avant génération

**Request:**
```json
{
  "csvData": "participantName,trainingTitle,certificateNumber\nAlice Traoré,Formation MS Project,CERT001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "rowCount": 1
  }
}
```

### POST /certificates/validate-template
Valider un template et extraire les placeholders

**Request:**
```json
{
  "templateContent": "<html><body>{{participantName}} - {{certificateNumber}}</body></html>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "placeholders": ["participantName", "certificateNumber"],
    "missingRequired": []
  }
}
```

### POST /certificates/extract-placeholders
Extraire tous les placeholders d'un template

**Request:**
```json
{
  "templateContent": "<html><body>{{participantName}} - {{certificateNumber}}</body></html>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "placeholders": ["participantName", "certificateNumber"],
    "count": 2
  }
}
```

### GET /certificates/download/:filename
Télécharger un certificat généré

**Response:** Fichier PDF/PNG/HTML

### GET /certificates/list
Lister les certificats générés

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "certificate_CERT001_1234567890.pdf",
      "size": 245760,
      "createdAt": "2024-03-01T10:00:00Z",
      "modifiedAt": "2024-03-01T10:00:00Z"
    }
  ]
}
```

### POST /certificates/rollback
Annuler la dernière opération de génération

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedFiles": ["./certificates/certificate_CERT001_1234567890.pdf"],
    "error": null
  }
}
```

### POST /certificates/cleanup
Nettoyer les fichiers temporaires anciens

**Request:**
```json
{
  "maxAgeHours": 24
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedFiles": ["./certificates/old_file.pdf"],
    "error": null
  }
}
```

## 📧 Email

### POST /email/send-certificate
Envoyer un certificat par email (🔒 Auth requise + Rate limited)

**Request:**
```json
{
  "participantEmail": "alice@example.com",
  "certificateData": {
    "certificateNumber": "CERT-2024-001",
    "participantName": "Alice Traoré",
    "trainingTitle": "Planification Opérationnelle",
    "pdfData": "base64_encoded_pdf..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "abc123",
  "recipient": "alice@example.com",
  "certificateNumber": "CERT-2024-001",
  "sentAt": "2024-03-01T10:00:00Z",
  "message": "Email envoyé avec succès"
}
```

### GET /email/test
Tester la configuration email

**Response:**
```json
{
  "success": true,
  "message": "Configuration email validée"
}
```

## 🚨 Codes d'Erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide (validation failed) |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 409 | Conflit (duplicate) |
| 429 | Trop de requêtes (rate limit) |
| 500 | Erreur serveur |

## 🔒 Rate Limiting

| Endpoint | Limite |
|----------|--------|
| /api/* | 100 req/15min |
| /api/auth/login | 5 req/15min |
| /api/email/* | 10 req/1h |

## 📝 Validation

Tous les endpoints utilisent Zod pour la validation. Les erreurs de validation retournent:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

## 🔧 Headers Requis

```
Content-Type: application/json
Authorization: Bearer <token>  // Pour routes protégées
```

## 📊 Pagination

Actuellement non implémentée. Toutes les listes retournent tous les résultats.

**À venir:**
```
GET /participants?page=1&limit=10&sort=createdAt&order=desc
```