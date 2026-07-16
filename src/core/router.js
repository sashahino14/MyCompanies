// src/core/router.js

export class Router {
    static currentView = null;
    static routes = {};

    // Initialiser les écouteurs d'événements sur le menu
    static init() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                if (target) {
                    this.navigate(target);
                }
            });
        });
    }

    // Enregistrer une fonction qui va dessiner (render) une vue spécifique
    static registerRoute(viewId, renderCallback) {
        this.routes[viewId] = renderCallback;
    }

    // Naviguer vers une nouvelle vue
    static async navigate(viewId) {
        if (this.currentView === viewId) return;

        // 1. Mise à jour visuelle du menu latéral
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === viewId) {
                item.classList.add('active');
            }
        });

        const container = document.getElementById('view-container');
        
        // Affichage temporaire pendant que le module charge ses données depuis Supabase
        container.innerHTML = '<p style="color: var(--text-secondary);">Chargement des données...</p>';

        // 2. Exécution du code du module correspondant
        if (this.routes[viewId]) {
            try {
                await this.routes[viewId](container);
            } catch (error) {
                console.error(`Erreur lors du rendu de la vue ${viewId}:`, error);
                container.innerHTML = '<p style="color: var(--danger-color);">Erreur lors du chargement de l\'interface.</p>';
            }
        } else {
            // Si la route n'est pas encore codée
            container.innerHTML = `
                <h2>En construction</h2>
                <p style="color: var(--text-secondary); margin-top: 1rem;">
                    Le module "<strong>${viewId}</strong>" sera implémenté très bientôt pour accélérer ton chiffre d'affaires.
                </p>
            `;
        }

        this.currentView = viewId;
    }
}
