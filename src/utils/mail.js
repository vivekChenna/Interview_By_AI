import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: import.meta.env.VITE_API_KEY_SMTP_HOST,
  port: import.meta.env.VITE_API_KEY_SMTP_PORT,
  secure: false, 
  auth: {
    user: import.meta.env.VITE_API_KEY_SMTP_EMAIL,
    pass: import.meta.env.VITE_API_KEY_SMTP_PASS,
  },
});

const setMailOptions = (name, email, score) => {

  return {
    from: process.env.NEXT_API_KEY_SMTP_EMAIL,
    to: email,
    subject: "Thank You for Completing Your Interview",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Completion - Your Score</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/andai-admin-portal.appspot.com/o/images%2FnewAndai.jpg?alt=media&token=b92aa612-bf3a-4da5-a626-794649957d6c" 
              alt="Andai Logo" 
              style="width: 180px; height: auto;" 
            />
          </div>
          
          <div style="color: #333333; line-height: 1.6;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong style="color: #2c3e50;">${name}</strong>,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for taking the time to complete your interview with us. We appreciate your effort and interest in the position.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We have evaluated your responses, and here is your interview score:
            </p>
            
            <div style="text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; color: #007bff;">
              Your Score: ${score} / 10
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Our team will review your performance, and we will get back to you with the next steps soon.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              If you have any questions, feel free to reach out.
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 16px;">Best regards,</p>
              <p style="font-size: 16px;">Vidhi Chakraborty</p>
              <p style="font-size: 16px;">Customer Support Manager</p>
              <p style="font-size: 16px; font-weight: 500; color: #2c3e50;">AndAI Platforms Pvt Ltd</p>
            </div>
          </div>
        </div>
      </body>
      </html>
  
  
          `,
  };
};

export const sendMail = async (userDetails, score) => {
    try {
      const { name, email } = userDetails;
      const mailOptions = setMailOptions(name, email, score);
  
      const sendMailPromise = new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
  
      await sendMailPromise;
    //   console.log(`Email sent successfully to ${email}`);
    } catch (error) {
      console.error(`Error sending email to ${userDetails.email}:`, error);
    }
  };
  
