const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    userId: String,
    reason: String,
    expirationTimestamp: String,
    bannedOn: String,
    bannedBy: String
});

module.exports = mongoose.model("Ban", schema)