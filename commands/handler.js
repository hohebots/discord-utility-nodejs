const { Client} = require("discord.js")
const ping = require("../commands/ping.js")
const benchmark = require("../commands/benchmark.js")
const config = require("../config/load.js")
const setup = require("../commands/setup.js")
const user = require("../commands/user.js")
const log = require("../util/log.js")
const permissions = require("../permissions/permissions.js")
const clientStorage = require("../util/client.js")
const missingpermissions = require("./missingpermissions.js")
const modalhandler = require("./modalhandler.js")
const buttonhandler = require("./handlers/buttonHandler.js")
const selectionhandler = require("./selectionhandler.js")
const nuke = require("./nuke.js")
async function handle(client, interaction) {

    if (interaction.isCommand()) {
        if (await permissions.check(interaction.user.id, await permissions.getCommandPermissions(interaction.commandName))) {
            const command = interaction.commandName;
            log.info("Command " + command + " wird ausgeführt")
            // commands
    
            if (command == "ping") {
                ping.run(client, interaction)
            } else if (command == "setup") {
                setup.run(client, interaction)
            } else if (command == "group") {
                setup.run(client, interaction)
            } else if (command == "benchmark") {
                benchmark.run(client, interaction)
            } else if (command == "user") {
                user.run(client, interaction)
            } else if (command == "nuke") {
                nuke.run(client, interaction)
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
        modalhandler.handle(client, interaction)

    } else if (interaction.isStringSelectMenu()) {
        selectionhandler.handle(client, interaction)
    
    } else if (interaction.isButton()) {
        buttonhandler.handle(interaction)
    }
}

module.exports = {
    handle: handle
}