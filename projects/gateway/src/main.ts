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
	.on(WebSocketShardEvents.Dispatch, (payload) => console.log(payload.data.t));

await manager.connect();

console.log(
	gradient.vice.multiline(
		createBanner({
			logo: [
				String.raw`       __`,
				String.raw`    __╱‾‾╲__`,
				String.raw` __╱‾‾╲__╱‾‾╲__`,
				String.raw`╱‾‾╲__╱  ╲__╱‾‾╲`,
				String.raw`╲__╱  ╲__╱  ╲__╱`,
				String.raw`   ╲__╱  ╲__╱`,
				String.raw`      ╲__╱`,
				''
			],
			name: [
				String.raw`    _______  ________  ________  ________  ________  ________  ________ `,
				String.raw`  ╱╱       ╲╱        ╲╱        ╲╱        ╲╱  ╱  ╱  ╲╱        ╲╱    ╱   ╲ `,
				String.raw` ╱╱      __╱         ╱        _╱         ╱         ╱         ╱         ╱ `,
				String.raw`╱       ╱ ╱         ╱╱       ╱╱        _╱         ╱         ╱╲__      ╱ `,
				String.raw`╲________╱╲___╱____╱ ╲______╱ ╲________╱╲________╱╲___╱____╱   ╲_____╱ `
			],
			extra: [
				` Skyra ${envParseString('CLIENT_VERSION')} Gateway`,
				` ├ WebSocket: ${manager.options.shardCount} shards`,
				' └ RabbitMQ : Coming soon'
				// TODO: Add RabbitMQ information
			]
		})
	)
);
console.log('Ready');
