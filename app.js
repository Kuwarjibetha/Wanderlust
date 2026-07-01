require("dotenv").config();                        //  must be first line!

const express = require("express");
const helmet = require("helmet");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");


const ejsMate = require("ejs-mate");
const session = require("express-session");       // Stores user data temporarily between requests.
const flash = require("connect-flash");           // Used to show temporary messages.
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Listing = require("./models/listing");
const User = require("./models/user");
const Booking = require("./models/booking");
const Review = require("./models/review");
const { isLoggedIn, isOwner, isHost, saveRedirectUrl } = require("./middleware");
const multer = require("multer");
const { cloudinary, storage } = require("./config/cloudinary");
const { sendGuestEmail, sendHostEmail, sendCancelGuestEmail, sendCancelHostEmail } = require("./config/mailer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ollama = require("ollama").default;  // ollama model
const upload = multer({ storage });
const PORT = process.env.PORT || 8080;




// Data base connection 
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log(" connected to db"))
    .catch(err => console.log(err));




app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));



//  Session 
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }
}));

//  Flash 
app.use(flash());



//  Passport 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use(async (req, res, next) => {             //  Global Locals
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;


    if (req.user) {                               // Load wishlist for heart button on listing cards
        const freshUser = await User.findById(req.user._id).select("wishlist");
        res.locals.currUser = { ...req.user.toObject(), wishlist: freshUser.wishlist };
    }

    next();
});





//  auth routes


// Signup tec
app.get("/signup", (req, res) => {
    res.render("auth/signup");
});

