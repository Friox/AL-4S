const { GuildQueue, Track } = require('discord-player')

/**
 * 
 * @param {GuildQueue} queue 
 * @param {Track} track 
 * @returns 
 */
function execute(queue, track) {
    // Emitted when the player adds a single song to its queue
	// queue.metadata.channel.send(`Track **${track.title}** queued`);
}

module.exports = {
    name: 'audioTrackAdd',
    execute
}