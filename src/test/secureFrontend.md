# 🔒 Guide de Sécurité XSS - Protection Complète

## 🎯 Principe : Sécurité en Couches (Defense in Depth)

La sécurité doit être appliquée à **TOUS les niveaux** :

```
Frontend → Backend → Base de données → Affichage
   ✅         ✅           ✅              ✅
```

---

## 1️⃣ BACKEND : Sanitization à la source (CRITIQUE)

### ⚠️ C'est LA PRIORITÉ !

Le backend doit **TOUJOURS** nettoyer les données avant de les sauvegarder.

```javascript
// Backend - Exemple avec DOMPurify (Node.js)
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Controller pour créer/modifier un post
export const createPost = async (req, res) => {
  const { postTitle, postDescription } = req.body;

  // 🔒 NETTOYER le HTML avant sauvegarde
  const safeDescription = DOMPurify.sanitize(postDescription, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });

  // Sauvegarder dans la DB
  await models.Post.create({
    postTitle: postTitle.trim(),
    postDescription: safeDescription, // ✅ HTML sécurisé
  });

  res.json({ message: 'Post créé avec succès' });
};
```

### 📦 Installation DOMPurify Backend

```bash
npm install dompurify jsdom
```

---

## 2️⃣ FRONTEND : Validation TinyMCE

### Configuration TinyMCE sécurisée

```javascript
import { Editor } from '@tinymce/tinymce-react';

<Editor
  apiKey="votre-api-key"
  init={{
    // 🔒 Restreindre les éléments autorisés
    valid_elements: 'p,br,strong/b,em/i,u,h1,h2,h3,ul,ol,li,a[href|title],img[src|alt]',
    
    // 🔒 Bloquer les attributs dangereux
    invalid_elements: 'script,iframe,object,embed',
    
    // 🔒 Empêcher javascript: dans les liens
    convert_urls: false,
    relative_urls: false,
    remove_script_host: true,
    
    // 🔒 Nettoyer automatiquement
    cleanup: true,
    verify_html: true,
    
    plugins: 'lists link image',
    toolbar: 'bold italic underline | h1 h2 h3 | bullist numlist | link image'
  }}
  value={content}
  onEditorChange={(newValue) => setContent(newValue)}
/>
```

---

## 3️⃣ AFFICHAGE : Sanitization côté client

### Option A : DOMPurify (Recommandé pour HTML complet)

```javascript
import DOMPurify from 'dompurify';

// Pour afficher le HTML complet (page de détail du post)
<div 
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(post.postDescription) 
  }} 
/>
```

### Option B : Extraction texte seul (Pour les aperçus)

```javascript
// Pour les aperçus de recherche (votre cas)
const truncateHtml = (html, maxLength = 100) => {
  // ✅ Nettoyer d'abord
  const safeHtml = DOMPurify.sanitize(html);
  
  // ✅ Extraire le texte brut
  const tmp = document.createElement('div');
  tmp.innerHTML = safeHtml;
  let text = tmp.textContent || '';
  
  // ✅ Tronquer
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > 0) text = text.substring(0, lastSpace);
    text += '...';
  }
  
  return text;
};

// Usage
<Typography>{truncateHtml(post.postDescription, 120)}</Typography>
```

### 📦 Installation DOMPurify Frontend

```bash
npm install dompurify
npm install --save-dev @types/dompurify  # Si TypeScript
```

---

## 4️⃣ Comparaison : Votre fonction vs DOMPurify

### Votre fonction `sanitizeHtml()` (basique)

```javascript
// ✅ Supprime les événements onclick, onload, etc.
// ✅ Supprime javascript: dans href/src
// ❌ Ne gère PAS : <script>, <iframe>, <object>
// ❌ Ne gère PAS : data attributes malicieux
// ❌ Ne gère PAS : CSS injection
// ❌ Ne gère PAS : svg avec scripts

const sanitizeHtml = (input) => {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  for (const elm of doc.querySelectorAll('*')) {
    for (const attrib of elm.attributes) {
      if (attrib.name.startsWith('on')) {
        elm.removeAttribute(attrib.name);
      }
      if (['href', 'src'].includes(attrib.name) && 
          attrib.value.toLowerCase().includes('javascript:')) {
        elm.removeAttribute(attrib.name);
      }
    }
  }
  return doc.body.innerHTML;
};
```

### DOMPurify (professionnel)

```javascript
// ✅ Gère TOUS les cas XSS connus
// ✅ Maintenu activement
// ✅ Testé contre les nouvelles attaques
// ✅ Utilisé par Google, Microsoft, etc.

DOMPurify.sanitize(html);
```

---

## 🎯 RECOMMANDATIONS FINALES

### Pour votre SearchResult.jsx (Aperçu court)

**✅ SÉCURISÉ (car texte seul) :**
```javascript
<Typography>
  {truncateHtml(post.postDescription, 120)}
</Typography>
```
Pas de HTML affiché = Pas de risque XSS dans ce composant

### Pour la page de détail du post (HTML complet)

**⚠️ DANGEREUX :**
```javascript
<div dangerouslySetInnerHTML={{ __html: post.postDescription }} />
```

**✅ SÉCURISÉ :**
```javascript
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(post.postDescription) 
}} />
```

---

## 🛡️ Architecture de sécurité idéale

```
┌─────────────────────────────────────────────────────┐
│  1. TinyMCE (Frontend)                              │
│     ↓ Configuration sécurisée                       │
│     ↓ Restrictions sur les balises                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  2. Backend (Node.js)                               │
│     ↓ DOMPurify.sanitize() AVANT sauvegarde         │
│     ↓ Validation stricte                            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  3. Base de données                                 │
│     ↓ HTML déjà nettoyé                            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  4. Affichage Frontend                              │
│     ↓ Aperçu: Texte seul (truncateHtml)            │
│     ↓ Complet: DOMPurify.sanitize()                │
└─────────────────────────────────────────────────────┘
```

---

## 📝 CHECKLIST DE SÉCURITÉ

- [ ] **Backend** : Sanitize avec DOMPurify avant sauvegarde
- [ ] **TinyMCE** : Configuration avec valid_elements
- [ ] **Aperçus** : Extraction texte seul (pas de HTML)
- [ ] **Affichage complet** : DOMPurify côté client
- [ ] **CSP Headers** : Content-Security-Policy configuré
- [ ] **Tests** : Tester avec des payloads XSS connus

---

## 🚨 Vecteurs d'attaque XSS courants

```javascript
// 1. Scripts directs
<script>alert('XSS')</script>

// 2. Événements inline
<img src=x onerror="alert('XSS')">

// 3. JavaScript dans URLs
<a href="javascript:alert('XSS')">Click</a>

// 4. SVG avec scripts
<svg onload="alert('XSS')">

// 5. Data attributes
<div data-bind="alert('XSS')"></div>

// 6. CSS injection
<style>body{background:url('javascript:alert(1)')}</style>

// 7. iframe injection
<iframe src="javascript:alert('XSS')"></iframe>
```

**✅ Tous bloqués par DOMPurify**  
**⚠️ Certains passent avec votre fonction basique**

---

## 💡 CONCLUSION

Pour **SearchResult.jsx** (votre cas actuel) :
- ✅ **Acceptable** : `truncateHtml()` extrait le texte → pas de XSS
- ⚠️ **Améliorable** : Ajouter sanitization pour defense-in-depth

Pour le **reste de l'application** :
- 🔴 **CRITIQUE** : Implémenter DOMPurify côté backend
- 🟡 **Important** : Utiliser DOMPurify côté frontend pour affichage HTML complet

**La vraie sécurité commence au backend ! 🛡️**