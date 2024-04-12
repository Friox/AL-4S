const SETTING = {
    EMBED_TIMEOUT: 3000,
    EMBED_COLOR: 'Blue',
    PLAYER_FAKE_ENABLE: false,
    PLAYER_FAKE_PERCENTAGE: 0.3,
    PLAYER_FAKE_STREAM: "",
}

const ETYPE = {
    MUSIC_PLAYER: 'mp'
}

Object.freeze(SETTING)
Object.freeze(ETYPE)

module.exports = { SETTING, ETYPE }