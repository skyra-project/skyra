const router = require('express').Router(); // eslint-disable-line new-cap

module.exports = class RouterLeaderboard {

    constructor(client, util) {
        this.client = client;
        this.server = router;
        this.util = util;

        /* Global */
        this.server.get('/global', this.util.check.admin, (req, res) => {
            this.util.sendMessage(res, this.serializeList(this.client.handler.social.global, 'global'));
        });
        this.server.get('/global/:user', this.util.gateway.auth, async (req, res) => {
            const user = await this.client.users.fetch(req.params.user)
                .then(us => us.profile)
                .catch(() => null);

            if (!user) return this.util.throw(res, ...this.util.error.USER_NOT_FOUND);

            return this.util.sendMessage(res, this.serialize.global(user));
        });

        /* Local */
        this.server.param('guild', (req, res, next, id) => {
            const guild = this.client.guilds.get(id);
            if (!guild) return this.throw(res, ...this.util.error.GUILD_NOT_FOUND);
            if (!guild.available) return this.throw(res, ...this.error.GUILD_UNAVAILABLE);

            req.guild = guild;
            return next();
        });

        this.server.param('member', async (req, res, next, id) => {
            const guildMember = req.guild.members.fetch(id).catch(() => { this.util.throw(res, ...this.util.error.USER_NOT_FOUND); });
            if (!guildMember) return null;

            let member = this.client.handler.social.local.getMember(req.guild.id, guildMember.id);
            if (member instanceof Promise) member = await member;

            req.member = member;
            return next();
        });

        this.server.get('/local/:guild', this.util.gateway.auth, async (req, res) => {
            let guild = this.client.handler.social.local.get(req.guild.id);
            if (guild instanceof Promise) guild = await guild;

            return this.util.sendMessage(res, this.serializeList(guild, 'local'));
        });

        this.server.get('/local/:guild/:member', this.util.gateway.auth, (req, res) => {
            this.util.sendMessage(res, this.serialize.local(req.member));
        });

        this.server.post('/local/:guild/:member', this.util.gateway.auth, async (req, res) => {
            this.util.executeLevel(req, res, 3, req.guild, () => {
                const data = parseInt(req.body.payload);
                if (typeof data === 'undefined' || isNaN(data)) return this.util.throw(res, ...this.util.error.INVALID_ARGUMENT('payload', 'Integer')); // eslint-disable-line new-cap

                return req.member.update(data)
                    .then(() => this.util.sendMessage(res, `Successfully changed the value 'points' for ${req.params.member} to: ${data}`))
                    .catch(err => this.util.sendError(res, err));
            });
        });

        // this.server.delete('/local/:guild/:member', this.util.gateway.auth, async (req, res) => {
        //     this.util.executeLevel(req, res, 2, req.guild, () => req.member.destroy()
        //         .then(() => this.util.sendMessage(res, `Successfully destroyed the data for ${req.params.member}`))
        //         .catch(err => this.util.sendError(res, err)));
        // });

        this.server.get('*', (req, res) => {
            this.util.throw(res, ...this.util.error.UNKNOWN_ENDPOINT('leaderboards')); // eslint-disable-line new-cap
        });
    }

    serializeList(map, type) {
        const serializer = this.serialize[type];
        const output = [];
        for (const item of map.values()) output.push(serializer(item));
        return output;
    }

    get serialize() { // eslint-disable-line class-methods-use-this
        return {
            global: user => ({
                id: user.id,
                points: user.points,
                money: user.money,
                color: user.color,
                banner: user.banners,
                bannerList: user.bannerList,
                times: {
                    daily: user.timeDaily,
                    rep: user.timerep
                },
                playlist: user.playlist
            }),
            local: user => ({
                id: user.id,
                score: user.score
            })
        };
    }

};
