const Komada = require("./classes/client");
const cfg = require("./config.js");

const Skyra = new Komada.Client({
    ownerID: cfg.ownerid,
    clientID: "251484593859985411",
    prefix: "&",
    cmdEditing: true,
    cmdLogging: true,
    userFriendlyRegExp: "((?:Hey )?Skyra(?:,|!) +)",
    dash: cfg.dash,
    clientOptions: {
        disabledEvents: [
            "TYPING_START",
            "RELATIONSHIP_ADD",
            "RELATIONSHIP_REMOVE",
            "CHANNEL_PINS_UPDATE",
            "USER_NOTE_UPDATE",
            "MESSAGE_REACTION_REMOVE",
            "MESSAGE_REACTION_REMOVE_ALL",
        ],
        messageCacheMaxSize: 80,
        messageCacheLifetime: 60,
        messageSweepInterval: 120,
    },
});

Skyra.login(cfg.tokens.bot.dev);
