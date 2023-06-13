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



async function setup(interaction) {

    const moduleId = randomstring.generate(10)
    const moduleName = interaction.fields.getTextInputValue('name')

    const guild = interaction.guild
    
    // creates category and main channel
    category = await guild.channels.create({
        name: moduleName,
        type: ChannelType.GuildCategory,
    })

    mainChannel = await tickets.createBoothChannel(category, moduleId) // creates the ticket booth
    boothMessage = await tickets.sendBoothMessage(moduleId, mainChannel) // sends the ticket creation message

    // creates database entry for booth and ticket module
    if (!modules.create(moduleId, "tickets", moduleName, mainChannel.id, category.id)) {
        return false
    }
    log.info("Module " + moduleId + " wurde erstellt")
    return true
}

async function initTicket(interaction, potentialModule) { // todo: make this prettier
   
    interactionUser = interaction.user
    client = clientStorage.getClientInstance()
    const conf = await config.load()
    const response = interaction.values[0]
    const option = conf.modules.tickets.options[response]
    const reason = option.label
    const ticketBooth = await tickets.findBooth(potentialModule.id)
    let potentialTicket = await tickets.find(interactionUser.id, option.name, potentialModule.id)
    
    if (!await permissions.check(interaction.user.id, ticketBooth.openPermissions)) {
        await missingPermissions.run(interaction)
        return
    }   

    if (potentialTicket != null) {
        log.warn("Nutzer " + interaction.user.username + " hat bereits ein offenes Ticket mit dem Grund " + reason)
        const ticketAlreadyOpenEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Ticket existiert bereits')
            .setAuthor({ name: 'Ticket System', iconURL: 'https://i.imgur.com/Fqlf9Hg.png'})
            .setDescription('Du hast bereits ein offenes Ticket dieser Art.')

        await interaction.reply({ embeds: [ticketAlreadyOpenEmbed], ephemeral: true})
        return
    }

    const ticketCreationModal = new ModalBuilder()
        .setCustomId('createTicket-'+interactionUser.id+"-"+potentialModule.id+"-"+option.name)
        .setTitle('Ticket erstellen');
    
    row = new ActionRowBuilder()

    Object.keys(option.info).forEach(function(info) {
        const ticketModalInfo = new TextInputBuilder()
            .setCustomId(info)
            .setLabel(option.info[info].label)
            .setStyle(option.info[info].type)
            .setMaxLength(1000)

        ticketCreationModal.addComponents(new ActionRowBuilder().addComponents(ticketModalInfo))
    })
        
    await interaction.showModal(ticketCreationModal)
}


async function createTicket(interaction, modalResponse, ticketInfo) { // todo: make this prettier
    potentialModule = await modules.find(modalResponse[2])
    ticketBooth = await tickets.findBooth(potentialModule.id)
    client = clientStorage.getClientInstance()
    const interactionUser = interaction.user
    const conf = await config.load()
    const guild = interaction.guild
    const response = modalResponse[3]
    const option = conf.modules.tickets.options[response]
    
    if (option == undefined) {
        log.error("Miskonfiguration: Optionsname und Optionspfad müssen gleich sein. Behebe diesen Fehler und lade das Modul neu")
        return
    }

    ticketChannel = await tickets.createTicketChannel(guild, potentialModule.id, interactionUser, response)
    tickets.sendTicketMessage(ticketChannel, response, interactionUser, potentialModule.id, ticketInfo)
    tickets.create(potentialModule.id, interactionUser.id, option.name, ticketChannel.id)

    const interactionSuccessEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Ticket wurde erstellt')
        .setAuthor({ name: 'Ticket System', iconURL: 'https://i.imgur.com/jErEqVp.png'})
        .setDescription("Dein Ticket wurde erstellt!")

    await interaction.reply({ embeds: [interactionSuccessEmbed], ephemeral: true})

}


async function closeTicket(buttonResponse, interaction) {
    userId = buttonResponse[1]
    moduleId = buttonResponse[2]
    reason = buttonResponse[3]
    
    guild = interaction.guild
    ticket = await tickets.find(userId, reason, moduleId)
    ticketChannel = await guild.channels.cache.get(ticket.channel)
    ticketBooth = await tickets.findBooth(moduleId)

    if (await permissions.check(interaction.user.id, ticketBooth.closePermissions)) {
        tickets.deleteOne(userId, reason, moduleId)
        ticketChannel.delete()
    } else {
        missingPermissions.run(interaction)
    }
}

async function claimTicket(buttonResponse, interaction) {
    userId = buttonResponse[1]
    moduleId = buttonResponse[2]
    reason = buttonResponse[3]
    
    guild = interaction.guild
    client = await clientStorage.getClientInstance()
    ticket = await tickets.find(userId, reason, moduleId)
    ticketChannel = await guild.channels.cache.get(ticket.channel)
    ticketBooth = await tickets.findBooth(moduleId)

    if (await permissions.check(interaction.user.id, ticketBooth.viewPermissions)) {
        if (ticket.claimedBy != "0" && ticket.claimedBy != null) {
            originalClaimer = await client.users.fetch(ticket.claimedBy)
            const ticketClaimedEmbed = new EmbedBuilder()
                .setColor(0xED4245) // discord red
                .setTitle('Ticket wurde bereits beansprucht')
                .setAuthor({ name: "Ticket System", iconURL: "https://i.imgur.com/Fqlf9Hg.png"})
                .setDescription("Dieses Ticket wurde bereits von " + originalClaimer.username + " beansprucht")
            
            await interaction.reply({ embeds: [ticketClaimedEmbed], ephemeral: true})
            return
        }
        await tickets.createClaim(userId, reason, moduleId, interaction.user.id)
        const ticketClaimedEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Ticket wurde beansprucht')
            .setAuthor({ name: interaction.user.username, iconURL: "https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".png"})
            .setDescription("Dieses Ticket wurde von " + interaction.user.username + " beansprucht")

        await interaction.reply({ embeds: [ticketClaimedEmbed]})
    } else {
        missingPermissions.run(interaction)
    }
    
}

module.exports = {
    setup,
    createTicket,
    closeTicket,
    claimTicket,
    initTicket
}

