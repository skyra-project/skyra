import { LanguageKeys } from '#lib/i18n/languageKeys';
import { CharacterResult, CharacterSearchResult, ClassMap, ClassSubcategory, ItemSearchResult, SearchResponse } from '#lib/types';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { UserError } from '@sapphire/framework';
import { MimeTypes } from '@sapphire/plugin-api';
import { toTitleCase } from '@sapphire/utilities';
import { URL } from 'url';

export const FFXIVServers = [
	'adamantoise',
	'aegis',
	'alexander',
	'anima',
	'asura',
	'atomos',
	'bahamut',
	'balmung',
	'behemoth',
	'belias',
	'brynhildr',
	'cactuar',
	'carbuncle',
	'cerberus',
	'chocobo',
	'coeurl',
	'diabolos',
	'durandal',
	'excalibur',
	'exodus',
	'faerie',
	'famfrit',
	'fenrir',
	'garuda',
	'gilgamesh',
	'goblin',
	'gungnir',
	'hades',
	'hyperion',
	'ifrit',
	'ixion',
	'jenova',
	'kujata',
	'lamia',
	'leviathan',
	'lich',
	'louisoix',
	'malboro',
	'mandragora',
	'masamune',
	'mateus',
	'midgardsormr',
	'moogle',
	'odin',
	'omega',
	'pandaemonium',
	'phoenix',
	'ragnarok',
	'ramuh',
	'ridill',
	'sargatanas',
	'shinryu',
	'shiva',
	'siren',
	'tiamat',
	'titan',
	'tonberry',
	'typhon',
	'ultima',
	'ultros',
	'unicorn',
	'valefor',
	'yojimbo',
	'zalera',
	'zeromus',
	'zodiark',
	'spriggan',
	'twintania'
];

export const FFXIV_BASE_URL = 'https://xivapi.com';
const FFXIV_PAYLOAD = JSON.stringify({
	private_key: process.env.XIVAPI_TOKEN
});
const FFXIV_HEADERS = {
	'Content-Type': MimeTypes.ApplicationJson
};

export async function getCharacterDetails(id: number) {
	try {
		const url = new URL(`${FFXIV_BASE_URL}/character/${id}`);
		url.searchParams.append('extended', '1');
		url.searchParams.append('data', 'CJ');
		url.searchParams.append(
			'columns',
			[
				'Character.Name',
				'Character.Avatar',
				'Character.ID',
				'Character.Portrait',
				'Character.Server',
				'Character.DC',
				'Character.Tribe.Name',
				'Character.GenderID',
				'Character.Nameday',
				'Character.GuardianDeity.Name',
				'Character.Town.Name',
				'Character.GrandCompany.Company.Name',
				'Character.GrandCompany.Rank.Name',
				'Character.ClassJobs.*.Job.Abbreviation',
				'Character.ClassJobs.*.Level'
			].join(',')
		);

		return await fetch<CharacterResult>(
			url,
			{
				method: FetchMethods.Post,
				headers: FFXIV_HEADERS,
				body: FFXIV_PAYLOAD
			},
			FetchResultTypes.JSON
		);
	} catch {
		throw new UserError({ identifier: LanguageKeys.Commands.GameIntegration.FFXIVNoCharacterFound });
	}
}

export async function searchCharacter(name: string, server?: string) {
	try {
		const url = new URL(`${FFXIV_BASE_URL}/character/search`);
		url.searchParams.append('name', name);

		if (server) {
			if (FFXIVServers.includes(server.toLowerCase())) url.searchParams.append('server', toTitleCase(server));
			else throw new UserError({ identifier: LanguageKeys.Commands.GameIntegration.FFXIVInvalidServer });
		}

		return await fetch<SearchResponse<CharacterSearchResult>>(
			url,
			{
				method: FetchMethods.Post,
				headers: FFXIV_HEADERS,
				body: FFXIV_PAYLOAD
			},
			FetchResultTypes.JSON
		);
	} catch {
		throw new UserError({ identifier: LanguageKeys.Commands.GameIntegration.FFXIVNoCharacterFound });
	}
}

