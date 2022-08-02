import type { ManagerShardEventsMap } from '@discordjs/ws';
import { Listener } from 'skyra-shared';

export function makeWebSocketListener<K extends keyof ListenerEvents<ManagerShardEventsMap>>(
	event: K,
	cb: (...args: ListenerEvents<ManagerShardEventsMap>[K]) => unknown
) {
	class UserListener extends Listener {
		public constructor(context: Listener.Context, options: Listener.Options) {
			super(context, { ...options, emitter: 'ws', event });
		}

		public run(...args: ListenerEvents<ManagerShardEventsMap>[K]) {
			return cb(...args);
		}
	}

	return UserListener as typeof Listener;
}

type ListenerEvents<T> = T & { error: [error: Error] };
