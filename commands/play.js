const {
  SlashCommandBuilder,
  SlashCommandChannelOption,
  ChannelType,
  SlashCommandStringOption,
  EmbedBuilder,
} = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays music in a voice chat")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("url")
        .setDescription("music url or keywords")
        .setRequired(true)
    )
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName("voice_channel")
        .setDescription("mention a voice channel")
        .addChannelTypes(ChannelType.GuildVoice)
    ),
  async execute(interaction) {
    let channel = await interaction.options.getChannel("voice_channel");
    if (!channel) {
      const member = await interaction.guild.members.fetch(
        interaction.member.id
      );
      if (member.voice.channel) {
        channel = member.voice.channel;
      } else {
        await interaction.reply({
          content: "No voice channel specified",
          ephemeral: true,
        });
        return;
      }
    }
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    const url = interaction.options.getString("url");
    const player = createAudioPlayer();
    const video = await ytdl.getInfo(url);
    const ressource = createAudioResource(ytdl(url, { filter: "audioonly" }));
    connection.subscribe(player);
    player.play(ressource);
    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Now playing")
          .setDescription(
            "[" +
              video.player_response.videoDetails.title +
              "](" +
              video.videoDetails.video_url +
              ") in <#" +
              channel.id +
              ">"
          )
          .setThumbnail(
            video.player_response.videoDetails.thumbnail.thumbnails[0].url
          )
          .setColor("0x76a3f9"),
      ],
    });
  },
};
