const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    id: String,
    name: String,
    testPoints: String,
    estimatedTier: String,
    tier: [[String]],
});

module.exports = mongoose.model("Module", schema)