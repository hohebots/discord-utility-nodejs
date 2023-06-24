const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    id: String,
    name: String,
    testPoints: String,
    tier: [[String]]
});

module.exports = mongoose.model("Tester", schema)