const Ticket = require("../models/Ticket")
const modules = require("./modules")
const permissions = require("../../permissions/permissions")
const TicketBooth = require("../models/TicketBooth")
const config = require("../../util/config")
const { StringSelectMenuBuilder, EmbedBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders")
const { ChannelType, PermissionsBitField, ButtonStyle } = require("discord.js")
const log = require("../../util/log")
const Waitlist = require("../models/Waitlist")
const kits = require("./kits")

async function createWaitlistChannel(category, moduleId) {
    // creates the channel
    guild = category.guild
    mainChannel = await guild.channels.create({
        name: "waitlist",
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
            {
                id: guild.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
                deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions]
            }
        ]
    })

    // creates database entry for this booth
    await createWaitlist(moduleId, mainChannel.id)
    return mainChannel
}

async function createWaitlist(moduleId, channelId) {
    if (await findWaitlist(moduleId) == null) {
        const waitlist = new Waitlist({
            isLocked: false,
            viewPermissions: ["admin"],
            managePermissions: ["admin"],
            joinPermissions: [],
            kits: [],
            mainChannel: channelId,
            waitlistMessage: "0",
            moduleId: moduleId})
            waitlist.save().then(() => log.info("MongoDB: Waitlist " + moduleId + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Waitlist " + moduleId + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function findWaitlist(moduleId) {
    const waitlist = await Waitlist.findOne({moduleId: moduleId})
    return waitlist
}

async function sendWaitlistMessage(moduleId, mainChannel) {
    conf = await config.load()
    const select = new StringSelectMenuBuilder() // creates the select menu
        .setCustomId(moduleId)
        .setPlaceholder('Für welches Kit möchtest du einen Test anfragen?')
        
    allKits = await kits.getAll()
    for (kit of allKits) {
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(kit.name)
                .setValue(kit.id)
                .setEmoji({
                    id: kit.iconEmoji})
        );
    }

    const row = new ActionRowBuilder()
        .addComponents(select);

    // sends the waitlistMessage
    const joinWaitlistEmbed = new EmbedBuilder()
        .setColor(0x000000 ) // black
        .setTitle('**Tiertest Beantragen**')
        .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/ZqUCHT7.png'})
        .setDescription(`Benutze das Menü um der Warteschlange beizutreten.`)

    message = await mainChannel.send({ embeds: [joinWaitlistEmbed], components: [row]})
        
    setWaitlistMessage(moduleId, message.id)
    return message
}

async function setWaitlistMessage(moduleId, messageId) {
    waitlist = await find(moduleId)
    if (waitlist == null) {
        return false
    } else {
        waitlist.waitlistMessage = messageId
        waitlist.save()
        return true
    }
}

async function find(moduleId) {
    const waitlist = await Waitlist.findOne({moduleId: moduleId})
    return waitlist
}


module.exports = {
    sendWaitlistMessage,
    createWaitlistChannel,
    find
}