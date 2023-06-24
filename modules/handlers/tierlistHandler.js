const { ChannelType, PermissionsBitField, RoleManager, ButtonStyle, TextInputStyle } = require("discord.js")
const waitlists = require("../util/waitlists.js")
const kits = require("../util/kits.js")
const tests = require("../util/tests.js")
const testers = require("../util/testers.js")
const modules = require("../util/modules.js")
const testAcceptionChannels = require("../util/testAcceptionChannels.js")
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

    mainChannel = await waitlists.createWaitlistChannel(category, moduleId) // creates the waitlist channel
    waitlistMessage = await waitlists.sendWaitlistMessage(moduleId, mainChannel) // sends the test creation message
    acceptionChannel = await testAcceptionChannels.createChannel(category, moduleId)
    acceptMessage = await testAcceptionChannels.sendAcceptMessage(moduleId, mainChannel)
    testerStatsChannel = await waitlists.createTesterStatsChannel(category, moduleId)
    // creates database entry for tierlist module
    if (!modules.create(moduleId, "tierlist", moduleName, mainChannel.id, category.id)) {
        return false
    }
    log.info("Module " + moduleId + " wurde erstellt")
    return true
}


async function showTestOptions(interaction, potentialModule) {
    const interactionUser = interaction.user
    const response = interaction.values[0]
    const test = await tests.get(response)
    const waitlist = await waitlists.find(potentialModule.id)
    const acceptionChannel = await testAcceptionChannels.find(potentialModule.id)
    const discordAcceptionChannel = await interaction.guild.channels.fetch(acceptionChannel.channelId)
    const kit = await kits.find(test.kit)

    if (!await permissions.check(interaction.user.id, acceptionChannel.acceptPermissions)) {
        await missingPermissions.run(interaction)
        return
    }   

    if (test == null) {
        log.warn("Test wurde nicht gefunden.")
        const TestAlreadyOpenEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Test nicht gefunden')
            .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/Fqlf9Hg.png'})
            .setDescription('Dieser Test existiert nicht')

        await interaction.reply({ embeds: [TestAlreadyOpenEmbed], ephemeral: true})
        return
    }

    const testOptionsEmbed = new EmbedBuilder()
            .setColor(0xFFFFFF) // white
            .setTitle('Test Verwaltung')
            .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/Fqlf9Hg.png'})

    const denyTestButton = new ButtonBuilder()
        .setCustomId('denyTest-'+test.id)
        .setLabel('Test ablehnen')
        .setStyle(ButtonStyle.Danger)
        .setEmoji({
            id: "1113870514763595806"}) 

    const acceptTestButton = new ButtonBuilder()
            .setCustomId('acceptTest-'+test.id)
            .setLabel('Test akzeptieren')
            .setStyle(ButtonStyle.Success)
            .setEmoji({
                id: "1113870451781943296"}) 
        
    const row = new ActionRowBuilder()
        .addComponents([acceptTestButton, denyTestButton]);

    message = await interaction.reply({embeds: [testOptionsEmbed], components: [row], ephemeral: true})
}


async function initTest(interaction, potentialModule) { // todo: make this prettier
    const interactionUser = interaction.user
    const client = clientStorage.getClientInstance()
    const response = interaction.values[0]
    const kit = await kits.find(response)
    const waitlist = await waitlists.find(potentialModule.id)
    const potentialTest = await tests.find(interactionUser.id, kit.id, potentialModule.id)
    
    if (!await permissions.check(interaction.user.id, waitlist.joinPermissions)) {
        await missingPermissions.run(interaction)
        return
    }   

    if (potentialTest != null) {
        if (await tests.alreadyExists(potentialTest.id)) {
            log.warn("Nutzer " + interaction.user.username + " hat bereits einen offenen Test im Kit " + kit.id)
            const TestAlreadyOpenEmbed = new EmbedBuilder()
                .setColor(0xED4245) // discord red
                .setTitle('Du hast bereits einen offenen Test')
                .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/Fqlf9Hg.png'})
                .setDescription('Du hast bereits einen offenen Test mit diesem Kit')

            await interaction.reply({ embeds: [TestAlreadyOpenEmbed], ephemeral: true})
            return
        }
    }

    const ingameNameRow = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId("ingameName")
            .setLabel("Was ist dein Minecraft ingame Name?")
            .setStyle("Short")
            .setMaxLength(16),
    )
    const estimatedTierRow = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId("estimatedTier")
            .setLabel("In welchem Tier schätzt du dich? (S+ - F-)")
            .setStyle("Short")
            .setMaxLength(2)
    ) 

    const testCreationModal = new ModalBuilder()
        .setCustomId('createTest-'+interactionUser.id+"-"+waitlist.moduleId+"-"+kit.id)
        .setTitle('Warteschlange beitreten')
        .addComponents([ingameNameRow, estimatedTierRow])

    await interaction.showModal(testCreationModal)
}


