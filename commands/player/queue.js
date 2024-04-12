const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { useQueue } = require('discord-player')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { MESSAGE } = require('../../utils/StringHelper')
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { convertSec } = require('../../utils/TimeHelper')

const data = new SlashCommandBuilder()
data.setName('queue')
data.setDescription('현재 대기열 목록을 표시합니다')
data.addNumberOption(option =>
    option
    .setName('idx')
    .setDescription('페이지 번호')
    .setMinValue(1)
)

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const queue = useQueue(interaction.guild.id)
    const page = interaction.options.getNumber('idx') ?? 1
    if (!queue) {
        const embed = MakeSimpleEmbed({
            title: MESSAGE.QUEUE_ER_1_TITLE,
            desc: MESSAGE.QUEUE_ER_1_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    } else {
        const tracks = queue.tracks.toArray()
        if (tracks.length > 0) {
            const pageIC = 10
            const startIdx = (page - 1) * pageIC + 1
            const endIdx = (page * pageIC)
            const pageC = Math.floor(tracks.length / pageIC) + 1
            if (page > pageC || page < 1) {
                const embed = MakeSimpleEmbed({
                    title: MESSAGE.QUEUE_ER_2_TITLE,
                    desc: `1 ~ ${pageC} 사이의 수를 입력해주세요`,
                    type: ETYPE.MUSIC_PLAYER
                })
                await interaction.reply({embeds: [embed], ephemeral: true})
                setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
            } else {
                let listStr = `${page} 페이지 표시중 (**#${String(startIdx).padStart(4, '0')}** ~ **#${String(endIdx > tracks.length ? tracks.length : endIdx).padStart(4, '0')}**, ${pageC} 페이지 까지 있음)\n\n`
                tracks.slice(startIdx - 1, startIdx + pageIC - 1).forEach((track, idx) => {
                    if (idx) listStr += '\n'
                    listStr += `**#${String(startIdx + idx).padStart(4, "0")}** : ${track.title}  \`${track.duration}\``
                })
                const embed = MakeSimpleEmbed({
                    title: `📋  현재 대기열 (총 ${tracks.length} 항목, ${convertSec(queue.estimatedDuration / 1000)})`,
                    desc: listStr,
                    type: ETYPE.MUSIC_PLAYER
                })
                await interaction.reply({embeds: [embed], ephemeral: true})
            }
        } else {
            const embed = MakeSimpleEmbed({
                title: MESSAGE.QUEUE_ER_3_TITLE,
                desc: MESSAGE.QUEUE_ER_3_DESC,
                type: ETYPE.MUSIC_PLAYER
            })
            await interaction.reply({embeds: [embed], ephemeral: true})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        }
    }
}

module.exports = { data, execute }