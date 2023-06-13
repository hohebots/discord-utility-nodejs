const Ticket = require("../models/Ticket")
const modules = require("./modules")
const permissions = require("../../permissions/permissions")
const TicketBooth = require("../models/TicketBooth")
const config = require("../../util/config")
const { StringSelectMenuBuilder, EmbedBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders")
const { ChannelType, PermissionsBitField, ButtonStyle } = require("discord.js")
const log = require("../../util/log")

async function createLogChannel(category, moduleId) {
    // creates the channel
    guild = category.guild
    mainChannel = await guild.channels.create({
        name: "admin-log",
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
            {
                id: guild.id,
                allow: [],
                deny: [PermissionsBitField.Flags.ViewChannel]
            }
        ]
    })

    return mainChannel
}

async function reloadLogChannel(moduleId, guild) {
    module = await modules.find(moduleId)
    adminCategory = await guild.channels.fetch(module.category)
    try {
        adminLogChannel = await guild.channels.fetch(module.mainChannel, {force: true})
    } catch { // this is run if channel is not found
        adminLogChannel = await createLogChannel(ticketCategory, moduleId)
        await modules.setMainChannel(moduleId, adminLogChannel.id)
    }
}

module.exports = {
    createLogChannel,
    reloadLogChannel
}