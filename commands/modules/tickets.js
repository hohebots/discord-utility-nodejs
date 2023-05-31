const { ChannelType, PermissionsBitField, RoleManager, ButtonStyle } = require("discord.js")
const moduleUtil = require("./util.js")
const randomstring = require("randomstring")
const clientStorage = require("../../util/client.js")
const config = require("../../config/load.js")
const { StringSelectMenuBuilder, SelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ApplicationCommandOptionWithChoicesAndAutocompleteMixin, ButtonBuilder } = require("@discordjs/builders")
const log = require("../../util/log.js")
const permissions = require("../../permissions/permissions.js")
const missingpermissions = require("../missingpermissions.js")

async function setup(interaction) {

    const moduleId = randomstring.generate(10)
    const moduleName = interaction.fields.getTextInputValue('name')

    const guild = interaction.guild
    conf = await config.load()
    

    overwrites = [{
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
    
    // creates category and main channel
    category = await guild.channels.create({
        name: moduleName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: overwrites
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
            new SelectMenuOptionBuilder()
                .setLabel(options[option].label)
                .setDescription(options[option].description)
                .setValue(options[option].name)
        );
    })



    const row = new ActionRowBuilder()
        .addComponents(select);


    const ticketCreationEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Ticket Erstellen')
        .setAuthor({ name: 'Ticket System', iconURL: 'https://i.imgur.com/8fviGN9.png'}) // todo: change icon
        .setDescription("Benutze die Schaltfläche um ein Ticket zu erstellen.")

        message = await mainChannel.send({ embeds: [ticketCreationEmbed], components: [row]})
        
    moduleUtil.setBoothMessage(moduleId, message.id)

    log.info("Module " + moduleId + " wurde erstellt")
    return true
}

async function createTicket(client, interaction, potentialModule) {
    const interactionUser = interaction.user
    const conf = await config.load()
    const guild = interaction.guild
    const ticketBooth = await moduleUtil.findTicketBooth(potentialModule.id)
    const response = interaction.values[0]
    const option = conf.modules.tickets.options[response]
    const reason = option.label

    let potentialTicket = await moduleUtil.findTicket(interactionUser.id, option.name, potentialModule.id)
 
    if (potentialTicket == null) {
        if (!await permissions.check(interaction.user.id, ticketBooth.openPermissions)) {
            await missingpermissions.run(interaction)
            return
        }   
    
        ticketChannel = await guild.channels.create({
            name: response + "-" + interactionUser.username,
            type: ChannelType.GuildText,
            parent: potentialModule.category,
            permissionOverwrites: [
                {
                    id: interactionUser.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                }
            ]
        })

        if (option == undefined) {
            log.error("Miskonfiguration: Optionsname und Optionspfad müssen gleich sein. Behebe diesen Fehler und lade das Modul neu")
            return
        } 
    
        const ticketEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle(reason + ' Ticket')
            .setAuthor({ name: interactionUser.username, iconURL: await interactionUser.displayAvatarURL()})
            .setDescription("Unser Support wurde kontaktiert, bitte habe Geduld.")

        const close = new ButtonBuilder()
			.setCustomId('closeTicket-'+interactionUser.id+"-"+potentialModule.id+"-"+option.name)
			.setLabel('Ticket schließen')
			.setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder()
			.addComponents(close);

        message = await ticketChannel.send({ embeds: [ticketEmbed], components: [row]})
    
        moduleUtil.createTicket(potentialModule.id, interactionUser.id, option.name, ticketChannel.id)
        

        const missingPermissionsEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Ticket wurde erstellt')
            .setAuthor({ name: 'Ticket System', iconURL: 'https://i.imgur.com/x3RsBWG.png'}) // change icon
            .setDescription("Dein Ticket wurde erstellt!")

        await interaction.reply({ embeds: [missingPermissionsEmbed], ephemeral: true})

    } else {
        log.warn("Nutzer " + interaction.user.username + " hat bereits ein offenes Ticket mit dem Grund " + reason)
        const ticketAlreadyOpenEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Ticket existiert bereits')
            .setAuthor({ name: 'Ticket System', iconURL: 'https://i.imgur.com/681yPtc.png'}) // change icon
            .setDescription('Du hast bereits ein offenes Ticket dieser Art.')

        await interaction.reply({ embeds: [ticketAlreadyOpenEmbed], ephemeral: true})
    }
}

async function closeTicket(buttonResponse, interaction) {
    userId = buttonResponse[1]
    moduleId = buttonResponse[2]
    reason = buttonResponse[3]
    
    guild = interaction.guild
    ticket = await moduleUtil.findTicket(userId, reason, moduleId)
    ticketChannel = guild.channels.cache.get(ticket.channel)
    ticketBooth = moduleUtil.findTicketBooth(moduleId)
    if (permissions.check(interaction.user.id, ticketBooth.closePermissions)) {
        moduleUtil.deleteTicket(userId, reason, moduleId)
        ticketChannel.delete()
    } else {
        missingpermissions.run(interaction)
    }
    
}

module.exports = {
    setup,
    createTicket,
    closeTicket
}

