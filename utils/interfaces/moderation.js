const provider = require('../../providers/rethink');

/**
 * @typedef  {Object} ModModerator
 * @property {string} id The moderator's ID.
 * @property {string} tag The moderator's tag.
 * @memberof ModerationCase
 */

/**
 * @typedef  {Object} ModUser
 * @property {string} id The user's ID.
 * @property {string} tag The user's tag.
 * @memberof ModerationCase
 */

/**
 * @typedef  {('ban'|'unban'|'softban'|'kick'|'mute'|'unmute'|'warn')} ModType
 * @memberof ModerationCase
 */

/**
 * @typedef  {Object} ModerationCase
 * @property {ModModerator} moderator The moderator who performed this action.
 * @property {ModUser}      user      The affected user.
 * @property {ModType}      type      The type of modlog.
 * @property {number}       case      The modlog case.
 * @property {?string}      reason    The reason of why the modlog was performed.
 * @property {string}       message   The message which contains the modlog sent.
 * @property {*}            extraData Anything, for example, an array of roles (Mute).
 * @memberof Moderation
 */

/* eslint-disable no-underscore-dangle, complexity */
module.exports = class Moderation {

    /**
     * Creates an instance of Moderation.
     * @param {string} guild The Guild's ID
     * @param {ModerationCase[]} mutes The mute modlogs.
     */
    constructor(guild, mutes = []) {
        this.id = guild;
        this.mutes = new Map();
        this.parseMutes(mutes);
    }

    parseMutes(mutes) {
        for (let i = 0; i < mutes.length; i++) this.mutes.set(mutes[i].user, mutes[i]);
    }

    exists() {
        return provider.has('moderation', this.id);
    }

    create() {
        return provider.create('moderation', {
            id: this.id,
            cases: []
        });
    }

    ensureModule() {
        return this.exists().then(bool => bool ? false : this.create());
    }

    getCases(id) {
        if (typeof id === 'string')
            return provider.getFromArrayByIndex('moderation', this.id, 'cases', id);

        return provider.get('moderation', this.id).then(doc => doc ? doc.cases : this.ensureModule().then(() => []));
    }

    getAmountCases() {
        return this.getCases().then(data => (data || []).length);
    }

    async getLastCase() {
        const data = await this.getCases();
        return data.length > 0 ? data[data.length - 1] || null : null;
    }

    /**
     * Add a new moderation case.
     * @param {ModerationCase} data A new moderation case.
     */
    async pushCase(data) {
        await this.ensureModule();
        await provider.append('moderation', this.id, 'cases', data);
        if (data.type === 'mute' || data.type === 'tmute') await this.syncMutes();
        else if (data.type === 'unmute') await this.appealMute(data.user);
    }

    /**
     * Update a case.
     * @param {any} index The log's case.
     * @param {ModerationCase} doc The new moderation case.
     * @returns {Promise}
     */
    updateCase(index, doc) {
        return provider.updateArrayByIndex('moderation', this.id, 'cases', index, doc);
    }

    getMutes() {
        return this.getCases().then(cases => cases.filter(obj => ['mute', 'tmute'].includes(obj.type) && obj.appeal !== true));
    }

    getMute(user) {
        return this.getMutes()
            .then(doc => doc.find(obj => ['mute', 'tmute'].includes(obj.type) && obj.user === user && obj.appeal !== true) || null);
    }

    syncMutes() {
        return this.getMutes().then((array) => {
            this.mutes = new Map();
            this.parseMutes(array);
        });
    }

    appealMute(user) {
        return this.getMute(user).then((doc) => {
            if (!doc) throw "This mute doesn't seem to exist";
            return this.updateCase(doc.case, { appeal: true }).then(() => this.syncMutes().then(() => true));
        });
    }

    async destroy() {
        if (!await this.exists()) throw 'This GuildConfig does not exist.';
        return provider.delete('moderation', this.id);
    }

};
