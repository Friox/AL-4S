const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { getCountValorantUsers, insertValorantUser, editValorantUser } = require('../../utils/DBHelper');
const axios = require('axios');
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')

const data = new SlashCommandBuilder()
data.setName('valogin')
data.setDescription('디스코드 계정과 발로란트 계정을 연동합니다')
data.addStringOption(option => 
    option
    .setName('id')
    .setDescription('아이디')
    .setRequired(true)
)
data.addStringOption(option => 
    option
    .setName('pw')
    .setDescription('비밀번호')
    .setRequired(true)
)

/**
 * 
 * @param {Object} options
 * @param {String} options.title
 * @param {String} options.desc
 */
class CustomError {
    constructor(options) {
        this.title = options.title;
        this.desc = options.desc;
    }
}

CustomError.prototype = Object.create(Error.prototype)
CustomError.prototype.name = 'CustomError'

const ERRORS = {
    AUTH_FAIL: 'auth_fail',
    USER_FAIL: 'user_fail',
    AXIOS_ERROR: 'axios_error',
    UNKNOWN_ERROR: 'unknown_error',
    DB_ERROR: 'db_error',
    USERCNT_ERROR: 'usercnt_error',
    XP_ERROR: 'xp_error'
}

function errorHandler(type) {
    const data = {
        title: '',
        desc: ''
    }

    switch(type) {
        case ERRORS.AUTH_FAIL:
            data.title = '❌  로그인 실패'
            data.desc = '유효한 사용자 정보를 찾을 수 없습니다.\n아이디와 비밀번호를 확인해주세요.'
            break

        case ERRORS.USER_FAIL:
            data.title = '❌  사용자 정보 로드 실패'
            data.desc = '사용자 정보를 불러올 수 없습니다.'
            break

        case ERRORS.DB_ERROR:
            data.title = '❌  DB 통신 오류'
            data.desc = 'DB 데이터 통신 중 오류가 발생했습니다.'
            break

        case ERRORS.USERCNT_ERROR:
            data.title = '❌  유저 검색 오류'
            data.desc = '유저 정보 검색 중 오류가 발생했습니다.'
            break

        case ERRORS.XP_ERROR:
            data.title = '❌  레벨 정보 로드 실패'
            data.desc = '레벨 정보를 가져오는 중 오류가 발생했습니다.'
            break
    }

    throw new CustomError(data)
}

/**
 * Command Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    await interaction.deferReply({ephemeral: true})
    const uuid = interaction.member.id
    const id = interaction.options.getString('id', true)
    const pw = interaction.options.getString('pw', true)

    // 로그인 테스트
    const formData = new FormData()
    formData.append('id', id)
    formData.append('pw', pw)
    try {
        const loginRes = await axios({
            method: 'post',
            url: 'http://valauth:8080/auth',
            data: formData
        })
        const acctoken = loginRes.data?.actoken
        const enttoken = loginRes.data?.enttoken
        const puuid = loginRes.data?.puuid

        // 세 개 모두 있어야 정상 로그인
        if (!acctoken || !enttoken || !puuid) errorHandler(ERRORS.AUTH_FAIL)

        // 유저 이름, 태그
        const userInfoRes = await axios({
            method: 'get',
            url: 'https://auth.riotgames.com/userinfo',
            headers: {
                'Authorization': `Bearer ${acctoken}`
            }
        })
        
        const acctInfo = userInfoRes.data?.acct
        if (!acctInfo) errorHandler(ERRORS.USER_FAIL)
        const gameName = acctInfo?.game_name
        const tagLine = acctInfo?.tag_line

        // 레벨 및 경험치 정보
        const userDataRes = await axios({
            method: 'get',
            url: `https://pd.kr.a.pvp.net/account-xp/v1/players/${puuid}`,
            headers: {
                'Authorization': `Bearer ${acctoken}`,
                'X-Riot-Entitlements-JWT': enttoken,
                'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
                'X-Riot-ClientVersion': 0
            }
        })
        const xpinfo = userDataRes.data?.Progress
        const level = xpinfo.Level
        const xp = xpinfo.XP
        // if (!level || !xp) errorHandler(ERRORS.XP_ERROR)

        const userCount = await getCountValorantUsers(uuid).catch(err => errorHandler(ERRORS.UNKNOWN_ERROR))
        if (userCount == 0) {
            await insertValorantUser(uuid, id, pw).catch(err => errorHandler(ERRORS.DB_ERROR))
            const embed = MakeSimpleEmbed({
                title: '🔑  사용자 연동 완료',
                desc: `${interaction.member.user.toString()} <==> \`${gameName}#${tagLine} (LV. ${level})\`\n최초 연동 완료`,
                type: ETYPE.VALORANT_HELPER
            })
            await interaction.editReply({embeds: [embed]})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
            console.log(`[VALH] Account Link Complete (${interaction.member.user.displayName}, ${gameName}#${tagLine})`)
        } else if (userCount == 1) {
            await editValorantUser(uuid, id, pw).catch(err => errorHandler(ERRORS.DB_ERROR))
            const embed = MakeSimpleEmbed({
                title: '🔑  사용자 재연동 완료',
                desc: `${interaction.member.user.toString()} <==> \`${gameName}#${tagLine} (LV. ${level})\`\n연동정보 업데이트 완료`,
                type: ETYPE.VALORANT_HELPER
            })
            await interaction.editReply({embeds: [embed]})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
            console.log(`[VALH] Account Re-Link Complete (${interaction.member.user.displayName}, ${gameName}#${tagLine})`)
        }
    } catch(e) {
        console.log(e)
        if (axios.isAxiosError(e)) {
            const embed = MakeSimpleEmbed({
                title: '❌  API 통신 오류',
                desc: 'API 서버와 통신할 수 없습니다. `/botstatus` 명령어로 상태를 확인해 주세요.',
                color: 'Red',
                type: ETYPE.VALORANT_HELPER
            })
            await interaction.editReply({embeds: [embed]})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        } else if (!e.title || !e.desc) {
            const embed = MakeSimpleEmbed({
                title: '❌  오류',
                desc: '알 수 없는 오류가 발생했습니다.',
                color: 'Red',
                type: ETYPE.VALORANT_HELPER
            })
            await interaction.editReply({embeds: [embed]})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        } else {
            const embed = MakeSimpleEmbed({
                title: e.title,
                desc: e.desc,
                color: 'Red',
                type: ETYPE.VALORANT_HELPER
            })
            await interaction.editReply({embeds: [embed]})
            setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        }
    }
}

module.exports = { data, execute }