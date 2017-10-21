const { Language, util } = require('../index');
const Duration = require('../utils/duration');
const moment = require('moment');

const TIMES = {
    DAY: {
        PLURAL: 'días',
        SING: 'día',
        SHORT_PLURAL: 'ds',
        SHORT_SING: 'd'
    },
    HOUR: {
        PLURAL: 'horas',
        SING: 'hora',
        SHORT_PLURAL: 'hrs',
        SHORT_SING: 'hr'
    },
    MINUTE: {
        PLURAL: 'minutos',
        SING: 'minuto',
        SHORT_PLURAL: 'mins',
        SHORT_SING: 'min'
    },
    SECOND: {
        PLURAL: 'segundos',
        SING: 'segundo',
        SHORT_PLURAL: 'segs',
        SHORT_SING: 'seg'
    }
};

const PERMS = {
    ADMINISTRATOR: 'Administrador',
    VIEW_AUDIT_LOG: 'Ver el Registro de Autoría',
    MANAGE_GUILD: 'Administrar el Servidor',
    MANAGE_ROLES: 'Administrar Roles',
    MANAGE_CHANNELS: 'Administrar Canales',
    KICK_MEMBERS: 'Expulsar Miembros',
    BAN_MEMBERS: 'Bloquear Miembros',
    CREATE_INSTANT_INVITE: 'Crear Invitación Instantánea',
    CHANGE_NICKNAME: 'Cambiar Apodo',
    MANAGE_NICKNAMES: 'Administrar Apodos',
    MANAGE_EMOJIS: 'Administrar Emojis',
    MANAGE_WEBHOOKS: 'Administrar Webhooks',
    VIEW_CHANNEL: 'Leer Mensajes',
    SEND_MESSAGES: 'Enviar Mensajes',
    SEND_TTS_MESSAGES: 'Enviar Mensajes de TTS',
    MANAGE_MESSAGES: 'Administrar Mensajes',
    EMBED_LINKS: 'Insertar Enlaces',
    ATTACH_FILES: 'Adjuntar Archivos',
    READ_MESSAGE_HISTORY: 'Leer el Historial de Mensajes',
    MENTION_EVERYONE: 'Mencionar a Todos',
    USE_EXTERNAL_EMOJIS: 'Usar Emojis Externos',
    ADD_REACTIONS: 'Añadir Reacciones',
    CONNECT: 'Conectar',
    SPEAK: 'Hablar',
    MUTE_MEMBERS: 'Silenciar Miembros',
    DEAFEN_MEMBERS: 'Ensordecer Miembros',
    MOVE_MEMBERS: 'Mover Miembros',
    USE_VAD: 'Usar la Actividad de Voz'
};

const random = num => Math.round(Math.random() * num);

const EIGHT_BALL = {
    WHEN: ['Pronto™', 'Quizá mañana.', 'Quizá el año que viene...', 'Ahora mismo.', 'En unos cuantos meses.'],
    WHAT: ['Un avión.', '¿Qué? Pregunta de nuevo.', '¡Un regalo!', 'Nada.', 'Un anillo.', 'No lo sé, quizá sea algo.'],
    HOWMUCH: ['Un montón.', 'Un poco.', 'Un poquillo.', 'Pregúnteme mañana.', 'No lo sé, pregúntaselo a un físico.', 'Absolutamente nada.', `Entre ${random(10)} y ${random(1000)}L.`, `${random(10)}e${random(1000)}L.`, '2 o 3 litros, no recuerdo.', '¡Infinito!', '1010 litros.'],
    HOWMANY: ['Un montón.', 'Un poco.', 'Un poquillo.', 'Pregúnteme mañana.', 'No lo sé, pregúntaselo a un físico.', 'Absolutamente nada.', `Entre ${random(10)} y ${random(1000)}.`, `${random(10)}e${random(1000)}.`, '2 o 3, no recuerdo.', '¡Infinito!', '1010.'],
    WHY: ['Probablemente genética.', 'Porque alguien decidió que fuera así.', '¡Por la gloria de Satán, por supuesto!', 'No lo sé, quizás fuese el destino.', 'Porque lo dije yo.', 'No tengo ni idea.', 'Harambe no hizo nada malo.', 'Uhm... pregúntale al dueño del servidor.', 'Pregunta de nuevo.', 'Para llegar al otro lado.', 'Lo dice en la Biblia.'],
    WHO: ['Un humano.', 'Un robot.', 'Un avión.', 'Un pájaro.', 'Una composición de carbono.', 'Un puñado de zeros y unos.', 'No tengo ni idea, ¿es material?', 'Eso no es lógico.'],
    ELSE: ['Probablemente.', 'No.', '¡SÍ!', 'Quizás.']
};

const duration = (time, short) => Duration.duration(time, TIMES, short);