export async function searchItem(item: string) {
	try {
		const url = new URL(`${FFXIV_BASE_URL}/search`);

		return await fetch<SearchResponse<ItemSearchResult>>(
			url,
			{
				method: FetchMethods.Post,
				headers: FFXIV_HEADERS,
				body: JSON.stringify({
					private_key: process.env.XIVAPI_TOKEN,
					indexes: 'item',
					columns: 'Name,Description,ItemKind.Name,Icon,LevelEquip,ItemSearchCategory.Name',
					body: {
						query: {
							bool: {
								must: [
									{
										wildcard: {
											NameCombined_en: `*${encodeURIComponent(item.toLowerCase())}*`
										}
									}
								]
							}
						},
						from: 0,
						size: 10
					}
				})
			},
			FetchResultTypes.JSON
		);
	} catch {
		throw new UserError({ identifier: LanguageKeys.Commands.GameIntegration.FFXIVNoItemFound });
	}
}

export const FFXIVClasses = new Map<string, ClassMap>([
	[
		'CRP',
		{
			fullName: 'Carpenter',
			emote: '<:Carpenter:668480887616438293>',
			subcategory: ClassSubcategory.DoH
		}
	],
	[
		'BSM',
		{
			fullName: 'Blacksmith',
			emote: '<:Blacksmith:668480886487908362>',
			subcategory: ClassSubcategory.DoH
		}
	],
	[
		'ARM',
		{
			fullName: 'Armorer',
			emote: '<:Armorer:668480883086458892>',
			subcategory: ClassSubcategory.DoH
		}
	],
	[
		'GSM',
		{
			fullName: 'Goldsmith',
			emote: '<:Goldsmith:668480921057361931>',
			subcategory: ClassSubcategory.DoH
		}
	],
	[
		'LTW',
		{
			fullName: 'Leatherworker',
			emote: '<:Leatherworker:668480922768769086>',
			subcategory: ClassSubcategory.DoH
		}
	],
	[
		'WVR',
		{
			fullName: 'Weaver',
			emote: '<:Weaver:668480964984307743>',
			subcategory: ClassSubcategory.DoH
		}
	],
	[
		'ALC',
		{
			fullName: 'Alchemist',
			emote: '<:Alchemist:668480881291427890>',
			subcategory: ClassSubcategory.DoH
		}
	],
	[
		'CUL',
		{
			fullName: 'Culinarian',
			emote: '<:Culinarian:668480889403080745>',
			subcategory: ClassSubcategory.DoH
		}
	],
	[
		'MIN',
		{
			fullName: 'Miner',
			emote: '<:Miner:668480924878503936>',
			subcategory: ClassSubcategory.DoL
		}
	],
	[
		'BTN',
		{
			fullName: 'Botanist',
			emote: '<:Botanist:668480886395895819>',
			subcategory: ClassSubcategory.DoL
		}
	],
	[
		'FSH',
		{
			fullName: 'Fisher',
			emote: '<:Fisher:668480891449770016>',
			subcategory: ClassSubcategory.DoL
		}
	],
	[
		'GLA',
		{
			fullName: 'Gladiator',
			emote: '<:Gladiator:668480892007874590>',
			subcategory: ClassSubcategory.Tank
		}
	],
	[
		'PLD',
		{
			fullName: 'Paladin',
			emote: '<:Paladin:668480928997441569>',
			subcategory: ClassSubcategory.Tank
		}
	],
	[
		'MRD',
		{
			fullName: 'Marauder',
			emote: '<:Marauder:668480923767144518>',
			subcategory: ClassSubcategory.Tank
		}
	],
	[
		'WAR',
		{
			fullName: 'Warrior',
			emote: '<:Warrior:668480962757394453>',
			subcategory: ClassSubcategory.Tank
		}
	],
	[
		'DRK',
		{
			fullName: 'Dark Knight',
			emote: '<:DarkKnight:668480889704939530>',
			subcategory: ClassSubcategory.Tank
		}
	],
	[
		'GNB',
		{
			fullName: 'Gunbreaker',
			emote: '<:Gunbreaker:668486588799516672>',
			subcategory: ClassSubcategory.Tank
		}
	],
	[
		'CNJ',
		{
			fullName: 'Conjurer',
			emote: '<:Conjurer:668480888102846504>',
			subcategory: ClassSubcategory.Healer
		}
	],
	[
		'WHM',
		{
			fullName: 'White Mage',
			emote: '<:WhiteMage:668480964988764180>',
			subcategory: ClassSubcategory.Healer
		}
	],
	[
		'SCH',
		{
			fullName: 'Scholar',
			emote: '<:Scholar:668480935104086036>',
			subcategory: ClassSubcategory.Healer
		}
	],
	[
		'AST',
		{
			fullName: 'Astrologian',
			emote: '<:Astrologian:668480884579500105>',
			subcategory: ClassSubcategory.Healer
		}
	],
	[
		'PGL',
		{
			fullName: 'Pugilist',
			emote: '<:Pugilist:668480928997179415>',
			subcategory: ClassSubcategory.MDPS
		}
	],
	[
		'MNK',
		{
			fullName: 'Monk',
			emote: '<:Monk:668480924752543747>',
			subcategory: ClassSubcategory.MDPS
		}
	],
	[
		'LNC',
		{
			fullName: 'Lancer',
			emote: '<:Lancer:668480923397914634>',
			subcategory: ClassSubcategory.MDPS
		}
	],
	[
		'DRG',
		{
			fullName: 'Dragoon',
			emote: '<:Dragoon:668480891026145281>',
			subcategory: ClassSubcategory.MDPS
		}
	],
	[
		'ROG',
		{
			fullName: 'Rogue',
			emote: '<:Rogue:668482057164292115>',
			subcategory: ClassSubcategory.MDPS
		}
	],
	[
		'NIN',
		{
			fullName: 'Ninja',
			emote: '<:Ninja:668480925063053332>',
			subcategory: ClassSubcategory.MDPS
		}
	],
	[
		'SAM',
		{
			fullName: 'Samurai',
			emote: '<:Samurai:668480929538375711>',
			subcategory: ClassSubcategory.MDPS
		}
	],
	[
		'ARC',
		{
			fullName: 'Archer',
			emote: '<:Archer:668480882713296908>',
			subcategory: ClassSubcategory.PRDPS
		}
	],
	[
		'BRD',
		{
			fullName: 'Bard',
			emote: '<:Bard:668480886349758465>',
			subcategory: ClassSubcategory.PRDPS
		}
	],
	[
		'MCH',
		{
			fullName: 'Machinist',
			emote: '<:Machinist:668480923032879135>',
			subcategory: ClassSubcategory.PRDPS
		}
	],
	[
		'DNC',
		{
			fullName: 'Dancer',
			emote: '<:Dancer:668575277349208064>',
			subcategory: ClassSubcategory.PRDPS
		}
	],
	[
		'THM',
		{
			fullName: 'Thaumaturge',
			emote: '<:Thaumaturge:668480935448150037>',
			subcategory: ClassSubcategory.MRDPS
		}
	],
	[
		'BLM',
		{
			fullName: 'Black Mage',
			emote: '<:BlackMage:668480886106357794>',
			subcategory: ClassSubcategory.MRDPS
		}
	],
	[
		'ACN',
		{
			fullName: 'Arcanist',
			emote: '<:Arcanist:668480881148559371>',
			subcategory: ClassSubcategory.MRDPS
		}
	],
	[
		'SMN',
		{
			fullName: 'Summoner',
			emote: '<:Summoner:668480935100022805>',
			subcategory: ClassSubcategory.MRDPS
		}
	],
	[
		'RDM',
		{
			fullName: 'Red Mage',
			emote: '<:RedMage:668480929089454081>',
			subcategory: ClassSubcategory.MRDPS
		}
	],
	[
		'BLU',
		{
			fullName: 'Blue Mage',
			emote: '<:BlueMage:668480886232317962>',
			subcategory: ClassSubcategory.MRDPS
		}
	]
]);

export const enum SubCategoryEmotes {
	Tank = '<:TankRole:668480935125057585>',
	Healer = '<:HealerRole:668480921225134140>',
	Melee = '<:DPSRole:668480891257094154>',
	phRange = '<:PhysicalRangedDPS:668569637688049674>',
	magRange = '<:MagicalRangedDPS:668569637839044632>',
	DoH = '<:DisciplesoftheHand:668569637700763659>',
	DoL = '<:DisciplesoftheLand:668569656818139150>'
}
