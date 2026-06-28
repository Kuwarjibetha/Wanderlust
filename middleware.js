const Listing = require("./models/listing");

//  Check if user is logged in 
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  next();
};

//  Save redirect URL 
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    // Clear it after using
    delete req.session.redirectUrl;
  }
  next();
};

//  Check if user owns the listing
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  // Old listings have no owner — skip check
  if (!listing.owner) {
    return next();
  }

  // Other user's listing — block access
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

//  Check if user is a host 
module.exports.isHost = (req, res, next) => {
  if (req.user.role === "guest") {
    req.flash("error", "Only hosts can manage listings!");
    return res.redirect("/listings");
  }
  next();
};