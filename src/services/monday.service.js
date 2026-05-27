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
        // Monday solo acepta: "Débito" o "Crédito en Cuotas"
        let tipoDevolucionLabel = "Débito"; // default
        if (data.tipo_cuenta) {
            const tcUpper = data.tipo_cuenta.toUpperCase();
            if (tcUpper.includes('CREDITO') || tcUpper.includes('CRÉDITO') || tcUpper.includes('CUOTAS')) {
                tipoDevolucionLabel = 'Crédito en Cuotas';
            } else {
                tipoDevolucionLabel = 'Débito';
            }
        }

        // Definir valores con fallbacks seguros para evitar que Monday falle por nulos o formatos vacíos
        const rutVal = data.rut || "Sin RUT";
        const emailVal = data.correo || "viajes@pullmanbus.cl";
        const pnrVal = data.pnr || "S/PNR";
        const origenVal = data.origen || "Sin Origen";
        const destinoVal = data.destino || "Sin Destino";
        
        let fechaSalidaFormatted = new Date().toISOString().split('T')[0];
        if (data.fecha_salida) {
            fechaSalidaFormatted = data.fecha_salida.includes('-') && data.fecha_salida.split('-')[0].length === 2 
                ? data.fecha_salida.split('-').reverse().join('-') 
                : data.fecha_salida.split('T')[0];
        }

        const asientoVal = data.numero_asiento ? Number(data.numero_asiento) : 0;
        const montoVal = data.monto ? Number(data.monto) : 0;
        const bancoVal = data.banco || "Sin Especificar";
        const tipoCuentaVal = data.tipo_cuenta || "CUENTA VISTA";
        const nroCuentaVal = data.numero_cuenta || "Sin Cuenta";

        // Mapeo de columnas con IDs REALES del tablero
        const columnValues = {
            "text_mkybpcy2": rutVal, // Rut
            "email5u69zpnc": { "email": emailVal, "text": emailVal }, // E-mail
            "text_mm0hc2f7": pnrVal, // Nro Reserva
            "text_mkybrjrx": origenVal, // Origen
            "text_mkybzxs5": destinoVal, // Destino
            "date_mkyb96c3": fechaSalidaFormatted, // Fecha de Salida
            "numeric_mkyb79nh": asientoVal, // Asiento
            "numeric_mkybttcy": montoVal, // Monto
            "text_mkybh4k9": bancoVal, // Banco
            "text_mm3fnxw9": tipoCuentaVal, // Tipo de Cuenta
            "text_mm071egp": nroCuentaVal, // Nro de Cuenta
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
