const Ticket = require("../models/Ticket")
const modules = require("./modules")
const permissions = require("../../permissions/permissions")
const TicketBooth = require("../models/TicketBooth")
const config = require("../../util/config")
const { StringSelectMenuBuilder, EmbedBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders")
const { ChannelType, PermissionsBitField, ButtonStyle } = require("discord.js")
const log = require("../../util/log")

async function find(user, reason, moduleId) {
    const ticket = await Ticket.findOne({moduleId: moduleId, reason: reason, user: user})
    return ticket
}

async function getAll(moduleId) {
    const tickets = await Ticket.find({moduleId: moduleId})
    return tickets
}

async function createTicketChannel(guild, moduleId, user, reason) {
    ticketBooth = await findBooth(moduleId)
    module = await modules.find(moduleId)
    overwrites = [
        {
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        }]
    

    permittedUsers = await permissions.getPermittedUsers(ticketBooth.viewPermissions) 
    
    for (permittedUser of permittedUsers) {
        overwrites.push({
            id: permittedUser,
            allow: [PermissionsBitField.Flags.ViewChannel],
        })
    }
    
    ticketChannel = await guild.channels.create({
        name: "🔒" + reason + "-" + user.username,
        type: ChannelType.GuildText,
        parent: module.category,
        permissionOverwrites: overwrites
    })
    return ticketChannel
}

async function reloadAll(moduleId, guild) {

    allTickets = await getAll(moduleId)

    for (ticket of allTickets) {
        try {
            ticketChannel = await guild.channels.fetch(ticket.channel, {force: true})
        } catch {
            reason = ticket.reason
            try {
                member = await guild.members.fetch(ticket.user)
                ticketChannel = await createTicketChannel(guild, moduleId, member.user, reason)
                await sendTicketMessage(ticketChannel, reason, member.user, moduleId)
                await setTicketChannel(ticket.moduleId, ticket.user, ticket.reason, ticketChannel.id)
            } catch {
                log.warn("Nutzer " + ticket.user + " ist kein Member mehr")
            }
        }
    }
}

async function reloadBooth(moduleId, guild) {
    module = await modules.find(moduleId)
    ticketCategory = await guild.channels.fetch(module.category)
    try {
        ticketBoothChannel = await guild.channels.fetch(module.mainChannel, {force: true})
    } catch { // this is run if channel is not found
        ticketBoothChannel = await createBoothChannel(ticketCategory, moduleId)
        await modules.setMainChannel(moduleId, ticketBoothChannel.id)
    }

    try {
        boothMessage = await ticketBoothChannel.messages.fetch(await getBoothMessage(moduleId))
        await boothMessage.delete()
        sendBoothMessage(moduleId, ticketBoothChannel)
    } catch { // this is run if message is not found
        sendBoothMessage(moduleId, ticketBoothChannel)
    }
    
}

async function deleteOne(user, reason, moduleId) {
    await Ticket.findOneAndDelete({moduleId: moduleId, reason: reason, user: user})
}

async function deleteAll(moduleId) {
    tickets = await getAll((moduleId))
    for (ticket of tickets) {
        ticketChannel = await guild.channels.cache.get(ticket.channel)
        await deleteOne(ticket.user, ticket.reason, moduleId)
        await ticketChannel.delete()
    }
    return true
}

async function create(moduleId, user, reason, channel) {
    if (await find(user, reason, moduleId) == null) {
        const ticket = new Ticket({reason: reason, user: user, channel: channel, moduleId: moduleId, claimedBy: "0"})
        ticket.save().then(() => log.info("MongoDB: Ticket von " + user + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Ticket " + user + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function setChannel(moduleId, user, reason, channel) {
    ticket = await find(user, reason, moduleId)
    ticket.channel = channel
    ticket.save()
    return true
}

async function createBooth(moduleId, channelId) {
    if (await findBooth(moduleId) == null) {
        const ticketBooth = new TicketBooth({
            moduleId: moduleId,
            channelId: channelId,
            boothMessage: "0", 
            viewPermissions: ["admin"], 
            closePermissions: ["admin"], 
            openPermissions: []})

        ticketBooth.save().then(() => log.info("MongoDB: Modul " + moduleId + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Modul " + moduleId + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function findBooth(moduleId) {
    const ticketBooth = await TicketBooth.findOne({moduleId: moduleId})
    return ticketBooth
}

async function setBoothMessage(moduleId, messageId) {
    ticketBooth = await findBooth(moduleId)
    if (ticketBooth == null) {
        return false
    } else {
        ticketBooth.boothMessage = messageId
        ticketBooth.save()
        return true
    }
}

async function getBoothMessage(moduleId) {
    ticketBooth = await findBooth(moduleId)
    if (ticketBooth == null) {
        return false
    } else {
        return ticketBooth.boothMessage
    }
}

async function createClaim(user, reason, moduleId, claimingId) {
    ticket = await find(user, reason, moduleId)
    ticket.claimedBy = claimingId
    ticket.save().then(() => log.info("MongoDB: Ticket von wurde von " + claimingId + " geclaimed"))
}


async function createBoothChannel(category, moduleId) {
    // creates the channel
    guild = category.guild
    mainChannel = await guild.channels.create({
        name: "ticket-booth",
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
    await createBooth(moduleId, mainChannel.id)
    return mainChannel
}

async function sendBoothMessage(moduleId, mainChannel) {
    conf = await config.load()

    const select = new StringSelectMenuBuilder() // creates the select menu
        .setCustomId(moduleId+"-createTicket")
        .setPlaceholder('Wähle einen Grund für das Ticket aus')
        
    options = conf.modules.tickets.options

    Object.keys(options).forEach(function(option) {
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(options[option].label)
                .setDescription(options[option].description)
                .setValue(options[option].name)
                .setEmoji({
                    id: options[option].emoji})
        );
    })
    const row = new ActionRowBuilder()
        .addComponents(select);

    // sends the boothMessage
    const ticketCreationEmbed = new EmbedBuilder()
        .setColor(0xFFFFFF ) // black
        .setTitle('**Ticket Erstellen!**')
        .setAuthor({ name: 'Ticket System', iconURL: 'https://i.imgur.com/ZqUCHT7.png'})
        .setDescription(`Hier die verschiedenen Möglichkeiten um ein Ticket zu erstellen:\n
 
            Allgemeiner Support (Fragen/Anliegen)\n
            Nutzer Report\n
            Fehlermeldung\n
            Rollenanfrage
            `)
    message = await mainChannel.send({ embeds: [ticketCreationEmbed], components: [row]})
        
    setBoothMessage(moduleId, message.id)
    return message
}

async function sendTicketMessage(ticketChannel, reason, user, moduleId, ticketInfo) {
    option = conf.modules.tickets.options[reason]
    const ticketEmbed = new EmbedBuilder()
        .setColor(0xFFFFFF) // discord green
        .setTitle(option.label + ' Ticket')
        .setAuthor({ name: user.username, iconURL: await user.displayAvatarURL()})
        .setDescription("Unser Support wurde kontaktiert, bitte habe Geduld.")
    
    
    Object.keys(option.info).forEach(function(info) {
        if (ticketInfo == undefined) {
            ticketEmbed.addFields({ name: option.info[info].title, value: "Antwort nicht gefunden." })
        } else {
            ticketEmbed.addFields({ name: option.info[info].title, value: ticketInfo.getTextInputValue(info) })
        }
        
    })
    const closeTicketButton = new ButtonBuilder()
        .setCustomId('closeTicket-'+user.id+"-"+moduleId+"-"+option.name)
        .setLabel('Ticket schließen')
        .setStyle(ButtonStyle.Danger)
        .setEmoji({
            id: "1113870514763595806"}) // ticket_red

    const claimTicketButton = new ButtonBuilder()
            .setCustomId('claimTicket-'+user.id+"-"+moduleId+"-"+option.name)
            .setLabel('Ticket beanspruchen')
            .setStyle(ButtonStyle.Success)
            .setEmoji({
                id: "1113870451781943296"}) // ticket_green
        
    const row = new ActionRowBuilder()
        .addComponents([closeTicketButton, claimTicketButton]);

    message = await ticketChannel.send({ content: "||@everyone||", embeds: [ticketEmbed], components: [row]})
}

async function addBoothPermission(moduleId, permissionType, permission) {
    ticketBooth = await findBooth(moduleId)
    if (permissionType == "view") {
        viewPermissions = ticketBooth.viewPermissions
        if (!viewPermissions.includes(permission)){
            viewPermissions.push(permission)
            ticketBooth.save()
        }
    } else if (permissionType == "close") {
        closePermissions = ticketBooth.closePermissions
        if (!closePermissions.includes(permission)){
            closePermissions.push(permission)
            ticketBooth.save()
        }
    } else if (permissionType == "open") {
        openPermissions = ticketBooth.openPermissions
        if (!openPermissions.includes(permission)){
            openPermissions.push(permission)
            ticketBooth.save()
        }
    }
}

async function removeBoothPermission(moduleId, permissionType, permission) {
    ticketBooth = await findBooth(moduleId)
    if (permissionType == "view") {
        if (ticketBooth.viewPermissions.includes(permission)){
            viewPermissions = ticketBooth.viewPermissions.filter(item => item !== permission)
            await ticketBooth.save()
            return true

        } else {
            log.warn("Diese Permission ist nicht vorhanden.")
            return false
        }
    } else if (permissionType == "close") {
        if (ticketBooth.closePermissions.includes(permission)){
            closePermissions = ticketBooth.closePermissions.filter(item => item !== permission)
            await ticketBooth.save()
            return true
        } else {
            log.warn("Diese Permission ist nicht vorhanden.")
            return false
        }
    } else if (permissionType == "open") {
        if (ticketBooth.openPermissions.includes(permission)){
            openPermissions = ticketBooth.openPermissions.filter(item => item !== permission)
            await ticketBooth.save()
            return true
        } else {
            log.warn("Diese Permission ist nicht vorhanden.")
            return false
        }
    }
}

module.exports = {
    reloadAll,
    reloadBooth,
    getAll,
    find,
    create,
    deleteOne,
    deleteAll,
    createBooth,
    setBoothMessage,
    createClaim,
    createBoothChannel,
    sendBoothMessage,
    findBooth,
    sendTicketMessage,
    createTicketChannel,
    removeBoothPermission,
    addBoothPermission
}