const config = require("../util/config.js")
const log = require("../util/log.js")
const permissions = require("../permissions/permissions.js")
const groups = require("../permissions/groups.js")
const modules = require("../modules/util/modules.js")

async function handle(interaction) {
    var choices = []
    const commandName = interaction.commandName
    const options = interaction.options
    try {
        subcommandName = options.getSubcommand()
    } catch {
        subcommandName = undefined
    }
    
    const focused = await options.getFocused(true).name
    conf = await config.load()
    commands = conf.commands

    // preset bot variables
    if (focused == "permission") {
        allPermissions = await permissions.getAll()
        for (const permission of allPermissions) {
            choices.push({
                name: permission.name,
                value: permission.id,
            })
        }
    
    } else if (focused == "group") {
        allGroups = await groups.getAll()
        for (const group of allGroups) {
            if (group.name == null) {
                group.name = group.id
            }
            if (group.id == null) {
                group.id = "Fehler"
            }

            choices.push({
                name: group.name,
                value: group.id,
            })
        }

    } else if (focused == "module") {
        allModules = await modules.getAll()
        for (const module of allModules) {
            if (module.name == null) {
                module.name = module.id
            }
            if (module.id == null) {
                module.id = "Fehler"
            }

            choices.push({
                name: module.name,
                value: module.id,
            })
        }
        
    // custom config variables
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
    await interaction.respond(choices);
    log.info("Autocomplete geschickt")
}

module.exports = {
    handle: handle
}