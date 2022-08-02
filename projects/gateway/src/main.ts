import { createClient, loadAll } from '#lib/Client';
import { envParseString, setup } from '@skyra/env-utilities';
import { createBanner } from '@skyra/start-banner';
import { GatewayIntentBits } from 'discord-api-types/v10';
import gradient from 'gradient-string';
import { container } from 'skyra-shared';

setup(new URL('../src/.env', import.meta.url));

createClient({
	ws: {
		intents:
			GatewayIntentBits.GuildBans |
			GatewayIntentBits.GuildEmojisAndStickers |
			GatewayIntentBits.GuildInvites |
			GatewayIntentBits.GuildMembers |
			GatewayIntentBits.GuildMessageReactions |
			GatewayIntentBits.GuildMessages |
			GatewayIntentBits.GuildVoiceStates |
			GatewayIntentBits.Guilds |
			GatewayIntentBits.MessageContent
	}
});

await loadAll();

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
				` ├ WebSocket: ${container.ws.options.shardCount} shards`,
				` └ Redis    : ${container.redis.options.host}:${container.redis.options.port}`
			]
		})
	)
);
console.log('Ready');
