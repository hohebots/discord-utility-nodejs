const log = require("./util/log.js")
const deploy = require("./commands/deploy.js")
const config = require("./util/config.js");
const database = require("./permissions/database.js")
const permissions = require("./permissions/permissions.js")
const handler = require("./handlers/commandHandler.js")
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
    client.once('ready', () => {
        log.info("Bot wurde gestartet.")
        clientStorage.setClientInstance(client)
    });

    client.on('interactionCreate', async interaction => {
        await interaction.guild.roles.fetch()
        await interaction.guild.channels.fetch()
        await interaction.guild.members.fetch()
        await interaction.deferReply({ephemeral: true});
        await handler.handle(interaction)
    });}

start()


// refactor: split util/tickets.js to tickets.js and ticketBooths.js 
// refactor: rename permissions directory
// refactor: subcommands folder for each command
// refactor: give every command a folder
// refactor: change file.js imports to file 
// todo: ticket system closeTicket mit abfrage
// todo: switch to better image uploader
// todo: redo module system so /setup autocompletes with all modules dynamically
// todo: implement response deferring
// todo: save open ticket modal responses in db so tickets.reload can recover them
// todo: optimsations regarding asynchronous running of commands