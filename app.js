const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing");
const ejsMate = require("ejs-mate");


// connect
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
main().then(()=>{
    console.log("connected to db");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs",ejsMate);

// function normalizeListingImage(listing) {
//     if (typeof listing.image === "string") {
//         listing.image = { url: listing.image };
//     }
// }


app.get("/",async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});


// Index Route
app.get("/listings",async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})

// New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})
// create route 
// app.post("/listings",async(req,res)=>{
//     // let {title,description,image,price,location,country} = req.body;
//     // let listing = req.body.listing;
//     normalizeListingImage(req.body.listing);
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings")

// })


app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});


// edit Routes
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});


// update Route
// app.put("/listings/:id",async(req,res)=>{
//     let{id} = req.params;
//     normalizeListingImage(req.body.listing);
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// })


app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
});
// Delete Route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});


// Show Route
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    const listings = await Listing.findById(id)
    res.render("listings/show.ejs",{listings})
})


app.listen(8080,()=>{
    console.log(`port is running on 8080`);
})
