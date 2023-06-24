const { ChannelType, PermissionsBitField, RoleManager, ButtonStyle, TextInputStyle } = require("discord.js")
const tickets = require("../util/tickets.js")
const modules = require("../util/modules.js")
const randomstring = require("randomstring")
const clientStorage = require("../../util/client.js")
const config = require("../../util/config.js")
const { StringSelectMenuBuilder, SelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ApplicationCommandOptionWithChoicesAndAutocompleteMixin, ButtonBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder } = require("@discordjs/builders")
const log = require("../../util/log.js")
const permissions = require("../../permissions/permissions.js")
const missingPermissions = require("../../commands/missingPermissions.js")
const giveawayUser = require("../util/giveawayUsers.js")


async function tempSetup(interaction) {
    const giveawayEmbed = new EmbedBuilder()
        .setColor(0xFFFFFF) // discord red
        .setTitle('Giveaway beitreten')
        .setAuthor({ name: 'Giveaway', iconURL: 'https://i.imgur.com/h2YL3j0.png'})
        .setDescription('Nutze den Knopf um am Gewinnspiel teilzunehmen, zu gewinnen: Roccat Vulcan 121 + Roccat Kone AIMO')
        .setImage('https://i.imgur.com/gWDB6kb.png')

    const joinGiveawayButton = new ButtonBuilder()
        .setCustomId("joinGiveaway")
        .setLabel('Giveaway beitreten')
        .setStyle(ButtonStyle.Success)
        .setEmoji({
            id: "1114263363095109882"}) // ticket_red

    const row = new ActionRowBuilder()
        .addComponents([joinGiveawayButton]);

    message = await interaction.channel.send({embeds: [giveawayEmbed], components: [row]})

    return true
}

async function addUser(interaction) {
    user = await giveawayUser.find(interaction.user.id)
    if (user == null) {
        await giveawayUser.create(interaction.user.id)
        const giveawayJoinedEmbed = new EmbedBuilder()
            .setColor(0xFFFFFF) // discord red
            .setTitle('Giveaway erfolgreich beigetreten')
            .setAuthor({ name: 'Giveaway', iconURL: 'https://i.imgur.com/pKsq653.png'})
            .setDescription('Du bist dem Giveaway beigetreten.')
        await interaction.reply({ embeds: [giveawayJoinedEmbed], ephemeral: true})
    } else {
        const alreadyInGiveawayEmbed = new EmbedBuilder()
            .setColor(0xFFFFFF) // discord red
            .setTitle('Du bist bereits in diesem Giveaway')
            .setAuthor({ name: 'Giveaway', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
            .setDescription('Du bist diesem Giveaway bereits beigetreten.')
        await interaction.reply({ embeds: [alreadyInGiveawayEmbed], ephemeral: true})
    }

}

module.exports = {
    tempSetup,
    addUser
}

