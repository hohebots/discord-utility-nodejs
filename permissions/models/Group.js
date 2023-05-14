const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    id: String,
    name: String,
    linkedDiscordGroup: String, 
    permissions: [String],
});

module.exports = mongoose.model("Group", schema)