async function setTester(interaction, potentialModule) {
    
    const testerId = interaction.values[0]
    const selectionResponse = interaction.customId.split("-")
    const testId = selectionResponse[2]
    const test = await tests.get(testId)
    const kit = await kits.find(test.kit)

    client = clientStorage.getClientInstance()
    testUser = await client.users.fetch(test.user)
    testerUser = await client.users.fetch(testerId)
    kitName = kit.name
    tester = await testers.find(testerId)
    testerTier = await testers.getTier(testerId, test.kit)
    estimatedUserTier = test.estimatedTier

    
    await tests.setState(testId, "active")
    await testAcceptionChannels.updateAcceptMessage(potentialModule.id)

    if (test.testChannel == "0") {
        testChannel = await tests.createTestChannel(testId, interaction.guild, testerId) 
    } else {
        testChannel = await interaction.guild.channels.fetch(test.testChannel)
        tests.switchTester(interaction.guild, testId, testerId)
    }
    
    const testEmbed = new EmbedBuilder()
        .setColor(0xFFFFFF) // discord green
        .setTitle(kitName + ' Tier Test')
        .setAuthor({ name: "Tierlist" }) // , iconURL:
        .setDescription(testerUser.toString() + 
            " *IGN*: **"+ tester.name  + 
            "** *T*: **"+ testerTier + 
            "** vs " + 
            testUser.toString() + 
            " *IGN*: **" + test.ingameName + 
            "** *T*: **" + estimatedUserTier + "**")
        
    const acceptTestButton = new ButtonBuilder()
        .setCustomId('finishTest-'+test.id)
        .setLabel('Test fertigstellen')
        .setStyle(ButtonStyle.Success)
        .setEmoji({
            id: "1113870451781943296"})

    const rejectTestButton = new ButtonBuilder()
            .setCustomId('rejectTest-'+test.id)
            .setLabel('Test schließen')
            .setStyle(ButtonStyle.Danger)
            .setEmoji({
                id: "1113870466961129603"}) 
    
    const repeatTestButton = new ButtonBuilder()
        .setCustomId('repeatTest-'+test.id)
        .setLabel('Test wiederholen')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji({
            id: "1121477529551773776"}) 
    
    const changeTesterButton = new ButtonBuilder()
        .setCustomId('switchTester-'+test.id)
        .setLabel('Tester wechseln')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji({
            id: "1121477529551773776"}) 
    
            
    const row = new ActionRowBuilder()
        .addComponents([acceptTestButton, rejectTestButton, repeatTestButton, changeTesterButton]);

    message = await testChannel.send({ embeds: [testEmbed], components: [row], content: "||@everyone||"})
    const interactionSuccessEmbed = new EmbedBuilder()
            .setColor(0xFFFFFF) // white
            .setTitle('Test angenommen')
            .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/jErEqVp.png'})
            .setDescription("Der Test wurde angenommen.")
    await interaction.reply({ embeds: [interactionSuccessEmbed], ephemeral: true})
}

async function rejectTest(interaction) {
    buttonResponse = interaction.customId.split("-")
    testId = buttonResponse[1]
    test = await tests.get(testId)
    acceptionChannel = await testAcceptionChannels.find(test.moduleId)
    acceptPermisisons = acceptionChannel.acceptPermisisons
    testChannel = await interaction.guild.channels.fetch(test.testChannel)

    if (!await permissions.check(interaction.user.id, acceptionChannel.acceptPermissions)) {
        await missingPermissions.run(interaction)
        return
    }  

    await tests.setState(testId, "closed")
    await tests.setCompleted(testId)
    await testChannel.delete()

    return
}

async function repeatTest(interaction) {
    buttonResponse = interaction.customId.split("-")
    testId = buttonResponse[1]
    test = await tests.get(testId)
    acceptionChannel = await testAcceptionChannels.find(test.moduleId)
    acceptPermisisons = acceptionChannel.acceptPermisisons
    testChannel = await interaction.guild.channels.fetch(test.testChannel)

    if (!await permissions.check(interaction.user.id, acceptionChannel.acceptPermissions)) {
        await missingPermissions.run(interaction)
        return
    }  

    await testers.incrementPoints(test.tester)
    waitlists.sendTesterStats(test.moduleId, interaction.guild)
    await testAcceptionChannels.sendTesterSelectionMessage(interaction, testId)
    
    return
}

