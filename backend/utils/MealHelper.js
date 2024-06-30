const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

async function getMeal(mDate) {
    try {
        const res = await axios({
            method: 'get',
            url: process.env.MEAL_API_URL,
            params: {
                date: mDate,
                gubun1: 1,
                gubun2: 2
            }
        })
        const mealData = res.data
        const result = []
        for (let key in mealData) {
            const sectionData = []
            const curData = mealData[key]
            for (let i = 0; i < curData.length; i++) {
                sectionData.push({
                    name: curData[i]['menuName'],
                    time: curData[i]['menuTime']
                })
            }
            result.push({
                section: key,
                data: sectionData
            })
        }
        return result
    } catch(e) {
        console.log(e)
        return []
    }
}

async function getMealEmbed(mDate) {
    var year = mDate.getFullYear();
    var month = ('0' + (mDate.getMonth() + 1)).slice(-2);
    var day = ('0' + mDate.getDate()).slice(-2);
    const dateStr = `${year}${month}${day}`
    const mealData = await getMeal(dateStr)
    const embed = new EmbedBuilder()
    .setColor('#2196f3')
    .setTitle('정보공학관 학식 정보')
    if (mealData.length) {
        // 데이터가 존재할 때
        embed.setDescription(`${year}.${month}.${day}. 기준`)
        for (let i = 0; i < mealData.length; i++) {
            let dataStr = ""
            for (let j = 0; j < mealData[i].data.length; j++) {
                if (j) dataStr += '\n'
                dataStr += `${j + 1}. ${mealData[i].data[j].name} (${mealData[i].data[j].time})`
            }
            embed.addFields({name: `🏢  ${mealData[i].section}`, value: dataStr})
        }
    } else {
        embed.setDescription(`${year}.${month}.${day}. 기준 - 데이터 없음`)
    }
    return embed
}

module.exports = { getMealEmbed }