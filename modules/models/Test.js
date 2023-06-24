const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    user: String,
    tester: String,
    state: String, // inactive, active, done, closed
    kit: String,
    estimatedTier: String,
    ingameName: String,
    testMessage: String,
    testChannel: String,
    createdAt: String,
    acceptedAt: String,
    completedAt: String,
    finalTier: String,
    finaliseTest: String,
    moduleId: String,
    id: String
});


module.exports = mongoose.model("Test", schema)