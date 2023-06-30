const Ticket = require("../models/Ticket")
const modules = require("./modules")
const permissions = require("../../permissions/permissions")
const TicketBooth = require("../models/TicketBooth")
const config = require("../../util/config")
const { StringSelectMenuBuilder, EmbedBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, channelLink } = require("@discordjs/builders")
const { ChannelType, PermissionsBitField, ButtonStyle } = require("discord.js")
const log = require("../../util/log")
const Waitlist = require("../models/Waitlist")
const kits = require("./kits")
const testers = require("./testers")


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
            moduleId: moduleId,
            testerStats: "0"})
            waitlist.save().then(() => log.info("MongoDB: Waitlist " + moduleId + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Waitlist " + moduleId + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function setTesterStats(moduleId, channelId) {
    waitlist = await find(moduleId)
    waitlist.testerStats = channelId
    waitlist.save()
}

async function refreshTesterStatsPerms(channel) {
    overwritePerms = [{
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    }]

    for (tester of await testers.getAll()) {
        try {
            await channel.guild.members.fetch(tester.id)
            overwritePerms.push({
                id: tester.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
            })
        } catch {}
    } 
    
    channel.permissionOverwrites.set(overwritePerms)
}

async function createTesterStatsChannel(category, moduleId) {
    // creates the channel
    guild = category.guild
    testerStatsChannel = await guild.channels.create({
        name: "tester-stats",
        type: ChannelType.GuildText,
        parent: category.id
    })

    // creates database entry for this booth
    await refreshTesterStatsPerms(testerStatsChannel)
    await setTesterStats(moduleId, testerStatsChannel.id)
    await find(moduleId)
    await sendTesterStats(moduleId, guild)
    return mainChannel
}

async function sendTesterStats(moduleId, guild) {
    waitlist = await find(moduleId)
  
    testerStats = waitlist.testerStats
    
    testerStatsChannel = await guild.channels.fetch(testerStats)
    testerList = "\n"
    allTesters = await testers.getAll()
    fetched = await testerStatsChannel.messages.fetch({limit: 100});


    // shut the fuck up i know all of this sucks
    testPointsArray = []
    for (const currentTester of allTesters) {
        testPointsArray.push(currentTester.testPoints)
    } 
    testPointsArray.sort(function (a, b) {  return a - b;  });
    testPointsArray = testPointsArray.reverse()

    testerStatsChannel.bulkDelete(fetched);
    alreadyChecked = []
    place = 1
    for (let i = 0; i < testPointsArray.length; i++) {
        if (!alreadyChecked.includes(testPointsArray[i])) {
            testPointTesters = await testers.findByTestPoints(testPointsArray[i])
            for (tester of testPointTesters) {
                testerList = testerList + place + ". " + tester.name + " " + tester.testPoints + "\n"
                place = place + 1
            }
            alreadyChecked.push(testPointsArray[i])
        }
    }
    const testerStatsEmbed = new EmbedBuilder()
        .setColor(0xFFFFFF ) // white
        .setTitle('**Tester Hall Of Fame**')
        .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/5JILqgw.png'})
        .setDescription(`Rangliste mit allen Testern, nach Testpunkten.\n
        Verdiene Testpunkte durch Tests!`)
        .addFields({ name: "Tester", value: testerList })
    message = await testerStatsChannel.send({ embeds: [testerStatsEmbed]})
}

async function findWaitlist(moduleId) {
    const waitlist = await Waitlist.findOne({moduleId: moduleId})
    return waitlist
}

async function sendWaitlistMessage(moduleId, mainChannel) {
    conf = await config.load()
    const select = new StringSelectMenuBuilder() // creates the select menu
        .setCustomId(moduleId+"-joinWaitlist")
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
        .setColor(0xFFFFFF ) // black
        .setTitle('**Tiertest Beantragen**')
        .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/5JILqgw.png'})
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
    find,
    createTesterStatsChannel,
    sendTesterStats
}