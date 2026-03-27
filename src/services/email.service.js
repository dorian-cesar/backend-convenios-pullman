const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * Envía un correo de notificación cuando una solicitud es recibida (Enrolamiento).
 * @param {string} correoDestino - El correo del beneficiario.
 * @param {string} nombre - Nombre del solicitante.
 * @param {string} nombreConvenio - Nombre del convenio al que se inscribe.
 */
exports.enviarCorreoEnrolamiento = async (correoDestino, nombre, nombreConvenio) => {
    if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid API Key no configurada. No se enviará el correo de enrolamiento.');
        return false;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@pullman.cl';

    const msg = {
        to: correoDestino,
        from: fromEmail,
        subject: `Solicitud de Beneficio Recibida: ${nombreConvenio}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #1a73e8;">¡Hola ${nombre}!</h2>
                <p>Hemos recibido correctamente tu solicitud para inscribirte en el convenio <strong>${nombreConvenio}</strong>.</p>
                <div style="background-color: #e8f0fe; color: #1967d2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    Un ejecutivo revisará tus antecedentes y recibirás una respuesta de confirmación de aceptación o rechazo en un plazo máximo de <strong>48 horas</strong>.
                </div>
                <p>No es necesario que respondas a este correo.</p>
                <br>
                <p>Saludos,<br><strong>Equipo Pullman Bus</strong></p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        logger.info(`Correo de enrolamiento enviado exitosamente a ${correoDestino}`);
        return true;
    } catch (error) {
        logger.error(`Error al enviar correo de enrolamiento a ${correoDestino}:`, error);
        return false;
    }
};

/**
 * Envía un correo de notificación cuando una solicitud es aceptada.
 * @param {string} correoDestino - El correo del beneficiario.
 * @param {string} nombre - Nombre del solicitante.
 * @param {string} nombreConvenio - Nombre del convenio.
 */
exports.enviarCorreoAceptacion = async (correoDestino, nombre, nombreConvenio) => {
    if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid API Key no configurada. No se enviará el correo de aceptación.');
        return false;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@pullman.cl';

    const msg = {
        to: correoDestino,
        from: fromEmail,
        subject: `¡Solicitud Aprobada!: ${nombreConvenio}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #0d904f;">¡Excelentes noticias ${nombre}!</h2>
                <p>Tu solicitud para el convenio <strong>${nombreConvenio}</strong> ha sido <strong>APROBADA</strong>.</p>
                <p>Desde ahora puedes disfrutar de tus beneficios al comprar tus pasajes a través de nuestro sitio web <a href="https://www.convenios.pullmanbus.cl">www.convenios.pullmanbus.cl</a>.</p>
                <br>
                <p>Saludos,<br><strong>Equipo Pullman Bus</strong></p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        logger.info(`Correo de aceptación enviado a ${correoDestino}`);
        return true;
    } catch (error) {
        logger.error(`Error al enviar correo de aceptación a ${correoDestino}:`, error);
        return false;
    }
};

/**
 * Envía un correo de notificación cuando una solicitud es rechazada.
 */
exports.enviarCorreoRechazo = async (correoDestino, nombre, razonRechazo, nombreConvenio) => {
    if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid API Key no configurada. No se enviará el correo de rechazo.');
        return false;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@pullman.cl';

    const msg = {
        to: correoDestino,
        from: fromEmail,
        subject: `Actualización de solicitud: ${nombreConvenio}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #d93025;">Actualización de tu solicitud</h2>
                <p>Hola <strong>${nombre}</strong>,</p>
                <p>Tu usuario ha sido rechazado por el siguiente motivo:</p>
                <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; font-weight: bold;">
                    ${razonRechazo}
                </div>
                <p>Comuníquese al correo <a href="mailto:clientes@pullmanbus.cl">clientes@pullmanbus.cl</a> para más información.</p>
                <br>
                <p>Saludos,<br><strong>Equipo Pullman Bus</strong></p>
            </div>
        `,

    };

    try {
        await sgMail.send(msg);
        logger.info(`Correo de rechazo enviado a ${correoDestino}`);
        return true;
    } catch (error) {
        logger.error(`Error al enviar correo de rechazo a ${correoDestino}:`, error);
        return false;
    }
};
