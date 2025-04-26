// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import * as process from 'node:process';
import * as PDFDocument from 'pdfkit';



@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(to: string, code: number) {
    const mailOptions = {
      from: '"Green Energy" <yesser.khaloui@etudiant-fst.utm.tn>',
      to: to,
      subject: 'Password Reset Request',
      html: ` <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>Static Template</title>
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
          <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner); background-repeat: no-repeat; background-size: 800px 452px; background-position: top center; font-size: 14px; color: #434343;">
            <header>
              <table style="width: 100%;">
                <tbody>
                  <tr style="height: 0;">
                    <td>
                      <img alt="" src="https://res-console.cloudinary.com/dcjtuxprn/thumbnails/v1/image/upload/v1731662110/bG9nb191c2ZwNmQ=/drilldown" height="30px" />
                    </td>
                    <td style="text-align: right;">
                      <span style="font-size: 16px; line-height: 30px; color: #ffffff;">${new Date().toLocaleDateString()}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </header>
            <main>
              <div style="margin: 0; margin-top: 70px; padding: 92px 30px 115px; background: #ffffff; border-radius: 30px; text-align: center;">
                <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #1f1f1f;">Your OTP</h1>
                  <p style="margin: 0; margin-top: 17px; font-size: 16px; font-weight: 500;">Hey there,</p>
                  <p style="margin: 0; margin-top: 17px; font-weight: 500; letter-spacing: 0.56px;">
                    Thank you for choosing our service. Use the following OTP to complete the password reset process. This OTP is valid for
                    <span style="font-weight: 600; color: #1f1f1f;">5 minutes</span>.
                    Do not share this code with others.
                  </p>
                  <p style="margin: 0; margin-top: 60px; font-size: 40px; font-weight: 600; letter-spacing: 25px; color: #ba3d4f;">
                    ${code}
                  </p>
                </div>
              </div>
              <p style="max-width: 400px; margin: 0 auto; margin-top: 90px; text-align: center; font-weight: 500; color: #8c8c8c;">
                Need help? Contact us at <a href="mailto:support@example.com" style="color: #499fb6; text-decoration: none;">support@example.com</a>
              </p>
            </main>
            <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
              <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #434343;">Our Company</p>
              <p style="margin: 0; margin-top: 8px; color: #434343;">Address, City, State</p>
              <div style="margin: 0; margin-top: 16px;">
                <!-- Social Media Icons Here -->
              </div>
              <p style="margin: 0; margin-top: 16px; color: #434343;">
                Copyright © 2024 Company. All rights reserved.
              </p>
            </footer>
          </div>
        </body>
      </html>`,
    };
    await this.transporter.sendMail(mailOptions);
  }


  async sendEmailConfirmation(to: string, verificationLink: string, userName: string) {
    const mailOptions = {
      from: '"Green Energy" <yesser.khaloui@etudiant-fst.utm.tn>',
      to: to,
      subject: 'Confirm Your Email Address',
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>Email Confirmation</title>
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
          <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner); background-repeat: no-repeat; background-size: 800px 452px; background-position: top center; font-size: 14px; color: #434343;">
            <header>
              <table style="width: 100%;">
                <tbody>
                  <tr style="height: 0;">
                    <td>
                      <img alt="" src="https://res-console.cloudinary.com/dcjtuxprn/thumbnails/v1/image/upload/v1731662110/bG9nb191c2ZwNmQ=/drilldown" height="30px" />
                    </td>
                    <td style="text-align: right;">
                      <span style="font-size: 16px; line-height: 30px; color: #ffffff;">${new Date().toLocaleDateString()}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </header>
            <main>
              <div style="margin: 0; margin-top: 70px; padding: 92px 30px 115px; background: #ffffff; border-radius: 30px; text-align: center;">
                <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #1f1f1f;">Email Confirmation</h1>
                  <p style="margin: 0; margin-top: 17px; font-size: 16px; font-weight: 500;">Hello ${userName},</p>
                  <p style="margin: 0; margin-top: 17px; font-weight: 500; letter-spacing: 0.56px;">
                    Thank you for signing up with Green Energy. Please confirm your email address by clicking the button below.
                    This link will expire in <span style="font-weight: 600; color: #1f1f1f;">24 hours</span>.
                  </p>
                  <div style="margin-top: 40px;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 15px 30px; background: #499fb6; border-radius: 5px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Confirm Email</a>
                  </div>
                  <p style="margin: 0; margin-top: 30px; font-weight: 500; letter-spacing: 0.56px;">
                    If the button above doesn't work, you can also copy and paste the following link into your browser:
                  </p>
                  <p style="margin: 0; margin-top: 15px; font-size: 14px; word-break: break-all; color: #499fb6;">
                    ${verificationLink}
                  </p>
                </div>
              </div>
              <p style="max-width: 400px; margin: 0 auto; margin-top: 90px; text-align: center; font-weight: 500; color: #8c8c8c;">
                Need help? Contact us at <a href="mailto:support@example.com" style="color: #499fb6; text-decoration: none;">support@example.com</a>
              </p>
            </main>
            <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
              <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #434343;">Our Company</p>
              <p style="margin: 0; margin-top: 8px; color: #434343;">Address, City, State</p>
              <div style="margin: 0; margin-top: 16px;">
                <!-- Social Media Icons Here -->
              </div>
              <p style="margin: 0; margin-top: 16px; color: #434343;">
                Copyright © 2024 Company. All rights reserved.
              </p>
            </footer>
          </div>
        </body>
      </html>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
  // email.service.ts
  /*
 async sendSignupConfirmationEmail(to: string, userName: string, packDetails: any) {
   const mailOptions = {
     from: '"Green Energy" <yesser.khaloui@etudiant-fst.utm.tn>',
     to: to,
     subject: 'Confirmation de votre pack',
     html: `
       <!DOCTYPE html>
       <html lang="fr">
         <head>
           <meta charset="UTF-8" />
           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
           <meta http-equiv="X-UA-Compatible" content="ie=edge" />
           <title>Confirmation de Pack</title>
           <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"/>
         </head>
         <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
           <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
             <header>
               <table style="width: 100%;">
                 <tr>
                   <td><img alt="logo" src="logo-url" height="30px" /></td>
                   <td style="text-align: right;">
                     <span style="font-size: 16px; color: #ffffff;">${new Date().toLocaleDateString()}</span>
                   </td>
                 </tr>
               </table>
             </header>
             <main>
               <div style="text-align: center; padding: 50px; background: #ffffff; border-radius: 10px;">
                 <h1 style="font-size: 24px; color: #333;">Confirmation de votre Pack</h1>
                 <p>Bonjour ${userName},</p>
                 <p>Merci de vous être inscrit sur notre plateforme. Voici les détails de votre pack :</p>
                 <ul style="text-align: left; margin: 20px 0; list-style: none;">
                   <li><strong>Pack:</strong> ${packDetails.title}</li>
                   <li><strong>Description:</strong> ${packDetails.description}</li>
                   <li><strong>Prix:</strong> ${packDetails.price} €</li>
                 </ul>
                 <p>Nous vous souhaitons une excellente expérience avec notre service.</p>
               </div>
             </main>
             <footer style="width: 100%; text-align: center; margin-top: 20px;">
               <p style="font-size: 14px; color: #434343;">Copyright © 2024 Green Energy. Tous droits réservés.</p>
             </footer>
           </div>
         </body>
       </html>`
   };
 
   await this.transporter.sendMail(mailOptions);
 }*/


  // Modifiez mail.service.ts

  /*async sendSignupConfirmationEmail(to: string, userName: string, pack: any) {
    // Gestion des valeurs par défaut en cas d'absence de certaines propriétés
    const packId = {
      title: pack.title || 'N/A',
      description: pack.description || 'N/A',
      price: pack.price !== undefined ? `${pack.price} €` : 'N/A'
    };

    const mailOptions = {
      from: '"Green Energy" <your.email@example.com>',
      to: to,
      subject: 'Confirmation de votre pack',
      html: `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Confirmation de Pack</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"/>
        </head>
        <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
          <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
            <header>
              <table style="width: 100%;">
                <tr>
                  <td>
                    <img alt="logo" src="https://res-console.cloudinary.com/dcjtuxprn/thumbnails/v1/image/upload/v1731662110/bG9nb191c2ZwNmQ=/drilldown" height="30px" />
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size: 16px; color: #333;">${new Date().toLocaleDateString()}</span>
                  </td>
                </tr>
              </table>
            </header>
            <main>
              <div style="text-align: center; padding: 50px; background: #ffffff; border-radius: 10px; margin-top: 30px;">
                <h1 style="font-size: 24px; color: #333;">Confirmation de votre Pack</h1>
                <p>Bonjour ${userName},</p>
                <p>Merci de vous être inscrit sur notre plateforme. Voici les détails de votre pack :</p>
                <div style="text-align: left; margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                  <p><strong>Pack :</strong> ${pack.title}</p>
                  <p><strong>Description :</strong> ${pack.description}</p>
                  <p><strong>Prix :</strong> ${pack.price}</p>
                </div>
                <p>Nous vous souhaitons une excellente expérience avec notre service.</p>
              </div>
            </main>
            <footer style="width: 100%; text-align: center; margin-top: 20px;">
              <p style="font-size: 14px; color: #434343;">Copyright © 2024 Green Energy. Tous droits réservés.</p>
            </footer>
          </div>
        </body>
      </html>
      `
    };

    // Envoi de l'email
    await this.transporter.sendMail(mailOptions);
  }

  // Autres fonctions d'envoi d'email (ex: confirmation d'email, etc.) peuvent être ajoutées ici…

  */
  // Méthode pour générer un PDF avec les détails du pack


  // Convert this to a Promise-based approach
  // Uniquement modifier la méthode generatePdf
  async generatePdf(packDetails: any): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Couleurs
      const blueColor = '#0a2463';      // Bleu foncé pour le texte principal
      const greenColor = '#3a7d44';     // Vert pour "Votre Pack"
      const grayColor = '#666666';      // Gris pour le texte régulier
      const BlackColor = '#000000';     // Noir pour le texte
      const whiteColor = '#ffffff';    // Blanc pour le texte sur fond coloré

      // Remplacez 'path/to/your/logo.png' par le chemin vers votre fichier logo
      doc.image('src/assets/logo2.png', 50, 50, { width: -100 });      // Si vous avez un logo local:
      // doc.image('path/to/logo.png', 50, 50, { width: 150 });
      // Barre jaune horizontale avec texte "Reçu de Paiement"
      doc.rect(0, 130, doc.page.width / 2, 40).fillColor(greenColor).fill();
      doc.rect(doc.page.width / 2, 130, doc.page.width / 2, 40).fillColor(greenColor).fill();

      doc.fontSize(24)
        .font('Helvetica-Bold')
        .fillColor(whiteColor)
        .text('Reçu de Paiement', doc.page.width / 2, 140, { align: 'center' });

      // Titre "Votre Pack :"
      doc.moveDown(3);
      doc.fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(greenColor)
        .text('Votre Pack :', 50, 200);

      doc.moveDown(1.5);

      // Table des détails - style similaire à l'image
      // Nom
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(blueColor)
        .text('Nom', 50, 240);

      doc.font('Helvetica')
        .fontSize(12)
        .fillColor(BlackColor)
        .text(packDetails.title || 'N/A', 320, 240);

      // Description
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(blueColor)
        .text('Description', 50, 270);

      // Text de description sur plusieurs lignes si nécessaire
      const descriptionText = packDetails.description || 'N/A';
      doc.font('Helvetica')
        .fontSize(12)
        .fillColor(BlackColor)
        .text(descriptionText, 320, 270, {
          width: 250,
          align: 'left'
        });

      // Calculer la hauteur du texte pour positionner le champ Prix correctement
      const textHeight = doc.heightOfString(descriptionText, {
        width: 250,
        align: 'left'
      });

      // Prix - positionnement dynamique basé sur la hauteur de la description
      const prixY = Math.max(300, 270 + textHeight + 20);

      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(blueColor)
        .text('Prix', 50, prixY);

      doc.font('Helvetica')
        .fontSize(12)
        .fillColor(BlackColor)
        .text(`${packDetails.price || 'N/A'} DT`, 320, prixY);

      // Pied de page
      const pageBottom = doc.page.height - 10;

      doc.fontSize(10)
        .fillColor('#999999')
        .text('Green Energy - Votre partenaire pour une énergie durable', 10, pageBottom, { align: 'center' });

      // Finaliser le PDF
      doc.end();
    });
  }
  async sendSignupConfirmationEmail(
    email: string,
    userName: string,
    packDetails: any,
  ) {
    try {
      // Generate the PDF and wait for it to complete
      const pdfBuffer = await this.generatePdf(packDetails);

      // Improved HTML email template
      const mailOptions = {
        from: '"Green Energy" <yesser.khaloui@etudiant-fst.utm.tn>',
        to: email,
        subject: 'Confirmation de votre inscription',
        html: `<!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>Confirmation d'Inscription</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"/>
        </head>
        <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
          <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner); background-repeat: no-repeat; background-size: 800px 452px; background-position: top center; font-size: 14px; color: #434343;">
            <header>
              <table style="width: 100%;">
                <tbody>
                  <tr style="height: 0;">
                    <td>
                      <img alt="" src="https://res-console.cloudinary.com/dcjtuxprn/thumbnails/v1/image/upload/v1731662110/bG9nb191c2ZwNmQ=/drilldown" height="30px" />
                    </td>
                    <td style="text-align: right;">
                      <span style="font-size: 16px; line-height: 30px; color: #ffffff;">${new Date().toLocaleDateString()}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </header>
            <main>
              <div style="margin: 0; margin-top: 70px; padding: 92px 30px 115px; background: #ffffff; border-radius: 30px; text-align: center;">
                <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #1f1f1f;">Bienvenue, ${userName}!</h1>
                  <p style="margin: 0; margin-top: 17px; font-size: 16px; font-weight: 500;">Merci pour votre inscription!</p>
                  <p style="margin: 0; margin-top: 17px; font-weight: 500; letter-spacing: 0.56px;">
                    Vous trouverez ci-joint le PDF contenant les détails de votre pack.
                  </p>
                </div>
              </div>
              <p style="max-width: 400px; margin: 0 auto; margin-top: 90px; text-align: center; font-weight: 500; color: #8c8c8c;">
                Need help? Contact us at <a href="mailto:support@example.com" style="color: #499fb6; text-decoration: none;">support@example.com</a>
              </p>
            </main>
            <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
              <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #434343;">Green Energy</p>
              <p style="margin: 0; margin-top: 8px; color: #434343;">Address, City, State</p>
              <p style="margin: 0; margin-top: 16px; color: #434343;">
                Copyright © 2024 Green Energy. Tous droits réservés.
              </p>
            </footer>
          </div>
        </body>
      </html>`,
        attachments: [
          {
            filename: 'pack-details.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf'
          },
        ],
      };

      // Send the email
      await this.transporter.sendMail(mailOptions);
      console.log('Email with PDF attachment sent successfully!');
    } catch (error) {
      console.error('Error sending email with PDF attachment:', error);
      throw new Error('Failed to send email with PDF attachment');
    }
  }

}