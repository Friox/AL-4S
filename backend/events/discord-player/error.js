const { GuildQueue } = require('discord-player')
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE } = require('../../utils/Fabric')

/**
 * 
 * @param {GuildQueue} queue 
 * @param {Error} error
 * @returns 
 */
function execute(queue, error) {
    console.log(error)
    const embed = MakeSimpleEmbed({
        title: '오류가 발생했습니다',
        desc: '이건 나도 모르는 오류인데요...',
        color: 'Red',
        type: ETYPE.MUSIC_PLAYER
    })
    queue.metadata.channel.send({embeds: [embed]})
}

module.exports = {
    name: 'error',
    execute
}