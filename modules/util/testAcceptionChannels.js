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
const tests = require("./tests")
const testers = require("./testers")
const TestAcceptionChannel = require("../models/TestAcceptionChannel")
const Test = require("../models/Test")
const clientStorage = require("../../util/client")

async function createChannel(category, moduleId) {
    // creates the channel
    guild = category.guild
    mainChannel = await guild.channels.create({
        name: "accept-tests",
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
            }
        ]
    })

    // creates database entry for this booth
    await create(moduleId, mainChannel.id)
    return mainChannel
}

async function create(moduleId, channelId) {
    if (await find(moduleId) == null) {
        const channel = new TestAcceptionChannel({
            moduleId: moduleId,
            channelId: channelId,
            acceptPermissions: ["admin"],
            acceptMessage: "0"})
            channel.save().then(() => log.info("MongoDB: testAcceptionChannel " + moduleId + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: testAcceptionChannel " + moduleId + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function find(moduleId) {
    const acceptionChannel = await TestAcceptionChannel.findOne({moduleId: moduleId})
    return acceptionChannel
}
async function updateAcceptMessage(moduleId) {
    client = clientStorage.getClientInstance()
    acceptionChannel = await find(moduleId)
    acceptMessage = acceptionChannel.acceptMessage
    conf = await config.load()
    guildId = conf.settings.auth.guildId
    guild = client.guilds.cache.get(guildId)
    discordAcceptionChannel = await guild.channels.fetch(acceptionChannel.channelId)
    message = await discordAcceptionChannel.messages.fetch(acceptMessage)
    message.delete()
    await sendAcceptMessage(moduleId, discordAcceptionChannel)
    
}
async function sendAcceptMessage(moduleId, mainChannel) {
    client = await clientStorage.getClientInstance()
    conf = await config.load()
    const select = new StringSelectMenuBuilder() // creates the select menu
        .setCustomId(moduleId+"-acceptTest")
        .setPlaceholder('Welcher Test soll bearbeitet werden?')
        
    earliestTests = await getEarliestTests(moduleId)
    for (test of earliestTests) {
        testUser = await client.users.fetch(test.user)
        kit = await kits.find(test.kit) 
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(testUser.username)
                .setValue(test.id)
                .setDescription("Kit: " + kit.name + ", Tier: " + test.estimatedTier + ", IGN: " + test.ingameName)
                .setEmoji({
                    id: kit.iconEmoji})
        )
    }

    if (earliestTests.length == 0) {
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("-")
                .setValue("invalidTest")
                .setEmoji({
                    id: "1113870466961129603"})
        );
    }

    row = new ActionRowBuilder()
        .addComponents(select);

    // sends the acceptMessage
    const joinWaitlistEmbed = new EmbedBuilder()
        .setColor(0x000000 ) // black
        .setTitle('**Tests Verwalten**')
        .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/ZqUCHT7.png'})
        .setDescription(`Benutze das Menü um die Tests zu verwalten.`)


    message = await mainChannel.send({ embeds: [joinWaitlistEmbed], components: [row]})
    setAcceptionMessage(moduleId, message.id)
    return message
}

async function setAcceptionMessage(moduleId, messageId) {
    channel = await find(moduleId)
    if (channel == null) {
        return false
    } else {
        channel.acceptMessage = messageId
        channel.save()
        return true
    }
}

async function sendTestOptionsMessage(test, acceptionChannel) {
    client = await clientStorage.getClientInstance()
    testUser = await client.users.fetch(test.id)
    const ticketEmbed = new EmbedBuilder()
        .setColor(0x000000) // discord green
        .setTitle('Test')
        .setAuthor({ name: testUser.name, iconURL: await testUser.displayAvatarURL()})
        .setDescription("Welche Aktion möchtest du durchführen?")
        
    const acceptTestButton = new ButtonBuilder()
        .setCustomId('acceptTest-'+test.id)
        .setLabel('Test Akzeptieren')
        .setStyle(ButtonStyle.Success)
        .setEmoji({
            id: "1113870514763595806"}) // ticket_red

    const rejectTestButton = new ButtonBuilder()
            .setCustomId('rejectTest-'+test.id)
            .setLabel('Ticket beanspruchen')
            .setStyle(ButtonStyle.Danger)
            .setEmoji({
                id: "1113870451781943296"}) // ticket_green
        
    const row = new ActionRowBuilder()
        .addComponents([acceptTestButton, rejectTestButton]);

    message = await acceptionChannel.send({ embeds: [ticketEmbed], components: [row]})
}

async function getEarliestTests(moduleId) {
    const allTests = await Test.find({ state: "inactive", moduleId: moduleId}).sort({ createdAt: 1 }).limit(5)
    const earliestEntries = [];
    for (test of allTests) {
        earliestEntries.push(test);
    }
    return earliestEntries
}

async function sendTesterSelectionMessage(interaction, testId) {
    test = await tests.get(testId)
    kit = test.kit
    kitTesters = await testers.getKit(kit)
    select = new StringSelectMenuBuilder() // creates the select menu
        .setCustomId(test.moduleId+"-setTester-"+testId)
        .setPlaceholder('Welcher Tester soll zugewiesen werden??')
    
    for (tester of kitTesters) {
        testerUser = await interaction.guild.members.fetch(tester.id)
        tier = await testers.getTier(tester.id, kit)
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(testerUser.user.username)
                .setValue(testerUser.id)
                .setDescription("Tier: " + tier + ", Punkte: " + tester.testPoints)
                .setEmoji({
                    id: kit.iconEmoji})
        )
    }

    if (kitTesters.length == 0) {
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("-")
                .setValue("invalidTester")
                .setEmoji({
                    id: "1113870466961129603"})
        );
    }

    row = new ActionRowBuilder()
        .addComponents(select);

    chooseTesterEmbed = new EmbedBuilder()
        .setColor(0x000000 ) // black
        .setTitle('**Tester Auswählen**')
        .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/ZqUCHT7.png'})
        .setDescription(`Benutze das Menü um den Tester auszuwählen.`)

    message = await interaction.reply({ embeds: [chooseTesterEmbed], components: [row], ephemeral: true})
}

module.exports = {
    createChannel,
    create,
    find,
    sendAcceptMessage,
    updateAcceptMessage,
    sendTestOptionsMessage,
    sendTesterSelectionMessage
}