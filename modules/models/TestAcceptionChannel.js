const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    moduleId: String,
    channelId: String,
    acceptMessage: String,
    acceptPermissions: [String]
});

module.exports = mongoose.model("TestAcceptionChannel", schema)