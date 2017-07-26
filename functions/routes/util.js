module.exports = class Utils {

    constructor(client) {
        this.client = client;

        this.check = {
            auth: (req, res, next) => {
                if (req.isAuthenticated()) return next();
                return res.redirect("/login");
            },
            admin: (req, res, next) => {
                if (req.isAuthenticated() && req.user.id === client.config.ownerID) return next();
                return res.redirect("/");
            },
        };

        this.gateway = {
            auth: (req, res, next) => {
                if (req.isAuthenticated()) return next();
                return this.throw(res, ...this.error.AUTH_REQUIRED);
            },
            admin: (req, res, next) => {
                if (req.isAuthenticated() && req.user.id === client.config.ownerID) return next();
                return this.throw(res, ...this.error.DENIED_ACCESS);
            },
        };

        this.getGuild = (req, res, callback) => {
            const guild = this.client.guilds.get(req.params.guild);
            if (!guild) return this.throw(res, ...this.error.GUILD_NOT_FOUND);
            if (!guild.available) return this.throw(res, ...this.error.GUILD_UNAVAILABLE);

            return callback(guild);
        };

        this.executeLevel = async (req, res, level, guild, callback) => {
            if (req.user.id === this.client.config.ownerID);
            else {
                const moderator = await guild.fetchMember(req.user.id).catch(() => null);
                if (!moderator || this.hasLevel(guild, moderator, level) !== true) return this.throw(res, ...this.error.DENIED_ACCESS);
            }

            return callback();
        };

        this.hasLevel = (guild, member, level) => {
            const settings = guild.settings;
            for (let i = level; i < 11; i++) {
                if (this.permStructure[i].check(guild, settings, member)) return true;
                if (this.permStructure[i].break) return false;
            }
            return null;
        };

        this.throw = (res, code, message, type) => {
            const output = { success: false, message };
            if (type) Object.assign(output, { type });
            res.status(code).send(output);
        };

        this.error = {
            GUILD_NOT_FOUND: [404, "Guild not found", "GUILD_NOT_FOUND"],
            GUILD_UNAVAILABLE: [503, "Guild not available", "GUILD_UNAVAILABLE"],
            USER_NOT_FOUND: [404, "User not found", "USER_NOT_FOUND"],
            MEMBER_NOT_FOUND: [404, "Member not found", "MEMBER_NOT_FOUND"],
            ROLE_NOT_FOUND: [404, "Role not found", "ROLE_NOT_FOUND"],
            CHANNEL_NOT_FOUND: [404, "Channel not found", "CHANNEL_NOT_FOUND"],
            DENIED_ACCESS: [403, "Access denied", "DENIED_ACCESS"],
            AUTH_REQUIRED: [401, "This endpoint requires authentication", "AUTH_REQUIRED"],
            PARSE_ERROR: error => [400, `Failed to parse an argument. Error: ${typeof error === "string" ? error : JSON.stringify(error)}`, "PARSE_ERROR"],
            UNKNOWN_NEWS: news => [404, `The announcement '${news}' does not exist`, "UNKNOWN_NEWS"],
            INVALID_ARGUMENT: (param, type) => [400, `'${param}' must be type: ${type}`, "INVALID_ARGUMENT"],
            UNKNOWN_ENDPOINT: endpoint => [404, `Unknown /${endpoint} endpoint`, "UNKNOWN_ENDPOINT"],
        };

        this.sendError = (res, error) => {
            this.client.emit("log", error, "error");
            this.throw(res, 500, error);
        };

        this.sendMessage = (res, data) => {
            res.send({ success: true, data });
        };
    }

    get permStructure() {
        return [{
            check: () => true,
            break: false,
        }, {
            check: (guild, settings, member) => {
                if (settings && settings.roles.staff && member.roles.has(settings.roles.staff)) return true;
                else if (member.permissions.has("MANAGE_MESSAGES")) return true;
                return false;
            },
            break: false,
        }, {
            check: (guild, settings, member) => {
                if (settings && settings.roles.moderator && member.roles.has(settings.roles.moderator)) return true;
                else if (member.permissions.has("BAN_MEMBERS")) return true;
                return false;
            },
            break: false,
        }, {
            check: (guild, settings, member) => {
                if (settings && settings.roles.admin && member.roles.has(settings.roles.admin)) return true;
                else if (member.permissions.has("ADMINISTRATOR")) return true;
                return false;
            },
            break: false,
        }, {
            check: () => false,
            break: false,
        }, {
            check: () => false,
            break: false,
        }, {
            check: () => false,
            break: false,
        }, {
            check: () => false,
            break: false,
        }, {
            check: () => false,
            break: false,
        }, {
            check: (guild, settings, member) => member.id === this.client.config.ownerID,
            break: true,
        }, {
            check: (guild, settings, member) => member.id === this.client.config.ownerID,
            break: false,
        }];
    }

};
