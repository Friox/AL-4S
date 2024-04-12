const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { useQueue } = require("discord-player");
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { MESSAGE } = require('../../utils/StringHelper')

const data = new SlashCommandBuilder()
data.setName('stop')
data.setDescription('플레이어를 정지합니다')

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue) {
        const embed = MakeSimpleEmbed({
            title: MESSAGE.STOP_ER_TITLE,
            desc: MESSAGE.STOP_ER_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    } else {
        const status = queue.node.isPlaying()
        queue.delete()
        const embed = MakeSimpleEmbed({
            title: MESSAGE.STOP_STATUS_1,
            desc: MESSAGE.STOP_STATUS_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    }
}

module.exports = { data, execute }