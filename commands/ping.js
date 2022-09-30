const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Calculates the latency of the bot'),
	async execute(interaction) {
		await interaction.reply('Pong!');
		const message = await interaction.fetchReply();
		const ping = (message.createdTimestamp - interaction.createdTimestamp);
		console.log('current ping: ' + ping + ' ms');
		await interaction.editReply(ping + ' ms');
	},
};