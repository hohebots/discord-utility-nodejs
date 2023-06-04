const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    reason: String,
    user: String,
    channel: String,
    moduleId: String,
    claimedBy: String
});


module.exports = mongoose.model("Ticket", schema)