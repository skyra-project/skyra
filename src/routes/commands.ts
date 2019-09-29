import { Route, RouteStore } from 'klasa-dashboard-hooks';
import ApiRequest from '../lib/structures/api/ApiRequest';
import ApiResponse from '../lib/structures/api/ApiResponse';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'commands' });
	}

	public get(request: ApiRequest, response: ApiResponse) {
		const { lang, category } = request.params;
		const language = (lang && this.client.languages.get(lang)) || this.client.languages.default;
		const commands = (category
			? this.client.commands.filter(cmd => cmd.category === category)
			: this.client.commands
		).filter(cmd => cmd.permissionLevel < 9);

		const serializedCommands = commands.map(cmd => ({
			bucket: cmd.bucket,
			category: cmd.category,
			cooldown: cmd.cooldown,
			description: typeof cmd.description === 'function' ? cmd.description(language) : cmd.description,
			guarded: cmd.guarded,
			guildOnly: !cmd.runIn.includes('dm'),
			name: cmd.name,
			permissionLevel: cmd.permissionLevel,
			requiredPermissions: cmd.requiredPermissions.toArray(),
			usage: cmd.usageString
		}));
		return response.json(serializedCommands);
	}

}
