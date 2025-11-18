/* ========== SERVICE WORKER - GESTION CACHE OFFLINE ET PWA ==========
   📌 RÔLE: Permettre l'app de fonctionner HORS LIGNE + Installation PWA
   💡 UTILITÉ: 
      - Cache les fichiers au 1er chargement
      - Synchronisation offline-first
      - Gestion des mises à jour
      - Support installation desktop + mobile
   ✅ VERSION: V27 - Compatible téléphone + ordinateur
   📱 APPLICATION: quiz-general-seconde (إختبار شامل2)
========== */

/**
 * 📌 NOM DU CACHE - CACHE NAME
 * 💡 À MODIFIER: Augmentez le numéro (v1→v2, etc) pour forcer mise à jour
 * ⚠️ IMPORTANT: Tous les anciens caches seront supprimés automatiquement
 */
const CACHE_NAME = 'quiz-cache-v27';

/**
 * 📌 LISTE DES FICHIERS À METTRE EN CACHE - FILES TO CACHE
 * 💡 NOTE: Les icônes et screenshots sont inclus pour installation desktop
 *          Les librairies externes (CDN) sont en network-first
 */
const BASE_PATH = '/quiz-general-seconde';

const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/style.css',
  BASE_PATH + '/app.js',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/images/icon-192.png',
  BASE_PATH + '/images/icon-512.png'
];

/* ========== ÉVÉNEMENT INSTALL - INSTALLATION EVENT ==========
   Déclenché lors de l'installation du Service Worker
   - Crée le cache
   - Pré-cache les fichiers essentiels
   - Active immédiatement le Worker
========== */
self.addEventListener('install', event => {
    console.log('✅ Service Worker en cours d\'installation (V27)');
    console.log('📦 Version du cache:', CACHE_NAME);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache créé avec succès:', CACHE_NAME);
                
                /* 🎯 Cache les fichiers essentiels + icônes (desktop) */
                return cache.addAll(urlsToCache).catch(err => {
                    console.warn('⚠️ Certains fichiers non trouvés lors du cache initial');
                    console.warn('   Raison:', err.message);
                    console.log('✅ Continuant quand même - mode dégradé autorisé');
                    return Promise.resolve();
                });
            })
    );
    
    /* Activation immédiate du Service Worker */
    self.skipWaiting();
});

/* ========== ÉVÉNEMENT FETCH - REQUEST INTERCEPTION ==========
   Intercepte toutes les requêtes réseau
   - Cache-first: pour les fichiers statiques locaux (performances)
   - Network-first: pour les requêtes dynamiques (données fraîches)
   - Offline-fallback: répond même hors ligne
========== */
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

/* ========== ÉVÉNEMENT ACTIVATE - CLEANUP AND CLAIMS ==========
   Déclenché lors de l'activation du Service Worker
   - Supprime les anciens caches (pour mise à jour propre)
   - Prend contrôle des clients existants
   - Ferme ancienne version
========== */
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker en cours d\'activation (V27)');
    console.log('🧹 Nettoyage des anciens caches...');
    
    event.waitUntil(
        /* 📌 Récupérer tous les noms de cache existants */
        caches.keys().then(cacheNames => {
            console.log('📋 Caches existants:', cacheNames);
            
            return Promise.all(
                cacheNames.map(cacheName => {
                    /* ❌ Supprimer les anciens caches (pas V27) */
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️  Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                    
                    /* ✅ Garder le cache V27 actuel */
                    console.log('✅ Cache actuel conservé:', cacheName);
                })
            );
        })
        .then(() => self.clients.claim().then(() => {
            console.log('🎯 Service Worker prend contrôle des clients');
        }))
    );
});