const Klasa = require('./lib/client');
const cfg = require('./config.js');

const Skyra = new Klasa({
    ownerID: cfg.ownerid,
    prefix: 's!',
    cmdEditing: true,
    cmdLogging: false,
    dash: cfg.dash,
    clientOptions: {
        disabledEvents: [
            'TYPING_START',
            'RELATIONSHIP_ADD',
            'RELATIONSHIP_REMOVE',
            'CHANNEL_PINS_UPDATE',
            'USER_NOTE_UPDATE',
            'MESSAGE_REACTION_REMOVE',
            'MESSAGE_REACTION_REMOVE_ALL'
        ],
        messageCacheMaxSize: 100,
        messageCacheLifetime: 60,
        messageSweepInterval: 120
    }
});

Skyra.login(cfg.tokens.bot.dev);
