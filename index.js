const log = require("./util/log.js")
const deploy = require("./commands/deploy.js")
const config = require("./util/config.js");
const database = require("./permissions/database.js")
const permissions = require("./permissions/permissions.js")
const handler = require("./handlers/commandHandler.js")
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
    
    deploy.commands()
    database.connect()
    database.startLogger()
    permissions.initPresetPermissions()
    await bans.startCheckExpiredTask()

    client.once('ready', () => {
        log.info("Bot wurde gestartet.")
        clientStorage.setClientInstance(client)
    });

    client.on('interactionCreate', async interaction => {
        await interaction.guild.roles.fetch()
        await interaction.guild.channels.fetch()
        await interaction.guild.members.fetch()
        await handler.handle(interaction)
    });}

start()

// refactor: move functions from info.js to util
// refactor: split util/tickets.js to tickets.js and ticketBooths.js 
// refactor: rename permissions directory
// refactor: subcommands folder for each command
// refactor: give every command a folder
// refactor: change file.js imports to file 
// todo: switch to better image uploader
// todo: redo module system so /setup autocompletes with all modules dynamically
// todo: save open ticket modal responses in db so tickets.reload can recover them
// todo: optimsations regarding asynchronous running of commands
// todo: comment everything and do documentation
// todo: replace all get from cache instances with .fetch() for better overall performance
// todo: fix /tickets view permission removal
// todo: fix version.json