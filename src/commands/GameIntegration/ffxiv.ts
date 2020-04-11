import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { BrandingColors } from '@utils/constants';
import { FFXIV } from '@utils/GameIntegration/FFXIVTypings';
import { FFXIVClasses, FFXIV_BASE_URL, getCharacterDetails, searchCharacter, searchItem, SubCategoryEmotes } from '@utils/GameIntegration/FFXIVUtils';
import { getColor } from '@utils/util';
import { EmbedField, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Language } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['finalfantasy'],
			cooldown: 10,
			description: language => language.tget('COMMAND_FFXIV_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_FFXIV_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			subcommands: true,
			usage: '(item|character:default) <search:...string> ',
			usageDelim: ' '
		});
	}

	public async character(message: KlasaMessage, [name]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const characterDetails = await this.fetchCharacter(message.language, name);

		await this.buildCharacterDisplay(message, characterDetails.Character).start(response, message.author.id);
		return response;
	}

	public async item(message: KlasaMessage, [item]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const itemDetails = await this.fetchItems(message.language, item);

		await this.buildItemDisplay(message, itemDetails).start(response, message.author.id);

		return response;
	}

	private async fetchCharacter(i18n: Language, name: string) {
		const searchResult = await searchCharacter(i18n, name);

		if (!searchResult.Results.length) throw i18n.tget('COMMAND_FFXIV_NO_CHARACTER_FOUND');

		return getCharacterDetails(i18n, searchResult.Results[0].ID);
	}

	private async fetchItems(i18n: Language, item: string) {
		const searchResult = await searchItem(i18n, item);

		if (!searchResult.Results.length) throw i18n.tget('COMMAND_FFXIV_NO_ITEM_FOUND');

		return searchResult.Results;
	}

	private buildCharacterDisplay(message: KlasaMessage, character: FFXIV.Character) {
		const {
			discipleOfTheHandJobs,
			discipleOfTheLandJobs,
			healerClassValues,
			magRangedDPSClassValues,
			meleeDPSClassValues,
			phRangedDPSClassValues,
			tankClassValues
		} = this.parseCharacterClasses(character.ClassJobs);

		const TITLES = message.language.tget('COMMAND_FFXIV_CHARACTER_FIELDS');

		return new UserRichDisplay(
			new MessageEmbed()
				.setColor(getColor(message))
				.setAuthor(character.Name, character.Avatar, `https://eu.finalfantasyxiv.com/lodestone/character/${character.ID}/`)
		)
			.addPage((embed: MessageEmbed) => embed
				.setThumbnail(character.Avatar)
				.setImage(character.Portrait)
				.addField(TITLES.SERVER_AND_DC, [character.Server, character.DC].join(' - '), true)
				.addField(TITLES.TRIBE, character.Tribe.Name, true)
				.addField(TITLES.CHARACTER_GENDER, character.GenderID === 1 ? `${TITLES.MALE}` : `${TITLES.FEMALE}`, true)
				.addField(TITLES.NAMEDAY, character.Nameday, true)
				.addField(TITLES.GUARDIAN, character.GuardianDeity.Name, true)
				.addField(TITLES.CITY_STATE, character.Town.Name, true)
				.addField(TITLES.GRAND_COMPANY, character.GrandCompany.Company?.Name || TITLES.NONE, true)
				.addField(TITLES.RANK, character.GrandCompany.Rank?.Name || TITLES.NONE, true)
				.addBlankField(true))
			.addPage((embed: MessageEmbed) => embed
				.setTitle(TITLES.DOW_DOM_CLASSES)
				.addField(`${SubCategoryEmotes.Tank} ${TITLES.TANK}`, tankClassValues.join('\n'), true)
				.addField(`${SubCategoryEmotes.Healer} ${TITLES.HEALER}`, healerClassValues.join('\n'), true)
				.addField(`${SubCategoryEmotes.Melee} ${TITLES.MELEEDPS}`, meleeDPSClassValues.join('\n'), true)
				.addField(`${SubCategoryEmotes.phRange} ${TITLES.PHYSICALRANGEDDPS}`, phRangedDPSClassValues.join('\n'), true)
				.addField(`${SubCategoryEmotes.magRange} ${TITLES.MAGICALRANGEDDPS}`, magRangedDPSClassValues.join('\n'), true))
			.addPage((embed: MessageEmbed) => {
				embed.fields = discipleOfTheHandJobs;
				embed
					.setTitle(TITLES.DOH_CLASSES)
					.addBlankField(true);
				return embed;
			})
			.addPage((embed: MessageEmbed) => {
				embed.fields = discipleOfTheLandJobs;
				embed.setTitle(TITLES.DOL_CLASSES);
				return embed;
			});
	}

	private buildItemDisplay(message: KlasaMessage, items: FFXIV.ItemSearchResult[]) {
		const TITLES = message.language.tget('COMMAND_FFXIV_ITEM_FIELDS');
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(getColor(message))
		);

		for (const item of items) {
			display.addPage((embed: MessageEmbed) => embed
				.setDescription(item.Description.split('\n')[0])
				.setAuthor(item.Name, `${FFXIV_BASE_URL}${item.Icon}`)
				.setThumbnail(`${FFXIV_BASE_URL}${item.Icon}`)
				.addField(TITLES.KIND, item.ItemKind.Name, true)
				.addField(TITLES.CATEGORY, item.ItemSearchCategory.Name || TITLES.NONE, true)
				.addField(TITLES.LEVEL_EQUIP, item.LevelEquip, true));
		}

		return display;
	}

	private parseCharacterClasses(classJobs: FFXIV.ClassJob[]) {

		const discipleOfTheHandJobs: EmbedField[] = [];
		const discipleOfTheLandJobs: EmbedField[] = [];
		const tankClassValues: string[] = [];
		const healerClassValues: string[] = [];
		const meleeDPSClassValues: string[] = [];
		const phRangedDPSClassValues: string[] = [];
		const magRangedDPSClassValues: string[] = [];

		for (const classJob of classJobs) {
			const classDetails = FFXIVClasses.get(classJob.Job.Abbreviation)!;

			switch (classDetails.subcategory) {
				case FFXIV.ClassSubcategory.DoH:
					discipleOfTheHandJobs.push({
						name: `${classDetails.emote} ${classDetails.fullName}`,
						value: classJob.Level.toString(),
						inline: true
					});
					break;
				case FFXIV.ClassSubcategory.DoL:
					discipleOfTheLandJobs.push({
						name: `${classDetails.emote} ${classDetails.fullName}`,
						value: classJob.Level.toString(),
						inline: true
					});
					break;
				case FFXIV.ClassSubcategory.Tank:
					tankClassValues.push(
						`${classDetails.emote} **${classDetails.fullName}**: ${classJob.Level}`
					);
					break;
				case FFXIV.ClassSubcategory.Healer:
					healerClassValues.push(
						`${classDetails.emote} **${classDetails.fullName}**: ${classJob.Level}`
					);
					break;
				case FFXIV.ClassSubcategory.MDPS:
					meleeDPSClassValues.push(
						`${classDetails.emote} **${classDetails.fullName}**: ${classJob.Level}`
					);
					break;
				case FFXIV.ClassSubcategory.PRDPS:
					phRangedDPSClassValues.push(
						`${classDetails.emote} **${classDetails.fullName}**: ${classJob.Level}`
					);
					break;
				case FFXIV.ClassSubcategory.MRDPS:
					magRangedDPSClassValues.push(
						`${classDetails.emote} **${classDetails.fullName}**: ${classJob.Level}`
					);
					break;
			}
		}

		return {
			discipleOfTheHandJobs,
			discipleOfTheLandJobs,
			tankClassValues,
			healerClassValues,
			meleeDPSClassValues,
			phRangedDPSClassValues,
			magRangedDPSClassValues
		};
	}

}
