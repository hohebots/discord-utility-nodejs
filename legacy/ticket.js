const {CLient, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { openticket } = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Create a Ticket message.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

async execute(interaction) {
    const { guild } = interaction; 

    const embed = new EmbedBuilder
    .setDescription("Open a ticket in the discord serevr.")

    const button = new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('member').setlabel('Report Member').setStyle(ButtonStyle.Danger).setEmoji('🙅‍♂️'),
        new ButtonBuilder().setCustomId('bug').setlabel('Report Bug').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
        new ButtonBuilder().setCustomId('bewerbungen').setlabel(' Bewerben Team/Partner').setStyle(ButtonStyle.Primary).setEmoji('🔖'),
        new ButtonBuilder().setCustomId('frage').setlabel('Frage/Anliegen').setStyle(ButtonStyle.Success).setEmoji('❔')
    );

    await guild.channels.cache.get(openticket).send({
        embeds: ([embed]),
        components: [
            button
        ]
    });

    interaction.reply({ content: "Ticket has been sent.", emphemeral: true});
} 
}

