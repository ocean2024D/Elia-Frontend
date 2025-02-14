# Use Case Elia - Frontend 

## Description
Ce projet est une application frontend développée avec React et React Router. Il inclut plusieurs pages et routes protégées pour gérer l'authentification des utilisateurs et des administrateurs.

## Technologies utilisées
- React
- React Router
- CSS (App.css)



L'application sera accessible à l'adresse `http://localhost:3000/`.

## Structure des fichiers
```
/src
│-- components
│   │-- Navbar.js
│   │-- ProtectedRoute.js
│   │-- AdminProtectedRoute.js
│
│-- pages
│   │-- Home.js
│   │-- Requests.js
│   │-- Admin.js
│   │-- Overview.js
│   │-- Contacts.js
│   │-- About.js
│   │-- Register.js
│   │-- Login.js
│
│-- App.js
│-- App.css
```

## Fonctionnalités
- **Navigation** : Une barre de navigation globale.
- **Routes protégées** :
  - `ProtectedRoute` : Restreint l'accès aux utilisateurs authentifiés.
  - `AdminProtectedRoute` : Restreint l'accès aux administrateurs.
- **Pages principales** :
  - `/` : Accueil (protégé)
  - `/login` : Page de connexion
  - `/register` : Inscription
  - `/admin` : Interface d'administration (protégé pour les admins)
  - `/requests` : Liste des demandes
  - `/overview` : Vue d'ensemble
  - `/contacts` : Page de contacts
  - `/about` : À propos

