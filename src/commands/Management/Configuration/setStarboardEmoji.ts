import { Command, util : { resolveEmoji }; } from; '../../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_SETSTARBOARDEMOJI_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETSTARBOARDEMOJI_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<Emoji:emoji>'
		});

		this.createCustomResolver('emoji', async(arg, possible, msg) => {
			const resolved = resolveEmoji(arg);
			if (resolved) return resolved;
			throw msg.language.get('RESOLVER_INVALID_EMOJI', possible.name);
		});
	}

	public async run(msg, [emoji]) {
		if (msg.guild.settings.starboard.emoji === emoji) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.settings.update('starboard.emoji', emoji);
		return msg.sendLocale('COMMAND_SETSTARBOARDEMOJI_SET', [emoji.includes(':') ? `<${emoji}>` : emoji]);
	}

}
