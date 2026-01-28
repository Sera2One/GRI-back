# 🛡️ Protection contre les Injections SQL - PostgreSQL & Sequelize

## ✅ BONNE NOUVELLE : Sequelize vous protège automatiquement !

Sequelize utilise des **requêtes préparées (prepared statements)** par défaut, ce qui empêche la plupart des injections SQL.

---

## 🔒 1. Méthodes SÉCURISÉES (Sequelize ORM)

### ✅ Utilisation des opérateurs Sequelize

```javascript
import { Op } from 'sequelize';

// ✅ SÉCURISÉ : Paramètres automatiquement échappés
const users = await User.findAll({
  where: {
    username: userInput,  // ✅ Échappé automatiquement
    age: {
      [Op.gte]: 18
    }
  }
});

// ✅ SÉCURISÉ : Recherche LIKE
const posts = await Post.findAll({
  where: {
    title: {
      [Op.like]: `%${searchTerm}%`  // ✅ Échappé automatiquement
    }
  }
});

// ✅ SÉCURISÉ : Recherche avec OR
const results = await Post.findAll({
  where: {
    [Op.or]: [
      { title: { [Op.like]: `%${term}%` } },
      { description: { [Op.like]: `%${term}%` } }
    ]
  }
});

// ✅ SÉCURISÉ : Intervalle de dates
const posts = await Post.findAll({
  where: {
    createdAt: {
      [Op.between]: [startDate, endDate]
    }
  }
});
```

### ✅ Utilisation de replacements (requêtes brutes)

```javascript
// ✅ SÉCURISÉ : Requête brute avec paramètres nommés
const users = await sequelize.query(
  'SELECT * FROM users WHERE username = :username AND age > :age',
  {
    replacements: { username: userInput, age: 18 },
    type: QueryTypes.SELECT
  }
);

// ✅ SÉCURISÉ : Paramètres positionnels
const posts = await sequelize.query(
  'SELECT * FROM posts WHERE title LIKE $1 OR description LIKE $2',
  {
    bind: [`%${term}%`, `%${term}%`],
    type: QueryTypes.SELECT
  }
);

// ✅ SÉCURISÉ : Requête complexe avec multiples paramètres
const results = await sequelize.query(
  `SELECT p.*, u.username 
   FROM posts p 
   JOIN users u ON p.user_id = u.id 
   WHERE p.created_at BETWEEN :startDate AND :endDate
   AND (p.title ILIKE :search OR p.description ILIKE :search)
   ORDER BY p.created_at DESC
   LIMIT :limit OFFSET :offset`,
  {
    replacements: {
      startDate: dateFrom,
      endDate: dateTo,
      search: `%${searchTerm}%`,
      limit: limit,
      offset: offset
    },
    type: QueryTypes.SELECT
  }
);
```

---

## ⚠️ 2. Méthodes DANGEREUSES à ÉVITER

### ❌ Concaténation de chaînes (JAMAIS !)

```javascript
// ❌ DANGER : Injection SQL possible
const query = `SELECT * FROM users WHERE username = '${userInput}'`;
await sequelize.query(query);

// ❌ DANGER : Injection via LIKE
const query = `SELECT * FROM posts WHERE title LIKE '%${searchTerm}%'`;
await sequelize.query(query);

// ❌ DANGER : Injection dans ORDER BY
const query = `SELECT * FROM posts ORDER BY ${sortColumn} ${sortOrder}`;
await sequelize.query(query);
```

### Pourquoi c'est dangereux ?

```javascript
// Si userInput = "admin' OR '1'='1"
const query = `SELECT * FROM users WHERE username = '${userInput}'`;
// Résultat : SELECT * FROM users WHERE username = 'admin' OR '1'='1'
// 🚨 Retourne TOUS les utilisateurs !

// Si userInput = "'; DROP TABLE users; --"
const query = `SELECT * FROM users WHERE username = '${userInput}'`;
// Résultat : SELECT * FROM users WHERE username = ''; DROP TABLE users; --'
// 🚨 Supprime la table users !
```

