const Komada = require("./classes/client");
const cfg = require("../config.js");

const Skyra = new Komada({
    ownerID: cfg.ownerid,
    prefix: "s!",
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

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/* eslint-disable no-eval */
rl.on("SIGINT", () => {
    rl.question("Eval code... ", async (answer) => {
        try {
            let out = eval(answer);
            if (out instanceof Promise) out = await out;
            console.dir(out, { depth: 0, colors: true });
        } catch (e) {
            console.error(e);
        }
    });
});
