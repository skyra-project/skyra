import { LearnsetEntry, LearnsetLevelUpMove } from '@favware/graphql-pokemon';
import { toTitleCase } from '@klasa/utils';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getPokemonLearnsetByFuzzy, POKEMON_EMBED_THUMBNAIL, resolveColour } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['learnset', 'learnall'],
	cooldown: 10,
	description: language => language.tget('COMMAND_LEARN_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_LEARN_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '(generation:generation) <pokemon:string> <moves:...string> ',
	usageDelim: ' ',
	flagSupport: true
})
export default class Learn extends SkyraCommand {

	private kPokemonGenerations = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private kClientIntegerArg = this.client.arguments.get('integer')!;

	public async init() {
		this.createCustomResolver('generation', (arg, possible, message) => {
			if (this.kPokemonGenerations.has(arg)) return this.kClientIntegerArg.run(arg, possible, message);
			throw message.language.tget('COMMAND_LEARN_INVALID_GENERATION', arg);
		});
	}

	public async run(message: KlasaMessage, [generation = 8, pokemon, moves]: [number, string, string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

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
			throw message.language.tget('COMMAND_LEARN_QUERY_FAILED', pokemon, moves);
		}
	}

	private parseMove(message: KlasaMessage, pokemon: string, generation: number, move: string, method: string) {
		return message.language.tget('COMMAND_LEARN_METHOD', generation, pokemon, move, method);
	}

	private buildDisplay(message: KlasaMessage, learnsetData: LearnsetEntry, generation: number, moves: string[]) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(resolveColour(learnsetData.color))
			.setAuthor(`#${learnsetData.num} - ${toTitleCase(learnsetData.species)}`, POKEMON_EMBED_THUMBNAIL)
			.setTitle(message.language.tget('COMMAND_LEARN_TITLE', learnsetData.species, generation))
			.setThumbnail(message.flagArgs.shiny ? learnsetData.shinySprite : learnsetData.sprite));

		const methodTypes = message.language.tget('COMMAND_LEARN_METHOD_TYPES');
		const learnableMethods = Object
			.entries(learnsetData)
			.filter(([key, value]) => (
				key.endsWith('Moves')
				&& (value as LearnsetLevelUpMove[]).length
			)) as [keyof typeof methodTypes, LearnsetLevelUpMove[]][];

		if (learnableMethods.length === 0) {
			return display.addPage((embed: MessageEmbed) => embed
				.setDescription(message.language.tget('COMMAND_LEARN_CANNOT_LEARN', learnsetData.species, moves)));
		}

		for (const [methodName, methodData] of learnableMethods) {
			const method = methodData.map(move => this.parseMove(
				message, learnsetData.species, move.generation!, move.name!, methodTypes[methodName](move.level!)
			));

			display.addPage((embed: MessageEmbed) => embed
				.setDescription(method));
		}

		return display;
	}

}
