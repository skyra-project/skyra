import { API } from '@discordjs/core/http-only';
import { container } from '@sapphire/framework';

export function api() {
	return (container.api ??= new API(container.client.rest as any));
}
