import { ShardingManager } from 'kurasuta';
import { join } from 'path';
import { TOKENS, CLIENT_OPTIONS, SHARD_COUNT, CLUSTER_COUNT, NAME } from '../config';
import { SkyraClient } from './lib/SkyraClient';

const sharder = new ShardingManager(join(__dirname, 'Skyra'), {
	client: SkyraClient,
	clientOptions: CLIENT_OPTIONS,
	clusterCount: CLUSTER_COUNT,
	name: NAME,
	shardCount: SHARD_COUNT,
	token: CLIENT_OPTIONS.dev ? TOKENS.BOT.DEV : TOKENS.BOT.STABLE
});

sharder.spawn().catch(error => console.error(error));
