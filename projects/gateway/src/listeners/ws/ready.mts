import { makeWebSocketListener } from '#lib/structures/ws-listener';
import { WebSocketShardEvents } from '@discordjs/ws';

export default makeWebSocketListener(WebSocketShardEvents.Ready, (payload) => {
	console.log(`[WS] ${payload.shardId} is now ready.`);
});
