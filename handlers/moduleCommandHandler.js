const log = require("../util/log.js")
const failed = require("../commands/failed.js")
const modules = require("../modules/util/modules.js")
const ticketsCommand = require("../commands/moduleCommands/tickets/index.js")
const shopCommand = require("../commands/moduleCommands/shop/index.js")
const noModuleFound = require("../commands/moduleCommands/noModuleFound.js")
async function handle(interaction) {
    const command = interaction.commandName
    // commands
    if (await modules.activeModuleExists(command)) {
        try {
            if (command == "tickets") {
                await ticketsCommand.run(interaction)
            } else if (command == "shop") {
                await shopCommand.run(interaction)
            }

        } catch (e) {
            await failed.run(interaction, e)
            log.error(e)
            return
        }
    } else {
        await noModuleFound.run(interaction)
    }
    
}

module.exports = {
    handle: handle
}