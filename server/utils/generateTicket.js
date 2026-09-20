import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| Generate E-Ticket PDF
|--------------------------------------------------------------------------
*/

export const generateTicketPDF = async (booking) => {
  return new Promise((resolve, reject) => {
    try {
      /*
       * Create tickets directory
       */
      const ticketsDirectory = path.join(
        __dirname,
        "../tickets"
      );

      if (!fs.existsSync(ticketsDirectory)) {
        fs.mkdirSync(ticketsDirectory, {
          recursive: true,
        });
      }

      /*
       * File name
       */
      const fileName = `ticket-${booking.pnr}.pdf`;

      const filePath = path.join(
        ticketsDirectory,
        fileName
      );

      /*
       * Create PDF
       */
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      /*
       |--------------------------------------------------------------------------
       | Header
       |--------------------------------------------------------------------------
       */

      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("FLIGHT BOOKING", {
          align: "center",
        });

      doc
        .moveDown(0.5)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("E-TICKET", {
          align: "center",
        });

      doc.moveDown();

      /*
       |--------------------------------------------------------------------------
       | PNR
       |--------------------------------------------------------------------------
       */

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(`PNR: ${booking.pnr}`);

      doc.moveDown();

      /*
       |--------------------------------------------------------------------------
       | Booking Information
       |--------------------------------------------------------------------------
       */

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `Booking Status: ${booking.status.toUpperCase()}`
        );

      doc.text(
        `Payment Status: ${booking.paymentStatus.toUpperCase()}`
      );

      doc.text(
        `Booked On: ${new Date(
          booking.bookedAt
        ).toLocaleString("en-IN")}`
      );

      doc.moveDown();

      /*
       |--------------------------------------------------------------------------
       | Flight Information
       |--------------------------------------------------------------------------
       */

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("FLIGHT DETAILS");

      doc.moveDown(0.5);

      const flight = booking.flight;

      if (flight) {
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(
            `Flight Number: ${flight.flightNumber || "N/A"}`
          );

        if (flight.airline) {
          doc.text(
            `Airline: ${
              flight.airline.name || "N/A"
            } (${flight.airline.code || ""})`
          );
        }

        if (flight.departureAirport) {
          doc.text(
            `From: ${
              flight.departureAirport.name || "N/A"
            } (${flight.departureAirport.code || ""})`
          );
        }

        if (flight.arrivalAirport) {
          doc.text(
            `To: ${
              flight.arrivalAirport.name || "N/A"
            } (${flight.arrivalAirport.code || ""})`
          );
        }

        if (flight.departureTime) {
          doc.text(
            `Departure: ${new Date(
              flight.departureTime
            ).toLocaleString("en-IN")}`
          );
        }

        if (flight.arrivalTime) {
          doc.text(
            `Arrival: ${new Date(
              flight.arrivalTime
            ).toLocaleString("en-IN")}`
          );
        }

        if (flight.durationMinutes) {
          doc.text(
            `Duration: ${flight.durationMinutes} minutes`
          );
        }
      }

      doc.moveDown();

      /*
       |--------------------------------------------------------------------------
       | Passenger Details
       |--------------------------------------------------------------------------
       */

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("PASSENGER DETAILS");

      doc.moveDown(0.5);

      booking.passengers.forEach((passenger, index) => {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(
            `${index + 1}. ${passenger.title} ${passenger.firstName} ${passenger.lastName}`
          );

        doc
          .font("Helvetica")
          .text(
            `   Gender: ${passenger.gender}`
          );

        doc.text(
          `   Seat: ${passenger.seatNumber}`
        );

        doc.text(
          `   Class: ${passenger.travelClass.toUpperCase()}`
        );

        doc.text(
          `   Baggage: ${passenger.baggage || 0} kg`
        );

        doc.moveDown(0.5);
      });

      /*
       |--------------------------------------------------------------------------
       | Contact Information
       |--------------------------------------------------------------------------
       */

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("CONTACT INFORMATION");

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `Email: ${booking.contactEmail}`
        );

      doc.text(
        `Phone: ${booking.contactPhone}`
      );

      doc.moveDown();

      /*
       |--------------------------------------------------------------------------
       | Fare Details
       |--------------------------------------------------------------------------
       */

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("FARE DETAILS");

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `Base Fare: ₹${booking.baseFare.toFixed(2)}`
        );

      doc.text(
        `Tax: ₹${booking.tax.toFixed(2)}`
      );

      doc.text(
        `Convenience Fee: ₹${booking.convenienceFee.toFixed(
          2
        )}`
      );

      doc
        .font("Helvetica-Bold")
        .text(
          `Total Amount: ₹${booking.totalAmount.toFixed(
            2
          )}`
        );

      doc.moveDown();

      /*
       |--------------------------------------------------------------------------
       | Footer
       |--------------------------------------------------------------------------
       */

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Please carry a valid government-issued ID while travelling.",
          {
            align: "center",
          }
        );

      doc.moveDown(0.5);

      doc.text(
        "This is a computer-generated e-ticket.",
        {
          align: "center",
        }
      );

      /*
       * Finish PDF
       */
      doc.end();

      stream.on("finish", () => {
        resolve({
          fileName,
          filePath,
        });
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};