const { Client} = require("discord.js")
const ping = require("../commands/ping.js")
const config = require("../config/load.js")
const setup = require("../commands/setup.js")
const log = require("../util/log.js")
const permissions = require("../permissions/permissions.js")
const clientStorage = require("../util/client.js")
async function handle(client, interaction) {
    if (interaction.isChatInputCommand() && await permissions.check(interaction.user.id, await permissions.getCommandPermissions(interaction.commandName))) {
        console.log(interaction.command)
        const command = interaction.commandName;
        log.info("Command " + command + " wird ausgeführt")
        // commands

        if (command == "ping") {
            ping.run(client, interaction)
        } else if (command == "setup") {
            setup.run(client, interaction)
        } else if (command == "group") {
            setup.run(client, interaction)
        } 


    } else if (interaction.isAutocomplete()) {
        try {
            var choices = []
        
            const commandName = interaction.commandName
            const options = interaction.options
            const subcommandName = options.getSubcommand()
            const focused = await options.getFocused(true).name
            conf = await config.load()
            commands = conf.commands
            if (subcommandName != undefined) {
                configChoices = commands[commandName].subcommands[subcommandName].options[focused].choices
                Object.keys(configChoices).forEach(function(choice) {
                    choices.push({
                        name: choice,
                        value: configChoices[choice],
                    })
                })
            } else {
                configChoices = commands[commandName].options[focused].choices
                Object.keys(configChoices).forEach(function(choice) {
                    choices.push({
                        name: choice,
                        value: configChoices[choice],
                    })
                })
            }
            interaction.respond(choices);
            log.info("Autocomplete geschickt")
        } catch (e){
            log.error("Fehler bei Autocomplete request " + e)
        }
   
	}




    
}

module.exports = {
    handle: handle
}