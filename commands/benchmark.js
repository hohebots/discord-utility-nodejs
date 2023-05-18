const groups = require("../permissions/groups.js")
const User = require("../permissions/models/User.js")
const config = require("../config/load.js")
const users = require("../permissions/users.js")
const permissions = require("../permissions/permissions.js")

const log = require("../util/log.js")
const { EmbedBuilder } = require("@discordjs/builders")


async function run(client, interaction) {
    conf = config.load()
    beforeAll = Date.now()
    const botLatency = interaction.createdTimestamp - beforeAll
    var callsMade = 0
    if (interaction.options.getSubcommand() == "start") {
        iterations = interaction.options.getString("iterations")

        log.info("Benchmark: Starte Datenbank Benchmark")
        
        for (let i = 0; i < iterations; i++) { 
            beforeSingle = Date.now()
            callsMade = callsMade + 1
            dbUsers = await User.find()
            for (const dbUser of dbUsers) {
                for (const permission of dbUser.permissions) {
                    callsMade = callsMade + 1
                    await permissions.find(permission)
                }
                for (const group of dbUser.groups) {
                    callsMade = callsMade + 1
                    dbGroup = await groups.find(group)
                    for (const permission of dbGroup.permissions) {
                        callsMade = callsMade + 1
                        await permissions.find(permission)
                    }
                }
            }
        }
        afterAll = Date.now()
        const missingPermissionsEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Benchmark abgeschlossen')
            .setAuthor({ name: 'Benchmark', iconURL: 'https://i.imgur.com/x3RsBWG.png'})
            .setDescription("Benchmark Ergebnisse:")
            .addFields({ name: 'Datenbank',
             value: "*Gesamte Zeit:* " + (afterAll - beforeAll) + 
             "ms\n *Durchschnittlicher cycle:* " + (afterAll - beforeAll)/iterations + 
             "ms\n *Gemachte Abrufe:* " + callsMade + 
             "\n Abrufe pro Sekunde: " + Number((callsMade/(afterAll - beforeAll)*1000).toFixed(1)),
             inline: true })

            .addFields({ name: "Latenz",
            value: "*Discord API Latenz*: " + client.ws.ping + 
            "ms\n *Bot Latenz*: " + botLatency + "ms",
            inline: true })

        await interaction.reply({ embeds: [missingPermissionsEmbed], ephemeral: true})
        log.info("Benchmark: Datenbank Benchmark beendet. Gesamte Zeit: " + (afterAll - beforeAll) + "ms, durchschnittlicher cycle: " + (afterAll - beforeAll)/iterations + "ms. Gemachte Abrufe: " + callsMade)
    }
    
    

    

    
}

module.exports = {
    run: run
}