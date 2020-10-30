const nodemailer= require('nodemailer');

const sendEmail= async options => {
  // 1) Create a transporter
  const transporter= nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // Activate in gmail "less secure app" option
  });

  // 2) Define the email options
  const mailOptions= {
    from: 'Juan Ro <juanro@juanro.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  }
  console.log(typeof "0d817f2cd42d3d");
  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports= sendEmail;