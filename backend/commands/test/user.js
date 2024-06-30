const { SlashCommandBuilder, Interaction } = require('discord.js');

const data = new SlashCommandBuilder()
data.setName('user')
data.setDescription('Provides information about the user.')

/**
 * 
 * @param {Interaction} interaction 
 */
async function execute(interaction) {
	await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
}

module.exports = { data, execute };