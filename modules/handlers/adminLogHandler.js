const { ChannelType, PermissionsBitField, RoleManager, ButtonStyle, TextInputStyle } = require("discord.js")
const adminLog = require("../util/adminLogs.js")
const modules = require("../util/modules.js")
const randomstring = require("randomstring")
const clientStorage = require("../../util/client.js")
const config = require("../../util/config.js")
const { StringSelectMenuBuilder, SelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ApplicationCommandOptionWithChoicesAndAutocompleteMixin, ButtonBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder } = require("@discordjs/builders")
const log = require("../../util/log.js")
const permissions = require("../../permissions/permissions.js")
const missingPermissions = require("../../commands/missingPermissions.js")



async function setup(interaction) {

    const moduleId = randomstring.generate(10)
    const moduleName = interaction.fields.getTextInputValue('name')

    const guild = interaction.guild
    
    // creates category and main channel
    category = await guild.channels.create({
        name: moduleName,
        type: ChannelType.GuildCategory,
    })

    mainChannel = await adminLog.createLogChannel(category, moduleId) // creates the adminLog Channel

    // creates database entry for booth and ticket module
    if (!modules.create(moduleId, "adminLog", moduleName, mainChannel.id, category.id)) {
        return false
    }
    log.info("Module " + moduleId + " wurde erstellt")
    return true
}

module.exports = {
    setup
}

