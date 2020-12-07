import { SkyraClient } from '#lib/SkyraClient';
import { getRootDirectory } from '#utils/RootDir';
import { Awaited } from '@sapphire/utilities';
import { Collection, Message } from 'discord.js';
import { readdir, stat } from 'fs/promises';
import i18next, { StringMap, TFunction, TOptions } from 'i18next';
import Backend, { i18nextFsBackend } from 'i18next-fs-backend';
import { join } from 'path';

export class In17nHandler {
	/**
	 * Describes whether `In17nHandler#init` has been run and languages are loaded in `In17nHandler.languages`.
	 */
	public languagesLoaded = false;
	/**
	 * A `Collection` of "i18next" language functions keyed by their language code.
	 */
	public languages!: Collection<string, TFunction>;

	private readonly languagesDir: string;
	private readonly backendOptions: i18nextFsBackend.i18nextFsBackendOptions;

	public constructor(private readonly client: SkyraClient) {
		this.languagesDir = this.client.options.i18n?.defaultLanguageDirectory ?? join(getRootDirectory(), 'languages');
		this.backendOptions = {
			loadPath: join(this.languagesDir, '{{lng}}', '{{ns}}.json'),
			addPath: this.languagesDir,
			...(this.client.options.i18n?.backend ?? {})
		};
	}

	public async init() {
		const { namespaces, languages } = await this.walkLanguageDirectory(this.languagesDir);

		i18next.use(Backend);
		await i18next.init({
			backend: this.backendOptions,
			fallbackLng: this.client.options.i18n?.defaultName ?? 'en-US',
			initImmediate: false,
			interpolation: {
				escapeValue: false
			},
			load: 'all',
			defaultNS: this.client.options.i18n?.defaultNS ?? 'default',
			ns: namespaces,
			preload: languages,
			...(this.client.options.i18n?.i18next ?? {})
		});

		this.languages = new Collection(languages.map((item) => [item, i18next.getFixedT(item)]));
		this.languagesLoaded = true;
	}

	/**
	 * Resolves the language from the message. The resolution order is at follows:
	 * client.fetchLanguage -> message.guild.preferredLocale -> this.client.options.i18n.defaultName -> 'en-US'
	 * @param message The message from which the language should be resolved.
	 */
	public async resolveNameFromMessage(message: Message): Promise<string> {
		const lang = await this.client.fetchLanguage(message);
		return lang ?? message.guild?.preferredLocale ?? this.client.options.i18n?.defaultName ?? 'en-US';
	}

	/**
	 * Resolves a localised string from a language, key, optional replaceables, and optional i18next options.
	 * @param name The language to be used.
	 * @param key The key that should be translated.
	 * @param replace The replaceable keys in translation string.
	 * @param options i18next language options.
	 */
	public resolveValue(name: string, key: string, replace?: Record<string, unknown>, options?: TOptions<StringMap>): Awaited<string> {
		if (!this.languagesLoaded) throw new Error('Cannot call this method until In17nHandler#init has been called');

		const language = this.languages.get(name);
		if (!language) throw new Error('Invalid language provided');

		return language(key, {
			defaultValue: language(this.client.options.i18n?.defaultMissingKey ?? 'default:default', { replace: { key } }),
			replace,
			...options
		});
	}

	private async walkLanguageDirectory(dir: string, namespaces: string[] = [], folderName = '') {
		const files = await readdir(dir);

		const languages: string[] = [];
		for (const file of files) {
			const stats = await stat(join(dir, file));
			if (stats.isDirectory()) {
				const isLanguage = file.includes('-');
				if (isLanguage) languages.push(file);

				({ namespaces } = await this.walkLanguageDirectory(join(dir, file), namespaces, isLanguage ? '' : `${file}/`));
				// If the file ends with .js, .map or .d.ts then ignore it entirely
			} else if (file.endsWith('.json')) {
				namespaces.push(`${folderName}${file.substr(0, file.length - 5)}`);
			}
		}

		return { namespaces: [...new Set(namespaces)], languages };
	}
}
