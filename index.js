const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { Player } = require('discord-player')
const express = require('express')
const app = express()
const port = process.env.PORT ?? 9000

const server = app.listen(port, () => {
	console.log(`api server: ${port}`)
})

app.get('/api/signal', async (req, res) => {
	res.status(200).send()
})

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

// Create a new player instance
const player = new Player(client, {
	skipFFmpeg: true,
	ytdlOptions: {
		quality: 'highestaudio',
		highWaterMark: 1 << 30,
		dlChunkSize: 0
	}
})

async function main() {
	// Commands
	client.commands = new Collection();
	
	const foldersPath = path.join(__dirname, 'commands');
	const commandFolders = fs.readdirSync(foldersPath);
	
	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}

	console.log(`Successfully loaded ${client.commands.size} application (/) commands.`)

	// Discord Events
	const discordEventsPath = path.join(__dirname, './events/discord-js')
	const discordEventFiles = fs.readdirSync(discordEventsPath).filter(file => file.endsWith('.js'))

	for (const file of discordEventFiles) {
		const filePath = path.join(discordEventsPath, file)
		const event = require(filePath)
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args))
		} else {
			client.on(event.name, (...args) => event.execute(...args))
		}
	}

	console.log(`Successfully registered ${discordEventFiles.length} discord events.`)

	// Discord Player Events
	const playerEventsPath = path.join(__dirname, './events/discord-player')
	const playerEventFiles = fs.readdirSync(playerEventsPath).filter(file => file.endsWith('.js'))

	for (const file of playerEventFiles) {
		const filePath = path.join(playerEventsPath, file)
		const event = require(filePath)
		player.events.on(event.name, (...args) => event.execute(...args))
	}

	console.log(`Successfully registered ${playerEventFiles.length} player events.`)
	
	// Log in to Discord with your client's token
	client.login(process.env.TOKEN).then(() => {
		client.user.setPresence({
			activities: [
				{
					name: '코딩',
					type: ActivityType.Playing,

				}
			],
			status: 'online'
		})
	});

	// Player Setting
	// allow only youtube stream
	await player.extractors.loadDefault((ext) => ext === 'YouTubeExtractor')
	/*
	onBeforeCreateStream(async (track) => {
		if (track.source === 'youtube') {
			return (
				await stream(track.url, {
					type: 'audio',
					quality: 'high',
					highWaterMark: 1 << 25,
				})
			).stream
		}
		return null
	})
	*/
}

main()