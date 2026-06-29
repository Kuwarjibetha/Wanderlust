# Wanderlust - Project Documentation

Wanderlust is a full-stack hotel and vacation rental booking application. It uses Node.js, Express, MongoDB, Mongoose, EJS, Passport.js, Cloudinary, Nodemailer, and AI-assisted travel features.

The application has two main user roles:

- Guests browse listings, book stays, manage bookings, save wishlist items, write reviews, edit profiles, and use AI travel tools.
- Hosts create and manage listings, upload images, view bookings received on their properties, edit profiles, and track dashboard statistics.

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [User Roles](#user-roles)
- [User Workflows](#user-workflows)
- [Routes Documentation](#routes-documentation)
- [Data Models](#data-models)
- [AI Features](#ai-features)
- [Email Features](#email-features)
- [Project Structure](#project-structure)
- [Implementation Notes](#implementation-notes)
- [Deployment](#deployment)
- [Testing Notes](#testing-notes)
- [Known Notes](#known-notes)
- [Future Improvements](#future-improvements)

## Project Overview

Wanderlust is inspired by property rental platforms. Hosts publish properties with images, descriptions, prices, locations, nearby-place details, and maximum guest capacity. Guests can search listings, open listing details, book stays, cancel bookings, review properties, and save favorites to a wishlist.

The root route is role-based:

- Guests are sent to the welcome page.
- Hosts are sent to the dashboard with total listings, bookings, revenue, guests, recent bookings, and owned listings.

## Core Features

- Signup, login, logout, sessions, and flash messages
- Guest, host, and admin role support
- Host-only listing creation and management
- Owner-only listing edit and delete protection
- Listing CRUD with Cloudinary image uploads
- Listing search by title or location
- Filters for country, minimum price, and maximum price
- Booking form with date validation and maximum guest validation
- Booking confirmation page and guest booking history
- Booking cancellation with guest and host notifications
- Review creation and deletion
- Wishlist toggle and wishlist page
- Profile page with role-specific data
- Profile editing with bio and avatar upload
- Host dashboard analytics
- AI description generation
- AI review summary
- AI trip planner
- AI listing chatbot

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Backend framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Views | EJS, ejs-mate |
| Authentication | Passport.js, passport-local, passport-local-mongoose |
| Sessions | express-session |
| Forms | method-override, express.urlencoded |
| File upload | Multer |
| Image hosting | Cloudinary, multer-storage-cloudinary |
| Email | Nodemailer with Gmail |
| AI | Ollama `llama3.2` for active routes; Gemini code is retained but commented |
| Utilities | dotenv, connect-flash |
| Deployment config | Vercel |

## Architecture

The project follows a classic Express MVC-style structure:

- `app.js` defines app setup, database connection, middleware, authentication, routes, AI endpoints, and server startup.
- `models/` contains Mongoose schemas for users, listings, bookings, and reviews.
- `views/` contains EJS templates grouped by feature.
- `config/` contains Cloudinary and mailer configuration.
- `middleware.js` contains authentication and authorization helpers.
- `public/` contains static CSS and browser JavaScript.
- `docs/` contains project documentation.

### Request Flow

1. A browser sends a request to an Express route.
2. Global middleware handles parsing, sessions, authentication, flash messages, static files, and method override.
3. Route handlers validate access, read or write MongoDB through Mongoose models, and optionally call Cloudinary, Nodemailer, or Ollama.
4. EJS views render the response.
5. Flash messages and `currUser` are available globally through `res.locals`.

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

   GEMINI_API_KEY=<your-gemini-api-key-if-you-enable-gemini-routes>
   ```

4. Install and prepare Ollama if you want the current AI routes to work.

   ```bash
   ollama pull llama3.2
   ```

5. Start the development server.

   ```bash
   npm run dev
   ```

6. Open the app.

   ```text
   http://localhost:8080
   ```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URL` | Yes | MongoDB connection string |
| `SECRET` | Yes | Express session secret |
| `CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUD_API_KEY` | Yes | Cloudinary API key |
| `CLOUD_API_SECRET` | Yes | Cloudinary API secret |
| `GMAIL_USER` | Required for email | Gmail account used by Nodemailer |
| `GMAIL_PASS` | Required for email | Gmail app password |
| `GEMINI_API_KEY` | Optional currently | Needed only if the commented Gemini AI routes are re-enabled |

### Local AI Requirement

The active AI implementation uses the `ollama` package and the `llama3.2` model. Ollama must be installed, the model must be available, and the Ollama service must be running on the machine that runs the app.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Starts the app with Node |
| `npm run dev` | Starts the app with Nodemon |

## User Roles

### Guest

Guests can:

- View the welcome page after login
- Browse and filter listings
- View listing details
- Book properties
- View and cancel their bookings
- Write and delete reviews
- Save and remove wishlist listings
- Edit their profile bio and avatar
- Use review summaries, trip planner, and listing chatbot

### Host

Hosts can:

- View the host dashboard after login
- Create listings
- Upload listing images
- Edit and delete owned listings
- View bookings received on their listings
- Edit profile bio and avatar
- Generate listing descriptions with AI

### Admin

The `admin` role exists in the schema, but public signup prevents users from choosing `admin`; submitted admin roles are converted to `guest`.

## User Workflows

### Guest Flow

1. Sign up or log in as a guest.
2. Land on the welcome page.
3. Browse `/listings` or search/filter listings.
4. Open a listing details page.
5. Add the listing to the wishlist if desired.
6. Use AI tools to summarize reviews, plan a trip, or ask listing questions.
7. Book the listing by entering contact details, dates, guest count, and travel type.
8. View the confirmation page and receive an email if an email address is provided.
9. View or cancel bookings from `My Bookings` or the profile page.

### Host Flow

1. Sign up or log in as a host.
2. Land on the host dashboard.
3. Create a listing with title, description, image, price, location, country, nearby place, and maximum guests.
4. Optionally generate the listing description with AI.
5. Edit or delete owned listings.
6. View received bookings and activity from the dashboard or profile page.

## Routes Documentation

### Home

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Logged in | Shows guest welcome page or host dashboard based on role |

### Authentication

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/signup` | Public | Render signup form |
| POST | `/signup` | Public | Register user, normalize unsafe admin role, and log in |
| GET | `/login` | Public | Render login form |
| POST | `/login` | Public | Authenticate user |
| GET | `/logout` | Logged in | Log out current user |

### Listings

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/listings` | Logged in | Show listings with optional search and filters |
| GET | `/listings/new` | Host | Render new listing form |
| POST | `/listings` | Host | Create listing and upload image |
| GET | `/listings/:id` | Public | Show listing details, reviews, booking action, and AI tools |
| GET | `/listings/:id/edit` | Owner | Render edit listing form |
| PUT | `/listings/:id` | Owner | Update listing and optionally replace Cloudinary image |
| DELETE | `/listings/:id` | Owner | Delete listing |

### Reviews

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/listings/:id/reviews` | Logged in | Add a review to a listing |
| DELETE | `/listings/:id/reviews/:reviewId` | Logged in | Remove review from listing and delete review document |

### Bookings

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/listings/:id/book` | Logged in | Render booking form |
| POST | `/listings/:id/book` | Logged in | Create booking, calculate total price, and send emails |
| GET | `/bookings/:id/confirmation` | Logged in | Show booking confirmation |
| GET | `/my-bookings` | Logged in | Show current user's valid bookings |
| DELETE | `/bookings/:id` | Logged in | Cancel booking, delete booking, and send cancellation emails |

### Profile and Wishlist

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/profile` | Logged in | Show profile with guest bookings or host listings/received bookings |
| GET | `/profile/edit` | Logged in | Render profile edit form |
| PUT | `/profile` | Logged in | Update bio and optionally replace avatar |
| POST | `/wishlist/:id` | Logged in | Toggle listing in current user's wishlist |
| GET | `/wishlist` | Logged in | Show saved listings |

### AI

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/ai/generate-description` | Logged in | Generate a short property description |
| GET | `/listings/:id/summarize-reviews` | Logged in | Summarize listing reviews |
| POST | `/listings/:id/trip-planner` | Logged in | Generate a day-by-day itinerary |
| POST | `/listings/:id/chat` | Logged in | Answer listing-specific questions |

## Data Models

### User

| Field | Type | Notes |
| --- | --- | --- |
| `username` | String | Provided by `passport-local-mongoose` |
| `email` | String | Required and unique |
| `role` | String | `guest`, `host`, or `admin`; defaults to `guest` |
| `bio` | String | Optional profile text |
| `avatar.url` | String | Avatar image URL |
| `avatar.filename` | String | Cloudinary filename or `default` |
| `createdAt` | Date | Account creation timestamp |
| `wishlist` | ObjectId[] | References `Listing` |

### Listing

| Field | Type | Notes |
| --- | --- | --- |
| `title` | String | Required |
| `description` | String | Listing description |
| `image.url` | String | Cloudinary or default image URL |
| `image.filename` | String | Cloudinary filename or `default` |
| `price` | Number | Price per night |
| `location` | String | City or area |
| `country` | String | Country |
| `nearbyPlace.type` | String | Required nearby place category |
| `nearbyPlace.name` | String | Required nearby place name |
| `nearbyPlace.distance` | String | Required distance text |
| `owner` | ObjectId | References `User` |
| `maxPersons` | Number | Maximum allowed guests; defaults to 1 |
| `reviews` | ObjectId[] | References `Review` |

### Booking

| Field | Type | Notes |
| --- | --- | --- |
| `listing` | ObjectId | Required, references `Listing` |
| `guest` | ObjectId | Required, references `User` |
| `guestName` | String | Required |
| `guestPhone` | String | Required |
| `guestEmail` | String | Optional |
| `checkIn` | Date | Required |
| `checkOut` | Date | Required |
| `guests` | Number | Required, minimum 1 |
| `travelType` | String | `solo`, `couple`, `family`, or `bachelors` |
| `totalPrice` | Number | Calculated from nights multiplied by listing price |
| `status` | String | `pending`, `confirmed`, or `cancelled`; defaults to `confirmed` |
| `bookedAt` | Date | Booking creation timestamp |

### Review

| Field | Type | Notes |
| --- | --- | --- |
| `comment` | String | Required |
| `rating` | Number | Required, 1 to 5 |
| `author` | ObjectId | Required, references `User` |
| `createdAt` | Date | Review creation timestamp |

## AI Features

The active AI routes use Ollama through the `ollama` npm package with the `llama3.2` model.

Gemini setup code and commented route implementations are still present in `app.js`. If Gemini is re-enabled, `GEMINI_API_KEY` must be configured and the route handlers should be switched back to the Gemini implementation.

### Listing Description Generator

Used from the new listing experience. It creates a short, professional vacation rental description from title, location, country, and price.

### Review Summarizer

Used on listing detail pages when reviews exist. It summarizes rating comments into a short guest-friendly overview.

### Trip Planner

Used on listing detail pages. It creates a day-by-day itinerary using the listing's location and requested trip length.

### Listing Chatbot

Used on listing detail pages. It answers short questions using listing title, location, price, maximum guests, description, and review context.

## Email Features

The app uses Nodemailer with Gmail in `config/mailer.js`.

- Guest booking confirmation email
- Host new-booking notification email
- Guest booking-cancellation email
- Host booking-cancellation email

Email delivery requires `GMAIL_USER` and `GMAIL_PASS`. Booking and cancellation flows continue even if email delivery fails; errors are logged to the server console.

## Project Structure

```text
MAJORPROJECT/
├── app.js
├── middleware.js
├── package.json
├── package-lock.json
├── README.md
├── vercel.json
├── config/
│   ├── cloudinary.js
│   └── mailer.js
├── controllers/
│   └── auth.js
├── docs/
│   └── PROJECT_DOCUMENTATION.md
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
    │   ├── login.ejs
    │   └── signup.ejs
    ├── bookings/
    │   ├── confirmation.ejs
    │   ├── index.ejs
    │   └── new.ejs
    ├── dashboard/
    │   └── index.ejs
    ├── includes/
    │   ├── footer.ejs
    │   └── navbar.ejs
    ├── layouts/
    │   └── boilerplate.ejs
    ├── listings/
    │   ├── edit.ejs
    │   ├── index.ejs
    │   ├── new.ejs
    │   └── show.ejs
    ├── profile/
    │   ├── edit.ejs
    │   └── show.ejs
    ├── welcome/
    │   └── index.ejs
    └── wishlist/
        └── index.ejs
```

## Implementation Notes

- `dotenv` is loaded at the top of `app.js`.
- `express.urlencoded()` handles normal form submissions.
- `express.json()` handles JSON requests for AI endpoints.
- `method-override` enables PUT and DELETE requests from forms.
- `express-session` stores login sessions.
- `connect-flash` displays one-time success and error messages.
- `passport-local-mongoose` provides password hashing and authentication helpers.
- `multer-storage-cloudinary` uploads listing and avatar images to the `wanderlust` Cloudinary folder.
- `res.locals.currUser`, `res.locals.success`, and `res.locals.error` are available in all EJS views.
- Logged-in user wishlist data is refreshed globally so listing cards can show saved state.
- Deleted listings are filtered out of guest booking views to avoid rendering broken booking references.

## Deployment

The project includes `vercel.json` for Vercel:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ]
}
```

Before deployment, configure the required environment variables in the hosting dashboard:

- `MONGO_URL`
- `SECRET`
- `CLOUD_NAME`
- `CLOUD_API_KEY`
- `CLOUD_API_SECRET`
- `GMAIL_USER`
- `GMAIL_PASS`
- `GEMINI_API_KEY` only if Gemini routes are enabled

The currently active Ollama-based AI routes need access to an Ollama runtime. On serverless hosting, this usually requires changing the AI implementation to a hosted model provider or running Ollama on a reachable service.

## Testing Notes

There is no automated test suite yet. Manual testing should cover:

- Register as guest and host.
- Log in and log out.
- Confirm guest users land on the welcome page.
- Confirm host users land on the dashboard.
- Create, edit, and delete a listing as a host.
- Upload listing and profile images.
- Search and filter listings.
- Book a listing as a guest.
- Confirm invalid booking dates are rejected.
- Confirm bookings over `maxPersons` are rejected.
- View booking confirmation.
- Cancel a booking.
- Add and delete reviews.
- Add and remove wishlist items.
- Edit profile bio and avatar.
- Test AI description generation, review summary, trip planner, and chatbot.
- Verify guest and host booking emails.
- Verify guest and host cancellation emails.

The `testai.js` and `testmail.js` files can be used for focused local checks of AI and email connectivity.

## Known Notes

- `app.js` currently starts two listeners on port `8080`; this should be cleaned up before production deployment.
- The review delete route requires login but does not currently verify that the logged-in user is the review author.
- Payment processing is not implemented.
- Admin-specific screens are not implemented.
- Booking date availability checks are not implemented.
- Email delivery depends on Gmail app-password configuration.
- Active AI features depend on local Ollama availability.
- The Gemini dependency and initialization remain in the code even though active AI routes use Ollama.

## Future Improvements

- Add payment integration.
- Add booking availability checks for overlapping dates.
- Add stronger server-side validation.
- Add automated tests.
- Add admin dashboard and moderation tools.
- Add maps and geolocation.
- Add listing and booking pagination.
- Delete related reviews/bookings and Cloudinary assets when listings are deleted.
- Verify review ownership before deletion.
- Move route handlers into separate route/controller files.
- Consolidate AI provider selection behind a service module.
- Replace local-only AI dependency for production deployments.

## Author

Developed by `kuwarji`.
