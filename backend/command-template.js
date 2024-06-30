const { SlashCommandBuilder, CommandInteraction, AutocompleteInteraction } = require('discord.js');

const data = new SlashCommandBuilder()
data.setName('command')
data.setDescription('desc')
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