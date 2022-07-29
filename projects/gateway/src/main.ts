import { REST } from '@discordjs/rest';
import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws';
import { envParseString, setup } from '@skyra/env-utilities';
import { createBanner } from '@skyra/start-banner';
import { GatewayIntentBits } from 'discord-api-types/v10';
import gradient from 'gradient-string';

setup(new URL('../src/.env', import.meta.url));

const token = envParseString('DISCORD_TOKEN');
const manager = new WebSocketManager({
	intents:
		GatewayIntentBits.GuildBans |
		GatewayIntentBits.GuildEmojisAndStickers |
		GatewayIntentBits.GuildInvites |
		GatewayIntentBits.GuildMembers |
		GatewayIntentBits.GuildMessageReactions |
		GatewayIntentBits.GuildMessages |
		GatewayIntentBits.GuildVoiceStates |
		GatewayIntentBits.Guilds |
		GatewayIntentBits.MessageContent,
	rest: new REST().setToken(token),
	token
})
	.on('error', (error) => console.error('Received error:', error))
	.on(WebSocketShardEvents.Ready, (payload) => console.log(`[WS] ${payload.shardId} is now ready.`))
	.on(WebSocketShardEvents.Resumed, (payload) => console.log(`[WS] ${payload.shardId} has resumed previous session.`))
	.on(WebSocketShardEvents.Dispatch, (payload) => console.log(payload));

await manager.connect();

console.log(
	gradient.morning.multiline(
		createBanner({
			logo: [
				String.raw`          ____ `,
				String.raw`         /    \ `,
				String.raw`    ____/      \____ `,
				String.raw`   /    \      /    \ `,
				String.raw`  /      \____/      \ `,
				String.raw`  \      /    \      / `,
				String.raw`   \____/      \____/ `,
				String.raw`   /    \      /    \ `,
				String.raw`  /      \____/      \ `,
				String.raw`  \      /    \      / `,
				String.raw`   \____/      \____/ `,
				String.raw`        \      / `,
				String.raw`         \____/ `,
				''
			],
			name: [
				String.raw` .d8888b.         d8888 88888888888 8888888888 888       888        d8888 Y88b   d88P`,
				String.raw`d88P  Y88b       d88888     888     888        888   o   888       d88888  Y88b d88P`,
				String.raw`888    888      d88P888     888     888        888  d8b  888      d88P888   Y88o88P`,
				String.raw`888            d88P 888     888     8888888    888 d888b 888     d88P 888    Y888P`,
				String.raw`888  88888    d88P  888     888     888        888d88888b888    d88P  888     888`,
				String.raw`888    888   d88P   888     888     888        88888P Y88888   d88P   888     888`,
				String.raw`Y88b  d88P  d8888888888     888     888        8888P   Y8888  d8888888888     888`,
				String.raw` "Y8888P88 d88P     888     888     8888888888 888P     Y888 d88P     888     888`
			],
			extra: [
				'',
				`Connected ${manager.options.shardCount} shards`
				// TODO: Add RabbitMQ information
			]
		})
	)
);
console.log('Ready');
