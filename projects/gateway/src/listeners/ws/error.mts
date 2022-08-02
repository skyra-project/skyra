import { makeWebSocketListener } from '#lib/structures/ws-listener';

export default makeWebSocketListener('error', (error) => {
	console.error('Received error:', error);
});
