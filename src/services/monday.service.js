const axios = require('axios');

/**
 * Servicio para interactuar con Monday.com API v2 (GraphQL)
 */
class MondayService {
    constructor() {
        this.apiKey = process.env.MONDAY_API_KEY;
        this.boardId = process.env.MONDAY_BOARD_ID;
        this.apiUrl = 'https://api.monday.com/v2';
    }

    /**
     * Crear un item en el tablero de Monday
     * @param {Object} data Datos del reembolso
     */
    async crearItem(data) {
        if (!this.apiKey || !this.boardId) {
            console.warn('[MONDAY] API Key o Board ID no configurados');
            return null;
        }

        // Validar que los campos críticos del reembolso no estén vacíos o incompletos
        if (!data.rut || !data.correo || !data.banco || !data.numero_cuenta || !data.tipo_cuenta || !data.nombre_beneficiario) {
            console.warn(`[MONDAY] No se puede crear el item para PNR ${data.pnr || 'N/A'} porque faltan datos requeridos (RUT, Correo, Banco, Cuenta, Tipo de Cuenta o Beneficiario).`);
            return null;
        }

        // Mapeo de columnas (Ajustar según IDs reales de Monday si es necesario)
        // Por ahora usamos nombres descriptivos que Monday suele mapear o permite vía GraphQL
        const query = `
            mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (
                    board_id: $boardId, 
                    item_name: $itemName, 
                    column_values: $columnValues
                ) {
                    id
                }
            }
        `;

        // Determinar el valor de Tipo Devolución (tipo_cuenta)
        // Monday espera que el label coincida con las opciones del dropdown/status
        let tipoDevolucionLabel = "Débito"; // default
        if (data.tipo_cuenta) {
            const tcUpper = data.tipo_cuenta.toUpperCase();
            if (tcUpper.includes('AHORRO')) {
                tipoDevolucionLabel = 'Ahorro';
            } else if (tcUpper.includes('CORRIENTE')) {
                tipoDevolucionLabel = 'Corriente';
            } else if (tcUpper.includes('VISTA') || tcUpper.includes('RUT')) {
                tipoDevolucionLabel = 'Vista';
            } else {
                tipoDevolucionLabel = data.tipo_cuenta;
            }
        }

        // Mapeo de columnas con IDs REALES del tablero
        const columnValues = {
            "text_mkybpcy2": data.rut, // Rut
            "email5u69zpnc": { "email": data.correo, "text": data.correo }, // E-mail
            "text_mm0hc2f7": data.pnr, // Nro Reserva
            "text_mkybrjrx": data.origen, // Origen
            "text_mkybzxs5": data.destino, // Destino
            // Formatear fecha a YYYY-MM-DD de forma segura (asume DD-MM-YYYY o YYYY-MM-DD)
            "date_mkyb96c3": data.fecha_salida ? (
                data.fecha_salida.includes('-') && data.fecha_salida.split('-')[0].length === 2 
                    ? data.fecha_salida.split('-').reverse().join('-') 
                    : data.fecha_salida.split('T')[0]
            ) : null, // Fecha de Salida
            "numeric_mkyb79nh": data.numero_asiento, // Asiento
            "numeric_mkybttcy": data.monto, // Monto
            "text_mkybh4k9": data.banco, // Banco
            "text_mm071egp": data.numero_cuenta, // Nro de Cuenta
            "text_mkyhjj5x": data.nombre_beneficiario, // Usamos campo extra para el nombre del que recibe
            "dropdown_mm20ws39": { "labels": ["Convenios"] }, // Canal de Venta (Debe ser un array de labels)
            "color_mkybj85y": { "label": tipoDevolucionLabel } // Tipo Devolución (Mapeado a tipo_cuenta)
        };

        try {
            const response = await axios.post(this.apiUrl, {
                query,
                variables: {
                    boardId: this.boardId,
                    itemName: data.nombre_beneficiario || data.nombre_pasajero || `Reembolso ${data.pnr}`,
                    columnValues: JSON.stringify(columnValues)
                }
            }, {
                headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json',
                    'API-Version': '2023-10'
                }
            });

            if (response.data.errors) {
                console.error('[MONDAY] Errores en la mutación:', response.data.errors);
                throw new Error('Error al crear item en Monday');
            }

            return response.data.data.create_item.id;
        } catch (error) {
            console.error('[MONDAY] Error al crear item:', error.message);
            throw error;
        }
    }
    
    /**
     * Obtener el estado de un item en Monday
     * @param {string} itemId ID del elemento en Monday
     */
    async obtenerEstadoItem(itemId) {
        if (!this.apiKey || !itemId) return null;

        const query = `
            query ($itemId: [ID!]) {
                items (ids: $itemId) {
                    column_values (ids: ["color_mkyb1dma"]) {
                        text
                    }
                }
            }
        `;

        try {
            const response = await axios.post(this.apiUrl, {
                query,
                variables: { itemId: [itemId] }
            }, {
                headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json',
                    'API-Version': '2023-10'
                }
            });

            const item = response.data.data?.items?.[0];
            return item?.column_values?.[0]?.text || null;
        } catch (error) {
            console.error('[MONDAY] Error al obtener estado:', error.message);
            return null;
        }
    }

    /**
     * Buscar un item por PNR en el tablero
     * @param {string} pnr El PNR a buscar
     */
    async buscarItemPorPNR(pnr) {
        if (!this.apiKey || !this.boardId || !pnr) return null;

        const query = `
            query ($boardId: ID!, $columnId: String!, $value: [String]!) {
                items_page_by_column_values (limit: 1, board_id: $boardId, columns: [{column_id: $columnId, column_values: $value}]) {
                    items {
                        id
                    }
                }
            }
        `;

        try {
            const response = await axios.post(this.apiUrl, {
                query,
                variables: {
                    boardId: this.boardId,
                    columnId: "text_mm0hc2f7", // ID de columna PNR
                    value: [pnr]
                }
            }, {
                headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json',
                    'API-Version': '2023-10'
                }
            });

            const item = response.data.data?.items_page_by_column_values?.items?.[0];
            return item?.id || null;
        } catch (error) {
            console.error('[MONDAY] Error al buscar item por PNR:', error.message);
            return null;
        }
    }
}

module.exports = new MondayService();
