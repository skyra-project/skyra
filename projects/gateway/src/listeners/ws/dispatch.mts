import { makeWebSocketListener } from '#lib/structures/ws-listener';
import { WebSocketShardEvents } from '@discordjs/ws';

export default makeWebSocketListener(WebSocketShardEvents.Dispatch, (payload) => {
	console.log(payload.data.t);
});