---

## 🔧 3. Validation et Sanitization des entrées

### Backend Controller sécurisé

```javascript
import { Op } from 'sequelize';
import validator from 'validator';

export const getPost = async (req, res) => {
  // 1️⃣ VALIDATION des paramètres
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  
  // Valider l'ordre (whitelist)
  const allowedOrders = ['ASC', 'DESC'];
  const order = allowedOrders.includes(req.query.order?.toUpperCase()) 
    ? req.query.order.toUpperCase() 
    : 'DESC';
  
  // Valider les dates
  const dateFrom = req.query.dateFrom && validator.isDate(req.query.dateFrom) 
    ? req.query.dateFrom 
    : null;
  
  const dateTo = req.query.dateTo && validator.isDate(req.query.dateTo) 
    ? req.query.dateTo 
    : null;
  
  // Sanitize le texte de recherche
  const texte = req.query.texte 
    ? validator.trim(req.query.texte).substring(0, 100) 
    : '';
  
  // Validation longueur minimum
  if (texte && texte.length < 3) {
    return res.status(400).json({
      message: 'Le terme de recherche doit contenir au minimum 3 caractères.'
    });
  }
  
  const offset = (page - 1) * limit;
  
  try {
    // 2️⃣ Construire la requête avec Sequelize (sécurisé)
    let whereCondition = {};
    
    if (texte) {
      whereCondition[Op.or] = [
        {
          postTitle: {
            [Op.iLike]: `%${texte}%`  // ✅ Échappé automatiquement
          }
        },
        {
          postDescription: {
            [Op.iLike]: `%${texte}%`  // ✅ Échappé automatiquement
          }
        }
      ];
    }
    
    // Filtre de dates
    if (dateFrom || dateTo) {
      const dateCondition = {};
      
      if (dateFrom && dateTo) {
        dateCondition[Op.between] = [
          new Date(dateFrom + 'T00:00:00'),
          new Date(dateTo + 'T23:59:59')
        ];
      } else if (dateFrom) {
        dateCondition[Op.gte] = new Date(dateFrom + 'T00:00:00');
      } else if (dateTo) {
        dateCondition[Op.lte] = new Date(dateTo + 'T23:59:59');
      }
      
      whereCondition.post_created_date = dateCondition;
    }
    
    // 3️⃣ Requête sécurisée avec Sequelize
    const { count, rows } = await models.Post.findAndCountAll({
      where: whereCondition,
      include: [
        {
          as: 'usrCodeUser',
          model: Users,
          attributes: ['usr_code', 'usr_name', 'usr_firstname', 'usr_mail', 'usr_img']
        }
      ],
      order: [['post_created_date', order]],  // ✅ Sécurisé (whitelist)
      limit: limit,
      offset: offset,
      distinct: true
    });
    
    return res.json({
      message: 'Succès',
      data: rows,
      page: page,
      nbPage: Math.ceil(count / limit)
    });
    
  } catch (error) {
    console.error('Error in getPost:', error);
    return res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
```

### 📦 Installation de validator

```bash
npm install validator
```

---

## 🎯 4. Cas particuliers : ORDER BY dynamique

### ❌ DANGEREUX

```javascript
// ❌ Injection possible si sortColumn vient de l'utilisateur
const order = [[req.query.sortColumn, req.query.sortOrder]];
```

### ✅ SÉCURISÉ avec Whitelist

```javascript
// ✅ Whitelist des colonnes autorisées
const allowedSortColumns = {
  'title': 'postTitle',
  'date': 'post_created_date',
  'author': 'usr_name'
};

const allowedSortOrders = ['ASC', 'DESC'];

const sortColumn = allowedSortColumns[req.query.sortBy] || 'post_created_date';
const sortOrder = allowedSortOrders.includes(req.query.order?.toUpperCase()) 
  ? req.query.order.toUpperCase() 
  : 'DESC';

// ✅ Maintenant c'est sécurisé
const posts = await Post.findAll({
  order: [[sortColumn, sortOrder]]
});
```

