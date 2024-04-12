const { EmbedBuilder } = require('discord.js')
const { SearchResult, GuildQueue } = require('discord-player')
const { ETYPE, SETTING } = require('./Fabric')
const { FOOTER_STR } = require('../utils/StringHelper')
const { convertSec } = require('./TimeHelper')

/**
 * 
 * @param {Object} options
 * @param {String} options.title
 * @param {String} options.desc
 * @param {import('discord.js').ColorResolvable} options.color
 * @param {String} options.type
 */
function MakeSimpleEmbed(options) {
    const res = new EmbedBuilder()
    if ((!options.title && !options.desc) || (options.title == '' && options.desc == '')) {
        res.setTitle('임베드 생성 실패')
    } else {
        // console.log(`${options.title}, ${options.desc}, ${options.color}, ${options.type}`)
        if (options.title) res.setTitle(options.title)
        if (options.desc) res.setDescription(options.desc)
        res.setColor(options.color ?? SETTING.EMBED_COLOR)
        if (options.type && FOOTER_STR.get(options.type)) res.setFooter({text: FOOTER_STR.get(options.type)})
    }
    return res
}

/**
 * 
 * @param {GuildQueue} queue 
 * @returns 
 */
function MakeNowPlayingEmbed(queue) {
    const track = queue.currentTrack
    try {
        const res = new EmbedBuilder()
        const title = track.title
        const channel = track.raw.channel
        const url = track.url
        let thumbnail = track.raw.thumbnail.url
        if (!thumbnail) thumbnail = track.thumbnail
        const views = track.views
        if (channel) {
            res.setAuthor({
                name: channel.name,
                iconURL: channel.icon.url,
                url: channel.url
            })
        }
        res.setColor(SETTING.EMBED_COLOR)
        res.setTitle(title)
        res.setDescription(queue.node.createProgressBar())
        res.setURL(url)
        if (thumbnail) res.setImage(thumbnail)
        res.setTimestamp()
        res.setFooter({ text: `${FOOTER_STR.get(ETYPE.MUSIC_PLAYER)}` })
        res.addFields(
            { name: queue.node.isPlaying() ? '▶️  지금 재생중' : '⏸️  일시정지됨', value: `\`${convertSec(Math.floor(queue.node.estimatedPlaybackTime / 1000))}\` / \`${convertSec(track.durationMS / 1000)}\``, inline: true },
            { name: '🎧  요청', value: `${track.requestedBy.user.toString()}`, inline: true },
            { name: '📋  남은 트랙 수', value: `${queue.size} (${convertSec(queue.estimatedDuration / 1000)})`, inline: true }
        )
        return res
    } catch (e) {
        return MakeSimpleEmbed({
            title: '오류가 발생했습니다',
            desc: '트랙 정보를 불러오는데 실패했습니다',
            color: 'Red',
            type: ETYPE.MUSIC_PLAYER
        })
    }
}

/**
 * 
 * @param {SearchResult} result 
 */
function MakeSearchResultEmbed(result) {
    const res = new EmbedBuilder()
    res.setColor(SETTING.EMBED_COLOR)
    if (result.tracks?.length) {
        if (result.queryType == 'youtubeVideo' || result.queryType == 'autoSearch') {
            const track = result.tracks[0]
            const title = track.title
            const channel = track.raw.channel
            const url = track.url
            let thumbnail = track.raw.thumbnail.url
            if (!thumbnail) thumbnail = track.thumbnail
            const duration = track.duration
            const views = track.views
            if (channel) {
                res.setAuthor({
                    name: channel.name,
                    iconURL: channel.icon.url,
                    url: channel.url
                })
            }
            res.setTitle(title)
            res.setURL(url)
            if (thumbnail) res.setImage(thumbnail)
            // views.toLocaleString('ko-KR')
            res.setFooter({ text: `${FOOTER_STR.get(ETYPE.MUSIC_PLAYER)}` })
            res.setDescription('트랙이 대기열에 추가됨')
        } else if (result.queryType == 'youtubePlaylist') {
            if (result.playlist) {
                res.setTitle(result.playlist.title)
                res.setURL(result.playlist.url)
                res.setAuthor({
                    name: result.playlist.author.name,
                    url: result.playlist.author.url
                })
                if (result.tracks[0].raw.thumbnail.url) {
                    res.setImage(result.tracks[0].raw.thumbnail.url)
                } else if (result.tracks[0].thumbnail) {
                    res.setImage(result.tracks[0].thumbnail)
                }
                let durationSum = 0
                result.tracks.forEach((track, idx) => durationSum += (track.durationMS / 1000))
                res.setDescription(`플레이리스트가 대기열에 추가됨`)
                res.addFields(
                    { name: '트랙 수', value: `\`${result.tracks.length}\` 개`, inline: true },
                    { name: `총 재생 시간`, value: `${convertSec(durationSum)}`, inline: true }
                )
                res.setFooter({ text: FOOTER_STR.get(ETYPE.MUSIC_PLAYER) })
            } else {
                // 플레이리스트 정보 없음
                res.setTitle('❌  플레이리스트를 추가할 수 없습니다')
                res.setDescription('플레이리스트 정보가 없습니다')
            }
        } else {
            res.setTitle('❌  트랙을 추가할 수 없습니다')
            res.setDescription('쿼리 결과가 유효하지 않습니다')
        }
    } else {
        // 트랙 정보가 없을때
        res.setTitle('❌  트랙을 추가할 수 없습니다')
        res.setDescription('트랙 정보가 유효하지 않습니다')
    }
    res.setTimestamp()
    return res
}

module.exports = { MakeNowPlayingEmbed, MakeSimpleEmbed, MakeSearchResultEmbed }