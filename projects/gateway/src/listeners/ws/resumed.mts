import { makeWebSocketListener } from '#lib/structures/ws-listener';
import { WebSocketShardEvents } from '@discordjs/ws';

export default makeWebSocketListener(WebSocketShardEvents.Resumed, (payload) => {
	console.log(`[WS] ${payload.shardId} has resumed previous session.`);
});