async function switchTester(interaction) {
    buttonResponse = interaction.customId.split("-")
    testId = buttonResponse[1]
    test = await tests.get(testId)
    acceptionChannel = await testAcceptionChannels.find(test.moduleId)
    acceptPermisisons = acceptionChannel.acceptPermisisons
    testChannel = await interaction.guild.channels.fetch(test.testChannel)

    if (!await permissions.check(interaction.user.id, acceptionChannel.acceptPermissions)) {
        await missingPermissions.run(interaction)
        return
    }  

    await testAcceptionChannels.sendTesterSelectionMessage(interaction, testId)
    
    return
}

async function finishTest(interaction) {
    buttonResponse = interaction.customId.split("-")
    testId = buttonResponse[1]
    test = await tests.get(testId)
    acceptionChannel = await testAcceptionChannels.find(test.moduleId)
    if (!await permissions.check(interaction.user.id, acceptionChannel.acceptPermissions)) {
        await missingPermissions.run(interaction)
        return
    }   
    const finalTierRow = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId("finalTier")
            .setLabel("Welches Tier hat dieser Nutzer?")
            .setStyle("Short")
            .setMaxLength(2),
    )
    const ingameNameRow = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId("finalIngameName")
            .setLabel("Was ist der Minecraft-Name des Nutzers?")
            .setStyle("Short")
            .setMaxLength(16)
    ) 

    const testFinalisationModal = new ModalBuilder()
        .setCustomId('finaliseTest-'+testId)
        .setTitle('Test abschicken')
        .addComponents([finalTierRow, ingameNameRow])

    await interaction.showModal(testFinalisationModal)

    return
}

async function enterTestResults(interaction, modalResponse, testInfo) {
    finalTier = testInfo.getTextInputValue("finalTier")
    finalIngameName = testInfo.getTextInputValue("finalIngameName")
    testId = modalResponse[1]
    test = await tests.get(testId)
    
    testChannel = await interaction.guild.channels.fetch(test.testChannel)
    await tests.setState(testId, "closed")
    await tests.setCompleted(testId)
    await testers.incrementPoints(test.tester)
    waitlists.sendTesterStats(test.moduleId, interaction.guild)
    await tests.setFinalTier(testId, finalTier)
    await testChannel.delete()
}

async function createInactiveTest(interaction, modalResponse, testInfo) { // todo: make this prettier
    module = await modules.find(modalResponse[2])
    waitlist = await waitlists.find(module.id)
    client = clientStorage.getClientInstance()
    const interactionUser = interaction.user
    const guild = interaction.guild
    const kit = await kits.find(modalResponse[3])
    const kitName = kit.name    
    
    if (option == undefined) {
        log.error("Miskonfiguration: Optionsname und Optionspfad müssen gleich sein. Behebe diesen Fehler und lade das Modul neu")
        return
    }
    inactiveTest = await tests.create(module.id, interaction.user.id, kit.id, testInfo.getTextInputValue("estimatedTier"), testInfo.getTextInputValue("ingameName"))

    const interactionSuccessEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Test eingetragen!')
        .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/jErEqVp.png'})
        .setDescription("Du wurdest der Tierlistwarteschlange hinzugefügt")

    await testAcceptionChannels.updateAcceptMessage(module.id)
    await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
}

async function acceptTest(interaction) {
    buttonResponse = interaction.customId.split("-")
    testId = buttonResponse[1]
    test = await tests.get(testId)

    if (test.state != "inactive"){
        const testNotInactive = new EmbedBuilder()
            .setColor(0xFFFFFF) // white
            .setTitle('Test ist bereits aktiv!')
            .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/jErEqVp.png'})
            .setDescription("Dieser Test konnte nicht angenommen werden, da er bereits existiert.")

            await interaction.reply({ embeds: [testNotInactive], ephemeral: true})
        return  
    }
    
    await testAcceptionChannels.sendTesterSelectionMessage(interaction, testId)
}

async function denyTest(interaction) {
    buttonResponse = interaction.customId.split("-")
    testId = buttonResponse[1]
    test = await tests.get(testId)
    tests.deny(testId)
    const interactionSuccessEmbed = new EmbedBuilder()
        .setColor(0xFFFFFF) // white
        .setTitle('Test abgelehnt!')
        .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/jErEqVp.png'})
        .setDescription("Test wurde abgelehnt.")   
    testAcceptionChannels.updateAcceptMessage(test.moduleId)
    await interaction.reply({ embeds: [interactionSuccessEmbed], ephemeral: true})
}

module.exports = {
    setup,
    initTest,
    createInactiveTest,
    acceptTest,
    showTestOptions,
    denyTest,
    setTester,
    finishTest,
    enterTestResults,
    rejectTest,
    repeatTest,
    switchTester
}