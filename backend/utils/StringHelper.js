const SHARED_MSG = {
    PLEASE_PLAY: '❌  먼저 음악을 재생해주세요!',
    ERR_TITLE: '❌  오류가 발생했습니다',
    ERR_DESC: '이유는 나도 몰라요'
}

const MESSAGE = {
    // JUMP
    JUMP_ER_1_TITLE: '❌  유효한 번호가 아닙니다',
    JUMP_ER_2_TITLE: '대기열이 비어있어요',
    JUMP_ER_2_DESC: '아무거나 재생해볼까요?',
    JUMP_ER_3_TITLE: SHARED_MSG.ERR_TITLE,
    JUMP_ER_3_DESC: SHARED_MSG.ERR_DESC,

    // PLAY
    PLAY_ER_1_TITLE: '❌  먼저 음성채널에 접속해주세요!',
    PLAY_ER_1_DESC: '해당 명령은 음성채널에 접속했을때만 사용가능합니다',
    PLAY_ER_2_TITLE: '❌  재생 오류가 발생했어요',
    PLAY_ER_2_DESC: '미안하지만 원인은 나도 몰라요',

    // QUEUE
    QUEUE_ER_1_TITLE: SHARED_MSG.PLEASE_PLAY,
    QUEUE_ER_1_DESC: '',
    QUEUE_ER_2_TITLE: '❌  유효한 페이지가 아닙니다',
    QUEUE_ER_3_TITLE: '대기열이 비어있어요',
    QUEUE_ER_3_DESC: '아무거나 재생해볼까요?',

    // NOWPLAY
    NOWPLAY_ER_TITLE: SHARED_MSG.PLEASE_PLAY,
    NOWPLAY_ER_DESC: '',

    // PAUSE
    PAUSE_ER_TITLE: SHARED_MSG.PLEASE_PLAY,
    PAUSE_ER_DESC: '',
    PAUSE_STATUS_1: '⏸️  일시정지',
    PAUSE_STATUS_2: '▶️  재생',
    PAUSE_STATUS_DESC: '',

    // SKIP
    SKIP_ER_TITLE: SHARED_MSG.PLEASE_PLAY,
    SKIP_ER_DESC: '',
    SKIP_STATUS_1: '⏭️  트랙 건너뛰기',
    SKIP_STATUS_DESC: '',

    // STOP
    STOP_ER_TITLE: SHARED_MSG.PLEASE_PLAY,
    STOP_ER_DESC: '',
    STOP_STATUS_1: '⏹️  정지',
    STOP_STATUS_DESC: '플레이어를 정리합니다',

    // VOLUME
    VOLUME_ER_TITLE: SHARED_MSG.PLEASE_PLAY,
    VOLUME_ER_DESC: '',
}

const FOOTER_STR = new Map([
    ['mp', 'AL-4S Music Player'],
    ['vh', 'AL-4S Valorant Helper']
])

module.exports = { MESSAGE, FOOTER_STR }