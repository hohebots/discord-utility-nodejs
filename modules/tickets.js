const { ChannelType, PermissionsBitField, RoleManager, ButtonStyle, TextInputStyle } = require("discord.js")
const moduleUtil = require("./database.js")
const randomstring = require("randomstring")
const clientStorage = require("../util/client.js")
const config = require("../util/config.js")
const { StringSelectMenuBuilder, SelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ApplicationCommandOptionWithChoicesAndAutocompleteMixin, ButtonBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder } = require("@discordjs/builders")
const log = require("../util/log.js")
const permissions = require("../permissions/permissions.js")
const missingPermissions = require("../commands/missingPermissions.js")

async function setup(interaction) {

    const moduleId = randomstring.generate(10)
    const moduleName = interaction.fields.getTextInputValue('name')

    const guild = interaction.guild
    conf = await config.load()
    
    // creates category and main channel
    category = await guild.channels.create({
        name: moduleName,
        type: ChannelType.GuildCategory,
    })

    

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

    // creates database entry for booth and ticket module
    if (!moduleUtil.createModule(moduleId, "tickets", moduleName, mainChannel.id, category.id)) {
        return false
    }
    moduleUtil.createTicketBooth(moduleId, mainChannel.id)

    // sends the ticketbooth message
    const select = new StringSelectMenuBuilder() // creates the select menu
        .setCustomId(moduleId)
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


    const ticketCreationEmbed = new EmbedBuilder()
        .setColor(0x000000 ) // discord blurple
        .setTitle('**Ticket Erstellen!**')
        .setAuthor({ name: 'Ticket System', iconURL: 'https://i.imgur.com/ZqUCHT7.png'})
        .setDescription(`Hier die verschiedenen Möglichkeiten um ein Ticket zu erstellen:
 
            Allgemeiner Support (Fragen/Anliegen)
            Partner Bewerbung
            Team Berwerbung (Mod/Dev
            Report (Bug/User)`)

        message = await mainChannel.send({ embeds: [ticketCreationEmbed], components: [row]})
        
    moduleUtil.setBoothMessage(moduleId, message.id)

    log.info("Module " + moduleId + " wurde erstellt")
    return true
}

async function initTicket(interaction, potentialModule) {
    interactionUser = interaction.user
    client = clientStorage.getClientInstance()
    const conf = await config.load()
    const response = interaction.values[0]
    const option = conf.modules.tickets.options[response]
    const ticketBooth = await moduleUtil.findTicketBooth(potentialModule.id)
    let potentialTicket = await moduleUtil.findTicket(interactionUser.id, option.name, potentialModule.id)
    
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


async function createTicket(interaction, modalResponse, ticketInfo) {
    potentialModule = await moduleUtil.findModule(modalResponse[2])
    client = clientStorage.getClientInstance()
    const interactionUser = interaction.user
    const conf = await config.load()
    const guild = interaction.guild
    const response = modalResponse[3]
    const option = conf.modules.tickets.options[response]
    const reason = option.label


    
    overwrites = [
        {
            id: interactionUser.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        }]
    

    permittedUsers = await permissions.getPermittedUsers(["admin"]) // gets all users with admin permission, use this function later when updating viewPermissions,
                                                        // if new permission/group is added to user, check if permission is a view permission, if so - update overwrites
                                                        // if new permission is added to group, check if permission is a view permission, if so - update overwrites
    
    for (user of permittedUsers) {
        overwrites.push({
            id: user,
            allow: [PermissionsBitField.Flags.ViewChannel],
        })
    }
    
    ticketChannel = await guild.channels.create({
        name: response + "-" + interactionUser.username,
        type: ChannelType.GuildText,
        parent: potentialModule.category,
        permissionOverwrites: overwrites
    })
    
    if (option == undefined) {
        log.error("Miskonfiguration: Optionsname und Optionspfad müssen gleich sein. Behebe diesen Fehler und lade das Modul neu")
        return
    } 

    const ticketEmbed = new EmbedBuilder()
        .setColor(0x000000) // discord green
        .setTitle(reason + ' Ticket')
        .setAuthor({ name: interactionUser.username, iconURL: await interactionUser.displayAvatarURL()})
        .setDescription("Unser Support wurde kontaktiert, bitte habe Geduld. ||@everyone||")
    
    Object.keys(option.info).forEach(function(info) {
        ticketEmbed.addFields({ name: option.info[info].title, value: ticketInfo.getTextInputValue(info) })
    })
    const closeTicketButton = new ButtonBuilder()
        .setCustomId('closeTicket-'+interactionUser.id+"-"+potentialModule.id+"-"+option.name)
        .setLabel('Ticket schließen')
        .setStyle(ButtonStyle.Danger)
        .setEmoji({
            id: "1113870514763595806"}) // ticket_red

    const claimTicketButton = new ButtonBuilder()
            .setCustomId('claimTicket-'+interactionUser.id+"-"+potentialModule.id+"-"+option.name)
            .setLabel('Ticket beanspruchen')
            .setStyle(ButtonStyle.Success)
            .setEmoji({
                id: "1113870451781943296"}) // ticket_green
        
    const row = new ActionRowBuilder()
        .addComponents([closeTicketButton, claimTicketButton]);

    message = await ticketChannel.send({ embeds: [ticketEmbed], components: [row]})

    moduleUtil.createTicket(potentialModule.id, interactionUser.id, option.name, ticketChannel.id)

    const missingPermissionsEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Ticket wurde erstellt')
        .setAuthor({ name: 'Ticket System', iconURL: 'https://i.imgur.com/jErEqVp.png'})
        .setDescription("Dein Ticket wurde erstellt!")

    await interaction.reply({ embeds: [missingPermissionsEmbed], ephemeral: true})

}


async function closeTicket(buttonResponse, interaction) {
    userId = buttonResponse[1]
    moduleId = buttonResponse[2]
    reason = buttonResponse[3]
    
    guild = interaction.guild
    ticket = await moduleUtil.findTicket(userId, reason, moduleId)
    ticketChannel = await guild.channels.cache.get(ticket.channel)
    ticketBooth = await moduleUtil.findTicketBooth(moduleId)

    if (await permissions.check(interaction.user.id, ticketBooth.closePermissions)) {
        moduleUtil.deleteTicket(userId, reason, moduleId)
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
    ticket = await moduleUtil.findTicket(userId, reason, moduleId)
    ticketChannel = await guild.channels.cache.get(ticket.channel)
    ticketBooth = await moduleUtil.findTicketBooth(moduleId)

    if (await permissions.check(interaction.user.id, ticketBooth.viewPermissions)) {
        if (ticket.claimedBy != "0") {
            originalClaimer = await client.users.fetch(ticket.claimedBy)
            const ticketClaimedEmbed = new EmbedBuilder()
                .setColor(0xED4245) // discord red
                .setTitle('Ticket wurde bereits beansprucht')
                .setAuthor({ name: "Ticket System", iconURL: "https://i.imgur.com/Fqlf9Hg.png"})
                .setDescription("Dieses Ticket wurde bereits von " + originalClaimer.username + " beansprucht")
            
            await interaction.reply({ embeds: [ticketClaimedEmbed], ephemeral: true})
            return
        }
        await moduleUtil.createTicketClaim(userId, reason, moduleId, interaction.user.id)
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

