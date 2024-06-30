const mysql = require('mysql2/promise')
const { encryptStr } = require('./CipherHelper')

const pool = mysql.createPool({
    host: 'mysql',
    user: 'arisu',
    password: 'arisu',
    database: 'AL-4S',
    port: '3306',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 5000
})

module.exports = {
    checkConnection: async () => {
        try {
            const conn = await pool.getConnection()
            conn.release()
            return 1
        } catch(e) {
            console.log(e)
            return 0
        }
    },

    getCountValorantUsers: async (uid) => {
        const conn = await pool.getConnection()
        try {
            const [results] = await conn.query('SELECT count(uid) AS count FROM `ValorantUser` WHERE `uid` = ?', [uid])
            return results[0].count
        } catch(e) {
            console.log(e)
            return -1
        } finally {
            conn.release()
        }
    },
    
    insertValorantUser: async (uid, id, pw) => {
        id = encryptStr(id)
        pw = encryptStr(pw)
        const conn = await pool.getConnection()
        try {
            const [results] = await conn.query('INSERT INTO `ValorantUser` VALUES (?, ?, ?)', [uid, id, pw])
            return results
        } catch (e) {
            return e
        } finally {
            conn.release()
        }
    },
    
    editValorantUser: async (uid, id, pw) => {
        id = encryptStr(id)
        pw = encryptStr(pw)
        const conn = await pool.getConnection()
        try {
            const [results] = await conn.query('UPDATE `ValorantUser` SET `id` = ?, `pw` = ? WHERE `uid` = ?', [id, pw, uid])
            return results
        } catch (e) {
            return e
        } finally {
            conn.release()
        }
    },

    getValorantUser: async (uid) => {
        const conn = await pool.getConnection()
        try {
            const [results] = await conn.query('SELECT id, pw FROM `ValorantUser` WHERE `uid` = ?', [uid])
            return results
        } catch (e) {
            return []
        } finally {
            conn.release()
        }
    }
}