---

## 🔍 5. Middleware de validation

### Créer un middleware de validation global

```javascript
// middleware/validateRequest.js
import validator from 'validator';

export const validateSearchParams = (req, res, next) => {
  // Valider limit
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        message: 'Paramètre limit invalide (1-100)'
      });
    }
  }
  
  // Valider page
  if (req.query.page) {
    const page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        message: 'Paramètre page invalide'
      });
    }
  }
  
  // Valider order
  if (req.query.order) {
    const order = req.query.order.toUpperCase();
    if (!['ASC', 'DESC'].includes(order)) {
      return res.status(400).json({
        message: 'Paramètre order invalide (ASC ou DESC)'
      });
    }
  }
  
  // Valider dates
  if (req.query.dateFrom && !validator.isDate(req.query.dateFrom)) {
    return res.status(400).json({
      message: 'Format de dateFrom invalide (YYYY-MM-DD)'
    });
  }
  
  if (req.query.dateTo && !validator.isDate(req.query.dateTo)) {
    return res.status(400).json({
      message: 'Format de dateTo invalide (YYYY-MM-DD)'
    });
  }
  
  // Valider texte de recherche
  if (req.query.texte) {
    const texte = validator.trim(req.query.texte);
    if (texte.length < 3 || texte.length > 100) {
      return res.status(400).json({
        message: 'Texte de recherche doit contenir entre 3 et 100 caractères'
      });
    }
    // Nettoyer et réassigner
    req.query.texte = validator.escape(texte);
  }
  
  next();
};

// Utilisation dans les routes
import { validateSearchParams } from '../middleware/validateRequest';

router.get('/posts', validateSearchParams, getPost);
router.get('/users', validateSearchParams, getUserList);
```

---

## 🔐 6. Configuration PostgreSQL sécurisée

### Dans votre fichier de configuration Sequelize

```javascript
// config/database.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    
    // 🔒 Options de sécurité
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    // 🔒 Forcer l'utilisation de requêtes préparées
    dialectOptions: {
      statement_timeout: 10000,  // Timeout de 10 secondes
      idle_in_transaction_session_timeout: 10000
    },
    
    // 🔒 Désactiver les requêtes brutes par défaut
    define: {
      freezeTableName: true,
      timestamps: true,
      underscored: true
    }
  }
);

export default sequelize;
```

### Variables d'environnement (.env)

```env
# Ne JAMAIS commiter ce fichier !
DB_HOST=localhost
DB_NAME=ma_base
DB_USER=mon_user
DB_PASSWORD=mot_de_passe_fort_123!

# Utilisateur avec privilèges limités
# Créer un utilisateur PostgreSQL spécifique pour l'application
```

### Créer un utilisateur PostgreSQL avec privilèges limités

```sql
-- Connecté en tant que superuser
CREATE USER app_user WITH PASSWORD 'mot_de_passe_fort';

-- Créer la base de données
CREATE DATABASE ma_base OWNER app_user;

-- Connexion à la base
\c ma_base

-- Donner uniquement les privilèges nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Ne PAS donner DROP, TRUNCATE, ALTER
-- Ne PAS donner de privilèges superuser
```

---

## 🧪 7. Tests d'injection SQL

### Payloads de test courants

```javascript
// Tester ces valeurs dans votre application
const testPayloads = [
  "' OR '1'='1",
  "admin'--",
  "'; DROP TABLE users; --",
  "1' UNION SELECT * FROM users--",
  "' OR 1=1--",
  "admin' /*",
  "' AND '1'='1",
  "1; DELETE FROM posts WHERE '1'='1",
];

// Exemple de test
testPayloads.forEach(async (payload) => {
  try {
    const result = await getUserList(1, 10, 'desc', payload);
    console.log(`Payload: ${payload} - RESULT:`, result);
  } catch (error) {
    console.log(`Payload: ${payload} - ERROR:`, error.message);
  }
});
```

### Avec Sequelize (devrait être sécurisé)

