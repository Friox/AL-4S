const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, Embed } = require('discord.js');
const axios = require('axios')
const { decryptStr } = require('../../utils/CipherHelper')
const { getValorantUser } = require('../../utils/DBHelper')
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')
const { createClient } = require('redis')

const data = new SlashCommandBuilder()
data.setName('shop')
data.setDescription('오늘의 상점을 조회합니다')
data.addStringOption(option => 
    option
    .setName('id')
    .setDescription('아이디')
    .setRequired(false)
)
data.addStringOption(option => 
    option
    .setName('pw')
    .setDescription('비밀번호')
    .setRequired(false)
)

function convertTime(str, detail = false) {
    const v = parseInt(str)
    if (isNaN(v) || v < 0) return '0 초'
    const h = Math.floor(v / 3600)
    const m = Math.floor((v % 3600) / 60)
    const s = (v % 3600) % 60
    if (h == 0 && m == 0) return `${s} 초`
    else if (h == 0) {
        if (detail) return `${m} 분 ${s} 초`
        else return `${m} 분`
    } else {
        if (detail) return `${h} 시간 ${m} 분 ${s} 초`
        else return `${h} 시간 ${m} 분`
    }
}

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
    ENCRYPT_ERROR: 'encrypt_error',
    REQUIRE_LOGIN: 'require_login',
    AUTH_BLANK: 'auth_blank',
    TIER_ERROR: 'tier_error',
    SKIN_ERROR: 'skin_error',
    AUTH_FAIL: 'auth_fail',
    USER_FAIL: 'user_fail',
    SHOP_ERROR: 'shop_error',
    XP_ERROR: 'xp_error',
    REDIS_ERROR: 'redis_error',
    LOGIN_TIMEOUT: 'login_timeout'
}

function errorHandler(type, arg) {
    const data = {
        title: '',
        desc: ''
    }
    switch(type) {
        case ERRORS.ENCRYPT_ERROR:
            data.title = '🔑  복호화 오류'
            data.desc = '사용자 데이터를 복호화하는 과정에서 오류가 발생했어요'
            break

        case ERRORS.REQUIRE_LOGIN:
            data.title = '🔑  로그인 필요'
            data.desc = '아이디와 비밀번호를 입력하지 않고 사용하려면 먼저 로그인 해야합니다.\n`/valogin` 명령어로 로그인해주세요.'
            break

        case ERRORS.AUTH_BLANK:
            data.title = '❌  로그인 실패'
            data.desc = '아이디와 비밀번호 모두 입력해주세요'
            break

        case ERRORS.TIER_ERROR:
            data.title = '❌  티어정보 로드 실패'
            data.desc = ''
            break

        case ERRORS.SKIN_ERROR:
            data.title = '❌  스킨 DB 로드 실패'
            data.desc = ''
            break

        case ERRORS.AUTH_FAIL:
            data.title = '❌  로그인 실패'
            data.desc = '유효한 사용자 정보를 찾을 수 없습니다.\n아이디와 비밀번호를 확인해주세요.'
            break

        case ERRORS.LOGIN_TIMEOUT:
            data.title = '❌  로그인 실패'
            data.desc = `로그인 요청한도에 도달했습니다. **${convertTime(arg, true)}** 뒤에 다시 시도해주세요.`
            break

        case ERRORS.USER_FAIL:
            data.title = '❌  사용자 정보 로드 실패'
            data.desc = '사용자 정보를 불러올 수 없습니다.'
            break

        case ERRORS.SHOP_ERROR:
            data.title = '❌  상점 정보 로드 실패'
            data.desc = '상점 정보를 불러올 수 없습니다.'

        case ERRORS.XP_ERROR:
            data.title = '❌  레벨 정보 로드 실패'
            data.desc = '레벨 정보를 가져오는 중 오류가 발생했습니다.'
            break

        case ERRORS.REDIS_ERROR:
            data.title = '💿  발로란트 데이터베이스 오류'
            data.desc = '발로란트 데이터베이스가 비어있습니다.\n`/valinfoupdate` 명령어롤 사용해주세요.'
            break
    }
    throw new CustomError(data)
}

const tierIconMap = new Map([
    ['Deluxe', '<:DeluxeTier:1240253329288855593>'],
    ['Exclusive', '<:ExclusiveTier:1240253327057621063>'],
    ['Premium', '<:PremiumTier:1240253325350408254>'],
    ['Select', '<:SelectTier:1240253323077226508>'],
    ['Ultra', '<:UltraTier:1240253321760215080>']
])

