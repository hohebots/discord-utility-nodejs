const log = require("./util/log.js")
const deploy = require("./commands/deploy.js")
const config = require("./util/config.js");
const database = require("./permissions/database.js")
const permissions = require("./permissions/permissions.js")
const handler = require("./handlers/commandHandler.js")
const memberLeaveHandler = require("./handlers/memberLeaveHandler.js")
const api = require("./api/index.js")
const bans = require("./permissions/bans.js")
const clientStorage = require("./util/client.js")
const { Client, GatewayIntentBits } = require("discord.js")

async function start() {

    const conf = await config.load()    
    const settings = conf.settings["auth"]
    const client = new Client({ 
        intents: [
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildEmojisAndStickers
        ]
    });

    await client.login(settings["token"]);
    
    api.start()
    deploy.commands()
    database.connect()
    database.startLogger()
    permissions.initPresetPermissions()
    guild = await client.guilds.fetch(settings.guildId)

    await bans.startCheckExpiredTask()
    
    client.once('ready', () => {
        log.info("Bot wurde gestartet.")
        clientStorage.setClientInstance(client)
        guild.roles.fetch()
        guild.channels.fetch()
        guild.members.fetch()
    });

    client.on('interactionCreate', async interaction => {
        try {
            await handler.handle(interaction)
        } catch (e){
            log.error(e)
        }
        
        interaction.guild.roles.fetch()
        interaction.guild.channels.fetch()
        interaction.guild.members.fetch()
    })
    
    client.on('guildMemberRemove', async member => { // use this to check if tierlist user has left
        await memberLeaveHandler.handle(member)
    });
    
    ;}

start()