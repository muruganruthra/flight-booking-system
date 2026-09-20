import nodemailer from "nodemailer";

/*
|--------------------------------------------------------------------------
| Email Transporter
|--------------------------------------------------------------------------
*/

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/*
|--------------------------------------------------------------------------
| Verify Email Configuration
|--------------------------------------------------------------------------
*/

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log("Email service connected successfully");
  } catch (error) {
    console.error(
      "Email service connection failed:",
      error.message
    );
  }
};

/*
|--------------------------------------------------------------------------
| Send Ticket Email
|--------------------------------------------------------------------------
*/

export const sendTicketEmail = async ({
  to,
  passengerName,
  pnr,
  flightNumber,
  departureAirport,
  arrivalAirport,
  departureTime,
  ticketPath,
}) => {
  try {
    const mailOptions = {
      from: `"Flight Booking System" <${process.env.EMAIL_USER}>`,

      to,

      subject: `Flight Ticket Confirmation - PNR ${pnr}`,

      text: `
Hello ${passengerName},

Your flight booking has been confirmed successfully.

PNR: ${pnr}
Flight: ${flightNumber}
From: ${departureAirport}
To: ${arrivalAirport}
Departure: ${departureTime}

Please find your e-ticket attached to this email.

Thank you for booking with Flight Booking System.

This is an automated email. Please do not reply.
      `,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">

          <h2 style="text-align: center;">
            Flight Booking System
          </h2>

          <h3>
            E-Ticket Confirmation
          </h3>

          <p>
            Hello <strong>${passengerName}</strong>,
          </p>

          <p>
            Your flight booking has been confirmed successfully.
          </p>

          <table
            style="
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            "
          >
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <strong>PNR</strong>
              </td>

              <td style="padding: 8px; border: 1px solid #ddd;">
                ${pnr}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <strong>Flight</strong>
              </td>

              <td style="padding: 8px; border: 1px solid #ddd;">
                ${flightNumber}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <strong>From</strong>
              </td>

              <td style="padding: 8px; border: 1px solid #ddd;">
                ${departureAirport}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <strong>To</strong>
              </td>

              <td style="padding: 8px; border: 1px solid #ddd;">
                ${arrivalAirport}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <strong>Departure</strong>
              </td>

              <td style="padding: 8px; border: 1px solid #ddd;">
                ${departureTime}
              </td>
            </tr>
          </table>

          <p style="margin-top: 20px;">
            Your e-ticket is attached to this email.
          </p>

          <p>
            Please carry a valid government-issued ID while travelling.
          </p>

          <hr />

          <p style="font-size: 12px; color: #666;">
            This is an automated email from Flight Booking System.
          </p>

        </div>
      `,

      attachments: [
        {
          filename: `Flight-Ticket-${pnr}.pdf`,
          path: ticketPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
      "Ticket email sent:",
      info.messageId
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(
      "SEND TICKET EMAIL ERROR:",
      error
    );

    throw new Error(
      "Failed to send ticket email"
    );
  }
};