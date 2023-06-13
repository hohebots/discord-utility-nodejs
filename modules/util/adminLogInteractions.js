const clientStorage = require("../../util/client");
const config = require("../../util/config");
const Module = require("../models/Module");

async function send(state, message) {
    conf = await config.load()
    guildId = conf.settings.auth.guildId 
    const client = await clientStorage.getClientInstance()
    const guild = await client.guilds.fetch(guildId)
    allAdminLogs = await Module.find({type: "adminLog"})
    for (adminLog of allAdminLogs) {
        try {
            discordChannel = await guild.channels.fetch(adminLog.mainChannel)
            switch (state) {
                case "error":
                    await discordChannel.send("`ERROR: " + message + "`")
                    break;
                case "info":
                    await discordChannel.send("`INFO: " + message+ "`")
                    break
                case "warn":
                    await discordChannel.send("`WARNING: " + message+ "`")
                    break;
            }
        }
        catch {
            break
        }
    }
}

module.exports = {
    send
}