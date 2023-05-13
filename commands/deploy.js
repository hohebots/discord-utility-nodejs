const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require("../config/load.js")
const log = require("../util/log.js")

async function commands() {
    const conf = await config.load()
    const settings = conf.settings.auth
    const configCommands = conf.commands
    var commands = []

    
    Object.keys(configCommands).forEach(function(commandName) {
        
        try {
            // adds basic command descriptors to the command body
            var command = new SlashCommandBuilder()
            .setName(configCommands[commandName]["name"])
            .setDescription(configCommands[commandName]["description"])
        
            // goes through all subcommands and appends their properties to the command body
            if (configCommands[commandName]["subcommands"] != undefined) {
                Object.keys(configCommands[commandName]["subcommands"]).forEach(function(subCommandName) {
                    if (configCommands[commandName]["subcommands"][subCommandName]["autoComplete"] == undefined) {
                        var autoComplete = false
                    } else {
                        var autoComplete = configCommands[commandName]["subcommands"][subCommandName]["autoComplete"]
                    }
                    command = command.addStringOption(option =>
                        option.setName(configCommands[commandName]["subcommands"][subCommandName]["name"])
                            .setDescription(configCommands[commandName]["subcommands"][subCommandName]["description"])
                            .setAutocomplete(autoComplete))
                })
            }
            
            commands.push(command)
            log.info("Command " + commandName + " wurde geladen")
        } catch (e) {
            log.error("Command " + commandName + " konnte nicht geladen werden: " + e)
        }
        
    })
    
    commands = commands.map(command => command.toJSON());

    const rest = new REST({ version: '9' }).setToken(settings["token"]);

    rest.put(Routes.applicationGuildCommands(settings["clientId"], settings["guildId"]), { body: commands })
        .then(() => log.info("Commands wurden erfolgreich registriert"))
        .catch(console.error);
}

module.exports = {
    commands: commands
}