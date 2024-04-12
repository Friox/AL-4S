const { GuildQueue } = require('discord-player')

/**
 * 
 * @param {GuildQueue} queue 
 * @returns 
 */
function execute(queue) {
    // Emitted when the voice channel has been empty for the set threshold
	// Bot will automatically leave the voice channel with this event
	// queue.metadata.channel.send(`Leaving because no vc activity for the past 5 minutes`);
}

module.exports = {
    name: 'emptyChannel',
    execute
}