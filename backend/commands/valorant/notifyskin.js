const { SlashCommandBuilder, CommandInteraction, AutocompleteInteraction } = require('discord.js');

const data = new SlashCommandBuilder()
data.setName('notifyskin')
data.setDescription('발로란트 상점에 원하는 스킨이 나오면 알림을 보내드립니다')
data.addStringOption(option => 
    option
    .setName('option')
    .setDescription('desc')
    .setRequired(true)
    .setAutocomplete(true)
)

/**
 * Command Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    interaction.reply('')
}

/**
 * Option AutoComplete
 * @param {AutocompleteInteraction} interaction 
 */
async function autocomplete(interaction) {
    interaction.respond([])
}

module.exports = { data, execute, autocomplete }