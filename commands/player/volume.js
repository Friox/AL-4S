const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { useQueue } = require("discord-player");
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { MESSAGE } = require('../../utils/StringHelper')

const data = new SlashCommandBuilder()
data.setName('volume')
data.setDescription('플레이어의 볼륨을 조절합니다, 값을 입력하지 않으면 현재 볼륨을 표시합니다')
data.addNumberOption(option => 
    option
    .setName('value')
    .setDescription('설정할 볼륨값 (0 ~ 100, 기본값: 20)')
    .setRequired(false)
    .setMinValue(0)
    .setMaxValue(100)
)

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue) {
        const embed = MakeSimpleEmbed({
            title: MESSAGE.VOLUME_ER_TITLE,
            desc: MESSAGE.VOLUME_ER_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    } else {
        const value = interaction.options.getNumber('value', false)
        if (value) {
            queue.node.setVolume(value)
            const embed = MakeSimpleEmbed({
                title: `🔊  \`${value}\``,
                desc: `볼륨이 조절되었습니다 (요청: ${interaction.member.toString()})`,
                type: ETYPE.MUSIC_PLAYER
            })
            interaction.reply({embeds: [embed]})
        } else {
            const embed = MakeSimpleEmbed({
                title: `🔊  현재 볼륨: \`${queue.node.volume}\``,
                type: ETYPE.MUSIC_PLAYER
            })
            interaction.reply({embeds: [embed], ephemeral: true})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        }
    }
}

module.exports = { data, execute }