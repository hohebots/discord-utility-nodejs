const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    name: String,
    id: String,
    roles: [[String]],
    iconLink: String,
    iconEmoji: String,
    googleSheetName: String
});


module.exports = mongoose.model("Module", schema)