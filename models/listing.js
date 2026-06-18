const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
    },

    image: {
        url: {
            type: String,
            default:
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60",
        },
    },

    price: Number,
    location: String,
    country: String,
});

module.exports = mongoose.model("listing", listingSchema);