export const otpTemplate = (otp) => {
  return `
 <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: #ffffff;
                        padding: 10px 0;
                        text-align: center;
                        border-radius: 8px 8px 0 0;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                    }
                    .content h2 {
                        color: #333333;
                        font-size: 22px;
                        margin-bottom: 20px;
                    }
                    .otp-code {
                        display: inline-block;
                        background-color: #4CAF50;
                        color: #ffffff;
                        font-size: 28px;
                        font-weight: bold;
                        padding: 10px 20px;
                        letter-spacing: 5px;
                        margin-bottom: 30px;
                        border-radius: 5px;
                    }
                    .message {
                        font-size: 16px;
                        color: #555555;
                        margin-bottom: 20px;
                    }
                    .footer {
                        text-align: center;
                        color: #888888;
                        font-size: 14px;
                        margin-top: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <h2>Your OTP Code is:</h2>
                        <div class="otp-code">${otp}</div>
                        <p class="message">Please use this code to complete your verification. This code is valid for the next 10 minutes.</p>
                        <p class="message">If you did not request this, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>Thank you for choosing our service!</p>
                        <p>&copy; 2024 Your Company Name</p>
                    </div>
                </div>
            </body>
            </html>
 `;
};
