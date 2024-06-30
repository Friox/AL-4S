const { createClient } = require('redis')
const { ValorantApiCom } = require('@valapi/valorant-api.com')

module.exports = {
    updateValorantInfo: async () => {
        let isSuccess = false
        const vapi = new ValorantApiCom({ language: "ko-KR" });

        // build version
        const buildVersionRes = await vapi.Version.get()
        const buildVersion = buildVersionRes.data?.data?.buildVersion

        // currencies
        const currenciesRes = await vapi.Currencies.get()
        const currenciesUUID = currenciesRes.data?.data[0].uuid

        // skin tier
        const skinTierRes = await vapi.ContentTiers.get()
        const skinTier = skinTierRes.data?.data

        // skin info
        const skinInfoRes = await vapi.Weapons.getSkins()
        const skinInfo = skinInfoRes.data?.data

        if (buildVersion && currenciesUUID && skinTier && skinInfo) {
            const client = await createClient({
                url: 'redis://redis:6379'
            }).on('error', err => console.log('Redis Client Error', err)).connect()
            try {
                await client.flushAll()
                await client.hSet('val_info', 'build_version', buildVersion)
                await client.hSet('val_info', 'currencies_uuid', currenciesUUID)
                for (let i = 0; i < skinTier.length; i++) {
                    const uuid = skinTier[i].uuid
                    const devName = skinTier[i].devName
                    const displayName = skinTier[i].displayName
                    const highlightColor = skinTier[i].highlightColor
                    const displayIcon = skinTier[i].displayIcon
                    await client.hSet(uuid, 'dev_name', devName)
                    await client.hSet(uuid, 'display_name', displayName)
                    await client.hSet(uuid, 'highlight_color', highlightColor)
                    await client.hSet(uuid, 'display_icon', displayIcon)
                    console.log(`tier: ${uuid}`)
                }
                for (let i = 0; i < skinInfo.length; i++) {
                    if (!skinInfo[i].contentTierUuid) continue
                    if (skinInfo[i].levels.length) {
                        const uuid = skinInfo[i].levels[0].uuid
                        const tierUUID = skinInfo[i].contentTierUuid
                        const displayName = skinInfo[i].levels[0].displayName
                        const displayIcon = skinInfo[i].levels[0].displayIcon
                        await client.hSet(uuid, 'tier_uuid', tierUUID)
                        await client.hSet(uuid, 'display_name', displayName)
                        await client.hSet(uuid, 'display_icon', displayIcon)
                    }
                }
                await client.set('data_time', (new Date().getTime()))
                isSuccess = true
            } catch(e) {
                console.log(e)
                isSuccess = false
            }
            await client.disconnect()
        }  else {
            isSuccess = false
        }
        return isSuccess
    }
}