const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { useQueue } = require("discord-player");
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { MESSAGE } = require('../../utils/StringHelper')
const { convertSec } = require('../../utils/TimeHelper')

const data = new SlashCommandBuilder()
data.setName('jump')
data.setDescription('대기열을 건너뜁니다')
data.addNumberOption(option => 
    option
    .setName('idx')
    .setDescription('이동할 트랙 번호')
    .setRequired(true)
    .setMinValue(1)
)

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
        const idx = interaction.options.getNumber('idx', true);
        if (queue.tracks.size == 0) {
            // queue empty
            const embed = MakeSimpleEmbed({
                title: MESSAGE.JUMP_ER_2_TITLE,
                desc: MESSAGE.JUMP_ER_2_DESC,
                type: ETYPE.MUSIC_PLAYER
            })
            await interaction.reply({embeds: [embed], ephemeral: true})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        } else {
            if (idx > queue.tracks.size) {
                const embed = MakeSimpleEmbed({
                    title: MESSAGE.JUMP_ER_1_TITLE,
                    desc: `1 ~ ${queue.tracks.size} 사이의 번호를 입력해주세요`,
                    type: ETYPE.MUSIC_PLAYER
                })
                await interaction.reply({embeds: [embed], ephemeral: true})
                setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
            } else {
                const targetTrack = queue.tracks.toArray()[idx - 1]
                const res = queue.node.skipTo(targetTrack)
                if (res) {
                    // skip success
                    const embed = MakeSimpleEmbed({
                        title: `**#${String(idx).padStart(4, '0')}** 번 트랙으로 건너뜁니다`,
                        desc: `${targetTrack.title} \`${targetTrack.duration}\``,
                        type: ETYPE.MUSIC_PLAYER
                    })
                    embed.addFields(
                        { name: '📋  남은 트랙 수', value: `${queue.size} (${convertSec(queue.estimatedDuration / 1000)})` }
                    )
                    interaction.reply({embeds: [embed]})
                } else {
                    // skip fail
                    const embed = MakeSimpleEmbed({
                        title: MESSAGE.JUMP_ER_3_TITLE,
                        desc: MESSAGE.JUMP_ER_3_DESC,
                        type: ETYPE.MUSIC_PLAYER
                    })
                    await interaction.reply({embeds: [embed]})
                    setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
                }
            }
        }
    }
}

module.exports = { data, execute }