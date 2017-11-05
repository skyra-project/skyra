class Language {

	/**
     * @typedef {Object} LanguageOptions
     * @memberof Language
     * @property {string} [name = theFileName] The name of the finalizer
     * @property {boolean} [enabled=true] Whether the finalizer is enabled or not
     */

	/**
     * @param {Client} client The Discord Client
     * @param {string} dir The path to the core or user language pieces folder
     * @param {Array} file The path from the pieces folder to the finalizer file
     * @param {LanguageOptions} [options = {}] Optional Language settings
     */
	constructor(client, dir, file, options = {}) {
		this.client = client;
		this.dir = dir;
		this.file = file;
		this.name = options.name || file.slice(0, -3);
		this.enabled = 'enabled' in options ? options.enabled : true;

		this.type = 'language';
	}

	/**
     * The method to get language strings
     * @param {string} term The string or function to look up
     * @param {...any} args Any arguments to pass to the lookup
     * @returns {string|Function}
     */
	get(term, ...args) {
		if (!this.enabled && this !== this.client.languages.default) return this.client.languages.default.get(term, ...args);
		/* eslint-disable new-cap */
		if (!this.language[term]) {
			if (this === this.client.languages.default) return this.language.DEFAULT(term);
			return [
				`${this.language.DEFAULT(term)}`,
				'',
				`**${this.language.DEFAULT_LANGUAGE}:**`,
				`${(args.length > 0 ? this.client.languages.default.language[term](...args) : this.client.languages.default.language[term]) || this.client.languages.default.language.DEFAULT(term)}`
			].join('\n');
		}
		/* eslint-enable new-cap */
		return args.length > 0 ? this.language[term](...args) : this.language[term];
	}

	/**
     * The init method to be optionaly overwritten in actual languages
     * @abstract
     * @returns {Promise<void>}
     */
	async init() {
		// Optionally defined in extension Classes
	}

	// left for documentation
	/* eslint-disable no-empty-function */
	async reload() {}
	unload() {}
	disable() {}
	enable() {}
	/* eslint-enable no-empty-function */

}

require('./interfaces/Piece').applyToClass(Language);

module.exports = Language;
