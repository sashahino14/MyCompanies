// src/modules/market/exchange.js
import { supabase } from '../../core/api.js';

export class ExchangeMarketModule {
    
    // 1. Lister les offres du marché (avec possibilité de filtrer par objet)
    static async getOrders(itemId = null) {
        let query = supabase
            .from('market_orders')
            .select(`
                id, quantity, price_per_unit, created_at, item_id,
                companies ( name )
            `)
            .order('price_per_unit', { ascending: true }); // On affiche toujours les moins chers en premier
            
        if (itemId) {
            query = query.eq('item_id', itemId);
        }

        const { data, error } = await query;
        
        if (error) {
            console.error("Erreur de chargement de la bourse:", error.message);
            return null;
        }
        return data;
    }

    // 2. Créer une nouvelle offre (Vendre aux autres joueurs)
    static async createOrder(itemId, quantity, pricePerUnit) {
        if (!quantity || quantity <= 0 || !pricePerUnit || pricePerUnit <= 0) {
            return { success: false, error: "La quantité et le prix doivent être supérieurs à 0." };
        }

        const { data, error } = await supabase.rpc('create_market_order', { 
            p_item_id: itemId,
            p_qty: quantity,
            p_price: pricePerUnit
        });
        
        if (error) {
            console.error("Erreur lors de la création de l'offre:", error.message);
            return { success: false, error: error.message };
        }
        
        return { success: true, data };
    }

    // 3. Acheter une offre existante
    static async buyOrder(orderId, quantity) {
        if (!quantity || quantity <= 0) {
            return { success: false, error: "La quantité doit être supérieure à 0." };
        }

        const { data, error } = await supabase.rpc('buy_market_order', { 
            p_order_id: orderId,
            p_qty: quantity
        });
        
        if (error) {
            console.error("Transaction échouée:", error.message);
            return { success: false, error: error.message };
        }
        
        return { success: true, data };
    }

    // 4. Annuler sa propre offre
    static async cancelMyOrder(orderId) {
        // En supprimant la ligne, le joueur perd l'objet dans cette version basique.
        // Pour un jeu complet, il faut une RPC qui recrédite l'inventaire avant de supprimer.
        // Pour le moment, nous allons bloquer l'annulation directe côté JS jusqu'à l'ajout de la RPC d'annulation.
        console.warn("L'annulation recréditera l'inventaire dans une future mise à jour.");
        return { success: false, error: "Action en cours de développement." };
    }
}
