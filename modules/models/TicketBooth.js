const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    moduleId: String,
    channelId: String,
    boothMessage: String,
    viewPermissions: [String],
    closePermissions: [String],
    openPermissions: [String]
    
});


module.exports = mongoose.model("TicketBooth", schema)