import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TOKENS } from '@root/config';
import { toTitleCase } from '@sapphire/utilities';
import { Mime } from '@utils/constants';
import { fetch, FetchMethods, FetchResultTypes } from '@utils/util';
import { Language } from 'klasa';
import { FFXIV } from './FFXIVTypings';

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
	private_key: TOKENS.XIVAPI_KEY
});
const FFXIV_HEADERS = {
	'Content-Type': Mime.Types.ApplicationJson
};

export async function getCharacterDetails(i18n: Language, id: number) {
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

		return await fetch<FFXIV.CharacterResult>(
			url,
			{
				method: FetchMethods.Post,
				headers: FFXIV_HEADERS,
				body: FFXIV_PAYLOAD
			},
			FetchResultTypes.JSON
		);
	} catch {
		throw i18n.get(LanguageKeys.Commands.GameIntegration.FFXIVNoCharacterFound);
	}
}

export async function searchCharacter(i18n: Language, name: string, server?: string) {
	try {
		const url = new URL(`${FFXIV_BASE_URL}/character/search`);
		url.searchParams.append('name', name);
		if (server) {
			if (FFXIVServers.includes(server.toLowerCase())) url.searchParams.append('server', toTitleCase(server));
			else throw i18n.get(LanguageKeys.Commands.GameIntegration.FFXIVInvalidServer);
		}

		return await fetch<FFXIV.SearchResponse<FFXIV.CharacterSearchResult>>(
			url,
			{
				method: FetchMethods.Post,
				headers: FFXIV_HEADERS,
				body: FFXIV_PAYLOAD
			},
			FetchResultTypes.JSON
		);
	} catch {
		throw i18n.get(LanguageKeys.Commands.GameIntegration.FFXIVNoCharacterFound);
	}
}

