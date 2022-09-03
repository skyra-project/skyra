import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: [
		'abilities',
		'ability',
		'advantage',
		'bag',
		'dex',
		'dexter',
		'flavor',
		'flavors',
		'flavour',
		'flavours',
		'item',
		'learn',
		'learnall',
		'learnset',
		'matchup',
		'mon',
		'move',
		'poke',
		'pokeability',
		'pokedex',
		'pokeimage',
		'pokeitem',
		'pokemon',
		'pokesprite',
		'sprite',
		'type',
		'weakness'
	],
	description: LanguageKeys.Commands.General.V7Description,
	detailedDescription: LanguageKeys.Commands.General.V7Extended,
	hidden: true,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public messageRun(message: Message, args: SkyraCommand.Args) {
		const embed = new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor({
				name: this.container.client.user!.tag,
				iconURL: this.container.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
			})
			.setDescription(args.t(LanguageKeys.Commands.General.V7PokemonMessage, { command: args.commandContext.commandName }))
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}
