// src/modules/production/index.js
import { supabase } from '../../core/api.js';

export class ProductionModule {
    
    // Récupérer tous les bâtiments du joueur
    static async getMyFacilities() {
        const { data, error } = await supabase
            .from('facilities')
            .select(`
                id, name, status, started_at, ends_at, producing_quantity,
                items ( name )
            `);
        if (error) {
            console.error("Erreur bâtiments:", error.message);
            return null;
        }
        return data;
    }

    // Récupérer l'inventaire
    static async getMyInventory() {
        const { data, error } = await supabase
            .from('inventory')
            .select('quantity, items(name)');
        if (error) {
            console.error("Erreur inventaire:", error.message);
            return null;
        }
        return data;
    }

    // Déclencher la récolte via la RPC
    static async claim(facilityId) {
        const { data, error } = await supabase.rpc('claim_production', { target_facility_id: facilityId });
        
        if (error) {
            console.error("Erreur lors de la récolte:", error.message);
            return false;
        }
        return data; // Retourne true si succès, false si le temps n'était pas écoulé
    }

    // Lancer une nouvelle production
    static async start(facilityId, itemId, quantity) {
        // Validation basique côté client pour éviter une requête inutile
        if (!quantity || quantity <= 0) {
            console.error("La quantité doit être supérieure à 0");
            return { success: false, error: "Quantité invalide" };
        }

        const { data, error } = await supabase.rpc('start_production', { 
            target_facility_id: facilityId,
            target_item_id: itemId,
            qty: quantity
        });
        
        if (error) {
            console.error("Erreur de lancement de production:", error.message);
            return { success: false, error: error.message };
        }
        
        return { success: true, data };
    }
}
