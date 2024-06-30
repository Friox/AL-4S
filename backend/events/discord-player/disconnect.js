const { GuildQueue, Track } = require('discord-player')

/**
 * 
 * @param {GuildQueue} queue 
 * @param {Track} track 
 * @returns 
 */
function execute(queue, track) {
    // Emitted when the bot leaves the voice channel
	// queue.metadata.channel.send('Looks like my job here is done, leaving now!');
}

module.exports = {
    name: 'disconnect',
    execute
}