const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { useQueue } = require("discord-player");
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { MESSAGE } = require('../../utils/StringHelper')

const data = new SlashCommandBuilder()
data.setName('pause')
data.setDescription('플레이어를 일시정지합니다')

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue) {
        const embed = MakeSimpleEmbed({
            title: MESSAGE.PAUSE_ER_TITLE,
            desc: MESSAGE.PAUSE_ER_DESC,
            type: ETYPE.MUSIC_PLAYER,
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    } else {
        const status = queue.node.isPlaying()
        queue.node.setPaused(!queue.node.isPaused())
        const embed = MakeSimpleEmbed({
            title: status ? MESSAGE.PAUSE_STATUS_1 : MESSAGE.PAUSE_STATUS_2,
            desc: MESSAGE.PAUSE_STATUS_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    }
}

module.exports = { data: data, execute }