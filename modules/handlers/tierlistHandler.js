const { ChannelType, PermissionsBitField, RoleManager, ButtonStyle, TextInputStyle } = require("discord.js")
const waitlists = require("../util/waitlists.js")
const kits = require("../util/kits.js")
const tests = require("../util/tests.js")
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

    mainChannel = await waitlists.createWaitlistChannel(category, moduleId) // creates the ticket booth
    waitlistMessage = await waitlists.sendWaitlistMessage(moduleId, mainChannel) // sends the ticket creation message

    // creates database entry for booth and ticket module
    if (!modules.create(moduleId, "tierlist", moduleName, mainChannel.id, category.id)) {
        return false
    }
    log.info("Module " + moduleId + " wurde erstellt")
    return true
}


async function initTest(interaction, potentialModule) { // todo: make this prettier
    const interactionUser = interaction.user
    const client = clientStorage.getClientInstance()
    const response = interaction.values[0]
    const kit = kits.find(response)
    const kitName = kit.name
    const waitlist = await waitlists.find(potentialModule.id)
    const potentialTest = await tests.find(interactionUser.id, kit.id)
    
    if (!await permissions.check(interaction.user.id, waitlist.joinPermissions)) {
        await missingPermissions.run(interaction)
        return
    }   

    if (potentialTest != null) {
        log.warn("Nutzer " + interaction.user.username + " hat bereits einen offenen Test im Kit " + kit.id)
        const TestAlreadyOpenEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Du hast bereits einen offenen Test')
            .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/Fqlf9Hg.png'})
            .setDescription('Du hast bereits einen offenen Test mit diesem Kit')

        await interaction.reply({ embeds: [TestAlreadyOpenEmbed], ephemeral: true})
        return
    }
    const row = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId("ingameName")
            .setLabel("Was ist dein Minecraft ingame Name?")
            .setStyle("Short")
            .setMaxLength(16),
        new TextInputBuilder()
            .setCustomId("estimatedTier")
            .setLabel("In welchem Tier schätzt du dich ein? (S+ bis F-)")
            .setStyle("Short")
            .setMaxLength(2)
    ) 

    const testCreationModal = new ModalBuilder()
        .setCustomId('createTest-'+interactionUser.id+"-"+kit.id)
        .setTitle('Warteschlange beitreten')
        .addComponents(row)

    await interaction.showModal(testCreationModal)
}

async function createInactiveTest() {
    
}

module.exports = {
    setup,
    initTest
}