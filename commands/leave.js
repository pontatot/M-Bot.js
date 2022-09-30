const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leaves voice chat'),
	async execute(interaction) {
		const connection = getVoiceConnection(interaction.guild.id);
		if (connection) {
			const channelId = connection.joinConfig.channelId;
			connection.destroy();
			await interaction.reply('Left <#' + channelId + '>');
		}
		else {
			await interaction.reply({ content: 'Not connected', ephemeral: true });
		}
	},
};