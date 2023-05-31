const log = require("./util/log.js")
const deploy = require("./commands/deploy.js")
const config = require("./config/load.js");
const database = require("./permissions/database.js")
const permissions = require("./permissions/permissions.js")
const handler = require("./commands/handler.js")
const clientStorage = require("./util/client.js")
const { Client, GatewayIntentBits } = require("discord.js")

async function start() {

    const conf = await config.load()    
    const settings = conf.settings["auth"]
    const client = new Client({ 
        intents: [
            GatewayIntentBits.GuildMembers
        ] });

    await client.login(settings["token"]);
    
    deploy.commands()
    database.connect()
    database.startLogger()
    permissions.initPresetPermissions()
    client.once('ready', () => {
        log.info("Bot wurde gestartet.")
        clientStorage.setClientInstance(client)
    });

    client.on('interactionCreate', async interaction => {
        await interaction.guild.roles.fetch()
        await interaction.guild.channels.fetch()
        await interaction.guild.members.fetch()
        handler.handle(client, interaction)
    });}

start()



// todo: redo all icons and switch to better image uploader
// todo: redo module system so /setup autocompletes with all modules dynamically
// todo: config options for setting icons for embeds
// todo: implement response deferring
// refactor: rename load.js to config.js and move it to util
// refactor: rename client.js to clientStorage.js because it nervs extremst
// refactor: remove client argument from all interactions