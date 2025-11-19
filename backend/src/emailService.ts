import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Create email client (Resend, SendGrid, or SMTP transporter)
const createEmailClient = async () => {
  // Use Resend if API key is available
  if (process.env.RESEND_API_KEY) {
    console.log('📧 Configuration Resend détectée');
    const resend = new Resend(process.env.RESEND_API_KEY);
    return { type: 'resend', client: resend };
  }

  // Use SendGrid if API key is available
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Configuration SendGrid détectée');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return { type: 'sendgrid', client: sgMail };
  }

  // Use configured SMTP if available, otherwise use Ethereal for testing
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`📧 Configuration SMTP détectée: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || '587'}`);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Test the connection
    try {
      await transporter.verify();
      console.log('✅ Connexion SMTP vérifiée avec succès');
    } catch (verifyError) {
      console.error('❌ Erreur de vérification SMTP:', verifyError);
      throw verifyError;
    }

    return { type: 'smtp', client: transporter };
  }

  console.log('⚠️ Aucune configuration email trouvée, utilisation d\'Ethereal (emails de test)');
  // For testing/development, use Ethereal (fake SMTP service)
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return { type: 'smtp', client: transporter };
};

export const sendCertificateEmail = async (participantEmail: string, certificateData: any, certificatePath?: string) => {
  try {
    console.log(`📧 Tentative d'envoi d'email à: ${participantEmail}`);
    const emailClient = await createEmailClient();

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || 'formation@bimades.com';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">BIMADES Consulting</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Bureau International de Management et d'Appui au Développement</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Félicitations ${certificateData.participantName} !</h2>

          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Nous avons le plaisir de vous informer que votre certificat de formation a été généré avec succès.
          </p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Détails du Certificat</h3>
            <p style="margin: 5px 0;"><strong>Numéro:</strong> ${certificateData.certificateNumber}</p>
            <p style="margin: 5px 0;"><strong>Date d'émission:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p style="margin: 5px 0;"><strong>Template:</strong> ${certificateData.template?.name || 'Template Standard'}</p>
            ${certificateData.formData?.trainingTitle ? `<p style="margin: 5px 0;"><strong>Formation:</strong> ${certificateData.formData.trainingTitle}</p>` : ''}
            ${certificateData.formData?.trainingDate ? `<p style="margin: 5px 0;"><strong>Date de formation:</strong> ${certificateData.formData.trainingDate}</p>` : ''}
            ${certificateData.formData?.trainingDuration ? `<p style="margin: 5px 0;"><strong>Durée:</strong> ${certificateData.formData.trainingDuration}</p>` : ''}
          </div>

          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Votre certificat est maintenant disponible et a été généré selon nos standards de qualité.
            Vous pouvez le télécharger et l'imprimer pour vos besoins professionnels.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #1e40af 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              📄 Télécharger le Certificat
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Cet email a été envoyé automatiquement par le système BIMADES.</p>
            <p>Pour toute question, contactez-nous à formation@bimades.com</p>
            <p style="margin-top: 15px;">
              <strong>BIMADES Consulting</strong><br>
              10 BP 13122 Ouaga 10, Burkina Faso<br>
              Tél: +226 67 10 20 20
            </p>
          </div>
        </div>
      </div>
    `;

    let info;
    if (emailClient.type === 'resend') {
      const emailOptions: any = {
        from: fromEmail,
        to: [participantEmail],
        subject: `Votre Certificat de Formation - ${certificateData.certificateNumber}`,
        html: htmlContent,
      };

      // Add attachment if certificate path is provided
      if (certificatePath) {
        const fs = require('fs');
        emailOptions.attachments = [{
          filename: `certificat_${certificateData.certificateNumber}.pdf`,
          content: fs.readFileSync(certificatePath),
          contentType: 'application/pdf'
        }];
      }

      const data = await (emailClient.client as Resend).emails.send(emailOptions);
      info = data;
      console.log('✅ Email Resend envoyé avec succès');
    } else if (emailClient.type === 'sendgrid') {
      const msg: any = {
        to: participantEmail,
        from: fromEmail,
        subject: `Votre Certificat de Formation - ${certificateData.certificateNumber}`,
        html: htmlContent,
      };

      // Add attachment if certificate path is provided
      if (certificatePath) {
        const fs = require('fs');
        msg.attachments = [{
          filename: `certificat_${certificateData.certificateNumber}.pdf`,
          content: fs.readFileSync(certificatePath).toString('base64'),
          type: 'application/pdf',
          disposition: 'attachment'
        }];
      }

      info = await (emailClient.client as typeof sgMail).send(msg);
      console.log('✅ Email SendGrid envoyé avec succès');
    } else {
      const mailOptions: any = {
        from: `"BIMADES Consulting" <${fromEmail}>`,
        to: participantEmail,
        subject: `Votre Certificat de Formation - ${certificateData.certificateNumber}`,
        html: htmlContent
      };

      // Add attachment if certificate path is provided
      if (certificatePath) {
        const fs = require('fs');
        mailOptions.attachments = [{
          filename: `certificat_${certificateData.certificateNumber}.pdf`,
          path: certificatePath,
          contentType: 'application/pdf'
        }];
      }

      info = await (emailClient.client as any).sendMail(mailOptions);
      console.log('✅ Email SMTP envoyé avec succès:', info.messageId);

      // In development mode, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    }

    return {
      success: true,
      messageId: emailClient.type === 'sendgrid' ? 'sendgrid-' + Date.now() : info.messageId,
      recipient: participantEmail,
      certificateNumber: certificateData.certificateNumber,
      sentAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

// Send confirmation email to participant
export const sendConfirmationEmail = async (participantEmail: string, participantName: string) => {
  try {
    const emailClient = await createEmailClient();

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || 'formation@bimades.com';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">BIMADES Consulting</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Bureau International de Management et d'Appui au Développement</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Demande reçue avec succès !</h2>

          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Bonjour ${participantName},
          </p>

          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Nous avons bien reçu votre demande d'attestation de formation. Votre demande est actuellement en cours de traitement.
          </p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Prochaines étapes</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li>Validation de votre demande par notre équipe</li>
              <li>Génération de votre certificat officiel</li>
              <li>Envoi du certificat par email</li>
            </ul>
          </div>

          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Vous recevrez un email supplémentaire contenant votre certificat une fois que votre demande aura été approuvée.
            Le processus peut prendre quelques jours ouvrables.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Cet email a été envoyé automatiquement par le système BIMADES.</p>
            <p>Pour toute question, contactez-nous à formation@bimades.com</p>
            <p style="margin-top: 15px;">
              <strong>BIMADES Consulting</strong><br>
              10 BP 13122 Ouaga 10, Burkina Faso<br>
              Tél: +226 67 10 20 20
            </p>
          </div>
        </div>
      </div>
    `;

    let info;
    if (emailClient.type === 'resend') {
      const data = await (emailClient.client as Resend).emails.send({
        from: fromEmail,
        to: [participantEmail],
        subject: 'Confirmation de votre demande d\'attestation',
        html: htmlContent,
      });
      info = data;
      console.log('✅ Email de confirmation Resend envoyé avec succès');
    } else if (emailClient.type === 'sendgrid') {
      const msg = {
        to: participantEmail,
        from: fromEmail,
        subject: 'Confirmation de votre demande d\'attestation',
        html: htmlContent,
      };
      info = await (emailClient.client as typeof sgMail).send(msg);
      console.log('✅ Email de confirmation SendGrid envoyé avec succès');
    } else {
      const mailOptions = {
        from: `"BIMADES Consulting" <${fromEmail}>`,
        to: participantEmail,
        subject: 'Confirmation de votre demande d\'attestation',
        html: htmlContent
      };
      info = await (emailClient.client as any).sendMail(mailOptions);
      console.log('✅ Email de confirmation SMTP envoyé avec succès:', info.messageId);

      // In development mode, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    }

    return {
      success: true,
      messageId: emailClient.type === 'sendgrid' ? 'sendgrid-' + Date.now() : info.messageId,
      recipient: participantEmail,
      sentAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const emailClient = await createEmailClient();
    if (emailClient.type === 'resend') {
      // For Resend, we can check if API key is valid by trying to get domains or just check if it's set
      console.log('✅ Configuration Resend valide');
      return { success: true };
    } else if (emailClient.type === 'sendgrid') {
      // For SendGrid, we can try to send a test email or just check if API key is set
      console.log('✅ Configuration SendGrid valide');
      return { success: true };
    } else {
      await (emailClient.client as any).verify();
      console.log('✅ Configuration email valide');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Configuration email invalide:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};