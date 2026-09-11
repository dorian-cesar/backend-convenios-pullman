const axios = require('axios');
const { fetchTicketInfoFromKupos } = require('../services/eventos.service');

// Mockear el módulo axios
jest.mock('axios');

describe('Eventos Service - fetchTicketInfoFromKupos (con Mocks)', () => {
    beforeEach(() => {
        // Limpiar todos los mocks antes de cada prueba
        jest.clearAllMocks();
        
        // Simular variables de entorno necesarias para la prueba
        process.env.KUPOS_API_URL = 'http://api.mock.kupos.cl';
        process.env.KUPOS_API_KEY = 'mock_api_key_123';
    });

    afterEach(() => {
        delete process.env.KUPOS_API_URL;
        delete process.env.KUPOS_API_KEY;
    });

    it('debería retornar null si no se proporciona un número de ticket', async () => {
        const result = await fetchTicketInfoFromKupos(null);
        expect(result).toBeNull();
        expect(axios.get).not.toHaveBeenCalled();
    });

    it('debería retornar null si faltan las variables de entorno de Kupos', async () => {
        delete process.env.KUPOS_API_URL;
        const result = await fetchTicketInfoFromKupos('TICKET123');
        expect(result).toBeNull();
        expect(axios.get).not.toHaveBeenCalled();
    });

    it('debería mapear correctamente un estado "confirmed" a "confirmado" y retornar el operator_pnr', async () => {
        // Mockeamos la respuesta exitosa de axios
        const mockResponse = {
            data: {
                result: {
                    ticket_details: [
                        { operator_pnr: 'OP_PNR_777', status: 'confirmed' }
                    ]
                }
            }
        };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await fetchTicketInfoFromKupos('TICKET123');

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith('http://api.mock.kupos.cl', {
            params: { pnr_number: 'TICKET123', api_key: 'mock_api_key_123' },
            timeout: 5000
        });
        
        expect(result).toEqual({
            operator_pnr: 'OP_PNR_777',
            status: 'confirmado'
        });
    });

    it('debería mapear correctamente un estado "canceled" a "anulado"', async () => {
        const mockResponse = {
            data: {
                result: {
                    ticket_details: [
                        { operator_pnr: 'OP_PNR_888', status: 'canceled' }
                    ]
                }
            }
        };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await fetchTicketInfoFromKupos('TICKET_CANCEL');
        
        expect(result).toEqual({
            operator_pnr: 'OP_PNR_888',
            status: 'anulado'
        });
    });

    it('debería manejar errores de red devolviendo null sin romper la ejecución', async () => {
        // Simulamos un error de timeout o caída de servicio
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        // Espiamos console.warn para no ensuciar la salida del test (opcional)
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await fetchTicketInfoFromKupos('TICKET_ERROR');
        
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toBeNull();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No se pudo obtener información para ticket TICKET_ERROR'));
        
        warnSpy.mockRestore();
    });
});
