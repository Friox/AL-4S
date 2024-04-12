const { GuildQueue, Track } = require('discord-player')

/**
 * 
 * @param {GuildQueue} queue 
 * @param {Track} track 
 * @returns 
 */
function execute(queue, track) {
    // Emitted when the audio player fails to load the stream for a song
	// queue.metadata.channel.send(`Skipping **${track.title}** due to an issue!`);
	/*
	const embed = MakeSimpleEmbed({
		title: '⏭️  오류가 발생했습니다',
		desc: '현재 재생중인 트랙을 건너뜁니다',
		type: ETYPE.MUSIC_PLAYER
	})
	*/
	// queue.metadata.channel.send({embeds: [embed]});
}

module.exports = {
    name: 'playerSkip',
    execute
}