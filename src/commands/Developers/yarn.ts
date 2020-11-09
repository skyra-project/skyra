import { DbSet } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { CdnUrls } from '@lib/types/Constants';
import { YarnPkg } from '@lib/types/definitions/Yarnpkg';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Timestamp } from '@sapphire/time-utilities';
import { cutText } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { cleanMentions, fetch, FetchResultTypes, pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['npm', 'npm-package', 'yarn-package'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Developers.YarnDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Developers.YarnExtended),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<package:package>'
})
@CreateResolvers([
	[
		'package',
		async (arg, _, message) => {
			if (!arg) throw await message.fetchLocale(LanguageKeys.Commands.Developers.YarnNoPackage);
			return cleanMentions(message.guild!, arg.replace(/ /g, '-')).toLowerCase();
		}
	]
])
export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#dateTimestamp = new Timestamp('YYYY-MM-DD');

	public async run(message: KlasaMessage, [pkg]: [string]) {
		const language = await message.fetchLanguage();
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const result = await this.fetchApi(message, pkg);

		if (result.time && Reflect.has(result.time, 'unpublished'))
			throw language.get(LanguageKeys.Commands.Developers.YarnUnpublishedPackage, { pkg });

		const dataEmbed = await this.buildEmbed(result, message, language);
		return response.edit(undefined, dataEmbed);
	}

	private async fetchApi(message: KlasaMessage, pkg: string) {
		const language = await message.fetchLanguage();
		try {
			return await fetch<YarnPkg.PackageJson>(`https://registry.yarnpkg.com/${pkg}`, FetchResultTypes.JSON);
		} catch {
			throw language.get(LanguageKeys.Commands.Developers.YarnPackageNotFound, { pkg });
		}
	}

	private async buildEmbed(result: YarnPkg.PackageJson, message: KlasaMessage, language: Language) {
		const maintainers = result.maintainers.map((user) => `[${user.name}](${user.url ?? `https://www.npmjs.com/~${user.name}`})`);
		const latestVersion = result.versions[result['dist-tags'].latest];
		const dependencies = latestVersion.dependencies
			? this.trimArray(Object.keys(latestVersion.dependencies), language.get(LanguageKeys.Commands.Developers.YarnEmbedMoreText))
			: null;

		const author = this.parseAuthor(result.author);
		const dateCreated = result.time ? this.#dateTimestamp.displayUTC(result.time.created) : language.get(LanguageKeys.Globals.Unknown);
		const dateModified = result.time ? this.#dateTimestamp.displayUTC(result.time.modified) : language.get(LanguageKeys.Globals.Unknown);

		const { deprecated } = latestVersion;
		const description = cutText(result.description ?? '', 1000);
		const latestVersionNumber = result['dist-tags'].latest;
		const license = result.license || language.get(LanguageKeys.Globals.None);
		const mainFile = latestVersion.main || 'index.js';

		return new MessageEmbed()
			.setTitle(result.name)
			.setURL(
				message.commandText!.includes('yarn')
					? `https://yarnpkg.com/en/package/${result.name}`
					: `https://www.npmjs.com/package/${result.name}`
			)
			.setThumbnail(CdnUrls.NodeJSLogo)
			.setColor(await DbSet.fetchColor(message))
			.setDescription(
				cutText(
					[
						description,
						'',
						author ? language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionAuthor, { author }) : undefined,
						`${language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionMaintainers)}: **${cutText(
							language.list(maintainers, language.get(LanguageKeys.Globals.And)),
							500
						)}**`,
						language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionLatestVersion, { latestVersionNumber }),
						language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionLicense, { license }),
						language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionMainFile, { mainFile }),
						language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDateCreated, { dateCreated }),
						language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDateModified, { dateModified }),
						deprecated ? language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDeprecated, { deprecated }) : undefined,
						'',
						language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDependenciesLabel),
						dependencies && dependencies.length
							? language.list(dependencies, language.get(LanguageKeys.Globals.And))
							: language.get(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDependenciesNoDeps)
					]
						.filter((part) => part !== undefined)
						.join('\n'),
					2000
				)
			);
	}

	/**
	 * Trims an array to the first 10 entries of that array (indices 0-9) and adds a 10th index containing a count of extra entries
	 * @remark If the array has a length of less than 10 it is returned directly
	 * @param arr The array to trim
	 * @param moreText The text to show in the last entry of the array
	 */
	private trimArray(arr: string[], moreText: string) {
		if (arr.length > 10) {
			const len = arr.length - 10;
			arr = arr.slice(0, 10);
			arr.push(`${len} ${moreText}`);
		}

		return arr;
	}

	/**
	 * Parses an NPM author into a markdown-linked string
	 * @param author The author to parse
	 * @returns Markdown-linked string or undefined (if no author exists)
	 */
	private parseAuthor(author?: YarnPkg.Author): string | undefined {
		// If there is no author then return undefined
		if (!author) return undefined;

		// Parse the author name
		const authorName = `**${author.name}**`;
		const authorUrl = author.name.startsWith('@')
			? // If the author is an organization then use the Organization url
			  encodeURI(author.url ?? `https://www.npmjs.com/org/${author.name.slice(1)}`)
			: // Otherwise use the User url
			  encodeURI(author.url ?? `https://www.npmjs.com/~${author.name}`);

		return `[${authorName}](${authorUrl})`;
	}
}