/**
 * Command Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    const uuid = interaction.member.id
    let id = interaction.options.getString('id', false)
    let pw = interaction.options.getString('pw', false)
    const isPrivate = !id && !pw
    try {
        // Check Private
        if (isPrivate) {
            await interaction.deferReply()
            const queryResult = await getValorantUser(uuid)
            if (queryResult.length == 1) {
                id = decryptStr(queryResult[0].id)
                pw = decryptStr(queryResult[0].pw)
                if (id == '' && pw == '') errorHandler(ERRORS.ENCRYPT_ERROR)
            } else errorHandler(ERRORS.REQUIRE_LOGIN)
        } else if (!id || !pw) {
            await interaction.deferReply({ephemeral: true})
            errorHandler(ERRORS.AUTH_BLANK)
        }
        else await interaction.deferReply({ephemeral: true})

        // Init Redis Client
        const client = await createClient({
            url: `${process.env.REDIS_URL}:${process.env.REDIS_PORT}`
        }).on('error', err => console.log('Redis Client Error', err)).connect()
        const isAlive = await client.get('data_time')
        if (!isAlive) errorHandler(ERRORS.REDIS_ERROR)

        // Get Valorant Info
        const valInfo = await client.hGetAll('val_info')
        const buildVersion = valInfo.build_version
        const currencyUUID = valInfo.currencies_uuid

        // Login
        
        const formData = new FormData()
        formData.append('id', id)
        formData.append('pw', pw)
        const loginRes = await axios({
            method: 'post',
            url: `${process.env.VAL_AUTH_SERVER_URL}:${process.env.VAL_AUTH_SERVER_PORT}/auth`,
            data: formData
        })
        if (!loginRes.data) errorHandler(ERRORS.AUTH_FAIL)
        if (!loginRes.data.success) {
            if (loginRes.data.code == 429) errorHandler(ERRORS.LOGIN_TIMEOUT, loginRes.data.timeout)
            else errorHandler(ERRORS.AUTH_FAIL)
        }
        const acctoken = loginRes.data?.actoken
        const enttoken = loginRes.data?.enttoken
        const puuid = loginRes.data?.puuid
        if (!acctoken || !enttoken || !puuid) {
            errorHandler(ERRORS.AUTH_FAIL)
        } else {

        }

        // Get User Info
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

        // Get XP Info
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
        const level = xpinfo?.Level
        const xp = xpinfo.XP

        // Get Shop Info
        const shopInfoRes = await axios({
            method: 'get',
            url: `https://pd.kr.a.pvp.net/store/v2/storefront/${puuid}`,
            headers: {
                'Authorization': `Bearer ${acctoken}`,
                'X-Riot-Entitlements-JWT': enttoken,
                'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
                'X-Riot-ClientVersion': buildVersion
            }
        })
        const skinsPanelLayout = shopInfoRes.data?.SkinsPanelLayout
        if (!skinsPanelLayout) errorHandler(ERRORS.SHOP_ERROR)
        const remainTime = skinsPanelLayout.SingleItemOffersRemainingDurationInSeconds
        const shopInfo = skinsPanelLayout.SingleItemStoreOffers
        const skinRes = []
        const resEmbed = []
        const timeEmbed = new EmbedBuilder()
        timeEmbed.setColor('#BD3944')
        timeEmbed.setTitle(`${gameName}#${tagLine}(LV. ${level}) 의 일일상점`)
        timeEmbed.setDescription(`${convertTime(remainTime)} 남음`)
        resEmbed.push(timeEmbed)
        for (let i = 0; i < shopInfo.length; i++) {
            let value = ""
            const tmp = await client.hGetAll(shopInfo[i].Rewards[0].ItemID)
            if (!tmp) continue
            const res = new EmbedBuilder()
            const tierUUID = tmp.tier_uuid
            const tier = await client.hGet(tierUUID, 'dev_name')
            const tierIcon = tierIconMap.get(tier)
            const ecolor = (await client.hGet(tierUUID, 'highlight_color'))?.toUpperCase().substr(0, 6)
            if (ecolor) res.setColor(`#${ecolor}`)
            value += `${tierIcon ? tierIcon : 'Unknown'} **${tmp.display_name}**\n`
            value += `<:ValorantPointIcon:1240253319461605447> ${shopInfo[i].Cost[currencyUUID]}`
            res.setDescription(value)
            res.setThumbnail(tmp.display_icon)
            skinRes.push(tmp)
            resEmbed.push(res)
        }
        if (isPrivate) {
            interaction.editReply({embeds: resEmbed})
        } else {
            await interaction.deleteReply()
            interaction.channel.send({embeds: resEmbed})
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
            // setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        } else if (!e.title || !e.desc) {
            const embed = MakeSimpleEmbed({
                title: '❌  오류',
                desc: '알 수 없는 오류가 발생했습니다.',
                color: 'Red',
                type: ETYPE.VALORANT_HELPER
            })
            await interaction.editReply({embeds: [embed]})
            // setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        } else {
            const embed = MakeSimpleEmbed({
                title: e.title,
                desc: e.desc,
                color: 'Red',
                type: ETYPE.VALORANT_HELPER
            })
            await interaction.editReply({embeds: [embed]})
            // setTimeout(() => interaction.deleteReply(), SETTING.EMBED_TIMEOUT);
        }
    }
}

module.exports = { data, execute }