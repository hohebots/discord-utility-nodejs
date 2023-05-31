const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    id: String,
    type: String,
    name: String,
    category: String,
    mainChannel: String
});


module.exports = mongoose.model("Module", schema)