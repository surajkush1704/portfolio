import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer'

export const sendEnquiryNotification = functions
  .region('us-central1')
  .firestore
  .document('enquiries/{enquiryId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      functions.config().admin?.email ||
      'surajkush1704@gmail.com'

    const emailFrom =
      process.env.EMAIL_FROM ||
      functions.config().email?.from ||
      'surajkush1704@gmail.com'

    const emailPass =
      process.env.EMAIL_PASSWORD ||
      functions.config().email?.password

    if (!adminEmail || !emailFrom || !emailPass) {
      console.error('Email credentials missing (EMAIL_FROM / EMAIL_PASSWORD)')
      return null
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailFrom,
        pass: emailPass,
      },
    })

    const userTypeLabel = {
      recruiter: '⚔️ RECRUITER',
      firsttime: '◈ FIRST TIME VISITOR',
      revisitor: '↩ REVISITOR',
    }[data.userType as string] ?? '? UNKNOWN'

    const emailContent = `
NEW ENQUIRY FROM THE UNDERWORLD
================================

TYPE: ${userTypeLabel}
FROM: ${data.name}
COMPANY: ${data.company || 'Not provided'}
EMAIL: ${data.email}
TIME: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

MESSAGE:
--------
${data.message}

================================
Session ID: ${data.sessionId}
    `.trim()

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Georgia, serif; background: #0a0010; color: #d4af37; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; border: 1px solid rgba(212,175,55,0.3); padding: 24px; }
  .header { font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #d4af37; }
  .badge { display: inline-block; padding: 4px 12px; border: 1px solid rgba(212,175,55,0.4); font-size: 12px; margin-bottom: 16px; }
  .label { font-size: 11px; color: rgba(212,175,55,0.5); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 12px; }
  .value { font-size: 14px; color: #e8e0f8; margin-top: 4px; }
  .message-box { border: 1px solid rgba(212,175,55,0.2); padding: 16px; margin-top: 16px; font-size: 13px; color: #e8e0f8; line-height: 1.7; }
  .footer { font-size: 10px; color: rgba(212,175,55,0.3); margin-top: 20px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">⚡ New Scroll Received — The Underworld</div>
  <div class="badge">${userTypeLabel}</div>
  <div class="label">Name</div>
  <div class="value">${data.name}</div>
  <div class="label">Company</div>
  <div class="value">${data.company || '—'}</div>
  <div class="label">Email</div>
  <div class="value"><a href="mailto:${data.email}" style="color:#7c3aed;">${data.email}</a></div>
  <div class="label">Message</div>
  <div class="message-box">${data.message ? data.message.replace(/\n/g, '<br>') : ''}</div>
  <div class="footer">portf · OVERLORD_SK · ${new Date().toISOString()}</div>
</div>
</body>
</html>
    `

    try {
      await transporter.sendMail({
        from: `"The Underworld Portal" <${emailFrom}>`,
        to: adminEmail,
        subject: `⚡ New Scroll: ${data.name} ${data.company ? `(${data.company})` : ''} — ${userTypeLabel}`,
        text: emailContent,
        html: htmlContent,
      })
      console.log('Email notification sent for enquiry:', context.params.enquiryId)
    } catch (error) {
      console.error('Failed to send email:', error)
    }

    return null
  })
