const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, Embed } = require('discord.js');
const axios = require('axios')
const { ValorantApiCom } = require('@valapi/valorant-api.com')
const { decryptStr } = require('../../utils/CipherHelper')
const { getValorantUser } = require('../../utils/DBHelper')
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE, SETTING } = require('../../utils/Fabric')

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
}

function errorHandler(type) {
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
    }
    throw new CustomError(data)
}

function convertTime(str) {
    const v = parseInt(str)
    if (isNaN(v) || v < 0) return '0 분'
    const h = Math.floor(v / 3600)
    if (h == 0) return `${Math.floor(v / 60)} 분`
    else return `${h} 시간`
}

/**
 * Command Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    await interaction.deferReply({ephemeral: true})
    const uuid = interaction.member.id
    let id = interaction.options.getString('id', false)
    let pw = interaction.options.getString('pw', false)
    try {
        if (!id && !pw) {
            const queryResult = await getValorantUser(uuid)
            if (queryResult.length == 1) {
                id = decryptStr(queryResult[0].id)
                pw = decryptStr(queryResult[0].pw)
                if (id == '' && pw == '') errorHandler(ERRORS.ENCRYPT_ERROR)
            } else errorHandler(ERRORS.REQUIRE_LOGIN)
        } else if (!id || !pw) errorHandler(ERRORS.AUTH_BLANK)
    
        const valorantApiCom = new ValorantApiCom({ language: "ko-KR" });
        // Build Version
        const buildVersionRes = await valorantApiCom.Version.get()
        const buildVersion = buildVersionRes.data?.data?.buildVersion

        // Currencies
        // const currenciesRes = await valorantApiCom.Currencies.get()
        // const currencyUUID = currenciesRes.data?.data[0].uuid
        const currencyUUID = '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741'
        
        // Tier
        const tierIconMap = new Map()
        tierIconMap.set('Deluxe', '<:DeluxeTier:1240253329288855593>')
        tierIconMap.set('Exclusive', '<:ExclusiveTier:1240253327057621063>')
        tierIconMap.set('Premium', '<:PremiumTier:1240253325350408254>')
        tierIconMap.set('Select', '<:SelectTier:1240253323077226508>')
        tierIconMap.set('Ultra', '<:UltraTier:1240253321760215080>')

        const tierMap = new Map()
        const tierRes = await valorantApiCom.ContentTiers.get()
        const tier = tierRes.data?.data
        if (tier) {
            for (let i = 0; i < tier.length; i++) {
                tierMap.set(tier[i].uuid, {
                    displayName: tier[i].displayName,
                    devName: tier[i].devName,
                    highlightColor: tier[i].highlightColor,
                    displayIcon: tier[i].displayIcon
                })
            }
        } else errorHandler(ERRORS.TIER_ERROR)

        // Weapon Skin Info
        const skinMap = new Map()
        const weaponSkinInfoRes = await valorantApiCom.Weapons.getSkins()
        const weaponSkinInfo = weaponSkinInfoRes.data?.data
        if (weaponSkinInfo) {
            for (let i = 0; i < weaponSkinInfo.length; i++) {
                if (!weaponSkinInfo[i].contentTierUuid) continue
                if (weaponSkinInfo[i].levels.length) {
                    skinMap.set(weaponSkinInfo[i].levels[0].uuid, weaponSkinInfo[i].contentTierUuid)
                }
            }
        } else errorHandler(ERRORS.SKIN_ERROR)

        // Login
        const formData = new FormData()
        formData.append('id', id)
        formData.append('pw', pw)
        const loginRes = await axios({
            method: 'post',
            url: `${process.env.VAL_AUTH_SERVER_URL}:${process.env.VAL_AUTH_SERVER_PORT}/auth`,
            data: formData
        })
        const acctoken = loginRes.data?.actoken
        const enttoken = loginRes.data?.enttoken
        const puuid = loginRes.data?.puuid
        if (!acctoken || !enttoken || !puuid) errorHandler(ERRORS.AUTH_FAIL)

        // User Info
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

        // XP Info
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

        // Shop Info
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
        timeEmbed.setDescription(`\`${gameName}#${tagLine} (LV. ${level})\` 의 상점 | ${convertTime(remainTime)} 남음`)
        resEmbed.push(timeEmbed)
        for (let i = 0; i < shopInfo.length; i++) {
            let value = ""
            const tmp = (await valorantApiCom.Weapons.getSkinLevelByUuid(shopInfo[i].Rewards[0].ItemID)).data?.data
            const res = new EmbedBuilder()
            const tier = tierMap.get(skinMap.get(tmp.uuid))
            const ecolor = tier.highlightColor.toUpperCase().substr(0, 6)
            res.setColor(`#${ecolor}`)
            const tierIcon = tierIconMap.get(tier.devName)
            value += `${tierIcon ? tierIcon : 'Unknown'} **${tmp.displayName}**\n`
            value += `<:ValorantPointIcon:1240253319461605447> ${shopInfo[i].Cost[currencyUUID]}`
            res.setDescription(value)
            res.setThumbnail(tmp.displayIcon)
            skinRes.push(tmp)
            resEmbed.push(res)
        }
        await interaction.deleteReply()
        interaction.channel.send({embeds: resEmbed, options: { ephemeral: true }})
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