const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { updateValorantInfo } = require('../../utils/ValorantHelper')

const data = new SlashCommandBuilder()
data.setName('valinfoupdate')
data.setDescription('발로란트 스킨 데이터를 새로고침합니다')

/**
 * Command Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    await interaction.deferReply()
    const res = await updateValorantInfo()
    if (res) {
        const embed = MakeSimpleEmbed({
            title: '🟢  업데이트 완료',
            desc: '데이터베이스 업데이트 완료'
        })
        interaction.editReply({embeds: [embed]})
    } else {
        const embed = MakeSimpleEmbed({
            title: '🔴  업데이트 실패',
            desc: '데이터베이스 업데이트 실패'
        })
        interaction.editReply({embeds: [embed]})
    }
}

module.exports = { data, execute }