app.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        const safeRole = role === "admin" ? "guest" : (role || "guest");
        const user = new User({ username, email, role: safeRole });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to Wanderlust, ${username}! 🏠`);
            res.redirect("/");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});




// login tec
app.get("/login", (req, res) => {
    res.render("auth/login");
});

app.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true, }),
    (req, res) => {
        req.flash("success", `Welcome back, ${req.user.username}! 👋`);
        res.redirect("/");
    }
);





// logout tec
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully. See you soon! 👋");
        res.redirect("/listings");
    });
});






//  listing routes 

// home sec
app.get("/", isLoggedIn, async (req, res) => {


    if (req.user.role === "guest") {            // If guest user present then  show welcome page
        return res.render("welcome/index.ejs");
    }





    // If host user matched then   show dashboard

    const myListings = await Listing.find({ owner: req.user._id }); // Get all my listings


    const myListingIds = myListings.map(l => l._id);               //  Get all bookings on my listings
    const allBookings = await Booking.find({ listing: { $in: myListingIds } })
        .populate("listing")
        .sort({ bookedAt: -1 });


    const totalListings = myListings.length;          //Calculate stats
    const totalBookings = allBookings.length;
    const totalRevenue = allBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalGuests = allBookings.reduce((sum, b) => sum + Number(b.guests), 0);


    const recentBookings = allBookings.slice(0, 5);     //Get recent 5 bookings


    res.render("dashboard/index.ejs", {                  // Send to dashboard view
        totalListings,
        totalBookings,
        totalRevenue,
        totalGuests,
        recentBookings,
        myListings,
    });

});



// index route
app.get("/listings", isLoggedIn, async (req, res) => {
    const { search, country, minPrice, maxPrice } = req.query;
    let filter = {};

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
        ];
    }

    if (country) {
        filter.country = { $regex: country, $options: "i" };
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings,
        search: search || "",
        country: country || "",
        minPrice: minPrice || "",
        maxPrice: maxPrice || "",
    });
});





app.get("/listings/new", isLoggedIn, isHost, (req, res) => {   // New Form is must to  be logged in for  host only
    res.render("listings/new.ejs");
});





app.post("/listings", isLoggedIn, isHost, upload.single("listing[image]"), async (req, res) => {     // Create  must be logged in for host only
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // if image was uploaded
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");
});




// Show routes
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: { path: "author" }  // get reviewer's username
        });
    res.render("listings/show.ejs", { listings });
});




// Edit Form routes
app.get("/listings/:id/edit", isLoggedIn, isOwner, async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});




// Update routs
app.put("/listings/:id", isLoggedIn, isOwner, upload.single("listing[image]"), async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing);

    // If new image was uploaded
    if (req.file) {
        // Delete old image from Cloudinary
        if (listing.image.filename !== "default") {
            await cloudinary.uploader.destroy(listing.image.filename);
        }
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
        await listing.save();
    }

    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
});

// Delete routes
app.delete("/listings/:id", isLoggedIn, isOwner, async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted! 🗑️");
    res.redirect("/listings");
});






//  REVIEW ROUTES

// create Review only guests can review
app.post("/listings/:id/reviews", isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review({
        comment: req.body.comment,
        rating: req.body.rating,
        author: req.user._id,
    });

    listing.reviews.push(review);
    await review.save();
    await listing.save();

    req.flash("success", "Review added! ⭐");
    res.redirect(`/listings/${req.params.id}`);
});

// Delete Review  (only review author can delete this )
app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, async (req, res) => {
    const { id, reviewId } = req.params;


    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });


    await Review.findByIdAndDelete(reviewId);  // Delete the review itself

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
});







//  BOOKING ROUTES

// show booking form rou
app.get("/listings/:id/book", isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    res.render("bookings/new.ejs", { listing });
});


// create booking form sir
app.post("/listings/:id/book", isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate("owner");
    const { checkIn, checkOut, guests, guestName, guestPhone, guestEmail, travelType } = req.body;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
        req.flash("error", "Check-out must be after check-in date!");
        return res.redirect(`/listings/${req.params.id}/book`);
    }

    // chek  max persons allowed 
    if (Number(guests) > listing.maxPersons) {
        req.flash("error", `This property allows max ${listing.maxPersons} guests only!`);
        return res.redirect(`/listings/${req.params.id}/book`);
    }

    const totalPrice = nights * listing.price;

    const booking = new Booking({
        listing: listing._id,
        guest: req.user._id,
        guestName: guestName,
        guestPhone: guestPhone,
        guestEmail: guestEmail || "",
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests,
        travelType: travelType,
        totalPrice: totalPrice,
    });

    await booking.save();

    // Populate for emails
    await booking.populate("listing");
    await booking.populate({
        path: "listing",
        populate: { path: "owner" }
    });

    // Send emails
    try {
        console.log("Trying to send emails...");
        console.log("Guest email:", guestEmail);
        console.log("Host email:", listing.owner ? listing.owner.email : "no host");

        if (guestEmail) {
            await sendGuestEmail(booking);
            console.log("Guest email sent!");
        } else {
            console.log("No guest email — skipping");
        }

        if (listing.owner && listing.owner.email) {
            await sendHostEmail(booking);
            console.log(" Host email sent!");
        } else {
            console.log(" No host email — skipping");
        }
    } catch (emailErr) {
        console.log(" Email error:", emailErr.message);
    }

    req.flash("success", "Booking confirmed! Check your email 📧");
    res.redirect(`/bookings/${booking._id}/confirmation`);
});





// booking confirmation page rou
app.get("/bookings/:id/confirmation", isLoggedIn, async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate("listing")
        .populate("guest");
    res.render("bookings/confirmation.ejs", { booking });
});






// my bookings ( guest sees all their bookings)
app.get("/my-bookings", isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate("listing");


    const validBookings = bookings.filter(b => b.listing !== null); // filter the bookings where listing was deleted

    res.render("bookings/index.ejs", { bookings: validBookings });
});










// cancel booking rout
app.delete("/bookings/:id", isLoggedIn, async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate({
            path: "listing",
            populate: { path: "owner" }
        })
        .populate("guest");

    if (booking) {
        try {
            // send cancel email to guest
            if (booking.guestEmail) {
                await sendCancelGuestEmail(booking);
            }
            // Send cancel email to host
            if (booking.listing.owner && booking.listing.owner.email) {
                await sendCancelHostEmail(booking);
            }
        } catch (emailErr) {
            console.log("Cancel email error:", emailErr.message);
        }

        await Booking.findByIdAndDelete(req.params.id);
    }

    req.flash("success", "Booking cancelled! Confirmation email sent 📧");
    res.redirect("/my-bookings");
});















//  PROFILE ROUTES

// view profile rout
app.get("/profile", isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);

    let myListings = [];
    let myBookings = [];
    let receivedBookings = [];  // bookings on host's listings

    if (user.role === "host") {
        myListings = await Listing.find({ owner: user._id });


        receivedBookings = await Booking.find({
            listing: { $in: myListings.map(l => l._id) }
        })
            .populate("listing")
            .populate("guest")
            .sort({ bookedAt: -1 });  // newest first
    }

    if (user.role === "guest") {
        myBookings = await Booking.find({ guest: user._id })
            .populate("listing");
        myBookings = myBookings.filter(b => b.listing !== null);
    }

    res.render("profile/show.ejs", {
        user,
        myListings,
        myBookings,
        receivedBookings,
    });
});



// edit profile form
app.get("/profile/edit", isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("profile/edit.ejs", { user });
});






// update profile
app.put("/profile", isLoggedIn, upload.single("avatar"), async (req, res) => {
    const user = await User.findById(req.user._id);


    user.bio = req.body.bio || ""; // update bio

    // Update avatar if new image uploaded
    if (req.file) {
        if (user.avatar.filename !== "default") {
            await cloudinary.uploader.destroy(user.avatar.filename);
        }
        user.avatar = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await user.save();
    req.flash("success", "Profile updated! ");
    res.redirect("/profile");
});










//  WISHLIST ROUTES

// add to wishlist
app.post("/wishlist/:id", isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id;

    const alreadySaved = user.wishlist.some(
        id => id.toString() === listingId.toString()
    );

    if (alreadySaved) {
        user.wishlist.pull(listingId);
        await user.save();
        req.flash("success", "Removed from wishlist!");
    } else {
        user.wishlist.push(listingId);
        await user.save();
        req.flash("success", "Added to wishlist ❤️");
    }


    const referer = req.headers.referer || "/listings"; // Redirect back to where user came from
    res.redirect(referer);
});





// view wishlist
app.get("/wishlist", isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.render("wishlist/index.ejs", { wishlist: user.wishlist });
});









//  AI ROUTES



// Generate listing description using Gemini AI


app.post("/ai/generate-description", isLoggedIn, async (req, res) => {
    const { title, location, country, price } = req.body;

    console.log(" AI request received:", { title, location, country, price });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
      Write a short, attractive property description for a vacation rental listing.

      Property Details:
      - Title: ${title}
      - Location: ${location}, ${country}
      - Price: ₹${price} per night

      Rules:
      - Maximum 3-4 sentences
      - Mention location highlights
      - Sound welcoming and professional
      - Don't use emojis
      - Don't mention price in description
    `;

        const result = await model.generateContent(prompt);
        const description = result.response.text();

        res.json({ success: true, description });

    } catch (err) {
        console.log("AI error:", err.message);
        res.json({ success: false, message: "AI generation failed!" });
    }
});



