import { envIsDefined, envParseString } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { YarnPkg } from '#lib/types/definitions/Yarnpkg';
import { CdnUrls } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import { bold, hideLinkEmbed, hyperlink, time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { cutText } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import { stringify } from 'querystring';

const API_URL = `https://${process.env.NPM_SEARCH_ID}-dsn.algolia.net/1/indexes/npm-search/query`;

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('NPM_SEARCH_ID', 'NPM_SEARCH_KEY'),
	aliases: ['npm', 'npm-package', 'yarn-package', 'pnpm', 'pnpm-package'],
	description: LanguageKeys.Commands.Developers.YarnDescription,
	detailedDescription: LanguageKeys.Commands.Developers.YarnExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args, context: SkyraCommand.Context) {
		const pkg = encodeURIComponent((await args.rest('cleanString')).replaceAll(' ', '-').toLowerCase());
		const response = await sendLoadingMessage(message, args.t);

		const { hits } = await this.fetchApi(pkg);
		if (!hits.length) this.error(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(hits, message, args.t, context);

		await display.run(response, message.author);
		return response;
	}

	private async fetchApi(pkg: string) {
		try {
			return fetch<YarnPkg.YarnPkgResult>(
				API_URL,
				{
					method: FetchMethods.Post,
					headers: {
						'Content-Type': MimeTypes.ApplicationJson,
						'X-Algolia-API-Key': envParseString('NPM_SEARCH_KEY'),
						'X-Algolia-Application-Id': envParseString('NPM_SEARCH_ID')
					},
					body: JSON.stringify({
						params: stringify({
							query: pkg,
							hitsPerPage: 10
						})
					})
				},
				FetchResultTypes.JSON
			);
		} catch {
			this.error(LanguageKeys.Commands.Developers.YarnPackageNotFound, { pkg });
		}
	}

	private async buildDisplay(hits: YarnPkg.PackageData[], message: Message, t: TFunction, context: SkyraCommand.Context) {
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
		});

		for (const hit of hits) {
			const maintainers = hit.owners.map((user) => hyperlink(user.name, hideLinkEmbed(user.link)));
			const dependenciesKeys = Object.keys(hit.dependencies);
			const dependencies = dependenciesKeys.length
				? this.trimArray(dependenciesKeys, t(LanguageKeys.Commands.Developers.YarnEmbedMoreText))
				: null;
			const author = this.parseAuthor(hit.owner);
			const dateCreated = hit.created ? time(new Date(hit.created), TimestampStyles.ShortDate) : t(LanguageKeys.Globals.Unknown);
			const dateModified = hit.modified ? time(new Date(hit.modified), TimestampStyles.ShortDate) : t(LanguageKeys.Globals.Unknown);
			const description = cutText(hit.description ?? '', 1000);
			// const latestVersionNumer = hit.version;
			const license = hit.license || t(LanguageKeys.Globals.None);
			// const mainFile = latestVersion.main || 'index.js';

			display.addPageEmbed((embed) =>
				embed //
					.setTitle(hit.name)
					.setURL(
						context.commandName.includes('yarn')
							? `https://yarnpkg.com/en/package/${hit.name}`
							: `https://www.npmjs.com/package/${hit.name}`
					)
					.setThumbnail(CdnUrls.NodeJSLogo)
					.setDescription(
						cutText(
							[
								description,
								'',
								author ? t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionAuthor, { author }) : undefined,
								t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionMaintainers, { maintainers }),
								t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionLatestVersion, { latestVersionNumber: hit.version }),
								t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionLicense, { license }),
								t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDateCreated, { dateCreated }),
								t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDateModified, { dateModified }),
								hit.isDeprecated
									? t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDeprecated, { deprecated: hit.isDeprecated })
									: undefined,
								'',
								t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDependenciesLabel),
								dependencies?.length
									? t(LanguageKeys.Globals.AndListValue, { value: dependencies })
									: t(LanguageKeys.Commands.Developers.YarnEmbedDescriptionDependenciesNoDeps)
							]
								.filter((part) => part !== undefined)
								.join('\n'),
							2000
						)
					)
			);
		}

		return display;
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
	private parseAuthor(author?: YarnPkg.NpmPackageAuthor): string | undefined {
		// If there is no author then return undefined
		if (!author) return undefined;

		// Parse the author url
		const authorUrl = author.name.startsWith('@')
			? // If the author is an organization then use the Organization url
			  encodeURI(author.link ?? `https://www.npmjs.com/org/${author.name.slice(1)}`)
			: // Otherwise use the User url
			  encodeURI(author.link ?? `https://www.npmjs.com/~${author.name}`);

		return bold(hyperlink(author.name, hideLinkEmbed(authorUrl)));
	}
}
