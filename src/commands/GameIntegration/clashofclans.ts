import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { TOKENS } from '../../../config';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { ClashOfClans } from '../../lib/types/definitions/ClashOfClans';
import { fetch, FetchResultTypes, getColor } from '../../lib/util/util';
import { BrandingColors } from '../../lib/util/constants';

const enum ClashOfClansFetchCategories {
	PLAYERS = 'players',
	CLANS = 'clans'
}

export default class extends SkyraCommand {

	private readonly kPlayerTagRegex = /#[A-Z0-9]{3,}/;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['coc'],
			cooldown: 10,
			description: language => language.tget('COMMAND_CLASHOFCLANS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_CLASHOFCLANS_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			subcommands: true,
			usage: '<player|clan:default> <query:tagOrName>',
			usageDelim: ' '
		});

		this.createCustomResolver('tagOrName', (arg, possible, message, [action]) => {
			if (action === 'clan') {
				return this.spreadStringArgument.run(arg, possible, message);
			}

			if (action === 'player') {
				if (this.kPlayerTagRegex.test(arg)) return this.stringArgument.run(arg, possible, message);

				throw message.language.tget('COMMAND_CLASHOFCLANS_INVALID_PLAYER_TAG', arg);
			}

			throw message.language.tget('SYSTEM_QUERY_FAIL');
		});
	}

	private get stringArgument() {
		return this.client.arguments.get('string')!;
	}

	private get spreadStringArgument() {
		return this.client.arguments.get('...string')!;
	}

	public async clan(message: KlasaMessage, [clan]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const { items: clanData } = await this.fetchAPI<ClashOfClansFetchCategories.CLANS>(message, clan, ClashOfClansFetchCategories.CLANS);

		if (!clanData.length) throw message.language.tget('COMMAND_CLASHOFCLANS_CLANS_QUERY_FAIL', clan);

		const display = this.buildClanDisplay(message, clanData);

		await display.start(response, message.author.id);
		return response;
	}

	public async player(message: KlasaMessage, [player]: [string]) {
		const playerData = await this.fetchAPI<ClashOfClansFetchCategories.PLAYERS>(message, player, ClashOfClansFetchCategories.PLAYERS);

		return message.send(this.buildPlayerEmbed(message, playerData));
	}

	private async fetchAPI<C extends ClashOfClansFetchCategories>(message: KlasaMessage, query: string, category: ClashOfClansFetchCategories) {
		try {
			const url = new URL(`https://api.clashofclans.com/v1/${category}/`);

			if (category === ClashOfClansFetchCategories.CLANS) {
				url.searchParams.append('name', query);
				url.searchParams.append('limit', '10');
			} else {
				url.href += encodeURIComponent(query);
			}

			return await fetch(url, {
				headers: {
					Authorization: `Bearer ${TOKENS.CLASH_OF_CLANS_KEY}`
				}
			}, FetchResultTypes.JSON) as Promise<C extends ClashOfClansFetchCategories.CLANS ? ClashOfClans.ClansResponse : ClashOfClans.Player>;
		} catch (err) {
			if (category === ClashOfClansFetchCategories.CLANS) throw message.language.tget(`COMMAND_CLASHOFCLANS_CLANS_QUERY_FAIL`, query);
			else throw message.language.tget(`COMMAND_CLASHOFCLANS_PLAYERS_QUERY_FAIL`, query);
		}
	}

	private buildPlayerEmbed(message: KlasaMessage, player: ClashOfClans.Player) {
		const TITLES = message.language.tget('COMMAND_CLASHOFCLANS_PLAYER_EMBED_TITLES');

		return new MessageEmbed()
			.setColor(getColor(message))
			.setThumbnail(player.league.iconUrls.medium)
			.setAuthor(`${player.tag} - ${player.name}`, player.clan.badgeUrls.large, `https://www.clashleaders.com/player/${player.name.toLowerCase()}-${player.tag.slice(1).toLowerCase()}`)
			.setDescription([
				`**${TITLES.XP_LEVEL}**: ${player.expLevel}`,
				`**${TITLES.BUILDER_HALL_LEVEL}**: ${player.builderHallLevel}`,
				`**${TITLES.TOWNHALL_LEVEL}**: ${player.townHallLevel}`,
				`**${TITLES.TOWNHALL_WEAPON_LEVEL}**: ${player.townHallWeaponLevel}`,
				`**${TITLES.TROPHIES}**: ${player.trophies}`,
				`**${TITLES.BEST_TROPHIES}**: ${player.bestTrophies}`,
				`**${TITLES.WAR_STARS}**: ${player.warStars}`,
				`**${TITLES.ATTACK_WINS}**: ${player.attackWins}`,
				`**${TITLES.DEFENSE_WINS}**: ${player.defenseWins}`,
				`**${TITLES.AMOUNT_OF_ACHIEVEMENTS}**: ${player.achievements.length}`,
				`**${TITLES.VERSUS_TROPHIES}**: ${player.versusTrophies}`,
				`**${TITLES.BEST_VERSUS_TROPHIES}**: ${player.bestVersusTrophies}`,
				`**${TITLES.VERSUS_BATTLE_WINS}**: ${player.versusBattleWins}`,
				`**${TITLES.CLAN_ROLE}**: ${toTitleCase(player.role)}`,
				`**${TITLES.CLAN_NAME}**: ${player.clan.name}`,
				`**${TITLES.LEAGUE_NAME}**: ${player.league.name}`
			].join('\n'));
	}

	private buildClanDisplay(message: KlasaMessage, clans: ClashOfClans.Clan[]) {
		const TITLES = message.language.tget('COMMAND_CLASHOFCLANS_CLAN_EMBED_TITLES');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		for (const clan of clans) {
			display.addPage((embed: MessageEmbed) => embed
				.setThumbnail(clan.badgeUrls.large)
				.setTitle(`${clan.tag} - ${clan.name}`)
				.setURL(`https://www.clashleaders.com/clan/${clan.name.toLowerCase().replace(/ /g, '-')}-${clan.tag.slice(1).toLowerCase()}`)
				.setDescription([
					`**${TITLES.CLAN_LEVEL}**: ${clan.clanLevel}`,
					`**${TITLES.CLAN_POINTS}**: ${clan.clanPoints}`,
					`**${TITLES.CLAN_VERSUS_POINTS}**: ${clan.clanVersusPoints}`,
					`**${TITLES.AMOUNT_OF_MEMBERS}**: ${clan.members}`,
					clan.description ? `**${TITLES.DESCRIPTION}**: ${clan.description}` : null,
					clan.location
						? `**${TITLES.LOCATION_NAME}**: ${clan.location.isCountry ? `:flag_${clan.location.countryCode.toLowerCase()}:` : ''} ${clan.location.name}`
						: null,
					`**${TITLES.WAR_FREQUENCY}**: ${clan.warFrequency}`,
					`**${TITLES.WAR_WIN_STREAK}**: ${clan.warWinStreak}`,
					`**${TITLES.WAR_WINS}**: ${clan.warWins}`,
					`**${TITLES.WAR_TIES}**: ${clan.warTies}`,
					`**${TITLES.WAR_LOSSES}**: ${clan.warLosses}`,
					`**${TITLES.WAR_LOG_PUBLIC}**: ${TITLES.WAR_LOG_PUBLIC_DESCR(clan.isWarLogPublic)}`
				].filter(val => val !== null).join('\n')));
		}

		return display;
	}

}
