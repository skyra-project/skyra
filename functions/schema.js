module.exports = class Configuration {

    static find(value = "") {
        return {
            channels: {
                announcement: {
                    type: "TextChannel",
                    default: null,
                    path: { channels: { announcement: value } },
                },
                default: {
                    type: "TextChannel",
                    default: null,
                    path: { channels: { default: value } },
                },
                log: {
                    type: "TextChannel",
                    default: null,
                    path: { channels: { log: value } },
                },
                modlog: {
                    type: "TextChannel",
                    default: null,
                    path: { channels: { mod: value } },
                },
                spam: {
                    type: "TextChannel",
                    default: null,
                    path: { channels: { spam: value } },
                },
            },
            roles: {
                admin: {
                    type: "Role",
                    default: null,
                    path: { roles: { admin: value } },
                },
                moderator: {
                    type: "Role",
                    default: null,
                    path: { roles: { moderator: value } },
                },
                staff: {
                    type: "Role",
                    default: null,
                    path: { roles: { staff: value } },
                },
                muted: {
                    type: "Role",
                    default: null,
                    path: { roles: { muted: value } },
                },
            },
            events: {
                channelcreate: {
                    type: "Boolean",
                    default: false,
                    path: { events: { channelCreate: value } },
                },
                guildbanadd: {
                    type: "Boolean",
                    default: false,
                    path: { events: { guildBanAdd: value } },
                },
                guildbanremove: {
                    type: "Boolean",
                    default: false,
                    path: { events: { guildBanRemove: value } },
                },
                commands: {
                    type: "Boolean",
                    default: false,
                    path: { events: { commands: value } },
                },
                guildmemberadd: {
                    type: "Boolean",
                    default: false,
                    path: { events: { guildMemberAdd: value } },
                },
                guildmemberremove: {
                    type: "Boolean",
                    default: false,
                    path: { events: { guildMemberRemove: value } },
                },
                guildmemberupdate: {
                    type: "Boolean",
                    default: false,
                    path: { events: { guildMemberUpdate: value } },
                },
                messagedelete: {
                    type: "Boolean",
                    default: false,
                    path: { events: { messageDelete: value } },
                },
                messagedeletebulk: {
                    type: "Boolean",
                    default: false,
                    path: { events: { messageDeleteBulk: value } },
                },
                messageupdate: {
                    type: "Boolean",
                    default: false,
                    path: { events: { messageUpdate: value } },
                },
                roleupdate: {
                    type: "Boolean",
                    default: false,
                    path: { events: { roleUpdate: value } },
                },
                modlogprotection: {
                    type: "Boolean",
                    default: false,
                    path: { events: { modLogProtection: value } },
                },
            },
            messages: {
                farewell: {
                    type: "Boolean",
                    default: false,
                    path: { messages: { farewell: value } },
                },
                greeting: {
                    type: "Boolean",
                    default: false,
                    path: { messages: { greeting: value } },
                },
                farewellmessage: {
                    type: "String",
                    default: null,
                    path: { messages: { farewellMessage: value } },
                },
                greetingmessage: {
                    type: "String",
                    default: null,
                    path: { messages: { greetingMessage: value } },
                },
            },
            master: {
                prefix: {
                    type: "String",
                    default: "s!",
                    path: { prefix: value },
                },
                mode: {
                    type: "Number",
                    default: 0,
                    min: 0,
                    max: 2,
                    path: { mode: value },
                },
            },
            selfmod: {
                invitelinks: {
                    type: "Boolean",
                    default: false,
                    path: { selfmod: { inviteLinks: value } },
                },
                ghostmention: {
                    type: "Boolean",
                    default: false,
                    path: { selfmod: { ghostmention: value } },
                },
                nomentionspam: {
                    type: "Boolean",
                    default: false,
                    path: { selfmod: { nomentionspam: value } },
                },
                nmsthreshold: {
                    type: "Number",
                    default: 20,
                    path: { selfmod: { nmsthreshold: value } },
                },
            },
        };
    }
};
