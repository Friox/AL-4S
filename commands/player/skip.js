const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { useQueue } = require("discord-player");
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { MESSAGE } = require('../../utils/StringHelper')

const data = new SlashCommandBuilder()
data.setName('skip')
data.setDescription('현재 재생중인 트랙을 건너뜁니다')

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue) {
        const embed = MakeSimpleEmbed({
            title: MESSAGE.SKIP_ER_TITLE,
            desc: MESSAGE.SKIP_ER_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    } else {
        queue.node.skip()
        const embed = MakeSimpleEmbed({
            title: MESSAGE.SKIP_STATUS_1,
            desc: MESSAGE.SKIP_STATUS_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    }
}

module.exports = { data, execute }