const { ButtonBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, SlashCommandStringOption, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const search = require('youtube-search');
const { youtubeApiKey } = require('../config.json');
const options = {
	maxResults: 10,
	key: youtubeApiKey,
	type: 'video',
};
const numbers = [
	'0️⃣',
	'1️⃣',
	'2️⃣',
	'3️⃣',
	'4️⃣',
	'5️⃣',
	'6️⃣',
	'7️⃣',
	'8️⃣',
	'9️⃣',
	'🔟'
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Searches youtube videos from keywords')
		.addStringOption(new SlashCommandStringOption()
			.setName('keywords')
			.setDescription('video title or keywords')
			.setRequired(true)
		),
	async execute(interaction) {
		const query = interaction.options.getString('keywords');
		const results = await search(query, options);
		const menu = new SelectMenuBuilder().setCustomId('search-menu').setPlaceholder('Choose the video');
		let i = 0;
		// console.log(results.results[0]);
		const formatted = results.results.map(e => {
			i++;
			menu.addOptions({
				emoji: numbers[i],
				value: 'query_' + i,
				label: e.title,
				description: e.channelTitle,
			});
			return numbers[i] + ' [' + e.title + '](' + e.link + ') - _' + e.channelTitle + '_';
		});
		const message = await interaction.reply({
			embeds: [new EmbedBuilder().addFields().setTitle('searches for ' + query).setColor('0x76a3f9').setDescription(formatted.join('\n'))],
			components: [new ActionRowBuilder().setComponents(menu)], fetchReply: true,
		});
		const collector = message.createMessageComponentCollector({
			filter: (u) => {
				return u.user.id === interaction.user.id;
			},
		});
		collector.on('collect', async (cld) => {
			if (cld.componentType === 3 && cld.customId === 'search-menu') {
				if (cld.values[0].slice(0, -1) != 'query_') return;
				const vid = results.results[cld.values[0].slice(6) - 1];
				cld.update({
					embeds: [new EmbedBuilder()
						.setTitle(vid.title)
						.setURL(vid.link)
						.setDescription(vid.description)
						.setThumbnail(vid.thumbnails.default.url)
						.setColor('0x76a3f9')
						.setFooter({ text: vid.channelTitle })],
					components: [
						new ActionRowBuilder().setComponents(menu),
						new ActionRowBuilder().setComponents(new ButtonBuilder()
							.setLabel('Add to queue')
							.setStyle(ButtonStyle.Primary)
							.setCustomId(vid.link))]
				});
			}
			if (cld.componentType === 2 && cld.customId.slice(0, 32) === 'https://www.youtube.com/watch?v=') {
				let connection = getVoiceConnection(interaction.guild.id);
				if (!connection) {
					const member = interaction.member;
					if (member.voice.channel) {
						connection = joinVoiceChannel({
							channelId: member.voice.channel.id,
							guildId: interaction.guild.id,
							adapterCreator: interaction.guild.voiceAdapterCreator,
						});
					}
					else {
						await message.reply('No voice channel specified');
						return;
					}
				}
				const player = createAudioPlayer();
				const video = await ytdl.getInfo(cld.customId);
				const ressource = createAudioResource(ytdl(cld.customId, { filter: 'audioonly' }));
				connection.subscribe(player);
				player.play(ressource);
				player.on(AudioPlayerStatus.Idle, () => { connection.destroy(); });
				await cld.update({ embeds: [new EmbedBuilder().setTitle('Now playing').setDescription('[' + video.player_response.videoDetails.title + '](' + cld.customId + ') in <#' + connection.joinConfig.channelId + '>').setThumbnail(video.player_response.videoDetails.thumbnail.thumbnails[0].url).setColor('0x76a3f9')], components: [] });
			}
		});
	},
};