const RichDisplay = require('./RichDisplay');

/**
 * RichMenu, for helping paginated embeds with reaction buttons
 * @extends RichDisplay
 */
class RichMenu extends RichDisplay {

    /**
     * A single unicode character
     * @typedef {string} emoji
     * @memberof RichMenu
     */

    /**
     * @typedef {object} RichMenuEmojisObject
     * @memberof RichMenu
     * @property {emoji} first
     * @property {emoji} back
     * @property {emoji} forward
     * @property {emoji} last
     * @property {emoji} jump
     * @property {emoji} info
     * @property {emoji} stop
     * @property {emoji} zero
     * @property {emoji} one
     * @property {emoji} two
     * @property {emoji} three
     * @property {emoji} four
     * @property {emoji} five
     * @property {emoji} six
     * @property {emoji} seven
     * @property {emoji} eight
     * @property {emoji} nine
     */

    /**
     * @typedef {object} MenuOption
     * @memberof RichMenu
     * @property {string} name The name of the option
     * @property {string} description The description of the option
     * @property {boolean} [inline = false] Whether the option should be inline
     */

    /**
     * @typedef {object} RichMenuRunOptions
     * @memberof RichMenu
     * @property {Function} [filter] A filter function to add to the ReactionHandler
     * @property {boolean} [stop = true] If a stop reaction should be included
     * @property {string} [prompt = 'Which page would you like to jump to?'] The prompt to be used when awaiting user input on a page to jump to
     * @property {number} [startPage = 0] The page to start the RichMenu on
     * @property {number} [max] The maximum total amount of reactions to collect
     * @property {number} [maxEmojis] The maximum number of emojis to collect
     * @property {number} [maxUsers] The maximum number of users to react
     * @property {number} [time] The maximum amount of time before this RichMenu should expire
     */

    /**
     * Constructs our RichMenu instance
     * @param  {external:MessageEmbed} [embed=new MessageEmbed()] A Template embed to apply to all pages
     */
    constructor(embed) {
        super(embed);

        /**
         * The default emojis to use for this menu
         * @name RichMenu#emojis
         * @type {RichMenuEmojisObject}
         */
        Object.assign(this.emojis, {
            zero: '0⃣',
            one: '1⃣',
            two: '2⃣',
            three: '3⃣',
            four: '4⃣',
            five: '5⃣',
            six: '6⃣',
            seven: '7⃣',
            eight: '8⃣',
            nine: '9⃣'
        });

        /**
         * If options have been paginated yet
         * @type {boolean}
         */
        this.paginated = false;

        /**
         * The options of this Menu
         * @type {MenuOption[]}
         */
        this.options = [];
    }

    /**
     * @throws You cannot directly add pages in a RichMenu
     */
    addPage() {
        throw new Error('You cannot directly add pages in a RichMenu');
    }

    /**
     * Adds a MenuOption
     * @param {string} name The name of the option
     * @param {string} body The description of the option
     * @param {boolean} [inline = false] Whether the option should be inline
     * @returns {RichMenu} this RichMenu
     */
    addOption(name, body, inline = false) {
        this.options.push({ name, body, inline });
        return this;
    }

    /**
     * Runs this RichMenu
     * @param {external:Message} msg A message to edit or use to send a new message with
     * @param {RichMenuRunOptions} options The options to use with this RichMenu
     * @returns {ReactionHandler}
     */
    async run(msg, options = {}) {
        if (!this.paginated) this._paginate();
        return super.run(msg, options);
    }

    /**
     * Determins the emojis to use in this menu
     * @param {emoji[]} emojis An array of emojis to use
     * @param {boolean} stop Whether the stop emoji should be included
     * @returns {emoji[]}
     * @private
     */
    _determineEmojis(emojis, stop) {
        emojis.push(this.emojis.zero, this.emojis.one, this.emojis.two, this.emojis.three, this.emojis.four, this.emojis.five, this.emojis.six, this.emojis.seven, this.emojis.eight, this.emojis.nine);
        if (this.options.length < 10) emojis = emojis.slice(0, this.options.length);
        return super._determineEmojis(emojis, stop);
    }

    /**
     * Converts MenuOptions into display pages
     * @returns {void}
     * @private
     */
    _paginate() {
        const page = this.pages.length;
        if (this.paginated) return null;
        super.addPage(embed => {
            for (let i = 0, option = this.options[i + (page * 10)]; i + (page * 10) < this.options.length && i < 10; i++, option = this.options[i + (page * 10)]) {
                embed.addField(`(${i}) ${option.name}`, option.body, option.inline);
            }
            return embed;
        });
        if (this.options.length > page * 10) return this._paginate();
        this.paginated = true;
        return null;
    }

}

module.exports = RichMenu;
