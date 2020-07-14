import 'module-alias/register';
import '@utils/initClean';
import 'reflect-metadata';
import { SkyraClient } from '@lib/SkyraClient';
import { DbSet } from '@lib/structures/DbSet';
import { TOKENS } from '@root/config';
import { floatPromise } from '@utils/util';
import { inspect } from 'util';
inspect.defaultOptions.depth = 1;

const client = new SkyraClient();

async function main() {
	await DbSet.connect();
	await client.login(TOKENS.BOT_TOKEN);
}

floatPromise({ client }, main());
