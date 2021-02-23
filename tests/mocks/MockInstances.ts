import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { SapphireClient } from '@sapphire/framework';
import { resolve } from 'path';

export const client = new SapphireClient();
export const commands = client.stores.get('commands');

class TestCommand extends SkyraCommand {}
export const command = new TestCommand(
	{ name: 'ping', path: resolve('/home/skyra/commands/General/Chat Bot Info/ping.js'), store: commands },
	{ description: LanguageKeys.Commands.General.PingDescription, extendedHelp: LanguageKeys.Commands.General.PingExtended, aliases: ['pong'] }
);

commands.set(command.name, command);
for (const alias of command.aliases) commands.aliases.set(alias, command);
