const nodemailer = require('nodemailer');
const { env } = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
  }

  async sendPasswordResetEmail(toEmail, resetUrl) {
    const mailOptions = {
      from: `"UrbanShield Soporte" <${env.email.user}>`,
      to: toEmail,
      subject: 'Recuperación de Contraseña - UrbanShield',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2b6cb0; text-align: center;">Recuperación de Contraseña</h2>
          <p style="font-size: 16px; color: #333;">Hola,</p>
          <p style="font-size: 16px; color: #333;">Hemos recibido una solicitud para restablecer tu contraseña en <strong>UrbanShield</strong>.</p>
          <p style="font-size: 16px; color: #333;">Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace es válido por 1 hora.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2b6cb0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Restablecer Contraseña</a>
          </div>
          <p style="font-size: 14px; color: #666;">Si no solicitaste este cambio, puedes ignorar este correo con seguridad.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">UrbanShield &copy; ${new Date().getFullYear()}</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('No se pudo enviar el correo de recuperación');
    }
  }
}

module.exports = new EmailService();
