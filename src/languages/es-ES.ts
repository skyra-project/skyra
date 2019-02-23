/* tslint:disable object-literal-sort-keys */
import { Language, Timestamp, util as klasaUtil, version as klasaVersion } from 'klasa';
import { VERSION } from '../../config';
import { EMOJIS } from '../lib/util/constants';
import { FriendlyDuration } from '../lib/util/FriendlyDuration';
import { LanguageHelp } from '../lib/util/LanguageHelp';
import { createPick, inlineCodeblock } from '../lib/util/util';

const { toTitleCase, codeBlock } = klasaUtil;
const { LOADING, SHINY, GREENTICK, REDCROSS } = EMOJIS;

const builder = new LanguageHelp()
	.setExplainedUsage('⚙ | ***Uso Explicado***')
	.setPossibleFormats('🔢 | ***Formatos Posibles***')
	.setExamples('🔗 | ***Ejemplos***')
	.setReminder('⏰ | ***Recordatorio***');
const timestamp = new Timestamp('DD/MM/YYYY [a las] HH:mm:ss');

const TIMES = {
	YEAR: {
		1: 'año',
		DEFAULT: 'años'
	},
	MONTH: {
		1: 'mes',
		DEFAULT: 'meses'
	},
	WEEK: {
		1: 'semana',
		DEFAULT: 'semanas'
	},
	DAY: {
		1: 'día',
		DEFAULT: 'días'
	},
	HOUR: {
		1: 'hora',
		DEFAULT: 'horas'
	},
	MINUTE: {
		1: 'minuto',
		DEFAULT: 'minutos'
	},
	SECOND: {
		1: 'segundo',
		DEFAULT: 'segundos'
	}
};

const PERMS = {
	ADMINISTRATOR: 'Administrador',
	VIEW_AUDIT_LOG: 'Ver el registro de auditoría',
	MANAGE_GUILD: 'Administrar el Servidor',
	MANAGE_ROLES: 'Administrar Roles',
	MANAGE_CHANNELS: 'Administrar Canales',
	KICK_MEMBERS: 'Expulsar Miembros',
	BAN_MEMBERS: 'Banear Miembros',
	CREATE_INSTANT_INVITE: 'Crear Invitación Instantánea',
	CHANGE_NICKNAME: 'Cambiar apodo',
	MANAGE_NICKNAMES: 'Administrar apodos',
	MANAGE_EMOJIS: 'Administrar emojis',
	MANAGE_WEBHOOKS: 'Administrar Webhooks',
	VIEW_CHANNEL: 'Leer Mensajes',
	SEND_MESSAGES: 'Enviar Mensajes',
	SEND_TTS_MESSAGES: 'Enviar Mensajes de TTS',
	MANAGE_MESSAGES: 'Administrar Mensajes',
	EMBED_LINKS: 'Insertar Enlaces',
	ATTACH_FILES: 'Adjuntar Archivos',
	READ_MESSAGE_HISTORY: 'Leer el historial de mensajes',
	MENTION_EVERYONE: 'Mencionar a todos',
	USE_EXTERNAL_EMOJIS: 'Usar Emojis externos',
	ADD_REACTIONS: 'Añadir reacciones',
	CONNECT: 'Conectar',
	SPEAK: 'Hablar',
	MUTE_MEMBERS: 'Silenciar Miembros',
	DEAFEN_MEMBERS: 'Ensordecer Miembros',
	MOVE_MEMBERS: 'Mover Miembros',
	USE_VAD: 'Usar la actividad de voz',
	PRIORITY_SPEAKER: 'Orador Prioritario'
};

const random = (num: number) => Math.round(Math.random() * num);

function duration(time: number) {
	return FriendlyDuration.duration(time, TIMES);
}

export default class extends Language {

	public PERMISSIONS = PERMS;
	public HUMAN_LEVELS = {
		0: 'Ninguno',
		1: 'Bajo',
		2: 'Medio',
		3: '(╯°□°）╯︵ ┻━┻',
		4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
	};

	public duration = duration;

