// src/modules/company/index.js
import { supabase } from '../../core/api.js';

export class CompanyModule {
    static async getMyCompany() {
        try {
            // Récupérer l'utilisateur actuel
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non connecté");

            // Récupérer l'entreprise (la politique RLS garantit qu'on ne voit que la sienne)
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('profile_id', user.id)
                .single();

            if (error) throw error;

            // Calcul du temps écoulé (Offline Progression)
            const now = new Date();
            const lastSync = new Date(data.last_sync_at);
            const secondsOffline = Math.floor((now - lastSync) / 1000);

            return { 
                success: true, 
                company: data, 
                offlineData: {
                    secondsOffline,
                    hoursOffline: (secondsOffline / 3600).toFixed(2)
                }
            };
        } catch (error) {
            console.error("Erreur chargement entreprise:", error.message);
            return { success: false, error: error.message };
        }
    }
    
    // Fonction utilitaire pour formater l'argent
    static formatMoney(amount) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(amount);
    }
}
