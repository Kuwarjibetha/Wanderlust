# Wanderlust - Hotel Booking App

Wanderlust is a full-stack hotel and vacation rental booking application built with Node.js, Express, MongoDB, EJS, Passport.js, Cloudinary, Nodemailer, and AI travel helpers.

Guests can browse stays, save wishlist items, book properties, manage bookings, write reviews, edit their profile, and use AI tools for review summaries, trip planning, and listing questions. Hosts can create listings, upload property images, generate descriptions, manage their listings, view received bookings, and track dashboard activity.

## Features

- Guest and host signup/login with Passport.js sessions
- Role-based guest and host flows
- Host dashboard with listings, bookings, revenue, guest totals, and recent bookings
- Listing CRUD with Cloudinary image uploads
- Search and filters by title, location, country, and price range
- Booking flow with check-in/check-out validation and guest-capacity checks
- Booking confirmation page, booking history, and cancellation flow
- Guest and host booking/cancellation emails through Nodemailer
- Reviews with ratings and author display
- Wishlist add/remove support
- Profile pages with bio and avatar upload
- AI listing description generation, review summaries, trip planner, and listing chatbot

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Backend | Express.js |
| Database | MongoDB, Mongoose |
| Views | EJS, ejs-mate |
| Authentication | Passport.js, passport-local-mongoose |
| Uploads | Multer, Cloudinary |
| Email | Nodemailer with Gmail |
| AI | Ollama `llama3.2` currently active; Gemini code is present but commented |
| Deployment | Vercel configuration included |

## Getting Started

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root.

   ```env
   MONGO_URL=<your-mongodb-connection-string>
   SECRET=<your-session-secret>

   CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUD_API_KEY=<your-cloudinary-api-key>
   CLOUD_API_SECRET=<your-cloudinary-api-secret>

   GMAIL_USER=<your-gmail-address>
   GMAIL_PASS=<your-gmail-app-password>

   GEMINI_API_KEY=<your-gemini-api-key-if-you-enable-gemini-routes>
   ```

3. If you want to use the active AI routes, install Ollama locally and pull the model used by the app.

   ```bash
   ollama pull llama3.2
   ```

4. Start the development server.

   ```bash
   npm run dev
   ```

5. Open the app.

   ```text
   http://localhost:8080
   ```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Runs `app.js` with Node |
| `npm run dev` | Runs `app.js` with Nodemon |

## Project Structure

```text
MAJORPROJECT/
├── app.js
├── middleware.js
├── config/
│   ├── cloudinary.js
│   └── mailer.js
├── docs/
│   └── PROJECT_DOCUMENTATION.md
├── init/
├── models/
├── public/
└── views/
```

## Documentation

Full documentation is available in [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md).

It includes architecture notes, setup instructions, route documentation, data models, AI and email details, deployment notes, manual testing guidance, known notes, and future improvements.

## Notes

- MongoDB, Cloudinary, and session secrets are required for the main app.
- Gmail credentials are required only for email delivery.
- Ollama must be running locally for the currently active AI features.
- Payment processing and admin screens are not implemented yet.

## Author

Developed by `kuwarji`.
