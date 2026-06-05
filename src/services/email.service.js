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
                <p>Desde ahora puedes disfrutar de tus beneficios al comprar tus pasajes a traves de nuestro sitio web <a href="https://www.convenios.pullmanbus.cl">www.convenios.pullmanbus.cl</a>.</p>
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

/**
 * Envía un correo de notificación técnica cuando se genera un evento con estado 'expirado' o 'error_confirmacion'.
 * @param {Object} evento - El objeto del evento creado.
 */
exports.enviarNotificacionEventoFallido = async (evento) => {
    if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid API Key no configurada. No se enviará la notificación de evento fallido.');
        return false;
    }

    const toEmails = process.env.EMAIL_NOTIFICACION_EXPIRADOS ? process.env.EMAIL_NOTIFICACION_EXPIRADOS.split(',').map(e => e.trim()) : [];
    if (toEmails.length === 0) {
        logger.warn('No hay correos configurados en EMAIL_NOTIFICACION_EXPIRADOS.');
        return false;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@pullman.cl';

    const estadoFormateado = evento.estado === 'error_confirmacion' ? 'ERROR DE CONFIRMACIÓN' : evento.estado.toUpperCase();
    const isErrorConf = evento.estado === 'error_confirmacion';
    const colorBorde = isErrorConf ? '#dc3545' : '#ffcc00';
    const colorBg = isErrorConf ? '#f8d7da' : '#fffbef';
    const colorTexto = isErrorConf ? '#721c24' : '#856404';

    const msg = {
        to: toEmails,
        from: fromEmail,
        subject: `⚠️ Alerta: Evento ${estadoFormateado} detectado - Ticket ${evento.numero_ticket || 'N/A'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid ${colorBorde}; border-radius: 5px; background-color: ${colorBg};">
                <h2 style="color: ${colorTexto};">Notificación de Evento ${estadoFormateado}</h2>
                <p>Se ha registrado un evento con estado <strong>${estadoFormateado}</strong> en el sistema.</p>
                <hr>
                <p><strong>Detalles del Evento:</strong></p>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>ID Evento:</strong> ${evento.id}</li>
                    <li><strong>Ticket:</strong> ${evento.numero_ticket || 'N/A'}</li>
                    <li><strong>PNR:</strong> ${evento.pnr || 'N/A'}</li>
                    <li><strong>Pasajero ID:</strong> ${evento.pasajero_id}</li>
                    <li><strong>Convenio ID:</strong> ${evento.convenio_id}</li>
                    <li><strong>Tarifa Base:</strong> ${evento.tarifa_base}</li>
                    <li><strong>Monto Pagado:</strong> ${evento.monto_pagado}</li>
                    <li><strong>Fecha Evento:</strong> ${evento.fecha_evento}</li>
                </ul>
                <p style="font-size: 0.9em; color: #666;">Este es un correo automático generado por el backend.</p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        logger.info(`Notificación de evento ${evento.estado} enviada a: ${toEmails.join(', ')}`);
        return true;
    } catch (error) {
        logger.error(`Error al enviar notificación de evento ${evento.estado}:`, error);
        return false;
    }
};

/**
 * Envía un correo con el link de completación de datos para un reembolso.
 * @param {string} correoDestino - El correo del beneficiario.
 * @param {string} pnr - El localizador del ticket.
 * @param {string} token - El token para el link dinámico.
 */
exports.enviarCorreoReembolso = async (correoDestino, pnr, token) => {
    if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid API Key no configurada. No se enviará el correo de reembolso.');
        return false;
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@pullman.cl';
    // Link basado en la URL del frontend configurada
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${frontendUrl}/reembolso/completar/${token}`;

    const msg = {
        to: correoDestino,
        from: fromEmail,
        subject: `Solicitud de Reembolso Ticket: ${pnr}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1e293b; margin: 0; font-size: 24px;">Gestión de Devoluciones</h1>
                    <p style="color: #64748b; margin-top: 5px;">Pullman Bus</p>
                </div>
                
                <h2 style="color: #0f172a; font-size: 18px;">Estimado/a,</h2>
                <p style="color: #475569; line-height: 1.6;">
                    Se ha iniciado una solicitud de devolución para tu ticket con PNR <strong>${pnr}</strong>.
                </p>
                <p style="color: #475569; line-height: 1.6;">
                    Para procesar la transferencia de los fondos, necesitamos que completes tus datos bancarios en el siguiente enlace:
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${link}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; transition: background-color 0.2s;">
                        Completar Mis Datos
                    </a>
                </div>
                
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; background-color: #f8fafc; padding: 15px; border-radius: 8px;">
                    <strong>Nota:</strong> Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:<br>
                    <a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a>
                </p>
                
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                    Este es un correo automático, por favor no respondas.<br>
                    &copy; ${new Date().getFullYear()} Pullman Bus. Todos los derechos reservados.
                </p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        logger.info(`Correo de reembolso enviado a ${correoDestino}`);
        return true;
    } catch (error) {
        logger.error(`Error al enviar correo de reembolso a ${correoDestino}:`, error);
        return false;
    }
};

/**
 * Notifica a los administradores que un cliente completó sus datos.
 */
exports.enviarNotificacionAdminReembolso = async (reembolso) => {
    if (!process.env.SENDGRID_API_KEY) return false;

    const admins = ['myaraure@wit.la', 'mlima@wit.la'];
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@pullman.cl';

    const msg = {
        to: admins,
        from: fromEmail,
        subject: `[NUEVO] Datos Recibidos - Reembolso PNR: ${reembolso.pnr}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Nueva Información de Reembolso Recibida</h2>
                <p>El cliente ha completado sus datos para la siguiente solicitud:</p>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>PNR:</strong> ${reembolso.pnr}</li>
                    <li><strong>Beneficiario:</strong> ${reembolso.nombre_beneficiario}</li>
                    <li><strong>Monto:</strong> $${reembolso.monto}</li>
                    <li><strong>Categoría:</strong> ${reembolso.categoria}</li>
                </ul>
                <p>Ya puedes revisar y sincronizar esta solicitud en el Dashboard de Administración.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">Sistema de Gestión de Convenios - Pullman Bus</p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        logger.info(`Notificación administrativa enviada a: ${admins.join(', ')}`);
        return true;
    } catch (error) {
        logger.error(`Error al enviar notificación administrativa:`, error);
        return false;
    }
};