// ollama use for description

// app.post("/ai/generate-description", isLoggedIn, async (req, res) => {
//     const { title, location, country, price } = req.body;
//     console.log("AI request received:", { title, location, country, price });

//     try {
//         const response = await ollama.chat({
//             model: "llama3.2",
//             messages: [{
//                 role: "user",
//                 content: `Write a short attractive property description for a vacation rental.
//           Title: ${title}
//           Location: ${location}, ${country}
//           Price: ₹${price}/night
//           Rules:
//           - Maximum 3-4 sentences
//           - Mention location highlights
//           - Sound welcoming and professional
//           - Don't use emojis
//           - Don't mention price`
//             }]
//         });

//         const description = response.message.content;
//         res.json({ success: true, description });

//     } catch (err) {
//         console.log("AI error:", err.message);
//         res.json({ success: false, message: "AI generation failed!" });
//     }
// });








// AI Review Summarizer
app.get("/listings/:id/summarize-reviews", isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        });

    // Need at least 1 review
    if (listing.reviews.length === 0) {
        return res.json({ success: false, message: "No reviews yet!" });
    }

    // Build reviews text for AI
    const reviewsText = listing.reviews.map(r =>
        `${r.author.username} gave ${r.rating} stars: "${r.comment}"`
    ).join("\n");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Summarize these hotel reviews in 2-3 short sentences.
      Mention what guests loved and any complaints.
      Keep it friendly and helpful.

      Reviews:
      ${reviewsText}
    `;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.json({ success: true, summary });

    } catch (err) {
        console.log("AI Review error:", err.message);
        res.json({ success: false, message: "Summary failed!" });
    }
});







// ollama model review generate

// app.get("/listings/:id/summarize-reviews", isLoggedIn, async (req, res) => {
//     const listing = await Listing.findById(req.params.id)
//         .populate({ path: "reviews", populate: { path: "author" } });

//     if (listing.reviews.length === 0) {
//         return res.json({ success: false, message: "No reviews yet!" });
//     }

//     const reviewsText = listing.reviews.map(r =>
//         `${r.author.username} gave ${r.rating} stars: "${r.comment}"`
//     ).join("\n");

//     try {
//         const response = await ollama.chat({
//             model: "llama3.2",
//             messages: [{
//                 role: "user",
//                 content: `Summarize these hotel reviews in 2-3 short sentences.
//           Mention what guests loved and any complaints.
//           Keep it friendly and helpful.
//           Reviews:
//           ${reviewsText}`
//             }]
//         });

//         const summary = response.message.content;
//         res.json({ success: true, summary });

//     } catch (err) {
//         console.log("AI Review error:", err.message);
//         res.json({ success: false, message: "Summary failed!" });
//     }
// });




