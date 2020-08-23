import { LearnsetEntry, LearnsetLevelUpMove } from '@favware/graphql-pokemon';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CdnUrls } from '@lib/types/Constants';
import { toTitleCase } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getPokemonLearnsetByFuzzy, resolveColour } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, LanguageKeys } from 'klasa';

const kPokemonGenerations = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['learnset', 'learnall'],
	cooldown: 10,
	description: (language) => language.get('commandLearnDescription'),
	extendedHelp: (language) => language.get('commandLearnExtended'),
	usage: '[generation:generation] <pokemon:string> <moves:...string> ',
	usageDelim: ' ',
	flagSupport: true
})
@CreateResolvers([
	[
		'generation',
		(arg, possible, message) => {
			if (kPokemonGenerations.has(arg)) return message.client.arguments.get('integer')!.run(arg, possible, message);
			throw message.language.get('commandLearnInvalidGeneration', { generation: arg });
		}
	]
])
export default class extends RichDisplayCommand {
	public async run(message: KlasaMessage, [generation = 8, pokemon, moves]: [number, string, string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(message.language.get('systemLoading')).setColor(BrandingColors.Secondary)
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
			throw message.language.get('commandLearnQueryFailed', { pokemon, moves });
		}
	}

	private parseMove(message: KlasaMessage, pokemon: string, generation: number, move: string, method: string) {
		return message.language.get('commandLearnMethod', { generation, pokemon, move, method });
	}

	private buildDisplay(message: KlasaMessage, learnsetData: LearnsetEntry, generation: number, moves: string[]) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(learnsetData.color))
				.setAuthor(`#${learnsetData.num} - ${toTitleCase(learnsetData.species)}`, CdnUrls.Pokedex)
				.setTitle(message.language.get('commandLearnTitle', { pokemon: learnsetData.species, generation }))
				.setThumbnail(message.flagArgs.shiny ? learnsetData.shinySprite : learnsetData.sprite)
		);

		const learnableMethods = Object.entries(learnsetData).filter(
			([key, value]) => key.endsWith('Moves') && (value as LearnsetLevelUpMove[]).length
		) as [keyof ReturnType<LanguageKeys['commandLearnMethodTypes']>, LearnsetLevelUpMove[]][];

		if (learnableMethods.length === 0) {
			return display.addPage((embed: MessageEmbed) =>
				embed.setDescription(message.language.get('commandLearnCannotLearn', { pokemon: learnsetData.species, moves }))
			);
		}

		for (const [methodName, methodData] of learnableMethods) {
			const method = methodData.map((move) => {
				const methodTypes = message.language.get('commandLearnMethodTypes', { level: move.level });
				return this.parseMove(message, learnsetData.species, move.generation!, move.name!, methodTypes[methodName]);
			});

			display.addPage((embed: MessageEmbed) => embed.setDescription(method));
		}

		return display;
	}
}
