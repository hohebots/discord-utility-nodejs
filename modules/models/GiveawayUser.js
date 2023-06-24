const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    id: String
});


module.exports = mongoose.model("GiveawayUser", schema)