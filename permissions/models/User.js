const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    id: String,
    name: String,
    permissions: [String],
    groups: [String]
});

module.exports = mongoose.model("User", schema)