// AI Trip Planner
app.post("/listings/:id/trip-planner", isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const { days } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Create a ${days}-day trip itinerary for a guest staying at:
      Property: ${listing.title}
      Location: ${listing.location}, ${listing.country}
      Rules:
      - Day by day plan
      - Include morning, afternoon, evening activities
      - Mention local attractions, food, culture
      - Format each day clearly as "Day 1:", "Day 2:" etc
      - Maximum 4-5 activities per day
      - Don't mention prices
    `;

        const result = await model.generateContent(prompt);
        const itinerary = result.response.text();
        return res.json({ success: true, itinerary });

    } catch (err) {
        console.log("Trip planner error:", err.message);

        // Check if it's a busy error
        if (err.message.includes("503") || err.message.includes("high demand")) {
            return res.json({
                success: false,
                message: "AI is busy right now! Please try again in a moment. 🙏"
            });
        }

        res.json({ success: false, message: "Trip planning failed!" });
    }
});


// ollama model 

// app.post("/listings/:id/trip-planner", isLoggedIn, async (req, res) => {
//     const listing = await Listing.findById(req.params.id);
//     const { days } = req.body;

//     try {
//         const response = await ollama.chat({
//             model: "llama3.2",
//             messages: [{
//                 role: "user",
//                 content: `Create a ${days}-day trip itinerary for a guest staying at:
//           Property: ${listing.title}
//           Location: ${listing.location}, ${listing.country}
//           Rules:
//           - Day by day plan
//           - Include morning, afternoon, evening activities
//           - Mention local attractions, food, culture
//           - Format each day as "Day 1:", "Day 2:" etc
//           - Maximum 4-5 activities per day
//           - Don't mention prices`
//             }]
//         });

//         const itinerary = response.message.content;
//         res.json({ success: true, itinerary });

//     } catch (err) {
//         console.log("Trip planner error:", err.message);
//         res.json({ success: false, message: "Trip planning failed! Try again." });
//     }
// });






// AI Chatbot

app.post("/listings/:id/chat", isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: { path: "author" }
        });

    const { message } = req.body;

    const listingContext = `
    Property: ${listing.title}
    Location: ${listing.location}, ${listing.country}
    Price: ₹${listing.price}/night
    Max Persons: ${listing.maxPersons}
    Description: ${listing.description}
    Reviews: ${listing.reviews.length > 0
            ? listing.reviews.map(r => `${r.rating} stars: ${r.comment}`).join(" | ")
            : "No reviews yet"
        }
  `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are a helpful assistant for property "${listing.title}".
      Only answer questions about this property.
      Be friendly and short (max 3 sentences).

      Property Info:
      ${listingContext}

      Guest asks: ${message}
    `;

        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        res.json({ success: true, reply });

    } catch (err) {
        console.log("Chatbot error:", err.message);
        res.json({ success: false, message: "AI is busy! Try again. 🙏" });
    }
});


//ollama model 

// app.post("/listings/:id/chat", isLoggedIn, async (req, res) => {
//     const listing = await Listing.findById(req.params.id)
//         .populate("owner")
//         .populate({ path: "reviews", populate: { path: "author" } });

//     const { message } = req.body;
//     console.log("Chat message received:", message);

//     const listingContext = `
//     Property: ${listing.title}
//     Location: ${listing.location}, ${listing.country}
//     Price: ₹${listing.price}/night
//     Max Persons: ${listing.maxPersons}
//     Description: ${listing.description}
//     Reviews: ${listing.reviews.length > 0
//             ? listing.reviews.map(r => `${r.rating} stars: ${r.comment}`).join(" | ")
//             : "No reviews yet"
//         }
//   `;

//     try {
//         const response = await ollama.chat({
//             model: "llama3.2",
//             messages: [{
//                 role: "user",
//                 content: `You are a helpful assistant for "${listing.title}".
//           Only answer questions about this property.
//           Be friendly and short (max 3 sentences).
//           Property Info: ${listingContext}
//           Guest asks: ${message}`
//             }]
//         });

//         const reply = response.message.content;
//         res.json({ success: true, reply });

//     } catch (err) {
//         console.log("Chatbot error:", err.message);
//         res.json({ success: false, message: "AI is busy! Try again." });
//     }
// });



//  Server  hai

app.listen(PORT, () => {
    console.log(`🚀 Wanderlust running on port ${PORT}`);
});

// app.listen(8080, () => {
//     console.log(" Wanderlust running on http://localhost:8080");
// });


// ip server 
// app.listen(8080, "0.0.0.0", () => {
//     console.log("Server running");
// });
