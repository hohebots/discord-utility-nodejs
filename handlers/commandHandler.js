const { Client} = require("discord.js")
const ping = require("../commands/ping.js")
const benchmark = require("../commands/benchmark.js")
const setup = require("../commands/setup.js")
const user = require("../commands/user/index.js")
const log = require("../util/log.js")
const permissions = require("../permissions/permissions.js")
const nuke = require("../commands/nuke.js")
const buttonHandler = require("./buttonHandler.js")
const selectionHandler = require("./selectionHandler.js")
const modalHandler = require("./modalHandler.js")
const failed = require("../commands/failed.js")
const autoCompleteHandler = require("./autoCompleteHandler.js")
const missingPermissions = require("../commands/missingPermissions.js")
const group = require("../commands/group/index.js")
const config = require("../util/config.js")
const moduleCommandHandler = require("./moduleCommandHandler.js")
const info = require("../commands/info.js")


async function handle(interaction) {
    conf = config.load()
    if (interaction.isCommand()) {
        if (await permissions.check(interaction.user.id, await permissions.getCommandPermissions(interaction.commandName))) {
            const command = interaction.commandName
            log.info("Command " + command + " wird ausgeführt")
            // commands
            try {
                if (command == "ping") {
                    await ping.run(interaction)
                } else if (command == "setup") {
                    await setup.run(interaction)
                } else if (command == "group") {
                    await group.run(interaction)
                } else if (command == "benchmark") {
                    await benchmark.run(interaction)
                } else if (command == "user") {
                    await user.run(interaction)
                } else if (command == "nuke") {
                    await nuke.run(interaction)
                } else if (command == "nuke") {
                    await nuke.run(interaction)
                } else if (command == "info") {
                    await info.run(interaction)
                } else if (conf.modules[command]){
                    await moduleCommandHandler.handle(interaction)
                }
            } catch (e) {
                failed.run(interaction, e)/
                log.error(e)
                return
            }
            
        } else {
            await missingPermissions.run(interaction)
        }
  


    } else if (interaction.isAutocomplete()) {
        try {
            await autoCompleteHandler.handle(interaction)
        } catch (e){
            log.error("Fehler bei Autocomplete request " + e)
        }
   
	} else if (interaction.isModalSubmit()) {
        try {
            await modalHandler.handle(interaction)
        } catch (e){
            log.error("Fehler bei Modal request " + e)
        }

    } else if (interaction.isStringSelectMenu()) {
        try {
            await selectionHandler.handle(interaction)
        } catch (e){
            log.error("Fehler bei Selection request " + e)
        }
    
    } else if (interaction.isButton()) {
        try {
            await buttonHandler.handle(interaction)
        } catch (e){
            log.error("Fehler bei Button request " + e)
        }
    }
}

module.exports = {
    handle: handle
}