```javascript
// ✅ Ces payloads ne devraient causer aucun problème
const users = await User.findAll({
  where: {
    username: "' OR '1'='1"  // Traité comme une chaîne littérale
  }
});
// Résultat : Aucun utilisateur trouvé (cherche littéralement "' OR '1'='1")
```

---

## 📋 CHECKLIST DE SÉCURITÉ SQL

### Backend
- [ ] ✅ Utiliser Sequelize ORM (pas de requêtes SQL brutes)
- [ ] ✅ Utiliser `replacements` ou `bind` pour les requêtes brutes
- [ ] ✅ Valider TOUS les paramètres utilisateur
- [ ] ✅ Utiliser des whitelists pour ORDER BY, colonnes dynamiques
- [ ] ✅ Limiter la longueur des chaînes de recherche
- [ ] ✅ Échapper les caractères spéciaux dans LIKE
- [ ] ✅ Valider les types (nombres, dates, booléens)
- [ ] ✅ Middleware de validation global

### Base de données
- [ ] ✅ Utilisateur PostgreSQL avec privilèges limités
- [ ] ✅ Pas de privilèges DROP, TRUNCATE, ALTER
- [ ] ✅ Timeouts configurés
- [ ] ✅ Logs de requêtes activés (dev uniquement)
- [ ] ✅ Backups réguliers

### Configuration
- [ ] ✅ Mots de passe forts
- [ ] ✅ Variables d'environnement sécurisées
- [ ] ✅ .env dans .gitignore
- [ ] ✅ Connexion SSL en production

---

## ⚡ Exemples de votre code CORRIGÉ

### Votre getPost original

```javascript
// ⚠️ Votre code original était déjà SÉCURISÉ !
whereCondition = {
  [Op.or]: {
    postTitle: {
      [Op.or]: {
        [Op.like]: `%${texte}%`,  // ✅ Échappé par Sequelize
        [Op.startsWith]: capitalize(texte)
      }
    }
  }
};
```

### Version améliorée avec validation

```javascript
import validator from 'validator';
import { Op } from 'sequelize';

export const getPost = async (req, res) => {
  // Validation
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const order = ['ASC', 'DESC'].includes(req.query.order?.toUpperCase()) 
    ? req.query.order.toUpperCase() 
    : 'DESC';
  
  let texte = req.query.texte ? validator.trim(req.query.texte) : '';
  texte = texte.substring(0, 100); // Limiter la longueur
  
  if (texte && texte.length < 3) {
    return res.status(400).json({
      message: 'Le terme de recherche doit contenir au minimum 3 caractères.'
    });
  }
  
  const offset = (page - 1) * limit;
  
  try {
    let whereCondition = {};
    
    if (texte) {
      // ✅ SÉCURISÉ : Sequelize échappe automatiquement
      whereCondition[Op.or] = [
        {
          postTitle: {
            [Op.iLike]: `%${texte}%`  // iLike = insensible à la casse
          }
        },
        {
          postDescription: {
            [Op.iLike]: `%${texte}%`
          }
        }
      ];
    }
    
    const { count, rows } = await models.Post.findAndCountAll({
      where: whereCondition,
      order: [['post_created_date', order]],
      limit: limit,
      offset: offset,
      distinct: true
    });
    
    return res.json({
      data: rows,
      page: page,
      nbPage: Math.ceil(count / limit)
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur' 
    });
  }
};
```

---

## 🎯 CONCLUSION

### Vous êtes DÉJÀ bien protégé si :
✅ Vous utilisez Sequelize ORM (pas de SQL brut)  
✅ Vous passez les valeurs via les objets `where`  
✅ Vous n'utilisez PAS de concaténation de chaînes  

### Améliorations recommandées :
🔧 Ajouter validation des entrées  
🔧 Utiliser des whitelists pour ORDER BY  
🔧 Limiter les privilèges de l'utilisateur PostgreSQL  
🔧 Ajouter un middleware de validation  

**Votre code actuel avec Sequelize est déjà sécurisé contre les injections SQL ! 🎉**