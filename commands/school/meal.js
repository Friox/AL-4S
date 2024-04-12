const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { getMealEmbed } = require('../../utils/MealHelper')

const data = new SlashCommandBuilder()
data.setName('meal')
data.setDescription('학식 정보')
data.addStringOption(option =>
    option
    .setName('date')
    .setDescription('날짜(YYYYMMDD)')
    .setRequired(false)
    .setMinLength(8)
    .setMaxLength(8)
)

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const today = new Date()
    const param = interaction.options.getString('date')
    if (param && param.length == 8) {
        const year = parseInt(param.slice(0, 4))
        const month = parseInt(param.slice(4, 6))
        const day = parseInt(param.slice(6, 8))
        today.setFullYear(year)
        today.setMonth(month - 1)
        today.setDate(day)
    }
    const embed = await getMealEmbed(today)
    await interaction.reply({
        embeds: [embed],
        ephemeral: false
    })
}

module.exports = { data, execute }