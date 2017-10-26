const Starboard = require('../eventsActions/Starboard');

class MessageReactionAdd {

    constructor(client) {
        this.client = client;
        this.starboard = new Starboard(this.client);
    }

    /**
     * @typedef  {Object} MessageReactionAddDataEmoji
     * @property {string} name
     * @property {string} id
     */

    /**
     * @typedef  {Object} MessageReactionAddData
     * @property {string} user_id
     * @property {string} message_id
     * @property {MessageReactionAddDataEmoji} emoji
     * @property {string} channel_id
     */

    /**
     * @typedef  {Object} MessageReactionAdd
     * @property {'MESSAGE_REACTION_ADD'} t
     * @property {number} s
     * @property {number} op
     * @property {MessageReactionAddData} d
     */

    /**
     * Parse the data, then run.
     * @param {MessageReactionAdd} data The raw data to work with.
     * @returns {boolean}
     */
    async parse(data) {
        const raw = data.d;
        if (!raw.emoji) return false;
        const user = await this.client.users.fetch(raw.user_id).catch(() => null);
        if (user === null) return false;

        const channel = this.client.channels.get(raw.channel_id);
        if (!channel || channel.type === 'voice') return false;

        return this.run({
            userId: raw.user_id,
            user,
            channelId: raw.channel_id,
            channel,
            emoji: raw.emoji,
            messageId: raw.message_id
        });
    }

    run(data) {
        return this.starboard.run(data).catch(error => this.client.emit('log', error, 'error'));
    }

}

module.exports = MessageReactionAdd;
