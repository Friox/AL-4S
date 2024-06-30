const { GuildQueue } = require('discord-player')

/**
 * 
 * @param {GuildQueue} queue 
 * @param {String} message 
 * @returns 
 */
async function execute(queue, message) {
    // Emitted when the player queue sends debug info
    // Useful for seeing what state the current queue is at
    if (false) console.log(`Player debug event: ${message}`);
}

module.exports = {
    name: 'debug',
    execute
}