import { API } from '@discordjs/core/http-only';
import { container } from '@sapphire/framework';

let instance: API;
export function api() {
	return (instance ??= new API(container.client.rest as any));
}
