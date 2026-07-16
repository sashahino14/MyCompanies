// src/app.js
import { AuthModule } from './modules/auth/index.js';
import { CompanyModule } from './modules/company/index.js';

const authScreen = document.getElementById('auth-screen');
const gameScreen = document.getElementById('game-screen');

// Ajoute ceci dans ton HTML dans la div #game-screen si ce n'est pas déjà fait :
// <h3 id="company-name"></h3>
// <p>Cash : <strong id="company-cash"></strong></p>
// <p id="offline-report" style="color: #4CAF50;"></p>

async function loadGameData() {
    const response = await CompanyModule.getMyCompany();
    if (response.success) {
        document.getElementById('company-name').textContent = response.company.name;
        document.getElementById('company-cash').textContent = CompanyModule.formatMoney(response.company.cash);
        
        if (response.offlineData.secondsOffline > 60) {
            document.getElementById('offline-report').textContent = 
                `Bon retour ! Ton entreprise a tourné pendant ${response.offlineData.hoursOffline} heures pendant ton absence.`;
        }
    }
}

AuthModule.onAuthStateChange(async (event, session) => {
    if (session) {
        authScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        await loadGameData(); // On charge les données à la connexion
    } else {
        authScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
    }
});

// ... (garde tes écouteurs d'événements pour btn-register, btn-login, btn-logout) ...
