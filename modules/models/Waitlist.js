const mongoose = require("mongoose")
const { Schema } = mongoose;

const schema = Schema({
    isLocked: Boolean,
    viewPermissions: [String],
    joinPermissions: [String],
    managePermissions: [String],
    kits: [String],
    mainChannel: String,
    waitlistMessage: String,
    moduleId: String
});


module.exports = mongoose.model("Module", schema)