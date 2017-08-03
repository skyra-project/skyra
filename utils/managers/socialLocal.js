const { Collection } = require('discord.js');

const LocalMember = require('../interfaces/LocalMember');
const provider = require('../../providers/rethink');

class LocalManager extends Collection {

    constructor(guild) {
        super();

        Object.defineProperty(this, 'guild', { value: guild });
    }

    get(member) {
        return super.get(member) || this.createMember(member);
    }

    addMember(member, data) {
        const localMember = new LocalMember(this.guild, member, data);
        return super.set(localMember.id, localMember);
    }

    async createMember(member) {
        const localMember = new LocalMember(this.guild, member, {});
        await provider.append('localScores', this.guild, 'scores', member.toJSON())
            .then(() => super.set(localMember.id, localMember));
        return localMember;
    }

    async removeMember(member) {
        await provider.removeFromArrayByID('localScores', this.guild, 'scores', member);
        return super.delete(member);
    }

    async create() {
        await provider.create('localScores', { id: this.guild, scores: [] });
        return this;
    }

}

class SocialLocalManager extends Collection {

    get(guild) {
        return super.get(guild) || new LocalManager(guild).create().then((localManager) => {
            super.set(guild, localManager);
            return localManager;
        });
    }

    getMember(guild, member) {
        const data = this.get(guild);
        if (data instanceof Promise) {
            return data.then(local => local.createMember(member));
        }
        return data.get(member);
    }

    set(id) {
        const localManager = new LocalManager(id);
        super.set(id, localManager);
        return localManager;
    }

    async delete(guild) {
        await provider.delete('localScores', guild);
        return super.delete(guild);
    }

    all() {
        return this;
    }

}

module.exports = SocialLocalManager;
