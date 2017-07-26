const toTitleCase = require("../functions/toTitleCase");
const provider = require("../providers/json");
const { resolve } = require("path");
const moment = require("moment");
const { Collection } = require("discord.js");
const express = require("express");
const DashboardUser = require("./dashboardUser");
const availableBanners = require("../assets/banners.json");

// Express Plugins
const passport = require("passport");
const session = require("express-session");
const { Strategy } = require("passport-discord");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { renderFile } = require("ejs");

const API = require("./routes/api");

module.exports = class Dashboard {

    constructor(client) {
        this.client = client;
        this.users = new Collection();
        this.owner = client.config.ownerID;
        this.routes = resolve(client.baseDir, "views");
        this.server = express();
        this.server.use(helmet.noCache());
        this.server.use(session({
            secret: "SkyraProjectTM",
            resave: false,
            saveUninitialized: false,
        }));
        this.server.use("/css", express.static(resolve(this.routes, "blocks", "css")));
        this.server.use("/img", express.static(resolve(this.routes, "blocks", "img")));
        this.server.use("/js", express.static(resolve(this.routes, "blocks", "js")));
        this.server.use("/vendor", express.static(resolve(this.routes, "blocks", "vendor")));
        this.server.use(passport.initialize());
        this.server.use(passport.session());
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({ extended: true }));
        this.server.use("html", renderFile);

        this.supportGuild = "https://discordapp.com/invite/6gakFR2";

        this.api = new API(client);

        this.server.use("/api", this.api.server);

        this.util = this.api.util;

        passport.serializeUser((id, done) => {
            done(null, id);
        });
        passport.deserializeUser((id, done) => {
            done(null, this.users.get(id));
        });
        passport.use(new Strategy({
            clientID: client.user.id,
            clientSecret: client.config.dash.oauthSecret,
            callbackURL: client.config.dash.callback,
            scope: ["identify", "guilds"],
        }, (accessToken, refreshToken, profile, done) => {
            this.users.set(profile.id, new DashboardUser(this.client, profile));
            process.nextTick(() => done(null, profile.id));
        }));

        const thisClient = {
            guilds: client.guilds,
            invite: client.invite,
            avatar: client.user.avatarURL(),
        };

        const getUser = (req) => {
            if (req.isAuthenticated() === false) return { id: null, username: null, avatar: null, auth: false };
            return Object.assign({ auth: true }, req.user);
        };

        const sendError = (req, res, code, error) => res.status(code).render(resolve(this.routes, "error.ejs"), { thisClient, user: getUser(req), code, path: error });

        const getGuild = (req, res, callback) => {
            const guild = this.client.guilds.get(req.params.guild);
            if (!guild) return sendError(req, res, 404, "Guild Not found");
            if (!guild.available) return sendError(req, res, 503, "Guild Unavailable");

            return callback(guild);
        };

        const executeLevel = async (req, res, level, guild, callback) => {
            if (req.user.id === this.client.config.ownerID);
            else {
                const moderator = await guild.fetchMember(req.user.id).catch(() => null);
                if (!moderator || this.util.hasLevel(guild, moderator, level) !== true) return sendError(req, res, 403, "Access denied");
            }

            return callback();
        };

        const throwError = (req, res, err) => {
            this.client.emit("log", err, "error");
            return sendError(req, res, 500, err);
        };

        const entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;",
            "/": "&#x2F;",
            "`": "&#x60;",
        };

        const escapeHTML = text => String(text).replace(/[&<>"'`/]/g, s => entityMap[s]);
        const buildHTML = text => text.replace(/\\n/g, "<br />").replace(/= \w+ =/g, match => `<h5>${match.replace(/=/g, "").trim()}</h5>`);
        const levelHTML = (level) => {
            switch (level) {
                case 0: return `<span style="float:right;" class="label label-default">${level}</span>`;
                case 1:
                case 2:
                case 3:
                case 4: return `<span style="float:right;" class="label label-warning">${level}</span>`;
                default: return `<span style="float:right;" class="label label-danger">${level}</span>`;
            }
        };

        this.commands = new Collection();
        for (const command of this.client.commands.values()) {
            if (command.conf.permLevel === 10) continue;
            const cat = command.help.category;
            if (!this.commands.has(cat)) this.commands.set(cat, []);
            const description = `<h5>Description</h5>${escapeHTML(command.help.description)}<br /><br />`;
            const html = description + (command.help.extendedHelp ? buildHTML(escapeHTML(command.help.extendedHelp)) : "Not set");
            this.commands.get(cat).push({ level: levelHTML(command.conf.permLevel), guildOnly: !command.conf.runIn.includes("dm"), name: toTitleCase(command.help.name), description: command.help.description, html });
        }

        /* Offline Endpoints */
        this.server.get("/", (req, res) => {
            res.render(resolve(this.routes, "index.ejs"), { thisClient, user: getUser(req), banners: this.banners });
        });
        this.server.get("/commands", (req, res) => {
            res.render(resolve(this.routes, "commands.ejs"), { thisClient, user: getUser(req), commands: this.commands });
        });
        this.server.get("/statistics", (req, res) => {
            res.render(resolve(this.routes, "statistics.ejs"), { thisClient, user: getUser(req), usage: this.client.usage });
        });
        this.server.get("/invite", (req, res) => {
            res.redirect(client.invite);
        });
        this.server.get("/join", (req, res) => {
            res.redirect(this.supportGuild);
        });

        /* JSON Endpoints */
        this.server.get("/statistics/json", (req, res) => {
            res.json(this.client.usage);
        });

        /* Discord Endpoints */
        this.server.get("/login", passport.authenticate("discord"));
        this.server.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
            res.redirect("/");
        });
        this.server.get("/logout", (req, res) => {
            req.logout();
            res.redirect("/");
        });

        /* Dashboard Related Endpoints */
        this.server.get("/dashboard", this.util.check.auth, (req, res) => {
            res.render(resolve(this.routes, "dashboard.ejs"), { thisClient, user: getUser(req), page: "Dashboard", guilds: req.user.managableGuilds });
        });
        this.server.get("/admin", this.util.check.admin, (req, res) => {
            res.render(resolve(this.routes, "dashboard.ejs"), { thisClient, user: getUser(req), page: "Admin", guilds: thisClient.guilds });
        });

        /* User Related Endpoints */
        this.server.get("/me", this.util.check.auth, (req, res) => {
            res.redirect(`/users/${req.user.id}`);
        });
        this.server.get("/users/:id", this.util.check.auth, (req, res) => {
            client.fetchUser(req.params.id)
                .then(user => res.render(resolve(this.routes, "profile.ejs"), { thisClient, user: getUser(req), profile: user.profile }))
                .catch(() => sendError(req, res, 404, "Not found"));
        });

        /* News */
        this.server.get("/news", (req, res) => {
            provider.getAll("news")
                .then(news => res.render(resolve(this.routes, "newslist.ejs"), { thisClient, user: getUser(req), news }))
                .catch(err => throwError(req, res, err));
        });
        this.server.get("/news/:id", (req, res) => {
            provider.get("news", req.param.id)
                .then((news) => {
                    if (!news) sendError(req, res, 404, "Announcement not found");
                    else res.render(resolve(this.routes, "new.ejs"), { thisClient, user: getUser(req), news });
                })
                .catch(err => throwError(req, res, err));
        });

        /* Guild Related Endpoints */
        this.server.get("/guilds/:guild", this.util.check.auth, (req, res) => {
            getGuild(req, res, guild => executeLevel(req, res, 3, guild, () => {
                res.render(resolve(this.routes, "guild.ejs"), { thisClient, user: getUser(req), moment, guild, settings: guild.settings });
            }));
        });
        this.server.get("/manage/:guild", this.util.check.auth, (req, res) => {
            getGuild(req, res, guild => executeLevel(req, res, 3, guild, () => {
                res.render(resolve(this.routes, "manage.ejs"), { thisClient, user: getUser(req), moment, guild, settings: guild.settings });
            }));
        });
        this.server.get("/modlogs/:guild", this.util.check.auth, (req, res) => {
            getGuild(req, res, guild => executeLevel(req, res, 3, guild, () => {
                guild.settings.moderation.getCases()
                    .then(cases => res.render(resolve(this.routes, "modlogs.ejs"), { thisClient, user: getUser(req), moment, modlogs: cases }))
                    .catch(err => throwError(req, res, err));
            }));
        });

        /* Command Endpoints */
        this.server.post("/manage/:id/leave", this.util.check.auth, (req, res) => {
            getGuild(req, res, guild => executeLevel(req, res, 4, guild, async () => {
                const message = req.body;
                if (message) {
                    const channel = guild.channels.get(guild.settings.channels.default || guild.defaultChannel.id);
                    if (channel.postable) await channel.send(message).catch(e => this.client.emit("log", e, "error"));
                }
                guild.leave()
                    .then(() => res.json({ success: true, message: `Successfully left ${guild.name} (${guild.id})` }))
                    .catch(err => throwError(req, res, err));
            }));
        });

        this.server.get("/404", (req, res) => sendError(req, res, 404, "Not found"));
        this.server.get("*", (req, res) => sendError(req, res, 404, `Path not found: ${req.path}`));
        this.server.use((err, req, res) => throwError(req, res, err));

        this.site = this.server.listen(this.client.config.dash.port);
    }

    async init() {
        const users = [];
        for (const banner of Object.values(availableBanners)) {
            if (users.includes(banner.author)) continue;
            users.push(banner.author);
        }
        await Promise.all(users.map(u => this.client.fetchUser(u)));
        this.banners = [];
        for (const banner of Object.values(availableBanners)) {
            this.banners.push(Object.assign(banner, { resAuthor: this.client.users.get(banner.author).tag }));
        }
        return true;
    }

};
