import { LearnsetEntry, LearnsetLevelUpMove } from '@favware/graphql-pokemon';
import { toTitleCase } from '@klasa/utils';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CdnUrls } from '@lib/types/Constants';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getPokemonLearnsetByFuzzy, resolveColour } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

const kPokemonGenerations = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['learnset', 'learnall'],
	cooldown: 10,
	description: (language) => language.get('COMMAND_LEARN_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_LEARN_EXTENDED'),
	usage: '(generation:generation) <pokemon:string> <moves:...string> ',
	usageDelim: ' ',
	flagSupport: true
})
@CreateResolvers([
	[
		'generation',
		(arg, possible, message) => {
			if (kPokemonGenerations.has(arg)) return message.client.arguments.get('integer')!.run(arg, possible, message);
			throw message.language.get('COMMAND_LEARN_INVALID_GENERATION', { generation: arg });
		}
	]
])
export default class extends RichDisplayCommand {
	public async run(message: KlasaMessage, [generation = 8, pokemon, moves]: [number, string, string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(message.language.get('SYSTEM_LOADING')).setColor(BrandingColors.Secondary)
		);

		const movesList = moves.split(', ');
		const learnsetData = await this.fetchAPI(message, pokemon, movesList, generation);

		await this.buildDisplay(message, learnsetData, generation, movesList).start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string, moves: string[], generation: number) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonLearnsetByFuzzy'>(getPokemonLearnsetByFuzzy, { pokemon, moves, generation });
			return data.getPokemonLearnsetByFuzzy;
		} catch {
			throw message.language.get('COMMAND_LEARN_QUERY_FAILED', { pokemon, moves });
		}
	}

	private parseMove(message: KlasaMessage, pokemon: string, generation: number, move: string, method: string) {
		return message.language.get('COMMAND_LEARN_METHOD', { generation, pokemon, move, method });
	}

	private buildDisplay(message: KlasaMessage, learnsetData: LearnsetEntry, generation: number, moves: string[]) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(learnsetData.color))
				.setAuthor(`#${learnsetData.num} - ${toTitleCase(learnsetData.species)}`, CdnUrls.Pokedex)
				.setTitle(message.language.get('COMMAND_LEARN_TITLE', { pokemon: learnsetData.species, generation }))
				.setThumbnail(message.flagArgs.shiny ? learnsetData.shinySprite : learnsetData.sprite)
		);

		const methodTypes = message.language.get('COMMAND_LEARN_METHOD_TYPES');
		const learnableMethods = Object.entries(learnsetData).filter(
			([key, value]) => key.endsWith('Moves') && (value as LearnsetLevelUpMove[]).length
		) as [keyof typeof methodTypes, LearnsetLevelUpMove[]][];

		if (learnableMethods.length === 0) {
			return display.addPage((embed: MessageEmbed) =>
				embed.setDescription(message.language.get('COMMAND_LEARN_CANNOT_LEARN', { pokemon: learnsetData.species, moves }))
			);
		}

		for (const [methodName, methodData] of learnableMethods) {
			const method = methodData.map((move) =>
				this.parseMove(message, learnsetData.species, move.generation!, move.name!, methodTypes[methodName]({ level: move.level! }))
			);

			display.addPage((embed: MessageEmbed) => embed.setDescription(method));
		}

		return display;
	}
}