module.exports = class extends Language {

    constructor(...args) {
        super(...args);
        this.PERMISSIONS = PERMS;
        this.EIGHT_BALL = EIGHT_BALL;

        // Gotta check it out of streaming
        this.HUMAN_LEVELS = {
            0: 'Ninguno',
            1: 'Bajo',
            2: 'Medio',
            3: '(╯°□°）╯︵ ┻━┻',
            4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
        };

        this.language = {
            DEFAULT: (key) => `${key} no ha sido traducido para es-ES todavía.`,
            DEFAULT_LANGUAGE: 'Lenguaje Predeterminado',

            RESOLVER_INVALID_PIECE: (name, piece) => `'${name}' debe ser una pieza válida de tipo ${piece}.`,
            RESOLVER_INVALID_MSG: (name) => `'${name}' debe ser una ID de mensaje válida.`,
            RESOLVER_INVALID_USER: (name) => `'${name}' debe ser una mención o una ID de usuario válida.`,
            RESOLVER_INVALID_MEMBER: (name) => `'${name}' debe ser una mención o una ID de usuario válida.`,
            RESOLVER_INVALID_CHANNEL: (name) => `'${name}' debe ser una mención o una ID de un canal válida.`,
            RESOLVER_INVALID_TEXTCHANNEL: (name) => `'${name}' debe ser una mención o una ID de un canal de texto válida.`,
            RESOLVER_INVALID_VOICECHANNEL: (name) => `'${name}' debe ser una mención o una ID de un canal de voz válida.`,
            RESOLVER_INVALID_GUILD: (name) => `'${name}' debe ser una ID de servidor válida.`,
            RESOLVER_INVALID_ROLE: (name) => `'${name}' debe ser una mención o una ID de rol válida.`,
            RESOLVER_INVALID_LITERAL: (name) => `Su opción no coincide con la única posibilidad: '${name}'`,
            RESOLVER_INVALID_BOOL: (name) => `'${name}' debe ser o 'true' o 'false'.`,
            RESOLVER_INVALID_INT: (name) => `'${name}' debe ser un número entero válido.`,
            RESOLVER_INVALID_FLOAT: (name) => `'${name}' debe ser un número válido.`,
            RESOLVER_INVALID_URL: (name) => `'${name}' debe ser un enlace válido.`,
            RESOLVER_INVALID_ATTACHMENT: (name) => `'${name}' debe ser un archivo adjuntado o un enlace válido.`,
            RESOLVER_STRING_SUFFIX: ' carácteres',
            RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `'${name}' debe ser exactamente ${min}${suffix}.`,
            RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `'${name}' debe ser entre ${min} y ${max}${suffix}.`,
            RESOLVER_MINMAX_MIN: (name, min, suffix) => `'${name}' debe ser mayor que ${min}${suffix}.`,
            RESOLVER_MINMAX_MAX: (name, max, suffix) => `'${name}' debe ser menor que ${max}${suffix}.`,
            RESOLVER_POSITIVE_AMOUNT: 'Un número positivo mayor que cero es requerido para este argumento.',

            COMMANDMESSAGE_MISSING: 'Faltan uno o más argumentos requeridos al final de su mensaje.',
            COMMANDMESSAGE_MISSING_REQUIRED: (name) => `'${name}' es un argumento requerido.`,
            COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) => `Falta una opción requerida: (${possibles})`,
            COMMANDMESSAGE_NOMATCH: (possibles) => `No coincide con ninguna de las posibilidades: (${possibles})`,

            CONST_MONITOR_INVITELINK: 'Enlace de Invitación',
            CONST_MONITOR_NMS: '[NOMENTIONSPAM]',
            CONST_MONITOR_WORDFILTER: 'Palabra Bloqueada',

            // Monitors
            MONITOR_NOINVITE: (user) => `|\`❌\`| Querido ${user}, las invitaciones instantáneas no están permitidas aquí.`,
            MONITOR_WORDFILTER: (user) => `|\`❌\`| Perdón, ${user}, pero has dicho algo que no está permitido en este servidor.`,
            MONITOR_NMS_MESSAGE: (user) => [
                `El MJOLNIR ha aterrizado y ahora, el usuario ${user.tag} cuya ID es ${user.id} ha sido baneado por spamming de menciones.`,
                '¡No te preocupes! ¡Estoy aquí para ayudarte! 😄'
            ].join('\n'),
            MONITOR_NMS_MODLOG: (threshold, amount) => `[NOMENTIONSPAM] Umbral: ${threshold}. Alcanzado: ${amount}`,
            MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error) => `${tag} | **${error}** | Tienes **30** segundos para responder a este mensaje con un argumento válido. Escribe **"ABORT"** para abortar este mensaje emergente.`,
            MONITOR_COMMAND_HANDLER_ABORTED: 'Abortado',
            MONITOR_SOCIAL_ACHIEVEMENT: '¡Felicidades %MEMBER! ¡Has logrado el rol %ROLE%!',

            // Inhibitors
            INHIBITOR_COOLDOWN: (remaining) => `Acabas de usar este comando. Puedes usarlo de nuevo en ${remaining} segundos.`,
            INHIBITOR_GUILDONLY: 'Este comando está diseñado para funcionar en servidores.',
            INHIBITOR_DISABLED: 'Este comando está desactivado.',
            INHIBITOR_MISSING_BOT_PERMS: (missing) => `Permisos insuficientes, necesito: **${missing.map(perm => PERMS[perm] || perm)}**`,
            INHIBITOR_PERMISSIONS: 'No tienes permiso para usar este comando.',
            INHIBITOR_SPAM: (channel) => `¿Podemos movernos al canal ${channel}, por favor? Este comando puede ser muy molesto y arruinar las conversaciones de otras personas.`,

            // Commands#anime
            COMMAND_ANIME_DESCRIPTION: (entry, context) => [
                `**Título Inglés:** ${entry.english}`,
                `${context.length > 750 ? `${util.splitText(context, 750)}... [continúa leyendo](https://myanimelist.net/anime/${entry.id})` : context}`
            ],
            COMMAND_ANIME_TITLE: (entry) => `${entry.title} (${entry.episodes === 0 ? 'desconocido' : entry.episodes} episodios)`,
            COMMAND_ANIME_STATUS: (entry) => [
                `  ❯  Estado actual: **${entry.status}**`,
                `    • Empezó en: **${entry.start_date}**\n${entry.end_date === '0000-00-00' ? '' : `    • Terminó en: **${entry.end_date}**`}`
            ],
            COMMAND_MANGA_DESCRIPTION: (entry, context) => [
                `**Título Inglés:** ${entry.english}`,
                `${context.length > 750 ? `${util.splitText(context, 750)}... [continúa leyendo](https://myanimelist.net/anime/${entry.id})` : context}`
            ],
            COMMAND_MANGA_TITLE: (entry) => `${entry.title} (${entry.chapters ? 'desconocido' : entry.chapters} capítulos${entry.volumes ? '' : ` y ${entry.volumes} volúmenes`})`,
            COMMAND_MANGA_STATUS: (entry) => [
                `  ❯  Estado actual: **${entry.status}**`,
                `    • Empezó en: **${entry.start_date}**\n${entry.end_date === '0000-00-00' ? '' : `    • Terminó en: **${entry.end_date}**`}`
            ],
            COMMAND_ANIME_TITLES: {
                TYPE: 'Tipo',
                SCORE: 'Puntuación',
                STATUS: 'Estado',
                WATCH_IT: 'Míralo aquí:'
            },

            // Commands#fun
            COMMAND_8BALL: (author, input, output) => `🎱 Pregunta por ${author}: *${input}*\n${output}`,
            COMMAND_8BALL_NOT_QUESTION: 'Eso no parece ser una pregunta.',
            COMMAND_8BALL_QUESTIONS: {
                QUESTION: '?',
                WHEN: /^¿?cu[áa]ndo/i,
                WHAT: /^¿?qu[ée]/i,
                HOW_MUCH: /^¿?cu[áa]nto/i,
                HOW_MANY: /^¿?cu[áa]nto/i,
                WHY: /^¿?por qu[ée]/i,
                WHO: /^¿?qui[ée]n/i
            },
            COMMAND_CATFACT: 'Hecho Gatuno',
            COMMAND_DICE: (sides, rolls, result) => `has lanzado el dado de **${sides}** lados **${rolls}** veces, obtienes: **${result}**`,
            COMMAND_LOVE_LESS45: 'Prueba de nuevo más tarde...',
            COMMAND_LOVE_LESS75: '¡Bastante bien!',
            COMMAND_LOVE_LESS100: '¡Buena pareja!',
            COMMAND_LOVE_100: '¡Pareja perfecta!',
            COMMAND_LOVE_ITSELF: 'Eres una criatura muy especial, y deberías amarte a tí mism@ más que a cualquiera <3',
            COMMAND_LOVE_RESULT: 'Resultado',
            COMMAND_NORRIS: 'Chuck Norris',
            COMMAND_RATE: (user, rate, emoji) => `Uhm, le daría a **${user}** un **${rate}**/100 ${emoji}`,
            COMMAND_RATE_MYSELF: ['Me amo un montón a mí misma 😊', 'a mí misma'],
            COMMAND_RNG: (user, word) => `🕺 *Pito, pito, gorgorito, ¿dónde vas tan bonito, a la era verdadera...?* ${user}, Elijo:${util.codeBlock('', word)}`,
            COMMAND_RNG_MISSING: 'Por favor, introduce al menos dos opciones separadas por una coma.',
            COMMAND_RNG_DUP: (words) => `¿Por qué aceptaría palabras duplicadas? '${words}'.`,
            COMMAND_XKCD_COMICS: (amount) => `Sólo hay ${amount} comics.`,

            // Commands#misc
            COMMAND_UNICODE: (string) => `Ahí tienes tu mensaje convertido:\n${string}`,

            // Commands#moderation
            // ## Utilities
            COMMAND_PERMISSIONS: (username, id) => `Lista de Permisos para ${username} (${id})`,
            COMMAND_RAID_DISABLED: 'El sistema Anti-RAID no está activado en este servidor.',
            COMMAND_RAID_MISSING_KICK: `Como no tengo el permiso ${PERMS.KICK_MEMBERS}, he mantenido el sistema Anti-RAID desactivado.`,
            COMMAND_RAID_LIST: 'Lista de usuarios en la Lista RAID.',
            COMMAND_RAID_CLEAR: '¡Éxito! La Lista RAID ha sido limpiada.',
            COMMAND_RAID_COOL: '¡Éxito! El Sistema RAID ha sido desactivado.',
            COMMAND_FLOW: (amount) => `Una cantidad de ${amount} mensajes fueron enviados durante el último minuto.`,
            COMMAND_TIME_TIMED: 'El caso de moderación seleccionado ya ha sido temporizado.',
            COMMAND_TIME_UNDEFINED_TIME: 'Debes especificar un tiempo.',
            COMMAND_TIME_UNSUPPORTED_TIPE: 'El tipo de acción por el caso de moderación seleccionado no es reversible, por lo tanto, esta acción no está soportada.',
            COMMAND_TIME_NOT_SCHEDULED: 'Esta tarea no está temporizada.',
            COMMAND_TIME_ABORTED: (title) => `¡Éxito! Abortada la tarea ${title}.`,
            COMMAND_TIME_SCHEDULED: (title, user, time) => `✅ Temporizada una acción de tipo **${title}** para el usuario ${user.tag} (${user.id}) con una duración de ${duration(time)}`,

            // ## General
            COMMAND_BAN_NOT_BANNABLE: 'El objetivo no puede ser baneado por mí.',
            COMMAND_BAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **BANEADO**: ${user.tag} (${user.id})${reason ? `\nMotivo: ${reason}` : ''}`,
            COMMAND_SOFTBAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **EXPULSADO**: ${user.tag} (${user.id})${reason ? `\nMotivo: ${reason}` : ''}`,
            COMMAND_UNBAN_MESSAGE: (user, reason, banReason, log) => `|\`🔨\`| [Case::${log}] **DESBANEADO**: ${user.tag} (${user.id})${reason ? `\nMotivo: ${reason}` : ''}${banReason ? `\nMotivo por el baneo previo: ${banReason}` : ''}`,
            COMMAND_UNBAN_MISSING_PERMISSION: `Necesitaré el permiso ${PERMS.BAN_MEMBERS} para poder ser capaz de des-banearlo.`,
            COMMAND_KICK_NOT_KICKABLE: 'El objetivo no puede ser echado por mí.',
            COMMAND_KICK_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **ECHADO**: ${user.tag} (${user.id})${reason ? `\nMotivo: ${reason}` : ''}`,
            COMMAND_MUTE_MUTED: 'El objetivo ya está silenciado.',
            COMMAND_MUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **SILENCIADO**: ${user.tag} (${user.id})${reason ? `\nMotivo: ${reason}` : ''}`,
            COMMAND_MUTE_USER_NOT_MUTED: 'El objetivo no está silenciado.',
            COMMAND_VMUTE_MISSING_PERMISSION: `Necesitaré el permiso ${PERMS.MUTE_MEMBERS} para poder ser capaz de des-silenciarlo.`,
            COMMAND_VMUTE_USER_NOT_MUTED: 'El objetivo no está silenciado en los canales de voz.',
            COMMAND_UNMUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **DES-SILENCIADO**: ${user.tag} (${user.id})${reason ? `\nMotivo: ${reason}` : ''}`,
            COMMAND_UNMUTE_MISSING_PERMISSION: `Necesitaré el permiso ${PERMS.MANAGE_ROLES} para poder ser capaz de des-silenciarlo en los canales de voz.`,
            COMMAND_WARN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **ALERTADO**: ${user.tag} (${user.id})${reason ? `\nMotivo: ${reason}` : ''}`,
            COMMAND_WARN_DM: (moderator, guild, reason) => `Has sido alertado por ${moderator} en el servidor ${guild} por el siguiente motivo: ${reason}`,

            COMMAND_PRUNE: (amount, total) => `¡Éxito! Borrados ${amount} mensajes de ${total}.`,

            COMMAND_REASON_NOT_EXISTS: 'El caso de moderación seleccionado no parece existir.',

            COMMAND_MUTE_CONFIGURE: '¿Quieres que cree y configure el rol de silenciados ahora?',
            COMMAND_MUTE_CONFIGURE_CANCELLED: 'Mensaje emergente abortado, la creación del rol de silenciados ha sido cancelada.',

            COMMAND_FILTER_UNDEFINED_WORD: 'Debes escribir la palabra que deseas filtrar.',
            COMMAND_FILTER_FILTERED: (filtered) => `Esta palabra ${filtered ? 'ya estaba' : 'no está'} filtrada.`,
            COMMAND_FILTER_ADDED: (word) => `✅ | ¡Éxito! Añadido la palabra ${word} al filtro.`,
            COMMAND_FILTER_REMOVED: (word) => `✅ | ¡Éxito! Removido la palabra ${word} del filtro.`,
            COMMAND_FILTER_RESET: '✅ | ¡Éxito! El filtro ha sido reiniciado.',

            COMMAND_LOCKDOWN_OPEN: (channel) => `El bloqueo del canal ${channel} ha sido removido.`,
            COMMAND_LOCKDOWN_LOCKING: (channel) => `Bloqueando el canal ${channel}...`,
            COMMAND_LOCKDOWN_LOCK: (channel) => `El canal ${channel} ha sido bloqueado.`,

            COMMAND_LIST_CHANNELS: (name, id) => `Lista de canales para el servidor ${name} (${id})`,
            COMMAND_LIST_ROLES: (name, id) => `Lista de roles para el servidor ${name} (${id})`,
            COMMAND_LIST_MEMBERS: (name, id) => `Lista de miembros para el rol ${name} (${id})`,
            COMMAND_LIST_STRIKES: (name) => `Lista de alertas${name ? ` para el usuario ${name}` : ''}`,
            COMMAND_LIST_STRIKES_EMPTY: 'La lista de alertas está vacía.',
            COMMAND_LIST_STRIKES_ALL: (count, list) => `Hay ${count} alertas. Con los números de casos: \`${list}\``,
            COMMAND_LIST_STRIKES_EMPTY_FOR: (user) => `No hay alertas para el usuario ${user}`,
            COMMAND_LIST_STRIKES_ENUM: (count) => `Hay ${count} alerta${count === 1 ? '' : 's'}`,
            COMMAND_LIST_STRIKES_CASE: (number, moderator, reason) => `Caso \`${number}\`. Moderador: **${moderator}**\n\`${reason}\``,
            COMMAND_LIST_ADVERTISEMENT: 'Lista de miembros con propaganda.',
            COMMAND_LIST_ADVERTISEMENT_EMPTY: 'Nadie tiene un enlace de invitación instantánea en su estado de juego.',
            COMMAND_LIST_ROLE_EMPTY: 'Este rol no tiene miembros.',

            COMMAND_ROLE_HIGHER: 'El miembro del servidor seleccionado tiene igual o mayor posición de rol que usted.',
            COMMAND_USERSELF: '¿Por qué harías eso a tí mismo?',
            COMMAND_TOSKYRA: 'Eww... ¡Pensaba que me amabas! 💔',

            // Commands#overwatch
            COMMAND_PLATFORM_REMOVED: (role) => `La plataforma de juego (**${role}**) ha sido removida de su perfil.`,
            COMMAND_PLATFORM_UPDATED: (role) => `La plataforma de juego de tu perfil ha sido actualizada a: **${role}**`,
            COMMAND_REGION_REMOVED: (role) => `La región de juego (**${role}**) ha sido removida de su perfil.`,
            COMMAND_REGION_UPDATED: (role) => `La región de juego de tu perfil ha sido actualizada a: **${role}**`,
            COMMAND_GAMEROLE_UPDATE: (role) => `Tu rol de juego ha sido actualizada a: **${role}**`,
            COMMAND_RANK_UPDATE: (rank) => `El rango de juego de tu perfil ha sido actualizado a: **${rank}**`,
            MISSING_ROLE: 'No tienes este rol.',
            HAS_ROLE: 'Usted ya tiene este rol.',

            // Commands#social
            COMMAND_AUTOROLE_POINTS_REQUIRED: 'Debes escribir una cantidad válida de puntos.',
            COMMAND_AUTOROLE_UPDATE_UNCONFIGURED: 'Este rol no está configurado como un auto-rol. Utiliza el tipo \'add\'.',
            COMMAND_AUTOROLE_UPDATE: (role, points, before) => `Auto-rol actualizado: ${role.name} (${role.id}). Cantidad de puntos requerido: ${points} (antes: ${before})`,
            COMMAND_AUTOROLE_REMOVE: (role, before) => `Removido el auto-rol: ${role.name} (${role.id}), el cual requería ${before} puntos.`,
            COMMAND_AUTOROLE_ADD: (role, points) => `Añadido un nuevo auto-rol: ${role.name} (${role.id}). Cantidad de puntos requerido: ${points}`,
            COMMAND_AUTOROLE_LIST_EMPTY: 'No hay ningún rol configurado como auto-rol en este servidor.',
            COMMAND_AUTOROLE_UNKNOWN_ROLE: (role) => `Rol desconocido: ${role}`,

            COMMAND_BALANCE: (user, amount, icon) => `El usuario ${user} tiene un total de ${amount}${icon}`,
            COMMAND_BALANCE_SELF: (amount, icon) => `Usted tiene un total de ${amount}${icon}`,

            COMMAND_BANNER_LIST_EMPTY: (prefix) => `Usted no tiene un banner. Utiliza el comando \`${prefix}banner buylist\` para obtener una lista de los banners que usted puede comprar.`,
            COMMAND_BANNER_SET_INPUT_NULL: 'Debes especificar un identificador de banner para colocar.',
            COMMAND_BANNER_SET_NOT_BOUGHT: 'Usted no tiene este banner.',
            COMMAND_BANNER_SET: (banner) => `|\`✅\`| **Éxito**. Has cambiado tu banner a: __${banner}__`,
            COMMAND_BANNER_BUY_INPUT_NULL: 'Debes especificar un identificador de banner para comprar.',
            COMMAND_BANNER_BUY_NOT_EXISTS: (prefix) => `Este identificador de banner no existe. Por favor, usa el comando \`${prefix}banner buylist\` para obtener una lista de los banners que usted puede comprar.`,
            COMMAND_BANNER_BUY_BOUGHT: (prefix, banner) => `Usted ya tiene este banner, quizá usted quiera usar el comando \`${prefix}banner set ${banner}\` para hacerlo visible en su perfil.`,
            COMMAND_BANNER_BUY_MONEY: (money, cost, icon) => `Usted no tiene dinero suficiente para comprar este banner, tienes ${money}${icon}, y el banner cuesta ${cost}${icon}`,
            COMMAND_BANNER_BUY: (banner) => `|\`✅\`| **Éxito**. Has comprado el banner: __${banner}__`,
            COMMAND_BANNER_BUY_PAYMENT_CANCELLED: '|`❌`| El pago ha sido cancelado.',
            COMMAND_BANNER_PROMPT: {
                AUTHOR: 'Autor',
                TITLE: 'Título',
                PRICE: 'Precio'
            },

            COMMAND_C4_SKYRA: 'Lo siento, sé que quieres jugar conmigo, pero si lo hago, ¡no seré capaz de ayudar a las otras personas! 💔',
            COMMAND_C4_BOT: 'Lo siento, pero no creo que ellos quieran parar de trabajar en lo que estén haciendo y ponerse a jugar con humanos.',
            COMMAND_C4_SELF: 'Debes estar demasiado triste para jugar contigo mismo. Prueba de nuevo, pero con otro usuario.',
            COMMAND_C4_PROGRESS: 'Lo siento, pero hay una partida en progreso, ¡prueba de nuevo cuando termine!',
            COMMAND_C4_PROMPT: (challenger, challengee) => `Querido ${challengee}, ${challenger} le propone una partida de Conecta-Cuatro. Por favor, ¡responda con **yes** para aceptar!`,
            COMMAND_C4_PROMPT_TIMEOUT: 'Lo siento, pero el usuario no ha respondido a tiempo.',
            COMMAND_C4_PROMPT_DENY: 'Lo siento, pero el objetivo no quiere jugar.',
            COMMAND_C4_START: (player, table) => `¡A jugar! Turno para: **${player}**.\n${table}`,
            COMMAND_C4_GAME_TIMEOUT: '**La partida ha finalizado en un empate debido a la falta de respuesta (60 segundos)**',
            COMMAND_C4_GAME_COLUMN_FULL: 'Esta columna está llena. Por favor, intente en otra.',
            COMMAND_C4_GAME_WIN: (user, table) => `¡**${user}** ganó!\n${table}`,
            COMMAND_C4_GAME_DRAW: (table) => `La partida ha finalizado en un **empate**!\n${table}`,
            COMMAND_C4_GAME_NEXT: (player, table) => `Turno para: **${player}**.\n${table}`,

            COMMAND_DAILY_TIME: (time) => `Los próximos ingresos diarios estarán disponibles en ${duration(time)}`,
            COMMAND_DAILY_TIME_SUCCESS: (amount, icon) => `¡Yay! ¡Has obtenido ${amount}${icon}! Próximos ingresos diarios en: 12 hours.`,
            COMMAND_DAILY_GRACE: (remaining) => [
                `¿Te gustaría recibir los ingresos diarios ahora? El tiempo restante será añadido al periodo normal de 12 horas de espera.`,
                `Tiempo restante: ${duration(remaining, true)}`
            ].join('\n'),
            COMMAND_DAILY_GRACE_ACCEPTED: (amount, icon, remaining) => `¡Has recibido con éxito ${amount}${icon}! Próximos ingresos diarios en: ${duration(remaining)}`,
            COMMAND_DAILY_GRACE_DENIED: '¡Lo tengo! ¡Vuelve de vuelta pronto!',

            COMMAND_LEVEL: {
                LEVEL: 'Nivel',
                EXPERIENCE: 'Experiencia',
                NEXT_IN: 'Siguiente nivel en'
            },

            COMMAND_MYLEVEL: (points, next) => `Tienes una cantidad total de ${points} puntos.${next}`,
            COMMAND_MYLEVEL_NEXT: (remaining, next) => `\nPuntos para el siguiente rango: **${remaining}** (con ${next} puntos).`,

            COMMAND_PAY_MISSING_MONEY: (needed, has, icon) => `Lo siento, pero necesitas al menos ${needed}${icon} y usted tiene ${has}${icon}`,
            COMMAND_PAY_PROMPT: (user, amount, icon) => `Estás a punto de pagar al usuario ${user} una cantidad de ${amount}${icon}, ¿quieres proceder con el pago?`,
            COMMAND_PAY_PROMPT_ACCEPT: (user, amount, icon) => `Pago aceptado, una cantidad de ${amount}${icon} ha sido transferido al perfil de ${user}.`,
            COMMAND_PAY_PROMPT_DENY: 'Pago denegado.',
            COMMAND_PAY_SELF: 'Si pusiera impuestos, usted perdería dinero, por lo tanto, no intente pagarse a sí mismo.',
            COMMAND_SOCIAL_PAY_BOT: 'Oh, perdón, pero el dinero es un sinsentido para los robots. Estoy muy segura los humanos lo desearían mucho mas.',

            COMMAND_PROFILE: {
                GLOBAL_RANK: 'Rango Global',
                CREDITS: 'Créditos',
                REPUTATION: 'Reputación',
                EXPERIENCE: 'Experiencia',
                LEVEL: 'Nivel'
            },

            COMMAND_REMINDME_INPUT: 'Dime qué quieres que te recuerde y cuándo.',
            COMMAND_REMINDME_TIME: 'Tu recordatorio debe durar al menos un minuto.',
            COMMAND_REMINDME_CREATE: (id) => `Un recordatorio con la identificación \`${id}\` ha sido creado.`,

            COMMAND_REPUTATION_TIME: (remaining) => `Puedes dar un punto de reputación en ${duration(remaining)}`,
            COMMAND_REPUTATION_USABLE: 'Puedes dar un punto de reputación ahora.',
            COMMAND_REPUTATION_USER_NOTFOUND: 'Menciona el usuario a quien quieres darle un punto de reputación.',
            COMMAND_REPUTATION_SELF: 'No puedes darte un punto de reputación a tí mismo.',
            COMMAND_REPUTATION_BOTS: 'No puedes dar un punto de reputación a los robots.',
            COMMAND_REPUTATION_GIVE: (user) => `Acabas de dar un punto de reputación al usuario **${user}**!`,

            COMMAND_REPUTATIONS: (points) => `Tienes una cantidad total de ${points} puntos de reputación.`,

            COMMAND_SCOREBOARD_POSITION: (position) => `Tu posición del ranking es: ${position}`,

            COMMAND_SETCOLOR: (color) => `Color cambiado a ${color}`,

            COMMAND_SLOTMACHINES_MONEY: (money, icon) => `Lo siento, ¡pero no tienes dinero suficiente para pagar tu apuesta! Tu saldo es de ${money}${icon}`,
            COMMAND_SLOTMACHINES_WIN: (roll, winnings, icon) => `**Has enrrollado:**\n${roll}\n**¡Felicidades!**\n¡Has ganado ${winnings}${icon}!`,
            COMMAND_SLOTMACHINES_LOSS: (roll) => `**Has enrrollado:**\n${roll}\n**¡Misión fallida!**\n¡Lo lograremos para la próxima!`,

            COMMAND_SOCIAL_PROFILE_NOTFOUND: 'Lo siento, pero este perfil de usuario no existe.',
            COMMAND_SOCIAL_PROFILE_BOT: 'Lo siento, pero los robots no tienen un __Perfil de Usuario__.',
            COMMAND_SOCIAL_PROFILE_DELETE: (user, points) => `|\`✅\`| **Éxito**. Borrado el __Perfil de Usuario__ del usuario **${user}**, el cual tenía ${points} puntos.`,
            COMMAND_SOCIAL_POINTS: '¿Quizá quiera especificar la cantidad de puntos para añadir o remover?',
            COMMAND_SOCIAL_UPDATE: (action, amount, user, before, now) => `Acabas de ${action === 'add' ? 'añadir' : 'remover'} ${amount === 1 ? 'un punto' : `${amount} puntos`} al __Perfil de Usuario__ para el usuario ${user}. Antes: ${before}; Ahora: ${now}.`,

            COMMAND_SUBSCRIBE_NO_ROLE: 'Este servidor no tiene un rol de anuncios configurado.',
            COMMAND_SUBSCRIBE_SUCCESS: (role) => `Añadido el rol de anuncios **${role}** a su perfil de usuario con éxito.`,
            COMMAND_UNSUBSCRIBE_SUCCESS: (role) => `Removido el rol de anuncios **${role}** de su perfil de usuario con éxito.`,
            COMMAND_SUBSCRIBE_NO_CHANNEL: 'Este servidor no tiene un canal de anuncios configurado.',
            COMMAND_ANNOUNCEMENT: (role) => `**Nuevo Anuncio** ${role}:`,

            COMMAND_CONFIGURATION_ABORT: (reason) => `|\`⚙\`| Sistema de Configuración Cancelada: ${reason === 'TIME' ? 'Falta de respuesta.' : 'Desconectado con éxito.'}`,

            // Commands#system
            COMMAND_FEEDBACK: '|`✅`| ¡Gracias por su mensaje ❤! Recibirás un mensaje en la bandeja de mensajes privados tan pronto como sea posible.',

            COMMAND_RELOAD: (type, name) => `✅ Recargado la pieza de tipo ${type}: ${name}`,
            COMMAND_RELOAD_ALL: (type) => `✅ Recaargado todas las piezas de tipo ${type}.`,
            COMMAND_REBOOT: 'Reiniciando...',
            COMMAND_PING: '¿Ping?',
            COMMAND_PINGPONG: (diff, ping) => `Pong! (El viaje duró: ${diff}ms. Latido: ${ping}ms.)`,
            COMMAND_INVITE: (url) => [
                `Para añadir Skyra a tu servidor: <${url}>`,
                'No tengas miedo de remover algunos permisos, Skyra te hará saber si estás intentando ejecutar un comando sin los permisos requeridos.'
            ],
            COMMAND_HELP_DM: '📥 | La lista de comandos ha sido enviado a tus mensajes privados.',
            COMMAND_HELP_NODM: '❌ | Parece que tienes tus mensajes privados desactivados, no pude enviarte la lista de comandos.',

            COMMAND_CONF_LIST_TITLE: '= Configuración del Servidor =',
            COMMAND_CONF_SELECTKEY: (keys) => `Por favor, elije uno de las siguientes claves: ${keys}`,
            COMMAND_CONF_ADDED: (key, value) => `¡Éxito! Añadido el valor \`${value}\` a la clave: \`${key}\`.`,
            COMMAND_CONF_UPDATED: (key, response) => `¡Éxito! Actualizado el valor para la clave \`${key}\`: \`${response}\`.`,
            COMMAND_CONF_KEY_NOT_ARRAY: 'Esta clave no acepta múltiples valores. Usa la acción de tipo \'reset\'.',
            COMMAND_CONF_REMOVE: (key, value) => `¡Éxito! Removido el valor \`${value}\` de la clave: \`${key}\`.`,
            COMMAND_CONF_GET: (key, value) => `El valor para la clave \`${key}\` es: \`${value}\`.`,
            COMMAND_CONF_RESET: (key, response) => `El valor para la clave \`${key}\` ha sido reiniciado a: \`${response}\`.`,
            COMMAND_STATS: (STATS, UPTIME, USAGE) => [
                '= ESTADÍSTICAS =',
                `• Usuarios   :: ${STATS.USERS}`,
                `• Servidores :: ${STATS.GUILDS}`,
                `• Canales    :: ${STATS.CHANNELS}`,
                `• Discord.js :: ${STATS.VERSION}`,
                `• Node.js    :: ${STATS.NODE_JS}`,
                '',
                '= TIEMPO EN FUNCIONAMIENTO =',
                `• Servidor   :: ${UPTIME.HOST}`,
                `• Total      :: ${UPTIME.TOTAL}`,
                `• Cliente    :: ${UPTIME.CLIENT}`,
                '',
                '= USO DEL SERVIDOR =',
                `• Carga CPU  :: ${USAGE.CPU_LOAD}`,
                `• RAM +Node  :: ${USAGE.RAM_TOTAL}`,
                `• Uso de RAM :: ${USAGE.RAM_USED}`
            ].join('\n'),

            // Commands#tags
            COMMAND_TAGS_NAME_REQUIRED: 'Debes especificar un nombre para la etiqueta.',
            COMMAND_TAGS_ADD_EXISTS: (tag) => `La etiqueta '${tag}' ya existe.`,
            COMMAND_TAGS_CONTENT_REQUIRED: 'Debes proveer el contenido para esta etiqueta.',
            COMMAND_TAGS_ADD_ADDED: (name, content) => `Añadido con éxito la etiqueta: **${name}** con un contenido de: **${content}**.`,
            COMMAND_TAGS_REMOVE_NOT_EXISTS: (tag) => `La etiqueta '${tag}' no existe.`,
            COMMAND_TAGS_REMOVE_REMOVED: (name) => `Borrado con éxito la etiqueta **${name}**.`,
            COMMAND_TAGS_EDITED: (name, content, old) => `Editado con éxito la etiqueta **${name}**, el cual tenía un contenido de **${old}** a: **${content}**.`,
            COMMAND_TAGS_LIST_EMPTY: 'La lista de etiquetas para este servidor está vacía.',

            // Commands#tools
            COMMAND_CALC: (time, output) => `|\`⚙\`| **Calculado** (${time}μs)${output}`,
            COMMAND_CALC_FAILURE: (time, output) => `|\`❌\`| **Fallido** (${time}μs)${output}`,

            COMMAND_COLOR: (hex, rgb, hsl) => [
                `HEX: **${hex}**`,
                `RGB: **${rgb}**`,
                `HSL: **${hsl}**`
            ].join('\n'),

            COMMAND_CURRENCYLAYER_INPUT: (input) => `${input} es, o una moneda inválida, o no está aceptada por la aplicación.`,
            COMMAND_CURRENCYLAYER_ERROR: 'Lo siento, pero la aplicación ha devuelto una mala respuesta.',
            COMMAND_CURRENCYLAYER: (money, input, output, converted) => `La cantidad de **${money}** de la moneda \`${input}\` a la moneda \`${output}\` equivale a:${converted}`,

            COMMAND_DEFINE_NOTFOUND: 'No he podido encontrar una definición para esta palabra.',
            COMMAND_DEFINE: (input, output) => `Resultados de búsqueda para \`${input}\`:\n${output}`,

            COMMAND_EMOJI_CUSTOM: (emoji, id) => [
                `→ \`Emoji\` :: **${emoji}**`,
                '→ `Tipo` :: **Personalizado**',
                `→ \`ID\` :: **${id}**`
            ].join('\n'),
            COMMAND_EMOJI_TWEMOJI: (emoji, id) => [
                `→ \`Emoji\` :: \\${emoji}`,
                '→ `Tipo` :: **Twemoji**',
                `→ \`ID\` :: **${id}**`
            ].join('\n'),
            COMMAND_EMOJI_INVALID: (emoji) => `'${emoji}' no es un emoji válido.`,

            COMMAND_GOOGL_LONG: (url) => `**Enlace acortado: [${url}](${url})**`,
            COMMAND_GOOGL_SHORT: (url) => `**Enlace expandido: [${url}](${url})**`,

            COMMAND_QUOTE_MESSAGE: 'Es muy raro... pero dicho mensaje no tiene un contenido ni una imagen.',

            COMMAND_ROLES_LIST_EMPTY: 'Este servidor no tiene un rol en la lista de roles públicos.',
            COMMAND_ROLES_LIST_TITLE: (guild) => `Lista de roles públicos para el servidor ${guild}`,
            COMMAND_ROLES_CLAIM_EXISTENT: (roles) => `Usted ya tiene los siguientes roles: \`${roles}\``,
            COMMAND_ROLES_CLAIM_GIVEN: (roles) => `Los siguientes roles han sido añadidos a tu perfil: \`${roles}\``,
            COMMAND_ROLES_UNCLAIM_UNEXISTENT: (roles) => `Usted no tiene los siguientes roles: \`${roles}\``,
            COMMAND_ROLES_UNCLAIM_REMOVED: (roles) => `Los siguientes roles han sido removidos de tu perfil: \`${roles}\``,
            COMMAND_ROLES_NOT_PUBLIC: (roles) => `Los siguientes roles no son públicos: \`${roles}\``,
            COMMAND_ROLES_NOT_FOUND: (roles) => `No se pudieron encontrar los roles que coincidan con los siguientes: \`${roles}\``,

            COMMAND_SERVERINFO_TITLE: (name, id) => `Estadísticas para el servidor **${name}** (ID: **${id}**)`,
            COMMAND_SERVERINFO_TITLES: {
                CHANNELS: 'Canales',
                MEMBERS: 'Miembros',
                OTHER: 'Otros',
                USERS: 'Usuarios'
            },
            COMMAND_SERVERINFO_CHANNELS: (text, voice, categories, afkChannel, afkTime) => [
                `• **${text}** Texto, **${voice}** Voz, **${categories}** categorías.`,
                `• AFK: ${afkChannel ? `**<#${afkChannel}>** después de **${afkTime / 60}**min` : '**Ninguno.**'}`
            ].join('\n'),
            COMMAND_SERVERINFO_MEMBERS: (count, owner) => [
                `• **${count}** miembros`,
                `• Dueño: **${owner.tag}**`,
                `  (ID: **${owner.id}**)`
            ].join('\n'),
            COMMAND_SERVERINFO_OTHER: (size, region, createdAt, verificationLevel) => [
                `• Roles: **${size}**`,
                `• Región: **${region}**`,
                `• Creado en: **${moment.utc(createdAt).format('D/M/YYYY, HH:mm:ss')}** (UTC - DD/MM/YYYY)`,
                `• Nivel de Verificación: **${this.HUMAN_LEVELS[verificationLevel]}**`
            ].join('\n'),
            COMMAND_SERVERINFO_USERS: (online, offline, percentage, newbies) => [
                `• Usuarios conectado/desconectado: **${online}**/**${offline}** (${percentage}% de usuarios están conectados)`,
                `• **${newbies}** nuevos usuarios en las últimas 24 horas.`
            ].join('\n'),

            COMMAND_URBAN_NOTFOUND: 'Lo siento, pero la palabra por la cual estás buscando, no parece estar defininida en UrbanDictionary. ¿Prueba con otra palabra?',
            COMMAND_URBAN_INDEX_NOTFOUND: 'Ehm, quizá usted quiera probar con un índice de página menor.',
            SYSTEM_TEXT_TRUNCATED: (definition, url) => `${definition}... [sigue leyendo](${url})`,
            COMMAND_URBAN_DESCRIPTION: (index, pages, definition, example, author) => [
                `→ \`Definición\` :: ${index}/${pages}\n_${definition}`,
                `→ \`Ejemplo\` :: ${example}`,
                `→ \`Autor\` :: ${author}`
            ].join('\n\n'),

            COMMAND_WHOIS_MEMBER: (member) => [
                `${member.nickname ? `aka **${member.nickname}**.\n` : ''}`,
                `Con una ID de usuario \`${member.user.id}\`,`,
                `este usuario tiene un estado de **${member.user.presence.status}**${member.user.presence.activity ? `, jugando: **${member.user.presence.activity.name}**` : '.'}`,
                '\n',
                `\nSe unió a Discord en el día ${moment.utc(member.user.createdAt).format('D/MM/YYYY [a las] HH:mm:ss')}`,
                `\nSe unió al servidor ${member.guild.name} en el día ${moment.utc(member.joinedAt).format('D/MM/YYYY [a las] HH:mm:ss')}`
            ].join(' '),
            COMMAND_WHOIS_MEMBER_ROLES: '→ `Roles`',
            COMMAND_WHOIS_USER: (user) => [
                `Con una ID de usuario \`${user.id}\``,
                '\n',
                `Se unió a Discord en el día ${moment.utc(user.createdAt).format('D/MM/YYYY [a las] HH:mm:ss')}`
            ].join(' '),

            COMMAND_WIKIPEDIA_NOTFOUND: 'Lo siento, pero no he podido encontrar algo que coincida con lo que buscas a través de Wikipedia.',

            COMMAND_YOUTUBE_NOTFOUND: 'Lo siento, pero no he podido encontrar algo que coincida con lo que buscas a través de YoUTube.',
            COMMAND_YOUTUBE_INDEX_NOTFOUND: 'Quizá quieras probar con un índice de página menor, porque no soy capaz de encontrar algo en éste.',

            // Commands#weather
            COMMAND_WEATHER_ERROR_ZERO_RESULTS: 'La aplicación no devolvió resultados.',
            COMMAND_WEATHER_ERROR_REQUEST_DENIED: 'La aplicación GeoCode ha rechazado su solicitud.',
            COMMAND_WEATHER_ERROR_INVALID_REQUEST: 'Solicitud incorrecta.',
            COMMAND_WEATHER_ERROR_OVER_QUERY_LIMIT: 'Límite de solicitudes excedida, prueba de nuevo mañana.',
            COMMAND_WEATHER_ERROR_UNKNOWN: 'Error Desconocido.',

            // Modlogs
            MODLOG_APPEALED: 'El caso de moderación seleccionado ya ha sido invalidado.',
            MODLOG_TIMED: (remaining) => `Esta acción ya ha sido programada, y termina en ${duration(remaining)}`,
            MODLOG_PENDING_REASON: (prefix, number) => `Usa ${prefix}reason ${number} para reclamar este caso.`,

            // System only
            SYSTEM_DM_SENT: 'Te he enviado el mensaje en tu bandeja de mensajes privados.',
            SYSTEM_DM_FAIL: 'No te he podido enviar el mensaje en mensaje directo... ¿me has bloqueado?',
            SYSTEM_FETCHING: '`Buscando...`',
            SYSTEM_PROCESSING: '`Procesando...`',
            SYSTEM_HIGHEST_ROLE: 'La posición jerárquica de este rol es superior o igual al mío, y no soy capaz de darla.',
            SYSTEM_CHANNEL_NOT_POSTABLE: `No tengo permisos para enviar un mensaje a ese canal, necesito el permiso **${PERMS.SEND_MESSAGES}**.`,
            SYSTEM_FETCHBANS_FAIL: `No pude buscar los baneos. ¿Tengo el permiso **${PERMS.BAN_MEMBERS}**?`,
            SYSTEM_LOADING: '`Cargando... por favor, espera.`',
            SYSTEM_ERROR: '¡Algo ha pasado!',
            SYSTEM_MESSAGE_NOT_FOUND: 'Lo siento, pero o la ID de mensaje que has enviado es incorrecto, o el mensaje fue borrado.',

            LISTIFY_PAGE: (page, pageCount, results) => `Página ${page} / ${pageCount} | ${results} Total`,

            COMMAND_SUCCESS: 'Ejecutado con éxito éste comando.',

            GUILD_SETTINGS_CHANNELS_MOD: 'Este comando requiere un canal de registro moderativo para funcionar correctamente.',
            GUILD_SETTINGS_ROLES_MUTED: 'Este comando require un rol configurado para los muteos.',
            GUILD_BANS_EMPTY: 'No hay baneos registrados en este servidor.',
            GUILD_BANS_NOT_FOUND: 'Por favor, escribe una ID o etiqueta válido de usuario.',
            GUILD_MUTE_NOT_FOUND: 'Este usuario no está silenciado.',
            CHANNEL_NOT_READABLE: `Lo siento, pero requiero el permiso **${PERMS.VIEW_CHANNEL}**`,

            USER_NOT_IN_GUILD: 'Este usuario no está en este servidor.',

            EVENTS_GUILDMEMBERADD: 'Nuevo Usuario',
            EVENTS_GUILDMEMBERADD_MUTE: 'Usuario Muteado se ha unido',
            EVENTS_GUILDMEMBERADD_RAID: 'Asalto Detectado',
            EVENTS_GUILDMEMBERREMOVE: 'Salida de Usuario',
            EVENTS_GUILDMEMBER_UPDATE_NICKNAME: (previous, current) => `Actualizado el apodo de **${previous}** a **${current}**`,
            EVENTS_GUILDMEMBER_ADDED_NICKNAME: (previous, current) => `Añadido un nuevo apodo **${current}**`,
            EVENTS_GUILDMEMBER_REMOVED_NICKNAME: (previous) => `Removido el apodo **${previous}**`,
            EVENTS_GUILDMEMBER_UPDATE_ROLES: (removed, added) => `${removed.length > 0 ? `Removidos los siguientes roles: ${removed.join(', ')}\n` : ''}${added.length > 0 ? `Añadidos los siguientes roles: ${added.join(', ')}` : ''}`,
            EVENTS_MESSAGE_UPDATE: 'Mensaje Editado',
            EVENTS_MESSAGE_DELETE: 'Mensaje Borrado',
            EVENTS_MESSAGE_DELETE_MSG: (msg) => msg.substring(0, 1900),
            EVENTS_COMMAND: (command) => `Comando usado: ${command}`,
            EVENTS_STREAM_START: (member) => `¡El usuario **${member.user.tag}** está ahora en directo! **${member.presence.activity.name}**\n${member.presence.activity.url}`,
            EVENTS_STREAM_STOP: (member) => `El usuario **${member.user.tag}** ha terminado su directo.`,
            EVENTS_STARBOARD_SELF: (user) => `Querido ${user}, no puedes marcar con una estrella tus propios mensajes.`,
            EVENTS_STARBOARD_BOT: (user) => `Querido ${user}, no puedes marcar con una estrella los mensajes enviados por bots.`,
            EVENTS_STARBOARD_EMPTY: (user) => `Querido ${user}, no puedes marcar con una estrella mensajes que no tienen contenido.`,

            SETTINGS_DELETE_CHANNELS_DEFAULT: 'Reiniciado el valor de la clave `channels.default`.',
            SETTINGS_DELETE_ROLES_INITIAL: 'Reiniciado el valor de la clave `roles.initial`.',
            SETTINGS_DELETE_ROLES_MUTE: 'Reiniciado el valor de la clave `roles.muted`.',

            PROMPT_CANCEL: 'La interfaz ha sido cancelada.',
            PROMPT_ARGUMENT: 'El parámetro',
            PROMPT_MESSAGE: 'Escribe la ID numérica de un mensaje. Tenga en cuenta que necesitará el Modo de Desarrollador, y que el mensaje debe pertenecer a este canal.',
            PROMPT_USER: 'Menciona un usuario, escribe su ID, o parte del nombre de usuario.',
            PROMPT_MEMBER: 'Menciona a un miembro del servidor, escribe su ID, o parte del nombre de usuario.',
            PROMPT_CHANNEL: 'Menciona un canal, escribe su ID, o parte de su nombre.',
            PROMPT_GUILD: 'Escribe una ID numérica válida de un servidor. Tenga en cuenta que necesitará el Modo de Desarrollador, y debo estar en el servidor.',
            PROMPT_ROLE: 'Menciona un rol, escribe su ID, o parte de su nombre.',
            PROMPT_BOOLEAN: 'Responde a este mensaje con `sí` o `no`.',
            PROMPT_STRING: 'Responde a este mensaje con el mensaje deseado.',
            PROMPT_INTEGER: 'Responde a este mensaje con un número entero.',
            PROMPT_NUMBER: 'Responde a este mensaje con un número.',
            PROMPT_URL: 'Responde a este mensaje con un enlace válido.',
            PROMPT_ATTACHMENT: 'Sube un archivo a este canal o manda un enlace de imagen válido.',

            TYPES_MEMBER_ROLE_UPDATE: 'Actualización de los Roles de un Miembro',
            TYPES_MEMBER_NICKNAME_UPDATE: 'Actualización de Apodo',

            LISTIFY_INVALID_INDEX: 'Índice incorrecto, debe ser un número entero.',
            REQUIRE_USER: 'Debes escribir el nombre, tag, o mencionar a un usuario.',
            REQUIRE_ROLE: 'Debes escribir un nombre de rol válido o una mención.',

            ERROR_WTF: '¡Vaya terrible error! ¡Lo siento mucho!',
            ERROR_STRING: (mention, message) => `Querido ${mention}, ${message}`,

            CONST_USERS: 'Usuarios'
        };
    }

};
