const config = require("../util/config")
const moduleUtil = require("../modules/database")
const permissions = require("../permissions/permissions")
const { EmbedBuilder } = require("@discordjs/builders")
const { ChannelType, PermissionsBitField } = require("discord.js")
const log = require("../util/log")
const tickets = require("../modules/tickets")


async function handle(interaction) {
    const potentialModule = await moduleUtil.findModule(interaction.customId) // gets the module from which the request was sent, if is a module at all

    if (potentialModule != null) {
        if (potentialModule.type == "tickets"){
            tickets.initTicket(interaction, potentialModule)
        }
    }
}



module.exports = {
    handle: handle
}

