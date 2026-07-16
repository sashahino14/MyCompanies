// src/app.js
import { AuthModule } from './modules/auth/index.js';
import { CompanyModule } from './modules/company/index.js';
import { Router } from './core/router.js';

// Sélection des éléments de l'interface
const authScreen = document.getElementById('auth-screen');
const gameScreen = document.getElementById('game-screen');
const companyNameEl = document.getElementById('company-name');
const companyCashEl = document.getElementById('company-cash');

// --- 1. CONFIGURATION DES ROUTES ---

Router.init();

// Route du Tableau de bord (Dashboard)
Router.registerRoute('dashboard', async (container) => {
    // On récupère les données fraîches de l'entreprise
    const response = await CompanyModule.getMyCompany();
    
    if (response.success) {
        const { company, offlineData } = response;
        
        // Mise à jour de la topbar
        companyNameEl.textContent = company.name;
        companyCashEl.textContent = CompanyModule.formatMoney(company.cash);

        // Construction du HTML du tableau de bord
        let offlineHtml = '';
        if (offlineData.secondsOffline > 60) {
            offlineHtml = `
                <div class="card" style="border-color: var(--success-color); margin-bottom: 1.5rem;">
                    <h3 style="color: var(--success-color);">Rapport d'absence</h3>
                    <p>Ton entreprise a tourné pendant ${offlineData.hoursOffline} heures pendant ton absence.</p>
                </div>
            `;
        }

        container.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">Vue d'ensemble</h2>
            ${offlineHtml}
            <div class="dashboard-grid">
                <div class="card">
                    <h3>Productions en cours</h3>
                    <p style="color: var(--text-secondary);">Module à connecter...</p>
                </div>
                <div class="card">
                    <h3>Trésorerie Actuelle</h3>
                    <p style="font-size: 1.5rem; font-weight: bold; color: var(--success-color); margin-top: 0.5rem;">
                        ${CompanyModule.formatMoney(company.cash)}
                    </p>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `<p style="color: var(--danger-color);">Impossible de charger l'entreprise.</p>`;
    }
});


// --- 2. GESTION DE L'AUTHENTIFICATION ---

AuthModule.onAuthStateChange(async (event, session) => {
    if (session) {
        // L'utilisateur est connecté
        authScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // On force la navigation vers le tableau de bord à la connexion
        Router.currentView = null; // Reset pour forcer le rafraîchissement
        Router.navigate('dashboard');
    } else {
        // L'utilisateur est déconnecté
        authScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        companyNameEl.textContent = 'Chargement...';
        companyCashEl.textContent = '$0.00';
    }
});

// Événements des boutons de connexion / inscription
document.getElementById('btn-register').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('password').value;
    const usr = document.getElementById('username').value;
    
    if(!usr) return alert("Le pseudo est obligatoire pour créer une entreprise.");
    
    const result = await AuthModule.register(email, pwd, usr);
    if(!result.success) alert(result.error);
});

document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('password').value;
    const result = await AuthModule.login(email, pwd);
    if(!result.success) alert(result.error);
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    await AuthModule.logout();
});
