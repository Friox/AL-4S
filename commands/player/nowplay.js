const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { useQueue } = require("discord-player");
const { MakeNowPlayingEmbed, MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { MESSAGE } = require('../../utils/StringHelper')

const data = new SlashCommandBuilder()
data.setName('nowplaying')
data.setDescription('현재 재생중인 트랙 정보를 표시합니다')

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue) {
        const embed = MakeSimpleEmbed({
            title: MESSAGE.NOWPLAY_ER_TITLE,
            desc: MESSAGE.NOWPLAY_ER_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    } else {
        const embed = MakeNowPlayingEmbed(queue)
        await interaction.reply({embeds: [embed], ephemeral: true})
    }
}

module.exports = { data: data, execute }