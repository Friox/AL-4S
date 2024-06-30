const { Events, Client } = require('discord.js')

/**
 * 
 * @param {Client} client 
 */
function execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute
}