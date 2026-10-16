const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport 
//what are SMTP transport? SMTP (Simple Mail Transfer Protocol)
//  is a protocol used for sending email messages between servers.
//  It defines how email messages are sent, received, and relayed
//  across the internet. SMTP transport refers to the mechanism or
//  method used to send email messages using the SMTP protocol. In
//  this case, nodemailer is using SMTP transport to send emails.

const transporter = nodemailer.createTransport({
    //what does each argument mean?
    service: 'gmail', // Specifies the email service provider (Gmail in this case)
    //gmai is default email service provider used in nodemailer.
    //  It is a popular email service provided by Google that allows
    //  users to send and receive emails. By specifying 'gmail' as the
    //  service, nodemailer will use the Gmail SMTP server to send emails.
    auth: {
        //oauth2 is an authentication mechanism that allows secure access
        //  to resources of a user without sharing their credentials. It is commonly used for
        //  authorizing third-party applications to access user data on behalf of the user.
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        //client id is used to identify the application making the
        //  request to the OAuth2 server. It is a unique identifier assigned
        //  to the application during the registration process. The client ID
        //  is used to authenticate the application and authorize it to
        //  access specific resources on behalf of the user.
        //client secret is a confidential string that is used to authenticate
        //  the application with the OAuth2 server. It is generated during
        //  the registration process and should be kept secure. The client
        //  secret is used in conjunction with the client ID to verify the
        //  identity of the application and ensure that only authorized
        //  applications can access user data.
        //refresh token is a long-lived token that is used to obtain a new
        //  access token when the current access token expires. It is
        //  typically issued alongside the access token and can be used to
        //  request a new access token without requiring the user to
        //  re-authenticate. The refresh token allows the application to 
        //  maintain access to user resources without requiring the user to
        //  repeatedly log in.
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN_SECRET,
    },
});
transporter.verify((error, success) => {
    if (error) {
        console.log('Error connecting to email server:', error);
    } else {
        console.log('Connected to email server');
    }
});

//this function sends an email using the nodemailer transporter
//  object. It takes the recipient's email address, subject, and
//  HTML content as parameters. It creates a mailOptions object
//  with the necessary details and uses the transporter.sendMail()
//  method to send the email. If there is an error, it logs the
//  error message; otherwise, it logs a success message.
const sendEmail = async (to, subject, text, html) => {
    try{
        const info = await transporter.sendMail({
            from: "Backend-ledger <" + process.env.EMAIL_USER + ">",
            to,
            subject,
            text,
            html
        });
        console.log('Email sent:', info.response);
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
   


async function sendRegistrationEmail(userEmail, username) {
    const subject = 'Welcome to Our Application!';
    const html = `
      <h1>Welcome, ${username}!</h1>
      <p>Thank you for registering with our application. We're excited to have you on board!</p>
      <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
      <p>Best regards,<br>Your Application Team</p>
    `;
  
    await sendEmail(userEmail, subject, null, html);
  }
async function sendTransactionEmail(userEmail, username, amount, transactionId) {
    const subject = 'Transaction Completed Successfully';
    const html = `
      <h1>Hi, ${username}!</h1>
      <p>Your transaction of <strong>${amount}</strong> has been completed successfully.</p>
      <p>Transaction ID: <strong>${transactionId}</strong></p>
      <p>If you did not authorize this transaction, please contact our support team immediately.</p>
      <p>Best regards,<br>Your Application Team</p>
    `;

    await sendEmail(userEmail, subject, null, html);
}

async function sendTransactionFailureEmail(userEmail, username, amount, transactionId, reason) {
    const subject = 'Transaction Failed';
    const html = `
      <h1>Hi, ${username}!</h1>
      <p>Your transaction of <strong>${amount}</strong> could not be completed.</p>
      <p>Transaction ID: <strong>${transactionId}</strong></p>
      ${reason ? `<p>Reason: <strong>${reason}</strong></p>` : ''}
      <p>Any amount deducted for this transaction will be reversed. If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>Your Application Team</p>
    `;

    await sendEmail(userEmail, subject, null, html);
}

async function sendAccountCreationEmail(userEmail, username, accountId, currency) {
    const subject = 'New Account Created';
    const html = `
      <h1>Hi, ${username}!</h1>
      <p>A new <strong>${currency}</strong> account has been created for you.</p>
      <p>Account ID: <strong>${accountId}</strong></p>
      <p>If you did not request this account, please contact our support team immediately.</p>
      <p>Best regards,<br>Your Application Team</p>
    `;

    await sendEmail(userEmail, subject, null, html);
}

  module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail,
    sendAccountCreationEmail
  }