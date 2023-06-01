const { Client} = require("discord.js")
const ping = require("../commands/ping.js")
const benchmark = require("../commands/benchmark.js")
const config = require("../util/config.js")
const setup = require("../commands/setup.js")
const user = require("../commands/user.js")
const log = require("../util/log.js")
const permissions = require("../permissions/permissions.js")
const nuke = require("../commands/nuke.js")
const buttonHandler = require("./buttonHandler.js")
const selectionHandler = require("./selectionHandler.js")
const modalHandler = require("./modalHandler.js")

async function handle(interaction) {

    if (interaction.isCommand()) {
        if (await permissions.check(interaction.user.id, await permissions.getCommandPermissions(interaction.commandName))) {
            const command = interaction.commandName;
            log.info("Command " + command + " wird ausgeführt")
            // commands
    
            if (command == "ping") {
                ping.run(interaction)
            } else if (command == "setup") {
                setup.run(interaction)
            } else if (command == "group") {
                setup.run(interaction)
            } else if (command == "benchmark") {
                benchmark.run(interaction)
            } else if (command == "user") {
                user.run(interaction)
            } else if (command == "nuke") {
                nuke.run(nteraction)
            } 
        } else {
            missingpermissions.run(interaction)
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

            if (focused == "permission") {
                allPermissions = await permissions.getAll()
                for (const permission of allPermissions) {
                    choices.push({
                        name: permission.name,
                        value: permission.id,
                    })
                }
                
            } else {
                if (subcommandName != undefined) {
                    configChoices = commands[commandName].subcommands[subcommandName].options[focused].choices
                    Object.keys(configChoices).forEach(function(choice) {
                        choices.push({
                            name: configChoices[choice],
                            value: choice,
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
            }
            interaction.respond(choices);
            log.info("Autocomplete geschickt")
        } catch (e){
            log.error("Fehler bei Autocomplete request " + e)
        }
   
	} else if (interaction.isModalSubmit()) {
        modalHandler.handle(interaction)

    } else if (interaction.isStringSelectMenu()) {
        selectionHandler.handle(interaction)
    
    } else if (interaction.isButton()) {
        buttonHandler.handle(interaction)
    }
}

module.exports = {
    handle: handle
}