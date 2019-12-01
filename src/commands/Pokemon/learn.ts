import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchGraphQLPokemon, getPokemonLearnsetByFuzzy, POKEMON_EMBED_THUMBNAIL, resolveColour } from '../../lib/util/Pokemon';

export default class Learn extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['learnset', 'learnall'],
			cooldown: 10,
			description: language => language.tget('COMMAND_LEARN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_LEARN_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<pokemon:string> <move:moves> [generation:generation]',
			usageDelim: ' ',
			flagSupport: true
		});

		this.createCustomResolver('moves', arg => arg.toLowerCase().split(','));

		this.createCustomResolver('generation', (arg, _, message) => {
			if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(arg)) return this.client.arguments.get('integer')!.run(arg, _, message);
			throw message.language.tget('COMMAND_LEARN_INVALID_GENERATION', arg);
		});
	}

	public async run(message: KlasaMessage, [pokemon, moves, generation]: [string, string[], number]) {
		const learnset = await this.fetchAPI(message, pokemon, moves, generation);
		let levelUpMoves: string[] = [];
		let vctMoves: string[] = [];
		let tutorMoves: string[] = [];
		let tmMoves: string[] = [];
		let eggMoves: string[] = [];
		let eventMoves: string[] = [];
		let dreamworldMoves: string[] = [];

		const METHODS_TYPES = message.language.tget('COMMAND_LEARN_METHOD_TYPES');

		if (learnset.levelUpMoves) {
			levelUpMoves = learnset.levelUpMoves.map(
				move => this.parseMove(message, learnset.species, move.generation!, move.name!, METHODS_TYPES.BY_LEVEL_UP(move.level!))
			);
		}

		if (learnset.virtualTransferMoves) {
			vctMoves = learnset.virtualTransferMoves.map(
				move => this.parseMove(message, learnset.species, move.generation!, move.name!, METHODS_TYPES.THROUGH_VIRTUALCONSOLE_TRANSFER)
			);
		}

		if (learnset.tutorMoves) {
			tutorMoves = learnset.tutorMoves.map(
				move => this.parseMove(message, learnset.species, move.generation!, move.name!, METHODS_TYPES.FROM_TUTOR)
			);
		}

		if (learnset.tmMoves) {
			tmMoves = learnset.tmMoves.map(
				move => this.parseMove(message, learnset.species, move.generation!, move.name!, METHODS_TYPES.WITH_TM)
			);
		}

		if (learnset.eggMoves) {
			eggMoves = learnset.eggMoves.map(
				move => this.parseMove(message, learnset.species, move.generation!, move.name!, METHODS_TYPES.AS_EGGMOVE)
			);
		}

		if (learnset.eventMoves) {
			eventMoves = learnset.eventMoves.map(
				move => this.parseMove(message, learnset.species, move.generation!, move.name!, METHODS_TYPES.THROUGH_EVENT)
			);
		}

		if (learnset.dreamworldMoves) {
			dreamworldMoves = learnset.dreamworldMoves.map(
				move => this.parseMove(message, learnset.species, move.generation!, move.name!, METHODS_TYPES.THROUGH_DREAMWORLD)
			);
		}

		const embedTitles = message.language.tget('COMMAND_LEARN_EMBED_TITLES');

		return message.sendEmbed(new MessageEmbed()
			.setColor(resolveColour(learnset.color))
			.setAuthor(`#${learnset.num} - ${toTitleCase(learnset.species)}`, POKEMON_EMBED_THUMBNAIL)
			.setThumbnail(message.flagArgs.shiny ? learnset.shinySprite : learnset.sprite)
			.addField(
				embedTitles.BY_LEVEL_UP,
				this.parseMethod(message, levelUpMoves, learnset.species, embedTitles.BY_LEVEL_UP)
			)
			.addField(
				embedTitles.THROUGH_VIRTUALCONSOLE_TRANSFER,
				this.parseMethod(message, vctMoves, learnset.species, embedTitles.THROUGH_VIRTUALCONSOLE_TRANSFER)
			)
			.addField(
				embedTitles.FROM_TUTOR,
				this.parseMethod(message, tutorMoves, learnset.species, embedTitles.FROM_TUTOR)
			)
			.addField(
				embedTitles.WITH_TM,
				this.parseMethod(message, tmMoves, learnset.species, embedTitles.WITH_TM)
			)
			.addField(
				embedTitles.AS_EGGMOVE,
				this.parseMethod(message, eggMoves, learnset.species, embedTitles.AS_EGGMOVE)
			)
			.addField(
				embedTitles.THROUGH_EVENT,
				this.parseMethod(message, eventMoves, learnset.species, embedTitles.THROUGH_EVENT)
			)
			.addField(
				embedTitles.THROUGH_DREAMWORLD,
				this.parseMethod(message, dreamworldMoves, learnset.species, embedTitles.THROUGH_DREAMWORLD)
			));
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string, moves: string[], generation: number) {
		try {
			const apiParsedMoves = `[${moves.map(move => `"${move}"`).join(',')}]`;
			const { data } = await fetchGraphQLPokemon<'getPokemonLearnsetByFuzzy'>(getPokemonLearnsetByFuzzy(pokemon, apiParsedMoves, generation));
			return data.getPokemonLearnsetByFuzzy;
		} catch {
			throw message.language.tget('COMMAND_LEARN_QUERY_FAILED', pokemon, moves);
		}
	}

	private parseMove(message: KlasaMessage, pokemon: string, generation: number, move: string, method: string) {
		return message.language.tget('COMMAND_LEARN_METHOD', generation, pokemon, move, method);
	}

	private parseMethod(message: KlasaMessage, learnMethod: string[], pokemon: string, byMethod: string) {
		if (!learnMethod.length) return message.language.tget('COMMAND_LEARN_CANNOT_LEARN', toTitleCase(pokemon), byMethod);

		return learnMethod.join('\n');
	}

}
