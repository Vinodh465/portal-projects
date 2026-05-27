const nodemailer = require('nodemailer');
require('dotenv').config();

async function main() {
  console.log('Using SMTP Configuration:');
  console.log(`User: ${process.env.SMTP_USER}`);
  console.log(`Host: ${process.env.SMTP_HOST}`);
  console.log(`Port: ${process.env.SMTP_PORT}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    console.log('Sending test email to verify credentials and connection...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Test Email from Employee Portal',
      text: 'This is a test email to verify that SMTP connection and App Passwords are correct.'
    });
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    if (err.message.includes('timeout') || err.code === 'ETIMEDOUT') {
      console.error('\n👉 This timeout confirms that your current network (Office Wi-Fi/VPN) is blocking outbound SMTP connections.');
      console.error('👉 ACTION REQUIRED: Please connect your laptop to a mobile hotspot or home Wi-Fi network and run this script again!');
    }
  }
}

main();
