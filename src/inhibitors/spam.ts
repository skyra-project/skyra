const { Inhibitor } = require('../index');

export default class extends Inhibitor {

	public constructor(client: Skyra, store: InhibitorStore, file: string[], directory: string) {
		super(client, store, file, directory, { spamProtection: true });
	}

	public async run(msg, cmd) {
		if (!cmd.spam
			|| !msg.guild
			|| msg.guild.settings.channels.spam === msg.channel.id
			|| await msg.hasAtLeastPermissionLevel(5)) return;

		const channel = msg.guild.channels.get(msg.guild.settings.channels.spam);
		if (!channel) {
			await msg.guild.settings.reset('channels.spam');
			return;
		}

		if (!this.client.timeoutManager.set(`cooldown-${msg.channel.id}`, Date.now() + 30000, () => null))
			throw msg.language.get('INHIBITOR_SPAM', channel);
	}

}
