const nodemailer = require("nodemailer");

// Create transporter 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Send booking confirmation to GUEST 
const sendGuestEmail = async (booking) => {
  const nights = Math.ceil(
    (booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24)
  );

  await transporter.sendMail({
    from: `"Wanderlust 🏠" <${process.env.GMAIL_USER}>`,
    to: booking.guestEmail || booking.guest.email,
    subject: "🎉 Booking Confirmed — Wanderlust",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🏠 Wanderlust</h1>
          <h2>Booking Confirmed!</h2>
        </div>
        <div style="padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
          <p>Hi <b>${booking.guestName}</b>,</p>
          <p>Your booking has been confirmed! Here are your details:</p>

          <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>🏠 Property</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.listing.title}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📍 Location</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.listing.location}, ${booking.listing.country}</td>
            </tr>
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📅 Check-in</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.checkIn.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📅 Check-out</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.checkOut.toDateString()}</td>
            </tr>
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>🌙 Nights</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${nights}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>👥 Guests</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.guests}</td>
            </tr>
            <tr style="background:#ffeaea;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>💰 Total Price</b></td>
              <td style="padding:10px; border:1px solid #dee2e6; color:#e74c3c; font-weight:bold;">₹${booking.totalPrice.toLocaleString("en-in")}</td>
            </tr>
          </table>

          <p style="color: green; font-weight: bold;">✅ Status: CONFIRMED</p>
          <p>Thank you for choosing Wanderlust! Have a wonderful stay.</p>
          <p style="color: #999; font-size: 12px;">— Team Wanderlust 🏠</p>
        </div>
      </div>
    `,
  });
};

// Send booking notification to HOST
const sendHostEmail = async (booking) => {
  const nights = Math.ceil(
    (booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24)
  );

  await transporter.sendMail({
    from: `"Wanderlust 🏠" <${process.env.GMAIL_USER}>`,
    to: booking.listing.owner.email,
    subject: "🏨 New Booking on Your Property — Wanderlust",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🏠 Wanderlust</h1>
          <h2>New Booking Received!</h2>
        </div>
        <div style="padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
          <p>Hi <b>${booking.listing.owner.username}</b>,</p>
          <p>Great news! Someone just booked your property <b>${booking.listing.title}</b>.</p>

          <h3 style="color:#e74c3c;">👤 Guest Details</h3>
          <table style="width:100%; border-collapse: collapse; margin: 10px 0 20px;">
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>Name</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.guestName}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>Phone</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.guestPhone}</td>
            </tr>
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>Email</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.guestEmail || "Not provided"}</td>
            </tr>
          </table>

          <h3 style="color:#e74c3c;">📋 Booking Details</h3>
          <table style="width:100%; border-collapse: collapse; margin: 10px 0 20px;">
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📅 Check-in</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.checkIn.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📅 Check-out</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.checkOut.toDateString()}</td>
            </tr>
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>🌙 Nights</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${nights}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>👥 Guests</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.guests}</td>
            </tr>
            <tr style="background:#ffeaea;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>💰 Total</b></td>
              <td style="padding:10px; border:1px solid #dee2e6; color:#e74c3c; font-weight:bold;">₹${booking.totalPrice.toLocaleString("en-in")}</td>
            </tr>
          </table>

          <p>Login to your profile to see all bookings.</p>
          <p style="color: #999; font-size: 12px;">— Team Wanderlust 🏠</p>
        </div>
      </div>
    `,
  });
};









// ── Send cancellation email to GUEST ─────────────
const sendCancelGuestEmail = async (booking) => {
  await transporter.sendMail({
    from: `"Wanderlust 🏠" <${process.env.GMAIL_USER}>`,
    to: booking.guestEmail || booking.guest.email,
    subject: "❌ Booking Cancelled — Wanderlust",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🏠 Wanderlust</h1>
          <h2>Booking Cancelled</h2>
        </div>
        <div style="padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
          <p>Hi <b>${booking.guestName}</b>,</p>
          <p>Your booking has been <b style="color:red;">cancelled</b>. Here were your booking details:</p>

          <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>🏠 Property</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.listing.title}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📍 Location</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.listing.location}, ${booking.listing.country}</td>
            </tr>
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📅 Check-in</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.checkIn.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📅 Check-out</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.checkOut.toDateString()}</td>
            </tr>
            <tr style="background:#ffeaea;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>💰 Total</b></td>
              <td style="padding:10px; border:1px solid #dee2e6; color:#e74c3c; font-weight:bold;">₹${booking.totalPrice.toLocaleString("en-in")}</td>
            </tr>
          </table>

          <p>We hope to see you again soon on Wanderlust!</p>
          <p style="color: #999; font-size: 12px;">— Team Wanderlust 🏠</p>
        </div>
      </div>
    `,
  });
};

// ── Send cancellation email to HOST 
const sendCancelHostEmail = async (booking) => {
  await transporter.sendMail({
    from: `"Wanderlust 🏠" <${process.env.GMAIL_USER}>`,
    to: booking.listing.owner.email,
    subject: "❌ Booking Cancelled on Your Property — Wanderlust",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🏠 Wanderlust</h1>
          <h2>Booking Cancelled</h2>
        </div>
        <div style="padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
          <p>Hi <b>${booking.listing.owner.username}</b>,</p>
          <p>A booking on your property <b>${booking.listing.title}</b> has been <b style="color:red;">cancelled</b>.</p>

          <h3 style="color:#e74c3c;">👤 Guest Details</h3>
          <table style="width:100%; border-collapse: collapse; margin: 10px 0 20px;">
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>Name</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.guestName}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>Phone</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.guestPhone}</td>
            </tr>
            <tr style="background:#f8f9fa;">
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📅 Check-in</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.checkIn.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #dee2e6;"><b>📅 Check-out</b></td>
              <td style="padding:10px; border:1px solid #dee2e6;">${booking.checkOut.toDateString()}</td>
            </tr>
          </table>

          <p>Your property is now available for these dates.</p>
          <p style="color: #999; font-size: 12px;">— Team Wanderlust 🏠</p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendGuestEmail,
  sendHostEmail,
  sendCancelGuestEmail,
  sendCancelHostEmail,
};