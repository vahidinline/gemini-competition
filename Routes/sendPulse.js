// Create a file named emailSender.js

const sendpulse = require('sendpulse-api');

sendpulse.init(
  process.env.SENDPULSE_ID,
  process.env.SENDPULSE_SECRET,
  '/tmp/',
  () => {}
);

async function sendEmail(to, subject, text) {
  const emailParams = {
    html: text,
    text: text,
    subject: subject,
    from: { name: 'Your Name', email: 'your@email.com' },
    to: [{ name: 'Recipient Name', email: to }],
  };

  try {
    const response = await sendpulse.smtpSendMail(emailParams);
    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  sendEmail,
};
