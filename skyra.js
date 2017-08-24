const { Client, config } = require('./index');

const Skyra = new Client({
    ownerID: config.ownerid,
    prefix: 's!',
    cmdEditing: true,
    cmdLogging: false,
    dash: config.dash,
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

Skyra.login(config.tokens.bot.stable);
