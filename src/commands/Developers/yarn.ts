import { Timestamp } from '@klasa/timestamp';
import { toTitleCase } from '@klasa/utils';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { YarnPkg } from '@lib/types/definitions/Yarnpkg';
import { LanguageKeys } from '@lib/types/Languages';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { cleanMentions, cutText, fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['npm', 'npm-package', 'yarn-package'],
	cooldown: 10,
	description: language => language.tget('COMMAND_YARN_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_YARN_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<package:package>'
})
@CreateResolvers([
	[
		'package', (arg, _, message) => {
			if (!arg) throw message.language.tget('COMMAND_YARN_NO_PACKAGE');
			return cleanMentions(message.guild!, arg.replace(/ /g, '-')).toLowerCase();
		}
	]
])
export default class extends SkyraCommand {

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#nodeJsLogo = 'https://cdn.skyra.pw/skyra-assets/nodejs_logo.png';
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#dateTimestamp = new Timestamp('YYYY-MM-DD');

	public async run(message: KlasaMessage, [pkg]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const result = await this.fetchApi(message, pkg);

		if (Reflect.has(result.time, 'unpublished')) throw message.language.tget('COMMAND_YARN_UNPUBLISHED_PACKAGE', pkg);

		const dataEmbed = await this.buildEmbed(result, message);
		return response.edit(undefined, dataEmbed);
	}

	private async fetchApi(message: KlasaMessage, pkg: string) {
		try {
			return await fetch<YarnPkg.PackageJson>(`https://registry.yarnpkg.com/${pkg}`, FetchResultTypes.JSON);
		} catch {
			throw message.language.tget('COMMAND_YARN_PACKAGE_NOT_FOUND', pkg);
		}
	}

	private async buildEmbed(result: YarnPkg.PackageJson, message: KlasaMessage) {
		const EMBED_DATA = message.language.tget('COMMAND_YARN_EMBED_DATA');

		const maintainers = result.maintainers.map(user => `[${user.name}](${user.url ?? `https://www.npmjs.com/~${user.name}`})`);
		const latestVersion = result.versions[result['dist-tags'].latest];
		const dependencies = latestVersion.dependencies ? this.trimArray(Object.keys(latestVersion.dependencies), EMBED_DATA.MORE_TEXT) : null;

		return new MessageEmbed()
			.setTitle(toTitleCase(result.name))
			.setURL(`https://yarnpkg.com/en/package/${result.name}`)
			.setThumbnail(this.#nodeJsLogo)
			.setColor(await DbSet.fetchColor(message))
			.setDescription(EMBED_DATA.DESCRIPTION(
				cutText(result.description, 1000),
				this.parseAuthor(result.author), maintainers, result['dist-tags'].latest,
				result.license, latestVersion.main ?? 'index.js',
				this.#dateTimestamp.displayUTC(result.time.created), this.#dateTimestamp.displayUTC(result.time.modified),
				dependencies
			));
	}

	/**
	 * Trims an array to the first 10 entries of that array (indices 0-9) and adds a 10th index containing a count of extra entries
	 * @remark If the array has a length of less than 10 it is returned directly
	 * @param arr The array to trim
	 * @param moreText The text to show in the last entry of the array
	 */
	private trimArray(arr: string[], moreText: LanguageKeys['COMMAND_YARN_EMBED_DATA']['MORE_TEXT']) {
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
		const authorName = `[**${author.name}**]`;

		// If the author is an organization then use the Organization url
		if (author.name.startsWith('@')) return `${authorName}(${author.url ?? `https://www.npmjs.com/org/${author.name.slice(1)}`})`;

		// Otherwise use the User url
		return `${authorName}(${author.url ?? `https://www.npmjs.com/~${author.name}`})`;
	}

}
