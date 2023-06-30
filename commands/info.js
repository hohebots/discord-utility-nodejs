const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const version = require("../util/version")
const { EmbedBuilder } = require("@discordjs/builders");
const { getClientInstance } = require("../util/client.js");

async function run(interaction) {
    const client = getClientInstance()
    const beforeAll = Date.now()
    const botLatency = interaction.createdTimestamp - beforeAll
    const discordJsVersion = Discord.version;
    const nodeJsVersion = process.version;
    const botVersion = version.load()
    // Usage example
    const projectPath = '../';
    const totalLines = countLinesInProject(projectPath);
    
    // todo: finish this 
    const interactionSuccessEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Info')
        .setAuthor({ name: 'Bot', iconURL: 'https://i.imgur.com/pKsq653.png'})
        .addFields({ 
          name: "Bot",
          value: "*Discord API Latenz*: " + client.ws.ping + 
            "ms\n *Bot Latenz*: " + botLatency + "ms\n" +
            "*Zeilen an Code*: " + totalLines + 
            "\n*Uptime*: " + formatUptime(client.uptime),
          inline: true })
          
        .addFields({ 
          name: "Version",
          value: "*discordjs*: v"+discordJsVersion+"\n*nodejs*: " + nodeJsVersion+"\n*bot*: v" + botVersion,
          inline: true })

        .addFields({ 
          name: "Developer",
          value: "@hoehe.dev\nwww.höhe.dev",
          inline: false })

    await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
}


function countLinesInProject(directory) {
  let lineCount = 0;

  function traverseDirectory(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (file !== 'node_modules') {
          traverseDirectory(filePath); // Recursive call for subdirectories
        }
      } else if (stat.isFile() && path.extname(file) === '.js') {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n').length;
        lineCount += lines;
      }
    });
  }

  traverseDirectory(directory);
  return lineCount;
}

function formatUptime(uptime) {
  const seconds = Math.floor((uptime / 1000) % 60);
  const minutes = Math.floor((uptime / (1000 * 60)) % 60);
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
    run: run
}