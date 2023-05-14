const log = require("./util/log.js")
const deploy = require("./commands/deploy.js")
const config = require("./config/load.js");
const database = require("./permissions/database.js")
const permissions = require("./permissions/permissions.js")
const handler = require("./commands/handler.js")
const { Client } = require("discord.js")

async function start() {
    const conf = await config.load()    
    const settings = conf.settings["auth"]
    const client = new Client({ intents: [] });

    client.login(settings["token"]);
    deploy.commands()
    database.connect()
    database.startLogger()
    permissions.initPresetPermissions()
    
    client.once('ready', () => {
        log.info("Bot wurde gestartet.")
    });

    client.on('interactionCreate', async interaction => {
        const { commandName } = interaction;
        handler.handle(commandName, client, interaction)
    });
}

start()