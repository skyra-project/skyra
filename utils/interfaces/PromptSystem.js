class Prompt {

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });

        this.currentUsage = (name, type, min, max) => ({
            type: 'required',
            possibles: [{ name, type, min, max }]
        });
    }

    async run(msg, type, i18n, alert = true, { min = null, max = null } = {}) {
        if (alert === true) await msg.send(i18n.get(`PROMPT_${type.toUpperCase()}`));
        const responses = await msg.channel.awaitMessages(message => message.author.id === msg.author.id, { time: 30000, errors: ['time'], max: 1 })
            .catch(() => { throw i18n.get('PROMPT_CANCEL'); });
        const response = responses.first();

        return this.client.argResolver[this.getResolver(type)](response.content, this.currentUsage(i18n.get('PROMPT_ARGUMENT'), type, min, max), 0, false, msg)
            .catch((message) => msg.send(message).then(() => this.run(msg, type, i18n, false, { min, max })));
    }

    getResolver(type) {
        switch (type) {
            case 'user':
            case 'member':
            case 'channel':
            case 'role': return `adv${type}`;
            default: return type;
        }
    }

}

module.exports = Prompt;
