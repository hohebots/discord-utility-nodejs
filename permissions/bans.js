const clientStorage = require("../util/client")
const config = require("../util/config")
const log = require("../util/log")
const Ban = require("./models/Ban")
const misc = require("../util/misc")
const { EmbedBuilder } = require("@discordjs/builders")

async function create(userId, reason, expirationTimestamp, bannedBy) {
    if (await find(userId) == null) {
        bannedOn = Date.now()
        const ban = new Ban({userId: userId, reason: reason, expirationTimestamp: expirationTimestamp, bannedBy: bannedBy, bannedOn: bannedOn})
        ban.save().then(() => log.info("MongoDB: Ban " + reason + " gespeichert"))
    } else {
        log.warn("MongoDB: Ban " + reason + " konnte nicht erstellt werden. Existiert bereits")
    }
}

async function find(userId) { // returns ban entry in db by userid
    const ban = await Ban.findOne({userId: userId})
    return ban
}

async function getExpired() {
    const currentDate = Date.now();
    expiredBans = await Ban.find({ expirationTimestamp: { $lte: currentDate } }).exec();
    return expiredBans
}

async function checkExpired() {
    client = clientStorage.getClientInstance()
    conf = await config.load()
    guildId = conf.settings.auth.guildId
    guild = client.guilds.cache.get(guildId)

    try {
        expiredBans = await getExpired()
        for (const ban of expiredBans) {
            if (ban.expirationTimestamp != "0") {
                user = await client.users.fetch(ban.userId)
                await guild.members.unban(ban.userId);
                await deleteBan(ban.userId)
                log.info("Bann von " + user.username + " ist nun ausgelaufen.", adminRelevant = true)
                const userUnbanEmbed = new EmbedBuilder()
                    .setColor(0xED4245) // discord green
                    .setTitle('Dein Bann auf ' + conf.settings.auth.guildName + ' ist ausgelaufen!')
                    .setAuthor({ name: 'Banns', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
                
                try {
                    await client.users.send(ban.userId, {embeds: [userUnbanEmbed]});
                } catch {}
                expiredBans = await getExpired()
            }
        }
    } catch (error) {
        log.error("Ein Fehler ist beim Laden eines ausgelaufenen Banns aufgetreten: " + error)
    }
  }

async function startCheckExpiredTask() {
    setInterval(checkExpired, 60 * 1000 * 60);
}

async function deleteBan(userId) {
    ban = find(userId)
    if (ban == null) {
        return false
    }
    await Ban.findOneAndDelete({userId: userId})
    log.info("MongoDB: Ban " + ban.reason + " wurde gelöscht")
    return true
}

module.exports = {
    create,
    find,
    startCheckExpiredTask
}