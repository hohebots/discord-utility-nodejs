const { Client} = require("discord.js")
const ping = require("../commands/ping.js")
const setup = require("../commands/setup.js")
const log = require("../util/log.js")

async function handle(command, client, interaction) {

    if (interaction.isChatInputCommand()) {
        // commands
        if (command == "ping") {
            ping.run(client, interaction)
            log.info("Command " + command + " wurde ausgeführt")
            
        } else if (command == "setup") {
            setup.run(client, interaction)
            log.info("Command " + command + " wurde ausgeführt")
        } 


    } else if (interaction.isAutocomplete()) {
        // autocomplete request
        log.info("asd")
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			log.error("Command " + interaction.commandName + " wurde nicht gefunden");
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	}




    
}

module.exports = {
    handle: handle
}