	public language: Record<string, any> = {
		/**
		 * ################################
		 * #      FRAMEWORK MESSAGES      #
		 * #         KLASA 0.5.0d         #
		 * ################################
		 */

		DEFAULT: (key) => `La clave ${key} aún no ha sido traducida a es-ES.`,
		DEFAULT_LANGUAGE: 'Lenguaje Predeterminado',
		SETTING_GATEWAY_EXPECTS_GUILD: 'El parámetro <Guild> requiere o una ID o una instancia de Guild.',
		SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) => `El valor ${data} para la clave ${key} no existe.`,
		SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) => `El valor ${data} para la clave ${key} ya existe.`,
		SETTING_GATEWAY_SPECIFY_VALUE: 'Debes especificar el valor para añadir o eliminar.',
		SETTING_GATEWAY_KEY_NOT_ARRAY: (key) => `La clave ${key} no acepta múltiples valores.`,
		SETTING_GATEWAY_CHOOSE_KEY: (keys) => `Por favor, elija alguno de las siguientes claves: '${keys}'`,
		SETTING_GATEWAY_UNCONFIGURABLE_FOLDER: 'Este grupo no es configurable.',
		SETTING_GATEWAY_KEY_NOEXT: (key) => `La clave ${key} no existe en el esquema de datos.`,
		SETTING_GATEWAY_INVALID_TYPE: `El tipo de parámetro debe ser o 'add' para añadir, o 'remove' para eliminar.`,
		SETTING_GATEWAY_INVALID_FILTERED_VALUE: (entry, value) => `${entry.key} no acepta el valor: ${value}`,
		RESOLVER_MULTI_TOO_FEW: (name, min = 1) => `No pude resolver suficientes ${name}s. Al menos ${min} ${min === 1 ? 'es' : 'son'} requeridos.`,
		RESOLVER_INVALID_BOOL: (name) => `${name} debe ser o 'true' para afirmativo, o 'false' para negativo.`,
		RESOLVER_INVALID_CHANNEL: (name) => `${name} debe ser una mención de canal o una id de canal válida.`,
		RESOLVER_INVALID_CUSTOM: (name, type) => `${name} debe ser un válido ${type}.`,
		RESOLVER_INVALID_DATE: (name) => `${name} debe ser una fecha válida.`,
		RESOLVER_INVALID_DURATION: (name) => `${name} debe ser una duración válida.`,
		RESOLVER_INVALID_EMOJI: (name) => `${name} debe ser un emoji o una id de emoji válida.`,
		RESOLVER_INVALID_FLOAT: (name) => `${name} debe ser un número válido.`,
		RESOLVER_INVALID_GUILD: (name) => `${name} debe ser una id de servidor válida.`,
		RESOLVER_INVALID_INT: (name) => `${name} debe ser un número entero válido.`,
		RESOLVER_INVALID_LITERAL: (name) => `La opción no coincide con la única posibilidad: ${name}`,
		RESOLVER_INVALID_MEMBER: (name) => `${name} debe ser una mención de usuario o una id de usuario válida.`,
		RESOLVER_INVALID_MSG: (name) => `${name} debe ser una id de mensaje válida.`,
		RESOLVER_INVALID_PIECE: (name, piece) => `${name} debe ser un nombre de ${piece} válido.`,
		RESOLVER_INVALID_REGEX_MATCH: (name, pattern) => `${name} debe combinar con el siguiente patrón \`${pattern}\`.`,
		RESOLVER_INVALID_ROLE: (name) => `${name} debe ser una mención de rol o una id de rol válida.`,
		RESOLVER_INVALID_STRING: (name) => `${name} debe ser un texto no vacío válido.`,
		RESOLVER_INVALID_TIME: (name) => `${name} debe ser una duración o fecha válida.`,
		RESOLVER_INVALID_URL: (name) => `${name} debe ser un enlace válido.`,
		RESOLVER_INVALID_USER: (name) => `${name} debe ser una mención o una id de usuario válida.`,
		RESOLVER_STRING_SUFFIX: ' carácteres',
		RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `${name} debe ser exactamente de ${min}${suffix}.`,
		RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `${name} debe ser de exactamente entr ${min} y ${max}${suffix}.`,
		RESOLVER_MINMAX_MIN: (name, min, suffix) => `${name} debe ser mayor que ${min}${suffix}.`,
		RESOLVER_MINMAX_MAX: (name, max, suffix) => `${name} debe ser menor que ${max}${suffix}.`,
		REACTIONHANDLER_PROMPT: '¿A qué página te gustaría saltar?',
		COMMANDMESSAGE_MISSING: 'Faltan uno o más argumentos al final de la entrada.',
		COMMANDMESSAGE_MISSING_REQUIRED: (name) => `El argumento ${name} es requerido.`,
		COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) => `Falta una opción requerida: (${possibles})`,
		COMMANDMESSAGE_NOMATCH: (possibles) => `Su opción no se pudo encontrar en ninguna de las posibilidades: (${possibles})`,
		MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time, abortOptions) => `${tag} | **${error}** | Tienes **${time}** segundos para responder a este mensaje con un argumento válido. Escribe **${abortOptions.join('**, **')}** para cancelar la solicitud.`,
		MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time, cancelOptions) => `${tag} | El argumento **${name}** puede aceptar multiples valores | Tienes **${time}** segundos para responder a esta solicitud con valores adicionales. Escribe **${cancelOptions.join('**, **')}** para cancelar la solicitud.`,
		MONITOR_COMMAND_HANDLER_ABORTED: 'Cancelado.',
		MONITOR_COMMAND_HANDLER_POSSIBILITIES: ['abortar', 'parar'],
		MONITOR_COMMAND_HANDLER_REPEATING_POSSIBLITIES: ['cancelar'],
		INHIBITOR_COOLDOWN: (remaining) => `Acabas de usar este comando. Puedes usarlo de nuevo en ${duration(remaining)}.`,
		INHIBITOR_DISABLED: 'Este comando está desactivado',
		INHIBITOR_MISSING_BOT_PERMS: (missing) => `No tengo los permisos suficientes, me faltan: **${missing}**`,
		INHIBITOR_NSFW: 'Este comando no es apto para este canal, no es un canal marcado como "NSFW"',
		INHIBITOR_PERMISSIONS: 'No tienes permisos para usar este comando',
		INHIBITOR_REQUIRED_SETTINGS: (settings) => `El servidor requiere ${settings.length === 1 ? 'el ajuste' : 'los ajustes'} del servidor **${settings.join(', ')}**, y por lo tanto, no puedo ejecutar el comando.`,
		INHIBITOR_RUNIN: (types) => `Éste comando sólo está disponible en los canales de ${types}`,
		INHIBITOR_RUNIN_NONE: (name) => `El comando ${name} no está configurado para ejecutarse en algún canal.`,
		COMMAND_BLACKLIST_DESCRIPTION: 'Pone o quita usuarios and servidores de mi lista negra.',
		COMMAND_BLACKLIST_SUCCESS: (usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
			usersAdded.length ? `**Usuarios Añadidos**\n${codeBlock('', usersAdded.join(', '))}` : '',
			usersRemoved.length ? `**Usuarios Eliminados**\n${codeBlock('', usersRemoved.join(', '))}` : '',
			guildsAdded.length ? `**Servidores Añadidos**\n${codeBlock('', guildsAdded.join(', '))}` : '',
			guildsRemoved.length ? `**Servidores Eliminados**\n${codeBlock('', guildsRemoved.join(', '))}` : ''
		].filter((val) => val !== '').join('\n'),
		COMMAND_UNLOAD: (type, name) => `${GREENTICK} Eliminado con éxito la pieza tipo ${type}: ${name}`,
		COMMAND_UNLOAD_DESCRIPTION: 'Elimina una pieza de Klasa.',
		COMMAND_TRANSFER_ERROR: `${REDCROSS} El archivo ya había sido transferido o nunca existió.`,
		COMMAND_TRANSFER_SUCCESS: (type, name) => `${GREENTICK} Transferido con éxito la pieza tipo ${type}: ${name}`,
		COMMAND_TRANSFER_FAILED: (type, name) => `La transferencia de la pieza tipo ${type}: ${name} al cliente falló. Por favor revisa la consola.`,
		COMMAND_TRANSFER_DESCRIPTION: 'Transfiere una pieza interna a su carpeta respectiva.',
		COMMAND_RELOAD: (type, name, time) => `${GREENTICK} Recargada la pieza tipo ${type}: ${name}. (Tomó: ${time})`,
		COMMAND_RELOAD_ALL: (type, time) => `${GREENTICK} Recargadas todas las piezas tipo ${type}. (Tomó: ${time})`,
		COMMAND_RELOAD_EVERYTHING: (time) => `${GREENTICK} Recargado todo. (Tomó: ${time})`,
		COMMAND_RELOAD_DESCRIPTION: 'Recarga una pieza de Klasa, o todas las piezas de su lista.',
		COMMAND_REBOOT: `${LOADING} Reiniciando...`,
		COMMAND_REBOOT_DESCRIPTION: 'Reinicia el bot.',
		COMMAND_PING: `${LOADING} Ping?`,
		COMMAND_PING_DESCRIPTION: 'Establece una prueba de conexión con Discord.',
		COMMAND_PINGPONG: (diff, ping) => `Pong! (El viaje ida y vuelta tomó: ${diff}ms. Pulso: ${ping}ms.)`,
		COMMAND_INVITE_DESCRIPTION: 'Muestra el enlace para invitarme.',
		COMMAND_INFO_DESCRIPTION: 'Muestra alguna información sobre mí.',
		COMMAND_HELP_DESCRIPTION: 'Muestra la ayuda para un comando o todos.',
		COMMAND_HELP_NO_EXTENDED: 'No está documentado completamente.',
		COMMAND_HELP_DM: '📥 | La lista de comandos ha sido enviada a tus mensajes privados.',
		COMMAND_HELP_NODM: `${REDCROSS} | Parece que tienes tus mensajes privados desactivados, no pude mandarte el mensaje.`,
		COMMAND_HELP_ALL_FLAG: `${LOADING} Mostrando una categoría por página. ¿Problemas con el mensaje? Envía \`Skyra, help --all\` para la lista de todos los comandos en tus Mensajes Directos.`,
		COMMAND_ENABLE: (type, name) => `+ Activado con éxito la pieza tipo ${type}: ${name}`,
		COMMAND_ENABLE_DESCRIPTION: 'Re-activa o activa temporalmente una pieza de Klasa. El estado por defecto es restaurado al recargar.',
		COMMAND_DISABLE: (type, name) => `+ Desactivado con éxito la pieza tipo ${type}: ${name}`,
		COMMAND_DISABLE_DESCRIPTION: 'Re-desactiva o desactiva temporalmente una pieza de Klasa. El estado por defecto es restaurado al recargar.',
		COMMAND_DISABLE_WARN: 'Probablemente no quieras desactivar eso, ya que no tendrías ningún comando para re-activarlo.',
		COMMAND_CONF_NOKEY: 'Debes proveer el nombre de una clave.',
		COMMAND_CONF_NOVALUE: 'Debes proveer un valor para la clave.',
		COMMAND_CONF_GUARDED: (name) => `La pieza ${toTitleCase(name)} no debería ser desactivada.`,
		COMMAND_CONF_UPDATED: (key, response) => `Actualizado con éxito la clave **${key}** al valor: \`${response}\`.`,
		COMMAND_CONF_KEY_NOT_ARRAY: 'Esta clave no acepta múltiples valores. Usa la acción \'reset\' en su lugar.',
		COMMAND_CONF_GET_NOEXT: (key) => `The key **${key}** does not seem to exist.`,
		COMMAND_CONF_GET: (key, value) => `The value for the key **${key}** is: \`${value}\``,
		COMMAND_CONF_RESET: (key, response) => `The key **${key}** has been reset to: \`${response}\``,
		COMMAND_CONF_NOCHANGE: (key) => `The value for **${key}** was already that value.`,
		COMMAND_CONF_SERVER_DESCRIPTION: 'Define per-server settings.',
		COMMAND_CONF_SERVER: (key, list) => `**Server Setting ${key}**\n${list}`,
		COMMAND_CONF_USER_DESCRIPTION: 'Define per-user settings.',
		COMMAND_CONF_USER: (key, list) => `**User Setting ${key}**\n${list}`,
		MESSAGE_PROMPT_TIMEOUT: 'La solicitud no recibió ninguna respuesta a tiempo.',
		COMMAND_LOAD: (time, type, name) => `${GREENTICK} Successfully loaded ${type}: ${name}. (Took: ${time})`,
		COMMAND_LOAD_FAIL: 'The file does not exist, or an error occurred while loading your file. Please check your console.',
		COMMAND_LOAD_ERROR: (type, name, error) => `${REDCROSS} Failed to load ${type}: ${name}. Reason:${codeBlock('js', error)}`,
		COMMAND_LOAD_DESCRIPTION: 'Load a piece from your bot.',

		/**
		 * ################################
		 * #     COMMAND DESCRIPTIONS     #
		 * ################################
		 */

		COMMAND_CONF_MENU_NOPERMISSIONS: `I need the permissions ${PERMS.ADD_REACTIONS} and ${PERMS.MANAGE_MESSAGES} to be able to run the menu.`,
		COMMAND_CONF_MENU_RENDER_AT_FOLDER: (path) => `Currently at: \\📁 ${path}`,
		COMMAND_CONF_MENU_RENDER_AT_PIECE: (path) => `Currently at: ${path}`,
		COMMAND_CONF_MENU_RENDER_NOKEYS: 'There are no configurable keys for this folder',
		COMMAND_CONF_MENU_RENDER_SELECT: 'Please select any of the following entries',
		COMMAND_CONF_MENU_RENDER_TCTITLE: 'Text Commands:',
		COMMAND_CONF_MENU_RENDER_UPDATE: '• Update Value → `set <value>`',
		COMMAND_CONF_MENU_RENDER_REMOVE: '• Remove Value → `remove <value>`',
		COMMAND_CONF_MENU_RENDER_RESET: '• Reset Value → `reset`',
		COMMAND_CONF_MENU_RENDER_UNDO: '• Undo Update → `undo`',
		COMMAND_CONF_MENU_RENDER_CVALUE: (value) => `Current Value: **\`\`${value}\`\`**`,
		COMMAND_CONF_MENU_RENDER_BACK: 'Press ◀ to go back',
		COMMAND_CONF_MENU_INVALID_KEY: 'Invalid Key, please try again with any of the following options.',
		COMMAND_CONF_MENU_INVALID_ACTION: 'Invalid Action, please try again with any of the following options.',
		COMMAND_CONF_MENU_SAVED: 'Successfully saved all changes.',

		SETTINGS_PREFIX: 'A prefix is an affix that is added in front of the word, in this case, the message. It allows bots to distinguish between a regular message and a command.',
		SETTINGS_LANGUAGE: 'The language I will use for your server. It may not be available in the language you want.',
		SETTINGS_DISABLEDCOMMANDS: 'The disabled commands, core commands may not be disabled, and moderators will override this. All commands must be in lower case.',
		SETTINGS_CHANNELS_ANNOUNCEMENT: 'The channel for announcements, in pair with the key `roles.subscriber`, they are required for the announce command.',
		SETTINGS_CHANNELS_DEFAULT: 'The channel I will use to send greetings and farewells, you must enable the events and set up the messages, in other categories.',
		SETTINGS_CHANNELS_LOG: 'The channel for member logs, you must enable the events (`events.memberAdd` for new members, `events.memberRemove` for members who left).',
		SETTINGS_CHANNELS_MESSAGELOGS: 'The channel for (non-NSFW) message logs, you must enable the events (`events.messageDelete` for deleted messages, `events.messageEdit` for edited messages).',
		SETTINGS_CHANNELS_MODLOG: 'The channel for moderation logs, once enabled, I will post all my moderation cases there. If `events.banRemove` and/or `events.banRemove` are enabled, I will automatically post anonymous logs.',
		SETTINGS_CHANNELS_NSFWMESSAGELOGS: 'The channel for NSFW message logs, same requirement as normal message logs, but will only send NSFW messages.',
		SETTINGS_CHANNELS_ROLES: 'The channel for the reaction roles.',
		SETTINGS_CHANNELS_SPAM: 'The channel for me to redirect users to when they use commands I consider spammy.',
		SETTINGS_DISABLEDCHANNELS: 'A list of channels for disabled commands, for example, setting up a channel called general will forbid all users from using my commands there. Moderators+ override this purposedly to allow them to moderate without switching channels.',
		SETTINGS_EVENTS_BANADD: 'This event posts anonymous moderation logs when a user gets banned. You must set up `channels.modlog`.',
		SETTINGS_EVENTS_BANREMOVE: 'This event posts anonymous moderation logs when a user gets unbanned. You must set up `channels.modlog`.',
		SETTINGS_EVENTS_MEMBERADD: 'This event posts member logs when a user joins. They will be posted in `channels.log`.',
		SETTINGS_EVENTS_MEMBERREMOVE: 'This event posts member logs when a user leaves. They will be posted in `channels.log`.',
		SETTINGS_EVENTS_MESSAGEDELETE: 'This event posts message logs when a message is edited. They will be posted in `channels.messagelogs` (or `channel.nsfwmessagelogs` in case of NSFW channels).',
		SETTINGS_EVENTS_MESSAGEEDIT: 'This event posts message logs when a message is edited. They will be posted in `channels.messagelogs` (or `channel.nsfwmessagelogs` in case of NSFW channels).',
		SETTINGS_MESSAGES_FAREWELL: 'The message I shall send to when a user leaves. You must set up `channels.default` and `events.memberRemove`',
		SETTINGS_MESSAGES_GREETING: 'The message I shall send to when a user joins. You must set up `channels.default` and `events.memberAdd`',
		SETTINGS_MESSAGES_JOIN_DM: 'The message I shall send to when a user joins in DMs.',
		SETTINGS_MESSAGES_WARNINGS: 'Whether or not I should send warnings to the user when they receive one.',
		SETTINGS_ROLES_ADMIN: `The administrator role, their priviledges in Skyra will be upon moderative, covering management. Defaults to anyone with the ${PERMS.MANAGE_GUILD} permission.`,
		SETTINGS_ROLES_INITIAL: 'The initial role, if configured, I will give it to users as soon as they join.',
		SETTINGS_ROLES_MODERATOR: 'The moderator role, their priviledges will cover almost all moderation commands. Defaults to anyone who can ban members.',
		SETTINGS_ROLES_MUTED: 'The muted role, if configured, I will give new muted users this role. Otherwise I will prompt you the creation of one.',
		SETTINGS_ROLES_PUBLIC: 'The public roles, they will be given with no cost to any user using the `roles` command.',
		SETTINGS_ROLES_REMOVEINITIAL: 'Whether the claim of a public role should remove the initial one too.',
		SETTINGS_ROLES_STAFF: 'The staff role, their priviledges are nearly helpers of moderators and administrators, but they cannot take any actions besides warnings.',
		SETTINGS_ROLES_SUBSCRIBER: 'The subscriber role, this role will be mentioned every time you use the `announce` command. I will always keep it non-mentionable so people do not abuse mentions.',
		SETTINGS_SELFMOD_CAPSMINIMUM: 'The minimum amount of characters the message must have before trying to delete it. You must enable it with the `setCapsFilter` command.',
		SETTINGS_SELFMOD_CAPSTHRESHOLD: 'The minimum percentage of caps allowed before taking action. You must enable it with the `setCapsFilter` command.',
		SETTINGS_SELFMOD_IGNORECHANNELS: 'The channels I will ignore, be careful any channel configured will have all auto-moderation systems (CapsFilter, InviteLinks, and NoMentionSpam) deactivated.',
		SETTINGS_SELFMOD_INVITELINKS: 'Whether or not I should delete invite links or not.',
		SETTINGS_SELFMOD_NMSTHRESHOLD: 'The minimum amount of "points" a user must accumulate before landing the hammer. A user mention will count as 1 point, a role mention as 2 points, and an everyone/here mention as 5 points.',
		SETTINGS_SELFMOD_NOMENTIONSPAM: 'Whether or not I should have the ban hammer ready for mention spammers.',
		SETTINGS_SELFMOD_RAID: 'Whether or not I should kick users when they try to raid the server.',
		SETTINGS_SELFMOD_RAIDTHRESHOLD: 'The minimum amount of users joined on the last 20 seconds required before starting to kick them and anybody else who joins until a minute cooldown or forced cooldown (using the `raid` command to manage this).',
		SETTINGS_SOCIAL_ACHIEVE: 'Whether or not I should congratulate people who get a new leveled role.',
		SETTINGS_SOCIAL_ACHIEVEMESSAGE: 'The congratulation message for people when they get a new leveled role. Requires `social.achieve` to be enabled.',
		SETTINGS_SOCIAL_IGNORECHANNELS: 'The channels I should ignore when adding points.',
		SETTINGS_STARBOARD_CHANNEL: 'The starboard channel. If you star a message, it will be posted there. Using the `setStarboardEmoji` command allows the emoji customization.',
		SETTINGS_STARBOARD_IGNORECHANNELS: 'The channels I should ignore when listening for new stars.',
		SETTINGS_STARBOARD_MINIMUM: 'The minimum amount of stars required before a message is posted to the starboard channel.',

		/**
		 * ################
		 * ANIMALS COMMANDS
		 */

		COMMAND_CATFACT_DESCRIPTION: 'Let me tell you a mysterious cat fact.',
		COMMAND_CATFACT_EXTENDED: builder.display('catfact', {
			extendedHelp: `Do **you** know cats are very curious, right? They certainly have a lot of fun and weird facts.
				This command queries catfact.ninja and retrieves a fact so you can read it.`
		}),
		COMMAND_DOG_DESCRIPTION: 'Cute doggos! ❤',
		COMMAND_DOG_EXTENDED: builder.display('dog', {
			extendedHelp: `Do **you** know how cute dogs are? They are so beautiful! This command uses a tiny selection of images
					From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
					some images that, sadly, got deleted and I cannot retrieve them 💔.`
		}),
		COMMAND_FOX_DESCRIPTION: 'Let me show you an image of a fox!',
		COMMAND_FOX_EXTENDED: builder.display('fox', {
			extendedHelp: `This command provides you a random image from PixaBay, always showing 'fox' results. However,
				it may not be exactly accurate and show you other kinds of foxes.`
		}),
		COMMAND_KITTY_DESCRIPTION: 'KITTENS!',
		COMMAND_KITTY_EXTENDED: builder.display('kitty', {
			extendedHelp: `Do **you** know how cute are kittens? They are so beautiful! This command uses a tiny selection of images
				From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
				some images that, sadly, got deleted and I cannot retrieve them 💔.`
		}),
		COMMAND_SHIBE_DESCRIPTION: 'Cute shibes!',
		COMMAND_SHIBE_EXTENDED: builder.display('shibe', {
			extendedHelp: `Everyone loves shibes, I shall love them aswell! They're so adorable ❤.`
		}),

		/**
		 * ##############
		 * ANIME COMMANDS
		 */

		COMMAND_ANIME_DESCRIPTION: 'Search your favourite anime by title with this command.',
		COMMAND_ANIME_EXTENDED: builder.display('anime', {
			extendedHelp: `This command queries Kitsu.io to show data for the anime you request. In a near future, this command
				will allow you to navigate between the results so you can read the information of the anime.`,
			explainedUsage: [
				['query', `The anime's name you are looking for.`]
			],
			examples: ['One Piece']
		}),
		COMMAND_MANGA_DESCRIPTION: 'Search your favourite manga by title with this command.',
		COMMAND_MANGA_EXTENDED: builder.display('manga', {
			extendedHelp: `This command queries Kitsu.io to show data for the manga you request. In a near future, this command',
				'will allow you to navigate between the results so you can read the information of the manga.`,
			explainedUsage: [
				['query', `The manga's name you are looking for.`]
			],
			examples: ['Stone Ocean', 'One Piece']
		}),

		/**
		 * #####################
		 * ANNOUNCEMENT COMMANDS
		 */

		COMMAND_ANNOUNCEMENT_DESCRIPTION: 'Send new announcements, mentioning the announcement role.',
		COMMAND_ANNOUNCEMENT_EXTENDED: builder.display('announcement', {
			extendedHelp: `This command requires an announcement channel (**channels.announcement** in the configuration command)
				which tells Skyra where she should post the announcement messages. Question is, is this command needed?
				Well, nothing stops you from making your announcements by yourself, however, there are many people who hate
				being mentioned by at everyone/here. To avoid this, Skyra gives you the option of creating a subscriber role,
				which is unmentionable (to avoid people spam mentioning the role), and once you run this command,
				Skyra will set the role to be mentionable, post the message, and back to unmentionable.`,
			explainedUsage: [
				['announcement', 'The announcement text to post.']
			],
			examples: ['I am glad to announce that we have a bot able to safely send announcements for our subscribers!']
		}),
		COMMAND_SUBSCRIBE_DESCRIPTION: `Subscribe to this server's announcements.`,
		COMMAND_SUBSCRIBE_EXTENDED: builder.display('subscribe', {
			extendedHelp: `This command serves the purpose of **giving** you the subscriber role, which must be configured by the
				server's administrators. When a moderator or administrator use the **announcement** command, you
					will be mentioned. This feature is meant to replace everyone/here tags and mention only the interested
					users.`
		}),
		COMMAND_UNSUBSCRIBE_DESCRIPTION: `Unsubscribe from this server's announcements.`,
		COMMAND_UNSUBSCRIBE_EXTENDED: builder.display('unsubscribe', {
			extendedHelp: `This command serves the purpose of **removing** you the subscriber role, which must be configured by the
					server's administrators. When a moderator or administrator use the **announcement** command, you
					will **not longer** be mentioned. This feature is meant to replace everyone/here tags and mention
					only the interested users.`
		}),

		/**
		 * ############
		 * FUN COMMANDS
		 */

		COMMAND_8BALL_DESCRIPTION: 'Skyra will read the Holy Bible to find the correct answer for your question.',
		COMMAND_8BALL_EXTENDED: builder.display('8ball', {
			extendedHelp: `This command provides you a random question based on your questions' type. Be careful, it may be too smart.`,
			explainedUsage: [
				['question', 'The Holy Question']
			],
			examples: ['Why did the chicken cross the road?']
		}),
		COMMAND_CHOICE_DESCRIPTION: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
		COMMAND_CHOICE_EXTENDED: builder.display('choice', {
			extendedHelp: `I have an existencial doubt... should I wash the dishes or throw them through the window? The search
					continues. List me items separated by comma and I will choose one them. On a side note, I am not
					responsible of what happens next.`,
			explainedUsage: [
				['words', 'A list of words separated by comma.']
			],
			examples: ['Should Wash the dishes, Throw the dishes out the window', 'Cat, Dog']
		}),
		COMMAND_CHANGEMYMIND_DESCRIPTION: 'Skyra is the best, change my mind.',
		COMMAND_CHANGEMYMIND_EXTENDED: builder.display('changeMyMind', {
			extendedHelp: `I still think I'm the best, change my mind. I make a photo with your avatar and some text in some paper.`,
			explainedUsage: [
				['text', 'The phrase you want.']
			],
			examples: ['Skyra is the best bot in this server']
		}),
		COMMAND_DICE_DESCRIPTION: `Roll the dice, 'x' rolls and 'y' sides.`,
		COMMAND_DICE_EXTENDED: builder.display('dice', {
			extendedHelp: `The mechanics of this command are easy. You have a dice, then you roll it __x__ times, but the dice
				can also be configured to have __y__ sides. By default, this command rolls a dice with 6 sides once.
				However, you can change the amount of rolls for the dice, and this command will 'roll' (get a random
					number between 1 and the amount of sides). For example, rolling a dice with 6 sides 3 times will leave
					a random sequence of three random numbers between 1 and 6, for example: 3, 1, 6; And this command will
					return 10 as output.`,
			explainedUsage: [
				['rolls', 'Defaults to 1, amount of times the dice should roll.'],
				['sides', 'Defaults to 6, amount of sides the dice should have.']
			],
			examples: ['370 24', '100 6', '6'],
			reminder: 'If you write numbers out of the range between 1 and 1024, Skyra will default the number to 1 or 6.'
		}),
		COMMAND_ESCAPEROPE_DESCRIPTION: 'Use the escape rope from Pokemon.',
		COMMAND_ESCAPEROPE_EXTENDED: builder.display('escaperope', {
			extendedHelp: '**Skyra** used **Escape Rope**.'
		}),
		COMMAND_HOWTOFLIRT_DESCRIPTION: 'Captain America, you do not know how to flirt.',
		COMMAND_HOWTOFLIRT_EXTENDED: builder.display('howtoflirt', {
			extendedHelp: `Let me show you how to effectively flirt with somebody using the Tony Stark's style for Captain
				America, I can guarantee that you'll get him.`,
			explainedUsage: [
				['user', 'The user to flirt with.']
			],
			examples: ['Skyra']
		}),
		COMMAND_LOVE_DESCRIPTION: 'Lovemeter, online!',
		COMMAND_LOVE_EXTENDED: builder.display('love', {
			extendedHelp: `Hey! Wanna check the lovemeter? I know it's a ridiculous machine, but many humans love it!
					Don't be shy and try it!`,
			explainedUsage: [
				['user', 'The user to rate.']
			],
			examples: ['Skyra']
		}),
		COMMAND_NORRIS_DESCRIPTION: `Enjoy your day reading Chuck Norris' jokes.`,
		COMMAND_NORRIS_EXTENDED: builder.display('norris', {
			extendedHelp: `Did you know that Chuck norris does **not** call the wrong number, but you **answer** the wrong phone?
					Woah, mindblow. He also threw a carton of milk and created the Milky Way. This command queries chucknorris.io
					and retrieves a fact (do not assume they're false, not in front of him) so you can read it`
		}),
		COMMAND_RATE_DESCRIPTION: 'Let bots have opinions and rate somebody.',
		COMMAND_RATE_EXTENDED: builder.display('rate', {
			extendedHelp: `Just because I am a bot doesn't mean I cannot rate you properly. I can grade you with a random number
					generator to ease the process. Okay okay, it's not fair, but I mean... I can also give you a 💯.`,
			explainedUsage: [
				['user', 'The user to rate.']
			],
			examples: ['Skyra', 'me']
		}),
		COMMAND_XKCD_DESCRIPTION: 'Read comics from XKCD.',
		COMMAND_XKCD_EXTENDED: builder.display('xkcd', {
			extendedHelp: `**xkcd** is an archive for nerd comics filled with math, science, sarcasm and languages. If you don't
					provide any argument, I will get a random comic from xkcd. If you provide a number, I will retrieve
					the comic with said number. But if you provide a title/text/topic, I will fetch a comic that matches
					with your input and display it. For example, \`Skyra, xkcd Curiosity\` will show the comic number 1091.`,
			explainedUsage: [
				['query', 'Either the number of the comic, or a title to search for.']
			],
			examples: ['1091', 'Curiosity']
		}),

		/**
		 * ##############
		 * GAMES COMMANDS
		 */

		COMMAND_C4_DESCRIPTION: 'Play Connect-Four with somebody.',
		COMMAND_C4_EXTENDED: builder.display('c4', {
			extendedHelp: `This game is better played on PC. Connect Four (also known as Captain's Mistress, Four Up, Plot
					Four, Find Four, Four in a Row, Four in a Line and Gravitrips (in Soviet Union)) is a two-player connection
					game in which the players first choose a color and then take turns dropping colored discs from the top into a
					seven-column, ~~six~~ five-row vertically suspended grid.`
		}),
		COMMAND_TICTACTOE_DESCRIPTION: 'Play Tic-Tac-Toe with somebody.',
		COMMAND_TICTACTOE_EXTENDED: builder.display('tictactoe', {
			extendedHelp: `Tic-tac-toe (also known as noughts and crosses or Xs and Os) is a paper-and-pencil game for two
				players, X and O, who take turns marking the spaces in a 3×3 grid. The player who succeeds in placing three of
				their marks in a horizontal, vertical, or diagonal row wins the game.`
		}),

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		COMMAND_CREATEMUTE_DESCRIPTION: 'Prepare the mute system.',
		COMMAND_CREATEMUTE_EXTENDED: builder.display('createMute', {
			extendedHelp: `This command prepares the mute system by creating a role called 'muted', and configuring it to
					the guild settings. This command also modifies all channels (where possible) permissions and disables
					the permission **${PERMS.SEND_MESSAGES}** in text channels and **${PERMS.CONNECT}** in voice channels for said role.`
		}),
		COMMAND_GIVEAWAY_DESCRIPTION: 'Start a new giveaway.',
		COMMAND_GIVEAWAY_EXTENDED: builder.display('giveaway', {
			extendedHelp: `This command is designed to manage giveaways. You can start them with this command by giving it the
					time and a title. When a giveaway has been created, Skyra will send a giveaway message and react to it with 🎉
					so the members of the server can participate on it. Once the timer ends, Skyra will retrieve all the users who
					reacted and send the owner of the giveaway a message in direct messages with the winner, and other 10 possible
					winners (in case of needing to re-roll).`,
			explainedUsage: [
				['time', 'The time the giveaway should last.'],
				['title', 'The title of the giveaway.']
			],
			examples: ['6h A hug from Skyra.']
		}),
		COMMAND_LIST_DESCRIPTION: 'Check the list of channels, roles, members or warnings for this guild.',
		COMMAND_LIST_EXTENDED: builder.display('list', {
			extendedHelp: `This command is designed to list (sorted) information for this guild with possible filters. For example,
					you can read all the channels with their ids or all the roles from the guild, sorted by their position and hierarchy
					position, respectively. However, this command also allows to display the members of a role or check the warnings given.`,
			explainedUsage: [
				['channels', 'Show a list of all channels for this guild.'],
				['roles', 'Show a list of all roles for this guild.'],
				['members', 'Show a list of all members for a role. If not provided, defaults to the author\'s highest role.'],
				['warnings', 'Show a list of all warnings for this guild, or all warnings given to a user.'],
				['input', 'If you take the members parameter, this parameter will select a role. In warnings this will select a member of the guild, otherwise it is ignored.']
			],
			examples: ['channels', 'warnings Skyra', 'members Moderators']
		}),
		COMMAND_MANAGEALIAS_DESCRIPTION: 'Manage aliases for commands for this server.',
		COMMAND_MANAGEALIAS_EXTENDED: builder.display('managealias', {
			extendedHelp: `Command aliases are custom aliases you can use to define a command with its parameters, for example, let's say
					the usage of a command is quite complicated or its parameters are very used. For example, let's say you want Skyra to
					recognize 'Skyra, ps4' as 'Skyra, roles claim ps4'. This is one of the things this system can do. However, you
					are also able to 'translate' them, i.e. you have a Spanish community and you want 'Skyra, suscribirse' as an alias of
					'Skyra, subscribe'.`,
			explainedUsage: [
				['add', 'Add an alias.'],
				['remove', 'Remove an alias.'],
				['list', 'List all aliases for this guild.'],
				['command', 'The command to define the alias to. (i.e. `ping`).'],
				['alias', 'The alias to apply for the aforementioned command.']
			],
			examples: ['add subscribe suscribirse', 'add "roles claim ps4" ps4']
		}),

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		COMMAND_NICK_DESCRIPTION: `Change Skyra's nickname for this guild.`,
		COMMAND_NICK_EXTENDED: builder.display('nick', {
			extendedHelp: `This command allows you to change Skyra's nickname easily for the guild.`,
			reminder: `This command requires the **${PERMS.CHANGE_NICKNAME}** permission. Make sure Skyra has it.`,
			explainedUsage: [
				['nick', `The new nickname. If you don't put any, it'll reset it instead.`]
			],
			examples: ['SkyNET', 'Assistant', '']
		}),
		COMMAND_TRIGGERS_DESCRIPTION: `Set custom triggers for your guild.`,
		COMMAND_TRIGGERS_EXTENDED: builder.display('triggers', {
			extendedHelp: `This command allows administrators to go further with the personalization of Skyra in the guild. A trigger is
					a piece that can active other functions. For example, the aliases are triggers that get executed when the command does not
					exist in bot, triggering the unknown command event. When this happens, the alias system executes and tries to find an entry
					that matches with the input.`,
			reminder: `This command requires the **${PERMS.ADD_REACTIONS}** permission so it can test reactions. Make sure Skyra has it.`,
			explainedUsage: [
				['list', `List all current triggers.`],
				['add <type> <input> <output>', 'Add a new trigger given a type, input and output.'],
				['remove <type> <input>', 'Remove a trigger given the type and input.']
			],
			examples: ['', 'list', 'add reaction "good night" 🌛', 'remove reaction "good night"']
		}),

		/**
		 * #################################
		 * MANAGEMENT/CONFIGURATION COMMANDS
		 */

		COMMAND_MANAGECOMMANDCHANNEL_DESCRIPTION: 'Manage per-channel command blacklist.',
		COMMAND_MANAGECOMMANDCHANNEL_EXTENDED: builder.display('manageCommandChannel', {
			extendedHelp: `This command manages this guild's per-channel command blacklist, it serves well to disable certain commands you do not want
					to be used in certain channels (to disable a command globally, use the \`disabledCommands\` settings key to disable in all channels.`,
			explainedUsage: [
				['show [channel]', 'Show the command blacklist for the selected channel'],
				['add [channel] <command>', 'Add a command to the specified channel\'s command blacklist.'],
				['remove [channel] <command>', 'Remove a command to the specified channel\'s command blacklist.'],
				['reset [channel]', 'Clear the command blacklist for the specified channel.']
			],
			reminder: 'The channel argument is optional, but it uses fuzzy search when possible.',
			examples: ['show', 'add #general profile', 'remove #general profile', 'reset #general']
		}),
		COMMAND_MANAGEROLEREACTION_DESCRIPTION: 'Manage the role reactions.',
		COMMAND_MANAGEROLEREACTION_EXTENDED: builder.display('manageRoleReaction', {
			extendedHelp: `This command manages the role reaction module, it requires a **role channel** set up and the permissions **${PERMS.ADD_REACTIONS}**
					and **${PERMS.READ_MESSAGE_HISTORY}** to be able to validate and operate correctly.`,
			explainedUsage: [
				['show', 'Show all the currently configured role reactions.'],
				['add <role> <emoji>', 'Add a new role reaction with the role ID or name, and a valid emoji.'],
				['remove <emoji>', 'Remove a role reaction by its configured emoji.'],
				['reset', 'Reset all the current role reactions.']
			],
			reminder: 'You cannot set the same emoji twice, and Skyra may remove role reactions automatically if she loses permissions or they are removed.',
			examples: ['show', 'add Baited 🎵', 'add "Looking for Group" 🎮', 'remove 🎮', 'reset']
		}),
		COMMAND_SETIGNORECHANNELS_DESCRIPTION: 'Set a channel to the ignore channel list.',
		COMMAND_SETIGNORECHANNELS_EXTENDED: builder.display('setIgnoreChannels', {
			extendedHelp: `This command helps you setting up ignored channels. An ignored channel is a channel where nobody but moderators
					can use Skyra's commands. Unlike removing the **${PERMS.SEND_MESSAGES}** permission, Skyra is still able to send (and therefore
					execute commands) messages, which allows moderators to use moderation commands in the channel. Use this if you want to ban
					any command usage from the bot in a specific channel.`,
			explainedUsage: [
				['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
			],
			reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
			examples: ['#general', 'here']
		}),
		COMMAND_SETMEMBERLOGS_DESCRIPTION: 'Set the member logs channel.',
		COMMAND_SETMEMBERLOGS_EXTENDED: builder.display('setMemberLogs', {
			extendedHelp: `This command helps you setting up the member log channel. A member log channel only sends two kinds of logs: "Member Join" and
					"Member Leave". If a muted user joins, it will send a special "Muted Member Join" event. All messages are in embeds so you will need to enable
					the permission **${PERMS.EMBED_LINKS}** for Skyra. You also need to individually set the "events" you want to listen: "events.memberAdd" and
					"events.memberRemove". For roles, you would enable "events.memberNicknameChange" and/or "events.memberRolesChange" via the "config" command.`,
			explainedUsage: [
				['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
			],
			examples: ['#member-logs', 'here']
		}),
		COMMAND_SETMESSAGELOGS_DESCRIPTION: 'Set the message logs channel.',
		COMMAND_SETMESSAGELOGS_EXTENDED: builder.display('setMessageLogs', {
			extendedHelp: `This command helps you setting up the message log channel. A message log channel only sends three kinds of logs: "Message Delete",
					"Message Edit", and "Message Prune". All messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra. You
					also need to individually set the "events" you want to listen: "events.messageDelete", "events.messageEdit", and "events.messagePrune" via the
					"config" command.`,
			explainedUsage: [
				['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
			],
			reminder: `Due to Discord limitations, Skyra cannot know who deleted a message. The only way to know is by fetching audit logs, requiring the
				permission **${PERMS.VIEW_AUDIT_LOG}** which access is limited in the majority of guilds and the amount of times I can fetch them in a period of time.`,
			examples: ['#message-logs', 'here']
		}),
		COMMAND_SETMODLOGS_DESCRIPTION: 'Set the mod logs channel.',
		COMMAND_SETMODLOGS_EXTENDED: builder.display('setModLogs', {
			extendedHelp: `This command helps you setting up the mod log channel. A mod log channel only sends case reports indexed by a number case and with
					"claimable" reasons and moderators. This channel is not a must and you can always retrieve specific modlogs with the "case" command. All
					messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra. For auto-detection, you need to individually
					set the "events" you want to listen: "events.banAdd", "events.banRemove" via the "config" command.`,
			explainedUsage: [
				['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
			],
			reminder: `Due to Discord limitations, the auto-detection does not detect kicks. You need to use the "kick" command if you want to document them as
				a formal moderation log case.`,
			examples: ['#mod-logs', 'here']
		}),
		COMMAND_SETPREFIX_DESCRIPTION: 'Set Skyra\'s prefix.',
		COMMAND_SETPREFIX_EXTENDED: builder.display('setPrefix', {
			extendedHelp: `This command helps you setting up Skyra's prefix. A prefix is an affix that is added in front of the word, in this case, the message.
					It allows bots to distinguish between a regular message and a command. By nature, the prefix between should be different to avoid conflicts. If
					you forget Skyra's prefix, simply mention her with nothing else and she will tell you the current prefix. Alternatively, you can take advantage
					of Skyra's NLP (Natural Language Processing) and prefix the commands with her name and a comma. For example, "Skyra, ping".`,
			explainedUsage: [
				['prefix', `The prefix to set. Default one in Skyra is "${this.client.options.prefix}".`]
			],
			reminder: `Your prefix should only contain characters everyone can write and type.`,
			examples: ['&', '=']
		}),
		COMMAND_SETROLECHANNEL_DESCRIPTION: 'Set the role channel for role reactions.',
		COMMAND_SETROLECHANNEL_EXTENDED: builder.display('setRoleChannel', {
			extendedHelp: `This command sets up the role channel to lock the reactions to, it is a requirement to set up before setting up the **role message**,
					and if none is given, the role reactions module will not run.`,
			explainedUsage: [
				['channel', 'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.']
			],
			reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
			examples: ['#roles', 'here']
		}),
		COMMAND_SETROLEMESSAGE_DESCRIPTION: 'Set the role message for role reactions.',
		COMMAND_SETROLEMESSAGE_EXTENDED: builder.display('setRoleMessage', {
			extendedHelp: `This command sets up the role message to lock the reactions to, it requires a **role channel** to be set up first, and if none is given,
					Skyra will listen to any reaction in the channel. Additionally, Skyra requires **${PERMS.READ_MESSAGE_HISTORY}** in order to fetch the message for
					validation.`,
			explainedUsage: [
				['message', 'An ID, they are 17-18 characters long and numeric.']
			],
			reminder: 'You must execute this command in the role channel.',
			examples: ['434096799847022598']
		}),
		COMMAND_SETSTARBOARDEMOJI_DESCRIPTION: 'Set the emoji reaction for starboard.',
		COMMAND_SETSTARBOARDEMOJI_EXTENDED: builder.display('setStarboardEmoji', {
			extendedHelp: `This command sets up the starboard emoji for the starboard, which is, by default, ⭐. Once this is changed, Skyra will ignore any star and
					will count users who reacted to said emoji.`,
			explainedUsage: [
				['emoji', 'The emoji to set.']
			],
			reminder: 'Use this wisely, not everyone expects the starboard to listen to a custom emoji.',
			examples: ['⭐']
		}),

		/**
		 * ###########################
		 * MANAGEMENT/HELPERS COMMANDS
		 */

		COMMAND_ROLEINFO_DESCRIPTION: 'Check the information for a role.',
		COMMAND_ROLEINFO_EXTENDED: builder.display('roleinfo', {
			extendedHelp: `The roleinfo command displays information for a role, such as its id, name, color, whether it's hoisted
					(displays separately) or not, it's role hierarchy position, whether it's mentionable or not, how many members have said
					role, and its permissions. It sends an embedded message with the color of the role.`,
			explainedUsage: [
				['role', 'The role name, partial name, mention or id.']
			],
			examples: ['Administrator', 'Moderator', '']
		}),
		COMMAND_GUILDINFO_DESCRIPTION: 'Check the information of the guild.',
		COMMAND_GUILDINFO_EXTENDED: builder.display('serverinfo', {
			extendedHelp: `The serverinfo command displays information for the guild the message got sent. It shows the amount of channels,
					with the count for each category, the amount of members (given from the API), the owner with their user id, the amount of roles,
					region, creation date, verification level... between others.`
		}),

		/**
		 * ###########################
		 * MANAGEMENT/MEMBERS COMMANDS
		 */

		COMMAND_STICKYROLES_DESCRIPTION: 'Manage sticky roles for users.',
		COMMAND_STICKYROLES_EXTENDED: builder.display('stickyRoles', {
			extendedHelp: `The stickyRoles command allows you to manage per-member's sticky roles, they are roles that are kept even when
				you leave, and are applied back as soon as they join.`,
			explainedUsage: [
				['action', 'Either you want to check the sticky roles, add one, remove one, or remove all of them.'],
				['user', 'The user target for all the actions.'],
				['role', 'The role to add or remove.']
			],
			examples: ['add Skyra Goddess', 'show Skyra', 'remove Skyra Goddess', 'reset Skyra'],
			reminder: `The member's roles will not be modified by this command, you need to add or remove them.`
		}),

		/**
		 * #####################################
		 * MANAGEMENT/ATTACHMENT FILTER COMMANDS
		 */

		COMMAND_MANAGEATTACHMENTS_DESCRIPTION: 'Manage attachment management in this guild.',
		COMMAND_MANAGEATTACHMENTS_EXTENDED: builder.display('manageAttachments', {
			extendedHelp: `This command manages the attachment management for me in this guild.`,
			examples: ['maximum 25', 'duration 1m', 'action mute', 'logs y', 'enable', 'disable'],
			explainedUsage: [
				['maximum <maximum>', 'The maximum amount of attachments allowed.'],
				['duration <duration>', 'The lifetime for the attachments in the system.'],
				['action <ban|kick|mute|softban>', 'Defines the action I will take once a user breaks the threshold.'],
				['logs <y|yes|n|no>', 'Defines whether or not should I log when somebody breaks the threshold.'],
				['enable', 'Enables the attachment filter.'],
				['disable', 'Disables the attachment filter.']
			]
		}),

		/**
		 * ###############################
		 * MANAGEMENT/CAPS FILTER COMMANDS
		 */

		COMMAND_SETCAPSFILTER_DESCRIPTION: 'Manage this guild\'s flags for the caps filter.',
		COMMAND_SETCAPSFILTER_EXTENDED: builder.display('setCapsFilter', {
			extendedHelp: `There are three flags in the caps filter, each enable or disable a function:
					- **Alert**: Whether or not the user should get a notification in the channel after reaching the threshold.
					- **Log**: Whether or not the caps filter should log to the moderation log channel when it triggers.
					- **Delete**: Whether or not the caps filter should delete the message.`
		}, true),

		/**
		 * ###############################
		 * MANAGEMENT/WORD FILTER COMMANDS
		 */

		COMMAND_FILTER_DESCRIPTION: 'Manage this guild\'s word blacklist.',
		COMMAND_FILTER_EXTENDED: builder.display('filter', {
			extendedHelp: `The filter command manages the word blacklist for this server and must have a filter mode set up, check \`Skyra, help setFilterMode\`.
					Skyra's word filter can find matches even with special characters or spaces between the letters of a blacklisted word, as well as it filters
					duplicated characters for enhanced filtering.`
		}),
		COMMAND_SETFILTERMODE_DESCRIPTION: 'Manage this guild\'s word blacklist mode.',
		COMMAND_SETFILTERMODE_EXTENDED: builder.display('setFilterMode', {
			extendedHelp: `The setFilterMode command manages the mode of the word blacklist, in Skyra, there are three modes: **Disabled** (the default value)
					which as its name suggests, it disables the word filter; **DeleteOnly**, which deletes the message; **LogOnly**, which does not delete the message
					but instead sends a modlog; and **All**, which enables both message deletion and logging.`,
			reminder: 'Both **LogOnly** and **All** modes require the key `channels.modlogs` to be set up.'
		}),

		/**
		 * #############
		 * MISC COMMANDS
		 */

		COMMAND_CUDDLE_DESCRIPTION: 'Cuddle somebody!',
		COMMAND_CUDDLE_EXTENDED: builder.display('cuddle', {
			extendedHelp: `Do you know something that I envy from humans? The warm feeling when somebody cuddles you. It's so cute ❤! I can
				imagine and draw a image of you cuddling somebody in the bed, I hope you like it!`,
			explainedUsage: [
				['user', 'The user to cuddle with.']
			],
			examples: ['Skyra']
		}),
		COMMAND_DELETTHIS_DESCRIPTION: '*Sees offensive post* DELETTHIS!',
		COMMAND_DELETTHIS_EXTENDED: builder.display('deletthis', {
			extendedHelp: `I see it! I see the hammer directly from your hand going directly to the user you want! Unless... unless it's me! If
				you try to tell me this, I'm going to take the MJOLNIR! Same if you do with my creator!`,
			explainedUsage: [
				['user', 'The user that should start deleting his post.']
			],
			examples: ['John Doe']
		}),
		COMMAND_F_DESCRIPTION: 'Press F to pay respects.',
		COMMAND_F_EXTENDED: builder.display('f', {
			extendedHelp: `This command generates an image... to pay respects reacting with 🇫. This command also makes Skyra
				react the image if she has permissions to react messages.`,
			explainedUsage: [
				['user', 'The user to pray respects to.']
			],
			examples: ['John Doe', 'Jake']
		}),
		COMMAND_GOODNIGHT_DESCRIPTION: 'Give somebody a nice Good Night!',
		COMMAND_GOODNIGHT_EXTENDED: builder.display('goodnight', {
			extendedHelp: `Let me draw you giving a goodnight kiss to the person who is going to sleep! Who doesn't like goodnight kisses?`,
			explainedUsage: [
				['user', 'The user to give the goodnight kiss.']
			],
			examples: ['Jake', 'DefinitivelyNotSleeping']
		}),
		COMMAND_GOOFYTIME_DESCRIPTION: `It's Goofy time!`,
		COMMAND_GOOFYTIME_EXTENDED: builder.display('goofytime', {
			extendedHelp: `IT'S GOOFY TIME! *Screams loudly in the background* NO, DAD! NO! This is a command based on the Goofy Time meme,
					what else would it be?`,
			explainedUsage: [
				['user', `The user who will say IT'S GOOFY TIME!`]
			],
			examples: ['TotallyNotADaddy']
		}),
		COMMAND_HUG_DESCRIPTION: 'Hugs!',
		COMMAND_HUG_EXTENDED: builder.display('hug', {
			extendedHelp: `What would be two people in the middle of the snow with coats and hugging each other? Wait! I get it!
				Mention somebody you want to hug with, and I'll try my best to draw it in a canvas!`,
			explainedUsage: [
				['user', 'The user to hug with.']
			],
			examples: ['Bear']
		}),
		COMMAND_INEEDHEALING_DESCRIPTION: `*Genji's voice* I NEED HEALING!`,
		COMMAND_INEEDHEALING_EXTENDED: builder.display('ineedhealing', {
			extendedHelp: `Do you know the worst nightmare for every single healer in Overwatch, specially for Mercy? YES! You know it,
				it's a cool cyborg ninja that looks like a XBOX and is always yelling "I NEED HEALING" loudly during the entire match.
				Well, don't expect so much, this command actually shows a medic with some tool in your chest.`,
			explainedUsage: [
				['healer', 'The healer you need to heal you.']
			],
			examples: ['Mercy']
		}),
		COMMAND_PINGKYRA_DESCRIPTION: 'How dare you ping me!?',
		COMMAND_PINGKYRA_EXTENDED: builder.display('pingkyra', {
			extendedHelp: `There are a few things that annoy kyra, one of them are **Windows 10's notifications**! Which also
				includes mentions from Discord, hence why this command exists.`,
			explainedUsage: [
				['pinger', 'The user who pinged Kyra.']
			],
			examples: ['IAmInnocent'],
			reminder: `If you mentioned kyra, you must self-execute this command against you.`
		}),
		COMMAND_SHINDEIRU_DESCRIPTION: 'Omae wa mou shindeiru.',
		COMMAND_SHINDEIRU_EXTENDED: builder.display('shindeiru', {
			extendedHelp: `"You are already dead" Japanese: お前はもう死んでいる; Omae Wa Mou Shindeiru, is an expression from the manga
				and anime series Fist of the North Star. This shows a comic strip of the character pronouncing the aforementioned words,
				which makes the opponent reply with "nani?" (what?).`,
			explainedUsage: [
				['user', `The person you're telling that phrase to.`]
			],
			examples: ['Jack']
		}),
		COMMAND_SLAP_DESCRIPTION: 'Slap another user using the Batman & Robin Meme.',
		COMMAND_SLAP_EXTENDED: builder.display('slap', {
			extendedHelp: `The hell are you saying? *Slaps*. This meme is based on a comic from Batman and Robin.`,
			explainedUsage: [
				['user', 'The user you wish to slap.']
			],
			examples: ['Jake'],
			reminder: `You try to slap me and I'll slap you instead.`
		}),
		COMMAND_THESEARCH_DESCRIPTION: 'Are we the only one in the universe, this man on earth probably knows.',
		COMMAND_THESEARCH_EXTENDED: builder.display('thesearch', {
			extendedHelp: `One man on Earth probably knows if there is intelligent life, ask and you shall receive an answer.`,
			explainedUsage: [
				['answer', 'The sentence that will reveal the truth.']
			],
			examples: ['Your waifu is not real.']
		}),
		COMMAND_TRIGGERED_DESCRIPTION: 'I am getting TRIGGERED!',
		COMMAND_TRIGGERED_EXTENDED: builder.display('triggered', {
			extendedHelp: `What? My commands are not enough userfriendly?! (╯°□°）╯︵ ┻━┻. This command generates a GIF image
					your avatar wiggling fast, with a TRIGGERED footer, probably going faster than I thought, I don't know.`,
			explainedUsage: [
				['user', 'The user that is triggered.']
			],
			examples: ['kyra']
		}),
		COMMAND_UPVOTE_DESCRIPTION: 'Get a link to upvote Skyra in **Bots For Discord**',
		COMMAND_UPVOTE_EXTENDED: builder.display('upvote', {
			extendedHelp: `Bots For Discord is a website where you can find amazing bots for your website. If you really love me,
					you can help me a lot by upvoting me every 24 hours, so more users will be able to find me!`
		}),
		COMMAND_VAPORWAVE_DESCRIPTION: 'Vapowave characters!',
		COMMAND_VAPORWAVE_EXTENDED: builder.display('vaporwave', {
			extendedHelp: `Well, what can I tell you? This command turns your messages into unicode monospaced characters. That
					is, what humans call 'Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ'. I wonder what it means...`,
			explainedUsage: [
				['phrase', 'The phrase to convert']
			],
			examples: ['A E S T H E T I C']
		}),

		/**
		 * ##############################
		 * MODERATION/MANAGEMENT COMMANDS
		 */

		COMMAND_HISTORY_DESCRIPTION: 'Display the count of moderation cases from this guild or from a user.',
		COMMAND_HISTORY_EXTENDED: builder.display('history', {
			extendedHelp: `This command shows the amount of bans, mutes, kicks, and warnings, including temporary, that have not been
					appealed.`,
			examples: ['', '@Pete']
		}),
		COMMAND_WARNINGS_DESCRIPTION: 'List all warnings from this guild or from a user.',
		COMMAND_WARNINGS_EXTENDED: builder.display('warnings', {
			extendedHelp: `This command shows either all warnings filed in this guild, or all warnings filed in this guild
					for a specific user. This command uses a reaction-based menu and requires the permission **${PERMS.MANAGE_MESSAGES}**
					to execute correctly.`,
			examples: ['', '@Pete']
		}),

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		COMMAND_ARCHIVE_DESCRIPTION: '[BETA] Temporarily save all messages from the current channel.',
		COMMAND_ARCHIVE_EXTENDED: builder.display('archive', {
			extendedHelp: `The archive command fetches multiple messages from a channel with an optional filter. How does
					this command work? First, I fetch all the messages, apply the filter, and then it's when the magic happens,
					I make a "message gist", to respect End-User Data policies, all of this is encrypted and the gist requires
					a key to unlock so you can read the contents. You unlock and read the contents from the website.`,
			explainedUsage: [
				['Messages', 'The amount of messages to archive.'],
				['Filter', 'The filter to apply.'],
				['(Filter) Link', 'Filters messages that have links on the content.'],
				['(Filter) Invite', 'Filters messages that have invite links on the content.'],
				['(Filter) Bots', 'Filters messages sent by bots.'],
				['(Filter) You', 'Filters messages sent by Skyra.'],
				['(Filter) Me', 'Filters your messages.'],
				['(Filter) Upload', 'Filters messages that have attachments.'],
				['(Filter) User', 'Filters messages sent by the specified user.']
			],
			examples: ['50 me', '75 @kyra', '20 bots'],
			reminder: 'Message gists last 30 days, after that, they are deleted, you also need the encryption key.'
		}),
		COMMAND_CASE_DESCRIPTION: 'Get the information from a case given its index.',
		COMMAND_CASE_EXTENDED: builder.display('case', {
			extendedHelp: ``
		}),

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		COMMAND_BAN_DESCRIPTION: 'Hit somebody with the ban hammer.',
		COMMAND_BAN_EXTENDED: builder.display('ban', {
			extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**, and only members with lower role hierarchy position
					can be banned by me. No, the guild's owner cannot be banned. This action can be optionally timed to create
					a temporary ban.`,
			examples: ['@Pete', '@Pete Spamming all channels.', '@Pete Spamming all channels, for 24 hours.']
		}),
		COMMAND_KICK_DESCRIPTION: 'Hit somebody with the 👢.',
		COMMAND_KICK_EXTENDED: builder.display('kick', {
			extendedHelp: `This command requires **${PERMS.KICK_MEMBERS}**, and only members with lower role hierarchy position
					can be kicked by me. No, the guild's owner cannot be kicked.`,
			examples: ['@Pete', '@Pete Spamming general chat.']
		}),
		COMMAND_LOCKDOWN_DESCRIPTION: 'Close the gates for this channel!',
		COMMAND_LOCKDOWN_EXTENDED: builder.display('lockdown', {
			extendedHelp: `This command requires **${PERMS.MANAGE_CHANNELS}** in order to be able to manage the permissions for
					a channel. This command removes the permission **${PERMS.SEND_MESSAGES}** to the \`@everyone\` role so nobody but
					the members with roles that have their own overrides (besides administrators, who bypass channel overrides) can
					send messages. Optionally, you can pass time as second argument.`,
			examples: ['', '#general', '#general 5m']
		}),
		COMMAND_MUTE_DESCRIPTION: 'Mute a user in all text and voice channels.',
		COMMAND_MUTE_EXTENDED: builder.display('mute', {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
					can be managed by me. No, the guild's owner cannot be muted. This action can be optionally timed to create
					a temporary mute. This action saves a member's roles temporarily and will be granted to the user after the unmute.
					The muted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.`,
			examples: ['@Pete', '@Pete Spamming all channels', '@Pete Spamming all channels, for 24 hours.']
		}),
		COMMAND_PRUNE_DESCRIPTION: 'Prunes a certain amount of messages w/o filter.',
		COMMAND_PRUNE_EXTENDED: builder.display('prune', {
			extendedHelp: `This command deletes the given amount of messages given a filter within the last 100 messages sent
					in the channel the command has been run.`,
			explainedUsage: [
				['Messages', 'The amount of messages to prune.'],
				['Filter', 'The filter to apply.'],
				['(Filter) Link', 'Filters messages that have links on the content.'],
				['(Filter) Invite', 'Filters messages that have invite links on the content.'],
				['(Filter) Bots', 'Filters messages sent by bots.'],
				['(Filter) You', 'Filters messages sent by Skyra.'],
				['(Filter) Me', 'Filters your messages.'],
				['(Filter) Upload', 'Filters messages that have attachments.'],
				['(Filter) User', 'Filters messages sent by the specified user.']
			],
			examples: ['50 me', '75 @kyra', '20 bots'],
			reminder: 'Due to a Discord limitation, bots cannot delete messages older than 14 days.'
		}),
		COMMAND_REASON_DESCRIPTION: 'Edit the reason field from a moderation log case.',
		COMMAND_REASON_EXTENDED: builder.display('reason', {
			extendedHelp: `This command allows moderation log case management, it allows moderators to update the reason.`,
			examples: ['420 Spamming all channels', '419..421 Bad memes', 'latest Woops, I did a mistake!']
		}),
		COMMAND_SOFTBAN_DESCRIPTION: 'Hit somebody with the ban hammer, destroying all their messages for some days, and unban it.',
		COMMAND_SOFTBAN_EXTENDED: builder.display('softban', {
			extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**, and only members with lower role hierarchy position
					can be banned by me. No, the guild's owner cannot be banned. The ban feature from Discord has a feature that
					allows the moderator to remove all messages from all channels that have been sent in the last 'x' days, being
					a number between 0 (no days) and 7. The user gets unbanned right after the ban, so it is like a kick, but
					that can prune many many messages.`,
			examples: ['@Pete', '@Pete Spamming all channels', '@Pete 7 All messages sent in 7 are gone now, YEE HAH!']
		}),
		COMMAND_UNBAN_DESCRIPTION: 'Unban somebody from this guild.',
		COMMAND_UNBAN_EXTENDED: builder.display('unban', {
			extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**. It literally gets somebody from the rubbish bin,
					cleans them up, and allows the pass to this guild's gates.`,
			examples: ['@Pete', '@Pete Turns out he was not the one who spammed all channels ¯\\_(ツ)_/¯']
		}),
		COMMAND_UNMUTE_DESCRIPTION: 'Remove the scotch tape from a user.',
		COMMAND_UNMUTE_EXTENDED: builder.display('unmute', {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}** and removes a user from the muted people's list,
					and gives the old roles back if the user had them.`,
			examples: ['@Pete', '@Pete (Insert random joke here).']
		}),
		COMMAND_UNWARN_DESCRIPTION: 'Appeal a warning moderation log case.',
		COMMAND_UNWARN_EXTENDED: builder.display('unwarn', {
			extendedHelp: `This command appeals a warning, it requires no permissions, you only give me the moderation log
					case to appeal and the reason.`,
			examples: ['0 Whoops, wrong dude.', '42 Turns out this was the definition of life.']
		}),
		COMMAND_VMUTE_DESCRIPTION: 'Throw somebody\'s microphone out the window.',
		COMMAND_VMUTE_EXTENDED: builder.display('vmute', {
			extendedHelp: `This command requires **${PERMS.MUTE_MEMBERS}**, and only members with lower role hierarchy position
					can be silenced by me. No, the guild's owner cannot be silenced. This action can be optionally timed to create
					a temporary voice mute.`,
			examples: ['@Pete', '@Pete Singing too loud', '@Pete Literally sang hear rape, for 24 hours.']
		}),
		COMMAND_VOICEKICK_DESCRIPTION: 'Hit somebody with the 👢 for singing so bad and loud.',
		COMMAND_VOICEKICK_EXTENDED: builder.display('voicekick', {
			extendedHelp: `This command requires the permissions **${PERMS.MANAGE_CHANNELS}** to create a temporary (hidden)
					voice channel, and **${PERMS.MOVE_MEMBERS}** to move the user to the temporary channel. After this, the channel
					is quickly deleted, making the user leave the voice channel. For scared moderators, this command has almost no
					impact in the average user, as the channel is created in a way only me and the selected user can see and join,
					then quickly deleted.`,
			examples: ['@Pete', '@Pete Spamming all channels']
		}),
		COMMAND_VUNMUTE_DESCRIPTION: `Get somebody's microphone back so they can talk.`,
		COMMAND_VUNMUTE_EXTENDED: builder.display('vunmute', {
			extendedHelp: `This command requires **${PERMS.MUTE_MEMBERS}**, and only members with lower role hierarchy position
					can be un-silenced by me. No, the guild's owner cannot be un-silenced.`,
			examples: ['@Pete', '@Pete Appealed his times signing hear rape.']
		}),
		COMMAND_WARN_DESCRIPTION: 'File a warning to somebody.',
		COMMAND_WARN_EXTENDED: builder.display('warn', {
			extendedHelp: `This command files a warning to a user. This kind of warning is meant to be **formal warnings**, as
					they will be shown in the 'warnings' command. It is a good practise to do an informal warning before using this
					command.`,
			examples: ['@Pete Attempted to mention everyone.']
		}),

		/**
		 * ##################
		 * OVERWATCH COMMANDS
		 */

		/**
		 * ###############
		 * SOCIAL COMMANDS
		 */

		COMMAND_SOCIAL_DESCRIPTION: 'Configure this guild\'s member points.',
		COMMAND_SOCIAL_EXTENDED: builder.display('social', {
			extendedHelp: `This command allows for updating other members' points.`,
			explainedUsage: [
				['set <user> <amount>', 'Sets an amount of points to the user.'],
				['add <user> <amount>', 'Adds an amount of points to the user.'],
				['remove <user> <amount>', 'Removes an amount of points from the user.'],
				['reset <user>', 'Resets all pointss from the user.']
			],
			examples: ['set @kyra 40000', 'add @kyra 2400', 'remove @kyra 3000', 'reset @kyra']
		}),
		COMMAND_BANNER_DESCRIPTION: 'Configure the banner for your profile.',
		COMMAND_BANNER_EXTENDED: builder.display('banner', {
			extendedHelp: `Banners are vertical in Skyra, they decorate your profile card.`,
			explainedUsage: [
				['list', '(Default) Lists all available banners.'],
				['reset', 'Set your displayed banner to default.'],
				['buy <bannerID>', 'Buy a banner, must be an ID.'],
				['set <bannerID>', 'Set your displayed banner, must be an ID.']
			],
			examples: ['list', 'buy 0w1p06', 'set 0w1p06', 'reset']
		}),

		COMMAND_AUTOROLE_DESCRIPTION: '(ADM) List or configure the autoroles for a guild.',
		COMMAND_AUTOROLE_EXTENDED: builder.display('autorole', {
			extendedHelp: `Autoroles? They are roles that are available for everyone, and automatically given when they reach an
					amount of (local) points, an administrator must configure them through a setting command.`,
			explainedUsage: [
				['list', 'Lists all the current autoroles.'],
				['add <amount> <role>', 'Add a new autorole.'],
				['remove <role>', 'Remove an autorole from the list.'],
				['update <amount> <role>', 'Change the required amount of points for an existing autorole.']
			],
			reminder: `The current system grants a random amount of points between 4 and 8 points, for each post with a 1 minute cooldown.`,
			examples: ['list', 'add 20000 Trusted Member', 'update 15000 Trusted Member', 'remove Trusted Member']
		}),

		COMMAND_BALANCE_DESCRIPTION: 'Check your current balance.',
		COMMAND_BALANCE_EXTENDED: builder.display('balance', {
			extendedHelp: `The balance command retrieves your amount of ${SHINY}.`
		}),
		COMMAND_DAILY_DESCRIPTION: `Get your semi-daily ${SHINY}.`,
		COMMAND_DAILY_EXTENDED: builder.display('daily', {
			extendedHelp: `Shiiiiny!`,
			reminder: [
				'Skyra uses a virtual currency called Shiny, and it is used to buy stuff such as banners or bet it on slotmachines.',
				'You can claim dailies once every 12 hours.'
			].join('\n')
		}),
		COMMAND_LEADERBOARD_DESCRIPTION: 'Check the leaderboards.',
		COMMAND_LEADERBOARD_EXTENDED: builder.display('leaderboard', {
			extendedHelp: `The leaderboard command shows a list of users sorted by their local or global amount of points,
				by default, when using no arguments, it will show the local leaderboard. The leaderboards refresh after 10
					minutes.`,
			reminder: '"Local" leaderboards refer to the guild\'s top list. "Global" refers to all scores from all guilds.'
		}),
		COMMAND_LEVEL_DESCRIPTION: 'Check your global level.',
		COMMAND_LEVEL_EXTENDED: builder.display('level', {
			extendedHelp: `How much until the next level?`,
			explainedUsage: [
				['user', '(Optional) The user\'s profile to show. Defaults to the message\'s author.']
			]
		}),
		COMMAND_DIVORCE_DESCRIPTION: 'Break up with your couple!',
		COMMAND_DIVORCE_EXTENDED: builder.display('divorce', {
			extendedHelp: `Sniff... This command is used to break up with your couple, hopefully in this virtual world, you are
					allowed to marry the user again.`
		}),
		COMMAND_MARRY_DESCRIPTION: 'Marry somebody!',
		COMMAND_MARRY_EXTENDED: builder.display('marry', {
			extendedHelp: `Marry your waifu!`,
			explainedUsage: [
				['user', '(Optional) The user to marry with. If not given, the command will tell you who are you married with.']
			],
			examples: ['', '@love']
		}),
		COMMAND_MYLEVEL_DESCRIPTION: 'Check your local level.',
		COMMAND_MYLEVEL_EXTENDED: builder.display('mylevel', {
			extendedHelp: `How much until next auto role? How many points do I have in this guild?`,
			explainedUsage: [
				['user', '(Optional) The user\'s profile to show. Defaults to the message\'s author.']
			]
		}),
		COMMAND_PAY_DESCRIPTION: `Pay somebody with your ${SHINY}.`,
		COMMAND_PAY_EXTENDED: builder.display('pay', {
			extendedHelp: `Businessmen! Today is payday!`,
			explainedUsage: [
				['money', `Amount of ${SHINY} to pay, you must have the amount you are going to pay.`],
				['user', 'The targeted user to pay. (Must be mention/id)']
			],
			examples: [
				'200 @kyra'
			]
		}),
		COMMAND_PROFILE_DESCRIPTION: 'Check your user profile.',
		COMMAND_PROFILE_EXTENDED: builder.display('profile', {
			extendedHelp: `This command sends a card image with some of your user profile such as your global rank, experience...
				Additionally, you are able to customize your colours with the 'setColor' command.`,
			explainedUsage: [
				['user', '(Optional) The user\'s profile to show. Defaults to the message\'s author.']
			]
		}),
		COMMAND_REMINDME_DESCRIPTION: 'Manage your reminders.',
		COMMAND_REMINDME_EXTENDED: builder.display('remindme', {
			extendedHelp: `This command allows you to set, delete and list reminders.`,
			explainedUsage: [
				['title', 'What you want me to remind you.'],
				['time', 'The time the reminder should last. If not provided, Skyra will ask for it in a prompt.']
			],
			examples: [
				'me in 6h to fix this command.',
				'list',
				'delete jedbcuywb'
			]
		}),
		COMMAND_REPUTATION_DESCRIPTION: 'Give somebody a reputation point.',
		COMMAND_REPUTATION_EXTENDED: builder.display('reputation', {
			extendedHelp: `This guy is so helpful... I'll give him a reputation point! Additionally, you can check how many
					reputation points a user has by writing 'check' before the mention.`,
			explainedUsage: [
				['check', '(Optional) Whether you want to check somebody (or yours) amount of reputation.'],
				['user', 'The user to give a reputation point.']
			],
			reminder: 'You can give a reputation point once every 24 hours.',
			examples: ['check @kyra', 'check', '@kyra', 'check "User With Spaces"', '"User With Spaces"']
		}),
		COMMAND_SETCOLOR_DESCRIPTION: 'Change your user profile\'s color.',
		COMMAND_SETCOLOR_EXTENDED: builder.display('setColor', {
			extendedHelp: `The setColor command sets a color for your profile.`,
			explainedUsage: [
				['color', 'A color resolvable.']
			],
			possibleFormats: [
				['HEX', '#dfdfdf'],
				['RGB', 'rgb(200, 200, 200)'],
				['HSL', 'hsl(350, 100, 100)'],
				['B10', '14671839']
			]
		}),
		COMMAND_SLOTMACHINE_DESCRIPTION: `I bet 100${SHINY} you ain't winning this round.`,
		COMMAND_SLOTMACHINE_EXTENDED: builder.display('slotmachine', {
			extendedHelp: `A slot machine (American English), known variously as a fruit machine (British English), puggy
					(Scottish English),[1] the slots (Canadian and American English), poker machine/pokies (Australian English and
					New Zealand English), or simply slot (American English), is a casino gambling machine with three or more
					reels which spin when a button is pushed.`,
			explainedUsage: [
				['Amount', 'Either 50, 100, 200, 500, or even, 1000 shinies to bet.']
			],
			reminder: 'You will receive at least 5 times the amount (cherries/tada) at win, and up to 24 times (seven, diamond without skin).'
		}),

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		COMMAND_STAR_DESCRIPTION: 'Get a random starred message from the database or the star leaderboard.',
		COMMAND_STAR_EXTENDED: builder.display('star', {
			extendedHelp: `This command shows a random starred message or the starboard usage and leaderboard for this server.`
		}),

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		COMMAND_DM_DESCRIPTION: 'Sends a Direct Message. Reserved for bot owner for replying purposes.',
		COMMAND_DM_EXTENDED: builder.display('dm', {
			extendedHelp: `The DM command is reserved for bot owner, and it's only used for very certain purposes, such as replying feedback
				messages sent by users.`
		}),
		COMMAND_EVAL_DESCRIPTION: 'Evaluates arbitrary Javascript. Reserved for bot owner.',
		COMMAND_EVAL_EXTENDED: builder.display('eval', {
			extendedHelp: `The eval command evaluates code as-in, any error thrown from it will be handled.
					It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.
					The --wait flag changes the time the eval will run. Defaults to 10 seconds. Accepts time in milliseconds.
					The --output and --output-to flag accept either 'file', 'log', 'haste' or 'hastebin'.
					The --delete flag makes the command delete the message that executed the message after evaluation.
					The --silent flag will make it output nothing.
					The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.
					The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword
					The --showHidden flag will enable the showHidden option in util.inspect.
					The --lang and --language flags allow different syntax highlight for the output.
					The --json flag converts the output to json
					The --no-timeout flag disables the timeout
					If the output is too large, it'll send the output as a file, or in the console if the bot does not have the ${PERMS.ATTACH_FILES} permission.`,
			examples: [
				'msg.author.username;',
				'1 + 1;'
			]
		}, true),
		COMMAND_EXEC_DESCRIPTION: 'Execute Order 66.',
		COMMAND_EXEC_EXTENDED: builder.display('exec', {
			extendedHelp: `You better not know about this.`
		}),
		COMMAND_SETAVATAR_DESCRIPTION: `Set Skyra's avatar.`,
		COMMAND_SETAVATAR_EXTENDED: builder.display('setAvatar', {
			extendedHelp: `This command changes Skyra's avatar. You can send a URL or upload an image attachment to the channel.`
		}),
		COMMAND_DONATE_DESCRIPTION: 'Get information about how to donate to keep Skyra alive longer.',
		COMMAND_DONATE_EXTENDED: builder.display('donate', {
			extendedHelp: `
				Skyra Project started on 24th October 2016, if you are reading this, you are
				using the version ${VERSION}, which is the twelfth rewrite. I have
				improved a lot every single function from Skyra, and now, she is extremely fast.

				However, not everything is free, I need your help to keep Skyra alive in a VPS so
				you can enjoy her functions longer. I will be very thankful if you help me, really,
				I have been working on a lot of things, but she is my beautiful baby, take care of her ❤

				Do you want to support this amazing project? Feel free to do so! https://www.patreon.com/kyranet`
		}),
		COMMAND_ECHO_DESCRIPTION: 'Make Skyra send a message to this (or another) channel.',
		COMMAND_ECHO_EXTENDED: builder.display('echo', {
			extendedHelp: `This should be very obvious...`
		}),
		COMMAND_FEEDBACK_DESCRIPTION: `Send a feedback message to the bot's owner.`,
		COMMAND_FEEDBACK_EXTENDED: builder.display('feedback', {
			extendedHelp: `This command sends a message to a feedback channel where the bot's owner can read. You'll be replied
					as soon as an update comes.`
		}),
		COMMAND_STATS_DESCRIPTION: 'Provides some details about the bot and stats.',
		COMMAND_STATS_EXTENDED: builder.display('stats', {
			extendedHelp: `This should be very obvious...`
		}),

		/**
		 * #############
		 * TAGS COMMANDS
		 */

		COMMAND_TAG_DESCRIPTION: `Manage this guilds' tags.`,
		COMMAND_TAG_EXTENDED: builder.display('tag', {
			extendedHelp: `What are tags? Tags are chunk of texts stored under a name, which allows you, for example,
					you can do \`Skyra, tag rule1\` and get a response with what the rule number one of your server is.
					Besides that, tags are also used for memes, who doesn't like memes?`,
			explainedUsage: [
				['action', 'The action to perform: **add** to add new tags, **remove** to delete them, and **edit** to edit them.'],
				['tag', `The tag's name.`],
				['contents', 'Required for the actions **add** and **edit**, specifies the content for the tag.']
			],
			examples: [
				'add rule1 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
				'edit rule1 Just be respectful with the others.',
				'rule1',
				'source rule1',
				'remove rule1',
				'list'
			]
		}),

		/**
		 * ##############
		 * TOOLS COMMANDS
		 */

		COMMAND_AVATAR_DESCRIPTION: `View somebody's avatar in full size.`,
		COMMAND_AVATAR_EXTENDED: builder.display('avatar', {
			extendedHelp: `As this command's name says, it shows somebody's avatar.`,
			explainedUsage: [
				['user', `(Optional) A user mention. Defaults to the author if the input is invalid or not given.`]
			]
		}),
		COMMAND_COLOR_DESCRIPTION: 'Display some awesome colours.',
		COMMAND_COLOR_EXTENDED: builder.display('color', {
			extendedHelp: `The color command displays a set of colours with nearest tones given a difference between 1 and 255..`,
			explainedUsage: [
				['color', 'A color resolvable.']
			],
			possibleFormats: [
				['HEX', '#dfdfdf'],
				['RGB', 'rgb(200, 200, 200)'],
				['HSL', 'hsl(350, 100, 100)'],
				['B10', '14671839']
			],
			examples: ['#dfdfdf >25', 'rgb(200, 130, 75)']
		}),
		COMMAND_CONTENT_DESCRIPTION: 'Get messages\' raw content.',
		COMMAND_CONTENT_EXTENDED: builder.display('content', {}),
		COMMAND_DEFINE_DESCRIPTION: 'Check the definition of a word.',
		COMMAND_DEFINE_EXTENDED: builder.display('define', {
			extendedHelp: `What does "heel" mean?`,
			explainedUsage: [
				['Word', 'The word or phrase you want to get the definition from.']
			],
			examples: ['heel']
		}),
		COMMAND_EMOJI_DESCRIPTION: 'Get info on an emoji.',
		COMMAND_EMOJI_EXTENDED: builder.display('emoji', {}),
		COMMAND_GOOGL_DESCRIPTION: 'Shorten your links with this tool.',
		COMMAND_GOOGL_EXTENDED: builder.display('googl', {
			extendedHelp: `Shorten your urls with Googl!`,
			explainedUsage: [
				['URL', 'The URL to shorten or expand.']
			],
			examples: ['https://github.com/', 'https://goo.gl/un5E']
		}),
		COMMAND_POLL_DESCRIPTION: 'Manage polls.',
		COMMAND_POLL_EXTENDED: builder.display('poll', {
			extendedHelp: `The poll command creates a poll and tracks any vote, whilst also offering filters and unique
					votes (users can't vote twice nor two different options). You can customize the available options for the
					user and it features role and user whitelist. At the end of the poll, Skyra will DM you the results with a
					chart, make sure to have your DMs opened! After the vote concludes (they require time), you can retrieve the
					results for 24 hours before it gets unaccesible.`,
			examples: [
				'create Should I create the #anime channel? --options="yes,no,definitely"',
				'list',
				'vote jfutdsxsb yes',
				'result jfutdsxsb',
				'remove jfutdsxsb'
			],
			reminder: 'Skyra will prompt you for user and role whitelist, you can omit it by including `--no-prompt` in your message or specify them with `--users="id1,id2..." and --roles="id1,id2..."`. If you want something simpler, use the `spoll` command.'
		}),
		COMMAND_PRICE_DESCRIPTION: 'Convert the currency with this tool.',
		COMMAND_PRICE_EXTENDED: builder.display('price', {}),
		COMMAND_QUOTE_DESCRIPTION: 'Quote another person\'s message.',
		COMMAND_QUOTE_EXTENDED: builder.display('quote', {}),
		COMMAND_ROLES_DESCRIPTION: 'List all public roles from a guild, or claim/unclaim them.',
		COMMAND_ROLES_EXTENDED: builder.display('roles', {
			extendedHelp: `Public roles? They are roles that are available for everyone, an administrator must configure
					them with a configuration command.`,
			explainedUsage: [
				['Roles', 'The list of roles to claim and unclaim. Leave this empty to get a list of roles']
			],
			reminder: [
				'When using claim/unclaim, the roles can be individual, or multiple.',
				'To claim multiple roles, you must separate them by a comma.',
				'You can specify which roles by writting their ID, name, or a section of the name.'
			].join('\n'),
			examples: ['', 'Designer, Programmer', 'Designer']
		}),
		COMMAND_SEARCH_DESCRIPTION: 'Search things from the Internet with DuckDuckGo.',
		COMMAND_SEARCH_EXTENDED: builder.display('search', {}),
		COMMAND_SPOLL_DESCRIPTION: 'Simplified reaction-based poll.',
		COMMAND_SPOLL_EXTENDED: builder.display('spoll', {
			extendedHelp: `spoll stands for "simplified poll". You may want to use this command if you don't want to deal the
					complexity of the other command. Simplified Polls do not track the users who vote nor it filters, it merely reacts
					to your message with three emojis and let the users vote.`,
			examples: ['Should I implement the #anime channel?']
		}),
		COMMAND_URBAN_DESCRIPTION: 'Check the definition of a word on UrbanDictionary.',
		COMMAND_URBAN_EXTENDED: builder.display('urban', {
			extendedHelp: `What does "spam" mean?`,
			explainedUsage: [
				['Word', 'The word or phrase you want to get the definition from.'],
				['Page', 'Defaults to 1, the page you wish to read.']
			],
			examples: ['spam']
		}),
		COMMAND_WHOIS_DESCRIPTION: 'Who are you?',
		COMMAND_WHOIS_EXTENDED: builder.display('whois', {}),
		COMMAND_WIKIPEDIA_DESCRIPTION: 'Search something through Wikipedia.',
		COMMAND_WIKIPEDIA_EXTENDED: builder.display('wikipedia', {}),
		COMMAND_YOUTUBE_DESCRIPTION: 'Search something through YouTube.',
		COMMAND_YOUTUBE_EXTENDED: builder.display('youtube', {}),

		/**
		 * ################
		 * WEATHER COMMANDS
		 */

		COMMAND_WEATHER_DESCRIPTION: 'Check the weather status in a location.',
		COMMAND_WEATHER_EXTENDED: builder.display('weather', {
			extendedHelp: `This command uses Google Maps to get the coordinates of the place, this step also allows multilanguage
				support as it is... Google Search. Once this command got the coordinates, it queries DarkSky to retrieve
					information about the weather. Note: temperature is in **Celsius**`,
			explainedUsage: [
				['city', 'The locality, governing, country or continent to check the weather from.']
			],
			examples: ['Antarctica', 'Arizona']
		}),

		/**
		 * #############
		 * WEEB COMMANDS
		 */

		COMMAND_WBLUSH_DESCRIPTION: 'Blush with a weeb picture!',
		COMMAND_WBLUSH_EXTENDED: builder.display('wblush', {
			extendedHelp: `Blush with a random weeb image!`
		}),
		COMMAND_WCRY_DESCRIPTION: 'Cry to somebody with a weeb picture!',
		COMMAND_WCRY_EXTENDED: builder.display('wcry', {
			extendedHelp: `Cry with a random weeb image!`,
			explainedUsage: [
				['user', 'The user to cry to.']
			],
			examples: ['@Skyra']
		}),
		COMMAND_WCUDDLE_DESCRIPTION: 'Cuddle somebody with a weeb picture!',
		COMMAND_WCUDDLE_EXTENDED: builder.display('wcuddle', {
			extendedHelp: `Unlike the original cuddle command, this one displays random weeb images, enjoy!`,
			explainedUsage: [
				['user', 'The user to cuddle with.']
			],
			examples: ['@Skyra']
		}),
		COMMAND_WDANCE_DESCRIPTION: 'Dance with a weeb picture!',
		COMMAND_WDANCE_EXTENDED: builder.display('wdance', {
			extendedHelp: `Dance with a random weeb image!`
		}),
		COMMAND_WHUG_DESCRIPTION: 'Hug somebody with a weeb picture!',
		COMMAND_WHUG_EXTENDED: builder.display('whug', {
			extendedHelp: `Unlike the original hug command, this one displays random weeb images, enjoy!`,
			explainedUsage: [
				['user', 'The user to give the hug.']
			],
			examples: ['@Skyra']
		}),
		COMMAND_WKISS_DESCRIPTION: 'Kiss somebody with a weeb picture!',
		COMMAND_WKISS_EXTENDED: builder.display('wkiss', {
			extendedHelp: `Kiss somebody with a random weeb image!`,
			explainedUsage: [
				['user', 'The user to give the kiss to.']
			],
			examples: ['@Skyra']
		}),
		COMMAND_WLICK_DESCRIPTION: 'Lick somebody with a weeb picture!',
		COMMAND_WLICK_EXTENDED: builder.display('wlick', {
			extendedHelp: `Lick somebody with a random weeb image!`,
			explainedUsage: [
				['user', 'The user to lick.']
			],
			examples: ['@Skyra']
		}),
		COMMAND_WNOM_DESCRIPTION: 'Nom nom with a 🍞!',
		COMMAND_WNOM_EXTENDED: builder.display('wnom', {
			extendedHelp: `Nom nom nom! Wha~... I'm busy eating!`
		}),
		COMMAND_WNEKO_DESCRIPTION: 'Human kittens!',
		COMMAND_WNEKO_EXTENDED: builder.display('wneko', {
			extendedHelp: `Unlike the original kitten command, this one displays random weeb images, the difference is that
					they're weebs... and humans, enjoy!`
		}),
		COMMAND_WPAT_DESCRIPTION: 'Pats somebody\'s head!',
		COMMAND_WPAT_EXTENDED: builder.display('wpat', {
			extendedHelp: `Pat somebody's head with a random weeb image!`,
			explainedUsage: [
				['user', 'The user to pat with.']
			],
			examples: ['@Skyra']
		}),
		COMMAND_WPOUT_DESCRIPTION: 'I feel somebody... mad',
		COMMAND_WPOUT_EXTENDED: builder.display('wpout', {
			extendedHelp: `Show your expression with a random weeb image!`
		}),
		COMMAND_WSLAP_DESCRIPTION: 'Slap somebody with a weeb picture!',
		COMMAND_WSLAP_EXTENDED: builder.display('wslap', {
			extendedHelp: `Unlike the original slap command, this one displays random weeb images, enjoy!`,
			explainedUsage: [
				['user', 'The user to slap.']
			],
			examples: ['@Pete']
		}),
		COMMAND_WSMUG_DESCRIPTION: 'Smug',
		COMMAND_WSMUG_EXTENDED: builder.display('wsmug', {
			extendedHelp: `Just an anime smug face!`
		}),
		COMMAND_WSTARE_DESCRIPTION: '*Stares*',
		COMMAND_WSTARE_EXTENDED: builder.display('wstare', {
			extendedHelp: `*Still stares at you*`,
			explainedUsage: [
				['user', 'The user to stare at.']
			],
			examples: ['@Pete']
		}),
		COMMAND_WTICKLE_DESCRIPTION: 'Give tickles to somebody with a weeb picture!',
		COMMAND_WTICKLE_EXTENDED: builder.display('wtickle', {
			extendedHelp: `Tickle somebody!`,
			explainedUsage: [
				['user', 'The user to tickle.']
			],
			examples: ['@Skyra']
		}),

		/**
		 * #################################
		 * #       COMMAND RESPONSES       #
		 * #################################
		 */

		/**
		 * ##############
		 * ANIME COMMANDS
		 */

		COMMAND_ANIME_TYPES: {
			TV: '📺 TV',
			MOVIE: '🎥 Película',
			OVA: '📼 Animación de Vídeo Original',
			SPECIAL: '🎴 Especial'
		},
		COMMAND_ANIME_QUERY_FAIL: 'Lo siento, pero la aplicación no pudo resolver su solicitud. ¿Estás seguro/a que escribiste el nombre correctamente?',
		COMMAND_ANIME_INVALID_CHOICE: `¡Esa opción no es válida! Selecciona otra opción, por favor.`,
		COMMAND_ANIME_NO_CHOICE: 'Me dejaste esperando... ¡prueba de nuevo cuando te hayas decidido!',
		COMMAND_ANIME_OUTPUT_DESCRIPTION: (entry, synopsis) => [
			`**Título inglés:** ${entry.attributes.titles.en || entry.attributes.titles.en_us || 'Ninguno'}`,
			`**Título japonés:** ${entry.attributes.titles.ja_jp || 'Ninguno'}`,
			synopsis
		],
		COMMAND_ANIME_OUTPUT_STATUS: (entry) => [
			`  ❯  Estado actual: **${entry.attributes.status}**`,
			`    • Empezó: **${entry.attributes.startDate}**\n${entry.attributes.endDate ? `    • Terminó: **${entry.attributes.endDate}**` : ''}`
		],
		COMMAND_ANIME_TITLES: {
			TYPE: 'Tipo',
			SCORE: 'Puntuación',
			STATUS: 'Estado',
			WATCH_IT: 'Míralo Aquí:',
			READ_IT: 'Léelo Aquí:'
		},
		COMMAND_MANGA_OUTPUT_DESCRIPTION: (entry, synopsis) => [
			`**Título inglés:** ${entry.attributes.titles.en || entry.attributes.titles.en_us || 'Ninguno'}`,
			`**Título japonés:** ${entry.attributes.titles.ja_jp || 'Ninguno'}`,
			synopsis
		],
		COMMAND_MANGA_OUTPUT_STATUS: (entry) => [
			`  ❯  Estado actual: **${entry.attributes.status}**`,
			`    • Empezó: **${entry.attributes.startDate}**\n${entry.attributes.endDate ? `    • Terminó: **${entry.attributes.endDate}**` : ''}`
		],
		COMMAND_MANGA_TITLES: {
			MANGA: '📘 Manga',
			NOVEL: '📕 Novela',
			MANHWA: '🇰🇷 Manhwa',
			'ONE-SHOT': '☄ Cameo',
			SPECIAL: '🎴 Especial'
		},

		/**
		 * #####################
		 * ANNOUNCEMENT COMMANDS
		 */

		COMMAND_SUBSCRIBE_NO_ROLE: 'Este servidor no configuró el rol para los anuncios.',
		COMMAND_SUBSCRIBE_SUCCESS: (role) => `Concedido con éxito el rol: **${role}**`,
		COMMAND_UNSUBSCRIBE_SUCCESS: (role) => `Removido con éxito el rol: **${role}***`,
		COMMAND_SUBSCRIBE_NO_CHANNEL: 'Este servidor no tiene un canal de anuncios configurado.',
		COMMAND_ANNOUNCEMENT: (role) => `**Nuevo anuncio para** ${role}:`,
		COMMAND_ANNOUNCEMENT_SUCCESS: 'Se ha publicado un nuevo anuncio con éxito.',
		COMMAND_ANNOUNCEMENT_CANCELLED: 'Se ha cancelado el anuncio con éxito.',
		COMMAND_ANNOUNCEMENT_PROMPT: 'Éste es el contenido que será mandado al canal de anuncios. ¿Quiere enviarlo ahora?',

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		COMMAND_INVITE: () => [
			`Para añadir Skyra a tu servidor: <${this.client.invite}>`,
			'No tengas miedo de quitar algunos permisos, Skyra te hará saber si estás intentando ejecutar un comando sin los permisos requeridos.'
		].join('\n'),
		COMMAND_INFO: [
			`Skyra ${VERSION} is a multi-purpose Discord Bot designed to run the majority of tasks with a great performance and constant 24/7 uptime.`,
			"She is built on top of Klasa, a 'plug-and-play' framework built on top of the Discord.js library.",
			'',
			'Skyra features:',
			'• Advanced Moderation with temporary actions included',
			'• Announcement management',
			'• Fully configurable',
			'• Message logs, member logs, and mod logs',
			'• Multilingual',
			'• Profiles and levels, with leaderboards and social management',
			'• Role management',
			'• Weeb commands (+10)!',
			'And more!'
		].join('\n'),
		COMMAND_HELP_TITLE: (name, description) => `📃 | ***Mensaje de Ayuda*** | __**${name}**__\n${description}\n`,
		COMMAND_HELP_USAGE: (usage) => `📝 | ***Uso del Comando***\n\`${usage}\`\n`,
		COMMAND_HELP_EXTENDED: (extendedHelp) => `🔍 | ***Descripción Extendida***\n${extendedHelp}`,

		/**
		 * ##############
		 * FUN COMMANDS
		 */

		COMMAND_8BALL_OUTPUT: (author, question, response) => `🎱 Pregunta por ${author}: *${question}*\n${response}`,
		COMMAND_8BALL_NOT_QUESTION: 'Eso no parece ser una pregunta...',
		COMMAND_8BALL_QUESTIONS: {
			QUESTION: '?',
			WHEN: /^¿?cu[áa]ndo/i,
			WHAT: /^¿?qu[ée]/i,
			HOW_MUCH: /^¿?cu[áa]nto/i,
			HOW_MANY: /^¿?cu[áa]nto/i,
			WHY: /^¿?por qu[ée]/i,
			WHO: /^¿?qui[ée]n/i
		},
		COMMAND_8BALL_WHEN: createPick([
			'Pronto™',
			'Quizá mañana.',
			'Quizá el año que viene...',
			'Ahora mismo.',
			'En unos cuantos meses.'
		]),
		COMMAND_8BALL_WHAT: createPick([
			'Un avión.',
			'¿Qué? Pregunta de nuevo.',
			'¡Un regalo!',
			'Nada.',
			'Un anillo.',
			'No lo sé, quizá sea algo.'
		]),
		COMMAND_8BALL_HOWMUCH: createPick([
			'Un montón.',
			'Un poco.',
			'Un poquillo.',
			'Pregúnteme mañana.',
			'No lo sé, pregúntaselo a un físico.',
			'Absolutamente nada.',
			`Entre ${random(10)} y ${random(1000)}L.`,
			`${random(10)}e${random(1000)}L.`,
			'2 o 3 litros, no recuerdo.',
			'¡Infinito!',
			'1010 litros.'
		]),
		COMMAND_8BALL_HOWMANY: createPick([
			'Un montón.',
			'Un poco.',
			'Un poquillo.',
			'Pregúnteme mañana.',
			'No lo sé, pregúntaselo a un físico.',
			'Absolutamente nada.',
			`Entre ${random(10)} y ${random(1000)}.`,
			`${random(10)}e${random(1000)}.`,
			'2 o 3, no recuerdo.',
			'¡Infinito!',
			'1010.'
		]),
		COMMAND_8BALL_WHY: createPick([
			'Probablemente genética.',
			'Porque alguien decidió que fuera así.',
			'¡Por la gloria de Satán, por supuesto!',
			'No lo sé, quizás fuese el destino.',
			'Porque lo dije yo.',
			'No tengo ni idea.',
			'Uhm... pregúntale al dueño del servidor.',
			'Pregunta de nuevo.',
			'Para llegar al otro lado.',
			'Lo dice en la Biblia.'
		]),
		COMMAND_8BALL_WHO: createPick([
			'Un humano.',
			'Un robot.',
			'Un avión.',
			'Un pájaro.',
			'Una composición de carbono.',
			'Un puñado de zeros y unos.',
			'No tengo ni idea, ¿es material?',
			'Eso no es lógico.'
		]),
		COMMAND_8BALL_ELSE: createPick([
			'Probablemente.',
			'No.',
			'¡SÍ!',
			'Quizás.'
		]),

		COMMAND_CATFACT_TITLE: 'Hecho Gatuno',
		COMMAND_CHOICE_OUTPUT: (user, word) => `🕺 *Pito, pito, gorgorito, ¿dónde vas tan bonito?...* ${user}, Elijo:${codeBlock('', word)}`,
		COMMAND_CHOICE_MISSING: 'Por favor, escribe al menos dos opciones separadas con coma.',
		COMMAND_CHOICE_DUPLICATES: (words) => `¿Por qué aceptaría palabras duplicadas? '${words}'.`,
		COMMAND_DICE_OUTPUT: (sides, rolls, result) => `Has lanzado el dado de **${sides}** lados **${rolls}** veces, obtienes: **${result}**`,
		COMMAND_DICE_ROLLS_ERROR: 'La cantidad de lanzamientos debe ser un número entre 1 y 1024.',
		COMMAND_DICE_SIDES_ERROR: 'La cantidad de lados debe ser un número entre 4 y 1024.',
		// https://bulbapedia.bulbagarden.net/wiki/Escape_Rope
		COMMAND_ESCAPEROPE_OUTPUT: (user) => `**${user}** usó **Cuerda Huída**`,
		COMMAND_LOVE_LESS45: 'Prueba de nuevo la próxima vez...',
		COMMAND_LOVE_LESS75: '¡Bastante bien!',
		COMMAND_LOVE_LESS100: '¡Haríais una gran pareja!',
		COMMAND_LOVE_100: '¡Emparejamiento perfecto!',
		COMMAND_LOVE_ITSELF: 'Eres una criatura muy especial y deberías amarte a tí mismo más que a los demás <3',
		COMMAND_LOVE_RESULT: 'Resultado',
		COMMAND_NORRIS_OUTPUT: 'Chuck Norris',
		COMMAND_RATE_OUTPUT: (user, rate, emoji) => `Uhm... le daría a **${user}** un **${rate}**/100 ${emoji}`,
		COMMAND_RATE_MYSELF: ['me quiero a mí misma mucho 😊', 'yo'],
		COMMAND_XKCD_COMICS: (amount) => `Hay ${amount} comics.`,
		COMMAND_XKCD_NOTFOUND: 'He buscado en todos los rincones, pero no he tenido suerte encontrando este comic, ¡prueba más tarde o prueba con otro!',

		/**
		 * ##############
		 * GAMES COMMANDS
		 */

		COMMAND_GAMES_SKYRA: 'I am sorry, I know you want to play with me, but if I do, I will not be able to help other people! 💔',
		COMMAND_GAMES_BOT: 'I am sorry, but I do not think they would like to stop doing what they are doing and play with humans.',
		COMMAND_GAMES_SELF: 'You must be so sad to play against yourself. Try again with another user.',
		COMMAND_GAMES_PROGRESS: 'I am sorry, but there is a game in progress in this channel, try again when it finishes.',
		COMMAND_GAMES_TOO_MANY_OR_FEW: (min, max) => `I am sorry but the amount of players is less than ${min} or greater than ${max}.`,
		COMMAND_GAMES_PROMPT_TIMEOUT: 'I am sorry, but the challengee did not reply on time.',
		COMMAND_GAMES_PROMPT_DENY: 'I am sorry, but the challengee refused to play.',
		COMMAND_GAMES_TIMEOUT: '**The match concluded in a draw due to lack of a response (60 seconds)**',
		COMMAND_C4_PROMPT: (challenger, challengee) => `Dear ${challengee}, you have been challenged by ${challenger} in a Connect-Four match. Reply with **yes** to accept!`,
		COMMAND_C4_START: (player, table) => `Let's play! Turn for: **${player}**.\n${table}`,
		COMMAND_C4_GAME_COLUMN_FULL: 'This column is full. Please try another. ',
		COMMAND_C4_GAME_WIN: (user, turn, table) => `${user} (${turn === 0 ? 'blue' : 'red'}) won!\n${table}`,
		COMMAND_C4_GAME_DRAW: (table) => `This match concluded in a **draw**!\n${table}`,
		COMMAND_C4_GAME_NEXT: (player, turn, table) => `Turn for: ${player} (${turn === 0 ? 'blue' : 'red'}).\n${table}`,
		COMMAND_TICTACTOE_PROMPT: (challenger, challengee) => `Dear ${challengee}, you have been challenged by ${challenger} in a Tic-Tac-Toe match. Reply with **yes** to accept!`,
		COMMAND_TICTACTOE_TURN: (icon, player, board) => `(${icon}) Turn for ${player}!\n${board}`,
		COMMAND_TICTACTOE_WINNER: (winner, board) => `Winner is... ${winner}!\n${board}`,
		COMMAND_TICTACTOE_DRAW: (board) => `This match concluded in a **draw**!\n${board}`,

		/**
		 * #################
		 * GIVEAWAY COMMANDS
		 */

		GIVEAWAY_TIME: 'El sorteo debe durar al menos 10 seconds.',
		GIVEAWAY_ENDS_AT: 'Termina en:',
		GIVEAWAY_DURATION: (time) => `This giveaway ends in **${duration(time)}**! React to this message with 🎉 to join.`,
		GIVEAWAY_TITLE: '🎉 **GIVEAWAY** 🎉',
		GIVEAWAY_LASTCHANCE: (time) => `**LAST CHANCE**! Remaining time: **${duration(time)}**. React to this message with 🎉 to join.`,
		GIVEAWAY_LASTCHANCE_TITLE: '🎉 **LAST CHANCE GIVEAWAY** 🎉',
		GIVEAWAY_ENDED: (winners) => winners.length === 1 ? `Ganador/a: ${winners[0]}` : `Ganadores: ${winners.join(', ')}`,
		GIVEWAWY_ENDED_NO_WINNER: 'No winner...',
		GIVEAWAY_ENDED_AT: 'Ended at:',
		GIVEAWAY_ENDED_TITLE: '🎉 **GIVEAWAY ENDED** 🎉',
		GIVEAWAY_ENDED_MESSAGE: (mention, title) => `Congratulations ${mention}! You won the giveaway **${title}**`,

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		COMMAND_NICK_SET: (nickname) => `Changed the nickname to **${nickname}**.`,
		COMMAND_NICK_CLEARED: 'Nickname cleared.',
		COMMAND_TRIGGERS_NOTYPE: 'You need to insert a trigger type (**alias**|**reaction**)',
		COMMAND_TRIGGERS_NOOUTPUT: 'You need to insert the trigger output.',
		COMMAND_TRIGGERS_INVALIDREACTION: 'This reaction does not seem valid for me, either it is not valid unicode or I do not have access to it.',
		COMMAND_TRIGGERS_INVALIDALIAS: 'There is no command like this.',
		COMMAND_TRIGGERS_REMOVE_NOTTAKEN: 'There is no trigger with this input.',
		COMMAND_TRIGGERS_REMOVE: 'Successfully removed this trigger.',
		COMMAND_TRIGGERS_ADD_TAKEN: 'There is already a trigger with this input.',
		COMMAND_TRIGGERS_ADD: 'Successfully added the trigger.',
		COMMAND_TRIGGERS_LIST_EMPTY: 'The trigger list for this guild is empty.',
		COMMAND_SERVERINFO_TITLES: {
			CHANNELS: 'Channels',
			MEMBERS: 'Members',
			OTHER: 'Other'
		},
		COMMAND_SERVERINFO_ROLES: (roles) => `**Roles**\n\n${roles}`,
		COMMAND_SERVERINFO_NOROLES: 'Roles? Where? There is no other than the `@everyone` role!',
		COMMAND_SERVERINFO_CHANNELS: (text, voice, categories, afkChannel, afkTime) => [
			`• **${text}** Text, **${voice}** Voice, **${categories}** categories.`,
			`• AFK: ${afkChannel ? `**<#${afkChannel}>** after **${afkTime / 60}**min` : '**None**.'}`
		].join('\n'),
		COMMAND_SERVERINFO_MEMBERS: (count, owner) => [
			`• **${count}** members`,
			`• Owner: **${owner.tag}**`,
			`  (ID: **${owner.id}**)`
		].join('\n'),
		COMMAND_SERVERINFO_OTHER: (size, region, createdAt, verificationLevel) => [
			`• Roles: **${size}**`,
			`• Region: **${region}**`,
			`• Created at: **${timestamp.displayUTC(createdAt)}** (UTC - YYYY/MM/DD)`,
			`• Verification Level: **${this.HUMAN_LEVELS[verificationLevel]}**`
		].join('\n'),
		COMMAND_ROLEINFO_TITLES: { PERMISSIONS: 'Permissions' },
		COMMAND_ROLEINFO: (role) => [
			`ID: **${role.id}**`,
			`Name: **${role.name}**`,
			`Color: **${role.hexColor}**`,
			`Hoisted: **${role.hoist ? 'Yes' : 'No'}**`,
			`Position: **${role.rawPosition}**`,
			`Mentionable: **${role.mentionable ? 'Yes' : 'No'}**`
		].join('\n'),
		COMMAND_ROLEINFO_ALL: 'All Permissions granted.',
		COMMAND_ROLEINFO_PERMISSIONS: (permissions) => permissions.length > 0 ? permissions.map((key) => `+ **${PERMS[key]}**`) : 'Permissions not granted.',
		COMMAND_FILTER_UNDEFINED_WORD: 'You must write what you want me to filter.',
		COMMAND_FILTER_FILTERED: (filtered) => `This word is ${filtered ? 'already' : 'not'} filtered.`,
		COMMAND_FILTER_ADDED: (word) => `${GREENTICK} Success! Added the word ${word} to the filter.`,
		COMMAND_FILTER_REMOVED: (word) => `${GREENTICK} Success! Removed the word ${word} from the filter.`,
		COMMAND_FILTER_RESET: `${GREENTICK} Success! The filter has been reset.`,
		COMMAND_FILTER_SHOW_EMPTY: 'The list of filtered words is empty!',
		COMMAND_FILTER_SHOW: (words) => `There is the list of all filtered words: ${words}`,
		COMMAND_SETFILTERMODE_EQUALS: 'The word filter mode did not change, it was already set up with that mode.',
		COMMAND_SETFILTERMODE_ALERT: (enabled) => `The Alert flag for the caps filter has been ${enabled ? 'enabled' : 'disabled'}.`,
		COMMAND_SETFILTERMODE_LOG: (enabled) => `The Log flag for the caps filter has been ${enabled ? 'enabled' : 'disabled'}.`,
		COMMAND_SETFILTERMODE_DELETE: (enabled) => `The Delete flag for the caps filter has been ${enabled ? 'enabled' : 'disabled'}.`,
		COMMAND_SETFILTERMODE_SHOW: (falert, flog, fdelete) => [
			`= Word Filter Flags =`, '',
			`Alert  :: ${falert ? 'Enabled' : 'Disabled'}`,
			`Log    :: ${flog ? 'Enabled' : 'Disabled'}`,
			`Delete :: ${fdelete ? 'Enabled' : 'Disabled'}`
		].join('\n'),
		COMMAND_SETCAPSFILTER_SHOW: (falert, flog, fdelete) => [
			`= Caps Filter Flags =`, '',
			`Alert  :: ${falert ? 'Enabled' : 'Disabled'}`,
			`Log    :: ${flog ? 'Enabled' : 'Disabled'}`,
			`Delete :: ${fdelete ? 'Enabled' : 'Disabled'}`
		].join('\n'),
		COMMAND_SETCAPSFILTER_EQUALS: 'The caps filter flags did not change, it was already set up with that mode.',
		COMMAND_SETCAPSFILTER_ALERT: (enabled) => `The Alert flag for the caps filter has been ${enabled ? 'enabled' : 'disabled'}.`,
		COMMAND_SETCAPSFILTER_LOG: (enabled) => `The Log flag for the caps filter has been ${enabled ? 'enabled' : 'disabled'}.`,
		COMMAND_SETCAPSFILTER_DELETE: (enabled) => `The Delete flag for the caps filter has been ${enabled ? 'enabled' : 'disabled'}.`,
		COMMAND_MANAGEATTACHMENTS_REQUIRED_VALUE: 'You must input a value for this type.',
		COMMAND_MANAGEATTACHMENTS_INVALID_ACTION: 'The type must be `ban`, `kick`, `mute`, or `softban`.',
		COMMAND_MANAGEATTACHMENTS_MAXIMUM: (maximum) => `${GREENTICK} Successfully set the maximum amount of attachments to ${maximum}.`,
		COMMAND_MANAGEATTACHMENTS_EXPIRE: (time) => `${GREENTICK} Successfully set the lifetime for the manager's entries to ${duration(time)}.`,
		COMMAND_MANAGEATTACHMENTS_DURATION: (time) => `${GREENTICK} Successfully set the duration for moderation logs to ${duration(time)}.`,
		COMMAND_MANAGEATTACHMENTS_ACTION: `${GREENTICK} Successfully changed the moderative action for the manager.`,
		COMMAND_MANAGEATTACHMENTS_LOGS: `${GREENTICK} Successfully changed the preferences for message logging.`,
		COMMAND_MANAGEATTACHMENTS_ENABLED: (enabled) => `${GREENTICK} Successfully ${enabled ? 'enabled' : 'disabled'} the attachment management.`,

		/**
		 * #################################
		 * MANAGEMENT/CONFIGURATION COMMANDS
		 */

		COMMAND_MANAGECOMMANDCHANNEL_TEXTCHANNEL: 'You must input a valid text channel, people cannot use commands in a voice or a category channel!',
		COMMAND_MANAGECOMMANDCHANNEL_REQUIRED_COMMAND: 'You must specify what command do you want to add or remove from the channel\'s filter.',
		COMMAND_MANAGECOMMANDCHANNEL_SHOW: (channel, commands) => `List of disabled commands in ${channel}: ${commands}`,
		COMMAND_MANAGECOMMANDCHANNEL_SHOW_EMPTY: 'The list of disabled commands for the specified channel is empty!',
		COMMAND_MANAGECOMMANDCHANNEL_ADD_ALREADYSET: 'The command you are trying to disable is already disabled!',
		COMMAND_MANAGECOMMANDCHANNEL_ADD: (channel, command) => `Successfully disabled the command ${command} for the channel ${channel}!`,
		COMMAND_MANAGECOMMANDCHANNEL_REMOVE_NOTSET: (channel) => `The command you are trying to enable was not disabled for ${channel}.`,
		COMMAND_MANAGECOMMANDCHANNEL_REMOVE: (channel, command) => `Successfully enabled the command ${command} for the channel ${channel}!`,
		COMMAND_MANAGECOMMANDCHANNEL_RESET_EMPTY: 'This channel had no disabled command, so I decided to do nothing.',
		COMMAND_MANAGECOMMANDCHANNEL_RESET: (channel) => `Successfully enabled all disabled commands in ${channel}, enjoy!`,
		COMMAND_MANAGEROLEREACTION_REQUIRED_REACTION: 'You must input a valid reaction that can be used by me.',
		COMMAND_MANAGEROLEREACTION_REQUIRED_ROLE: 'You must input the name of the role you want me to add.',
		COMMAND_MANAGEROLEREACTION_LIST_EMPTY: 'This guild has no role reaction set up.',
		COMMAND_MANAGEROLEREACTION_EXISTS: 'There is already a role reaction set up with the specified role or emoji.',
		COMMAND_MANAGEROLEREACTION_ADD: 'Successfully added the role reaction.',
		COMMAND_MANAGEROLEREACTION_REMOVE_NOTEXISTS: 'I do not find an entry with this reaction. Are you sure you have typed it correctly?',
		COMMAND_MANAGEROLEREACTION_REMOVE: 'Successfully removed the role reaction.',
		COMMAND_MANAGEROLEREACTION_RESET: 'Successfully removed all role reactions.',
		COMMAND_SETMESSAGEROLE_CHANNELNOTSET: 'In order to configure the message role, you must configure the channel first.',
		COMMAND_SETMESSAGEROLE_WRONGCHANNEL: (channel) => `In order to reduce confusion, I would suggest you to move to ${channel}`,
		COMMAND_SETMESSAGEROLE_SET: 'Successfully set the message role.',
		COMMAND_SETSTARBOARDEMOJI_SET: (emoji) => `Successfully set a new emoji for the next star messages: ${emoji}`,
		COMMAND_SETROLECHANNEL_SET: (channel) => `Successfully set the role channel to ${channel}.`,
		CONFIGURATION_TEXTCHANNEL_REQUIRED: 'The selected channel is not a valid text channel, try again with another.',
		CONFIGURATION_EQUALS: 'Successfully configured: no changes were made.',
		COMMAND_SETIGNORECHANNELS_SET: (channel) => `Ignoring all command input from ${channel} now.`,
		COMMAND_SETIGNORECHANNELS_REMOVED: (channel) => `Listening all command input from ${channel} now.`,
		COMMAND_SETMEMBERLOGS_SET: (channel) => `Successfully set the member logs channel to ${channel}.`,
		COMMAND_SETMESSAGELOGS_SET: (channel) => `Successfully set the message logs channel to ${channel}.`,
		COMMAND_SETMODLOGS_SET: (channel) => `Successfully set the mod logs channel to ${channel}.`,
		COMMAND_SETPREFIX_SET: (prefix) => `Successfully set the prefix to ${prefix}. Use ${prefix}setPrefix <prefix> to change it again.`,

		/**
		 * ###########################
		 * MANAGEMENT/MEMBERS COMMANDS
		 */

		COMMAND_STICKYROLES_REQUIRED_USER: 'A user target is required for this command to work.',
		COMMAND_STICKYROLES_REQUIRED_ROLE: 'A role name is required when adding or removing a role.',
		COMMAND_STICKYROLES_NOTEXISTS: (user) => `The user ${user} does not have any sticky roles or does not have the specified one.`,
		COMMAND_STICKYROLES_RESET: (user) => `Successfully removed all sticky roles from ${user}.`,
		COMMAND_STICKYROLES_REMOVE: (user) => `Successfully removed the specified role from ${user}.`,
		COMMAND_STICKYROLES_ADD_EXISTS: (user) => `The user ${user} already had the specified role as sticky.`,
		COMMAND_STICKYROLES_ADD: (user) => `Successfully added the specified role as sticky to ${user}.`,
		COMMAND_STICKYROLES_SHOW_EMPTY: `There are no sticky roles to show.`,
		COMMAND_STICKYROLES_SHOW_SINGLE: (user, roles) => `Sticky Role(s) for **${user}**: \`${roles.join('`, `')}\`.`,

		/**
		 * #############
		 * MISC COMMANDS
		 */

		COMMAND_UPVOTE_MESSAGE: 'Here is the link: **<https://botsfordiscord.com/bot/266624760782258186>**! Some perks for upvoters are coming very soon! Remember, you can vote every 24 hours.',
		COMMAND_VAPORWAVE_OUTPUT: (str: string) => `Here is your converted message:\n${str}`,

		/**
		 * ##############################
		 * MODERATION/MANAGEMENT COMMANDS
		 */

		COMMAND_HISTORY_FOOTER: (warnings, mutes, kicks, bans) => `This user has ${
			warnings} ${warnings === 1 ? 'warning' : 'warnings'}, ${
			mutes} ${mutes === 1 ? 'mute' : 'mutes'}, ${
			kicks} ${kicks === 1 ? 'kick' : 'kicks'}, ${
			bans} ${bans === 1 ? 'ban' : 'bans'}.`,
		COMMAND_WARNINGS_EMPTY: 'Nobody has behaved badly yet, who will be the first user to be listed here?',
		COMMAND_WARNINGS_AMOUNT: (amount) => `There are ${amount} ${amount === 1 ? 'warning' : 'warnings'}.`,

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		COMMAND_PERMISSIONS: (username, id) => `Permissions for ${username} (${id})`,
		COMMAND_PERMISSIONS_ALL: 'All Permissions',
		COMMAND_RAID_DISABLED: 'The Anti-RAID system is not enabled in this server.',
		COMMAND_RAID_MISSING_KICK: `As I do not have the **${PERMS.KICK_MEMBERS}** permission, I will keep the Anti-RAID unactivated.`,
		COMMAND_RAID_LIST: 'List of users in the RAID queue',
		COMMAND_RAID_CLEAR: 'Successfully cleared the RAID list.',
		COMMAND_RAID_COOL: 'Successfully deactivated the RAID.',
		COMMAND_FLOW: (amount) => `${amount} messages have been sent within the last minute.`,
		COMMAND_TIME_TIMED: 'The selected moderation case has already been timed.',
		COMMAND_TIME_UNDEFINED_TIME: 'You must specify a time.',
		COMMAND_TIME_UNSUPPORTED_TIPE: 'The type of action for the selected case cannot be reverse, therefore this action is unsupported.',
		COMMAND_TIME_NOT_SCHEDULED: 'This task is not scheduled.',
		COMMAND_TIME_ABORTED: (title) => `Successfully aborted the schedule for ${title}`,
		COMMAND_TIME_SCHEDULED: (title, user, time) => `${GREENTICK} Successfully scheduled a moderation action type **${title}** for the user ${user.tag} (${user.id}) with a duration of ${duration(time)}`,

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		COMMAND_BAN_NOT_BANNABLE: 'The target is not bannable for me.',
		COMMAND_KICK_NOT_KICKABLE: 'The target is not kickable for me.',
		COMMAND_LOCKDOWN_LOCK: (channel) => `The channel ${channel} is now locked.`,
		COMMAND_LOCKDOWN_LOCKED: (channel) => `The channel ${channel} was already locked.`,
		COMMAND_LOCKDOWN_LOCKING: (channel) => `Locking the channel ${channel}...`,
		COMMAND_LOCKDOWN_UNLOCKED: (channel) => `The channel ${channel} was not locked.`,
		COMMAND_LOCKDOWN_OPEN: (channel) => `The lockdown for the channel ${channel} has been released.`,
		COMMAND_MUTE_LOWLEVEL: 'I am sorry, there is no Mute role configured. Please ask an Administrator or the Guild Owner to set it up.',
		COMMAND_MUTE_CONFIGURE_CANCELLED: 'Prompt aborted, the Mute role creation has been cancelled.',
		COMMAND_MUTE_CONFIGURE: 'Do you want me to create and configure the Mute role now?',
		COMMAND_MUTE_CONFIGURE_TOOMANY_ROLES: 'There are too many roles (250). Please delete a role before proceeding.',
		COMMAND_MUTE_MUTED: 'The target user is already muted.',
		COMMAND_MUTE_USER_NOT_MUTED: 'This user is not muted.',
		COMMAND_MUTE_UNCONFIGURED: 'This guild does not have a **Muted** role. Aborting command execution.',
		COMMAND_MUTECREATE_MISSING_PERMISSION: `I need the **${PERMS.MANAGE_ROLES}** permission to create the role and **${PERMS.MANAGE_CHANNELS}** to edit the channels permissions.`,
		COMMAND_PRUNE: (amount, total) => amount
			? `Successfully deleted ${amount} messages from ${total}.`
			: 'No message has been deleted, either no message match the filter or they are over 14 days old.',
		COMMAND_REASON_MISSING_CASE: 'You need to provide a case or a case range.',
		COMMAND_REASON_NOT_EXISTS: (range = false) => `The selected modlog${range ? 's' : ''} don't seem to exist.`,
		COMMAND_REASON_UPDATED: (entries, newReason) => [
			`${GREENTICK} Updated ${entries.length} case${entries.size === 1 ? '' : 's'}`,
			` └─ Set the${entries.size === 1 ? '' : 'ir'} reason to ${newReason}`
		].join('\n'),
		COMMAND_UNBAN_MISSING_PERMISSION: `I will need the **${PERMS.BAN_MEMBERS}** permission to be able to unban.`,
		COMMAND_UNMUTE_MISSING_PERMISSION: `I will need the **${PERMS.MANAGE_ROLES}** permission to be able to unmute.`,
		COMMAND_VMUTE_MISSING_PERMISSION: `I will need the **${PERMS.MUTE_MEMBERS}** permission to be able to voice unmute.`,
		COMMAND_VMUTE_USER_NOT_MUTED: 'This user is not voice muted.',
		COMMAND_WARN_DM: (moderator, guild, reason) => `You have been warned by ${moderator} in ${guild} for the reason: ${reason}`,
		COMMAND_WARN_MESSAGE: (user, log) => `|\`🔨\`| [Case::${log}] **WARNED**: ${user.tag} (${user.id})`,
		COMMAND_MODERATION_OUTPUT: (cases, range, users, reason) => `${GREENTICK} Created ${cases.length === 1 ? 'case' : 'cases'} ${range} | ${users.join(', ')}.${reason ? `\nWith the reason of: ${reason}` : ''}`,
		COMMAND_MODERATION_FAILED: (users) => `${REDCROSS} Failed to moderate ${users.length === 1 ? 'user' : 'users'}:\n${users.join('\n')}`,

		/**
		 * ###############
		 * SOCIAL COMMANDS
		 */

		COMMAND_AUTOROLE_POINTS_REQUIRED: 'You must input a valid amount of points.',
		COMMAND_AUTOROLE_UPDATE_UNCONFIGURED: 'This role is not configured as an autorole. Use the add type instead.',
		COMMAND_AUTOROLE_UPDATE: (role, points, before) => `Updated autorole: ${role.name} (${role.id}). Points required: ${points} (before: ${before})`,
		COMMAND_AUTOROLE_REMOVE: (role, before) => `Removed the autorole: ${role.name} (${role.id}), which required ${before} points.`,
		COMMAND_AUTOROLE_ADD: (role, points) => `Added new autorole: ${role.name} (${role.id}). Points required: ${points}`,
		COMMAND_AUTOROLE_LIST_EMPTY: 'There is no role configured as an autorole in this server.',
		COMMAND_AUTOROLE_UNKNOWN_ROLE: (role) => `Unknown role: ${role}`,
		COMMAND_BALANCE: (user, amount) => `The user ${user} has a total of ${amount}${SHINY}`,
		COMMAND_BALANCE_SELF: (amount) => `You have a total of ${amount}${SHINY}`,
		COMMAND_BALANCE_BOTS: `I think they have 5 gears as much, bots don't have ${SHINY}`,
		COMMAND_SOCIAL_MEMBER_NOTEXISTS: `${REDCROSS} The member is not in this server, and is not in my database either.`,
		COMMAND_SOCIAL_ADD: (user, amount, added) => `${GREENTICK} Successfully added ${added} point${added === 1 ? '' : 's'} to ${user}. Current amount: ${amount}.`,
		COMMAND_SOCIAL_REMOVE: (user, amount, removed) => `${GREENTICK} Successfully removed ${removed} point${removed === 1 ? '' : 's'} to ${user}. Current amount: ${amount}.`,
		COMMAND_SOCIAL_UNCHANGED: (user) => `${REDCROSS} The user ${user} already had the given amount of points, no update was needed.`,
		COMMAND_SOCIAL_RESET: (user) => `${GREENTICK} The user ${user} got his points removed.`,
		COMMAND_BANNER_MISSING: 'You must specify a banner id to buy.',
		COMMAND_BANNER_NOTEXISTS: (prefix) => `This banner id does not exist. Please check \`${prefix}banner list\` for a list of banners you can buy.`,
		COMMAND_BANNER_USERLIST_EMPTY: (prefix) => `You did not buy a banner yet. Check \`${prefix}banner list\` for a list of banners you can buy.`,
		COMMAND_BANNER_RESET_DEFAULT: 'You are already using the default banner.',
		COMMAND_BANNER_RESET: 'Your banner has been reset to the default.',
		COMMAND_BANNER_SET_NOT_BOUGHT: 'You did not buy this banner yet.',
		COMMAND_BANNER_SET: (banner) => `${GREENTICK} **Success**. You have set your banner to: __${banner}__`,
		COMMAND_BANNER_BOUGHT: (prefix, banner) => `You already have this banner, you may want to use \`${prefix}banner set ${banner}\` to make it visible in your profile.`,
		COMMAND_BANNER_MONEY: (money, cost) => `You do not have enough money to buy this banner. You have ${money}${SHINY}, the banner costs ${cost}${SHINY}`,
		COMMAND_BANNER_PAYMENT_CANCELLED: `${REDCROSS} The payment has been cancelled.`,
		COMMAND_BANNER_BUY: (banner) => `${GREENTICK} **Success**. You have bought the banner: __${banner}__`,
		COMMAND_BANNER_PROMPT: 'Reply to this message choosing an option:\n`all` to check a list of all available banners.\n`user` to check a list of all bought banners.',
		COMMAND_DAILY_TIME: (time) => `El siguiente pago está disponible en: ${duration(time)}`,
		COMMAND_DAILY_TIME_SUCCESS: (amount) => `¡Yuhu! ¡Has obtenido ${amount}${SHINY}! Siguiente pago en: 12 horas.`,
		COMMAND_DAILY_GRACE: (remaining) => [
			`¿Te gustaría recibir el pago temprano? El tiempo restante será añadido al periodo normal de espera, de 12 horas.`,
			`Tiempo restante: ${duration(remaining)}`
		].join('\n'),
		COMMAND_DAILY_GRACE_ACCEPTED: (amount, remaining) => `¡Dinero dinero! ¡Has recibido ${amount}${SHINY}! Siguiente pago en: ${duration(remaining)}`,
		COMMAND_DAILY_GRACE_DENIED: '¡De acuerdo! ¡Vuelve pronto!',
		COMMAND_LEVEL: {
			LEVEL: 'Nivel',
			EXPERIENCE: 'Experiencia',
			NEXT_IN: 'Siguiente nivel en'
		},
		COMMAND_DIVORCE_NOTTAKEN: 'Who would you divorce? You are not even taken!',
		COMMAND_DIVORCE_PROMPT: 'Ooh... that sounds quite bad 💔... are you 100% sure about this?',
		COMMAND_DIVORCE_CANCEL: 'Oh lord. I am very glad you will continue with your partner!',
		COMMAND_DIVORCE_DM: (user) => `Pardon... but... do you remember ${user}? He decided to break up with you 💔!`,
		COMMAND_DIVORCE_SUCCESS: (user) => `Successful divorce 💔... You are no longer married to ${user}!`,
		COMMAND_MARRY_WITH: (user) => `Dear, how could you forget it... You are currently married to ${user}!`,
		COMMAND_MARRY_NOTTAKEN: 'Uh... I am sorry, but I am not aware of you being married... have you tried proposing to somebody?',
		COMMAND_MARRY_SKYRA: 'I am sorry, I know you love me, but I am already taken by a brave man I love 💞!',
		COMMAND_MARRY_SNEYRA: 'In your dreams. She is my sister, I am not letting somebody harm her!',
		COMMAND_MARRY_BOTS: 'Oh no! You should not be marrying bots! They still do not understand what true love is, and they are not warm!',
		COMMAND_MARRY_SELF: 'No! This is not how this works! You cannot marry yourself, who would you spend your life with? 💔',
		COMMAND_MARRY_AUTHOR_TAKEN: 'I am sorry, but you are already married...',
		COMMAND_MARRY_TAKEN: 'I am very sorry, but this user is taken!',
		COMMAND_MARRY_PETITION: (author, user) => `Fresh pair of eyes! ${author} is proposing to ${user}! 💞 Reply with **yes** to accept!`,
		COMMAND_MARRY_NOREPLY: 'The user did not reply on time... Maybe it was a hard decision?',
		COMMAND_MARRY_DENIED: 'O-oh... The user rejected your proposal! 💔',
		COMMAND_MARRY_ACCEPTED: (author, user) => `Congratulations dear ${author}! You're now officially married with ${user}! ❤`,
		COMMAND_MYLEVEL: (points, next, user) => `${user ? `The user ${user} has` : 'You have'} a total of ${points} points.${next}`,
		COMMAND_MYLEVEL_NEXT: (remaining, next) => `Points for next rank: **${remaining}** (at ${next} points).`,
		COMMAND_PAY_MISSING_MONEY: (needed, has) => `I am sorry, but you need ${needed}${SHINY} and you have ${has}${SHINY}`,
		COMMAND_PAY_PROMPT: (user, amount) => `You are about to pay ${user} ${amount}${SHINY}, are you sure you want to proceed?`,
		COMMAND_PAY_PROMPT_ACCEPT: (user, amount) => `Payment accepted, ${amount}${SHINY} has been sent to ${user}'s profile.`,
		COMMAND_PAY_PROMPT_DENY: 'Payment denied.',
		COMMAND_PAY_SELF: 'If I taxed this, you would lose money, therefore, do not try to pay yourself.',
		COMMAND_SOCIAL_PAY_BOT: 'Oh, sorry, but money is meaningless for bots, I am pretty sure a human would take advantage of it better.',
		COMMAND_PROFILE: {
			GLOBAL_RANK: 'Global Rank',
			CREDITS: 'Credits',
			REPUTATION: 'Reputation',
			EXPERIENCE: 'Experience',
			LEVEL: 'Level'
		},
		COMMAND_REMINDME_INPUT: 'You must tell me what you want me to remind you and when.',
		COMMAND_REMINDME_INPUT_PROMPT: 'How long should your new reminder last?',
		COMMAND_REMINDME_TIME: 'Your reminder must be at least one minute long.',
		COMMAND_REMINDME_SHORT_TIME: 'You did not give me a duration of at least one minute long. Cancelling prompt.',
		COMMAND_REMINDME_CREATE: (id) => `A reminder with ID \`${id}\` has been created.`,
		COMMAND_REMINDME_DELETE_PARAMS: ['delete', 'remove'],
		COMMAND_REMINDME_DELETE_INVALID_PARAMETERS: 'To delete a previously created reminder, you must type \'delete\' followed by the ID.',
		COMMAND_REMINDME_DELETE: (task) => `The reminder with ID \`${task.id}\` and with a remaining time of **${duration(task.time - Date.now())}** has been successfully deleted.`,
		COMMAND_REMINDME_LIST_PARAMS: ['list', 'all'],
		COMMAND_REMINDME_LIST_EMPTY: 'You do not have any active reminder',
		COMMAND_REMINDME_INVALID_ID: 'I am sorry, but the ID provided does not seem to be valid.',
		COMMAND_REMINDME_NOTFOUND: 'I cannot find something here. The reminder either never existed or it ended.',

		COMMAND_REPUTATION_TIME: (remaining) => `You can give a reputation point in ${duration(remaining)}`,
		COMMAND_REPUTATION_USABLE: 'You can give a reputation point now.',
		COMMAND_REPUTATION_USER_NOTFOUND: 'You must mention a user to give a reputation point.',
		COMMAND_REPUTATION_SELF: 'You cannot give a reputation point to yourself.',
		COMMAND_REPUTATION_BOTS: 'You cannot give a reputation point to bots.',
		COMMAND_REPUTATION_GIVE: (user) => `You have given a reputation point to **${user}**!`,
		COMMAND_REPUTATIONS_BOTS: 'Bots cannot have reputation points...',
		COMMAND_REPUTATIONS_SELF: (points) => `You have a total of ${points} reputation points.`,
		COMMAND_REPUTATIONS: (user, points) => `The user ${user} has a total of ${points === 1 ? 'one reputation point' : `${points} reputation points`}.`,
		COMMAND_REQUIRE_ROLE: 'I am sorry, but you must provide a role for this command.',
		COMMAND_SCOREBOARD_POSITION: (position) => `Your placing position is: ${position}`,
		COMMAND_SETCOLOR: (color) => `Color changed to ${color}`,
		COMMAND_SLOTMACHINES_MONEY: (money) => `I am sorry, but you do not have enough money to pay your bet! Your current account balance is ${money}${SHINY}`,
		COMMAND_SLOTMACHINES_WIN: (roll, winnings) => `**You rolled:**\n${roll}\n**Congratulations!**\nYou won ${winnings}${SHINY}!`,
		COMMAND_SLOTMACHINES_LOSS: (roll) => `**You rolled:**\n${roll}\n**Mission failed!**\nWe'll get em next time!`,
		COMMAND_SOCIAL_PROFILE_NOTFOUND: 'I am sorry, but this user profile does not exist.',
		COMMAND_SOCIAL_PROFILE_BOT: 'I am sorry, but Bots do not have a __Member Profile__.',
		COMMAND_SOCIAL_PROFILE_DELETE: (user, points) => `${GREENTICK} **Success**. Deleted the __Member Profile__ for **${user}**, which had ${points} points.`,
		COMMAND_SOCIAL_POINTS: 'May you specify the amount of points you want to add or remove?',
		COMMAND_SOCIAL_UPDATE: (action, amount, user, before, now) => `You have just ${action === 'add' ? 'added' : 'removed'} ${amount} ${amount === 1 ? 'point' : 'points'} to the __Member Profile__ for ${user}. Before: ${before}; Now: ${now}.`,

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		COMMAND_STAR_NOSTARS: 'There is no starred message.',
		COMMAND_STAR_STATS: 'Starboard Stats',
		COMMAND_STAR_STATS_DESCRIPTION: (messages, stars) => `${messages} ${messages === 1 ? 'message' : 'messages'} starred with a total of ${stars} ${stars === 1 ? 'star' : 'stars'}.`,
		COMMAND_STAR_TOPSTARRED: 'Top Starred Posts',
		COMMAND_STAR_TOPSTARRED_DESCRIPTION: (medal, id, stars) => `${medal}: ${id} (${stars} ${stars === 1 ? 'star' : 'stars'})`,
		COMMAND_STAR_TOPRECEIVERS: 'Top Star Receivers',
		COMMAND_STAR_TOPRECEIVERS_DESCRIPTION: (medal, id, stars) => `${medal}: <@${id}> (${stars} ${stars === 1 ? 'star' : 'stars'})`,

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		COMMAND_EVAL_TIMEOUT: (seconds) => `TIMEOUT: Took longer than ${seconds} seconds.`,
		COMMAND_EVAL_ERROR: (time, output, type) => `**Error**:${output}\n**Type**:${type}\n${time}`,
		COMMAND_EVAL_OUTPUT: (time, output, type) => `**Output**:${output}\n**Type**:${type}\n${time}`,
		COMMAND_EVAL_OUTPUT_CONSOLE: (time, type) => `Sent the result to console.\n**Type**:${type}\n${time}`,
		COMMAND_EVAL_OUTPUT_FILE: (time, type) => `Sent the result as a file.\n**Type**:${type}\n${time}`,
		COMMAND_EVAL_OUTPUT_HASTEBIN: (time, url, type) => `Sent the result to hastebin: ${url}\n**Type**:${type}\n${time}\n`,

		COMMAND_FEEDBACK: 'Thanks you for your feedback ❤! I will make sure the developer team read this, you may get a response in DMs!',

		COMMAND_STATS: (STATS, UPTIME, USAGE) => [
			'= STATISTICS =',
			`• Users      :: ${STATS.USERS}`,
			`• Guilds     :: ${STATS.GUILDS}`,
			`• Channels   :: ${STATS.CHANNELS}`,
			`• Discord.js :: ${STATS.VERSION}`,
			`• Node.js    :: ${STATS.NODE_JS}`,
			`• Klasa      :: ${klasaVersion}`,
			'',
			'= UPTIME =',
			`• Host       :: ${UPTIME.HOST}`,
			`• Total      :: ${UPTIME.TOTAL}`,
			`• Client     :: ${UPTIME.CLIENT}`,
			'',
			'= HOST USAGE =',
			`• CPU Load   :: ${USAGE.CPU_LOAD}`,
			`• RAM +Node  :: ${USAGE.RAM_TOTAL}`,
			`• RAM Usage  :: ${USAGE.RAM_USED}`
		],

		/**
		 * #############
		 * TAGS COMMANDS
		 */

		COMMAND_TAG_PERMISSIONLEVEL: 'You must be a staff member, moderator, or admin, to be able to manage tags.',
		COMMAND_TAG_NAME_NOTALLOWED: 'A tag name may not have a grave accent nor invisible characters.',
		COMMAND_TAG_NAME_TOOLONG: 'A tag name must be 50 or less characters long.',
		COMMAND_TAG_EXISTS: (tag) => `The tag '${tag}' already exists.`,
		COMMAND_TAG_CONTENT_REQUIRED: 'You must provide a content for this tag.',
		COMMAND_TAG_ADDED: (name, content) => `Successfully added a new tag: **${name}** with a content of **${content}**.`,
		COMMAND_TAG_REMOVED: (name) => `Successfully removed the tag **${name}**.`,
		COMMAND_TAG_NOTEXISTS: (tag) => `The tag '${tag}' does not exist.`,
		COMMAND_TAG_EDITED: (name, content) => `Successfully edited the tag **${name}** with a content of **${content}**.`,
		COMMAND_TAG_LIST_EMPTY: 'The tag list for this server is empty.',
		COMMAND_TAG_LIST: (tags) => (tags.length === 1 ? 'There is 1 tag: ' : `There are ${tags.length} tags: `) + tags.join(', '),

		/**
		 * ##############
		 * TOOLS COMMANDS
		 */

		COMMAND_AVATAR_NONE: 'El usuario no tiene ninguna foto de perfil puesta.',
		COMMAND_COLOR: (hex, rgb, hsl) => [
			`HEX: **${hex}**`,
			`RGB: **${rgb}**`,
			`HSL: **${hsl}**`
		].join('\n'),
		COMMAND_DEFINE_NOTFOUND: 'No pude encontrar una definición para esta palabra.',
		COMMAND_DEFINE: (input, output) => `Resultados de la búsqueda para \`${input}\`:\n${output}`,
		COMMAND_EMOJI_CUSTOM: (emoji, id) => [
			`→ ${inlineCodeblock('Emoji ::')} **${emoji}**`,
			`→ ${inlineCodeblock('Type  ::')} **Personalizado**`,
			`→ ${inlineCodeblock('ID    ::')} **${id}**`
		].join('\n'),
		COMMAND_EMOJI_TWEMOJI: (emoji, id) => [
			`→ ${inlineCodeblock('Emoji ::')} \`${emoji}\``,
			`→ ${inlineCodeblock('Type  ::')} **Twemoji**`,
			`→ ${inlineCodeblock('ID    ::')} **${id}**`
		].join('\n'),
		COMMAND_EMOJI_INVALID: (emoji) => `'${emoji}' no es un emoji válido.`,
		COMMAND_EMOJI_TOO_LARGE: (emoji) => `'${emoji}' es tan pesado que los hámsters no pudieron con su peso. ¿Quizá prueba con un emoji más pequeño?ç`,
		COMMAND_GOOGL_LONG: (url) => `**URL Acortada: [${url}](${url})**`,
		COMMAND_GOOGL_SHORT: (url) => `**URL Expandida: [${url}](${url})**`,
		COMMAND_POLL_MISSING_TITLE: 'Debes escribir un título.',
		COMMAND_POLL_TIME: '¿Cuándo quieres que termine la encuesta? Los formatos de duración y fechas están permitidas para esta operación.',
		COMMAND_POLL_WANT_USERS: '¿Quieres incluir una lista blanca de usuarios?',
		COMMAND_POLL_FIRSTUSER: '¡De acuerdo! Escribe una lista de todos los usuarios que quieras incluir en la lista blanca, separando sus nombres, menciones, o id de usuario por coma.',
		COMMAND_POLL_WANT_ROLES: 'Antes de crear la encuesta, ¿quieres incluir una lista blanca de roles?',
		COMMAND_POLL_FIRSTROLE: '¡De acuerdo! Escribe una lista de todos los roles que quieras incluir en la lista blanca, separando sus nombres, menciones, o id de rol por coma.',
		COMMAND_POLL_CREATE: (title, roles, users, options, time, id) => [
			`He creado la encuesta con éxito.`,
			`Título   : '${title}'`,
			`Roles    : ${roles ? roles.join(' | ') : 'Ninguno'}`,
			`Usuarios : ${users ? users.join(' | ') : 'Ninguno'}`,
			`Opciones : ${options ? options.join(' | ') : 'Ninguno'}`,
			`Duración : ${duration(time)}`,
			`ID       : ${id}`
		],
		COMMAND_POLL_LIST_EMPTY: `${REDCROSS} No pude encontrar una encuesta activa para este servidor.`,
		COMMAND_POLL_NOTEXISTS: `${REDCROSS} La encuesta que quieres obtener no existe o ha expirado.`,
		COMMAND_POLL_NOTMANAGEABLE: `${REDCROSS} Esta encuesta está protegida y sólo puede ser modificada por su autor o por un administrador de este servidor.`,
		COMMAND_POLL_REMOVE: `${GREENTICK} Eliminada la encuesta con éxito.`,
		COMMAND_POLL_INVALID_OPTION: (options) => `${REDCROSS} Opción inválida. Por favor, elige una de las siguientes opciones: ${options}.`,
		COMMAND_POLL_ALREADY_VOTED: `${REDCROSS} ¡Ya votaste en esta encuesta!`,
		COMMAND_POLL_VOTE: `${GREENTICK} ¡Votado con éxito! Autodestruyendo mensaje en 10 segundos...`,
		COMMAND_POLL_MISSING_ID: '¡Necesitas la id de la encuesta!',
		COMMAND_POLL_EMPTY_VOTES: 'Infortunadamente, nadie ha votado en la encuesta.',
		COMMAND_PRICE_CURRENCY: (from, to, amount) => `El precio de la cantidad seleccionada de ${from} es de ${amount} ${to}`,
		COMMAND_PRICE_CURRENCY_NOT_FOUND: '¡Ha habido un error! Por favor, revise de nuevo la ortografía y que especificaste una moneda válida.',
		COMMAND_QUOTE_MESSAGE: 'Esto es muy raro, pero dicho mensaje no tiene ni contenido ni imagen.',
		COMMAND_ROLES_LIST_EMPTY: '¡Este servidor no tiene ningún rol público!',
		COMMAND_ROLES_ABORT: (prefix) => `He buscado en todos los rincones pero no he encontrado lo que buscabas. ¡Por favor escribe \`${prefix}roles\` para recibir la lista completa!`,
		COMMAND_ROLES_LIST_TITLE: 'Lista de roles públicos',
		COMMAND_ROLES_ADDED: (roles) => `Los siguientes roles han sido añadidos a tu perfil: \`${roles}\``,
		COMMAND_ROLES_REMOVED: (roles) => `Los siguientes roles han sido removidos de tu perfil: \`${roles}\``,
		COMMAND_ROLES_NOT_PUBLIC: (roles) => `Los siguientes roles no son públicos: \`${roles}\``,
		COMMAND_ROLES_NOT_MANAGEABLE: (roles) => `Los siguientes roles no se pudieron entregar debido a la posición jerárquica: \`${roles}\``,
		COMMAND_ROLES_AUDITLOG: 'Autorización: Administración de Roles Públicos | Comando \'Roles\'.',
		COMMAND_DUCKDUCKGO_NOTFOUND: 'Lo siento, pero la API de DuckDuckGo ha devuelto una respuesta en blanco. Prueba de nuevo con otras palabras.',
		COMMAND_DUCKDUCKGO_LOOKALSO: 'Temas Relacionados:',

		COMMAND_URBAN_NOTFOUND: 'Lo siento, la palabra que buscabas no parece estar definida en UrbanDictionary. ¿Prueba con otra palabra?',
		COMMAND_URBAN_INDEX_NOTFOUND: 'Quizás quieras probar con un número de página más pequeño.',
		SYSTEM_TEXT_TRUNCATED: (definition, url) => `${definition}... [continúa leyendo](${url})`,
		COMMAND_URBAN_OUTPUT: (index, pages, definition, example, author) => [
			`→ ${inlineCodeblock('Definición ::')} ${index}/${pages}\n${definition}`,
			`→ ${inlineCodeblock('Ejemplo    ::')} ${example}`,
			`→ ${inlineCodeblock('Autor      ::')} ${author}`
		].join('\n\n'),
		COMMAND_WHOIS_MEMBER: (member) => [
			`→ ${inlineCodeblock('ID             ::')} **${member.id}**`,
			`→ ${inlineCodeblock('Etiqueta       ::')} **${member.user.tag}**`,
			`→ ${inlineCodeblock('Apodo          ::')} **${member.nickname || 'Not set'}**`,
			`→ ${inlineCodeblock('Fecha Creación ::')} **${timestamp.displayUTC(member.user.createdAt)}**`,
			`→ ${inlineCodeblock('Fecha Ingreso  ::')} **${timestamp.displayUTC(member.joinedAt)}**`
		].join('\n'),
		COMMAND_WHOIS_MEMBER_ROLES: '→ `Roles`',
		COMMAND_WHOIS_USER: (user) => [
			`→ ${inlineCodeblock('ID             ::')} **${user.id}**`,
			`→ ${inlineCodeblock('Etiqueta       ::')} **${user.tag}**`,
			`→ ${inlineCodeblock('Fecha Creación ::')} **${timestamp.displayUTC(user.createdAt)}**`
		].join('\n'),
		COMMAND_WIKIPEDIA_NOTFOUND: 'Lo siento, pero no he podido encontrar algo que coincida con el término que buscas a través de Wikipedia.',
		COMMAND_YOUTUBE_NOTFOUND: 'Lo siento, pero no he podido encontrar algo que coincida con el término que buscas a través de YouTube.',
		COMMAND_YOUTUBE_INDEX_NOTFOUND: 'Quizá quieras probar con un índice de página menor, porque no soy capaz de encontrar algo en éste.',

		/**
		 * ################
		 * WEATHER COMMANDS
		 */

		COMMAND_WEATHER_ERROR_ZERO_RESULTS: 'La aplicación no devolvió resultados.',
		COMMAND_WEATHER_ERROR_REQUEST_DENIED: 'La aplicación GeoCode ha rechazado su solicitud.',
		COMMAND_WEATHER_ERROR_INVALID_REQUEST: 'Solicitud incorrecta.',
		COMMAND_WEATHER_ERROR_OVER_QUERY_LIMIT: 'Límite de solicitudes excedida, prueba de nuevo mañana.',
		COMMAND_WEATHER_ERROR_UNKNOWN: 'Error Desconocido.',

		/**
		 * #############
		 * WEEB COMMANDS
		 */

		COMMAND_WBLUSH: '¡Le/a ruborizaste! 😊',
		COMMAND_WCRY: (user) => `Querido ${user}, ¿le/a hiciste llorar? 💔`,
		COMMAND_WCUDDLE: (user) => `Ahí va un abracito para tí, ${user} 💞`,
		COMMAND_WDANCE: '¡Olé! 💃',
		COMMAND_WHUG: (user) => `¡Un abrazo! ${user} ❤`,
		COMMAND_WKISS: (user) => `¡Un besito! ${user} 💜`,
		COMMAND_WLICK: (user) => `Lamiendo ${user} 👅`,
		COMMAND_WNOM: `Nom, nom, nom! 😊`,
		COMMAND_WNEKO: `Miau! 🐱`,
		COMMAND_WPAT: (user) => `\\*Da palmaditas en la cabeza de ${user}\\* ❤`,
		COMMAND_WPOUT: `¿Oh?`,
		COMMAND_WSLAP: (user) => `¡Abofeteando ${user}!`,
		COMMAND_WSMUG: `\\*Sonríe con superioridad\\*`,
		COMMAND_WSTARE: (user) => `Querido ${user}... hay alguien observándote 👀`,
		COMMAND_WTICKLE: (user) => `Cosquillitas para tí, ${user}!`,

		/**
		 * #################################
		 * #            MONITORS           #
		 * #################################
		 */

		CONST_MONITOR_INVITELINK: 'Enlace Invitación',
		CONST_MONITOR_NMS: '[NOMENTIONSPAM]',
		CONST_MONITOR_WORDFILTER: 'Palabra Filtrada',
		CONST_MONITOR_CAPSFILTER: 'Demasiadas Mayúsculas',
		CONST_MONITOR_ATTACHMENTFILTER: 'Demasiados Documentos',
		MONITOR_NOINVITE: (user) => `${REDCROSS} Querido ${user}, los enlaces de invitación no están permitidos aquí.`,
		MONITOR_WORDFILTER_DM: (filtered) => `¡Parece que dijiste algo malo! Pero como te esforzaste en escribir el mensaje, te lo he mandado por aquí:\n${filtered}`,
		MONITOR_CAPSFILTER_DM: (message) => `Speak lower! I know you need to express your thoughts. There is the message I deleted:\n${message}`,
		MONITOR_WORDFILTER: (user) => `${REDCROSS} Perdona, querido/a ${user}, pero has escrito algo que no está permitido en este servidor.`,
		MONITOR_CAPSFILTER: (user) => `${REDCROSS} ¡EEEEEEH ${user}! ¡POR FAVOR NO GRITE EN ESTE SITIO! ¡HAS SUPERADO EL LÍMITE DE MAYÚSCULAS!`,
		MONITOR_NMS_MESSAGE: (user) => [
			`El MJOLNIR ha aterrizado y ahora, el usuario ${user.tag} cuya ID es ${user.id} ha sido baneado por spamming de menciones.`,
			'¡No te preocupes! ¡Estoy aquí para ayudarte! 😄'
		].join('\n'),
		MONITOR_NMS_MODLOG: (threshold) => `[NOMENTIONSPAM] Automático: Límite de Spam de Menciones alcanzado.\nLímite: ${threshold}.`,
		MONITOR_NMS_ALERT: `Ten cuidado con mencionar otra vez más, estás a punto de ser expulsado por exceder el límite de spam de menciones de este servidor.`,
		MONITOR_SOCIAL_ACHIEVEMENT: '¡Felicidades %MEMBER! ¡Has logrado el rol %ROLE%!',

		/**
		 * #################################
		 * #           INHIBITORS          #
		 * #################################
		 */

		INHIBITOR_SPAM: (channel) => `¿Podemos movernos al canal ${channel}, por favor? Este comando puede ser muy molesto y arruinar las conversaciones de otras personas.`,

		/**
		 * #################################
		 * #             UTILS             #
		 * #################################
		 */

		RESOLVER_DATE_SUFFIX: ' segundos',
		POWEREDBY_WEEBSH: 'Powered by weeb.sh',
		PREFIX_REMINDER: (prefix) => `El prefijo de este servidor está configurado a: \`${prefix}\``,

		UNEXPECTED_ISSUE: '¡Algo inesperado pasó! Cancelando este comando...',

		COMMAND_DM_NOT_SENT: 'No te he podido enviar el mensaje en mensaje directo... ¿me has bloqueado?',
		COMMAND_DM_SENT: 'Te he enviado la información a través de un mensaje directo.',
		COMMAND_ROLE_HIGHER_SKYRA: 'El miembro seleccionado tiene una posición jerárquica más alta o igual que el mío.',
		COMMAND_ROLE_HIGHER: 'El miembro seleccionado tiene una posición jerárquica más alta o igual al tuyo.',
		COMMAND_SUCCESS: 'Ejecutado el comando con éxito.',
		COMMAND_TOSKYRA: '¿Por qué...? ¡Pensaba que me amabas! 💔',
		COMMAND_USERSELF: '¿Por qué te harías eso a tí mismo?',

		SYSTEM_FETCHING: createPick([
			`${LOADING} Descargando datos...`,
			`${LOADING} Buscando al Comandante Data...`,
			`${LOADING} Persiguiendo otras naves estelares...`
		]),
		SYSTEM_HIGHEST_ROLE: 'La posición del rol es más alta o equivalente al mío, por lo tanto no puedo concederlo a nadie.',
		SYSTEM_CHANNEL_NOT_POSTABLE: 'No tengo permisos para mandar mensajes a éste canal.',
		SYSTEM_FETCHBANS_FAIL: `He fallado al buscar la lista de baneos. ¿Tengo el permiso **${PERMS.BAN_MEMBERS}**?`,
		SYSTEM_LOADING: createPick([
			`${LOADING} Observando a los hamsters correr...`,
			`${LOADING} Encontrando a los jugadores en el escondite...`,
			`${LOADING} Intentando resolver este comando...`,
			`${LOADING} Buscando data desde la nube...`,
			`${LOADING} Calibrando lentes...`,
			`${LOADING} Jugando a Piedra, Papel, Tijeras...`
		]),
		SYSTEM_MESSAGE_NOT_FOUND: 'Lo siento, pero la id del mensaje que escribiste no era correcto, o el mensaje fue borrado.',
		SYSTEM_GUILD_MUTECREATE_MUTEEXISTS: '**Cancelando la creación del rol de mute**: Ya existe un rol de mute.',
		SYSTEM_GUILD_MUTECREATE_TOOMANYROLES: '**Cancelando la creación del rol de mute**: Hay 250 roles en este servidor, necesitas borrar uno.',
		SYSTEM_GUILD_MUTECREATE_APPLYING: (channels, role) => `Aplicando permisos en ${channels} para el rol ${role}...`,
		SYSTEM_GUILD_MUTECREATE_EXCEPTIONS: (denied) => denied.length > 1 ? `, con excepción de los canales ${denied.join(', ')}` : '',
		SYSTEM_GUILD_MUTECREATE_APPLIED: (accepted, exceptions, author, role) => `Permisos aplicados para ${accepted} ${accepted === 1 ? 'canal' : 'canales'}${exceptions}. Querido ${author}, puedes modificar los permisos de los canales que quieras para el rol ${role}, por ejemplo si quieres un canal de reclamaciones.`,

		STARBOARD_JUMPTO: 'Salta al Mensaje ►',

		RESOLVER_INVALID_CHANNELNAME: (name) => `${name} debe ser una mención, nombre, o id válido de un canal.`,
		RESOLVER_INVALID_ROLENAME: (name) => `${name} debe ser una mención, nombre, o id válido de un rol.`,
		RESOLVER_INVALID_USERNAME: (name) => `${name} debe ser una mención, nombre, o id válido de un usuario.`,

		LISTIFY_PAGE: (page, pageCount, results) => `Página ${page} / ${pageCount} | ${results} Resultados`,

		GUILD_SETTINGS_CHANNELS_MOD: 'Necesitas configurar un canal de moderación. Utiliza `Skyra, settings set channels.modlog <NombreDeCanal>`.',
		GUILD_SETTINGS_ROLES_MUTED: 'Necesitas configurar un rol de muteo. Utiliza `Skyra, settings set roles.muted <NombreDeRol>`.',
		GUILD_MUTE_NOT_FOUND: 'He fallado al buscar un caso de moderación que justifique el mute del usuario. O el usuario nunca ha sido muteado, o todos sus muteos están reclamados.',
		GUILD_BANS_EMPTY: 'No hay baneos registrados en este servidor.',
		GUILD_BANS_NOT_FOUND: 'Por favor, mencione un usuario o escriba su id de usuario.',
		CHANNEL_NOT_READABLE: `Lo siento, pero necesito los permisos **${PERMS.VIEW_CHANNEL}** y **${PERMS.READ_MESSAGE_HISTORY}** para poder leer los mensajes.`,

		USER_NOT_IN_GUILD: 'El usuario no está en este servidor.',
		USER_NOT_EXISTENT: 'El usuario no parece existir. ¿Estás seguro/a que es una ID de usuario válida?',

		EVENTS_GUILDMEMBERADD: 'Nuevo Usuario',
		EVENTS_GUILDMEMBERADD_MUTE: 'Nuevo Usuario Muteado',
		EVENTS_GUILDMEMBERADD_RAID: 'RAID Detectado',
		EVENTS_GUILDMEMBERREMOVE: 'Usuario Menos',
		EVENTS_GUILDMEMBER_UPDATE_NICKNAME: (previous, current) => `Actualizado el apodo de **${previous}** a **${current}**`,
		EVENTS_GUILDMEMBER_ADDED_NICKNAME: (_, current) => `Añadido un nuevo apodo **${current}**`,
		EVENTS_GUILDMEMBER_REMOVED_NICKNAME: (previous) => `Eliminado el apodo **${previous}**`,
		EVENTS_GUILDMEMBER_UPDATE_ROLES: (removed, added) => `${removed.length > 0
			? `${removed.length === 1 ? 'Eliminado el rol' : 'Eliminados los roles'}: ${removed.join(', ')}\n` : ''}${added.length > 0
				? `${added.length === 1 ? 'Añadido el rol' : 'Añadidos los roles'}: ${added.join(', ')}` : ''}`,
		EVENTS_MESSAGE_UPDATE: 'Mensaje Editado',
		EVENTS_MESSAGE_DELETE: 'Mensaje Eliminado',
		EVENTS_COMMAND: (command) => `Comando Usado: ${command}`,
		EVENTS_STREAM_START: (member) => `¡El usuario **${member.user.tag}** está en vivo! **${member.presence.activity.name}**\n${member.presence.activity.url}`,
		EVENTS_STREAM_STOP: (member) => `¡El usuario **${member.user.tag}** ha dejado de estar en vivo!`,

		SETTINGS_DELETE_CHANNELS_DEFAULT: 'Restablecido el valor para la clave `channels.default`',
		SETTINGS_DELETE_ROLES_INITIAL: 'Restablecido el valor para la clave `roles.initial`',
		SETTINGS_DELETE_ROLES_MUTE: 'Restablecido el valor para la clave `roles.muted`',

		MODLOG_TIMED: (remaining) => `Este caso de moderación ya había sido temporizado. Expira en ${duration(remaining)}`,

		GUILD_WARN_NOT_FOUND: 'Fallé al buscar el caso de moderación para su reclamación. O no existe, o no es una advertencia, o ya estaba reclamada.',
		GUILD_MEMBER_NOT_VOICECHANNEL: 'No puedo tomar acción en un miembro que no está conectado a un canal de voz.',

		PROMPTLIST_MULTIPLE_CHOICE: (list, amount) => `He encontrado ${amount} ${amount === 1 ? 'resultado' : 'resultados'}. Por favor escriba un número entre 1 y ${amount}, o escriba **"CANCELAR"** para cancelar la solicitud.\n${list}`,
		PROMPTLIST_ATTEMPT_FAILED: (list, attempt, maxAttempts) => `Valor inválido. Intento **${attempt}** de **${maxAttempts}**\n${list}`,
		PROMPTLIST_ABORT: 'cancelar',
		PROMPTLIST_ABORTED: 'Cancelada la solicitud con éxito.',

		FUZZYSEARCH_MATCHES: (matches, codeblock) => `¡Encontré múltiples resultados! **Por favor selecciona un número entre 0 y ${matches}**:\n${codeblock}\nEscribe **ABORT** para cancelar la solicitud.`,
		FUZZYSEARCH_INVALID_NUMBER: 'Esperaba que me dieras un número de un dígito, pero recibí una patata.',
		FUZZYSEARCH_INVALID_INDEX: 'Cancelando solicitud... El número no estaba dentro del rango.',

		EVENTS_ERROR_WTF: '¡Vaya fallo más terrible! ¡Lo siento!',
		EVENTS_ERROR_STRING: (mention, message) => `Querido ${mention}, ${message}`,

		CONST_USERS: 'Usuarios'
	};

	public async init() {
		// noop
	}

}