export async function searchItem(i18n: Language, item: string) {
	try {
		const url = new URL(`${FFXIV_BASE_URL}/search`);

		return await fetch<FFXIV.SearchResponse<FFXIV.ItemSearchResult>>(
			url,
			{
				method: FetchMethods.Post,
				headers: FFXIV_HEADERS,
				body: JSON.stringify({
					private_key: TOKENS.XIVAPI_KEY,
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
		throw i18n.get(LanguageKeys.Commands.GameIntegration.FFXIVNoItemFound);
	}
}

export const FFXIVClasses = new Map<string, FFXIV.ClassMap>([
	[
		'CRP',
		{
			fullName: 'Carpenter',
			emote: '<:Carpenter:668480887616438293>',
			subcategory: FFXIV.ClassSubcategory.DoH
		}
	],
	[
		'BSM',
		{
			fullName: 'Blacksmith',
			emote: '<:Blacksmith:668480886487908362>',
			subcategory: FFXIV.ClassSubcategory.DoH
		}
	],
	[
		'ARM',
		{
			fullName: 'Armorer',
			emote: '<:Armorer:668480883086458892>',
			subcategory: FFXIV.ClassSubcategory.DoH
		}
	],
	[
		'GSM',
		{
			fullName: 'Goldsmith',
			emote: '<:Goldsmith:668480921057361931>',
			subcategory: FFXIV.ClassSubcategory.DoH
		}
	],
	[
		'LTW',
		{
			fullName: 'Leatherworker',
			emote: '<:Leatherworker:668480922768769086>',
			subcategory: FFXIV.ClassSubcategory.DoH
		}
	],
	[
		'WVR',
		{
			fullName: 'Weaver',
			emote: '<:Weaver:668480964984307743>',
			subcategory: FFXIV.ClassSubcategory.DoH
		}
	],
	[
		'ALC',
		{
			fullName: 'Alchemist',
			emote: '<:Alchemist:668480881291427890>',
			subcategory: FFXIV.ClassSubcategory.DoH
		}
	],
	[
		'CUL',
		{
			fullName: 'Culinarian',
			emote: '<:Culinarian:668480889403080745>',
			subcategory: FFXIV.ClassSubcategory.DoH
		}
	],
	[
		'MIN',
		{
			fullName: 'Miner',
			emote: '<:Miner:668480924878503936>',
			subcategory: FFXIV.ClassSubcategory.DoL
		}
	],
	[
		'BTN',
		{
			fullName: 'Botanist',
			emote: '<:Botanist:668480886395895819>',
			subcategory: FFXIV.ClassSubcategory.DoL
		}
	],
	[
		'FSH',
		{
			fullName: 'Fisher',
			emote: '<:Fisher:668480891449770016>',
			subcategory: FFXIV.ClassSubcategory.DoL
		}
	],
	[
		'GLA',
		{
			fullName: 'Gladiator',
			emote: '<:Gladiator:668480892007874590>',
			subcategory: FFXIV.ClassSubcategory.Tank
		}
	],
	[
		'PLD',
		{
			fullName: 'Paladin',
			emote: '<:Paladin:668480928997441569>',
			subcategory: FFXIV.ClassSubcategory.Tank
		}
	],
	[
		'MRD',
		{
			fullName: 'Marauder',
			emote: '<:Marauder:668480923767144518>',
			subcategory: FFXIV.ClassSubcategory.Tank
		}
	],
	[
		'WAR',
		{
			fullName: 'Warrior',
			emote: '<:Warrior:668480962757394453>',
			subcategory: FFXIV.ClassSubcategory.Tank
		}
	],
	[
		'DRK',
		{
			fullName: 'Dark Knight',
			emote: '<:DarkKnight:668480889704939530>',
			subcategory: FFXIV.ClassSubcategory.Tank
		}
	],
	[
		'GNB',
		{
			fullName: 'Gunbreaker',
			emote: '<:Gunbreaker:668486588799516672>',
			subcategory: FFXIV.ClassSubcategory.Tank
		}
	],
	[
		'CNJ',
		{
			fullName: 'Conjurer',
			emote: '<:Conjurer:668480888102846504>',
			subcategory: FFXIV.ClassSubcategory.Healer
		}
	],
	[
		'WHM',
		{
			fullName: 'White Mage',
			emote: '<:WhiteMage:668480964988764180>',
			subcategory: FFXIV.ClassSubcategory.Healer
		}
	],
	[
		'SCH',
		{
			fullName: 'Scholar',
			emote: '<:Scholar:668480935104086036>',
			subcategory: FFXIV.ClassSubcategory.Healer
		}
	],
	[
		'AST',
		{
			fullName: 'Astrologian',
			emote: '<:Astrologian:668480884579500105>',
			subcategory: FFXIV.ClassSubcategory.Healer
		}
	],
	[
		'PGL',
		{
			fullName: 'Pugilist',
			emote: '<:Pugilist:668480928997179415>',
			subcategory: FFXIV.ClassSubcategory.MDPS
		}
	],
	[
		'MNK',
		{
			fullName: 'Monk',
			emote: '<:Monk:668480924752543747>',
			subcategory: FFXIV.ClassSubcategory.MDPS
		}
	],
	[
		'LNC',
		{
			fullName: 'Lancer',
			emote: '<:Lancer:668480923397914634>',
			subcategory: FFXIV.ClassSubcategory.MDPS
		}
	],
	[
		'DRG',
		{
			fullName: 'Dragoon',
			emote: '<:Dragoon:668480891026145281>',
			subcategory: FFXIV.ClassSubcategory.MDPS
		}
	],
	[
		'ROG',
		{
			fullName: 'Rogue',
			emote: '<:Rogue:668482057164292115>',
			subcategory: FFXIV.ClassSubcategory.MDPS
		}
	],
	[
		'NIN',
		{
			fullName: 'Ninja',
			emote: '<:Ninja:668480925063053332>',
			subcategory: FFXIV.ClassSubcategory.MDPS
		}
	],
	[
		'SAM',
		{
			fullName: 'Samurai',
			emote: '<:Samurai:668480929538375711>',
			subcategory: FFXIV.ClassSubcategory.MDPS
		}
	],
	[
		'ARC',
		{
			fullName: 'Archer',
			emote: '<:Archer:668480882713296908>',
			subcategory: FFXIV.ClassSubcategory.PRDPS
		}
	],
	[
		'BRD',
		{
			fullName: 'Bard',
			emote: '<:Bard:668480886349758465>',
			subcategory: FFXIV.ClassSubcategory.PRDPS
		}
	],
	[
		'MCH',
		{
			fullName: 'Machinist',
			emote: '<:Machinist:668480923032879135>',
			subcategory: FFXIV.ClassSubcategory.PRDPS
		}
	],
	[
		'DNC',
		{
			fullName: 'Dancer',
			emote: '<:Dancer:668575277349208064>',
			subcategory: FFXIV.ClassSubcategory.PRDPS
		}
	],
	[
		'THM',
		{
			fullName: 'Thaumaturge',
			emote: '<:Thaumaturge:668480935448150037>',
			subcategory: FFXIV.ClassSubcategory.MRDPS
		}
	],
	[
		'BLM',
		{
			fullName: 'Black Mage',
			emote: '<:BlackMage:668480886106357794>',
			subcategory: FFXIV.ClassSubcategory.MRDPS
		}
	],
	[
		'ACN',
		{
			fullName: 'Arcanist',
			emote: '<:Arcanist:668480881148559371>',
			subcategory: FFXIV.ClassSubcategory.MRDPS
		}
	],
	[
		'SMN',
		{
			fullName: 'Summoner',
			emote: '<:Summoner:668480935100022805>',
			subcategory: FFXIV.ClassSubcategory.MRDPS
		}
	],
	[
		'RDM',
		{
			fullName: 'Red Mage',
			emote: '<:RedMage:668480929089454081>',
			subcategory: FFXIV.ClassSubcategory.MRDPS
		}
	],
	[
		'BLU',
		{
			fullName: 'Blue Mage',
			emote: '<:BlueMage:668480886232317962>',
			subcategory: FFXIV.ClassSubcategory.MRDPS
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
