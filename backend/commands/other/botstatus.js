const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { MakeSimpleEmbed } = require('../../utils/EmbedHelper')
const { ETYPE } = require('../../utils/Fabric')
const { checkConnection } = require('../../utils/DBHelper')
const { createClient } = require('redis')
const axios = require('axios')

const data = new SlashCommandBuilder()
data.setName('botstatus')
data.setDescription('봇 상태를 조회합니다')

const statusSymbol = ['비정상 🔴', '정상 🟢', '확인불가 🟡']

/**
 * Command Execute
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
    await interaction.deferReply()

    let hbStatus = 2
    let vasStatus = 2
    let dbStatus = 2
    let redisStatus = 2

    try {
        const hbPort = process.env.API_PORT ?? 9000
        const hbRes = await axios({
            method: 'get',
            url: `http://localhost:${hbPort}/api/signal`,
        })
        if (hbRes.status == 200) hbStatus = 1
    } catch(e) {
        hbStatus = 0
    }

    try {
        const vasURL = process.env.VAL_AUTH_SERVER_URL
        const vasPort = process.env.VAL_AUTH_SERVER_PORT
        const vasRes = await axios({
            method: 'get',
            url: `${vasURL}:${vasPort}`,
        })
        if (vasRes.status == 200) vasStatus = 1
    } catch(e) {
        vasStatus = 0
    }

    try {
        if (await checkConnection() == 1) dbStatus = 1
        else dbStatus = 0
    } catch(e) {
        dbStatus = 0
    }

    try {
        await createClient({
            url: 'redis://redis:6379',
            
        }).connect()
        redisStatus = 1
    } catch(e) {
        redisStatus = 0
    }
    
    let statusStr = ''
    statusStr += `HeartBeat: ${statusSymbol[hbStatus]}\n`
    statusStr += `Valorant Auth Server: ${statusSymbol[vasStatus]}\n`
    statusStr += `Database Connection: ${statusSymbol[dbStatus]}\n`
    statusStr += `Redis Cache Status: ${statusSymbol[redisStatus]}`
    const embed = MakeSimpleEmbed({
        title: '봇 상태',
        desc: statusStr,
        type: ETYPE.VALORANT_HELPER
    })
    interaction.editReply({embeds: [embed]})
}

module.exports = { data, execute }