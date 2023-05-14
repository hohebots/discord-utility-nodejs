const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    id: String,
    name: String,
    description: String
});

module.exports = mongoose.model("Permission", schema)
 