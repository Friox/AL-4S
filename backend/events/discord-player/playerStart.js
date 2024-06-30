const { GuildQueue, Track } = require('discord-player')
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE } = require('../../utils/Fabric')
const { convertSec } = require('../../utils/TimeHelper')

/**
 * 
 * @param {GuildQueue} queue 
 * @param {Track} track 
 * @returns 
 */
function execute(queue, track) {
    // Emitted when the player starts to play a song
	const embed = MakeSimpleEmbed({
		title: '🎵  다음 트랙을 재생합니다',
		desc: `[${track.title}](<${track.url}>) \`${track.duration}\``,
		type: ETYPE.MUSIC_PLAYER
	})
	embed.addFields(
		{ name: '📝  업로더', value: track.raw.channel.name ?? '알 수 없음', inline: true },
		{ name: '🎧  요청', value: `${track.requestedBy.user.toString()}`, inline: true },
		{ name: '📋  남은 트랙 수', value: `${queue.size} (${convertSec(queue.estimatedDuration / 1000)})`, inline: true }
	)
	embed.setThumbnail(track.raw.thumbnail.url)
	queue.metadata.channel.send({embeds: [embed]})
}

module.exports = {
    name: 'playerStart',
    execute
}