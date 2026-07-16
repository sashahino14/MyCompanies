// src/modules/market/system.js
import { supabase } from '../../core/api.js';

export class SystemMarketModule {
    
    // Récupérer le catalogue des prix proposés par le système
    static async getPrices() {
        const { data, error } = await supabase
            .from('items')
            .select('id, name, system_price, base_cost')
            .order('system_price', { ascending: true });
        
        if (error) {
            console.error("Erreur lors de la récupération des prix du marché :", error.message);
            return null;
        }
        return data;
    }

    // Exécuter une vente au marché système
    static async sellItem(itemId, quantity) {
        // Validation basique côté client pour économiser les requêtes inutiles
        if (!quantity || quantity <= 0) {
            console.error("La quantité à vendre doit être supérieure à 0");
            return { success: false, error: "Quantité invalide" };
        }

        const { data, error } = await supabase.rpc('sell_to_system_market', { 
            p_item_id: itemId,
            p_qty: quantity
        });
        
        if (error) {
            console.error("Transaction refusée par le marché :", error.message);
            return { success: false, error: error.message };
        }
        
        return { success: true, data };
    }
}
