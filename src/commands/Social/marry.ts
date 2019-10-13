import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';

const REGEXP_ACCEPT = /^(y|ye|yea|yeah|yes)$/i;
const SNEYRA_ID = '338249781594030090';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 30,
			description: language => language.tget('COMMAND_MARRY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MARRY_EXTENDED'),
			runIn: ['text'],
			usage: '(user:username)'
		});

		this.createCustomResolver('username', (arg, possible, msg) => {
			if (!arg) return undefined;
			return this.client.arguments.get('username').run(arg, possible, msg);
		});
	}

	public run(message: KlasaMessage, [user]: [KlasaUser]) {
		return user ? this._marry(message, user) : this._display(message);
	}

	public async _display(message: KlasaMessage) {
		const marry = message.author!.settings.get(UserSettings.Marry);
		if (!marry) return message.sendLocale('COMMAND_MARRY_NOTTAKEN');
		const username = await this.client.fetchUsername(marry);
		return message.sendLocale('COMMAND_MARRY_WITH', [username || `<@${marry}>`]);
	}

	public async _marry(message: KlasaMessage, user: KlasaUser) {
		if (user.id === this.client.user!.id) return message.sendLocale('COMMAND_MARRY_SKYRA');
		if (user.id === SNEYRA_ID) return message.sendLocale('COMMAND_MARRY_SNEYRA');
		if (user.id === message.author!.id) return message.sendLocale('COMMAND_MARRY_SELF');
		if (user.bot) return message.sendLocale('COMMAND_MARRY_BOTS');

		// settings is already sync by the monitors.
		if (message.author!.settings.get(UserSettings.Marry)) return message.sendLocale('COMMAND_MARRY_AUTHOR_TAKEN');

		// Check if the target user is already married.
		await user.settings.sync();
		if (user.settings.get(UserSettings.Marry)) return message.sendLocale('COMMAND_MARRY_TAKEN');

		// Get a message from the user.
		await message.sendLocale('COMMAND_MARRY_PETITION', [message.author!, user]);
		const messages = await message.channel.awaitMessages(msg => msg.author!.id === user.id, { time: 60000, max: 1 });
		if (!messages.size) return message.sendLocale('COMMAND_MARRY_NOREPLY');

		const response = messages.first()!;
		if (!REGEXP_ACCEPT.test(response.content)) return message.sendLocale('COMMAND_MARRY_DENIED');

		// The user may have tried to marry somebody else while the prompt was running.
		if (user.settings.get(UserSettings.Marry)) return message.sendLocale('COMMAND_MARRY_TAKEN');
		if (message.author!.settings.get(UserSettings.Marry)) return message.sendLocale('COMMAND_MARRY_AUTHOR_TAKEN');

		await Promise.all([
			message.author!.settings.update(UserSettings.Marry, user),
			user.settings.update(UserSettings.Marry, message.author)
		]);

		return message.sendLocale('COMMAND_MARRY_ACCEPTED', [message.author!, user]);
	}

}
