# Wanderlust - Hotel Booking App

Wanderlust is a full-stack hotel and vacation rental booking application built with Node.js, Express, MongoDB, and EJS. Users can browse stays, create accounts, manage listings as hosts, book properties as guests, write reviews, save wishlist items, and receive booking and cancellation email notifications.

## Features

- User signup, login, logout, sessions, and flash messages
- Guest and host roles
- Guest welcome page with hero search, quick country links, and call-to-action sections
- Gemini AI-powered listing description generation for hosts
- Gemini AI review summaries, trip planner, and listing chatbot for guests
- Host-only listing creation and management
- Listing image uploads with Cloudinary
- Listing capacity limits and nearby-place details
- Search and filtering by title, location, country, and price range
- Listing detail pages with reviews
- Booking flow with check-in, check-out, guest count, travel type, and total price calculation
- Guest-count validation against each listing's maximum capacity
- Guest booking confirmation page and "My Bookings" page
- Booking cancellation with email notifications
- Host dashboard with listing, booking, revenue, guest, and recent booking stats
- Host profile page with received bookings
- User profile editing with avatar upload and bio
- Wishlist add/remove support
- Booking and cancellation email notifications for guests and hosts using Nodemailer

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: Passport.js, passport-local, passport-local-mongoose
- Views: EJS, ejs-mate
- Uploads: Multer, Cloudinary, multer-storage-cloudinary
- Email: Nodemailer with Gmail
- AI: Google Gemini through `@google/generative-ai`
- Utilities: dotenv, connect-flash, express-session, method-override

## Prerequisites

- Node.js
- npm
- MongoDB Atlas or a local MongoDB instance
- Cloudinary account
- Gmail app password for email notifications
- Gemini API key for AI features

## Installation

1. Clone the repository.

   ```bash
   git clone <your-repository-url>
   cd MAJORPROJECT
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root.

   ```env
   MONGO_URL=<your-mongodb-connection-string>
   SECRET=<your-session-secret>

   CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUD_API_KEY=<your-cloudinary-api-key>
   CLOUD_API_SECRET=<your-cloudinary-api-secret>

   GMAIL_USER=<your-gmail-address>
   GMAIL_PASS=<your-gmail-app-password>

   GEMINI_API_KEY=<your-gemini-api-key>
   ```

4. Start the app.

   ```bash
   npm run dev
   ```

   For production-style startup:

   ```bash
   npm start
   ```

5. Open the app in your browser.

   ```text
   http://localhost:8080
   ```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Runs the app with Node |
| `npm run dev` | Runs the app with Nodemon |

## Main Routes

### Home

| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | Shows the guest welcome page for guests and the host dashboard for hosts |

### Authentication

| Method | Route | Description |
| --- | --- | --- |
| GET | `/signup` | Show signup form |
| POST | `/signup` | Register a new user |
| GET | `/login` | Show login form |
| POST | `/login` | Log in a user |
| GET | `/logout` | Log out current user |

### Listings

| Method | Route | Description |
| --- | --- | --- |
| GET | `/listings` | Show listings with optional filters |
| GET | `/listings/new` | Show new listing form for hosts |
| POST | `/listings` | Create a listing |
| GET | `/listings/:id` | Show listing details |
| GET | `/listings/:id/edit` | Show edit listing form |
| PUT | `/listings/:id` | Update a listing |
| DELETE | `/listings/:id` | Delete a listing |

### Reviews

| Method | Route | Description |
| --- | --- | --- |
| POST | `/listings/:id/reviews` | Add a review to a listing |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete a review |

### Bookings

| Method | Route | Description |
| --- | --- | --- |
| GET | `/listings/:id/book` | Show booking form |
| POST | `/listings/:id/book` | Create a booking with guest details and travel type |
| GET | `/bookings/:id/confirmation` | Show booking confirmation |
| GET | `/my-bookings` | Show current user's bookings |
| DELETE | `/bookings/:id` | Cancel a booking and send cancellation emails |

### AI

| Method | Route | Description |
| --- | --- | --- |
| POST | `/ai/generate-description` | Generate a listing description with Gemini |
| GET | `/listings/:id/summarize-reviews` | Summarize reviews for a listing |
| POST | `/listings/:id/trip-planner` | Generate a day-by-day trip itinerary |
| POST | `/listings/:id/chat` | Chat with an AI assistant about a listing |

### Dashboard

| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | Hosts see dashboard stats after login |

### Profile and Wishlist

| Method | Route | Description |
| --- | --- | --- |
| GET | `/profile` | Show user profile |
| GET | `/profile/edit` | Show profile edit form |
| PUT | `/profile` | Update profile |
| POST | `/wishlist/:id` | Toggle listing in wishlist |
| GET | `/wishlist` | Show saved wishlist listings |

## Project Structure

```text
MAJORPROJECT/
├── app.js
├── middleware.js
├── package.json
├── vercel.json
├── config/
│   ├── cloudinary.js
│   └── mailer.js
├── controllers/
│   └── auth.js
├── init/
│   ├── data.js
│   └── index.js
├── models/
│   ├── booking.js
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── public/
│   └── css/
│       ├── js/
│       │   └── ai.js
│       └── style.css
└── views/
    ├── auth/
    ├── bookings/
    ├── dashboard/
    ├── includes/
    ├── layouts/
    ├── listings/
    ├── profile/
    ├── welcome/
    └── wishlist/
```

## Data Models

- User: email, role, bio, avatar, wishlist, authentication fields
- Listing: title, description, image, price, location, country, nearby place, maximum persons, owner, reviews
- Review: comment, rating, author, created date
- Booking: listing, guest, guest contact details, dates, guest count, travel type, total price, status

## Roles

- Guest: can browse listings, book stays, review listings, manage profile, and save wishlist items.
- Host: can access the dashboard, create listings, edit/delete owned listings, manage profile, and view bookings received for their properties.
- Admin: supported in the user role enum, but signup prevents creating admin accounts directly from the public form.

## Deployment

The project includes a `vercel.json` file that routes all requests to `app.js` for Vercel deployment.

Before deploying, add the required environment variables in your hosting provider:

- `MONGO_URL`
- `SECRET`
- `CLOUD_NAME`
- `CLOUD_API_KEY`
- `CLOUD_API_SECRET`
- `GMAIL_USER`
- `GMAIL_PASS`
- `GEMINI_API_KEY`

## Notes

- Uploaded listing images and profile avatars are stored in Cloudinary.
- Booking emails are sent only when valid email credentials are configured.
- AI features require `GEMINI_API_KEY` and use the `gemini-2.5-flash` model.
- The app uses `_method` query/body overrides for PUT and DELETE requests from forms.
