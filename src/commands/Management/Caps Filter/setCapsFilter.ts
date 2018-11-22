import { Command } from '../../../index';

/* eslint-disable no-bitwise */
const VALUES = {
	alert: { value: 1 << 2, key: 'COMMAND_SETCAPSFILTER_ALERT' },
	log: { value: 1 << 1, key: 'COMMAND_SETCAPSFILTER_LOG' },
	delete: { value: 1 << 0, key: 'COMMAND_SETCAPSFILTER_DELETE' }
};

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: (language) => language.get('COMMAND_SETCAPSFILTER_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETCAPSFILTER_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<delete|log|alert|show:default> [enable|disable]',
			usageDelim: ' '
		});
	}

	public async run(msg, [type, mode = 'enable']) {
		const { capsfilter } = msg.guild.settings.selfmod;
		if (type === 'show') {
			return msg.sendLocale('COMMAND_SETCAPSFILTER_SHOW', [
				capsfilter & VALUES.alert.value,
				capsfilter & VALUES.log.value,
				capsfilter & VALUES.delete.value
			], { code: 'asciidoc' });
		}

		const { value, key } = VALUES[type];
		const enable = mode === 'enable';
		const changed = enable
			? capsfilter | value
			: capsfilter & ~value;
		if (capsfilter === changed) throw msg.language.get('COMMAND_SETCAPSFILTER_EQUALS');
		await msg.guild.settings.update('selfmod.capsfilter', changed);

		return msg.sendLocale(key, [enable]);
	}

}
