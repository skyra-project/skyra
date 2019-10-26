import assert from 'assert';
import { TextChannel, DMChannel } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/settings/UserSettings';

const REGEXP_ACCEPT = /^(y|ye|yea|yeah|yes|y-yes)$/i;
const SNEYRA_ID = '338249781594030090';

enum YesNoAnswer {
	Timeout,
	ImplicitNo,
	Yes,
}

async function askYesNo(channel: TextChannel | DMChannel, user: KlasaUser, question: string): Promise<YesNoAnswer> {
	await channel.send(question);
	const messages = await channel.awaitMessages(msg => msg.author.id === user.id, { time: 60000, max: 1 });
	if (!messages.size) return YesNoAnswer.Timeout;

	const response = messages.first()!;
	return REGEXP_ACCEPT.test(response.content)
		? YesNoAnswer.Yes
		: YesNoAnswer.ImplicitNo;
}

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
			return this.client.arguments.get('username')!.run(arg, possible, msg);
		});
	}

	public run(message: KlasaMessage, [user]: [KlasaUser | undefined]) {
		return user ? this._marry(message, user) : this._display(message);
	}

	public async _display(message: KlasaMessage) {
		const users = message.author.settings.get(UserSettings.Marry);
		if (users.length === 0) return message.sendLocale('COMMAND_MARRY_NOTTAKEN');

		const usernames = await Promise.all(users.map(user => this.client.fetchUsername(user)));
		return message.sendLocale('COMMAND_MARRY_WITH', [usernames]);
	}

	public async _marry(message: KlasaMessage, user: KlasaUser) {
		const { author, channel, language } = message;

		switch (user.id) {
			case this.client.user!.id: return message.sendLocale('COMMAND_MARRY_SKYRA');
			case SNEYRA_ID: return message.sendLocale('COMMAND_MARRY_SNEYRA');
			case author.id: return message.sendLocale('COMMAND_MARRY_SELF');
		}
		if (user.bot) return message.sendLocale('COMMAND_MARRY_BOTS');

		// settings is already sync by the monitors.
		const spouses = author.settings.get(UserSettings.Marry);
		const targetsSpouses = user.settings.get(UserSettings.Marry);

		// Warn if starting polygamy:
		// Check if the author is already monogamous.
		if (spouses.length === 1) {
			const answer = await askYesNo(channel, author, language.tget('COMMAND_MARRY_AUTHOR_TAKEN'));
			if (answer !== YesNoAnswer.Yes) return message.sendLocale('COMMAND_MARRY_AUTHOR_MULTIPLE_CANCEL', [await this.client.fetchUsername(spouses[0])]);
		// Check if the author's first potential spouse is already married.
		} else if (spouses.length === 0 && targetsSpouses.length > 0) {
			const answer = await askYesNo(channel, author, language.tget('COMMAND_MARRY_TAKEN', targetsSpouses.length));
			if (answer !== YesNoAnswer.Yes) return message.sendLocale('COMMAND_MARRY_MULTIPLE_CANCEL');
		}

		const answer = await askYesNo(channel, user, language.tget('COMMAND_MARRY_PETITION', author.username, user.username));
		switch (answer) {
			case YesNoAnswer.Timeout: return message.sendLocale('COMMAND_MARRY_NOREPLY');
			case YesNoAnswer.ImplicitNo: return message.sendLocale('COMMAND_MARRY_DENIED');
			case YesNoAnswer.Yes: break;
			default: assert.fail('unreachable');
		}

		await Promise.all([
			author.settings.update(UserSettings.Marry, user, { arrayAction: 'add' }),
			user.settings.update(UserSettings.Marry, author, { arrayAction: 'add' })
		]);

		return message.sendLocale('COMMAND_MARRY_ACCEPTED', [author, user]);
	}

}
