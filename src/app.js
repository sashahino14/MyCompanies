// src/app.js
import { AuthModule } from './modules/auth/index.js';
import { CompanyModule } from './modules/company/index.js';
import { ProductionModule } from './modules/production/index.js';
import { Router } from './core/router.js';

// Sélection des éléments de l'interface
const authScreen = document.getElementById('auth-screen');
const gameScreen = document.getElementById('game-screen');
const companyNameEl = document.getElementById('company-name');
const companyCashEl = document.getElementById('company-cash');

// --- 1. CONFIGURATION DES ROUTES ---

Router.init();

// Route : Dashboard
Router.registerRoute('dashboard', async (container) => {
    const response = await CompanyModule.getMyCompany();
    if (response.success) {
        const { company, offlineData } = response;
        companyNameEl.textContent = company.name;
        companyCashEl.textContent = CompanyModule.formatMoney(company.cash);

        let offlineHtml = offlineData.secondsOffline > 60 
            ? `<div class="card" style="border-color: var(--success-color); margin-bottom: 1.5rem;">
                <h3 style="color: var(--success-color);">Rapport d'absence</h3>
                <p>Ton entreprise a tourné pendant ${offlineData.hoursOffline} heures pendant ton absence.</p>
               </div>` 
            : '';

        container.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">Vue d'ensemble</h2>
            ${offlineHtml}
            <div class="dashboard-grid">
                <div class="card">
                    <h3>Productions en cours</h3>
                    <p style="color: var(--text-secondary);">Aucune usine active.</p>
                </div>
                <div class="card">
                    <h3>Trésorerie</h3>
                    <p style="font-size: 1.5rem; font-weight: bold; color: var(--success-color); margin-top: 0.5rem;">
                        ${CompanyModule.formatMoney(company.cash)}
                    </p>
                </div>
            </div>
        `;
    }
});

// Route : Inventaire (Nouvelle)
Router.registerRoute('inventory', async (container) => {
    const items = await ProductionModule.getMyInventory();
    
    let itemsHtml = items && items.length > 0 
        ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <thead>
                    <tr style="color: var(--text-secondary); text-align: left; border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 1rem;">Objet</th>
                        <th style="padding: 1rem;">Quantité</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 1rem;">${item.items.name}</td>
                            <td style="padding: 1rem; font-weight: bold;">${item.quantity}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
        : '<p style="color: var(--text-secondary); margin-top: 1rem;">Ton inventaire est vide.</p>';

    container.innerHTML = `
        <h2 style="margin-bottom: 1.5rem;">Inventaire</h2>
        <div class="card">
            <h3>Ressources en stock</h3>
            ${itemsHtml}
        </div>
    `;
});

// --- 2. GESTION DE L'AUTHENTIFICATION ---

AuthModule.onAuthStateChange(async (event, session) => {
    if (session) {
        authScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        Router.navigate('dashboard');
    } else {
        authScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        companyNameEl.textContent = 'Chargement...';
        companyCashEl.textContent = '$0.00';
    }
});

// Événements boutons
document.getElementById('btn-register').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('password').value;
    const usr = document.getElementById('username').value;
    if(!usr) return alert("Pseudo obligatoire.");
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
