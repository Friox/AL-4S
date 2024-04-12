const { SlashCommandBuilder, CommandInteraction, AutocompleteInteraction } = require('discord.js');
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { SETTING } = require('../../utils/Fabric')

const data = new SlashCommandBuilder()
data.setName('help')
data.setDescription('봇 또는 명령어의 사용법을 표시합니다')
data.addStringOption(option => 
    option
    .setName('command')
    .setDescription('명령어')
    .setRequired(false)
    .setAutocomplete(true)
)

const commandList = [ 'play', 'pause', 'stop', 'skip', 'jump', 'volume', 'queue', 'nowplaying' ]

/**
 * Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const command = interaction.options.getString('command', false)
    if (!command) {
        const embed = MakeSimpleEmbed({
            title: '🤖  AL-4S',
            desc: "" +
            "블루아카이브 캐릭터의 별칭을 본따 만든 봇입니다.\n" +
            "아직 할수있는게 많이 없어요\n" +
            "\n" +
            "`/help [명령어]` 를 입력하여 명령어의 설명을 확인할 수 있어요\n" +
            "\n" +
            "[가능한것들]\n" +
            "**🎧  음악재생**, 🍚  학식정보, 💬  채팅검열"
        })
        interaction.reply({embeds: [embed], ephemeral: true})
    } else {
        if (command == 'play') {
            const embed = MakeSimpleEmbed({
                title: '📖  `/play` 명령어',
                desc: "" + 
                "[동작]\n" +
                "원하는 검색어 또는 주소를 통해 음원을 재생합니다.\n" +
                "검색어, 영상 주소, 플레이리스트 주소를 지원합니다.\n" +
                "\n" +
                "검색어를 입력 후 잠시 기다리면 검색결과 5개를 표시합니다.\n" +
                "해당 항목을 선택하여 재생할 수 있습니다.\n" +
                "영상 주소, 플레이리스트 주소를 입력하면 자동으로 인식합니다.\n" +
                "다른항목을 재생중일때 명령어를 실행하면 대기열에 추가됩니다.\n" +
                "\n" +
                "[버그]\n" +
                "자동완성 항목을 불러올때 가끔 오류가 발생합니다.\n" +
                "이때는 명령어를 모두 지우고 다시 입력해주세요.\n" +
                "\n" +
                "[사용예시]\n" +
                "1. `/play` 입력 후 엔터\n" +
                "2. 검색어 또는 주소 입력 후 엔터 (잠시 기다리면 자동완성 표시)"
            })
            interaction.reply({embeds: [embed], ephemeral: true})
        } else if (command == 'pause') {
            const embed = MakeSimpleEmbed({
                title: '📖  `/pause` 명령어',
                desc: "" + 
                "[동작]\n" +
                "플레이어를 일시정지합니다.\n" +
                "이미 일시정지 상태일때 명령어를 실행하면 다시 재생합니다.\n" +
                "**재생, 일시정지 상태일때만 명령어를 사용할 수 있습니다.**\n" +
                "\n" +
                "[사용예시]\n" +
                "1. `/pause` 입력 후 엔터"
            })
            interaction.reply({embeds: [embed], ephemeral: true})
        } else if (command == 'stop') {
            const embed = MakeSimpleEmbed({
                title: '📖  `/stop` 명령어',
                desc: "" + 
                "[동작]\n" +
                "플레이어를 정지합니다.\n" +
                "남아있는 대기열을 정리하고 봇을 퇴장시킵니다.\n" +
                "\n" +
                "**재생, 일시정지 상태일때만 명령어를 사용할 수 있습니다.**\n" +
                "\n" +
                "[사용예시]\n" +
                "1. `/stop` 입력 후 엔터"
            })
            interaction.reply({embeds: [embed], ephemeral: true})
        } else if (command == 'skip') {
            const embed = MakeSimpleEmbed({
                title: '📖  `/skip` 명령어',
                desc: "" + 
                "[동작]\n" +
                "현재 재생중인 트랙을 건너뛰어 다음 트랙을 재생합니다.\n" +
                "다음 트랙이 없을경우 플레이어를 정지합니다.\n" +
                "\n" +
                "**재생, 일시정지 상태일때만 명령어를 사용할 수 있습니다.**\n" +
                "\n" +
                "[사용예시]\n" +
                "1. `/skip` 입력 후 엔터"
            })
            interaction.reply({embeds: [embed], ephemeral: true})
        } else if (command == 'jump') {
            const embed = MakeSimpleEmbed({
                title: '📖  `/jump` 명령어',
                desc: "" + 
                "[동작]\n" +
                "현재 재생중인 트랙을 건너뛰어 대기열에 있는 특정 트랙을 재생합니다.\n" +
                "현재 재생중인 트랙과 특정 트랙 사이의 항목은 삭제됩니다.\n" +
                "대기열의 트랙번호는 `/queue` 명령어로 확인할 수 있습니다.\n" +
                "\n" +
                "**재생, 일시정지 상태일때만 명령어를 사용할 수 있습니다.**\n" +
                "\n" +
                "[사용예시]\n" +
                "1. `/jump` 입력 후 엔터\n" +
                "2. 트랙번호 입력 후 엔터"
            })
            interaction.reply({embeds: [embed], ephemeral: true})
        } else if (command == 'volume') {
            const embed = MakeSimpleEmbed({
                title: '📖  `/volume` 명령어',
                desc: "" + 
                "[동작]\n" +
                "플레이어의 볼륨을 입력한 값으로 설정합니다.\n" +
                "값을 입력하지 않을 경우 현재 플레이어의 볼륨값을 표시합니다.\n" +
                "청취중인 모든 플레이어에게 영향을 미칩니다.\n" +
                "재생 시 볼륨 기본값은 `25` 입니다. (최대 `100`)\n" +
                "\n" +
                "**재생, 일시정지 상태일때만 명령어를 사용할 수 있습니다.**\n" +
                "\n" +
                "[사용예시]\n" +
                "1. `/volume` 입력 후 엔터\n" +
                "2. 변경할 볼륨값을 입력하고 엔터"
            })
            interaction.reply({embeds: [embed], ephemeral: true})
        } else if (command == 'queue') {
            const embed = MakeSimpleEmbed({
                title: '📖  `/queue` 명령어',
                desc: "" + 
                "[동작]\n" +
                "현재 대기열 목록을 확인합니다. (페이지 당 `10` 항목)\n" +
                "페이지 번호를 입력할 경우 해당 페이지를 표시합니다.\n" +
                "페이지 번호를 입력하지 않을 경우 대기열 `1` 페이지를 표시합니다.\n" +
                "\n" +
                "**재생, 일시정지 상태일때만 명령어를 사용할 수 있습니다.**\n" +
                "\n" +
                "[사용예시]\n" +
                "1. `/queue` 입력 후 엔터\n" +
                "2. 페이지 번호를 입력하고 엔터"
            })
            interaction.reply({embeds: [embed], ephemeral: true})
        } else if (command == 'nowplaying') {
            const embed = MakeSimpleEmbed({
                title: '📖  `/nowplaying` 명령어',
                desc: "" + 
                "[동작]\n" +
                "현재 재생중인 트랙의 정보를 표시합니다.\n" +
                "\n" +
                "**재생, 일시정지 상태일때만 명령어를 사용할 수 있습니다.**\n" +
                "\n" +
                "[사용예시]\n" +
                "1. `/nowplaying` 입력 후 엔터\n"
            })
            interaction.reply({embeds: [embed], ephemeral: true})
        } else {
            const embed = MakeSimpleEmbed({
                title: '❌  알 수 없는 명령어',
                desc: '올바른 명령어를 입력해주세요'
            })
            await interaction.reply({embeds: [embed], ephemeral: true})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        }
    }
}

/**
 * AutoComplete
 * @param {AutocompleteInteraction} interaction 
 */
async function autocomplete(interaction) {
    const query = interaction.options.getString('command', false);
    if (!query) {
        interaction.respond(commandList.map((str) => ({
            name: str,
            value: str
        })))
    } else {
        interaction.respond(commandList.filter((str) => str.includes(query)).map((str) => ({
            name: str,
            value: str
        })))
    }
}

module.exports = { data, execute, autocomplete }