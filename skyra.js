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
            'USER_NOTE_UPDATE'
        ],
        messageCacheMaxSize: 100,
        messageCacheLifetime: 120,
        messageSweepInterval: 120
    }
});

Skyra.login(config.tokens.bot.stable);

process.on('unhandledRejection', (err) => {
    if (!err) return;
    Skyra.console.log(`Uncaught Promise Error: \n${err.stack || err}`, 'wtf');
});
