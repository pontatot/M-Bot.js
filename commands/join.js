const { SlashCommandBuilder, SlashCommandChannelOption, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Joins a voice chat')
		.addChannelOption(new SlashCommandChannelOption().setName('voice_channel').setDescription('mention a voice channel').addChannelTypes(ChannelType.GuildVoice)),
	async execute(interaction) {
		let channel = await interaction.options.getChannel('voice_channel');
		if (!channel) {
			channel = interaction.member.voice.channel;
			if (!channel) {
				await interaction.reply({ content: 'No voice channel specified', ephemeral: true });
				return;
			}
		}
		joinVoiceChannel({
			channelId: channel.id,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		await interaction.reply('Joined <#' + channel.id + '>');
	},
};