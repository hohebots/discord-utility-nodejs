const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } = require('@discordjs/builders');
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
        configCommand = configCommands[commandName]
        try {
            // adds basic command descriptors to the command body
            var command = new SlashCommandBuilder()
                .setName(configCommand["name"])
                .setDescription(configCommand["description"])
            
            options = configCommand.options
            if (options != undefined) {
                Object.keys(configCommand["options"]).forEach(function(optionName) {
                    command = smartAddOption(configCommand, optionName, command, configCommand["options"][optionName].type) // cycles through all provided options adds all them one by one (reusable for subcommands!!! yay!!)
                })
            }
            
            // goes through all subcommands and appends their properties to the command body
            if (configCommand.subcommands != undefined) {

                Object.keys(configCommand.subcommands).forEach(function(subCommandName) {
                    configSubcommand = configCommand.subcommands[subCommandName]                    
                    command = smartAddSubcommand(configSubcommand, command)
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



function smartAddOption(configCommand, optionName, command, type) { // todo: implement .setRequired(bool) and types
    option = configCommand.options[optionName]

    if (option.autoComplete == undefined) {
        var autoComplete = false
    } else {
        var autoComplete = option.autoComplete
    }
    
    optionName = option["name"]
    optionDescription = option["description"]
    
    if (type == undefined || type == "string") {
        return command.addStringOption(option => 
            option
                .setName(optionName)
                .setDescription(optionDescription)
                .setAutocomplete(autoComplete))
    } else if (type == "user") {
        return command.addUserOption(option => 
            option
                .setName(optionName)
                .setDescription(optionDescription)
                .setAutocomplete(autoComplete))
    } else if (type == "role") {
        return command.addRoleOption(option => 
            option
                .setName(optionName)
                .setDescription(optionDescription)
                .setAutocomplete(autoComplete))
    }
    
}

function smartAddSubcommand(configSubCommand, command) {
    var subcommand = new SlashCommandSubcommandBuilder()
            .setName(configSubcommand["name"])
            .setDescription(configSubcommand["description"])

    if (configSubcommand["options"] != undefined) {
        Object.keys(configSubcommand["options"]).forEach(function(optionName) {
            subcommand = smartAddOption(configSubCommand, optionName, subcommand) // cycles through all provided options adds all them one by one (reusable for subcommands!!! yay!!)
        })
    }
    

    return command.addSubcommand(subcommand)
}
 
module.exports = {
    commands: commands
}