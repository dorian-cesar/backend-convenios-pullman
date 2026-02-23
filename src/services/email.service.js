const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * Envía un correo de notificación cuando una solicitud es rechazada.
 * @param {string} correoDestino - El correo del estudiante/adulto mayor/pasajero regular.
 * @param {string} nombre - Nombre del solicitante.
 * @param {string} razonRechazo - Motivo del rechazo.
 * @param {string} tipoPasajero - 'Estudiante', 'Adulto Mayor', 'Pasajero Frecuente', etc.
 */
exports.enviarCorreoRechazo = async (correoDestino, nombre, razonRechazo, tipoPasajero) => {
    if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid API Key no configurada. No se enviará el correo de rechazo.');
        return false;
    }

    if (!correoDestino) {
        logger.warn(`El usuario ${nombre} no tiene correo registrado.`);
        return false;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@pullman.cl';

    const msg = {
        to: correoDestino,
        from: fromEmail,
        subject: `Actualización de solicitud: ${tipoPasajero}`,
        text: `Hola ${nombre},\n\nTu solicitud como ${tipoPasajero} ha sido rechazada por el siguiente motivo:\n${razonRechazo}\n\nPor favor, envíe las nuevas imágenes a esta dirección de correo: [correo por definir]\n\nSaludos,\nEquipo Pullman`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #333;">Actualización de tu solicitud</h2>
                <p>Hola <strong>${nombre}</strong>,</p>
                <p>Te informamos que tu solicitud para inscribirte como <strong>${tipoPasajero}</strong> ha sido rechazada por el siguiente motivo:</p>
                <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    ${razonRechazo}
                </div>
                <p>Por favor, envíe las nuevas imágenes a esta dirección de correo: <strong>[correo por definir]</strong></p>
                <br>
                <p>Saludos,</p>
                <p><strong>Equipo Pullman</strong></p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        logger.info(`Correo de rechazo enviado exitosamente a ${correoDestino} (${tipoPasajero})`);
        return true;
    } catch (error) {
        logger.error(`Error al enviar correo de rechazo a ${correoDestino}:`, error);
        if (error.response) {
            logger.error(JSON.stringify(error.response.body));
        }
        return false;
    }
};
