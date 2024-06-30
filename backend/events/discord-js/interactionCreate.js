const { Events, Interaction } = require('discord.js')

/**
 * 
 * @param {Interaction} interaction 
 */
async function execute(interaction) {
    // if (!interaction.isChatInputCommand()) return;
    interaction

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		if (interaction.isAutocomplete()) await command.autocomplete(interaction)
		else await command.execute(interaction)
	} catch (error) {
		console.log(error)
		if (!interaction.isAutocomplete()) {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	}
}

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute
}