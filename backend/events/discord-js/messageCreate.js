const { Events, Message } = require('discord.js')

const banWords = []

/**
 * 
 * @param {String} str 
 */
function checkMessage(str) {
	for (let i = 0; i < banWords.length; i++) {
		if (str.includes(banWords[i])) return true
	}
	return false
}

/**
 * 
 * @param {Message} message 
 */
function execute(message) {
    if (message.author.bot) return
    if (checkMessage(message.content)) {
        message.delete()
        message.channel.send(`${message.member.toString()} 너 무슨말을 하는거니?...`)
    }
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    execute
}