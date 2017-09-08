const { Collection } = require('discord.js');

const LocalMember = require('../interfaces/LocalMember');
const provider = require('../../providers/rethink');

class LocalManager extends Collection {

    constructor(client, guild) {
        super();

        Object.defineProperty(this, 'client', { value: client });
        Object.defineProperty(this, 'guild', { value: guild });
    }

    get(member) {
        return super.get(member) || this.createMember(member);
    }

    addMember(member, data) {
        const localMember = new LocalMember(this.guild, member, data);
        super.set(localMember.id, localMember);
        return localMember;
    }

    async createMember(member) {
        this.client.emit('log', `LOCALSCORES  | Created ${member} | ${this.guild}`, 'verbose');
        const localMember = new LocalMember(this.guild, member, {});
        await provider.append('localScores', this.guild, 'scores', localMember.toJSON())
            .then(() => super.set(localMember.id, localMember));
        return localMember;
    }

    async removeMember(member) {
        this.client.emit('log', `LOCALSCORES  | Removed ${member} | ${this.guild}`, 'warn');
        await provider.removeFromArrayByID('localScores', this.guild, 'scores', member);
        return super.delete(member);
    }

    async create() {
        this.client.emit('log', `LOCALSCORES  | Created ${this.guild}`, 'verbose');
        await provider.create('localScores', { id: this.guild, scores: [] });
        return this;
    }

}

class SocialLocalManager extends Collection {

    constructor(client) {
        super();
        Object.defineProperty(this, 'client', { value: client });
    }

    get(guild) {
        return super.get(guild) || new LocalManager(this.client, guild).create().then((localManager) => {
            super.set(guild, localManager);
            return localManager;
        });
    }

    sorted(guild) {
        return this.get(guild).sort((x, y) => +(x.score < y.score) || +(x.score === y.score) - 1);
    }

    getMember(guild, member) {
        const data = this.get(guild);
        if (data instanceof Promise) {
            return data.then(local => local.createMember(member));
        }
        return data.get(member);
    }

    set(id) {
        const localManager = new LocalManager(this.client, id);
        super.set(id, localManager);
        return localManager;
    }

    async delete(guild) {
        this.client.emit('log', `LOCALSCORES | Deleted ${this.guild}`, 'warn');
        await provider.delete('localScores', guild);
        return super.delete(guild);
    }

    all() {
        return this;
    }

}

module.exports = SocialLocalManager;
