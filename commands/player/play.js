const { SlashCommandBuilder, CommandInteraction, AutocompleteInteraction } = require('discord.js');
const { useMainPlayer } = require('discord-player')
const { MakeSimpleEmbed, MakeSearchResultEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { MESSAGE } = require('../../utils/StringHelper')

const data = new SlashCommandBuilder()
data.setName('play')
data.setDescription('유튜브 영상을 재생합니다')
data.addStringOption(option =>
    option
    .setName('query')
    .setDescription('재생할 영상또는 플레이리스트 주소 (검색어 입력가능, 입력 후 기다리면 자동완성)')
    .setRequired(true)
    .setAutocomplete(true)
)

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const player = useMainPlayer();

    const channel = interaction.member.voice.channel;
    if (!channel) {
        const embed = MakeSimpleEmbed({
            title: MESSAGE.PLAY_ER_1_TITLE,
            desc: MESSAGE.PLAY_ER_1_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.reply({embeds: [embed], ephemeral: true});
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        return
    }

    let query = interaction.options.getString('query', true);
    if (SETTING.PLAYER_FAKE_ENABLE) {
        if (Math.random() < SETTING.PLAYER_FAKE_PERCENTAGE) {
            query = SETTING.PLAYER_FAKE_STREAM
        }
    }

    await interaction.deferReply();

    try {
        const { searchResult, track } = await player.play(channel, query, {
            nodeOptions: {
                metadata: interaction,
                disableBiquad: true,
                disableEqualizer: true,
                volume: 25,
                bufferingTimeout: 10000,
                skipOnNoStream: true,
                disableHistory: true,
            },
        });
        searchResult.setRequestedBy(interaction.member)
        const embed = MakeSearchResultEmbed(searchResult)
        interaction.editReply({embeds: [embed]});
    } catch (e) {
        const embed = MakeSimpleEmbed({
            title: MESSAGE.PLAY_ER_2_TITLE,
            desc: MESSAGE.PLAY_ER_2_DESC,
            type: ETYPE.MUSIC_PLAYER
        })
        await interaction.editReply({embeds: [embed], ephemeral: true})
        setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
    }
}

/**
 * AutoComplete
 * @param {AutocompleteInteraction} interaction 
 */
async function autocomplete(interaction) {
    const query = interaction.options.getString('query', true);
    if (query.length < 1) {
        await interaction.respond([])
    } else {
        const player = useMainPlayer()
        const searchResults = await player.search(query)
        if (searchResults.tracks.length == 0) {
            await interaction.respond([])
        } else {
            if (searchResults.queryType == 'youtubeVideo') {
                await interaction.respond([
                    {
                        name: `💿  영상: ${searchResults.tracks[0].title}`,
                        value: searchResults.tracks[0].url
                    }
                ])
            } else if (searchResults.queryType == 'youtubePlaylist') {
                if (searchResults.playlist) {
                    await interaction.respond([
                        {
                            name: `📋  플레이리스트: ${searchResults.playlist.title}`,
                            value: searchResults.playlist.url
                        }
                    ])
                } else {
                    await interaction.respond([])
                }
            } else if (searchResults.queryType == 'autoSearch') {
                const filteredResults = searchResults.tracks.slice(0, 5).map((track) => ({
                    name: `💿  ${track.title}`,
                    value: track.url
                }))
                if (!filteredResults || filteredResults.length == 0) await interaction.respond([])
                else await interaction.respond(filteredResults)
            } else {
                await interaction.respond([])
            }
        }
    }
}

module.exports = { data, execute, autocomplete };