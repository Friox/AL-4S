const { GuildQueue } = require('discord-player')
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE } = require('../../utils/Fabric')

/**
 * 
 * @param {GuildQueue} queue 
 * @returns 
 */
function execute(queue) {
	// Emitted when the player queue has finished
	// queue.metadata.channel.send('Queue finished!');
	const embed = MakeSimpleEmbed({
		title: '✅  대기열의 모든 트랙을 재생했습니다',
		type: ETYPE.MUSIC_PLAYER
	})
	queue.metadata.channel.send({embeds: [embed]});
}

module.exports = {
    name: 'emptyQueue',
    execute
}