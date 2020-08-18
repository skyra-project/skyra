/* eslint-disable @typescript-eslint/no-invalid-this */
import { codeBlock, toTitleCase } from '@klasa/utils';
import { Filter, Position } from '@lib/types/Languages';
import { NotificationsStreamsTwitchEventStatus } from '@lib/types/settings/GuildSettings';
import ShinyWager from '@root/arguments/shinywager';
import { CLIENT_ID, VERSION } from '@root/config';
import { Emojis } from '@utils/constants';
import friendlyDuration, { DurationFormatAssetsTime, TimeTypes } from '@utils/FriendlyDuration';
import { HungerGamesUsage } from '@utils/Games/HungerGamesUsage';
import { CATEGORIES } from '@utils/Games/TriviaManager';
import { createPick, inlineCodeblock } from '@utils/util';
import { Language, LanguageKeys, Timestamp, version as klasaVersion } from 'klasa';

const LOADING = Emojis.Loading;
const SHINY = Emojis.Shiny;
const GREENTICK = Emojis.GreenTick;
const REDCROSS = Emojis.RedCross;

const timestamp = new Timestamp('DD/MM/YYYY [a las] HH:mm:ss');

const TIMES: DurationFormatAssetsTime = {
	[TimeTypes.Year]: {
		1: 'año',
		DEFAULT: 'años'
	},
	[TimeTypes.Month]: {
		1: 'mes',
		DEFAULT: 'meses'
	},
	[TimeTypes.Week]: {
		1: 'semana',
		DEFAULT: 'semanas'
	},
	[TimeTypes.Day]: {
		1: 'día',
		DEFAULT: 'días'
	},
	[TimeTypes.Hour]: {
		1: 'hora',
		DEFAULT: 'horas'
	},
	[TimeTypes.Minute]: {
		1: 'minuto',
		DEFAULT: 'minutos'
	},
	[TimeTypes.Second]: {
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
	STREAM: 'Conectar en Vivo',
	MUTE_MEMBERS: 'Silenciar Miembros',
	DEAFEN_MEMBERS: 'Ensordecer Miembros',
	MOVE_MEMBERS: 'Mover Miembros',
	USE_VAD: 'Usar la actividad de voz',
	PRIORITY_SPEAKER: 'Orador Prioritario'
};

const random = (num: number) => Math.round(Math.random() * num);

function duration(time: number, precision?: number) {
	return friendlyDuration(time, TIMES, precision);
}

/** Parses cardinal numbers to the ordinal counterparts */
function ordinal(cardinal: number) {
	const dec = cardinal % 10;

	switch (dec) {
		case 1:
			return `${cardinal}ro`;
		case 2:
			return `${cardinal}do`;
		case 3:
			return `${cardinal}ro`;
		case 0:
		case 7:
			return `${cardinal}mo`;
		case 8:
			return `${cardinal}vo`;
		case 9:
			return `${cardinal}no`;
		default:
			return `${cardinal}to`;
	}
}

const list = (andValue: string, orString: string) => (values: readonly string[], conjuction: typeof andValue | typeof orString) => {
	switch (values.length) {
		case 0:
			return '';
		case 1:
			return values[0];
		case 2:
			return `${values[0]} ${conjuction} ${values[1]}`;
		default: {
			const trail = values.slice(0, -1);
			const head = values[values.length - 1];
			return `${trail.join(', ')}, ${conjuction} ${head}`;
		}
	}
};

function groupDigits(number: number) {
	return number.toLocaleString('es-ES', { useGrouping: true });
}

export default class extends Language {
	public andString = 'y';
	public orString = 'o';
	public PERMISSIONS = PERMS;
	public HUMAN_LEVELS = {
		0: 'Ninguno',
		1: 'Bajo',
		2: 'Medio',
		3: 'Alto',
		4: 'Muy alto'
	};

	public duration = duration;
	public ordinal = ordinal;
	public list = list(this.andString, this.orString);
	public groupDigits = groupDigits;

	public language: LanguageKeys = {
		/**
		 * ################################
		 * #      FRAMEWORK MESSAGES      #
		 * #         KLASA 0.5.0d         #
		 * ################################
		 */

		DEFAULT: ({ key }) => `La clave ${key} aún no ha sido traducida a es-ES.`,
		DEFAULT_LANGUAGE: 'Lenguaje Predeterminado',
		SETTING_GATEWAY_KEY_NOEXT: ({ key }) => `The key "${key}" does not exist in the data schema.`,
		SETTING_GATEWAY_CHOOSE_KEY: ({ keys }) => `You cannot edit a settings group, pick any of the following: "${keys.join('", "')}"`,
		SETTING_GATEWAY_UNCONFIGURABLE_FOLDER: 'This settings group does not have any configurable sub-key.',
		SETTING_GATEWAY_UNCONFIGURABLE_KEY: ({ key }) => `The settings key "${key}" has been marked as non-configurable by the bot owner.`,
		SETTING_GATEWAY_MISSING_VALUE: ({ entry, value }) =>
			`The value "${value}" cannot be removed from the key "${entry.path}" because it does not exist.`,
		SETTING_GATEWAY_DUPLICATE_VALUE: ({ entry, value }) =>
			`The value "${value}" cannot be added to the key "${entry.path}" because it was already set.`,
		SETTING_GATEWAY_INVALID_FILTERED_VALUE: ({ entry, value }) => `The settings key "${entry.path}" does not accept the value "${value}".`,
		RESOLVER_MULTI_TOO_FEW: ({ name, min = 1 }) =>
			`No pude resolver suficientes ${name}s. Al menos ${min} ${min === 1 ? 'es' : 'son'} requeridos.`,
		RESOLVER_INVALID_BOOL: ({ name }) => `${name} debe ser o 'true' para afirmativo, o 'false' para negativo.`,
		RESOLVER_INVALID_CHANNEL: ({ name }) => `${name} debe ser una mención de canal o una id de canal válida.`,
		RESOLVER_INVALID_CUSTOM: ({ name, type }) => `${name} debe ser un válido ${type}.`,
		RESOLVER_INVALID_DATE: ({ name }) => `${name} debe ser una fecha válida.`,
		RESOLVER_INVALID_DURATION: ({ name }) => `${name} debe ser una duración válida.`,
		RESOLVER_INVALID_EMOJI: ({ name }) => `${name} debe ser un emoji o una id de emoji válida.`,
		RESOLVER_INVALID_FLOAT: ({ name }) => `${name} debe ser un número válido.`,
		RESOLVER_INVALID_GUILD: ({ name }) => `${name} debe ser una id de servidor válida.`,
		RESOLVER_INVALID_INT: ({ name }) => `${name} debe ser un número entero válido.`,
		RESOLVER_INVALID_INVITE: ({ name }) => `${name} debe ser una invitación de servidor válida.`,
		RESOLVER_INVALID_WAGER: ({ bet }) =>
			`Lo siento, pero ${bet} ${SHINY} es una cantidad no válida para apostar. Puedes apostar una de las siguientes cantidades ${ShinyWager.kValidBetAmounts
				.map((amount) => `\`${amount}\``)
				.join(', ')}`,
		RESOLVER_INVALID_LITERAL: ({ name }) => `La opción no coincide con la única posibilidad: ${name}`,
		RESOLVER_INVALID_MEMBER: ({ name }) => `${name} debe ser una mención de usuario o una id de usuario válida.`,
		RESOLVER_INVALID_MESSAGE: ({ name }) => `${name} debe ser una id de mensaje válida.`,
		RESOLVER_INVALID_PIECE: ({ name, piece }) => `${name} debe ser un nombre de ${piece} válido.`,
		RESOLVER_INVALID_REGEX_MATCH: ({ name, pattern }) => `${name} debe combinar con el siguiente patrón \`${pattern}\`.`,
		RESOLVER_INVALID_ROLE: ({ name }) => `${name} debe ser una mención de rol o una id de rol válida.`,
		RESOLVER_INVALID_STRING: ({ name }) => `${name} debe ser un texto no vacío válido.`,
		RESOLVER_INVALID_TIME: ({ name }) => `${name} debe ser una duración o fecha válida.`,
		RESOLVER_INVALID_URL: ({ name }) => `${name} debe ser un enlace válido.`,
		RESOLVER_INVALID_USER: ({ name }) => `${name} debe ser una mención o una id de usuario válida.`,
		RESOLVER_INVALID_SNOWFLAKE: ({ name }) => `${name} debe ser un snowflake válido de Discord.`,
		RESOLVER_STRING_SUFFIX: ' carácteres',
		RESOLVER_MINMAX_EXACTLY: ({ name, min }) => `${name} must be exactly ${min}.`,
		RESOLVER_MINMAX_BOTH: ({ name, min, max, inclusive }) =>
			inclusive ? `${name} must be between ${min} and ${max} inclusively.` : `${name} must be between ${min} and ${max} exclusively.`,
		RESOLVER_MINMAX_MIN: ({ name, min, inclusive }) =>
			inclusive ? `${name} must be greater than ${min} inclusively.` : `${name} must be greater than ${min} exclusively.`,
		RESOLVER_MINMAX_MAX: ({ name, max, inclusive }) =>
			inclusive ? `${name} must be less than ${max} inclusively` : `${name} must be less than ${max} exclusively.`,
		REACTIONHANDLER_PROMPT: '¿A qué página te gustaría saltar?',
		SYSTEM_HELP_TITLES: {
			EXPLAINED_USAGE: '⚙ | ***Uso Explicado***',
			POSSIBLE_FORMATS: '🔢 | ***Formatos Posibles***',
			EXAMPLES: '🔗 | ***Ejemplos***',
			REMINDERS: '⏰ | ***Recordatorio***'
		},
		COMMANDMESSAGE_MISSING: 'Faltan uno o más argumentos al final de la entrada.',
		COMMANDMESSAGE_MISSING_REQUIRED: ({ name }) => `El argumento ${name} es requerido.`,
		COMMANDMESSAGE_MISSING_OPTIONALS: ({ possibles }) => `Falta una opción requerida: (${possibles})`,
		COMMANDMESSAGE_NOMATCH: ({ possibles }) => `Su opción no se pudo encontrar en ninguna de las posibilidades: (${possibles})`,
		MONITOR_COMMAND_HANDLER_REPROMPT: ({ tag, name, time, cancelOptions }) =>
			`${tag} | **${name}** | Tienes **${time}** segundos para responder a este mensaje con un argumento válido. Escribe **${cancelOptions.join(
				'**, **'
			)}** para cancelar la solicitud.`,
		MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: ({ tag, name, time, cancelOptions }) =>
			`${tag} | El argumento **${name}** puede aceptar multiples valores | Tienes **${time}** segundos para responder a esta solicitud con valores adicionales. Escribe **${cancelOptions.join(
				'**, **'
			)}** para cancelar la solicitud.`,
		MONITOR_COMMAND_HANDLER_ABORTED: 'Cancelado.',
		INHIBITOR_COOLDOWN: ({ remaining }) => `Acabas de usar este comando. Puedes usarlo de nuevo en ${duration(remaining)}.`,
		INHIBITOR_MISSING_BOT_PERMS: ({ missing }) => `No tengo los permisos suficientes, me faltan: ${this.list(missing, 'y')}`,
		INHIBITOR_NSFW: 'Este comando no es apto para este canal, no es un canal marcado como "NSFW"',
		INHIBITOR_PERMISSIONS: 'No tienes permisos para usar este comando',
		INHIBITOR_REQUIRED_SETTINGS: ({ settings }) =>
			`El servidor requiere ${settings.length === 1 ? 'el ajuste' : 'los ajustes'} del servidor **${settings.join(
				', '
			)}**, y por lo tanto, no puedo ejecutar el comando.`,
		INHIBITOR_RUNIN: ({ type }) => `Éste comando sólo está disponible en los canales de ${type}`,
		INHIBITOR_RUNIN_NONE: ({ name }) => `El comando ${name} no está configurado para ejecutarse en algún canal.`,
		INHIBITOR_DISABLED_GUILD: 'This command has been disabled by an admin in this guild!.',
		INHIBITOR_DISABLED_GLOBAL: 'This command has been globally disabled by the bot owner.',
		COMMAND_BLACKLIST_DESCRIPTION: 'Pone o quita usuarios and servidores de mi lista negra.',
		COMMAND_BLACKLIST_SUCCESS: ({ usersAdded, usersRemoved, guildsAdded, guildsRemoved }) =>
			[
				usersAdded.length ? `**Usuarios Añadidos**\n${codeBlock('', usersAdded.join(', '))}` : '',
				usersRemoved.length ? `**Usuarios Eliminados**\n${codeBlock('', usersRemoved.join(', '))}` : '',
				guildsAdded.length ? `**Servidores Añadidos**\n${codeBlock('', guildsAdded.join(', '))}` : '',
				guildsRemoved.length ? `**Servidores Eliminados**\n${codeBlock('', guildsRemoved.join(', '))}` : ''
			]
				.filter((val) => val !== '')
				.join('\n'),
		COMMAND_UNLOAD: ({ type, name }) => `${GREENTICK} Eliminado con éxito la pieza tipo ${type}: ${name}`,
		COMMAND_UNLOAD_DESCRIPTION: 'Elimina una pieza de Klasa.',
		COMMAND_TRANSFER_ERROR: `${REDCROSS} El archivo ya había sido transferido o nunca existió.`,
		COMMAND_TRANSFER_SUCCESS: ({ type, name }) => `${GREENTICK} Transferido con éxito la pieza tipo ${type}: ${name}`,
		COMMAND_TRANSFER_FAILED: ({ type, name }) =>
			`La transferencia de la pieza tipo ${type}: ${name} al cliente falló. Por favor revisa la consola.`,
		COMMAND_TRANSFER_DESCRIPTION: 'Transfiere una pieza interna a su carpeta respectiva.',
		COMMAND_RELOAD: ({ type, name, time }) => `${GREENTICK} Recargada la pieza tipo ${type}: ${name}. (Tomó: ${time})`,
		COMMAND_RELOAD_FAILED: ({ type, name }) => `${REDCROSS} La recarga de la pieza tipo ${type}: ${name} falló. Por favor revisa su consola.`,
		COMMAND_RELOAD_ALL: ({ type, time }) => `${GREENTICK} Recargadas todas las piezas tipo ${type}. (Tomó: ${time})`,
		COMMAND_RELOAD_EVERYTHING: ({ time }) => `${GREENTICK} Recargado todo. (Tomó: ${time})`,
		COMMAND_RELOAD_DESCRIPTION: 'Recarga una pieza de Klasa, o todas las piezas de su lista.',
		COMMAND_REBOOT: `${LOADING} Reiniciando...`,
		COMMAND_REBOOT_DESCRIPTION: 'Reinicia el bot.',
		COMMAND_PING: `${LOADING} Ping?`,
		COMMAND_PING_DESCRIPTION: 'Establece una prueba de conexión con Discord.',
		COMMAND_PINGPONG: ({ diff, ping }) => `Pong! (El viaje ida y vuelta tomó: ${diff}ms. Pulso: ${ping}ms.)`,
		COMMAND_INFO_DESCRIPTION: 'Muestra alguna información sobre mí.',
		COMMAND_HELP_DESCRIPTION: 'Muestra la ayuda para un comando o todos.',
		COMMAND_HELP_NO_EXTENDED: 'No está documentado completamente.',
		COMMAND_HELP_DM: '📥 | La lista de comandos ha sido enviada a tus mensajes privados.',
		COMMAND_HELP_NODM: `${REDCROSS} | Parece que tienes tus mensajes privados desactivados, no pude mandarte el mensaje.`,
		COMMAND_HELP_ALL_FLAG: ({ prefix }) =>
			`Mostrando una categoría por página. ¿Problemas con el mensaje? Envía \`${prefix}help --all\` para la lista de todos los comandos en tus Mensajes Directos.`,
		COMMAND_HELP_COMMAND_COUNT: ({ n }) => `${n} comando${n === 1 ? '' : 's'}`,
		COMMAND_ENABLE: ({ type, name }) => `+ Activado con éxito la pieza tipo ${type}: ${name}`,
		COMMAND_ENABLE_DESCRIPTION: 'Re-activa o activa temporalmente una pieza de Klasa. El estado por defecto es restaurado al recargar.',
		COMMAND_DISABLE: ({ type, name }) => `+ Desactivado con éxito la pieza tipo ${type}: ${name}`,
		COMMAND_DISABLE_DESCRIPTION: 'Re-desactiva o desactiva temporalmente una pieza de Klasa. El estado por defecto es restaurado al recargar.',
		COMMAND_DISABLE_WARN: 'Probablemente no quieras desactivar eso, ya que no tendrías ningún comando para re-activarlo.',
		COMMAND_CONF_NOKEY: 'Debes proveer el nombre de una clave.',
		COMMAND_CONF_NOVALUE: 'Debes proveer un valor para la clave.',
		COMMAND_CONF_GUARDED: ({ name }) => `La pieza ${toTitleCase(name)} no debería ser desactivada.`,
		COMMAND_CONF_UPDATED: ({ key, response }) => `Actualizado con éxito la clave **${key}** al valor: \`${response}\`.`,
		COMMAND_CONF_KEY_NOT_ARRAY: "Esta clave no acepta múltiples valores. Usa la acción 'reset' en su lugar.",
		COMMAND_CONF_GET_NOEXT: ({ key }) => `The key **${key}** does not seem to exist.`,
		COMMAND_CONF_GET: ({ key, value }) => `The value for the key **${key}** is: \`${value}\``,
		COMMAND_CONF_RESET: ({ key, value }) => `The key **${key}** has been reset to: \`${value}\``,
		COMMAND_CONF_NOCHANGE: ({ key }) => `The value for **${key}** was already that value.`,
		COMMAND_CONF_SERVER_DESCRIPTION: 'Define per-server settings.',
		COMMAND_CONF_SERVER: ({ key, list }) => `**Server Setting ${key}**\n${list}`,
		COMMAND_CONF_USER_DESCRIPTION: 'Define per-user settings.',
		COMMAND_CONF_USER: ({ key, list }) => `**User Setting ${key}**\n${list}`,
		COMMAND_CONF_SETTING_NOT_SET: 'No Establecido',
		MESSAGE_PROMPT_TIMEOUT: 'La solicitud no recibió ninguna respuesta a tiempo.',
		TEXT_PROMPT_ABORT_OPTIONS: ['abortar', 'parar', 'cancelar'],
		COMMAND_LOAD: ({ time, type, name }) => `${GREENTICK} Successfully loaded ${type}: ${name}. (Took: ${time})`,
		COMMAND_LOAD_FAIL: 'The file does not exist, or an error occurred while loading your file. Please check your console.',
		COMMAND_LOAD_ERROR: ({ type, name, error }) => `${REDCROSS} Failed to load ${type}: ${name}. Reason:${codeBlock('js', error)}`,
		COMMAND_LOAD_DESCRIPTION: 'Load a piece from your bot.',

		/**
		 * ################################
		 * #     COMMAND DESCRIPTIONS     #
		 * ################################
		 */

		ARGUMENT_RANGE_INVALID: ({ name }) => `${name} debe ser un número o un rango de números.`,
		ARGUMENT_RANGE_MAX: ({ name, maximum }) =>
			`El argumento ${name} acepta un rango de máximo ${maximum} ${maximum === 1 ? 'número' : 'números'}`,

		COMMAND_ADD_DESCRIPTION: 'Añade una canción a la cola.',
		COMMAND_ADD_EXTENDED: {
			extendedHelp: [
				`¡Agregue canciones a la lista de reproducción y prepárese para el concierto!
					Puedo reproducir desde YouTube, Bandcamp, SoundCloud, Twitch, Vimeo o Mixer.`,
				'- Para reproducir desde YouTube, dame algo para buscar, un enlace de video o un enlace de lista de reproducción.',
				'- Para reproducir desde SoundCloud, dame un enlace de SoundCloud, o si quieres que busque, incluya `--sc` o` --soundcloud` en su mensaje.',
				'- Para reproducir desde Mixer, escribe la URL de un streamer de Mixer, lo siento pero no puedo (todavía) reproducir VODs.',
				'- Para reproducir desde Bandcamp, Twitch o Vimeo, solo necesita escribir un enlace a un video o lista de reproducción.'
			].join('\n'),
			explainedUsage: [['song', 'La canción para incluirlo en la cola. Puede ser un enlace o el nombre de un vídeo o tema musical.']],
			examples: [
				'The Pokémon Theme song',
				'https://youtu.be/fJ9rUzIMcZQ',
				'--sc Imagine Dragons Believer',
				'https://soundcloud.com/vladkurt/imagine-dragons-beliver-vladkurt-remix',
				'https://vimeo.com/channels/music/239029778',
				'https://mixer.com/Ninja',
				'https://thedisappointed.bandcamp.com/album/escapism-2'
			],
			multiline: true
		},
		COMMAND_ADD_PLAYLIST: ({ amount }) =>
			amount === 1 ? '🎵 Añadida **una** canción a la cola 🎶' : `🎵 Añadidas **${amount}** canciones a la cola 🎶`,
		COMMAND_ADD_SONG: ({ title }) => `🎵 Añadida la canción **${title}** a la cola 🎶`,
		COMMAND_CLEAR_DESCRIPTION: 'Borra las canciones de la cola.',
		COMMAND_CLEAR_DENIED: '¡No puedes ejecutar este comando mientras que hayan más de 4 usuarios! ¡Debes ser el Dj de esta fiesta!',
		COMMAND_CLEAR_SUCCESS: ({ amount }) =>
			amount === 1 ? '🗑 Una canción fue borrada de la cola.' : `🗑 ${amount} canciones fueron borradas de la cola.`,
		COMMAND_JOIN_DESCRIPTION: 'Unirse al canal de voz del autor del mensaje.',
		COMMAND_JOIN_NO_MEMBER:
			'Lo siento, pero Discord no me ha mandado la información necesaria que necesito para saber en qué canal de voz estás conectado/a...',
		COMMAND_JOIN_NO_VOICECHANNEL: 'No estás conectado/a a un canal de voz.',
		COMMAND_JOIN_SUCCESS: ({ channel }) => `Me he conectado con éxito al canal de voz ${channel}`,
		COMMAND_JOIN_VOICE_DIFFERENT: 'Lo siento, pero estoy reproduciendo música en otro canal de voz. ¡Intenta de nuevo más tarde o únete a ellos!',
		COMMAND_JOIN_VOICE_FULL: 'No puedo unirme a tu canal de voz, está lleno... ¡echa a alguien con las botas o haz espacio para mí!',
		COMMAND_JOIN_VOICE_NO_CONNECT:
			'No tengo suficientes permisos para unirme a tu canal de voz, necesito el permiso para conectarme a canales de voz.',
		COMMAND_JOIN_VOICE_NO_SPEAK: 'Puedo conectarme... pero no hablar. Por favor dame permisos para hablar.',
		COMMAND_JOIN_VOICE_SAME: '¡Sube el volumen! ¡Ya estoy reproduciendo música ahí!',
		COMMAND_JOIN_FAILED: `${REDCROSS} I could not join your voice channel because there is something wrong with my music player. Please join the support server by using \`@Skyra support\` and alert my developers.`,
		COMMAND_LEAVE_DESCRIPTION: 'Desconecta del canal de voz.',
		COMMAND_LEAVE_EXTENDED: {
			extendedHelp: `Use este comando para que Skyra deje el canal de voz actual.
			Por defecto, dejaré el canal, me olvidaré de la canción que se está reproduciendo actualmente,
			ero dejaré la cola intacta. Esto significa que una vez que hagas Skyra, \`play\`
			después del comando de salida, continuaré tocando con la primera canción que estaba en la cola antes de irme.

			Este comportamiento predeterminado se puede modificar con banderas:
			\`--removeall\` o \`--ra\` para seguir el comportamiento predeterminado, así como borrar la cola, la próxima vez que quieras que comience a jugar tendrás que crear una nueva cola`,
			examples: ['leave', 'leave --removeall', 'leave --ra', 'leave --soft'],
			multiline: true
		},
		COMMAND_LEAVE_SUCCESS: ({ channel }) => `Me he desconectado con éxito del canal de voz ${channel}`,
		COMMAND_PAUSE_DESCRIPTION: 'Pausa la canción actual.',
		COMMAND_PAUSE_SUCCESS: '⏸ Pausado.',
		COMMAND_PLAY_DESCRIPTION: '¡Empecemos la cola!',
		COMMAND_PLAY_EXTENDED: {
			extendedHelp: [
				`Ponga música en cola y permítame comenzar a improvisar para su disfrute.
				Cuando use este comando, me uniré automáticamente a su canal de voz y comenzaré a reproducir la primera canción en la cola.
					Puedo reproducir desde YouTube, Bandcamp, SoundCloud, Twitch, Vimeo o Mixer.`,
				'- Para reproducir desde YouTube, dame algo para buscar, un enlace de video o un enlace de lista de reproducción.',
				'- Para reproducir desde SoundCloud, dame un enlace de SoundCloud, o si quieres que busque, incluya `--sc` o` --soundcloud` en su mensaje.',
				'- Para reproducir desde Mixer, escribe la URL de un streamer de Mixer, lo siento pero no puedo (todavía) reproducir VODs.',
				'- Para reproducir desde Bandcamp, Twitch o Vimeo, solo necesita escribir un enlace a un video o lista de reproducción.'
			].join('\n'),
			explainedUsage: [['song', 'La canción para incluirlo en la cola. Puede ser un enlace o el nombre de un vídeo o tema musical.']],
			examples: [
				'The Pokémon Theme song',
				'https://youtu.be/fJ9rUzIMcZQ',
				'--sc Imagine Dragons Believer',
				'https://soundcloud.com/vladkurt/imagine-dragons-beliver-vladkurt-remix',
				'https://vimeo.com/channels/music/239029778',
				'https://mixer.com/Ninja',
				'https://thedisappointed.bandcamp.com/album/escapism-2'
			],
			reminder: 'Before you can use this command you should join a voice channel!',
			multiline: true
		},
		COMMAND_PLAY_END: '⏹ Del 1 al 10, siendo 1 la peor puntuación y 10 la mejor, ¿cómo valorarías la sesión? ¡Ya ha terminado!',
		COMMAND_PLAY_NEXT: ({ title, requester }) => `🎧 Reproduciendo: **${title}**, pedida por: **${requester}**`,
		COMMAND_PLAY_QUEUE_PAUSED: ({ song }) => `¡Había una canción pausada! ¡Reproduciéndolo ahora! Ahora reproduciendo: ${song}!`,
		COMMAND_PLAY_QUEUE_PLAYING: '¡Ey! ¡El disco ya está girando!',
		COMMAND_PLAY_QUEUE_EMPTY:
			'The session is over, add some songs to the queue, you can for example do `Skyra, add Imperial March`, and... *dumbrolls*!',
		COMMAND_PLAYING_DESCRIPTION: 'Obtén información de la canción actual.',
		COMMAND_PLAYING_DURATION: ({ duration }) => `**Duración**: ${duration}`,
		COMMAND_PLAYING_QUEUE_EMPTY: '¿Es conmigo? Porque no hay nada en reproducción...',
		COMMAND_PLAYING_QUEUE_NOT_PLAYING: 'Creo que estás escuchando ruido de fondo, no estoy reproduciendo nada.',
		COMMAND_REPEAT_DESCRIPTION: 'Se alterna repitiendo la canción actual.',
		COMMAND_REPEAT_SUCCESS: ({ enabled }) =>
			enabled
				? "This is your JAM isn't it? No te preocupes, repetiremos esto una y otra vez!"
				: 'En realidad, también me estaba cansando de esto, pero no quería decir nada.',
		COMMAND_QUEUE_DESCRIPTION: 'Check the queue list.',
		COMMAND_QUEUE_LAST: 'There are no more songs! After the one playing is over, the session will end!',
		COMMAND_QUEUE_TITLE: ({ guildname }) => `Music queue for ${guildname}`,
		COMMAND_QUEUE_LINE: ({ position, duration, title, url, requester }) =>
			`**[\`${position}\`]** │ \`${duration}\` │ [${title}](${url}) │ Requester: **${requester}**.`,
		COMMAND_QUEUE_NOWPLAYING: ({ duration, title, url, requester, timeRemaining }) =>
			[
				duration ? `\`${duration}\`` : 'Live Stream',
				`[${title}](${url})`,
				`Requester: **${requester}**`,
				timeRemaining ? `🕰 Tiempo restante: ${timeRemaining}.` : null
			]
				.filter(Boolean)
				.join(' | '),
		COMMAND_QUEUE_NOWPLAYING_TITLE: 'Now Playing:',
		COMMAND_QUEUE_TOTAL_TITLE: 'Total songs:',
		COMMAND_QUEUE_TOTAL: ({ songs, remainingTime }) =>
			`${songs} song${songs === 1 ? '' : 's'} in the queue, with a total duration of ${remainingTime}`,
		COMMAND_QUEUE_EMPTY: 'parece que nada se está reproduciendo en este momento y la cola está vacía, ¿por qué no inicias el disco?',
		COMMAND_QUEUE_DASHBOARD_INFO: ({ guild }) =>
			`¿Sabías que también puedes administrar tu música usando una aplicación web elegante? [Haga clic aquí para ir allí](https://skyra.pw/music/${guild.id})`,
		COMMAND_REMOVE_DESCRIPTION: 'Elimina una canción de la lista de cola.',
		COMMAND_REMOVE_INDEX_INVALID: 'mira, no soy una experta en mates, pero esperaba un número igual o mayor que 1...',
		COMMAND_REMOVE_INDEX_OUT: ({ amount }) =>
			`he intentado acceder a esa canción por tí, ¡pero sólo tengo ${amount} ${amount === 1 ? 'canción' : 'canciones'} en mi mesa!`,
		COMMAND_REMOVE_DENIED: [
			'Lo veo un poco rudo el borrar la canción de alguien de la lista... Habla con ellos para quitarla o',
			'grita al DJ si hay uno en este servidor, si la canción arruina la fiesta, ¡entonces ellos probablemente lo consideren!'
		].join(' '),
		COMMAND_REMOVE_SUCCESS: ({ song }) => `🗑 Borrada la canción **${song.safeTitle}**, pedida por <@${song.requester}>, de la cola.`,
		COMMAND_SEEK_DESCRIPTION: 'Change the player time for the current song.',
		COMMAND_SEEK_SUCCESS: ({ time }) => `${GREENTICK} Successfully changed the time! Now at ${duration(time)}!`,
		COMMAND_RESUME_DESCRIPTION: 'Reanuda la canción actual.',
		COMMAND_RESUME_SUCCESS: '▶ Reanudado.',
		COMMAND_ROLESET_DESCRIPTION: 'Gestionar conjuntos de roles únicos.',
		COMMAND_ROLESET_EXTENDED: {
			extendedHelp: `A role set is a group of roles Skyra identifies as unique for all members in the server, i.e. a roleset named "region" could have the roles \`Africa\`, \`America\`, \`Asia\`, and \`Europe\`, and members will only be able to have one of them. This is like a kind of "rule" that is applied in the three following situations:

					- When somebody claims a role via the \`Skyra, roles\`.
					- When somebody claims a role via reaction roles.
					- When somebody receives a role either manually or from another bot.`,
			explainedUsage: [
				['add', 'Create a new roleset or add a role to an existing one.'],
				['remove', 'Remove a role from an existing roleset.'],
				['reset', 'Removes all roles from a roleset or, if not specified, all existing rolesets.'],
				['list', 'Lists all rolesets.'],
				['auto', 'Adds or removes a roleset.']
			],
			examples: [
				'add regions America',
				'add regions Africa America Asia Europe',
				'remove regions America',
				'reset',
				'reset regions',
				'list',
				'regions America',
				'regions Africa America Asia Europe'
			],
			reminder: 'This command can add and/or remove multiple roles at the same time.',
			multiline: true
		},
		COMMAND_ROLESET_CREATED: ({ name, roles }) => `El conjunto de roles único ${name} se ha creado con los siguientes roles: ${roles}`,
		COMMAND_ROLESET_ADDED: ({ name, roles }) => `El conjunto de roles único ${name} ahora también tiene los siguientes roles: ${roles}.`,
		COMMAND_ROLESET_INVALID_NAME: ({ name }) => `No puede eliminar el conjunto de roles único ${name} porque no existe.`,
		COMMAND_ROLESET_REMOVED: ({ name, roles }) => `El conjunto de roles único ${name} ya no incluirá los siguientes roles:${roles}`,
		COMMAND_ROLESET_RESET_EMPTY: `${REDCROSS} There are no rolesets configured in this groupo.`,
		COMMAND_ROLESET_RESET_ALL: `${GREENTICK} Successfully removed all rolesets.`,
		COMMAND_ROLESET_RESET_NOT_EXISTS: ({ name }) => `${REDCROSS} The roleset \`${name}\` does not exist in this server.`,
		COMMAND_ROLESET_RESET_GROUP: ({ name }) => `${GREENTICK} Successfully removed the roleset \`${name}\` from this server.`,
		COMMAND_ROLESET_UPDATED: ({ name }) => `El conjunto de roles único ${name} se ha actualizado.`,
		COMMAND_ROLESET_NO_ROLESETS: 'No tienes conjuntos de roles.',
		COMMAND_SHUFFLE_DESCRIPTION: 'Aleatoriza el orden de las canciones en la cola.',
		COMMAND_SHUFFLE_SUCCESS: ({ amount }) => `${GREENTICK} Canciones aleatorias exitosas de ${amount}.`,
		COMMAND_SKIP_DESCRIPTION: 'Salta la canción actual.',
		COMMAND_SKIP_PERMISSIONS: 'No puedes ejecutar este comando, debes ser un DJ o un Moderador.',
		COMMAND_SKIP_VOTES_VOTED: 'Ya has votado para saltar esta canción.',
		COMMAND_SKIP_VOTES_TOTAL: ({ amount, needed }) => `🔸 | Votos: ${amount} de ${needed}`,
		COMMAND_SKIP_SUCCESS: ({ title }) => `⏭ Saltada la canción ${title}.`,
		COMMAND_PLAYING_TIME_DESCRIPTION: 'Revisa cuánto tiempo falta para terminar la canción.',
		COMMAND_PLAYING_TIME_QUEUE_EMPTY: '¿Es conmigo? La cola está vacía...',
		COMMAND_PROMOTE_DESCRIPTION: 'Promociona una canción al frente de la fila',
		COMMAND_PROMOTE_EXTENDED: {
			explainedUsage: [['number', 'El índice en la cola para ascender al frente. Usa `Skyra, queue` para encontrar el índice de una canción']],
			examples: ['5'],
			reminder: 'Este comando requiere que seas DJ o moderador para usarlo'
		},
		COMMAND_PROMOTE_SUCCESS: ({ song }) => `${GREENTICK} **${song.safeTitle}** (${song}) promovido con éxito a la parte superior de la cola`,
		COMMAND_VOLUME_DESCRIPTION: 'Controla el volumen para la canción.',
		COMMAND_VOLUME_SUCCESS: ({ volume }) => `📢 Volumen: ${volume}%`,
		COMMAND_VOLUME_CHANGED: ({ emoji, volume }) => `${emoji} Volumen ajustado a: ${volume}%`,
		COMMAND_VOLUME_CHANGED_EXTREME: ({ emoji, text, volume }) => `${emoji} ${text} ajustado a: ${volume}%`,
		COMMAND_VOLUME_CHANGED_TEXTS: createPick([
			'**VOLUMEN EXTREMO**',
			'**VOLUMEN TIPO NACELLE DE AVIÓN**',
			'**VOLUMEN TIPO LANZAMIENTO DE FALCON HEAVY**'
		]),

		INHIBITOR_MUSIC_QUEUE_EMPTY: `${REDCROSS} ¡La cola está sin discos! ¡Añade algunas canciones así podemos empezar una fiesta!`,
		INHIBITOR_MUSIC_NOT_PLAYING: `${REDCROSS} Hmm, no parece que esté jugando nada ahora.`,
		INHIBITOR_MUSIC_PAUSED: `${REDCROSS} ¡El disco ya está girando y la fiesta está en marcha hasta que termine la noche!`,
		INHIBITOR_MUSIC_DJ_MEMBER: `${REDCROSS} ¡Creo que esto es algo que sólo un moderador o un administrador de la fiesta pueden hacer!`,
		INHIBITOR_MUSIC_USER_VOICE_CHANNEL: `${REDCROSS} ¡Ey! Necesito que te unas a un canal de voz antes para usar este comando!`,
		INHIBITOR_MUSIC_BOT_VOICE_CHANNEL: `${REDCROSS} Temo que necesito estar en un canal de voz antes de poder usar este comando, ¡por favor muéstreme el camino!`,
		INHIBITOR_MUSIC_BOTH_VOICE_CHANNEL: `${REDCROSS} ¡Hey! Parece que no estamos en el mismo canal de voz, ¡por favor únete conmigo!`,
		INHIBITOR_MUSIC_NOTHING_PLAYING: `${REDCROSS} Parece que no hay nada en este momento, ¿qué tal si comienzas la fiesta 🎉?`,

		MUSICMANAGER_FETCH_NO_ARGUMENTS: '¡Necesito que me des el nombre de una canción!',
		MUSICMANAGER_FETCH_NO_MATCHES: 'Lo siento, ¡pero no he sido capaz de encontrar la canción que querías',
		MUSICMANAGER_FETCH_LOAD_FAILED: 'Lo siento, ¡pero no he podido cargar esta canción! Por si acaso, ¡intenta con otra canción!',
		MUSICMANAGER_TOO_MANY_SONGS: `${REDCROSS} ¡Ah, estás agregando más canciones de las permitidas!`,
		MUSICMANAGER_SETVOLUME_SILENT: 'Woah, ¡podrías simplemente salir del canal de voz si quieres silencio!',
		MUSICMANAGER_SETVOLUME_LOUD: 'Seré honesta, ¡las turbinas de un avión serían menos ruidosos que esto!',
		MUSICMANAGER_PLAY_NO_SONGS: '¡No hay más canciones en la cola!',
		MUSICMANAGER_PLAY_PLAYING: 'Los discos están girando, ¿no los escuchas?',
		MUSICMANAGER_STUCK: ({ milliseconds }) =>
			`${LOADING} Espera un momento, he tenido un pequeño problema. ¡Estaré de vuelta en: ${duration(milliseconds)}!`,

		COMMAND_CONF_MENU_NOPERMISSIONS: `I need the permissions ${PERMS.ADD_REACTIONS} and ${PERMS.MANAGE_MESSAGES} to be able to run the menu.`,
		COMMAND_CONF_MENU_RENDER_AT_FOLDER: ({ path }) => `Currently at: 📁 ${path}`,
		COMMAND_CONF_MENU_RENDER_AT_PIECE: ({ path }) => `Currently at: ⚙️ ${path}`,
		COMMAND_CONF_MENU_RENDER_NOKEYS: 'There are no configurable keys for this folder',
		COMMAND_CONF_MENU_RENDER_SELECT: 'Please select any of the following entries',
		COMMAND_CONF_MENU_RENDER_TCTITLE: 'Text Commands:',
		COMMAND_CONF_MENU_RENDER_UPDATE: '• Update Value → `set <value>`',
		COMMAND_CONF_MENU_RENDER_REMOVE: '• Remove Value → `remove <value>`',
		COMMAND_CONF_MENU_RENDER_RESET: '• Reset Value → `reset`',
		COMMAND_CONF_MENU_RENDER_UNDO: '• Undo Update → `undo`',
		COMMAND_CONF_MENU_RENDER_CVALUE: ({ value }) => `Current Value: **\`\`${value}\`\`**`,
		COMMAND_CONF_MENU_RENDER_BACK: 'Press ◀ to go back',
		COMMAND_CONF_MENU_INVALID_KEY: 'Invalid Key, please try again with any of the following options.',
		COMMAND_CONF_MENU_INVALID_ACTION: 'Invalid Action, please try again with any of the following options.',
		COMMAND_CONF_MENU_SAVED: 'Successfully saved all changes.',

		SETTINGS_PREFIX:
			'A prefix is an affix that is added in front of the word, in this case, the message. It allows bots to distinguish between a regular message and a command.',
		SETTINGS_LANGUAGE: 'The language I will use for your server. It may not be available in the language you want.',
		SETTINGS_DISABLENATURALPREFIX: 'Whether or not I should listen for my natural prefix, `Skyra,`',
		SETTINGS_DISABLEDCOMMANDS:
			'The disabled commands, core commands may not be disabled, and moderators will override this. All commands must be in lower case.',
		SETTINGS_CHANNELS_ANNOUNCEMENTS:
			'The channel for announcements, in pair with the key `roles.subscriber`, they are required for the announce command.',
		SETTINGS_CHANNELS_FAREWELL:
			'The channel I will use to send farewells, you must enable the events and set up the messages, in other categories.',
		SETTINGS_CHANNELS_GREETING:
			'The channel I will use to send greetings, you must enable the events and set up the messages, in other categories.',
		SETTINGS_CHANNELS_IMAGE_LOGS: 'The channel I will use to re-upload all images I see.',
		SETTINGS_CHANNELS_MEMBER_LOGS:
			'The channel for member logs, you must enable the events (`events.memberAdd` for new members, `events.memberRemove` for members who left).',
		SETTINGS_CHANNELS_MESSAGE_LOGS:
			'The channel for (non-NSFW) message logs, you must enable the events (`events.messageDelete` for deleted messages, `events.messageEdit` for edited messages).',
		SETTINGS_CHANNELS_MODERATION_LOGS:
			'The channel for moderation logs, once enabled, I will post all my moderation cases there. If `events.banRemove` and/or `events.banRemove` are enabled, I will automatically post anonymous logs.',
		SETTINGS_CHANNELS_NSFW_MESSAGE_LOGS:
			'The channel for NSFW message logs, same requirement as normal message logs, but will only send NSFW messages.',
		SETTINGS_CHANNELS_PRUNE_LOGS: 'The channel for prune logs, same requirement as normal mesasge logs, but will only send prune messages.',
		SETTINGS_CHANNELS_REACTION_LOGS:
			"The channel for the reaction logs, same requirement as normal message logs, but will only send message reactions. If you don't want twemojis to be logged you can toggle `events.twemoji-reactions`.",
		SETTINGS_CHANNELS_ROLES: 'The channel for the reaction roles.',
		SETTINGS_CHANNELS_SPAM: 'The channel for me to redirect users to when they use commands I consider spammy.',
		SETTINGS_CHANNELS_IGNORE_MESSAGE_DELETE: 'Channels I should ignore when checking for deleted messages to log.',
		SETTINGS_CHANNELS_IGNORE_MESSAGE_EDIT: 'Channels I should ignore when checking for edited messags to log.',
		SETTINGS_CHANNELS_IGNORE_REACTION_ADD: 'Channels I should ignore when checking for added reactions.',
		SETTINGS_CHANNELS_IGNORE_ALL: 'Channels I should ignore for all types of logging.',
		SETTINGS_DISABLEDCHANNELS:
			'A list of channels for disabled commands, for example, setting up a channel called general will forbid all users from using my commands there. Moderators+ override this purposedly to allow them to moderate without switching channels.',
		SETTINGS_EVENTS_BANADD: 'This event posts anonymous moderation logs when a user gets banned. You must set up `channels.moderation-logs`.',
		SETTINGS_EVENTS_BANREMOVE:
			'This event posts anonymous moderation logs when a user gets unbanned. You must set up `channels.moderation-logs`.',
		SETTINGS_EVENTS_MEMBERADD: 'This event posts member logs when a user joins. They will be posted in `channels.member-logs`.',
		SETTINGS_EVENTS_MEMBERNAMEUPDATE: 'Whether member nickname updates should be logged or not.',
		SETTINGS_EVENTS_MEMBERREMOVE: 'This event posts member logs when a user leaves. They will be posted in `channels.member-logs`.',
		SETTINGS_EVENTS_MESSAGEDELETE:
			'This event posts message logs when a message is deleted. They will be posted in `channels.message-logs` (or `channel.nsfw-message-logs` in case of NSFW channels).',
		SETTINGS_EVENTS_MESSAGEEDIT:
			'This event posts message logs when a message is edited. They will be posted in `channels.message-logs` (or `channel.nsfw-message-logs` in case of NSFW channels).',
		SETTINGS_EVENTS_TWEMOJI_REACTIONS: 'Whether or not twemoji reactions are posted in the reaction logs channel.',
		SETTINGS_MESSAGES_FAREWELL: 'The message I shall send to when a user leaves. You must set up `channels.farewell` and `events.memberRemove`',
		SETTINGS_MESSAGES_GREETING: 'The message I shall send to when a user joins. You must set up `channels.greeting` and `events.memberAdd`',
		SETTINGS_MESSAGES_IGNORECHANNELS: 'The channels configured to not increase the point counter for users.',
		SETTINGS_MESSAGES_JOIN_DM: 'The message I shall send to when a user joins in DMs.',
		SETTINGS_MESSAGES_MODERATION_AUTO_DELETE: 'Whether or not moderation commands should be auto-deleted or not.',
		SETTINGS_MESSAGES_MODERATION_DM: 'Whether or not I should send a direct message to the target user on moderation actions.',
		SETTINGS_MESSAGES_MODERATION_MESSAGE_DISPLAY: 'Whether or not a response should be sent for moderation commands.',
		SETTINGS_MESSAGES_MODERATION_REASON_DISPLAY: 'Whether the reason will be displayed in moderation commands.',
		SETTINGS_MESSAGES_MODERATOR_NAME_DISPLAY:
			'Whether or not I should display the name of the moderator who took the action whne sending the target user a moderation message. Requires `messages.moderation-dm` to be enabled.',
		SETTINGS_MESSAGES_WARNINGS: 'Whether or not I should send warnings to the user when they receive one.',
		SETTINGS_MESSAGES_ANNOUNCEMENT_EMBED: 'Whether to send announcements in embeds or not',
		SETTINGS_MUSIC_ALLOW_STREAMS: 'Whether livestreams should be allowed to be played.',
		SETTINGS_MUSIC_DEFAULT_VOLUME: 'The default music volume to start playing at for this server.',
		SETTINGS_MUSIC_MAXIMUM_DURATION: 'The maximum length any playable single track can have.',
		SETTINGS_MUSIC_MAXIMUM_ENTRIES_PER_USER: 'The maximum amount of entries one user can have in the queue.',
		SETTINGS_NO_MENTION_SPAM_ALERTS: 'Whether or not users should be alerted when they are about to get the ban hammer.',
		SETTINGS_NO_MENTION_SPAM_ENABLED: 'Whether or not I should have the ban hammer ready for mention spammers.',
		SETTINGS_NO_MENTION_SPAM_MENTIONSALLOWED:
			'The minimum amount of "points" a user must accumulate before landing the hammer. A user mention will count as 1 point, a role mention as 2 points, and an everyone/here mention as 5 points.',
		SETTINGS_NO_MENTION_SPAM_TIMEPERIOD:
			'The amount of time in seconds in which the mention bucket should refresh. For example, if this is set to `8` and you mentioned two users 7 seconds apart, the bucket would run from start with the accumulated amount of points.',
		SETTINGS_ROLES_ADMIN: `The administrator role, their priviledges in Skyra will be upon moderative, covering management. Defaults to anyone with the ${PERMS.MANAGE_GUILD} permission.`,
		SETTINGS_ROLES_DJ: "The DJ role for this server. DJs have more advanced control over Skyra's music commands.",
		SETTINGS_ROLES_INITIAL: 'The initial role, if configured, I will give it to users as soon as they join.',
		SETTINGS_ROLES_MODERATOR:
			'The moderator role, their priviledges will cover almost all moderation commands. Defaults to anyone who can ban members.',
		SETTINGS_ROLES_MUTED:
			'The muted role, if configured, I will give new muted users this role. Otherwise I will prompt you the creation of one.',
		SETTINGS_ROLES_PUBLIC: 'The public roles, they will be given with no cost to any user using the `roles` command.',
		SETTINGS_ROLES_REMOVEINITIAL: 'Whether the claim of a public role should remove the initial one too.',
		SETTINGS_ROLES_RESTRICTED_ATTACHMENT: 'The role that is used for the restrictAttachment moderation command',
		SETTINGS_ROLES_RESTRICTED_EMBED: 'The role that is used for the restrictEmbed moderation command.',
		SETTINGS_ROLES_RESTRICTED_EMOJI: 'The role that is used for the restrictEmoji moderation command.',
		SETTINGS_ROLES_RESTRICTED_REACTION: 'The role that is used for the restrictReaction moderation command.',
		SETTINGS_ROLES_RESTRICTED_VOICE: 'The role that is used for the restrictVoice moderation command.',
		SETTINGS_ROLES_SUBSCRIBER:
			'The subscriber role, this role will be mentioned every time you use the `announce` command. I will always keep it non-mentionable so people do not abuse mentions.',
		SETTINGS_SELFMOD_ATTACHMENT: 'Whether or not the attachment filter is enabled.',
		SETTINGS_SELFMOD_ATTACHMENTMAXIMUM:
			'The amount of attachments a user can send within the specified duration defined at `selfmod.attachmentDuration`.',
		SETTINGS_SELFMOD_CAPITALS_ENABLED: 'Whether the capitals filter selfmod sub-system is enabled or not.',
		SETTINGS_SELFMOD_CAPITALS_IGNOREDCHANNELS: 'The channels that will be ignored by the capitals filter sub-system',
		SETTINGS_SELFMOD_CAPITALS_IGNOREDROLES: 'The roles that will be ignored by the capitals afilters sub-system',
		SETTINGS_SELFMOD_CAPITALS_MAXIMUM:
			'The maximum amount of characters the messages must have before trying to delete it. You must enable it with the `capitalsMode` command.',
		SETTINGS_SELFMOD_CAPITALS_MINIMUM:
			'The minimum amount of characters the message must have before trying to delete it. You must enable it with the `capitalsMode` command.',
		SETTINGS_SELFMOD_FILTER_ENABLED: 'Whether the word filter selfmod sub-system is enabled or not.',
		SETTINGS_SELFMOD_FILTER_IGNOREDCHANNELS: 'The channels that will be ignored by the filters sub-system',
		SETTINGS_SELFMOD_FILTER_IGNOREDROLES: 'The roles that will be ignored by the filters sub-system',
		SETTINGS_SELFMOD_IGNORECHANNELS:
			'The channels I will ignore, be careful any channel configured will have all auto-moderation systems (CapsFilter, InviteLinks, and NoMentionSpam) deactivated.',
		SETTINGS_SELFMOD_INVITES_ENABLED: 'Whether the invites filter selfmod sub-system is enabled or not.',
		SETTINGS_SELFMOD_INVITES_IGNOREDCHANNELS: 'The channels that will be ignored by the invites sub-system',
		SETTINGS_SELFMOD_INVITES_IGNOREDROLES: 'The roles that will be ignored by the invites sub-system',
		SETTINGS_SELFMOD_INVITES_IGNOREDCODES: 'The Discord invite codes that will be ignored by the invites sub-system',
		SETTINGS_SELFMOD_INVITES_IGNOREDGUILDS: 'The Discord servers that will be ignored by the invites sub-system',
		SETTINGS_SELFMOD_LINKS_ENABLED: 'Whether the links filter selfmod sub-system is enabled or not.',
		SETTINGS_SELFMOD_LINKS_IGNOREDCHANNELS: 'The channels that will be ignored by the links filter sub-system',
		SETTINGS_SELFMOD_LINKS_IGNOREDROLES: 'The roles that will be ignored by the links filters sub-system',
		SETTINGS_SELFMOD_LINKS_WHITELIST: 'The whitelisted links that are allowed',
		SETTINGS_SELFMOD_MESSAGES_ENABLED: 'Whether Skyra should attempt to remove duplicated messages or not.',
		SETTINGS_SELFMOD_MESSAGES_IGNOREDCHANNELS: 'The channels that will be ignored by the duplicate messages sub-system',
		SETTINGS_SELFMOD_MESSAGES_IGNOREDROLES: 'The roles that will be ignored by the duplicate messages sub-system',
		SETTINGS_SELFMOD_MESSAGES_MAXIMUM:
			'The amount of duplicated messages required in the queue before taking action The queue size is configurable in `selfmod.messages.queue-size`.',
		SETTINGS_SELFMOD_MESSAGES_QUEUE_SIZE: 'The amount of messages Skyra will keep track of for the message duplication detection.',
		SETTINGS_SELFMOD_NEWLINES_ENABLED: 'Whether the new lines filter selfmod sub-system is enabled or not.',
		SETTINGS_SELFMOD_NEWLINES_IGNOREDCHANNELS: 'The channels that will be ignored by the new lines sub-system',
		SETTINGS_SELFMOD_NEWLINES_IGNOREDROLES: 'The roles that will be ignored by the new lines sub-system',
		SETTINGS_SELFMOD_NEWLINES_MAXIMUM: 'The maximum amount of new lines before Skyra will start applying penalties',
		SETTINGS_SELFMOD_RAID: 'Whether or not I should kick users when they try to raid the server.',
		SETTINGS_SELFMOD_RAIDTHRESHOLD:
			'The minimum amount of users joined on the last 20 seconds required before starting to kick them and anybody else who joins until a minute cooldown or forced cooldown (using the `raid` command to manage this).',
		SETTINGS_SELFMOD_REACTIONS_MAXIMUM: 'The maximum amount of reactions before I will start applying penalties',
		SETTINGS_SELFMOD_REACTIONS_BLACKLIST: 'The reactions that are blacklisted',
		SETTINGS_SELFMOD_REACTIONS_ENABLED: 'Whether the reactions filter selfmod sub-system is enabled or not.',
		SETTINGS_SELFMOD_REACTIONS_IGNOREDCHANNELS: 'The channels that will be ignored by the reactions sub-system',
		SETTINGS_SELFMOD_REACTIONS_IGNOREDROLES: 'The roles that will be ignored by the reactons sub-system',
		SETTINGS_SELFMOD_REACTIONS_WHITELIST: 'The reactions that are whitelisted',
		SETTINGS_SOCIAL_ENABLED: 'Whether the social module should be enabled or not',
		SETTINGS_SOCIAL_MULTIPLIER: 'The multiplier to apply to the gain of points for users',
		SETTINGS_SOCIAL_ACHIEVE: 'Whether or not I should congratulate people who get a new leveled role.',
		SETTINGS_SOCIAL_ACHIEVEMESSAGE:
			'The congratulation message for people when they get a new leveled role. Requires `social.achieve` to be enabled.',
		SETTINGS_SOCIAL_IGNORECHANNELS: 'The channels I should ignore when adding points.',
		SETTINGS_STARBOARD_CHANNEL:
			'The starboard channel. If you star a message, it will be posted there. Using the `setStarboardEmoji` command allows the emoji customization.',
		SETTINGS_STARBOARD_IGNORECHANNELS: 'The channels I should ignore when listening for new stars.',
		SETTINGS_STARBOARD_MINIMUM: 'The minimum amount of stars required before a message is posted to the starboard channel.',
		SETTINGS_SUGGESTIONS_CHANNEL: 'El canal donde se enviarán las sugerencias.',
		SETTINGS_SUGGESTIONS_EMOJIS_UPVOTE: 'El emoji utilizado para votar a favor en las reacciones de las sugerencias.',
		SETTINGS_SUGGESTIONS_EMOJIS_DOWNVOTE: 'El emoji utilizado para votar en contra en las reacciones de las sugerencias.',
		SETTINGS_SUGGESTIONS_ON_ACTION_DM:
			'Si esta opción está habilitada, enviaré un mensaje directo al autor de la sugerencia cada vez que ésta se modifique.',
		SETTINGS_SUGGESTIONS_ON_ACTION_REPOST:
			'Si esta opción está habilitada, volveré a publicar el mensaje de la sugerencia cada vez que se ésta se modifique. En caso opuesto editaré el mensaje original.',
		SETTINGS_SUGGESTIONS_ON_ACTION_HIDE_AUTHOR:
			'Esta configuración le permite actualizar recomendaciónes anónimamente. Sustituirá el nombre del editor con `Un administrador` o` Un moderador`, de acuerdo con su nivel de permisos.',

		/**
		 * ################
		 * ANIMALS COMMANDS
		 */

		COMMAND_CATFACT_DESCRIPTION: 'Let me tell you a mysterious cat fact.',
		COMMAND_CATFACT_EXTENDED: {
			extendedHelp: `Do **you** know cats are very curious, right? They certainly have a lot of fun and weird facts.
				This command queries catfact.ninja and retrieves a fact so you can read it.`
		},
		COMMAND_DOG_DESCRIPTION: 'Cute doggos! ❤',
		COMMAND_DOG_EXTENDED: {
			extendedHelp: `Do **you** know how cute dogs are? They are so beautiful! This command uses a tiny selection of images
					From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
					some images that, sadly, got deleted and I cannot retrieve them 💔.`
		},
		COMMAND_FOX_DESCRIPTION: 'Let me show you an image of a fox!',
		COMMAND_FOX_EXTENDED: {
			extendedHelp: `This command provides you a random image from PixaBay, always showing 'fox' results. However,
				it may not be exactly accurate and show you other kinds of foxes.`
		},
		COMMAND_KITTY_DESCRIPTION: 'KITTENS!',
		COMMAND_KITTY_EXTENDED: {
			extendedHelp: `Do **you** know how cute are kittens? They are so beautiful! This command uses a tiny selection of images
				From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are
				some images that, sadly, got deleted and I cannot retrieve them 💔.`
		},
		COMMAND_SHIBE_DESCRIPTION: 'Cute shibes!',
		COMMAND_SHIBE_EXTENDED: {
			extendedHelp: "Everyone loves shibes, I shall love them aswell! They're so adorable ❤."
		},

		/**
		 * ##############
		 * ANIME COMMANDS
		 */

		COMMAND_ANIME_DESCRIPTION: 'Search your favourite anime by title with this command.',
		COMMAND_ANIME_EXTENDED: {
			extendedHelp: 'This command queries Kitsu.io to show data for the anime you request.',
			explainedUsage: [['query', "The anime's name you are looking for."]],
			examples: ['One Piece']
		},
		COMMAND_MANGA_DESCRIPTION: 'Search your favourite manga by title with this command.',
		COMMAND_MANGA_EXTENDED: {
			extendedHelp: 'This command queries Kitsu.io to show data for the manga you request.',
			explainedUsage: [['query', "The manga's name you are looking for."]],
			examples: ['Stone Ocean', 'One Piece']
		},
		COMMAND_WAIFU_DESCRIPTION: 'Posts a randomly generated waifu image.',
		COMMAND_WAIFU_EXTENDED: {
			extendedHelp: 'This commands posts a random waifu generated by <https://www.thiswaifudoesnotexist.net/>'
		},

		/**
		 * #####################
		 * ANNOUNCEMENT COMMANDS
		 */

		COMMAND_ANNOUNCEMENT_DESCRIPTION: 'Send new announcements, mentioning the announcement role.',
		COMMAND_ANNOUNCEMENT_EXTENDED: {
			extendedHelp: [
				`This command requires an announcement channel (**channels.announcement** in the configuration command)
					which tells Skyra where she should post the announcement messages.`,
				'',
				`Question is, is this command needed? Well, nothing stops you from making your announcements by yourself, however, there are many people who hate
					being mentioned by at everyone/here.`,
				'',
				`To avoid this, Skyra gives you the option of creating a subscriber role,
					which is unmentionable (to avoid people spam mentioning the role), and once you run this command,
					Skyra will set the role to be mentionable, post the message, and back to unmentionable.`,
				'',
				`Furthermore, you can configure Skyra to send the announcement as a message embed by setting the **messages.announcement-embed**
					option in the configuration command. When sending the message as an an embed you can exclude the mentions of any users, @here or @everyone
					by providing the \`--excludeMentions\` flag to the announcement.`
			].join('\n'),
			explainedUsage: [['announcement', 'The announcement text to post.']],
			examples: ['I am glad to announce that we have a bot able to safely send announcements for our subscribers!'],
			reminder: `If you want to edit the message you send in an announcement,
				just edit the message you used to have Skyra send that announcement.
				Skyra will then edit the message she sent previously. She can do this
				up to 15 minutes after the initial announcement, so be sure to not wait
				long!`,
			multiline: true
		},
		COMMAND_SUBSCRIBE_DESCRIPTION: "Subscribe to this server's announcements.",
		COMMAND_SUBSCRIBE_EXTENDED: {
			extendedHelp: `This command serves the purpose of **giving** you the subscriber role, which must be configured by the
				server's administrators. When a moderator or administrator use the **announcement** command, you
					will be mentioned. This feature is meant to replace everyone/here tags and mention only the interested
					users.`
		},
		COMMAND_UNSUBSCRIBE_DESCRIPTION: "Unsubscribe from this server's announcements.",
		COMMAND_UNSUBSCRIBE_EXTENDED: {
			extendedHelp: `This command serves the purpose of **removing** you the subscriber role, which must be configured by the
					server's administrators. When a moderator or administrator use the **announcement** command, you
					will **not longer** be mentioned. This feature is meant to replace everyone/here tags and mention
					only the interested users.`
		},

		/**
		 * ############
		 * FUN COMMANDS
		 */

		COMMAND_8BALL_DESCRIPTION: 'Skyra will read the Holy Bible to find the correct answer for your question.',
		COMMAND_8BALL_EXTENDED: {
			extendedHelp: "This command provides you a random question based on your questions' type. Be careful, it may be too smart.",
			explainedUsage: [['question', 'The Holy Question']],
			examples: ['Why did the chicken cross the road?']
		},
		COMMAND_CHOICE_DESCRIPTION: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
		COMMAND_CHOICE_EXTENDED: {
			extendedHelp: `I have an existencial doubt... should I wash the dishes or throw them through the window? The search
					continues. List me items separated by comma and I will choose one them. On a side note, I am not
					responsible of what happens next.`,
			explainedUsage: [['words', 'A list of words separated by comma.']],
			examples: ['Should Wash the dishes, Throw the dishes out the window', 'Cat, Dog']
		},
		COMMAND_CHANGEMYMIND_DESCRIPTION: 'Skyra is the best, change my mind.',
		COMMAND_CHANGEMYMIND_EXTENDED: {
			extendedHelp: "I still think I'm the best, change my mind. I make a photo with your avatar and some text in some paper.",
			explainedUsage: [['text', 'The phrase you want.']],
			examples: ['Skyra is the best bot in this server']
		},
		COMMAND_DICE_DESCRIPTION: 'Roll the dice using d20 syntax.',
		COMMAND_DICE_EXTENDED: {
			extendedHelp: `The mechanics of this command are easy. You have a dice, then you roll it __x__ times, but the dice
				can also be configured to have __y__ sides. By default, this command rolls a dice with 6 sides once.
				However, you can change the amount of rolls for the dice, and this command will 'roll' (get a random
				number between 1 and the amount of sides). For example, rolling a dice with 6 sides 3 times will leave
				a random sequence of three random numbers between 1 and 6, for example: 3, 1, 6; And this command will
				return 10 as output.`,
			examples: ['370d24', '100d6', '6']
		},
		COMMAND_ESCAPEROPE_DESCRIPTION: 'Use the escape rope from Pokemon.',
		COMMAND_ESCAPEROPE_EXTENDED: {
			extendedHelp: '**Skyra** used **Escape Rope**.'
		},
		COMMAND_HOWTOFLIRT_DESCRIPTION: 'Captain America, you do not know how to flirt.',
		COMMAND_HOWTOFLIRT_EXTENDED: {
			extendedHelp: `Let me show you how to effectively flirt with somebody using the Tony Stark's style for Captain
				America, I can guarantee that you'll get him.`,
			explainedUsage: [['user', 'The user to flirt with.']],
			examples: ['Skyra']
		},
		COMMAND_LOVE_DESCRIPTION: 'Lovemeter, online!',
		COMMAND_LOVE_EXTENDED: {
			extendedHelp: `Hey! Wanna check the lovemeter? I know it's a ridiculous machine, but many humans love it!
					Don't be shy and try it!`,
			explainedUsage: [['user', 'The user to rate.']],
			examples: ['Skyra']
		},
		COMMAND_MARKOV_DESCRIPTION: 'Generate a Markov Chain from the text channel.',
		COMMAND_MARKOV_EXTENDED: {
			extendedHelp: `A Markov chain is a stocha... what? Okay, something something a probability theory made by a
					Russian mathematician, check Wikipedia for more information. **In short**: I will generate a random
					message given the content of the messages in the channel.`,
			examples: ['']
		},
		COMMAND_NORRIS_DESCRIPTION: "Enjoy your day reading Chuck Norris' jokes.",
		COMMAND_NORRIS_EXTENDED: {
			extendedHelp: `Did you know that Chuck norris does **not** call the wrong number, but you **answer** the wrong phone?
					Woah, mindblow. He also threw a carton of milk and created the Milky Way. This command queries chucknorris.io
					and retrieves a fact (do not assume they're false, not in front of him) so you can read it`
		},
		COMMAND_RATE_DESCRIPTION: 'Let bots have opinions and rate somebody.',
		COMMAND_RATE_EXTENDED: {
			extendedHelp: `Just because I am a bot doesn't mean I cannot rate you properly. I can grade you with a random number
					generator to ease the process. Okay okay, it's not fair, but I mean... I can also give you a 💯.`,
			explainedUsage: [['user', 'The user to rate.']],
			examples: ['Skyra', 'me']
		},
		COMMAND_XKCD_DESCRIPTION: 'Read comics from XKCD.',
		COMMAND_XKCD_EXTENDED: {
			extendedHelp: `**xkcd** is an archive for nerd comics filled with math, science, sarcasm and languages. If you don't
					provide any argument, I will get a random comic from xkcd. If you provide a number, I will retrieve
					the comic with said number. But if you provide a title/text/topic, I will fetch a comic that matches
					with your input and display it. For example, \`Skyra, xkcd Curiosity\` will show the comic number 1091.`,
			explainedUsage: [['query', 'Either the number of the comic, or a title to search for.']],
			examples: ['1091', 'Curiosity']
		},
		COMMAND_PUN_DESCRIPTION: 'Shows you a random pun.',
		COMMAND_PUN_EXTENDED: {
			extendedHelp: [
				'A steak pun is a rare medium well done.',
				'Get your daily doses of dad jokes from icanhazdadjoke.com and laugh at witty wisecracks.'
			].join('\n'),
			multiline: true
		},
		COMMAND_WAKANDA_DESCRIPTION: "Helpful descriptions? We don't do that here",
		COMMAND_WAKANDA_EXTENDED: {
			extendedHelp: `Creates an image macro using the [We Don't Do That Here Meme](https://knowyourmeme.com/memes/we-dont-do-that-here)
			using the given user.`
		},

		/**
		 * ################
		 * GAME INTEGRATION COMMANDS
		 */

		COMMAND_BRAWLSTARS_DESCRIPTION: "Get data on a player or club from Supercell's newest game, Brawl Stars.",
		COMMAND_BRAWLSTARS_EXTENDED: {
			explainedUsage: [
				['category', 'The category of data to get: **club** to get data on a club, or **player** to get data on a player (default).'],
				['query', 'The tag of the player or club, depending on which category you choose.']
			],
			examples: ['player #RJQLQ999']
		},
		COMMAND_BRAWLSTARS_PLAYER_EMBED_TITLES: {
			TROPHIES: 'Trophies',
			EVENTS: 'Events',
			EXP: 'Experience',
			GAME_MODES: 'Game Modes',
			OTHER: 'Other'
		},
		COMMAND_BRAWLSTARS_PLAYER_EMBED_FIELDS: {
			TOTAL: 'Total',
			PERSONAL_BEST: 'Personal Best',
			EVENTS: 'Events',
			ROBO_RUMBLE: 'Best Robo Rumble Rank',
			BOSS_FIGHT: 'Best Big Brawler Rank',
			EXPERIENCE_LEVEL: 'Experience Level',
			VICTORIES_3V3: '3v3 Victories',
			VICTORIES_SOLO: 'Solo Victories',
			VICTORIES_DUO: 'Duo Victories',
			CLUB: 'Club',
			BRAWLERS_UNLOCKED: 'Brawlers Unlocked'
		},
		COMMAND_BRAWLSTARS_CLUB_EMBED_TITLES: {
			TOTAL_TROPHIES: 'Total Trophies',
			AVERAGE_TROPHIES: 'Average Trophies',
			REQUIRED_TROPHIES: 'Required Trophies',
			MEMBERS: 'Members',
			TYPE: 'Type',
			TOP_5_MEMBERS: 'Top 5 Members',
			PRESIDENT: 'President'
		},
		COMMAND_BRAWLSTARS_CLUB_EMBED_FIELDS: {
			NO_PRESIDENT: 'No President'
		},
		COMMAND_CLASHOFCLANS_DESCRIPTION: 'Obtenga datos sobre un jugador o clan en el popular juego móvil Choque de clanes',
		COMMAND_CLASHOFCLANS_EXTENDED: {
			extendedHelp: 'La solicitud de clanes intentará devolver múltiples respuestas posibles.',
			explainedUsage: [
				[
					'categoría',
					'La categoría de datos para obtener: ** clan ** para obtener datos de un clan o ** jugador ** para obtener datos de un jugador.'
				],
				['consulta', 'Ya sea un nombre de clan o una etiqueta de jugador según la categoría que elijas.']
			],
			examples: ['player #8GQPJG2CL', 'clan Hog Raiders Swe']
		},
		COMMAND_CLASHOFCLANS_PLAYER_EMBED_TITLES: {
			XP_LEVEL: 'Nivel de XP',
			BUILDER_HALL_LEVEL: 'Nivel de sala de constructores',
			TOWNHALL_LEVEL: 'Nivel del ayuntamiento',
			TOWNHALL_WEAPON_LEVEL: 'Nivel de arma del ayuntamiento',

			TROPHIES: 'Trofeos actuales',
			BEST_TROPHIES: 'Mejores trofeos',
			WAR_STARS: 'Estrellas de guerra',

			ATTACK_WINS: 'Gana atacando',
			DEFENSE_WINS: 'Gana defendiendo',
			AMOUNT_OF_ACHIEVEMENTS: 'Cantidad de logros',

			VERSUS_TROPHIES: 'Actual contra trofeos',
			BEST_VERSUS_TROPHIES: 'Mejor contra trofeos',
			VERSUS_BATTLE_WINS: 'Versus batalla gana',

			CLAN_ROLE: 'Papel del clan',
			CLAN_NAME: 'Nombre del clan',
			LEAGUE_NAME: 'Nombre de la liga',
			NO_TOWNHALL_WEAPON_LEVEL: 'El ayuntamiento no tiene nivel de arma',
			NO_ROLE: 'Este jugador no tiene rol de clan.',
			NO_CLAN: 'Este jugador no es miembro del clan.',
			NO_LEAGUE: 'Este usuario no está en ninguna liga'
		},
		COMMAND_CLASHOFCLANS_CLAN_EMBED_TITLES: {
			CLAN_LEVEL: 'Nivel de clan',
			CLAN_POINTS: 'Puntos del clan',
			CLAN_VERSUS_POINTS: 'Clan versus puntos',
			AMOUNT_OF_MEMBERS: 'Cantidad de miembros',
			DESCRIPTION: 'Descripción',
			LOCATION_NAME: 'Nombre del lugar',
			WAR_FREQUENCY: 'Frecuencia de guerra',
			WAR_WIN_STREAK: 'Racha de victorias de guerra',
			WAR_WINS: 'La guerra total gana',
			WAR_TIES: 'Lazos de guerra total',
			WAR_LOSSES: 'Pérdidas de guerra totales',
			WAR_LOG_PUBLIC: '¿El registro de guerra es público?',
			UNKNOWN: 'Desconocido',
			WAR_FREQUENCY_DESCR: {
				moreThanOncePerWeek: 'Más de una vez por semana',
				always: 'Siempre',
				lessThanOncePerWeek: 'Menos de una vez por semana',
				oncePerWeek: 'Una vez por semana',
				unknown: 'Desconocido'
			},
			WAR_LOG_PUBLIC_DESCR: ({ isWarLogPublic }) => (isWarLogPublic ? 'Si' : 'No')
		},
		COMMAND_CLASHOFCLANS_INVALID_PLAYER_TAG: ({ playertag }) =>
			`Lo siento, \`${playertag}\` no es una etiqueta de jugador de Choque de clanes válida. Las etiquetas de jugador deben comenzar con un \`#\` seguido de la ID.`,
		COMMAND_CLASHOFCLANS_CLANS_QUERY_FAIL: ({ clan }) => `Lo siento, pero no pude obtener datos sobre el clan \`${clan}\`.`,
		COMMAND_CLASHOFCLANS_PLAYERS_QUERY_FAIL: ({ playertag }) =>
			`Lo siento, pero no pude obtener datos sobre el jugador con la etiqueta de jugador \`${playertag}\`.`,
		COMMAND_FFXIV_DESCRIPTION: 'Consulta la API de Final Fantasy 14 para obtener datos del juego',
		COMMAND_FFXIV_EXTENDED: {
			extendedHelp: `Este comando le permite datos de caracteres y elementos para FFXIV.
				Para el elemento, se realiza una búsqueda con comodines, por lo que si su término está en el medio del nombre, aún puede coincidir.`,
			explainedUsage: [
				['Tipo de búsqueda', '(opcional, el valor predeterminado es `character`)` character` o `item`'],
				['consulta', 'El jugador o cosa a buscar.']
			],
			examples: ['character Laytlan Ardevon', 'Laytlan Ardevon', 'item potion']
		},
		COMMAND_FFXIV_CHARACTER_FIELDS: {
			SERVER_AND_DC: 'Servidor - Centro de datos',
			TRIBE: 'Tribu',
			CHARACTER_GENDER: 'Género del personaje',
			NAMEDAY: 'Día del nombre',
			GUARDIAN: 'Guardián',
			CITY_STATE: 'Estado de la Ciudad',
			GRAND_COMPANY: 'Gran empresa',
			RANK: 'Rango',
			NONE: 'Ninguno',
			MALE: 'Masculino',
			FEMALE: 'Hembra',
			DOW_DOM_CLASSES: '***__Discípulo de clases de guerra y magia__***:',
			TANK: 'Tanque',
			HEALER: 'Curador',
			MELEEDPS: 'Cuerpo a cuerpo DPS',
			PHYSICALRANGEDDPS: 'DPS a distancia física',
			MAGICALRANGEDDPS: 'DPS a distancia mágica',
			DOH_CLASSES: '***__Trabajos de discípulo de la mano__***:',
			DOL_CLASSES: '***__Trabajos de discípulo de la tierra__***:'
		},
		COMMAND_FFXIV_ITEM_FIELDS: {
			KIND: 'Tipo',
			CATEGORY: 'Categoría',
			LEVEL_EQUIP: 'Nivel equipable',
			NONE: 'Ninguno'
		},
		COMMAND_FFXIV_NO_CHARACTER_FOUND: `${REDCROSS} Lo siento, pero no pude encontrar un personaje con ese nombre.`,
		COMMAND_FFXIV_INVALID_SERVER: `${REDCROSS} Lo siento, pero el nombre del servidor no es válido.`,
		COMMAND_FFXIV_NO_ITEM_FOUND: `${REDCROSS} Lo siento, pero no pude encontrar un elemento con esa consulta.`,
		COMMAND_FORTNITE_DESCRIPTION: 'Obtiene estadísticas de jugador para un jugador de Fortnite',
		COMMAND_FORTNITE_EXTENDED: {
			extendedHelp: 'Este comando recupera estadísticas para cualquier jugador de Fortnite que juegue en PC, Xbox o Playstation',
			explainedUsage: [
				['plataforma', '(opcional, predeterminado a `pc`) Plataforma en la que se reproduce el reproductor, una de` pc`, `xbox` o` psn`.'],
				['jugador', 'El nombre de usuario de Epic Games del jugador.']
			],
			examples: ['ninja', 'pc ninja', 'xbox TTV R1xbox', 'psn TTV IllusionOG']
		},
		COMMAND_FORTNITE_NO_USER: [
			'Lo siento, pero no pude encontrar un usuario con ese nombre.',
			'¿Estás seguro de que juegan en la plataforma proporcionada? (PC [predeterminado], Xbox o PSN son compatibles)'
		].join('\n'),
		COMMAND_FORTNITE_TITLES: {
			TITLE: ({ epicUserHandle }) => `Estadísticas de jugadores de Fortnite para ${epicUserHandle}`,
			LIFETIME_STATS: '**_Estadísticas de por vida_**',
			SOLOS: '**_Solos_**',
			DUOS: '**_Duos_**',
			SQUADS: '**_Escuadrones_**',
			WINS: ({ count }) => `Victorias: **\`${count}\`**`,
			KILLS: ({ count }) => `Matas: **\`${count}\`**`,
			KDR: ({ count }) => `Mata / Relación de la muerte: **\`${count}%\`**`,
			MATCHES_PLAYED: ({ count }) => `Partidos jugados: **\`${count}\`**`,
			TOP_1S: ({ count }) => `Top 1s: **\`${count}\`**`,
			TOP_3S: ({ count }) => `Top 3s: **\`${count}\`**`,
			TOP_5S: ({ count }) => `Top 5s: **\`${count}\`**`,
			TOP_6S: ({ count }) => `Top 6s: **\`${count}\`**`,
			TOP_10S: ({ count }) => `Top 10s: **\`${count}\`**`,
			TOP_12S: ({ count }) => `Top 12s: **\`${count}\`**`,
			TOP_25S: ({ count }) => `Top 25s: **\`${count}\`**`
		},
		COMMAND_OVERWATCH_DESCRIPTION: 'Obtiene estadísticas de jugador para un jugador de Overwatch',
		COMMAND_OVERWATCH_EXTENDED: {
			extendedHelp: `Este comando recupera estadísticas para cualquier jugador de Overwatch que juegue en PC, Xbox o Playstation.
				De manera predeterminada, buscará en los reproductores de PC, si desea comprobar si hay reproductores de
				Xbox o Playstation, configure la plataforma en \`xbl\` o \`psn\` respectivamente.
				IMPORTANTE: **¡Los nombres de los jugadores distinguen entre mayúsculas y minúsculas!**`,
			explainedUsage: [
				['platform', '(opcional, predeterminado en `pc`) Plataforma en la que se reproduce el reproductor, una de `pc`, `xbl` o `psn`'],
				[
					'player',
					'Para PC, la etiqueta de tormenta de nieve completa, para la consola, el nombre de usuario. ¡Distingue mayúsculas y minúsculas!'
				]
			],
			examples: ['MagicPants#112369', 'xbl Dorus NL gamer', 'psn decoda_24']
		},
		COMMAND_OVERWATCH_INVALID_PLAYER_NAME: ({ playerTag }) =>
			[
				`\`${playerTag}\` es un nombre de jugador no válido`,
				'Para PC tiene que ser su Blizzard BattleTag completo, por ejemplo `MagicPants#112369`.',
				'Para Xbox y Playstation tiene que ser su nombre de usuario.'
			].join('\n'),
		COMMAND_OVERWATCH_QUERY_FAIL: ({ player, platform }) =>
			[
				`No se pudieron obtener datos para \`${player}\`, ¿estás seguro de que juegan en la \`${platform}\`?`,
				'También asegúrese de tener la carcasa correcta, los nombres distinguen mayúsculas de minúsculas.'
			].join('\n'),
		COMMAND_OVERWATCH_NO_STATS: ({ player }) =>
			`Encontré un jugador con la etiqueta \`${player}\` pero no había estadísticas disponibles para ellos.`,
		COMMMAND_OVERWATCH_EMBED_DATA: {
			TITLE: 'Haga clic aquí para obtener más detalles en overwatchtracker.com',
			RATINGS_TITLE: 'Calificaciones',
			NO_AVERAGE: 'No hay suficientes datos para determinar el promedio.',
			AUTHOR: ({ name }) => `Estadísticas de jugador de Overwatch para ${name}`,
			PLAYER_LEVEL: ({ level }) => `**Nivel de jugador:** ${this.groupDigits(level)}`,
			PRESTIGE_LEVEL: ({ level }) => `**Nivel de prestigio:** ${this.groupDigits(level)}`,
			TOTAL_GAMES_WON: ({ gamesWon }) => `**Total de juegos ganados:** ${gamesWon ? this.groupDigits(gamesWon) : 'None'}`,
			RATINGS: ({ ratings }) =>
				ratings
					.map(
						(rating) =>
							`**${toTitleCase(rating.role)}:** ${typeof rating.level === 'number' ? this.groupDigits(rating.level) : rating.level}`
					)
					.join('\n'),
			FINAL_BLOWS: ({ finalBlows }) => `**Golpes finales:** ${this.groupDigits(finalBlows)}`,
			DEATHS: ({ deaths }) => `**Muertes:** ${this.groupDigits(deaths)}`,
			DAMAGE_DEALT: ({ damageDone }) => `**Daño infligido:** ${this.groupDigits(damageDone)}`,
			HEALING: ({ healingDone }) => `**Curación:** ${this.groupDigits(healingDone)}`,
			OBJECTIVE_KILLS: ({ objectiveKills }) => `**El objetivo mata:** ${this.groupDigits(objectiveKills)}`,
			SOLO_KILLS: ({ soloKills }) => `**Solo mata:** ${this.groupDigits(soloKills)}`,
			PLAY_TIME: ({ timePlayed }) => `**Tiempo de juego:** ${this.duration(timePlayed, 2)}`,
			GAMES_WON: ({ gamesWon }) => `**Juegos ganados:** ${this.groupDigits(gamesWon)}`,
			GOLDEN_MEDALS: ({ medalsGold }) => `**Medallas de oro ganadas:** ${this.groupDigits(medalsGold)}`,
			SILVER_MEDALS: ({ medalsSilver }) => `**Medallas de plata ganadas:** ${this.groupDigits(medalsSilver)}`,
			BRONZE_MEDALS: ({ medalsBronze }) => `**Medallas de bronce ganadas:** ${this.groupDigits(medalsBronze)}`,
			TOP_HERO: ({ heroName, timePlayed }) => `**${toTitleCase(heroName)}** (${timePlayed})`,
			HEADERS: {
				ACCOUNT: '__Estadísticas de cuenta__',
				QUICKPLAY: '__Estadísticas de Quickplay__',
				COMPETITIVE: '__Estadísticas competitivas__',
				TOP_HEROES_QUICKPLAY: '__Mejores héroes juego rápido',
				TOP_HEROES_COMPETITIVE: '__Mejores héroes competitivos__'
			}
		},

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		COMMAND_SUPPORT_DESCRIPTION: 'Muestra instrucciones de soporte',
		COMMAND_SUPPORT_EXTENDED: {
			extendedHelp: "Le brinda un enlace a *Skyra's Lounge*, el lugar indicado para todo lo relacionado conmigo."
		},

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		COMMAND_CREATEMUTE_DESCRIPTION: 'Prepare the mute system.',
		COMMAND_CREATEMUTE_EXTENDED: {
			extendedHelp: `This command prepares the mute system by creating a role called 'muted', and configuring it to
					the guild settings. This command also modifies all channels (where possible) permissions and disables
					the permission **${PERMS.SEND_MESSAGES}** in text channels and **${PERMS.CONNECT}** in voice channels for said role.`
		},
		COMMAND_GIVEAWAY_DESCRIPTION: 'Start a new giveaway.',
		COMMAND_GIVEAWAY_EXTENDED: {
			extendedHelp: `This command is designed to manage giveaways. You can start them with this command by giving it the
					time and a title. When a giveaway has been created, Skyra will send a giveaway message and react to it with 🎉
					so the members of the server can participate on it. Once the timer ends, Skyra will retrieve all the users who
					reacted and send the owner of the giveaway a message in direct messages with the winner, and other 10 possible
					winners (in case of needing to re-roll).
					You can also pass a flag of \`--winners=Xw\`, wherein X is a number (for example 2w for 2 winners),
					to allow multiple people to win this giveaway.`,
			explainedUsage: [
				['channel', '(Optional) The channel in which to start the giveaway'],
				['time', 'The time the giveaway should last.'],
				['title', 'The title of the giveaway.']
			],
			examples: ['6h A hug from Skyra.', '60m 5w A mysterious Steam game', '1d Free Discord Nitro! --winners=2w']
		},
		COMMAND_GIVEAWAYREROLL_DESCRIPTION: 'Re-roll the winners from a giveaway.',
		COMMAND_GIVEAWAYREROLL_EXTENDED: {
			extendedHelp: `This command is designed to re-roll finished giveaways. Please check \`Skyra, help gstart\` for more information
					about creating one.`,
			explainedUsage: [
				['winners', 'The amount of winners to pick.'],
				['message', 'The message to target. Defaults to last giveaway message.']
			],
			examples: ['', '633939404745998346', '5', '5 633939404745998346']
		},
		COMMAND_GIVEAWAYSCHEDULE_DESCRIPTION: 'Schedule a giveaway to start at a certain time.',
		COMMAND_GIVEAWAYSCHEDULE_EXTENDED: {
			extendedHelp: `
				This command prepares a giveaway to start at a certain time if you do not wish to start it immediately.
				You can also pass a flag of \`--winners=X\`, wherein X is a number, to allow multiple people to win this giveaway..
			`,
			explainedUsage: [
				['channel', '(Optional) The channel in which to start the giveaway'],
				['schedule', 'The time to wait before starting the giveaway.'],
				['time', 'The time the giveaway should last.'],
				['title', 'The title of the giveaway.']
			],
			examples: ['30m 6h A hug from Skyra.']
		},

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		COMMAND_NICK_DESCRIPTION: "Change Skyra's nickname for this server.",
		COMMAND_NICK_EXTENDED: {
			extendedHelp: "This command allows you to change Skyra's nickname easily for the server.",
			reminder: `This command requires the **${PERMS.CHANGE_NICKNAME}** permission. Make sure Skyra has it.`,
			explainedUsage: [['nick', "The new nickname. If you don't put any, it'll reset it instead."]],
			examples: ['SkyNET', 'Assistant', '']
		},
		COMMAND_PERMISSIONNODES_DESCRIPTION: 'Configure the permission nodes for this server.',
		COMMAND_PERMISSIONNODES_EXTENDED: {
			extendedHelp: `Permission nodes are per-user and per-role overrides. They are used when the built-in permissions system is not enough.
					For example, in some servers they want to give a staff role the permissions to use mute and warn, but not ban and others (reserved
					to moderators), and only warn is available for the configurable staff-level permission, so you can tell me to allow the mute command
					for the staff role now.`,
			explainedUsage: [
				['action', 'Either `add`, `remove`, `reset`, or `show`. Defaults to `show`.'],
				['target', 'Either a role name or a user name, allowing IDs and mentions for either.'],
				['type', 'Either `allow` or `deny`. This is ignored when `action` is not `add` nor `remove`.'],
				['command', 'The name of the command to allow or deny. This is ignored when `action` is not `add` nor `remove`.']
			],
			examples: ['add staff allow warn', 'add moderators deny ban', 'remove staff allow warn', 'reset staff', 'show staff'],
			reminder: 'The server owner cannot have any actions, nor the `everyone` role can have allowed commands.'
		},
		COMMAND_TRIGGERS_DESCRIPTION: 'Set custom triggers for your guild!.',
		COMMAND_TRIGGERS_EXTENDED: {
			extendedHelp: `This command allows administrators to go further with the personalization of Skyra in the guild!. A trigger is
					a piece that can active other functions. For example, the aliases are triggers that get executed when the command does not
					exist in bot, triggering the unknown command event. When this happens, the alias system executes and tries to find an entry
					that matches with the input.`,
			reminder: `This command requires the **${PERMS.ADD_REACTIONS}** permission so it can test reactions. Make sure Skyra has it.`,
			explainedUsage: [
				['list', 'List all current triggers.'],
				['add <type> <input> <output>', 'Add a new trigger given a type, input and output.'],
				['remove <type> <input>', 'Remove a trigger given the type and input.']
			],
			examples: ['', 'list', 'add reaction "good night" 🌛', 'remove reaction "good night"']
		},

		/**
		 * #################################
		 * MANAGEMENT/CONFIGURATION COMMANDS
		 */

		COMMAND_MANAGECOMMANDAUTODELETE_DESCRIPTION: 'Manage per-channel autodelete timer.',
		COMMAND_MANAGECOMMANDAUTODELETE_EXTENDED: {
			extendedHelp:
				"This command manages this guild's per-channel command autodelete timer, it serves well to leave a channel clean from commands.",
			explainedUsage: [
				['show', 'Show the autodelete timer for all channels.'],
				['add [channel] <command>', 'Add an autodelete timer for the specified channel.'],
				['remove [channel]', 'Remove the autotimer from the specified channel.'],
				['reset', 'Clear all autodelete timers.']
			],
			reminder: "The channel argument is optional, defaulting to the message's channel, but it uses fuzzy search when possible.",
			examples: ['show', 'add #general 4s', 'remove #general', 'reset']
		},
		COMMAND_MANAGECOMMANDCHANNEL_DESCRIPTION: 'Manage per-channel command blacklist.',
		COMMAND_MANAGECOMMANDCHANNEL_EXTENDED: {
			extendedHelp: `This command manages this guild's per-channel command blacklist, it serves well to disable certain commands you do not want
					to be used in certain channels (to disable a command globally, use the \`disabledCommands\` settings key to disable in all channels.`,
			explainedUsage: [
				['show [channel]', 'Show the command blacklist for the selected channel.'],
				['add [channel] <command>', "Add a command to the specified channel's command blacklist."],
				['remove [channel] <command>', "Remove a command to the specified channel's command blacklist."],
				['reset [channel]', 'Clear the command blacklist for the specified channel.']
			],
			reminder: 'The channel argument is optional, but it uses fuzzy search when possible.',
			examples: ['show', 'add #general profile', 'remove #general profile', 'reset #general']
		},
		COMMAND_MANAGEREACTIONROLES_DESCRIPTION: 'Manage the reaction roles for this server.',
		COMMAND_MANAGEREACTIONROLES_EXTENDED: {
			extendedHelp: `Seamlessly set up reaction roles in your server! When adding reaction roles, I listen to your reactions for 5 minutes and I bind
				the first reaction from you alongside the channel and the message, with the specified role. Otherwise, if a channel is specified, a prompt will
				not be created, and the reaction role will be bound to all of the channel's messages.`,
			explainedUsage: [
				['show', 'Retrieve the list of all reaction roles.'],
				['add <role>', 'Adds a reaction role binding the first reacted message since the execution with the role.'],
				['remove <role> <message>', 'Removes a reaction role, use `show` to get a list of them.'],
				['reset', 'Removes all reaction roles.']
			]
		},
		COMMAND_SETIGNORECHANNELS_DESCRIPTION: 'Set a channel to the ignore channel list.',
		COMMAND_SETIGNORECHANNELS_EXTENDED: {
			extendedHelp: `This command helps you setting up ignored channels. An ignored channel is a channel where nobody but moderators
					can use Skyra's commands. Unlike removing the **${PERMS.SEND_MESSAGES}** permission, Skyra is still able to send (and therefore
					execute commands) messages, which allows moderators to use moderation commands in the channel. Use this if you want to ban
					any command usage from the bot in a specific channel.`,
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
			examples: ['#general', 'here']
		},
		COMMAND_SETIMAGELOGS_DESCRIPTION: 'Set the image logs channel.',
		COMMAND_SETIMAGELOGS_EXTENDED: {
			extendedHelp: `This command helps you setting up the image log channel. Whenever a member sends an image attachment, it will send an embed message with
					the attachment re-uploaded. All messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra.`,
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			examples: ['#image-logs', 'here']
		},
		COMMAND_SETMEMBERLOGS_DESCRIPTION: 'Set the member logs channel.',
		COMMAND_SETMEMBERLOGS_EXTENDED: {
			extendedHelp: `This command helps you setting up the member log channel. A member log channel only sends two kinds of logs: "Member Join" and
					"Member Leave". If a muted user joins, it will send a special "Muted Member Join" event. All messages are in embeds so you will need to enable
					the permission **${PERMS.EMBED_LINKS}** for Skyra. You also need to individually set the "events" you want to listen: "events.memberAdd" and
					"events.memberRemove". For roles, you would enable "events.memberNicknameChange" and/or "events.memberRoleUpdate" via the "config" command.`,
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			examples: ['#member-logs', 'here']
		},
		COMMAND_SETMESSAGELOGS_DESCRIPTION: 'Set the message logs channel.',
		COMMAND_SETMESSAGELOGS_EXTENDED: {
			extendedHelp: `This command helps you setting up the message log channel. A message log channel only sends three kinds of logs: "Message Delete",
					"Message Edit", and "Message Prune". All messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra. You
					also need to individually set the "events" you want to listen: "events.messageDelete" and "events.messageEdit" via the
					"config" command.`,
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: `Due to Discord limitations, Skyra cannot know who deleted a message. The only way to know is by fetching audit logs, requiring the
				permission **${PERMS.VIEW_AUDIT_LOG}** which access is limited in the majority of guilds and the amount of times I can fetch them in a period of time.`,
			examples: ['#message-logs', 'here']
		},
		COMMAND_SETMODLOGS_DESCRIPTION: 'Set the mod logs channel.',
		COMMAND_SETMODLOGS_EXTENDED: {
			extendedHelp: `This command helps you setting up the mod log channel. A mod log channel only sends case reports indexed by a number case and with
					"claimable" reasons and moderators. This channel is not a must and you can always retrieve specific modlogs with the "case" command. All
					messages are in embeds so you will need to enable the permission **${PERMS.EMBED_LINKS}** for Skyra. For auto-detection, you need to individually
					set the "events" you want to listen: "events.banAdd", "events.banRemove" via the "config" command.`,
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: `Due to Discord limitations, the auto-detection does not detect kicks. You need to use the "kick" command if you want to document them as
				a formal moderation log case.`,
			examples: ['#mod-logs', 'here']
		},
		COMMAND_SETPREFIX_DESCRIPTION: "Set Skyra's prefix.",
		COMMAND_SETPREFIX_EXTENDED: {
			extendedHelp: `This command helps you setting up Skyra's prefix. A prefix is an affix that is added in front of the word, in this case, the message.
					It allows bots to distinguish between a regular message and a command. By nature, the prefix between should be different to avoid conflicts. If
					you forget Skyra's prefix, simply mention her with nothing else and she will tell you the current prefix. Alternatively, you can take advantage
					of Skyra's NLP (Natural Language Processing) and prefix the commands with her name and a comma. For example, "Skyra, ping".`,
			explainedUsage: [['prefix', `The prefix to set. Default one in Skyra is "${this.client.options.prefix}".`]],
			reminder: 'Your prefix should only contain characters everyone can write and type.',
			examples: ['&', '=']
		},
		COMMAND_SETROLECHANNEL_DESCRIPTION: 'Set the role channel for role reactions.',
		COMMAND_SETROLECHANNEL_EXTENDED: {
			extendedHelp: `This command sets up the role channel to lock the reactions to, it is a requirement to set up before setting up the **role message**,
					and if none is given, the role reactions module will not run.`,
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
			examples: ['#roles', 'here']
		},
		COMMAND_SETROLEMESSAGE_DESCRIPTION: 'Set the role message for role reactions.',
		COMMAND_SETROLEMESSAGE_EXTENDED: {
			extendedHelp: `This command sets up the role message to lock the reactions to, it requires a **role channel** to be set up first, and if none is given,
					Skyra will listen to any reaction in the channel. Additionally, Skyra requires **${PERMS.READ_MESSAGE_HISTORY}** in order to fetch the message for
					validation.`,
			explainedUsage: [['message', 'An ID, they are 17-18 characters long and numeric.']],
			reminder: 'You must execute this command in the role channel.',
			examples: ['434096799847022598']
		},
		COMMAND_SETSTARBOARDEMOJI_DESCRIPTION: 'Set the emoji reaction for starboard.',
		COMMAND_SETSTARBOARDEMOJI_EXTENDED: {
			extendedHelp: `This command sets up the starboard emoji for the starboard, which is, by default, ⭐. Once this is changed, Skyra will ignore any star and
					will count users who reacted to said emoji.`,
			explainedUsage: [['emoji', 'The emoji to set.']],
			reminder: 'Use this wisely, not everyone expects the starboard to listen to a custom emoji.',
			examples: ['⭐']
		},

		/**
		 * #################
		 * GIVEAWAY COMMANDS
		 */

		COMMAND_GIVEAWAYREROLL_INVALID: 'The message ID does not exist or there is no finished giveaway.',

		/**
		 * ###########################
		 * MANAGEMENT/HELPERS COMMANDS
		 */

		COMMAND_ROLEINFO_DESCRIPTION: 'Check the information for a role.',
		COMMAND_ROLEINFO_EXTENDED: {
			extendedHelp: `The roleinfo command displays information for a role, such as its id, name, color, whether it's hoisted
					(displays separately) or not, it's role hierarchy position, whether it's mentionable or not, how many members have said
					role, and its permissions. It sends an embedded message with the color of the role.`,
			explainedUsage: [['role', 'The role name, partial name, mention or id.']],
			examples: ['Administrator', 'Moderator', '']
		},
		COMMAND_GUILDINFO_DESCRIPTION: 'Check the information of the guild!.',
		COMMAND_GUILDINFO_EXTENDED: {
			extendedHelp: `The serverinfo command displays information for the guild the message got sent. It shows the amount of channels,
					with the count for each category, the amount of members (given from the API), the owner with their user id, the amount of roles,
					region, creation date, verification level... between others.`
		},

		/**
		 * ###########################
		 * MANAGEMENT/MEMBERS COMMANDS
		 */

		COMMAND_STICKYROLES_DESCRIPTION: 'Manage sticky roles for users.',
		COMMAND_STICKYROLES_EXTENDED: {
			extendedHelp: `The stickyRoles command allows you to manage per-member's sticky roles, they are roles that are kept even when
				you leave, and are applied back as soon as they join.`,
			explainedUsage: [
				['action', 'Either you want to check the sticky roles, add one, remove one, or remove all of them.'],
				['user', 'The user target for all the actions.'],
				['role', 'The role to add or remove.']
			],
			examples: ['add Skyra Goddess', 'show Skyra', 'remove Skyra Goddess', 'reset Skyra'],
			reminder: "The member's roles will not be modified by this command, you need to add or remove them."
		},

		/**
		 * #####################################
		 * MANAGEMENT/ATTACHMENT FILTER COMMANDS
		 */

		COMMAND_MANAGEATTACHMENTS_DESCRIPTION: 'Manage attachment management in this guild!.',
		COMMAND_MANAGEATTACHMENTS_EXTENDED: {
			extendedHelp: 'This command manages the attachment management for me in this guild!.',
			examples: ['maximum 25', 'duration 1m', 'action mute', 'logs y', 'enable', 'disable'],
			explainedUsage: [
				['maximum <maximum>', 'The maximum amount of attachments allowed.'],
				['duration <duration>', 'The lifetime for the attachments in the system.'],
				['action <ban|kick|mute|softban>', 'Defines the action I will take once a user breaks the threshold.'],
				['logs <y|yes|n|no>', 'Defines whether or not should I log when somebody breaks the threshold.'],
				['enable', 'Enables the attachment filter.'],
				['disable', 'Disables the attachment filter.']
			]
		},

		/**
		 * ##################################
		 * MANAGEMENT/MESSAGE FILTER COMMANDS
		 */

		COMMAND_CAPITALSMODE_DESCRIPTION: "Manage this guild's flags for the caps filter.",
		COMMAND_CAPITALSMODE_EXTENDED: {
			extendedHelp: `The capitalsMode command manages the behavior of the caps system.
				The minimum amount of characters before filtering can be set with \`Skyra, settings set selfmod.capitals.minimum <number>\`.
				The percentage of uppercase letters can be set with \`Skyra, settings set selfmod.capitals.maximum <number>\`.`,
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			],
			multiline: true
		},
		COMMAND_FILTER_DESCRIPTION: "Manage this guild's word blacklist.",
		COMMAND_FILTER_EXTENDED: {
			extendedHelp: `The filter command manages the word blacklist for this server and must have a filter mode set up, check \`Skyra, help filterMode\`.
					Skyra's word filter can find matches even with special characters or spaces between the letters of a blacklisted word, as well as it filters
					duplicated characters for enhanced filtering.`
		},
		COMMAND_FILTERMODE_DESCRIPTION: "Manage this server's word filter modes.",
		COMMAND_FILTERMODE_EXTENDED: {
			extendedHelp: `The filterMode command manages the behavior of the word filter system.
				Run \`Skyra, help filter\` for how to add words.`,
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		COMMAND_INVITEMODE_DESCRIPTION: 'Manage the behavior for the invite link filter.',
		COMMAND_INVITEMODE_EXTENDED: {
			extendedHelp: 'The inviteMode command manages the behavior of the word filter system.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		COMMAND_LINKMODE_DESCRIPTION: 'Manage the behavior for the link filter.',
		COMMAND_LINKMODE_EXTENDED: {
			extendedHelp: 'The linkMode command manages the behavior of the link system.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		COMMAND_MESSAGEMODE_DESCRIPTION: 'Manage the behavior for the message filter system.',
		COMMAND_MESSAGEMODE_EXTENDED: {
			extendedHelp: 'The messageMode command manages the behavior of the message filter system.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		COMMAND_NEWLINEMODE_DESCRIPTION: 'Manage the behavior for the new line filter system.',
		COMMAND_NEWLINEMODE_EXTENDED: {
			extendedHelp: `The newLineMode command manages the behavior of the new line filter system.
				The maximum amount of lines allowed can be set with \`Skyra, settings set selfmod.newlines.maximum <number>\``,
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},
		COMMAND_REACTIONMODE_DESCRIPTION: 'Manage the behavior for the reaction filter system.',
		COMMAND_REACTIONMODE_EXTENDED: {
			extendedHelp: 'The reactionMode command manages the behavior of the reaction filter system.',
			explainedUsage: [
				['Enable', 'Enable the sub-system.'],
				['Disable', 'Disable the sub-system'],
				['Action Alert', 'Toggle message alerts in the channel.'],
				['Action Log', 'Toggle message logs in the moderation logs channel.'],
				['Action Delete', 'Toggle message deletions.'],
				['Punishment', 'The moderation action to take, takes any of `none`, `warn`, `kick`, `mute`, `softban`, or `ban`.'],
				['Punishment-Duration', 'The duration for the punishment, only applicable to `mute` and `ban`. Takes a duration.'],
				[
					'Threshold-Maximum',
					'The amount of infractions that can be done within `Threshold-Duration` before taking action, instantly if unset. Takes a number.'
				],
				['Threshold-Duration', 'The time in which infractions will accumulate before taking action, instantly if unset. Takes a duration.']
			],
			reminder: '`Action Log` requires `channel.moderation-logs` to be set up.',
			examples: [
				'enable',
				'disable',
				'action alert',
				'punishment ban',
				'punishment mute',
				'punishment-duration 1m',
				'threshold-maximum 5',
				'threshold-duration 30s'
			]
		},

		/**
		 * #############
		 * MISC COMMANDS
		 */

		COMMAND_CUDDLE_DESCRIPTION: 'Cuddle somebody!',
		COMMAND_CUDDLE_EXTENDED: {
			extendedHelp: `Do you know something that I envy from humans? The warm feeling when somebody cuddles you. It's so cute ❤! I can
				imagine and draw a image of you cuddling somebody in the bed, I hope you like it!`,
			explainedUsage: [['user', 'The user to cuddle with.']],
			examples: ['Skyra']
		},
		COMMAND_DELETTHIS_DESCRIPTION: '*Sees offensive post* DELETTHIS!',
		COMMAND_DELETTHIS_EXTENDED: {
			extendedHelp: `I see it! I see the hammer directly from your hand going directly to the user you want! Unless... unless it's me! If
				you try to tell me this, I'm going to take the MJOLNIR! Same if you do with my creator!`,
			explainedUsage: [['user', 'The user that should start deleting his post.']],
			examples: ['John Doe']
		},
		COMMAND_F_DESCRIPTION: 'Press F to pay respects.',
		COMMAND_F_EXTENDED: {
			extendedHelp: `This command generates an image... to pay respects reacting with 🇫. This command also makes Skyra
				react the image if she has permissions to react messages.`,
			explainedUsage: [['user', 'The user to pray respects to.']],
			examples: ['John Doe', 'Jake']
		},
		COMMAND_GOODNIGHT_DESCRIPTION: 'Give somebody a nice Good Night!',
		COMMAND_GOODNIGHT_EXTENDED: {
			extendedHelp: "Let me draw you giving a goodnight kiss to the person who is going to sleep! Who doesn't like goodnight kisses?",
			explainedUsage: [['user', 'The user to give the goodnight kiss.']],
			examples: ['Jake', 'DefinitivelyNotSleeping']
		},
		COMMAND_GOOFYTIME_DESCRIPTION: "It's Goofy time!",
		COMMAND_GOOFYTIME_EXTENDED: {
			extendedHelp: `IT'S GOOFY TIME! *Screams loudly in the background* NO, DAD! NO! This is a command based on the Goofy Time meme,
					what else would it be?`,
			explainedUsage: [['user', "The user who will say IT'S GOOFY TIME!"]],
			examples: ['TotallyNotADaddy']
		},
		COMMAND_HUG_DESCRIPTION: 'Hugs!',
		COMMAND_HUG_EXTENDED: {
			extendedHelp: `What would be two people in the middle of the snow with coats and hugging each other? Wait! I get it!
				Mention somebody you want to hug with, and I'll try my best to draw it in a canvas!`,
			explainedUsage: [['user', 'The user to hug with.']],
			examples: ['Bear']
		},
		COMMAND_INEEDHEALING_DESCRIPTION: "*Genji's voice* I NEED HEALING!",
		COMMAND_INEEDHEALING_EXTENDED: {
			extendedHelp: `Do you know the worst nightmare for every single healer in Overwatch, specially for Mercy? YES! You know it,
				it's a cool cyborg ninja that looks like a XBOX and is always yelling "I NEED HEALING" loudly during the entire match.
				Well, don't expect so much, this command actually shows a medic with some tool in your chest.`,
			explainedUsage: [['healer', 'The healer you need to heal you.']],
			examples: ['Mercy']
		},
		COMMAND_RANDREDDIT_DESCRIPTION: 'Retrieve a random Reddit post.',
		COMMAND_RANDREDDIT_EXTENDED: {
			extendedHelp: 'This is actually something like a Russian Roulette, you can get a good meme, but you can also get a terrible meme.',
			explainedUsage: [['reddit', 'The reddit to look at.']],
			examples: ['discordapp']
		},
		COMMAND_REDDITUSER_DESCRIPTION: 'Retrieve statistics for a Reddit user.',
		COMMAND_REDDITUSER_EXTENDED: {
			extendedHelp: 'Gets statistics of any given Reddit user',
			explainedUsage: [['user', 'The reddit user to look at.']],
			examples: ['GloriousGe0rge']
		},
		COMMAND_SHIP_DESCRIPTION: 'Ships 2 members',
		COMMAND_SHIP_EXTENDED: {
			extendedHelp: `
				This commands generates a ship name between two users and creates more love in the world.
				Users are optional, you can provide none, just one or both users. For any non-provided users I will pick a random guild member.
			`,
			explainedUsage: [
				['firstUser', 'The first user to ship'],
				['secondUser', 'The second user to ship']
			],
			examples: ['romeo juliet'],
			reminder: 'If I cannot find either given user then I will pick someone randomly.'
		},
		COMMAND_SHIP_DATA: {
			TITLE: ({ romeoUsername, julietUsername }) => `**Shipping \`${romeoUsername}\` and \`${julietUsername}\`**`,
			DESCRIPTION: ({ shipName }) => `I call it... ${shipName}`
		},
		COMMAND_CHASE_DESCRIPTION: 'Get in here!',
		COMMAND_CHASE_EXTENDED: {
			extendedHelp: 'Do you love chasing? Start chasing people now for free! Just mention or write their ID and done!',
			explainedUsage: [['pinger', 'The user who you want to chase.']],
			examples: ['IAmInnocent']
		},
		COMMAND_SHINDEIRU_DESCRIPTION: 'Omae wa mou shindeiru.',
		COMMAND_SHINDEIRU_EXTENDED: {
			extendedHelp: `"You are already dead" Japanese: お前はもう死んでいる; Omae Wa Mou Shindeiru, is an expression from the manga
				and anime series Fist of the North Star. This shows a comic strip of the character pronouncing the aforementioned words,
				which makes the opponent reply with "nani?" (what?).`,
			explainedUsage: [['user', "The person you're telling that phrase to."]],
			examples: ['Jack']
		},
		COMMAND_PEEPOLOVE_DESCRIPTION: 'Genera una imagen peepoLove con avatar de usuario.',
		COMMAND_PEEPOLOVE_EXTENDED: {
			extendedHelp: `Le permite generar una imagen peepoLove a partir del avatar de usuario.`,
			explainedUsage: [['user', 'El usuario que peepo debe abrazar.']],
			examples: ['Jack'],
			reminder:
				'El soporte de imágenes personalizadas se ha deshabilitado temporalmente, la ETA que regresa es aproximadamente noviembre de 2020.'
		},
		COMMAND_SLAP_DESCRIPTION: 'Slap another user using the Batman & Robin Meme.',
		COMMAND_SLAP_EXTENDED: {
			extendedHelp: 'The hell are you saying? *Slaps*. This meme is based on a comic from Batman and Robin.',
			explainedUsage: [['user', 'The user you wish to slap.']],
			examples: ['Jake'],
			reminder: "You try to slap me and I'll slap you instead."
		},
		COMMAND_SNIPE_DESCRIPTION: 'Retrieve the last deleted message from a channel',
		COMMAND_SNIPE_EXTENDED: {
			extendedHelp: `This just sends the last deleted message from this channel, somebody is misbehaving? This will
				catch them.`
		},
		COMMAND_THESEARCH_DESCRIPTION: 'Are we the only one in the universe, this man on earth probably knows.',
		COMMAND_THESEARCH_EXTENDED: {
			extendedHelp: 'One man on Earth probably knows if there is intelligent life, ask and you shall receive an answer.',
			explainedUsage: [['answer', 'The sentence that will reveal the truth.']],
			examples: ['Your waifu is not real.']
		},
		COMMAND_TRIGGERED_DESCRIPTION: 'I am getting TRIGGERED!',
		COMMAND_TRIGGERED_EXTENDED: {
			extendedHelp: `What? My commands are not enough userfriendly?! (╯°□°）╯︵ ┻━┻. This command generates a GIF image
					your avatar wiggling fast, with a TRIGGERED footer, probably going faster than I thought, I don't know.`,
			explainedUsage: [['user', 'The user that is triggered.']],
			examples: ['kyra']
		},
		COMMAND_UPVOTE_DESCRIPTION: 'Get a link to upvote Skyra in **Bots For Discord**',
		COMMAND_UPVOTE_EXTENDED: {
			extendedHelp: `Bots For Discord is a website where you can find amazing bots for your website. If you really love me,
					you can help me a lot by upvoting me every 24 hours, so more users will be able to find me!`
		},
		COMMAND_VAPORWAVE_DESCRIPTION: 'Vapowave characters!',
		COMMAND_VAPORWAVE_EXTENDED: {
			extendedHelp: `Well, what can I tell you? This command turns your messages into unicode monospaced characters. That
					is, what humans call 'Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ'. I wonder what it means...`,
			explainedUsage: [['phrase', 'The phrase to convert']],
			examples: ['A E S T H E T I C']
		},
		/**
		 * ##############################
		 * MODERATION/MANAGEMENT COMMANDS
		 */

		COMMAND_HISTORY_DESCRIPTION: 'Display the count of moderation cases from this guild or from a user.',
		COMMAND_HISTORY_EXTENDED: {
			extendedHelp: `This command shows the amount of bans, mutes, kicks, and warnings, including temporary, that have not been
					appealed.`,
			examples: ['', '@Pete']
		},
		COMMAND_HISTORY_FOOTER: ({ warnings, mutes, kicks, bans }) =>
			`This user has ${warnings} ${warnings === 1 ? 'warning' : 'warnings'}, ${mutes} ${mutes === 1 ? 'mute' : 'mutes'}, ${kicks} ${
				kicks === 1 ? 'kick' : 'kicks'
			}, ${bans} ${bans === 1 ? 'ban' : 'bans'}.`,
		COMMAND_MODERATIONS_DESCRIPTION: 'List all running moderation logs from this guild.',
		COMMAND_MODERATIONS_EXTENDED: {
			extendedHelp: `This command shows you all the temporary moderation actions that are still running. This command uses a
					reaction-based menu and requires the permission **${PERMS.MANAGE_MESSAGES}** to execute correctly.`,
			examples: ['', '@Pete', 'mutes @Pete', 'warnings']
		},
		COMMAND_MODERATIONS_EMPTY: 'Nobody has behaved badly yet, who will be the first user to be listed here?',
		COMMAND_MODERATIONS_AMOUNT: ({ amount }) => (amount === 1 ? 'There is 1 entry.' : `There are ${amount} entries.`),
		COMMAND_MUTES_DESCRIPTION: 'List all mutes from this guild or from a user.',
		COMMAND_MUTES_EXTENDED: {
			extendedHelp: `This command shows either all mutes filed in this guild, or all mutes filed in this guild
					for a specific user. This command uses a reaction-based menu and requires the permission **${PERMS.MANAGE_MESSAGES}**
					to execute correctly.`,
			examples: ['', '@Pete']
		},
		COMMAND_WARNINGS_DESCRIPTION: 'List all warnings from this guild or from a user.',
		COMMAND_WARNINGS_EXTENDED: {
			extendedHelp: `This command shows either all warnings filed in this guild, or all warnings filed in this guild
					for a specific user. This command uses a reaction-based menu and requires the permission **${PERMS.MANAGE_MESSAGES}**
					to execute correctly.`,
			examples: ['', '@Pete']
		},

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		COMMAND_ARCHIVE_DESCRIPTION: '[BETA] Temporarily save all messages from the current channel.',
		COMMAND_ARCHIVE_EXTENDED: {
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
		},
		COMMAND_CASE_DESCRIPTION: 'Get the information from a case given its index.',
		COMMAND_CASE_EXTENDED: {
			extendedHelp: ''
		},
		COMMAND_SLOWMODE_DESCRIPTION: "Set the channel's slowmode value in seconds.",
		COMMAND_SLOWMODE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_CHANNELS}** and will modify the channel's ratelimit per
					user to any value between 0 and 120 seconds.`,
			examples: ['0', 'reset', '4'],
			reminder: "To reset a channel's ratelimit per user, you can use either 0 or 'reset'."
		},

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		COMMAND_BAN_DESCRIPTION: 'Hit somebody with the ban hammer.',
		COMMAND_BAN_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**, and only members with lower role hierarchy position
					can be banned by me. No, the guild's owner cannot be banned. This action can be optionally timed to create
					a temporary ban.`,
			examples: ['@Pete', '@Pete Spamming all channels.', '@Pete Spamming all channels, for 24 hours.']
		},
		COMMAND_DEHOIST_DESCRIPTION: 'Shoot everyone with the dehoist-inator 3000',
		COMMAND_DEHOIST_EXTENDED: {
			extendedHelp: `The act of hoisting involves adding special characters in front of your nickname
			in order to appear higher in the members list. This command replaces any member's nickname that includes those special characters
			with a special character that drags them to the bottom of the list.`,
			reminder: `This command requires **${PERMS.MANAGE_NICKNAMES}**, and only members with lower role hierarchy position
			can be dehoisted.`
		},
		COMMAND_KICK_DESCRIPTION: 'Hit somebody with the 👢.',
		COMMAND_KICK_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.KICK_MEMBERS}**, and only members with lower role hierarchy position
					can be kicked by me. No, the guild's owner cannot be kicked.`,
			examples: ['@Sarah', '@Sarah Spamming general chat.']
		},
		COMMAND_LOCKDOWN_DESCRIPTION: 'Close the gates for this channel!',
		COMMAND_LOCKDOWN_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_CHANNELS}** in order to be able to manage the permissions for
					a channel. This command removes the permission **${PERMS.SEND_MESSAGES}** to the \`@everyone\` role so nobody but
					the members with roles that have their own overrides (besides administrators, who bypass channel overrides) can
					send messages. Optionally, you can pass time as second argument.`,
			examples: ['', '#general', '#general 5m']
		},
		COMMAND_MUTE_DESCRIPTION: 'Mute a user in all text and voice channels.',
		COMMAND_MUTE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
					can be managed by me. No, the guild's owner cannot be muted. This action can be optionally timed to create
					a temporary mute. This action saves a member's roles temporarily and will be granted to the user after the unmute.
					The muted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.`,
			examples: ['@Alphonse', '@Alphonse Spamming all channels', '@Alphonse 24h Spamming all channels']
		},
		COMMAND_SETNICKNAME_DESCRIPTION: 'Change the nickname of a user.',
		COMMAND_SETNICKNAME_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_NICKNAMES}**, and only members with lower role hierarchy position
						can be managed by me. No, the guild's owner nickname cannot be changed.`,
			examples: ['@Pete peeehteeerrr', '@ꓑ𝗲੮ẻ Pete Unmentionable name']
		},
		COMMAND_ADDROLE_DESCRIPTION: 'Adds a role to a user.',
		COMMAND_ADDROLE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
						can be managed by me. No, the guild's owner roles cannot be changed.`,
			examples: ['@John member', '@John member Make John a member']
		},
		COMMAND_REMOVEROLE_DESCRIPTION: '',
		COMMAND_REMOVEROLE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
						can be managed by me. No, the guild's owner roles cannot be changed.`,
			examples: ['@Paula member', '@Paula member Remove member permissions from Paula']
		},
		COMMAND_PRUNE_DESCRIPTION: 'Prunes a certain amount of messages w/o filter.',
		COMMAND_PRUNE_EXTENDED: {
			extendedHelp: `This command deletes the given amount of messages given a filter within the last 100 messages sent
					in the channel the command has been run. Optionally, you can add \`--silent\` to tell Skyra not to send a
					response message.`,
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
			examples: ['50 me', '75 @kyra', '20 bots', '60 humans before 629992398700675082'],
			reminder: 'Due to a Discord limitation, bots cannot delete messages older than 14 days.'
		},
		COMMAND_REASON_DESCRIPTION: 'Edit the reason field from a moderation log case.',
		COMMAND_REASON_EXTENDED: {
			extendedHelp: `This command allows moderation log case management, it allows moderators to update the reason.
						If you want to modify multiple cases at once you provide a range.
						For example \`1..3\` for the \`<range>\` will edit cases 1, 2, and 3.
						Alternatively you can also give ranges with commas:
						\`1,3..6\` will result in cases 1, 3, 4, 5, and 6
						\`1,2,3\` will result in cases 1, 2, and 3`,
			examples: ['420 Spamming all channels', '419..421 Bad memes', '1..3,4,7..9 Posting NSFW', 'latest Woops, I did a mistake!']
		},
		COMMAND_RESTRICTATTACHMENT_DESCRIPTION: 'Restrict a user from sending attachments in all channels.',
		COMMAND_RESTRICTATTACHMENT_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
					can be managed by me. No, the guild's owner cannot be restricted. This action can be optionally timed to create
					a temporary restriction.
					The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.`,
			examples: ['@Pete', '@Pete Sending weird images', '@Pete 24h Sending NSFW images']
		},
		COMMAND_RESTRICTEMBED_DESCRIPTION: 'Restrict a user from attaching embeds in all channels.',
		COMMAND_RESTRICTEMBED_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
					can be managed by me. No, the guild's owner cannot be restricted. This action can be optionally timed to create
					a temporary restriction.
					The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.`,
			examples: ['@Pete', '@Pete Sending weird links', '@Pete 24h Posted a spam link']
		},
		COMMAND_RESTRICTEMOJI_DESCRIPTION: 'Restrict a user from using external emojis in all channels.',
		COMMAND_RESTRICTEMOJI_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
					can be managed by me. No, the guild's owner cannot be restricted. This action can be optionally timed to create
					a temporary restriction.
					The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.`,
			examples: ['@Pete', '@Pete Spamming external emojis', '@Pete 24h Posted cringe'],
			reminder: `This will only prevent the usage of external emojis and so will have no effect for non-nitro users,
			your own server's emojis and regular build in twemojis can still be used by members with this role.`
		},
		COMMAND_RESTRICTREACTION_DESCRIPTION: 'Restrict a user from reacting to messages in all channels.',
		COMMAND_RESTRICTREACTION_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
					can be managed by me. No, the guild's owner cannot be restricted. This action can be optionally timed to create
					a temporary restriction.
					The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.`,
			examples: ['@Pete', '@Pete Spamming reactions', '@Pete 24h Posting weird reactions']
		},
		COMMAND_RESTRICTVOICE_DESCRIPTION: 'Restrict a user from joining any voice channel.',
		COMMAND_RESTRICTVOICE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}**, and only members with lower role hierarchy position
					can be managed by me. No, the guild's owner cannot be restricted. This action can be optionally timed to create
					a temporary restriction.
					The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.`,
			examples: ['@Pete', '@Pete Earraping in general voice channels', '@Pete 24h Making weird noises']
		},
		COMMAND_SOFTBAN_DESCRIPTION: 'Hit somebody with the ban hammer, destroying all their messages for some days, and unban it.',
		COMMAND_SOFTBAN_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**, and only members with lower role hierarchy position
					can be banned by me. No, the guild's owner cannot be banned. The ban feature from Discord has a feature that
					allows the moderator to remove all messages from all channels that have been sent in the last 'x' days, being
					a number between 0 (no days) and 7. The user gets unbanned right after the ban, so it is like a kick, but
					that can prune many many messages.`,
			examples: ['@Pete', '@Pete Spamming all channels', '@Pete 7 All messages sent in 7 are gone now, YEE HAH!']
		},
		COMMAND_TOGGLEMODERATIONDM_DESCRIPTION: 'Toggle moderation DMs.',
		COMMAND_TOGGLEMODERATIONDM_EXTENDED: {
			extendedHelp: `This command allows you to toggle moderation DMs. By default, they are on, meaning that any moderation
					action (automatic or manual) will DM you, but you can disable them with this command.`,
			examples: ['']
		},
		COMMAND_UNBAN_DESCRIPTION: 'Unban somebody from this guild!.',
		COMMAND_UNBAN_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.BAN_MEMBERS}**. It literally gets somebody from the rubbish bin,
					cleans them up, and allows the pass to this guild's gates.`,
			examples: ['@Pete', '@Pete Turns out he was not the one who spammed all channels ¯\\_(ツ)_/¯']
		},
		COMMAND_UNMUTE_DESCRIPTION: 'Remove the scotch tape from a user.',
		COMMAND_UNMUTE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}** and removes a user from the muted people's list,
					and gives the old roles back if the user had them.`,
			examples: ['@Pete', '@Pete (Insert random joke here).']
		},
		COMMAND_UNRESTRICTATTACHMENT_DESCRIPTION: 'Remove the attachment restriction from one or more users.',
		COMMAND_UNRESTRICTATTACHMENT_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		COMMAND_UNRESTRICTEMBED_DESCRIPTION: 'Remove the embed restriction from one or more users.',
		COMMAND_UNRESTRICTEMBED_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		COMMAND_UNRESTRICTEMOJI_DESCRIPTION: 'Remove the external emoji restriction from one or more users.',
		COMMAND_UNRESTRICTEMOJI_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		COMMAND_UNRESTRICTREACTION_DESCRIPTION: 'Remove the reaction restriction from one or more users.',
		COMMAND_UNRESTRICTREACTION_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		COMMAND_UNRESTRICTVOICE_DESCRIPTION: 'Remove the voice restriction from one or more users.',
		COMMAND_UNRESTRICTVOICE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		COMMAND_UNWARN_DESCRIPTION: 'Appeal a warning moderation log case.',
		COMMAND_UNWARN_EXTENDED: {
			extendedHelp: `This command appeals a warning, it requires no permissions, you only give me the moderation log
					case to appeal and the reason.`,
			examples: ['0 Whoops, wrong dude.', '42 Turns out this was the definition of life.']
		},
		COMMAND_VMUTE_DESCRIPTION: "Throw somebody's microphone out the window.",
		COMMAND_VMUTE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MUTE_MEMBERS}**, and only members with lower role hierarchy position
					can be silenced by me. No, the guild's owner cannot be silenced. This action can be optionally timed to create
					a temporary voice mute.`,
			examples: ['@Pete', '@Pete Singing too loud', '@Pete Literally sang hear rape, for 24 hours.']
		},
		COMMAND_VOICEKICK_DESCRIPTION: 'Hit somebody with the 👢 for singing so bad and loud.',
		COMMAND_VOICEKICK_EXTENDED: {
			extendedHelp: `This command requires the permissions **${PERMS.MANAGE_CHANNELS}** to create a temporary (hidden)
					voice channel, and **${PERMS.MOVE_MEMBERS}** to move the user to the temporary channel. After this, the channel
					is quickly deleted, making the user leave the voice channel. For scared moderators, this command has almost no
					impact in the average user, as the channel is created in a way only me and the selected user can see and join,
					then quickly deleted.`,
			examples: ['@Pete', '@Pete Spamming all channels']
		},
		COMMAND_VUNMUTE_DESCRIPTION: "Get somebody's microphone back so they can talk.",
		COMMAND_VUNMUTE_EXTENDED: {
			extendedHelp: `This command requires **${PERMS.MUTE_MEMBERS}**, and only members with lower role hierarchy position
					can be un-silenced by me. No, the guild's owner cannot be un-silenced.`,
			examples: ['@Pete', '@Pete Appealed his times signing hear rape.']
		},
		COMMAND_WARN_DESCRIPTION: 'File a warning to somebody.',
		COMMAND_WARN_EXTENDED: {
			extendedHelp: `This command files a warning to a user. This kind of warning is meant to be **formal warnings**, as
					they will be shown in the 'warnings' command. It is a good practise to do an informal warning before using this
					command.`,
			examples: ['@Pete Attempted to mention everyone.']
		},

		/**
		 * ##################
		 * POKÉMON COMMANDS
		 */
		COMMAND_ABILITY_DESCRIPTION: 'Obtiene datos de cualquier habilidad Pokémon dada usando mi conjunto de datos Pokémon.',
		COMMAND_ABILITY_EXTENDED: {
			extendedHelp: 'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
			explainedUsage: [['habilidad', 'La capacidad para la que desea encontrar datos']],
			examples: ['multiscale', 'pressure']
		},
		COMMAND_ABILITY_EMBED_DATA: {
			ABILITY: 'Habilidad',
			EXTERNAL_RESOURCES: 'Recursos externos'
		},
		COMMAND_ABILITY_QUERY_FAIL: ({ ability }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${ability}\` es realmente una habilidad en Pokémon?`,
		COMMAND_FLAVORS_DESCRIPTION: 'Obtiene las entradas de dex en varios juegos para un Pokémon.',
		COMMAND_FLAVORS_EXTENDED: {
			extendedHelp: `
				Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.
				Puede proporcionar una bandera de \`--shiny\` para obtener el sprite brillante.
			`,
			explainedUsage: [['pokemon', 'El Pokémon para el que quieres obtener textos de sabor.']],
			examples: ['dragonite', 'pikachu', 'pikachu --shiny']
		},
		COMMAND_FLAVORS_QUERY_FAIL: ({ pokemon }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${pokemon}\` es en realidad un Pokémon?`,
		COMMAND_ITEM_DESCRIPTION: 'Obtiene datos para cualquier elemento Pokémon usando mi conjunto de datos Pokémon.',
		COMMAND_ITEM_EXTENDED: {
			extendedHelp: 'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
			explainedUsage: [['ítem', 'El elemento para el que desea buscar datos']],
			examples: ['life orb', 'choice specs']
		},
		COMMAND_ITEM_EMEBED_DATA: {
			ITEM: 'Ítem',
			GENERATION_INTRODUCED: 'Generación introducida',
			AVAILABLE_IN_GENERATION_8_TITLE: 'Disponible en la generación 8',
			AVAILABLE_IN_GENERATION_8_DATA: ({ available }) => (available ? 'Sí' : 'No'),
			EXTERNAL_RESOURCES: 'Recursos externos'
		},
		COMMAND_ITEM_QUERY_FAIL: ({ item }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${item}\` es realmente un elemento en Pokémon?`,
		COMMAND_LEARN_DESCRIPTION: 'Recupera si un Pokémon dado puede aprender uno o más movimientos dados usando mi conjunto de datos Pokémon.',
		COMMAND_LEARN_EXTENDED: {
			extendedHelp: `
				Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.
				Los movimientos se dividen en cada \`, \` (coma y espacio)
				y puedes proporcionar tantos movimientos como desee.
				Puede proporcionar una bandera de \`--shiny\` para obtener el sprite brillante.
			`,
			explainedUsage: [
				['generation', '(Opcional), la generación para la cual verificar los datos'],
				['pokemon', 'El Pokémon cuyo conjunto de aprendizaje quieres comprobar'],
				['movimiento', 'Los movimientos que desea verificar']
			],
			examples: ['7 dragonite dragon dance', 'pikachu thunder bolt', 'pikachu thunder bolt --shiny', 'pikachu thunder bolt, thunder']
		},
		COMMAND_LEARN_METHOD_TYPES: {
			levelUpMoves: ({ level }) => `por subir de nivel en el nivel ${level}`,
			eventMoves: () => 'a través de un evento',
			tutorMoves: () => 'de un tutor de movimiento',
			eggMoves: () => 'como un movimiento de huevo',
			virtualTransferMoves: () => 'al transfiriendo desde juegos de consola virtual',
			tmMoves: () => 'utilizando un Máquina Técnico o Disco Técnico',
			dreamworldMoves: () => 'a través de una captura de Pokémon Dream World'
		},
		COMMAND_LEARN_INVALID_GENERATION: ({ generation }) => `Lo siento, pero ${generation} no es una Generación Pokémon admitida`,
		COMMAND_LEARN_METHOD: ({ generation, pokemon, move, method }) =>
			`En la generacion ${generation} ${pokemon} __**puede**__ aprender **${move}** ${method}`,
		COMMAND_LEARN_QUERY_FAILED: ({ pokemon, moves }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${pokemon}\` es en realidad un Pokémon y ${moves
				.map((move) => `\`${move}\``)
				.join('y')} son realmente movimientos?`,
		COMMAND_LEARN_CANNOT_LEARN: ({ pokemon, moves }) => `Parece que ${toTitleCase(pokemon)} no puede aprender ${this.list(moves, 'o')}`,
		COMMAND_LEARN_TITLE: ({ pokemon, generation }) => `Datos de Learnset para ${toTitleCase(pokemon)} en la generación ${generation}`,
		COMMAND_MOVE_DESCRIPTION: 'Obtiene datos para cualquier movimiento Pokémon usando mi conjunto de datos Pokémon',
		COMMAND_MOVE_EXTENDED: {
			extendedHelp: 'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
			explainedUsage: [['movimiento', 'El movimiento para el que desea buscar datos']],
			examples: ['dragon dance', 'GMax Wildfire', 'Genesis Supernova'],
			reminder: `
				Los Movimientos Z muestran la potencia para los movimientos en la Octava Generación ya que son calculados con una tabla de conversión.
				Si Pokémon añade los Movimientos Z al juego, éstos serían sus niveles de poder teóricos. Sin embargo,
				al día de escritura, los Movimientos Z NO están disponibles en la Octava Generación.`
		},
		COMMAND_MOVE_EMBED_DATA: {
			MOVE: 'Movimiento',
			TYPE: 'Tipo',
			BASE_POWER: 'Potencia',
			PP: 'PP',
			CATEGORY: 'Categoría',
			ACCURACY: 'Precisión',
			PRIORITY: 'Movimiento con prioridad',
			TARGET: 'Objetivo',
			CONTEST_CONDITION: 'Cualidad',
			Z_CRYSTAL: 'Cristal Z',
			GMAX_POKEMON: 'Gigamax Pokémon',
			AVAILABLE_IN_GENERATION_8_TITLE: 'Disponible en la generación 8',
			AVAILABLE_IN_GENERATION_8_DATA: ({ available }) => (available ? 'Sí' : 'No'),
			EXTERNAL_RESOURCES: 'Recursos externos',
			NONE: 'Ninguno',
			MAX_MOVE_POWER: 'Potencia base como Movimiento Dinamax (Dinamax)',
			Z_MOVE_POWER: 'Potencia base como Movimiento Z (Cristal Z)'
		},
		COMMAND_MOVE_QUERY_FAIL: ({ move }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${move}\` es realmente un movimiento en Pokémon?`,
		COMMAND_POKEDEX_DESCRIPTION: 'Obtiene datos de cualquier Pokémon usando mi conjunto de datos Pokémon.',
		COMMAND_POKEDEX_EXTENDED: {
			extendedHelp: `
				Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.
				Puede proporcionar una bandera de \`--shiny\` para obtener el sprite brillante.
			`,
			explainedUsage: [['Pokémon', 'El Pokémon para el que quieres encontrar datos']],
			examples: ['dragonite', 'pikachu'],
			reminder:
				'Si hay algún "Otro (s) formulario (s)" en la cuarta página opcional, también se pueden solicitar. Las formas cosméticas en esa página enumeran cambios puramente cosméticos y estos no tienen entradas separadas en la Pokédex.'
		},
		COMMAND_POKEDEX_EMBED_DATA: {
			TYPES: 'Tipo(s)',
			ABILITIES: 'Habilidades',
			GENDER_RATIO: 'Relación de género',
			SMOGON_TIER: 'Smogon Tier',
			UKNOWN_SMOGON_TIER: 'Forma desconocida / alternativa',
			HEIGHT: 'Altura',
			WEIGHT: 'Peso',
			EGG_GROUPS: 'Grupo (s) de huevo',
			EVOLUTIONARY_LINE: 'Línea evolutiva',
			BASE_STATS: 'Puntos de base',
			BASE_STATS_TOTAL: 'TDPB',
			FLAVOUR_TEXT: 'Entrada de Pokédex',
			EXTERNAL_RESOURCES: 'Recursos externos',
			OTHER_FORMES_TITLE: 'Otras formas',
			COSMETIC_FORMES_TITLE: 'Formas cosméticas',
			FORMES_LIST: ({ formes }) => this.list(formes, 'y')
		},
		COMMAND_POKEDEX_QUERY_FAIL: ({ pokemon }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${pokemon}\` es en realidad un Pokémon?`,
		COMMAND_TYPE_DESCRIPTION: 'Da los emparejamientos de tipos para uno o dos tipos de Pokémon.',
		COMMAND_TYPE_EXTENDED: {
			extendedHelp: 'Los tipos deben ser coincidencias exactas con los tipos de pokemon (se pueden ignorar mayúsculas / minúsculas)',
			explainedUsage: [['tipo', 'El tipo(s) para buscar']],
			examples: ['dragon', 'fire flying']
		},
		COMMAND_TYPE_EMBED_DATA: {
			OFFENSIVE: 'Ofensivo',
			DEFENSIVE: 'Defensivo',
			SUPER_EFFECTIVE_AGAINST: 'Súper efectivo contra',
			DEALS_NORMAL_DAMAGE_TO: 'Inflige daño normal a',
			DOES_NOT_AFFECT: 'No afecta',
			NOT_VERY_EFFECTIVE_AGAINST: 'No muy efectivo contra',
			VULNERABLE_TO: 'Vulnerable a',
			TAKES_NORMAL_DAMAGE_FROM: 'Toma daño normal de',
			RESISTS: 'Resiste',
			NOT_AFFECTED_BY: 'No afectado por',
			EXTERNAL_RESOURCES: 'Recursos externos',
			TYPE_EFFECTIVENESS_FOR: ({ type }) => `Tipo de efectividad para ${type.map((val) => `\`${val}\``).join(' and ')}`
		},
		COMMAND_TYPE_TOO_MANY_TYPES: 'Lo siento, pero puedes obtener el emparejamiento para 2 tipos como máximo',
		COMMAND_TYPE_NOT_A_TYPE: ({ type }) => `${type} no es un tipo de Pokémon válido`,
		COMMAND_TYPE_QUERY_FAIL: ({ types }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que los ${types
				.map((val) => `\`${val}\``)
				.join(' and ')} son realmente tipos en Pokémon?`,

		/**
		 * ##################
		 * OVERWATCH COMMANDS
		 */

		/**
		 * ###############
		 * SOCIAL COMMANDS
		 */

		COMMAND_SOCIAL_DESCRIPTION: "Configure this guild's member points.",
		COMMAND_SOCIAL_EXTENDED: {
			extendedHelp: "This command allows for updating other members' points.",
			explainedUsage: [
				['set <user> <amount>', 'Sets an amount of points to the user.'],
				['add <user> <amount>', 'Adds an amount of points to the user.'],
				['remove <user> <amount>', 'Removes an amount of points from the user.'],
				['reset <user>', 'Resets all pointss from the user.']
			],
			examples: ['set @kyra 40000', 'add @kyra 2400', 'remove @kyra 3000', 'reset @kyra']
		},
		COMMAND_BANNER_DESCRIPTION: 'Configure the banner for your profile.',
		COMMAND_BANNER_EXTENDED: {
			extendedHelp: 'Banners are vertical in Skyra, they decorate your profile card.',
			explainedUsage: [
				['list', '(Default) Lists all available banners.'],
				['reset', 'Set your displayed banner to default.'],
				['buy <bannerID>', 'Buy a banner, must be an ID.'],
				['set <bannerID>', 'Set your displayed banner, must be an ID.']
			],
			examples: ['list', 'buy 0w1p06', 'set 0w1p06', 'reset']
		},
		COMMAND_TOGGLEDARKMODE_DESCRIPTION: 'Toggle between light and dark templates for your profile and rank cards.',
		COMMAND_TOGGLEDARKMODE_EXTENDED: {
			extendedHelp: 'This command lets you toggle the template used to generate your profile.',
			examples: ['']
		},

		COMMAND_AUTOROLE_DESCRIPTION: '(ADM) List or configure the autoroles for a guild.',
		COMMAND_AUTOROLE_EXTENDED: {
			extendedHelp: `Autoroles? They are roles that are available for everyone, and automatically given when they reach an
					amount of (local) points, an administrator must configure them through a setting command.
					Note that if the role name has spaces in the name you need to put \`'quotes'\` around the name!`,
			explainedUsage: [
				['list', 'Lists all the current autoroles.'],
				['add <role> <amount>', 'Add a new autorole.'],
				['remove <role>', 'Remove an autorole from the list.'],
				['update <role> <amount>', 'Change the required amount of points for an existing autorole.']
			],
			reminder: 'The current system grants a random amount of points between 4 and 8 points, for each post with a 1 minute cooldown.',
			examples: ['list', "add 'Trusted Member' 20000", "update 'Trusted Member' 15000", "remove 'Trusted Member'"]
		},

		COMMAND_BALANCE_DESCRIPTION: 'Check your current balance.',
		COMMAND_BALANCE_EXTENDED: {
			extendedHelp: `The balance command retrieves your amount of ${SHINY}.`
		},
		COMMAND_DAILY_DESCRIPTION: `Get your semi-daily ${SHINY}'s.`,
		COMMAND_DAILY_EXTENDED: {
			extendedHelp: 'Shiiiiny!',
			reminder: [
				'Skyra uses a virtual currency called Shiny, and it is used to buy stuff such as banners or bet it on slotmachines.',
				'You can claim dailies once every 12 hours.'
			].join('\n')
		},
		COMMAND_LEADERBOARD_DESCRIPTION: 'Check the leaderboards.',
		COMMAND_LEADERBOARD_EXTENDED: {
			extendedHelp: `The leaderboard command shows a list of users sorted by their local or global amount of points,
				by default, when using no arguments, it will show the local leaderboard. The leaderboards refresh after 10
					minutes.`,
			reminder: '"Local" leaderboards refer to the guild\'s top list. "Global" refers to all scores from all guilds.'
		},
		COMMAND_LEVEL_DESCRIPTION: 'Check your global level.',
		COMMAND_LEVEL_EXTENDED: {
			extendedHelp: 'How much until the next level?',
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]]
		},
		COMMAND_DIVORCE_DESCRIPTION: 'Break up with your couple!',
		COMMAND_DIVORCE_EXTENDED: {
			extendedHelp: `Sniff... This command is used to break up with your couple, hopefully in this virtual world, you are
					allowed to marry the user again.`
		},
		COMMAND_MARRY_DESCRIPTION: 'Marry somebody!',
		COMMAND_MARRY_EXTENDED: {
			extendedHelp: 'Marry your waifu!',
			explainedUsage: [['user', '(Optional) The user to marry with. If not given, the command will tell you who are you married with.']],
			examples: ['', '@love']
		},
		COMMAND_MYLEVEL_DESCRIPTION: 'Check your local level.',
		COMMAND_MYLEVEL_EXTENDED: {
			extendedHelp: 'How much until next auto role? How many points do I have in this guild?',
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]]
		},
		COMMAND_PAY_DESCRIPTION: `Pay somebody with your ${SHINY}'s.`,
		COMMAND_PAY_EXTENDED: {
			extendedHelp: 'Businessmen! Today is payday!',
			explainedUsage: [
				['money', `Amount of ${SHINY} to pay, you must have the amount you are going to pay.`],
				['user', 'The targeted user to pay. (Must be mention/id)']
			],
			examples: ['200 @kyra']
		},
		COMMAND_PROFILE_DESCRIPTION: 'Check your user profile.',
		COMMAND_PROFILE_EXTENDED: {
			extendedHelp: `This command sends a card image with some of your user profile such as your global rank, experience...
				Additionally, you are able to customize your colours with the 'setColor' command.`,
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]]
		},
		COMMAND_REMINDME_DESCRIPTION: 'Manage your reminders.',
		COMMAND_REMINDME_EXTENDED: {
			extendedHelp: 'This command allows you to set, delete and list reminders.',
			explainedUsage: [
				['action', 'The action, one of "list", "show", "delete", or "create"/"me". Defaults to "list".'],
				['idOrDuration', 'Dependent of action; "list" → ignored; "delete"/"show" → reminder ID; else → duration.'],
				['description', '(Optional) Dependent of action, this is only read when creating a new reminder.']
			],
			examples: ['me 6h to fix this command.', 'list', 'show jedbcuywb', 'delete jedbcuywb']
		},
		COMMAND_REPUTATION_DESCRIPTION: 'Give somebody a reputation point.',
		COMMAND_REPUTATION_EXTENDED: {
			extendedHelp: `This guy is so helpful... I'll give him a reputation point! Additionally, you can check how many
					reputation points a user has by writing 'check' before the mention.`,
			explainedUsage: [
				['check', '(Optional) Whether you want to check somebody (or yours) amount of reputation.'],
				['user', 'The user to give a reputation point.']
			],
			reminder: 'You can give a reputation point once every 24 hours.',
			examples: ['check @kyra', 'check', '@kyra', 'check "User With Spaces"', '"User With Spaces"']
		},
		COMMAND_SETCOLOR_DESCRIPTION: "Change your user profile's color.",
		COMMAND_SETCOLOR_EXTENDED: {
			extendedHelp: 'The setColor command sets a color for your profile.',
			explainedUsage: [['color', 'A color resolvable.']],
			possibleFormats: [
				['HEX', '#dfdfdf'],
				['RGB', 'rgb(200, 200, 200)'],
				['HSL', 'hsl(350, 100, 100)'],
				['B10', '14671839']
			]
		},

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		COMMAND_STAR_DESCRIPTION: 'Get a random starred message from the database or the star leaderboard.',
		COMMAND_STAR_EXTENDED: {
			extendedHelp: 'This command shows a random starred message or the starboard usage and leaderboard for this server.'
		},

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		COMMAND_DM_DESCRIPTION: 'Sends a Direct Message. Reserved for bot owner for replying purposes.',
		COMMAND_DM_EXTENDED: {
			extendedHelp: `The DM command is reserved for bot owner, and it's only used for very certain purposes, such as replying feedback
				messages sent by users.`
		},
		COMMAND_EVAL_DESCRIPTION: 'Evaluates arbitrary Javascript. Reserved for bot owner.',
		COMMAND_EVAL_EXTENDED: {
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
			examples: ['msg.author!.username;', '1 + 1;'],
			multiline: true
		},
		COMMAND_EXEC_DESCRIPTION: 'Execute Order 66.',
		COMMAND_EXEC_EXTENDED: {
			extendedHelp: 'You better not know about this.'
		},
		COMMAND_SETAVATAR_DESCRIPTION: "Set Skyra's avatar.",
		COMMAND_SETAVATAR_EXTENDED: {
			extendedHelp: "This command changes Skyra's avatar. You can send a URL or upload an image attachment to the channel."
		},
		COMMAND_DONATE_DESCRIPTION: 'Get information about how to donate to keep Skyra alive longer.',
		COMMAND_DONATE_EXTENDED: {
			extendedHelp: `
				Skyra Project started on 24th October 2016, if you are reading this, you are
				using the version ${VERSION}, which is the twelfth rewrite. I have
				improved a lot every single function from Skyra, and now, she is extremely fast.

				However, not everything is free, I need your help to keep Skyra alive in a VPS so
				you can enjoy her functions longer. I will be very thankful if you help me, really,
				I have been working on a lot of things, but she is my beautiful baby, take care of her ❤

				Do you want to support this amazing project? Feel free to do so! https://www.patreon.com/kyranet`
		},
		COMMAND_ECHO_DESCRIPTION: 'Make Skyra send a message to this (or another) channel.',
		COMMAND_ECHO_EXTENDED: {
			extendedHelp: 'This should be very obvious...'
		},
		COMMAND_FEEDBACK_DESCRIPTION: "Send a feedback message to the bot's owner.",
		COMMAND_FEEDBACK_EXTENDED: {
			extendedHelp: `This command sends a message to a feedback channel where the bot's owner can read. You'll be replied
					as soon as an update comes.`
		},
		COMMAND_STATS_DESCRIPTION: 'Provides some details about the bot and stats.',
		COMMAND_STATS_EXTENDED: {
			extendedHelp: 'This should be very obvious...'
		},

		/**
		 * ##############
		 * TOOLS COMMANDS
		 */

		COMMAND_AVATAR_DESCRIPTION: "View somebody's avatar in full size.",
		COMMAND_AVATAR_EXTENDED: {
			extendedHelp: "As this command's name says, it shows somebody's avatar. Use the --size flag to change the avatar's size.",
			explainedUsage: [['user', '(Optional) A user mention. Defaults to the author if the input is invalid or not given.']]
		},
		COMMAND_COLOR_DESCRIPTION: 'Display some awesome colours.',
		COMMAND_COLOR_EXTENDED: {
			extendedHelp: 'The color command displays a set of colours with nearest tones given a difference between 1 and 255..',
			explainedUsage: [['color', 'A color resolvable.']],
			possibleFormats: [
				['HEX', '#dfdfdf'],
				['RGB', 'rgb(200, 200, 200)'],
				['HSL', 'hsl(350, 100, 100)'],
				['B10', '14671839']
			],
			examples: ['#dfdfdf >25', 'rgb(200, 130, 75)']
		},
		COMMAND_CONTENT_DESCRIPTION: 'Obtener el contenido sin formato de los mensajes.',
		COMMAND_CONTENT_EXTENDED: {},
		COMMAND_EMOJI_DESCRIPTION: 'Obtén información sobre un emoji.',
		COMMAND_EMOJI_EXTENDED: {},
		COMMAND_EMOTES_DESCRIPTION: 'Muestra todos los gestos personalizados disponibles en este servidor.',
		COMMAND_EMOTES_EXTENDED: {
			extendedHelp: 'La lista de emotes se divide por 50 emotes..'
		},
		COMMAND_EMOTES_TITLE: 'Emotes en',
		COMMAND_PRICE_DESCRIPTION: 'Convert the currency with this tool.',
		COMMAND_PRICE_EXTENDED: {
			extendedHelp: 'Convert between any two currencies, even if they are cryptocurrencies.',
			explainedUsage: [
				['from', 'The currency to convert from'],
				['to', 'The currency to convert to'],
				['amount', 'The amount to convert, will default to 1']
			],
			examples: ['EUR USD', 'USD EUR 5', 'USD BAT 10']
		},
		COMMAND_QUOTE_DESCRIPTION: "Quote another person's message.",
		COMMAND_QUOTE_EXTENDED: {},
		COMMAND_ROLES_DESCRIPTION: 'List all public roles from a guild, or claim/unclaim them.',
		COMMAND_ROLES_EXTENDED: {
			extendedHelp: `Public roles? They are roles that are available for everyone, an administrator must configure
					them with a configuration command.`,
			explainedUsage: [['Roles', 'The list of roles to claim and unclaim. Leave this empty to get a list of roles']],
			reminder: [
				'When using claim/unclaim, the roles can be individual, or multiple.',
				'To claim multiple roles, you must separate them by a comma.',
				'You can specify which roles by writting their ID, name, or a section of the name.'
			].join('\n'),
			examples: ['', 'Designer, Programmer', 'Designer']
		},
		COMMAND_SEARCH_DESCRIPTION: 'Search things from the Internet with DuckDuckGo.',
		COMMAND_SEARCH_EXTENDED: {},
		COMMAND_POLL_DESCRIPTION: 'Simplified reaction-based poll.',
		COMMAND_POLL_EXTENDED: {
			extendedHelp: `spoll stands for "simplified poll". You may want to use this command if you don't want to deal the
					complexity of the other command. Simplified Polls do not track the users who vote nor it filters, it merely reacts
					to your message with three emojis and let the users vote.`,
			examples: ['Should I implement the #anime channel?']
		},
		COMMAND_TOPINVITES_DESCRIPTION: 'Muestra las 10 invitaciones más utilizadas para este servidor.',
		COMMAND_TOPINVITES_EXTENDED: {},
		COMMAND_TOPINVITES_NO_INVITES: '¡No hay invitaciones, o ninguna de ellas ha sido utilizada!',
		COMMAND_TOPINVITES_TOP_10_INVITES_FOR: ({ guild }) => `Las 10 mejores invitaciones para ${guild}`,
		COMMAND_TOPINVITES_EMBED_DATA: {
			CHANNEL: 'Canal',
			LINK: 'Enlace',
			CREATED_AT: 'Fecha de creacion',
			CREATED_AT_UNKNOWN: 'Fecha de creación desconocida',
			EXPIRES_IN: 'Expira en',
			NEVER_EXPIRES: 'Nunca',
			TEMPORARY: 'Invitación temporal',
			USES: 'Usos'
		},
		COMMAND_URBAN_DESCRIPTION: 'Check the definition of a word on UrbanDictionary.',
		COMMAND_URBAN_EXTENDED: {
			extendedHelp: 'What does "spam" mean?',
			explainedUsage: [
				['Word', 'The word or phrase you want to get the definition from.'],
				['Page', 'Defaults to 1, the page you wish to read.']
			],
			examples: ['spam']
		},
		COMMAND_WHOIS_DESCRIPTION: 'Who are you?',
		COMMAND_WHOIS_EXTENDED: {},
		COMMAND_FOLLOWAGE_DESCRIPTION: 'Check how long a Twitch user has been following a channel.',
		COMMAND_FOLLOWAGE_EXTENDED: {
			extendedHelp: 'Just... that.',
			examples: ['dallas cohhcarnage']
		},
		COMMAND_TWITCH_DESCRIPTION: 'Check the information about a Twitch profile.',
		COMMAND_TWITCH_EXTENDED: {
			extendedHelp: 'Really, just that.',
			examples: ['riotgames']
		},
		COMMAND_TWITCHSUBSCRIPTION_DESCRIPTION: 'Manage the subscriptions for your server.',
		COMMAND_TWITCHSUBSCRIPTION_EXTENDED: {
			extendedHelp: `
				Manage the subscriptions for this server.
				__Online Notifications__
				For content, the best way is writing \`--embed\`, the notifications will then show up in MessageEmbeds
				with all available data. Alternatively you can set your own content and it will post as a regular message.
				This content can contain some parameters that will be replaced with Twitch data:
				- \`%TITLE%\` for the stream's title
				- \`%VIEWER_COUNT%\` for the amount of current viewers,
				- \`%GAME_NAME%\` for the title being streamed
				- \`%GAME_ID%\` for the game's ID as seen by Twitch
				- \`%LANGUAGE%\` for the language the stream is in
				- \`%USER_ID%\` for the streamer's ID as seen by Twitch
				- and \`%USER_NAME%\` for the Streamer's twitch username.

				__Offline Notifications__
				For offline events none of the variables above are available and you'll have to write your own content.
				You can still use the \`--embed\` flag for the notification to show in a nice Twitch-purple MessageEmbed.`,
			explainedUsage: [
				[this.list(['add', 'remove', 'reset', 'show'], 'o'), 'The subcommand to trigger.'],
				['streamer', 'The Twitch username of the streamer to get notifications for.'],
				['channel', 'A Discord channel where to post the notifications in.'],
				['status', `The status that the Twitch streamer should get for an notification, one of ${this.list(['online', 'offline'], 'o')}.`],
				['content', 'The message to send in Discord chat. Refer to extended help above for more information.']
			],
			examples: [
				'add favna #twitch online --embed',
				'add favna #twitch online %USER_NAME% went live | %TITLE%',
				'remove kyranet #twitch online',
				'reset kyranet',
				'reset',
				'show kyranet',
				'show'
			],
			multiline: true
		},
		COMMAND_WIKIPEDIA_DESCRIPTION: 'Search something through Wikipedia.',
		COMMAND_WIKIPEDIA_EXTENDED: {},
		COMMAND_YOUTUBE_DESCRIPTION: 'Search something through YouTube.',
		COMMAND_YOUTUBE_EXTENDED: {},

		/**
		 * ################
		 * GOOGLE COMMANDS
		 */

		COMMAND_CURRENTTIME_DESCRIPTION: 'Obtiene la hora actual en cualquier lugar del mundo',
		COMMAND_CURRENTTIME_EXTENDED: {
			extendedHelp: `Este comando usa Google Maps para obtener las coordenadas del lugar,
				este paso también permite el soporte en varios idiomas, ya que es ... Búsqueda de Google.
				Una vez que este comando obtuvo las coordenadas, consulta TimezoneDB para obtener los datos de tiempo`,
			explainedUsage: [['ubicación', 'La localidad, el gobierno, el país o el continente para consultar la hora.']],
			examples: ['Madrid', 'Barcelona']
		},
		COMMAND_CURRENTTIME_LOCATION_NOT_FOUND: 'Lo siento, pero no pude encontrar datos de tiempo para esa ubicación.',
		COMMAND_CURRENTTIME_TITLES: {
			CURRENT_TIME: 'Tiempo actual',
			CURRENT_DATE: 'Fecha actual',
			COUNTRY: 'País',
			GMT_OFFSET: 'GMT Offset',
			DST: ({ dst }) =>
				`**Horario de verano**: ${
					dst === 0 ? 'No observa el horario de verano en este momento' : 'Observa el horario de verano en este momento'
				}`
		},
		COMMAND_GSEARCH_DESCRIPTION: 'Encuentra tus cosas favoritas en Google',
		COMMAND_GSEARCH_EXTENDED: {
			extendedHelp: `Este comando consulta el poderoso motor de búsqueda de Google para encontrar sitios web para su consulta.
			Para imágenes, utilice el comando \`gimage\`.`,
			explainedUsage: [['consulta', 'Lo que quieres encontrar en Google']],
			examples: ['Discord', 'Skyra']
		},
		COMMAND_GIMAGE_DESCRIPTION: 'Encuentra tus imágenes favoritas en Google',
		COMMAND_GIMAGE_EXTENDED: {
			extendedHelp: `Este comando consulta el poderoso motor de búsqueda de Google para encontrar imágenes para su consulta.
				Para obtener resultados web regulares, utilice el comando \`gsearch\`.
				Este comando se ha marcado como NSFW porque es inevitable que cuando consulta contenido explícito, obtendrá resultados explícitos.`,
			explainedUsage: [['consulta', 'La imagen que quieres encontrar en Google']],
			examples: ['Discord', 'Skyra']
		},
		COMMAND_LMGTFY_DESCRIPTION: 'Moleste a otro usuario enviándole un enlace LMGTFY (Permítame Google eso para usted).',
		COMMAND_LMGTFY_EXTENDED: {
			explainedUsage: [['query', 'La consulta a google']]
		},
		COMMAND_WEATHER_DESCRIPTION: 'Check the weather status in a location.',
		COMMAND_WEATHER_EXTENDED: {
			extendedHelp: `Este comando usa Google Maps para obtener las coordenadas del lugar,
				este paso también permite el soporte en varios idiomas, ya que es ... Búsqueda de Google.
				Una vez que este comando obtuvo las coordenadas, consulta a DarkSky para recuperar información sobre el clima.
				Nota: la temperatura está en ** Celsius **`,
			explainedUsage: [['ciudad', 'La localidad, el gobierno, el país o el continente para consultar la hora.']],
			examples: ['Madrid', 'Barcelona']
		},
		GOOGLE_ERROR_ZERO_RESULTS: 'La aplicación no devolvió resultados.',
		GOOGLE_ERROR_REQUEST_DENIED: 'La aplicación GeoCode ha rechazado su solicitud.',
		GOOGLE_ERROR_INVALID_REQUEST: 'Solicitud incorrecta.',
		GOOGLE_ERROR_OVER_QUERY_LIMIT: 'Límite de solicitudes excedida, prueba de nuevo mañana.',
		GOOGLE_ERROR_UNKNOWN: 'Lo siento, pero no pude obtener un resultado de Google.',

		/**
		 * #############
		 * WEEB COMMANDS
		 */

		COMMAND_WBLUSH_DESCRIPTION: 'Blush with a weeb picture!',
		COMMAND_WBLUSH_EXTENDED: {
			extendedHelp: 'Blush with a random weeb image!'
		},
		COMMAND_WCRY_DESCRIPTION: 'Cry to somebody with a weeb picture!',
		COMMAND_WCRY_EXTENDED: {
			extendedHelp: 'Cry with a random weeb image!',
			explainedUsage: [['user', 'The user to cry to.']],
			examples: ['@Skyra']
		},
		COMMAND_WCUDDLE_DESCRIPTION: 'Cuddle somebody with a weeb picture!',
		COMMAND_WCUDDLE_EXTENDED: {
			extendedHelp: 'Unlike the original cuddle command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to cuddle with.']],
			examples: ['@Skyra']
		},
		COMMAND_WDANCE_DESCRIPTION: 'Dance with a weeb picture!',
		COMMAND_WDANCE_EXTENDED: {
			extendedHelp: 'Dance with a random weeb image!'
		},
		COMMAND_WHUG_DESCRIPTION: 'Hug somebody with a weeb picture!',
		COMMAND_WHUG_EXTENDED: {
			extendedHelp: 'Unlike the original hug command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to give the hug.']],
			examples: ['@Skyra']
		},
		COMMAND_WKISS_DESCRIPTION: 'Kiss somebody with a weeb picture!',
		COMMAND_WKISS_EXTENDED: {
			extendedHelp: 'Kiss somebody with a random weeb image!',
			explainedUsage: [['user', 'The user to give the kiss to.']],
			examples: ['@Skyra']
		},
		COMMAND_WLICK_DESCRIPTION: 'Lick somebody with a weeb picture!',
		COMMAND_WLICK_EXTENDED: {
			extendedHelp: 'Lick somebody with a random weeb image!',
			explainedUsage: [['user', 'The user to lick.']],
			examples: ['@Skyra']
		},
		COMMAND_WNOM_DESCRIPTION: 'Nom nom with a 🍞!',
		COMMAND_WNOM_EXTENDED: {
			extendedHelp: "Nom nom nom! Wha~... I'm busy eating!"
		},
		COMMAND_WNEKO_DESCRIPTION: 'Human kittens!',
		COMMAND_WNEKO_EXTENDED: {
			extendedHelp: `Unlike the original kitten command, this one displays random weeb images, the difference is that
					they're weebs... and humans, enjoy!`
		},
		COMMAND_WPAT_DESCRIPTION: "Pats somebody's head!",
		COMMAND_WPAT_EXTENDED: {
			extendedHelp: "Pat somebody's head with a random weeb image!",
			explainedUsage: [['user', 'The user to pat with.']],
			examples: ['@Skyra']
		},
		COMMAND_WPOUT_DESCRIPTION: 'I feel somebody... mad',
		COMMAND_WPOUT_EXTENDED: {
			extendedHelp: 'Show your expression with a random weeb image!'
		},
		COMMAND_WSLAP_DESCRIPTION: 'Slap somebody with a weeb picture!',
		COMMAND_WSLAP_EXTENDED: {
			extendedHelp: 'Unlike the original slap command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to slap.']],
			examples: ['@Pete']
		},
		COMMAND_WSMUG_DESCRIPTION: 'Smug',
		COMMAND_WSMUG_EXTENDED: {
			extendedHelp: 'Just an anime smug face!'
		},
		COMMAND_WSTARE_DESCRIPTION: '*Stares*',
		COMMAND_WSTARE_EXTENDED: {
			extendedHelp: '*Still stares at you*',
			explainedUsage: [['user', 'The user to stare at.']],
			examples: ['@Pete']
		},
		COMMAND_WTICKLE_DESCRIPTION: 'Give tickles to somebody with a weeb picture!',
		COMMAND_WTICKLE_EXTENDED: {
			extendedHelp: 'Tickle somebody!',
			explainedUsage: [['user', 'The user to tickle.']],
			examples: ['@Skyra']
		},
		COMMAND_WBANG_DESCRIPTION: 'Bang 💥🔫!',
		COMMAND_WBANG_EXTENDED: {
			extendedHelp: 'Shoot a user with a random weeb image!',
			explainedUsage: [['user', 'The user to shoot.']],
			examples: ['@Skyra']
		},
		COMMAND_WBANGHEAD_DESCRIPTION: "STAHP! I'm banging my head here!",
		COMMAND_WBANGHEAD_EXTENDED: {
			extendedHelp: 'Bang your head with a random weeb image!'
		},
		COMMAND_WBITE_DESCRIPTION: '*nom nom* you are delicious!',
		COMMAND_WBITE_EXTENDED: {
			extendedHelp: 'Bite a user with a random weeb image!',
			explainedUsage: [['user', 'The user to bite.']],
			examples: ['@Skyra']
		},
		COMMAND_WGREET_DESCRIPTION: 'Say hi! to another user',
		COMMAND_WGREET_EXTENDED: {
			extendedHelp: 'Greet a user with a random weeb image!',
			explainedUsage: [['user', 'The user to greet.']],
			examples: ['@Skyra']
		},
		COMMAND_WLEWD_DESCRIPTION: 'Lewds! Lewds! Lewds!',
		COMMAND_WLEWD_EXTENDED: {
			extendedHelp: 'Random lewd weeb image!'
		},
		COMMAND_WPUNCH_DESCRIPTION: '*pow* 👊👊',
		COMMAND_WPUNCH_EXTENDED: {
			extendedHelp: 'Punch that annoying user with a random weeb image!',
			explainedUsage: [['user', 'The user to punch.']],
			examples: ['@Skyra']
		},
		COMMAND_WSLEEPY_DESCRIPTION: "I'm so sleeeeepy... *yawn*",
		COMMAND_WSLEEPY_EXTENDED: {
			extendedHelp: 'Show how sleepy you are with a random weeb image!'
		},
		COMMAND_WSMILE_DESCRIPTION: "Huh, because I'm happy. Clap along if you feel like a room without a roof",
		COMMAND_WSMILE_EXTENDED: {
			extendedHelp: 'Show just how happy you are with a random weeb image!'
		},
		COMMAND_WTHUMBSUP_DESCRIPTION: 'Raise your thumb into the air in a magnificent show of approval',
		COMMAND_WTHUMBSUP_EXTENDED: {
			extendedHelp: 'Raise your thumb with a random weeb image!'
		},

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
		COMMAND_ANIME_INVALID_CHOICE: '¡Esa opción no es válida! Selecciona otra opción, por favor.',
		COMMAND_ANIME_OUTPUT_DESCRIPTION: ({ entry, synopsis }) =>
			[
				`**Título inglés:** ${entry.titles.en || entry.titles.en_us || 'Ninguno'}`,
				`**Título japonés:** ${entry.titles.ja_jp || 'Ninguno'}`,
				`**Título canónico:** ${entry.canonicalTitle || 'Ninguno'}`,
				synopsis ?? 'No hay sinopsis disponible para este título.'
			].join('\n'),
		COMMAND_ANIME_EMBED_DATA: {
			TYPE: 'Tipo',
			SCORE: 'Puntuación',
			EPISODES: 'Episodio(s)',
			EPISODE_LENGTH: 'Duración del episodio',
			AGE_RATING: 'Clasificación de edad',
			FIRST_AIR_DATE: 'Primera fecha de emisión',
			WATCH_IT: 'Míralo Aquí:',
			STILL_AIRING: 'Aún se transmite'
		},
		COMMAND_MANGA_OUTPUT_DESCRIPTION: ({ entry, synopsis }) =>
			[
				`**Título inglés:** ${entry.titles.en || entry.titles.en_us || 'Ninguno'}`,
				`**Título japonés:** ${entry.titles.ja_jp || 'Ninguno'}`,
				`**Título canónico:** ${entry.canonicalTitle || 'Ninguno'}`,
				synopsis ?? 'No hay sinopsis disponible para este título.'
			].join('\n'),
		COMMAND_MANGA_TYPES: {
			MANGA: '📘 Manga',
			NOVEL: '📕 Novela',
			MANHWA: '🇰🇷 Manhwa',
			'ONE-SHOT': '☄ Cameo',
			SPECIAL: '🎴 Especial'
		},
		COMMAND_MANGA_EMBED_DATA: {
			AGE_RATING: 'Clasificación de edad',
			FIRST_PUBLISH_DATE: 'Primera fecha de publicación',
			READ_IT: 'Léelo Aquí:',
			SCORE: 'Puntuación',
			TYPE: 'Tipo',
			NONE: 'Ninguno'
		},
		COMMAND_WAIFU_FOOTER: 'Imagen por thiswaifudoesnotexist.net',

		/**
		 * #####################
		 * ANNOUNCEMENT COMMANDS
		 */

		COMMAND_SUBSCRIBE_NO_ROLE: 'Este servidor no configuró el rol para los anuncios.',
		COMMAND_SUBSCRIBE_SUCCESS: ({ role }) => `Concedido con éxito el rol: **${role}**`,
		COMMAND_UNSUBSCRIBE_SUCCESS: ({ role }) => `Removido con éxito el rol: **${role}***`,
		COMMAND_SUBSCRIBE_NO_CHANNEL: 'Este servidor no tiene un canal de anuncios configurado.',
		COMMAND_ANNOUNCEMENT: ({ role }) => `**Nuevo anuncio para** ${role}`,
		COMMAND_ANNOUNCEMENT_SUCCESS: 'Se ha publicado un nuevo anuncio con éxito.',
		COMMAND_ANNOUNCEMENT_CANCELLED: 'Se ha cancelado el anuncio con éxito.',
		COMMAND_ANNOUNCEMENT_PROMPT: 'Éste es el contenido que será mandado al canal de anuncios. ¿Quiere enviarlo ahora?',
		COMMAND_ANNOUNCEMENT_EMBED_MENTIONS: ({ header, mentions }) =>
			`${header}${mentions.length ? `, y mencionando a: ${this.list(mentions, 'y')}` : ''}:`,

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		COMMAND_INVITE_DESCRIPTION: 'Muestra el enlace para invitarme.',
		COMMAND_INVITE_EXTENDED: {
			extendedHelp:
				'Si desea obtener un enlace donde Skyra no solicitará ningún permiso, agregue `noperms`, `--noperms` o `--nopermissions` al comando.',
			examples: ['', 'noperms', '--noperms', '--nopermissions']
		},
		COMMAND_INVITE: () =>
			[
				`Para añadir Skyra a tu servidor: <${this.client.invite}>`,
				'No tengas miedo de quitar algunos permisos, Skyra te hará saber si estás intentando ejecutar un comando sin los permisos requeridos.'
			].join('\n'),
		COMMAND_INVITE_NO_PERMS: () => `Para añadir Skyra a tu servidor: <https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot>`,
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
		COMMAND_HELP_DATA: {
			TITLE: ({ description }) => `${description}`,
			USAGE: ({ usage }) => `📝 | ***Uso del Comando***\n\`${usage}\`\n`,
			EXTENDED: ({ extendedHelp }) => `🔍 | ***Descripción Extendida***\n${extendedHelp}`,
			FOOTER: ({ name }) => `Ayuda de comando para ${name}`
		},
		COMMAND_SUPPORT_EMBED_TITLE: ({ username }) => `¿Necesita ayuda, ${username}?`,
		COMMAND_SUPPORT_EMBED_DESCRIPTION:
			"¡Entonces deberías unirte a [Skyra's lounge](https://join.skyra.pw)! Allí, puede recibir ayuda de los desarrolladores y otros miembros de la comunidad.",

		/**
		 * #####################
		 * DEVELOPERS COMMANDS
		 */

		COMMAND_YARN_DESCRIPTION: 'Responde con información sobre un paquete NodeJS utilizando el registro del paquete Yarn.',
		COMMAND_YARN_EXTENDED: {
			extendedHelp: `Esto es para los desarrolladores de NodeJS que desean encontrar rápidamente información sobre un paquete publicado en npm [npm](https://npmjs.com)`,
			explainedUsage: [['package', 'El nombre del paquete a buscar debe ser una coincidencia exacta']],
			examples: ['@skyra/char', '@skyra/saelem', '@skyra/eslint-config']
		},
		COMMAND_YARN_NO_PACKAGE: `${REDCROSS} Lo siento, pero tienes que darme el nombre de un paquete para buscarlo.`,
		COMMAND_YARN_UNPUBLISHED_PACKAGE: ({ pkg }) => `¡Qué desarrollador tan tonto que hizo \`${pkg}\`! ¡No lo publicaron!`,
		COMMAND_YARN_PACKAGE_NOT_FOUND: ({ pkg }) => `Lo siento, pero no pude encontrar ningún paquete con el nombre de \`${pkg}\` en el registro.`,
		COMMAND_YARN_EMBED_DATA: {
			DESCRIPTION: ({
				author,
				dateCreated,
				dateModified,
				dependencies,
				deprecated,
				description,
				latestVersionNumber,
				license,
				mainFile,
				maintainers
			}) =>
				[
					description,
					'',
					`❯ Autor: ${author}`,
					`❯ Mantenedores: ${this.list(maintainers, 'y')}`,
					`❯ Ultima versión: ${latestVersionNumber}`,
					`❯ Licencia: ${license}`,
					`❯ Archivo principal: ${mainFile}`,
					`❯ Fecha de creacion: ${dateCreated}`,
					`❯ Fecha modificada: ${dateModified}`,
					deprecated ? `❯ Aviso de desuso: **${deprecated}**` : undefined,
					'',
					dependencies && dependencies.length ? this.list(dependencies, 'y') : `Sin dependencias ${GREENTICK}!`
				].join('\n'),
			MORE_TEXT: 'más...'
		},

		/**
		 * ##############
		 * FUN COMMANDS
		 */

		COMMAND_8BALL_OUTPUT: ({ author, question, response }) => `🎱 Pregunta por ${author}: *${question}*\n${response}`,
		COMMAND_8BALL_QUESTIONS: {
			WHEN: /^¿?cu[áa]ndo/i,
			WHAT: /^¿?qu[ée]/i,
			HOW_MUCH: /^¿?cu[áa]nto/i,
			HOW_MANY: /^¿?cu[áa]nto/i,
			WHY: /^¿?por qu[ée]/i,
			WHO: /^¿?qui[ée]n/i
		},
		COMMAND_8BALL_WHEN: createPick(['Pronto™', 'Quizá mañana.', 'Quizá el año que viene...', 'Ahora mismo.', 'En unos cuantos meses.']),
		COMMAND_8BALL_WHAT: createPick(['Un avión.', '¿Qué? Pregunta de nuevo.', '¡Un regalo!', 'Nada.', 'Un anillo.', 'No lo sé, quizá sea algo.']),
		COMMAND_8BALL_HOW_MUCH: createPick([
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
		COMMAND_8BALL_HOW_MANY: createPick([
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
			'Quizás.',
			'Como yo lo veo, sí.',
			'Pregúnteme mañana.',
			'No lo sé, pregúntaselo a un físico.',
			'Mejor no decirte ahora.',
			'No cuentes con eso.',
			'Es cierto.',
			'Es decididamente así.',
			'Mis fuentes dicen que no.',
			'No tiene muy buena pinta.',
			'Tiene buena pinta.',
			'No pude procesar mi respuesta, inténtalo de nuevo.',
			'Un pajarito me susurró al oído diciendo que sí.',
			'Muy dudoso.',
			'Sin duda.',
			'Definitivamente, sí.',
			'Puedes confiar en ello.'
		]),

		COMMAND_CATFACT_TITLE: 'Hecho Gatuno',
		COMMAND_CHOICE_OUTPUT: ({ user, word }) => `🕺 *Pito, pito, gorgorito, ¿dónde vas tan bonito?...* ${user}, Elijo:${codeBlock('', word)}`,
		COMMAND_CHOICE_MISSING: 'Por favor, escribe al menos dos opciones separadas con coma.',
		COMMAND_CHOICE_DUPLICATES: ({ words }) => `¿Por qué aceptaría palabras duplicadas? '${words}'.`,
		COMMAND_DICE_OUTPUT: ({ result }) => `¡Lanzaste el dado! Obteniste: **${result}**`,
		COMMAND_DICE_ROLLS_ERROR: 'La cantidad de lanzamientos debe ser un número entre 1 y 1024.',
		COMMAND_DICE_SIDES_ERROR: 'La cantidad de lados debe ser un número entre 3 y 1024.',
		COMMAND_ESCAPEROPE_OUTPUT: ({ user }) => `**${user}** usó **Cuerda Huída**`,
		COMMAND_LOVE_LESS45: 'Prueba de nuevo la próxima vez...',
		COMMAND_LOVE_LESS75: '¡Bastante bien!',
		COMMAND_LOVE_LESS100: '¡Haríais una gran pareja!',
		COMMAND_LOVE_100: '¡Emparejamiento perfecto!',
		COMMAND_LOVE_ITSELF: 'Eres una criatura muy especial y deberías amarte a tí mismo más que a los demás <3',
		COMMAND_LOVE_RESULT: 'Resultado',
		COMMAND_MARKOV_TIMER: ({ timer }) => `Processed in ${timer}.`,
		COMMAND_MARKOV_NO_MESSAGES: 'The channel or user has no messages.',
		COMMAND_NORRIS_OUTPUT: 'Chuck Norris',
		COMMAND_RATE_OUTPUT: ({ author, userToRate, rate, emoji }) =>
			`**${author}**, Uhm... le daría a **${userToRate}** un **${rate}**/100 ${emoji}`,
		COMMAND_RATE_MYSELF: ['me quiero a mí misma mucho 😊', 'yo'],
		COMMAND_PUN_ERROR: 'Something went wrong. Try again later.',
		COMMAND_XKCD_COMICS: ({ amount }) => `Hay ${amount} comics.`,
		COMMAND_XKCD_NOTFOUND:
			'He buscado en todos los rincones, pero no he tenido suerte encontrando este comic, ¡prueba más tarde o prueba con otro!',

		/**
		 * ##############
		 * GAMES COMMANDS
		 */

		COMMAND_GAMES_SKYRA: 'I am sorry, I know you want to play with me, but if I do, I will not be able to help other people! 💔',
		COMMAND_GAMES_BOT: 'I am sorry, but I do not think they would like to stop doing what they are doing and play with humans.',
		COMMAND_GAMES_SELF: 'You must be so sad to play against yourself. Try again with another user.',
		COMMAND_GAMES_PROGRESS: 'I am sorry, but there is a game in progress in this channel, try again when it finishes.',
		COMMAND_GAMES_NO_PLAYERS: ({ prefix }) =>
			`Por favor, especifique algunos homenajes para jugar a los Juegos del Hambre, así: \`${prefix}hg Bob, Mark, Jim, Kyra\``,
		COMMAND_GAMES_TOO_MANY_OR_FEW: ({ min, max }) => `I am sorry but the amount of players is less than ${min} or greater than ${max}.`,
		COMMAND_GAMES_REPEAT: 'Lo siento, pero un usuario no puede jugar dos veces.',
		COMMAND_GAMES_PROMPT_TIMEOUT: 'I am sorry, but the challengee did not reply on time.',
		COMMAND_GAMES_PROMPT_DENY: 'I am sorry, but the challengee refused to play.',
		COMMAND_GAMES_TIMEOUT: '**The match concluded in a draw due to lack of a response (60 seconds)**',
		COMMAND_C4_PROMPT: ({ challenger, challengee }) =>
			`Dear ${challengee}, you have been challenged by ${challenger} in a Connect-Four match. Reply with **yes** to accept!`,
		COMMAND_C4_START: ({ player }) => `Let's play! Turn for: **${player}**.`,
		COMMAND_C4_GAME_COLUMN_FULL: 'This column is full. Please try another. ',
		COMMAND_C4_GAME_WIN: ({ user, turn }) => `${user} (${turn === 0 ? 'blue' : 'red'}) won!`,
		COMMAND_C4_GAME_DRAW: 'This match concluded in a **draw**!',
		COMMAND_C4_GAME_NEXT: ({ user, turn }) => `Turn for: ${user} (${turn === 0 ? 'blue' : 'red'}).`,
		COMMAND_C4_DESCRIPTION: 'Play Connect-Four with somebody.',
		COMMAND_C4_EXTENDED: {
			extendedHelp: `This game is better played on PC. Connect Four (also known as Captain's Mistress, Four Up, Plot
					Four, Find Four, Four in a Row, Four in a Line and Gravitrips (in Soviet Union)) is a two-player connection
					game in which the players first choose a color and then take turns dropping colored discs from the top into a
					seven-column, ~~six~~ five-row vertically suspended grid.`
		},
		COMMAND_COINFLIP_DESCRIPTION: '¡Lanza una moneda!',
		COMMAND_COINFLIP_EXTENDED: {
			extendedHelp: `Lanza una moneda. Si adivina el lado que aparece, recupera su apuesta, duplicada.
			Si no lo haces, pierdes tu apuesta. Ahora consigue esas monedas volteando.`,
			examples: ['heads 50', 'tails 200']
		},
		COMMAND_COINFLIP_INVALID_COINNAME: ({ arg }) => `Disculpe, pero ${arg} no es una cara de moneda!`,
		COMMAND_COINFLIP_COINNAMES: ['Cabezas', 'Cruz'],
		COMMAND_COINFLIP_WIN_TITLE: '¡Ganaste!',
		COMMAND_COINFLIP_LOSE_TITLE: 'Perdiste.',
		COMMAND_COINFLIP_NOGUESS_TITLE: 'Lanzaste una moneda.',
		COMMAND_COINFLIP_WIN_DESCRIPTION: ({ result, wager }) =>
			`La moneda fue lanzada y mostró ${result}. ${wager ? `Adivinaste correctamente y ganaste ${wager} ${SHINY}` : 'Lo entendiste bien'}!`,
		COMMAND_COINFLIP_LOSE_DESCRIPTION: ({ result, wager }) =>
			`La moneda fue lanzada y mostró${result}. No adivinaste correctamente ${wager ? `y perdido ${wager} ${SHINY}.` : ''}.`,
		COMMAND_COINFLIP_NOGUESS_DESCRIPTION: ({ result }) => `La moneda fue lanzada y mostró ${result}.`,
		COMMAND_HIGHERLOWER_DESCRIPTION: 'Comenzar un juego de Mayor/Menor',
		COMMAND_HIGHERLOWER_EXTENDED: {
			extendedHelp: `Mayor/Menor es un juego de suerte. Elegiré un número y tendrás que adivinar si el próximo número que elijo será **mayor** o **menor** que el actual, usando los ⬆ o ⬇ emojis
			Sus ganancias aumentan a medida que avanza en las rondas, y puede retirar dinero en cualquier momento presionando el 💰 reacción emoji .
			¡Pero ten cuidado! ¡Cuanto más lejos vayas, más posibilidades tendrás de perderlo todo!`
		},
		COMMAND_HIGHERLOWER_LOADING: `${LOADING} Comenzar un nuevo juego de Mayor/Meno`,
		COMMAND_HIGHERLOWER_NEWROUND: 'Bien. Comenzando una nueva ronda',
		COMMAND_HIGHERLOWER_EMBED: {
			TITLE: ({ turn }) => `¿Mayor o menor? | Turno ${turn}`,
			DESCRIPTION: ({ number }) => `Su número es ${number}. ¿Será el siguiente mayor o menor?`,
			FOOTER: 'El juego caducará en 3 minutos, ¡así que actúa rápido!'
		},
		COMMAND_HIGHERLOWER_LOSE: {
			TITLE: '¡Perdiste!',
			DESCRIPTION: ({ number, losses }) => `No lo entendiste del todo. El número era ${number}. Perdiste ${losses} ${SHINY}`,
			FOOTER: '¡Mejor suerte la próxima vez!'
		},
		COMMAND_HIGHERLOWER_WIN: {
			TITLE: '¡Ganaste!',
			DESCRIPTION: ({ potentials, number }) =>
				`El número era ${number}. ¿Quieres continuar? Con otro intento, puedes ganar ${potentials} ${SHINY}`,
			FOOTER: '¡Actúa rapido! No tienes mucho tiempo.'
		},
		COMMAND_HIGHERLOWER_CANCEL: {
			TITLE: 'Juego cancelado por elección',
			DESCRIPTION: ({ username }) => `Gracias por jugar, ¡${username}! Estaré aquí por si quieres continuar.`
		},
		COMMAND_HIGHERLOWER_CASHOUT: ({ amount }) => `${amount} ${SHINY} fueron directo a a su cuenta. ¡Espero que haya sido divertido!`,
		COMMAND_HUNGERGAMES_RESULT_HEADER: ({ game }) => (game.bloodbath ? 'Bloodbath' : game.sun ? `Day ${game.turn}` : `Night ${game.turn}`),
		COMMAND_HUNGERGAMES_RESULT_DEATHS: ({ deaths }) => `**${deaths} cannon ${deaths === 1 ? 'shot' : 'shots'} can be heard in the distance.**`,
		COMMAND_HUNGERGAMES_RESULT_PROCEED: 'Proceed?',
		COMMAND_HUNGERGAMES_STOP: 'Game finished by choice! See you later!',
		COMMAND_HUNGERGAMES_WINNER: ({ winner }) => `And the winner is... ${winner}!`,
		COMMAND_HUNGERGAMES_DESCRIPTION: 'Play Hunger Games with your friends!',
		COMMAND_HUNGERGAMES_EXTENDED: {
			extendedHelp: 'Enough discussion, let the games begin!',
			examples: ['Skyra, Katniss, Peeta, Clove, Cato, Johanna, Brutus, Blight']
		},
		COMMAND_SLOTMACHINE_DESCRIPTION: `I bet 100${SHINY} you ain't winning this round.`,
		COMMAND_SLOTMACHINE_EXTENDED: {
			extendedHelp: `Una máquina tragamonedas (inglés americano), conocida como máquina de frutas (inglés británico),
					puggy (inglés escocés), máquinas tragamonedas (inglés canadiense y americano), máquinas de póquer / pokies
					(inglés australiano e inglés de Nueva Zelanda), o simplemente tragamonedas (Inglés americano),
					es una máquina de juego de casino con tres o más carretes que giran cuando se presiona un botón.`,
			explainedUsage: [['Cantidad', 'Ya sea 50, 100, 200, 500 o incluso, 1000 shinies para apostar.']],
			reminder: 'Recibirá al menos 5 veces la cantidad (cerezas / tada) al ganar, y hasta 24 veces (siete, diamante sin piel).'
		},
		COMMAND_SLOTMACHINES_WIN: ({ roll, winnings }) => `**You rolled:**\n${roll}\n**Congratulations!**\nYou won ${winnings}${SHINY}!`,
		COMMAND_SLOTMACHINES_LOSS: ({ roll }) => `**You rolled:**\n${roll}\n**Mission failed!**\nWe'll get em next time!`,
		COMMAND_SLOTMACHINE_CANVAS_TEXT: ({ won }) => (won ? 'Tú ganaste' : 'Tú perdiste'),
		COMMAND_SLOTMACHINE_TITLES: {
			PREVIOUS: 'Anterior',
			NEW: 'Nuevo'
		},
		COMMAND_TICTACTOE_DESCRIPTION: 'Play Tic-Tac-Toe with somebody.',
		COMMAND_TICTACTOE_EXTENDED: {
			extendedHelp: `Tic-tac-toe (también conocido como ceros y cruces o Xs y Os) es un juego de papel y lápiz para dos jugadores,
				X y O, que se turnan para marcar los espacios en una cuadrícula de 3 × 3.
				El jugador que logra colocar tres de sus marcas en una fila horizontal,
				vertical o diagonal gana el juego.`
		},
		COMMAND_TICTACTOE_PROMPT: ({ challenger, challengee }) =>
			`Querido ${challenger}, ${challengee} te ha desafiado en un partido de tres en raya. Responda con **yes** para aceptar`,
		COMMAND_TICTACTOE_TURN: ({ icon, player, board }) => `(${icon}) Girar para ${player}!\n${board}`,
		COMMAND_TICTACTOE_WINNER: ({ winner, board }) => `El ganador es ...${winner}!\n${board}`,
		COMMAND_TICTACTOE_DRAW: ({ board }) => `Este partido concluyó en un **empate**!\n${board}`,
		COMMAND_TRIVIA_DESCRIPTION: 'Play a game of Trivia.',
		COMMAND_TRIVIA_EXTENDED: {
			extendedHelp: [
				'Answer questions of trivia here, with categories ranging from books to mythology! (powered by OpenTDB)',
				'',
				`**Categories**: ${Object.keys(CATEGORIES).join(', ')}`
			].join('\n'),
			explainedUsage: [
				['category', 'The category questions are asked from.'],
				['type', 'The type of question asked: can be boolean (true/false) or multiple choice.'],
				['difficulty', 'The difficulty level of the questions asked.'],
				['duration', 'The amount of time you get to answer.']
			],
			examples: ['trivia history.', 'trivia books multiple easy.', 'trivia videogames 45.'],
			multiline: true
		},
		COMMAND_TRIVIA_INVALID_CATEGORY: 'Invalid category: Please use `Skyra, help trivia` for a list of categories.',
		COMMAND_TRIVIA_ACTIVE_GAME: 'A game of trivia is already being played in this channel',
		COMMAND_TRIVIA_INCORRECT: ({ attempt }) => `I am sorry, but **${attempt}** is not the correct answer. Better luck next time!`,
		COMMAND_TRIVIA_NO_ANSWER: ({ correctAnswer }) => `Looks like nobody got it! The right answer was **${correctAnswer}**.`,
		COMMAND_TRIVIA_EMBED_TITLES: {
			TRIVIA: 'Trivia',
			DIFFICULTY: 'Difficulty'
		},
		COMMAND_TRIVIA_WINNER: ({ winner, correctAnswer }) => `We have a winner! ${winner} had a right answer with **${correctAnswer}**!`,
		COMMAND_VAULT_DESCRIPTION: `Guarde sus ${SHINY} de forma segura en una bóveda para que no pueda gastarlos accidentalmente en juegos de azar.`,
		COMMAND_VAULT_EXTENDED: {
			extendedHelp: `Esto es para los gastadores codiciosos entre nosotros que tienden a jugar demasiado en la máquina tragamonedas o girar la rueda de la fortuna.
				Debes retirar activamente a los ${SHINY} de tu bóveda antes de que puedan gastarse el juego.`,
			explainedUsage: [
				['acción', 'La acción a realizar: **retirarse** para retirarse de su bóveda o **depositar** para depositar en su bóveda.'],
				['dinero', `La cantidad de ${SHINY} para retirar o depositar.`]
			],
			examples: ['depositar 10000.', 'retirar 10000.']
		},
		COMMAND_VAULT_EMBED_DATA: {
			DEPOSITED_DESCRIPTION: ({ coins }) => `Depositó ${coins} ${SHINY} del saldo de su cuenta en su bóveda.`,
			WITHDREW_DESCRIPTION: ({ coins }) => `Retiró ${coins} ${SHINY} de su bóveda.`,
			SHOW_DESCRIPTION: 'Su cuenta corriente y saldo de caja fuerte son:',
			ACCOUNT_MONEY: 'Dinero de la cuenta',
			ACCOUNT_VAULT: 'Bóveda de cuenta'
		},
		COMMAND_VAULT_INVALID_COINS: 'Lo siento, pero esa es una cantidad inválida de monedas. ¡Asegúrese de que sea un número positivo!',
		COMMAND_VAULT_NOT_ENOUGH_MONEY: ({ money }) =>
			`Lo siento, ¡pero no tienes suficiente dinero para hacer ese depósito! Su saldo monetario actual es ${money}${SHINY}`,
		COMMAND_VAULT_NOT_ENOUGH_IN_VAULT: ({ vault }) =>
			`Lo siento, ¡pero no tienes suficiente almacenado en tu bóveda para hacer esa retirada! Su saldo actual es ${vault}${SHINY}`,
		COMMAND_WHEELOFFORTUNE_DESCRIPTION: 'Juega con tus shinies haciendo girar una rueda de la fortuna.',
		COMMAND_WHEELOFFORTUNE_EXTENDED: {
			extendedHelp: `Puede perder 0.1, 0.2, 0.3 o 0.5 veces su entrada
				o ganar 1.2, 1.5, 1.7 o 2.4 veces su entrada.`
		},
		COMMAND_WHEELOFFORTUNE_TITLES: {
			PREVIOUS: 'Anterior',
			NEW: 'Nuevo'
		},
		COMMAND_WHEELOFFORTUNE_CANVAS_TEXT: ({ won }) => (won ? 'Tú ganaste' : 'Tú perdiste'),
		GAMES_NOT_ENOUGH_MONEY: ({ money }) =>
			`Lo siento, ¡pero no tienes suficiente dinero para pagar tu apuesta! El saldo de su cuenta corriente es ${money}${SHINY}`,
		GAMES_CANNOT_HAVE_NEGATIVE_MONEY: `No puedes tener una cantidad negativa de ${SHINY}s`,

		/**
		 * #################
		 * GIVEAWAY COMMANDS
		 */

		GIVEAWAY_TIME: 'El sorteo debe durar al menos 10 seconds.',
		GIVEAWAY_TIME_TOO_LONG: '¡Oye! ¡Eso es un tiempo increíblemente largo para contarlo con los dedos de mis manos!',
		GIVEAWAY_ENDS_AT: 'Termina en:',
		GIVEAWAY_DURATION: ({ time }) => `This giveaway ends in **${duration(time)}**! React to this message with 🎉 to join.`,
		GIVEAWAY_TITLE: '🎉 **GIVEAWAY** 🎉',
		GIVEAWAY_LASTCHANCE: ({ time }) => `**LAST CHANCE**! Remaining time: **${duration(time)}**. React to this message with 🎉 to join.`,
		GIVEAWAY_LASTCHANCE_TITLE: '🎉 **LAST CHANCE GIVEAWAY** 🎉',
		GIVEAWAY_ENDED: ({ winners }) => (winners.length === 1 ? `Ganador/a: ${winners[0]}` : `Ganadores: ${winners.join(', ')}`),
		GIVEAWAY_ENDED_NO_WINNER: 'No winner...',
		GIVEAWAY_ENDED_AT: 'Ended at:',
		GIVEAWAY_ENDED_TITLE: '🎉 **GIVEAWAY ENDED** 🎉',
		GIVEAWAY_ENDED_MESSAGE: ({ winners, title }) => `Congratulations ${winners.join(' ')}! You won the giveaway **${title}**`,
		GIVEAWAY_ENDED_MESSAGE_NO_WINNER: ({ title }) => `The giveaway **${title}** ended without enough participants.`,
		GIVEAWAY_SCHEDULED: ({ scheduledTime }) => `El sorteo comenzará en ${duration(scheduledTime)}.`,

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		COMMAND_NICK_SET: ({ nickname }) => `Changed the nickname to **${nickname}**.`,
		COMMAND_NICK_CLEARED: 'Nickname cleared.',
		COMMAND_PERMISSIONNODES_HIGHER: `${REDCROSS} You cannot modify nor preview the permission nodes for this target.`,
		COMMAND_PERMISSIONNODES_INVALID_TYPE: `${REDCROSS} Invalid type, expected either of \`allow\` or \`deny\`.`,
		COMMAND_PERMISSIONNODES_ADD: `${GREENTICK} Successfully added the command to the permission node.`,
		COMMAND_PERMISSIONNODES_NODE_NOT_EXISTS: `${REDCROSS} The selected permission node does not exist.`,
		COMMAND_PERMISSIONNODES_COMMAND_NOT_EXISTS: `${REDCROSS} The selected command does not exist in the permision node.`,
		COMMAND_PERMISSIONNODES_REMOVE: `${GREENTICK} Successfully removed the command from the permission node.`,
		COMMAND_PERMISSIONNODES_RESET: `${GREENTICK} Successfully removed all commands from the permission node.`,
		COMMAND_PERMISSIONNODES_SHOW: ({ name, allow, deny }) =>
			[
				`Permissions for: __${name}__`,
				`**Allow**: ${allow.length ? allow.join(', ') : 'None'}`,
				`**Deny**: ${deny.length ? deny.join(', ') : 'None'}`
			].join('\n'),
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
		COMMAND_SERVERINFO_ROLES: ({ roles }) => `**Roles**\n\n${roles}`,
		COMMAND_SERVERINFO_NOROLES: 'Roles? Where? There is no other than the `@everyone` role!',
		COMMAND_SERVERINFO_CHANNELS: ({ text, voice, categories, afkChannel, afkTime }) =>
			[
				`• **${text}** Text, **${voice}** Voice, **${categories}** categories.`,
				`• AFK: ${afkChannel ? `**<#${afkChannel}>** after **${afkTime / 60}**min` : '**None**.'}`
			].join('\n'),
		COMMAND_SERVERINFO_MEMBERS: ({ count, owner }) =>
			[`• **${count}** members`, `• Owner: **${owner.tag}**`, `  (ID: **${owner.id}**)`].join('\n'),
		COMMAND_SERVERINFO_OTHER: ({ size, region, createdAt, verificationLevel }) =>
			[
				`• Roles: **${size}**`,
				`• Region: **${region}**`,
				`• Created at: **${timestamp.displayUTC(createdAt)}** (UTC - YYYY/MM/DD)`,
				`• Verification Level: **${this.HUMAN_LEVELS[verificationLevel]}**`
			].join('\n'),
		COMMAND_ROLEINFO_TITLES: { PERMISSIONS: 'Permissions' },
		COMMAND_ROLEINFO: ({ role }) =>
			[
				`ID: **${role.id}**`,
				`Name: **${role.name}**`,
				`Color: **${role.hexColor}**`,
				`Hoisted: **${role.hoist ? 'Yes' : 'No'}**`,
				`Position: **${role.rawPosition}**`,
				`Mentionable: **${role.mentionable ? 'Yes' : 'No'}**`
			].join('\n'),
		COMMAND_ROLEINFO_ALL: 'All Permissions granted.',
		COMMAND_ROLEINFO_PERMISSIONS: ({ permissions }) =>
			permissions.length > 0 ? permissions.map((key) => `+ **${PERMS[key]}**`).join('\n') : 'Permissions not granted.',
		COMMAND_FILTER_UNDEFINED_WORD: 'You must write what you want me to filter.',
		COMMAND_FILTER_FILTERED: ({ filtered }) => `This word is ${filtered ? 'already' : 'not'} filtered.`,
		COMMAND_FILTER_ADDED: ({ word }) => `${GREENTICK} Success! Added the word ${word} to the filter.`,
		COMMAND_FILTER_REMOVED: ({ word }) => `${GREENTICK} Success! Removed the word ${word} from the filter.`,
		COMMAND_FILTER_RESET: `${GREENTICK} Success! The filter has been reset.`,
		COMMAND_FILTER_SHOW_EMPTY: 'The list of filtered words is empty!',
		COMMAND_FILTER_SHOW: ({ words }) => `There is the list of all filtered words: ${words}`,
		COMMAND_MANAGEATTACHMENTS_REQUIRED_VALUE: 'You must input a value for this type.',
		COMMAND_MANAGEATTACHMENTS_INVALID_ACTION: 'The type must be `ban`, `kick`, `mute`, or `softban`.',
		COMMAND_MANAGEATTACHMENTS_MAXIMUM: ({ value: maximum }) => `${GREENTICK} Successfully set the maximum amount of attachments to ${maximum}.`,
		COMMAND_MANAGEATTACHMENTS_EXPIRE: ({ value: time }) =>
			`${GREENTICK} Successfully set the lifetime for the manager's entries to ${duration(time)}.`,
		COMMAND_MANAGEATTACHMENTS_DURATION: ({ value: time }) =>
			`${GREENTICK} Successfully set the duration for moderation logs to ${duration(time)}.`,
		COMMAND_MANAGEATTACHMENTS_ACTION: `${GREENTICK} Successfully changed the moderative action for the manager.`,
		COMMAND_MANAGEATTACHMENTS_LOGS: `${GREENTICK} Successfully changed the preferences for message logging.`,
		COMMAND_MANAGEATTACHMENTS_ENABLED: ({ value: enabled }) =>
			`${GREENTICK} Successfully ${enabled ? 'enabled' : 'disabled'} the attachment management.`,

		/**
		 * #################################
		 * MANAGEMENT/CONFIGURATION COMMANDS
		 */

		COMMAND_MANAGECOMMANDAUTODELETE_TEXTCHANNEL:
			'You must input a valid text channel, people cannot use commands in a voice or a category channel!',
		COMMAND_MANAGECOMMANDAUTODELETE_REQUIRED_DURATION: 'You must specify an amount of seconds for the command to be automatically deleted.',
		COMMAND_MANAGECOMMANDAUTODELETE_SHOW_EMPTY: 'There are no command autodelete configured right now.',
		COMMAND_MANAGECOMMANDAUTODELETE_SHOW: ({ codeblock }) => `All command autodeletes configured:${codeblock}`,
		COMMAND_MANAGECOMMANDAUTODELETE_ADD: ({ channel, time }) =>
			`${GREENTICK} Success! All successful commands in ${channel} will be deleted after ${duration(time)}!`,
		COMMAND_MANAGECOMMANDAUTODELETE_REMOVE: ({ channel }) =>
			`${GREENTICK} Success! Commands will not be automatically deleted in ${channel} anymore!`,
		COMMAND_MANAGECOMMANDAUTODELETE_REMOVE_NOTSET: ({ channel }) =>
			`${REDCROSS} The channel ${channel} was not configured to automatically delete messages!`,
		COMMAND_MANAGECOMMANDAUTODELETE_RESET: 'All the command autodeletes have been reset.',
		COMMAND_MANAGECOMMANDCHANNEL_TEXTCHANNEL: 'You must input a valid text channel, people cannot use commands in a voice or a category channel!',
		COMMAND_MANAGECOMMANDCHANNEL_REQUIRED_COMMAND: "You must specify what command do you want to add or remove from the channel's filter.",
		COMMAND_MANAGECOMMANDCHANNEL_SHOW: ({ channel, commands }) => `List of disabled commands in ${channel}: ${commands}`,
		COMMAND_MANAGECOMMANDCHANNEL_SHOW_EMPTY: 'The list of disabled commands for the specified channel is empty!',
		COMMAND_MANAGECOMMANDCHANNEL_ADD_ALREADYSET: 'The command you are trying to disable is already disabled!',
		COMMAND_MANAGECOMMANDCHANNEL_ADD: ({ channel, command }) => `Successfully disabled the command ${command} for the channel ${channel}!`,
		COMMAND_MANAGECOMMANDCHANNEL_REMOVE_NOTSET: ({ channel }) => `The command you are trying to enable was not disabled for ${channel}.`,
		COMMAND_MANAGECOMMANDCHANNEL_REMOVE: ({ channel, command }) => `Successfully enabled the command ${command} for the channel ${channel}!`,
		COMMAND_MANAGECOMMANDCHANNEL_RESET_EMPTY: 'This channel had no disabled command, so I decided to do nothing.',
		COMMAND_MANAGECOMMANDCHANNEL_RESET: ({ channel }) => `Successfully enabled all disabled commands in ${channel}, enjoy!`,
		COMMAND_MANAGEREACTIONROLES_SHOW_EMPTY: 'There are no reaction roles set up in this server.',
		COMMAND_MANAGEREACTIONROLES_ADD_CHANNEL: ({ emoji, channel }) =>
			`${GREENTICK} Success! I will now give the role when people react with ${emoji} to any message from ${channel}!`,
		COMMAND_MANAGEREACTIONROLES_ADD_PROMPT: 'Listening now! Please react to a message and I will bind the reaction with the role!',
		COMMAND_MANAGEREACTIONROLES_ADD_MISSING: 'I waited, but you did not seem to have reacted to a message.',
		COMMAND_MANAGEREACTIONROLES_ADD: ({ emoji, url }) =>
			`${GREENTICK} Success! I will now give the role when people react with ${emoji} at ${url}!`,
		COMMAND_MANAGEREACTIONROLES_REMOVE_NOTEXISTS: 'The reaction role you specified does not exist.',
		COMMAND_MANAGEREACTIONROLES_REMOVE: ({ emoji, url }) =>
			`${GREENTICK} Success! I will not longer give the role when people react with ${emoji} at ${url}!`,
		COMMAND_MANAGEREACTIONROLES_RESET_EMPTY: 'There were no reaction roles set up.',
		COMMAND_MANAGEREACTIONROLES_RESET: `${GREENTICK} Successfully removed all reaction roles.`,
		COMMAND_SETSTARBOARDEMOJI_SET: ({ emoji }) => `Successfully set a new emoji for the next star messages: ${emoji}`,
		CONFIGURATION_TEXTCHANNEL_REQUIRED: 'The selected channel is not a valid text channel, try again with another.',
		CONFIGURATION_EQUALS: 'Successfully configured: no changes were made.',
		COMMAND_SETIGNORECHANNELS_SET: ({ channel }) => `Ignoring all command input from ${channel} now.`,
		COMMAND_SETIGNORECHANNELS_REMOVED: ({ channel }) => `Listening all command input from ${channel} now.`,
		COMMAND_SETIMAGELOGS_SET: ({ channel }) => `Establezca correctamente el canal de registros de imagen en ${channel}.`,
		COMMAND_SETMEMBERLOGS_SET: ({ channel }) => `Establecer correctamente el canal de registros de miembros en ${channel}.`,
		COMMAND_SETMESSAGELOGS_SET: ({ channel }) => `Establezca correctamente el canal de registros de mensajes en ${channel}.`,
		COMMAND_SETMODLOGS_SET: ({ channel }) => `Establezca con éxito el canal de registros de modificaciones en ${channel}.`,
		COMMAND_SETPREFIX_SET: ({ prefix }) => `Successfully set the prefix to ${prefix}. Use ${prefix}setPrefix <prefix> to change it again.`,

		/**
		 * ###########################
		 * MANAGEMENT/MEMBERS COMMANDS
		 */

		COMMAND_STICKYROLES_REQUIRED_USER: 'A user target is required for this command to work.',
		COMMAND_STICKYROLES_REQUIRED_ROLE: 'A role name is required when adding or removing a role.',
		COMMAND_STICKYROLES_NOTEXISTS: ({ user }) => `The user ${user} does not have any sticky roles or does not have the specified one.`,
		COMMAND_STICKYROLES_RESET: ({ user }) => `Successfully removed all sticky roles from ${user}.`,
		COMMAND_STICKYROLES_REMOVE: ({ user }) => `Successfully removed the specified role from ${user}.`,
		COMMAND_STICKYROLES_ADD_EXISTS: ({ user }) => `The user ${user} already had the specified role as sticky.`,
		COMMAND_STICKYROLES_ADD: ({ user }) => `Successfully added the specified role as sticky to ${user}.`,
		COMMAND_STICKYROLES_SHOW_EMPTY: 'There are no sticky roles to show.',
		COMMAND_STICKYROLES_SHOW_SINGLE: ({ user, roles }) => `Sticky Role(s) for **${user}**: \`${roles.join('`, `')}\`.`,

		/**
		 * #############
		 * MISC COMMANDS
		 */

		COMMAND_RANDREDDIT_REQUIRED_REDDIT: 'You must give the name of a reddit.',
		COMMAND_RANDREDDIT_INVALID_ARGUMENT: `${REDCROSS} The name you gave was not a valid name for a subreddit.`,
		COMMAND_RANDREDDIT_BANNED: 'This reddit is banned and should not be used.',
		COMMAND_RANDREDDIT_FAIL: 'I failed to retrieve data, are you sure you wrote the reddit correctly?',
		COMMAND_RANDREDDIT_ALL_NSFW: 'Nothing could be posted as all retrieved posts are NSFW.',
		COMMAND_RANDREDDIT_ALL_NSFL: 'Nothing could be posted as all retrieved posts are NSFL. You do not want to see that.',
		COMMAND_RANDREDDIT_MESSAGE: ({ title, author, url }) => `**${title}** submitted by ${author}\n${url}`,
		COMMAND_RANDREDDIT_ERROR_PRIVATE: `${REDCROSS} No data could be downloaded as the subreddit is marked as private.`,
		COMMAND_RANDREDDIT_ERROR_QUARANTINED: `${REDCROSS} No data could be downloaded as the subreddit is marked as quarantined.`,
		COMMAND_RANDREDDIT_ERROR_NOT_FOUND: `${REDCROSS} No data could be downloaded as the subreddit does not exist.`,
		COMMAND_RANDREDDIT_ERROR_BANNED: `${REDCROSS} No data could be downloaded as the subreddit is marked as banned.`,
		COMMAND_REDDITUSER_COMPLEXITY_LEVELS: ['muy bajo', 'bajo', 'medio', 'alto', 'muy alto', 'muy alto'],
		COMMAND_REDDITUSER_INVALID_USER: ({ user }) => `\`${user}\` no es un nombre de usuario de Reddit válido`,
		COMMAND_REDDITUSER_QUERY_FAILED: 'No se pudieron encontrar datos para ese usuario de reddit',
		COMMAND_REDDITUSER_TITLES: {
			LINK_KARMA: 'Link Karma',
			COMMENT_KARMA: 'Comentar Karma',
			TOTAL_COMMENTS: 'Comentarios totales',
			TOTAL_SUBMISSIONS: 'Presentaciones totales',
			COMMENT_CONTROVERSIALITY: 'Comentario controversialidad',
			TEXT_COMPLEXITY: 'Complejidad de texto',
			TOP_5_SUBREDDITS: 'Top 5 Subreddits',
			BY_SUBMISSIONS: 'por sumisión',
			BY_COMMENTS: 'por comentarios',
			BEST_COMMENT: 'Mejor comentario',
			WORST_COMMENT: 'Peor comentario'
		},
		COMMAND_REDDITUSER_DATA: {
			OVERVIEW_FOR: ({ user }) => `Resumen de/u/${user}`,
			PERMALINK: 'Enlace permanente',
			DATA_AVAILABLE_FOR: 'Los datos están disponibles para los últimos 1000 comentarios y presentaciones (limitación de la API de Reddit)',
			JOINED_REDDIT: ({ timestamp }) => `Se unió a Reddit ${timestamp}`
		},
		COMMAND_SNIPE_EMPTY: 'There are no sniped messages in this channel.',
		COMMAND_SNIPE_TITLE: 'Sniped Message',
		COMMAND_UPVOTE_MESSAGE:
			'Here is the link: **<https://botsfordiscord.com/bot/266624760782258186>**! Some perks for upvoters are coming very soon! Remember, you can vote every 24 hours.',
		COMMAND_VAPORWAVE_OUTPUT: ({ str }) => `Here is your converted message:\n${str}`,

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		COMMAND_PERMISSIONS: ({ username, id }) => `Permissions for ${username} (${id})`,
		COMMAND_PERMISSIONS_ALL: 'All Permissions',
		COMMAND_RAID_DISABLED: 'The Anti-RAID system is not enabled in this server.',
		COMMAND_RAID_MISSING_KICK: `As I do not have the **${PERMS.KICK_MEMBERS}** permission, I will keep the Anti-RAID unactivated.`,
		COMMAND_RAID_LIST: 'List of users in the RAID queue',
		COMMAND_RAID_CLEAR: 'Successfully cleared the RAID list.',
		COMMAND_RAID_COOL: 'Successfully deactivated the RAID.',
		COMMAND_FLOW: ({ amount }) => `${amount} messages have been sent within the last minute.`,
		COMMAND_TIME_TIMED: 'The selected moderation case has already been timed.',
		COMMAND_TIME_UNDEFINED_TIME: 'You must specify a time.',
		COMMAND_TIME_UNSUPPORTED_TIPE: 'The type of action for the selected case cannot be reverse, therefore this action is unsupported.',
		COMMAND_TIME_NOT_SCHEDULED: 'This task is not scheduled.',
		COMMAND_TIME_ABORTED: ({ title }) => `Successfully aborted the schedule for ${title}`,
		COMMAND_TIME_SCHEDULED: ({ title, user, time }) =>
			`${GREENTICK} Successfully scheduled a moderation action type **${title}** for the user ${user.tag} (${
				user.id
			}) with a duration of ${duration(time)}`,

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		COMMAND_SLOWMODE_SET: ({ cooldown }) =>
			cooldown === 0 ? 'The cooldown for this channel has been reset.' : `The cooldown for this channel has been set to ${duration(cooldown)}.`,
		COMMAND_SLOWMODE_TOO_LONG: `${REDCROSS} The maximum amount of time you can set is 6 hours.`,
		COMMAND_BAN_NOT_BANNABLE: 'The target is not bannable for me.',
		COMMAND_DEHOIST_EMBED: {
			TITLE: ({ users }) => `Finished dehoisting ${users} members`,
			DESCRIPTION_NOONE: 'No members were dehoisted. A round of applause for your law-abiding users!',
			DESCRIPTION_WITHERRORS: ({ users, errored }) =>
				`${users} member${users > 1 ? 's' : ''} ${
					users > 1 ? 'were' : 'was'
				} dehoisted. We also tried to dehoist an additional ${errored} member${users > 1 ? 's' : ''}, but they errored out`,
			DESCRIPTION: ({ users }) => `${users} member${users > 1 ? 's' : ''} ${users > 1 ? 'were' : 'was'} dehoisted`,
			FIELD_ERROR_TITLE: 'The users we encountered an error for:'
		},
		COMMAND_KICK_NOT_KICKABLE: 'The target is not kickable for me.',
		COMMAND_LOCKDOWN_LOCK: ({ channel }) => `The channel ${channel} is now locked.`,
		COMMAND_LOCKDOWN_LOCKING: ({ channel }) => `${LOADING} Locking the channel ${channel}... I might not be able to reply after this.`,
		COMMAND_LOCKDOWN_LOCKED: ({ channel }) => `The channel ${channel} was already locked.`,
		COMMAND_LOCKDOWN_UNLOCKED: ({ channel }) => `The channel ${channel} was not locked.`,
		COMMAND_LOCKDOWN_OPEN: ({ channel }) => `The lockdown for the channel ${channel} has been released.`,
		COMMAND_MUTE_LOWLEVEL: 'I am sorry, there is no Mute role configured. Please ask an Administrator or the Guild Owner to set it up.',
		COMMAND_MUTE_CONFIGURE_CANCELLED: 'Prompt aborted, the Mute role creation has been cancelled.',
		COMMAND_MUTE_CONFIGURE: 'Do you want me to create and configure the Mute role now?',
		COMMAND_MUTE_CONFIGURE_TOOMANY_ROLES: 'There are too many roles (250). Please delete a role before proceeding.',
		COMMAND_MUTE_MUTED: 'The target user is already muted.',
		COMMAND_MUTE_USER_NOT_MUTED: 'This user is not muted.',
		COMMAND_MUTE_UNCONFIGURED: 'This guild does not have a **Muted** role. Aborting command execution.',
		COMMAND_MUTECREATE_MISSING_PERMISSION: `I need the **${PERMS.MANAGE_ROLES}** permission to create the role and **${PERMS.MANAGE_CHANNELS}** to edit the channels permissions.`,
		COMMAND_RESTRICT_LOWLEVEL: `${REDCROSS} I am sorry, there is no restriction role configured. Please ask an Administrator or the server owner to set i up.`,
		COMMAND_PRUNE_INVALID: `${REDCROSS} You did not specify the arguments correctly, please make sure you gave a correct limit or filter.`,
		COMMAND_PRUNE: ({ amount, total }) => `Successfully deleted ${amount} ${amount === 1 ? 'message' : 'messages'} from ${total}.`,
		COMMAND_PRUNE_INVALID_POSITION: `${REDCROSS} Position must be one of "before" or "after".`,
		COMMAND_PRUNE_INVALID_FILTER: `${REDCROSS} Filtro debe ser uno de "archivo", "autor", "bot", "humano", "invitación", "enlace" o "skyra".`,
		COMMAND_PRUNE_NO_DELETES: 'No message has been deleted, either no message match the filter or they are over 14 days old.',
		COMMAND_PRUNE_LOG_HEADER:
			'The following messages have been generated by request of a moderator.\nThe date formatting is of `YYYY/MM/DD hh:mm:ss`.',
		COMMAND_PRUNE_LOG_MESSAGE: ({ channel, author, amount }) =>
			`${amount} ${amount === 1 ? 'message' : 'messages'} deleted in ${channel} by ${author}.`,
		COMMAND_PRUNE_POSITIONS: new Map([
			['before', Position.Before],
			['b', Position.Before],
			['after', Position.After],
			['a', Position.After]
		]),
		COMMAND_PRUNE_FILTERS: new Map([
			['archivo', Filter.Attachments],
			['archivos', Filter.Attachments],
			['subida', Filter.Attachments],
			['subidas', Filter.Attachments],
			['autor', Filter.Author],
			['yo', Filter.Author],
			['bot', Filter.Bots],
			['bots', Filter.Bots],
			['robot', Filter.Bots],
			['robots', Filter.Bots],
			['humano', Filter.Humans],
			['humanos', Filter.Humans],
			['invitacion', Filter.Invites],
			['invitación', Filter.Invites],
			['invitaciones', Filter.Invites],
			['enlace', Filter.Links],
			['enlaces', Filter.Links],
			['skyra', Filter.Skyra],
			['tu', Filter.Skyra],
			['tú', Filter.Skyra]
		]),
		COMMAND_REASON_MISSING_CASE: 'You need to provide a case or a case range.',
		COMMAND_REASON_NOT_EXISTS: ({ range }) => `The selected modlog${range ? 's' : ''} don't seem to exist.`,
		COMMAND_REASON_UPDATED: ({ entries, newReason }) =>
			[
				entries.length === 1 ? `${GREENTICK} Actualizado 1 caso.` : `${GREENTICK} Actualizados ${entries.length} casos.`,
				` └─ **Set the${entries.length === 1 ? '' : 'ir'} reason to:** ${newReason}`
			].join('\n'),
		COMMAND_TOGGLEMODERATIONDM_TOGGLED: ({ value }) =>
			value ? `${GREENTICK} Successfully enabled moderation DMs.` : `${GREENTICK} Successfully disabled moderation DMs.`,
		COMMAND_UNBAN_MISSING_PERMISSION: `I will need the **${PERMS.BAN_MEMBERS}** permission to be able to unban.`,
		COMMAND_UNMUTE_MISSING_PERMISSION: `I will need the **${PERMS.MANAGE_ROLES}** permission to be able to unmute.`,
		COMMAND_VMUTE_MISSING_PERMISSION: `I will need the **${PERMS.MUTE_MEMBERS}** permission to be able to voice unmute.`,
		COMMAND_VMUTE_USER_NOT_MUTED: 'This user is not voice muted.',
		COMMAND_WARN_DM: ({ moderator, guild, reason }) => `You have been warned by ${moderator} in ${guild} for the reason: ${reason}`,
		COMMAND_WARN_MESSAGE: ({ user, log }) => `|\`🔨\`| [Case::${log}] **WARNED**: ${user.tag} (${user.id})`,
		COMMAND_MODERATION_OUTPUT: ({ cases, range, users, reason }) =>
			`${GREENTICK} Created ${cases.length === 1 ? 'case' : 'cases'} ${range} | ${users.join(', ')}.${
				reason ? `\nWith the reason of: ${reason}` : ''
			}`,
		COMMAND_MODERATION_FAILED: ({ users }) => `${REDCROSS} Failed to moderate ${users.length === 1 ? 'user' : 'users'}:\n${users.join('\n')}`,
		COMMAND_MODERATION_DM: ({ guild, title, reason, duration: pDuration }) => ({
			DESCRIPTION: [
				`**❯ Server**: ${guild}`,
				`**❯ Type**: ${title}`,
				pDuration ? `**❯ Duration**: ${duration(pDuration)}` : null,
				`**❯ Reason**: ${reason || 'None specified'}`
			]
				.filter((line) => line !== null)
				.join('\n'),
			FOOTER: 'To disable moderation DMs, write `toggleModerationDM`.'
		}),
		COMMAND_MODERATION_DAYS: /d[ií]as?/i,

		/**
		 * ###############
		 * SOCIAL COMMANDS
		 */

		COMMAND_AUTOROLE_POINTS_REQUIRED: 'You must input a valid amount of points.',
		COMMAND_AUTOROLE_UPDATE_CONFIGURED: 'This role is already configured as an autorole. Use the remove type instead.',
		COMMAND_AUTOROLE_UPDATE_UNCONFIGURED: 'This role is not configured as an autorole. Use the add type instead.',
		COMMAND_AUTOROLE_UPDATE: ({ role, points, before }) =>
			`Updated autorole: ${role.name} (${role.id}). Points required: ${points} (before: ${before})`,
		COMMAND_AUTOROLE_REMOVE: ({ role, before }) => `Removed the autorole: ${role.name} (${role.id}), which required ${before} points.`,
		COMMAND_AUTOROLE_ADD: ({ role, points }) => `Added new autorole: ${role.name} (${role.id}). Points required: ${points}`,
		COMMAND_AUTOROLE_LIST_EMPTY: 'There is no role configured as an autorole in this server.',
		COMMAND_AUTOROLE_UNKNOWN_ROLE: ({ role }) => `Unknown role: ${role}`,
		COMMAND_BALANCE: ({ user, amount }) => `The user ${user} has a total of ${amount}${SHINY}`,
		COMMAND_BALANCE_SELF: ({ amount }) => `You have a total of ${amount}${SHINY}`,
		COMMAND_BALANCE_BOTS: `I think they have 5 gears as much, bots don't have ${SHINY}`,
		COMMAND_SOCIAL_MEMBER_NOTEXISTS: `${REDCROSS} The member is not in this server, and is not in my database either.`,
		COMMAND_SOCIAL_ADD: ({ user, amount, added }) =>
			`${GREENTICK} Successfully added ${added} point${added === 1 ? '' : 's'} to ${user}. Current amount: ${amount}.`,
		COMMAND_SOCIAL_REMOVE: ({ user, amount, removed }) =>
			`${GREENTICK} Successfully removed ${removed} point${removed === 1 ? '' : 's'} to ${user}. Current amount: ${amount}.`,
		COMMAND_SOCIAL_UNCHANGED: ({ user }) => `${REDCROSS} The user ${user} already had the given amount of points, no update was needed.`,
		COMMAND_SOCIAL_RESET: ({ user }) => `${GREENTICK} The user ${user} got his points removed.`,
		COMMAND_BANNER_MISSING: ({ type }) => `You must specify a banner id to ${type}.`,
		COMMAND_BANNER_NOTEXISTS: ({ prefix }) =>
			`This banner id does not exist. Please check \`${prefix}banner list\` for a list of banners you can buy.`,
		COMMAND_BANNER_USERLIST_EMPTY: ({ prefix }) =>
			`You did not buy a banner yet. Check \`${prefix}banner list\` for a list of banners you can buy.`,
		COMMAND_BANNER_RESET_DEFAULT: 'You are already using the default banner.',
		COMMAND_BANNER_RESET: 'Your banner has been reset to the default.',
		COMMAND_BANNER_SET_NOT_BOUGHT: 'You did not buy this banner yet.',
		COMMAND_BANNER_SET: ({ banner }) => `${GREENTICK} **Success**. You have set your banner to: __${banner}__`,
		COMMAND_BANNER_BOUGHT: ({ prefix, banner }) =>
			`You already have this banner, you may want to use \`${prefix}banner set ${banner}\` to make it visible in your profile.`,
		COMMAND_BANNER_MONEY: ({ money, cost }) =>
			`You do not have enough money to buy this banner. You have ${money}${SHINY}, the banner costs ${cost}${SHINY}`,
		COMMAND_BANNER_PAYMENT_CANCELLED: `${REDCROSS} The payment has been cancelled.`,
		COMMAND_BANNER_BUY: ({ banner }) => `${GREENTICK} **Success**. You have bought the banner: __${banner}__`,
		COMMAND_BANNER_PROMPT:
			'Reply to this message choosing an option:\n`all` to check a list of all available banners.\n`user` to check a list of all bought banners.',
		COMMAND_TOGGLEDARKMODE_TOGGLED: ({ enabled }) =>
			enabled ? `${GREENTICK} Successfully enabled the dark mode.` : `${GREENTICK} Successfully disabled the dark mode.`,
		COMMAND_DAILY_TIME: ({ time }) => `El siguiente pago está disponible en: ${duration(time)}`,
		COMMAND_DAILY_TIME_SUCCESS: ({ amount }) => `¡Yuhu! ¡Has obtenido ${amount}${SHINY}! Siguiente pago en: 12 horas.`,
		COMMAND_DAILY_GRACE: ({ remaining }) =>
			[
				'¿Te gustaría recibir el pago temprano? El tiempo restante será añadido al periodo normal de espera, de 12 horas.',
				`Tiempo restante: ${duration(remaining)}`
			].join('\n'),
		COMMAND_DAILY_GRACE_ACCEPTED: ({ amount, remaining }) =>
			`¡Dinero dinero! ¡Has recibido ${amount}${SHINY}! Siguiente pago en: ${duration(remaining)}`,
		COMMAND_DAILY_GRACE_DENIED: '¡De acuerdo! ¡Vuelve pronto!',
		COMMAND_LEVEL: {
			LEVEL: 'Nivel',
			EXPERIENCE: 'Experiencia',
			NEXT_IN: 'Siguiente nivel en'
		},
		COMMAND_DIVORCE_NOTTAKEN: 'Who would you divorce? You are not even taken!',
		COMMAND_DIVORCE_PROMPT: 'Ooh... that sounds quite bad 💔... are you 100% sure about this?',
		COMMAND_DIVORCE_CANCEL: 'Oh lord. I am very glad you will continue with your partner!',
		COMMAND_DIVORCE_DM: ({ user }) => `Pardon... but... do you remember ${user}? He decided to break up with you 💔!`,
		COMMAND_DIVORCE_SUCCESS: ({ user }) => `Successful divorce 💔... You are no longer married to ${user}!`,
		COMMAND_MARRY_WITH: ({ users }) => `Dear, how could you forget it... You are currently married to ${this.list(users, 'y')}!`,
		COMMAND_MARRY_NOTTAKEN: 'Uh... I am sorry, but I am not aware of you being married... have you tried proposing to somebody?',
		COMMAND_MARRY_SKYRA: 'I am sorry, I know you love me, but I am already taken by a brave man I love 💞!',
		COMMAND_MARRY_SNEYRA: 'In your dreams. She is my sister, I am not letting somebody harm her!',
		COMMAND_MARRY_BOTS: 'Oh no! You should not be marrying bots! They still do not understand what true love is, and they are not warm!',
		COMMAND_MARRY_SELF: 'No! This is not how this works! You cannot marry yourself, who would you spend your life with? 💔',
		COMMAND_MARRY_AUTHOR_TAKEN: ({ author }) =>
			`You are already married. Is your love big enough for two people? <@${author.id}>, reply with **yes** to confirm!`,
		COMMAND_MARRY_AUTHOR_MULTIPLE_CANCEL: ({ user }) => `Cancelling. Your commitment to ${user} is admirable.`,
		COMMAND_MARRY_TAKEN: ({ spousesCount }) =>
			`This user is already married to ${spousesCount === 1 ? 'someone' : `${spousesCount} people`}. Would you like to join their harem?`,
		COMMAND_MARRY_ALREADY_MARRIED: ({ user }) => `You are already married with ${user}, did you forget it?`,
		COMMAND_MARRY_AUTHOR_TOO_MANY: ({ limit }) => `${REDCROSS} Ya estás casado con demasiadas personas, ¡tu límite de casamientos es ${limit}!`,
		COMMAND_MARRY_TARGET_TOO_MANY: ({ limit }) =>
			`${REDCROSS} La persona a la que intentas casarte ya está casada con demasiadas personas, ¡su límite de casamientos es ${limit}!`,
		COMMAND_MARRY_MULTIPLE_CANCEL: "Cancelling. Don't worry, you'll find someone you don't have to share!",
		COMMAND_MARRY_PETITION: ({ author, user }) =>
			`Fresh pair of eyes! ${author.username} is proposing to ${user.username}! 💞 <@${user.id}>, reply with **yes** to accept!`,
		COMMAND_MARRY_NOREPLY: 'The user did not reply on time... Maybe it was a hard decision?',
		COMMAND_MARRY_DENIED: 'O-oh... The user rejected your proposal! 💔',
		COMMAND_MARRY_ACCEPTED: ({ author, user }) => `Congratulations dear ${author}! You're now officially married with ${user}! ❤`,
		COMMAND_MYLEVEL: ({ points, next, user }) => `The user ${user} has a total of ${points} points.${next}`,
		COMMAND_MYLEVEL_SELF: ({ points, next }) => `You have a total of ${points} points.${next}`,
		COMMAND_MYLEVEL_NEXT: ({ remaining, next }) => `Points for next rank: **${remaining}** (at ${next} points).`,
		COMMAND_PAY_MISSING_MONEY: ({ needed, has }) => `I am sorry, but you need ${needed}${SHINY} and you have ${has}${SHINY}`,
		COMMAND_PAY_PROMPT: ({ user, amount }) => `You are about to pay ${user} ${amount}${SHINY}, are you sure you want to proceed?`,
		COMMAND_PAY_PROMPT_ACCEPT: ({ user, amount }) => `Payment accepted, ${amount}${SHINY} has been sent to ${user}'s profile.`,
		COMMAND_PAY_PROMPT_DENY: 'Payment denied.',
		COMMAND_PAY_SELF: 'If I taxed this, you would lose money, therefore, do not try to pay yourself.',
		COMMAND_SOCIAL_PAY_BOT: 'Oh, sorry, but money is meaningless for bots, I am pretty sure a human would take advantage of it better.',
		COMMAND_PROFILE: {
			GLOBAL_RANK: 'Posición Mundial',
			CREDITS: 'Créditos | Bóveda',
			REPUTATION: 'Reputación',
			EXPERIENCE: 'Experiencia',
			LEVEL: 'Nivel'
		},
		COMMAND_REMINDME_CREATE: ({ id }) => `A reminder with ID \`${id}\` has been created.`,
		COMMAND_REMINDME_CREATE_NO_DURATION: 'You must tell me what you want me to remind you and when.',
		COMMAND_REMINDME_CREATE_NO_DESCRIPTION: 'Algo, no me dijiste qué.',
		COMMAND_REMINDME_DELETE_NO_ID: "To delete a previously created reminder, you must type 'delete' followed by the ID.",
		COMMAND_REMINDME_DELETE: ({ task }) =>
			`The reminder with ID \`${task.id}\` and with a remaining time of **${duration(
				task.time.getTime() - Date.now()
			)}** has been successfully deleted.`,
		COMMAND_REMINDME_LIST_EMPTY: 'You do not have any active reminder',
		COMMAND_REMINDME_SHOW_FOOTER: ({ id }) => `ID: ${id} | Ends at:`,
		COMMAND_REMINDME_INVALID_ID: 'I am sorry, but the ID provided does not seem to be valid.',
		COMMAND_REMINDME_NOTFOUND: 'I cannot find something here. The reminder either never existed or it ended.',

		COMMAND_REPUTATION_TIME: ({ remaining }) => `You can give a reputation point in ${duration(remaining)}`,
		COMMAND_REPUTATION_USABLE: 'You can give a reputation point now.',
		COMMAND_REPUTATION_USER_NOTFOUND: 'You must mention a user to give a reputation point.',
		COMMAND_REPUTATION_SELF: 'You cannot give a reputation point to yourself.',
		COMMAND_REPUTATION_BOTS: 'You cannot give a reputation point to bots.',
		COMMAND_REPUTATION_GIVE: ({ user }) => `You have given a reputation point to **${user}**!`,
		COMMAND_REPUTATIONS_BOTS: 'Bots cannot have reputation points...',
		COMMAND_REPUTATIONS_SELF: ({ points }) => `You have a total of ${points} reputation points.`,
		COMMAND_REPUTATIONS: ({ user, points }) =>
			`The user ${user} has a total of ${points === 1 ? 'one reputation point' : `${points} reputation points`}.`,
		COMMAND_REQUIRE_ROLE: 'I am sorry, but you must provide a role for this command.',
		COMMAND_SCOREBOARD_POSITION: ({ position }) => `Your placing position is: ${position}`,
		COMMAND_SETCOLOR: ({ color }) => `Color changed to ${color}`,
		COMMAND_SOCIAL_PROFILE_NOTFOUND: 'I am sorry, but this user profile does not exist.',
		COMMAND_SOCIAL_PROFILE_BOT: 'I am sorry, but Bots do not have a __Member Profile__.',
		COMMAND_SOCIAL_PROFILE_DELETE: ({ user, points }) =>
			`${GREENTICK} **Success**. Deleted the __Member Profile__ for **${user}**, which had ${points} points.`,
		COMMAND_SOCIAL_POINTS: 'May you specify the amount of points you want to add or remove?',
		COMMAND_SOCIAL_UPDATE: ({ action, amount, user, before, now }) =>
			`You have just ${action === 'add' ? 'added' : 'removed'} ${amount} ${
				amount === 1 ? 'point' : 'points'
			} to the __Member Profile__ for ${user}. Before: ${before}; Now: ${now}.`,

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		COMMAND_STAR_NOSTARS: 'There is no starred message.',
		COMMAND_STAR_STATS: 'Starboard Stats',
		COMMAND_STAR_STATS_DESCRIPTION: ({ messages, stars }) =>
			`${messages} ${messages === 1 ? 'message' : 'messages'} starred with a total of ${stars} ${stars === 1 ? 'star' : 'stars'}.`,
		COMMAND_STAR_TOPSTARRED: 'Top Starred Posts',
		COMMAND_STAR_TOPSTARRED_DESCRIPTION: ({ medal, id, stars }) => `${medal}: ${id} (${stars} ${stars === 1 ? 'star' : 'stars'})`,
		COMMAND_STAR_TOPRECEIVERS: 'Top Star Receivers',
		COMMAND_STAR_TOPRECEIVERS_DESCRIPTION: ({ medal, id, stars }) => `${medal}: <@${id}> (${stars} ${stars === 1 ? 'star' : 'stars'})`,

		/**
		 * ####################
		 * SUGGESTIONS COMMANDS
		 */

		COMMAND_SUGGEST_DESCRIPTION: 'Manda una sugerencia para el servidor.',
		COMMAND_SUGGEST_EXTENDED: {
			extendedHelp: 'Publica una recomendación en el canal de recomendaciones del servidor',
			explainedUsage: [['suggestion', 'Su recomendación']],
			examples: ['Crear un canal de música.'],
			reminder:
				'Debe tener una configuración de canal de sugerencias para que este comando funcione. Si eres un administrador, se le dará la opción de hacerlo al invocar el comando.'
		},
		COMMAND_SUGGEST_NOSETUP: ({ username }) =>
			`Lo siento ${username}, pero no los administradores no han configurado un canal de texto para las sugerencias.`,
		COMMAND_SUGGEST_NOSETUP_ASK: ({ username }) =>
			`Lo siento ${username}, pero no se ha configurado un canal de texto para las sugerencias... ¿Quieres hacerlo ahora?`,
		COMMAND_SUGGEST_NOSETUP_ABORT: '¡Entendido! Puede usar este comando si cambia de opinión.',
		COMMAND_SUGGEST_NOPERMISSIONS: ({ username, channel }) =>
			`Lo siento ${username}, pero los administradores no me dieron permisos para enviar mensajes en ${channel}.`,
		COMMAND_SUGGEST_CHANNEL_PROMPT: 'Mencione el canal de texto o escriba su nombre o ID que en el que quiere que se publiquen las sugerencias.',
		COMMAND_SUGGEST_TITLE: ({ id }) => `Recomendación #${id}`,
		COMMAND_SUGGEST_SUCCESS: ({ channel }) => `¡Gracias por su sugerencia! Lo he publicado en ${channel}!`,
		COMMAND_RESOLVESUGGESTION_DESCRIPTION: 'Modifica el estado de la sugerencia.',
		COMMAND_RESOLVESUGGESTION_EXTENDED: {
			extendedHelp: 'Este comando le permite actualizar el estado de una sugerencia, marcándola como aceptada, considerada o denegada',
			examples: [
				'1 accept ¡Gracias por su recomendación!',
				'1 a ¡Gracias por su recomendación!',
				'1 consider Hmm... podemos hacer esto, pero es una prioridad realmente baja.',
				'1 c Hmm... podemos hacer esto, pero es una prioridad realmente baja.',
				'1 deny De ninguna manera de que esto suceda.',
				'1 d De ninguna manera de que esto suceda.'
			],
			reminder: `Se puede configurar para enviar un mensaje directo al autor con respecto al estado de su recomendación, con la configuración \`suggestions.on-action.dm\`.
			Además, en caso de que desee preservar el anonimato, puede ocultar su nombre utilizando la configuración \`suggestions.on-action\`, que puede anteponerse con las señales \`--hide-author\` y \`--show-author\`.`
		},
		COMMAND_RESOLVESUGGESTION_INVALID_ID: `${REDCROSS} ¡Eso no era un número! Por favor vuelva a ejecutar el comando pero con el numerito del título de la sugerencia.`,
		COMMAND_RESOLVESUGGESTION_MESSAGE_NOT_FOUND: `${REDCROSS} No pude recuperar la sugerencia ya que su mensaje ha sido eliminado.`,
		COMMAND_RESOLVESUGGESTION_ID_NOT_FOUND: `${REDCROSS} ¡No pude encontrar la recomendación! ¿Estás seguro/a de que no te confundiste de numerito?`,
		COMMAND_RESOLVESUGGESTION_DEFAULT_COMMENT: 'Ningún comentario.',
		COMMAND_RESOLVESUGGESTION_AUTHOR_ADMIN: 'Un administrador',
		COMMAND_RESOLVESUGGESTION_AUTHOR_MODERATOR: 'Un moderador',
		COMMAND_RESOLVESUGGESTION_ACTIONS: {
			ACCEPT: ({ author }) => `${author} ha aceptado esta sugerencia:`,
			CONSIDER: ({ author }) => `${author} ha considerado esta sugerencia:`,
			DENY: ({ author }) => `${author} ha negado esta sugerencia:`
		},
		COMMAND_RESOLVESUGGESTION_ACTIONS_DMS: {
			ACCEPT: ({ author, guild }) => `${author} ha aceptado su sugerencia en ${guild}:`,
			CONSIDER: ({ author, guild }) => `${author} ha considerado su sugerencia en ${guild}:`,
			DENY: ({ author, guild }) => `${author} ha negado su sugerencia en ${guild}:`
		},
		COMMAND_RESOLVESUGGESTION_DM_FAIL: `${REDCROSS} No pude enviar el mensaje directo al usuario. ¿Están cerrados sus mensajes directos?`,
		COMMAND_RESOLVESUGGESTION_SUCCESS: ({ id, action }) =>
			`${GREENTICK} Recomendación \`${id}\` ${
				action === 'a' || action === 'accept' ? 'aceptada' : action === 'd' || action === 'deny' ? 'denegada' : 'considerada'
			} con éxito!`,

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		COMMAND_EVAL_TIMEOUT: ({ seconds }) => `TIMEOUT: Took longer than ${seconds} seconds.`,
		COMMAND_EVAL_ERROR: ({ time, output, type }) => `**Error**:${output}\n**Type**:${type}\n${time}`,

		COMMAND_STATS_TITLES: {
			STATS: 'Statistics',
			UPTIME: 'Uptime',
			SERVER_USAGE: 'Server Usage'
		},
		COMMAND_STATS_FIELDS: ({ stats, uptime, usage }) => ({
			STATS: [
				`• **Users**: ${stats.USERS}`,
				`• **Guilds**: ${stats.GUILDS}`,
				`• **Channels**: ${stats.CHANNELS}`,
				`• **Discord.js**: ${stats.VERSION}`,
				`• **Node.js**: ${stats.NODE_JS}`,
				`• **Klasa**: ${klasaVersion}`
			].join('\n'),
			UPTIME: [
				`• **Host**: ${duration(uptime.HOST, 2)}`,
				`• **Total**: ${duration(uptime.TOTAL, 2)}`,
				`• **Client**: ${duration(uptime.CLIENT, 2)}`
			].join('\n'),
			SERVER_USAGE: [`• **CPU Load**: ${usage.CPU_LOAD.join('% | ')}%`, `• **Heap**: ${usage.RAM_USED} (Total: ${usage.RAM_TOTAL})`].join('\n')
		}),

		/**
		 * #############
		 * TAGS COMMANDS
		 */

		COMMAND_TAG_DESCRIPTION: "Manage this guilds' tags.",
		COMMAND_TAG_EXTENDED: {
			extendedHelp: [
				'Tags, also known as custom commands, can give you a chunk of text stored under a specific name.',
				'For example after adding a tag with `Skyra, tag add rule1 <your first rule>` you can use it with `Skyra, rule1` or `Skyra, tag rule1`',
				"When adding tags you can customize the final look by adding flags to the tag content (these won't show up in the tag itself!):",
				'❯ Add `--embed` to have Skyra send the tag embedded.',
				'The content will be in the description, so you can use all the markdown you wish. for example, adding [masked links](https://skyra.pw).',
				'❯ Add `--color=<a color>` or `--colour=<a colour>` to have Skyra colourize the embed. Does nothing unless also specifying `--embed`.',
				'Colours can be RGB, HSL, HEX or Decimal.'
			].join('\n'),
			explainedUsage: [
				[
					'action',
					`The action to perform: ${this.list(
						[
							'`add` to add new tags',
							'`remove` to delete a tag',
							'`edit` to edit a tag',
							'`source` to get the source of a tag',
							'`list` to list all known tags',
							'`show` to show a tag'
						],
						'o'
					)}.`
				],
				['tag', "The tag's name."],
				['contents', 'Required for the actions `add` and `edit`, specifies the content for the tag.']
			],
			examples: [
				'add rule1 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
				'add rule1 --embed --color=#1E88E5 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
				'edit rule1 Just be respectful with the others.',
				'rule1',
				'source rule1',
				'remove rule1',
				'list'
			],
			multiline: true
		},
		COMMAND_TAG_PERMISSIONLEVEL: 'Debe ser miembro del personal, moderador o administrador para poder administrar las etiquetas.',
		COMMAND_TAG_NAME_NOTALLOWED: 'Un nombre de etiqueta puede no tener un acento grave ni caracteres invisibles.',
		COMMAND_TAG_NAME_TOOLONG: 'El nombre de una etiqueta debe tener 50 caracteres o menos.',
		COMMAND_TAG_EXISTS: ({ tag }) => `La etiqueta \`${tag}\` ya existe.`,
		COMMAND_TAG_CONTENT_REQUIRED: 'Debe proporcionar un contenido para esta etiqueta.',
		COMMAND_TAG_ADDED: ({ name, content }) =>
			[
				`Se agregó con éxito una nueva etiqueta: **${name}** con un contenido de:`,
				`**${
					content.endsWith('...')
						? `${content} (truncado para la longitud del mensaje de Discord, se ha guardado la etiqueta completa)`
						: content
				}**`
			].join('\n'),
		COMMAND_TAG_REMOVED: ({ name }) => `Se eliminó con éxito la etiqueta **${name}**.`,
		COMMAND_TAG_NOTEXISTS: ({ tag }) => `La etiqueta \`${tag}\` no existe.`,
		COMMAND_TAG_EDITED: ({ name, content }) =>
			[
				`Se editó correctamente la etiqueta **${name}** con un contenido de:`,
				`**${
					content.endsWith('...')
						? `${content} (truncado para la longitud del mensaje de Discord, se ha guardado la etiqueta completa)`
						: content
				}**`
			].join('\n'),
		COMMAND_TAG_LIST_EMPTY: 'La lista de etiquetas para este servidor está vacía.',
		COMMAND_TAG_LIST: ({ tags }) => `${tags.length === 1 ? 'Hay 1 etiqueta:' : `Hay ${tags.length} etiquetas: `}${tags.join(', ')}`,
		COMMAND_TAG_RESET: 'Todas las etiquetas se han eliminado con éxito de este servidor.',

		/**
		 * ##############
		 * TOOLS COMMANDS
		 */

		COMMAND_AVATAR_NONE: 'El usuario no tiene ninguna foto de perfil puesta.',
		COMMAND_COLOR: ({ hex, rgb, hsl }) => [`HEX: **${hex}**`, `RGB: **${rgb}**`, `HSL: **${hsl}**`].join('\n'),
		COMMAND_EMOJI_CUSTOM: ({ emoji, id }) =>
			[
				`→ ${inlineCodeblock('Emoji ::')} **${emoji}**`,
				`→ ${inlineCodeblock('Type  ::')} **Personalizado**`,
				`→ ${inlineCodeblock('ID    ::')} **${id}**`
			].join('\n'),
		COMMAND_EMOJI_TWEMOJI: ({ emoji, id }) =>
			[
				`→ ${inlineCodeblock('Emoji ::')} \`${emoji}\``,
				`→ ${inlineCodeblock('Type  ::')} **Twemoji**`,
				`→ ${inlineCodeblock('ID    ::')} **${id}**`
			].join('\n'),
		COMMAND_EMOJI_INVALID: `El argumento que escribiste no es un emoji válido.`,
		COMMAND_EMOJI_TOO_LARGE: ({ emoji }) =>
			`'${emoji}' es tan pesado que los hámsters no pudieron con su peso. ¿Quizá prueba con un emoji más pequeño?ç`,
		COMMAND_COUNTRY_DESCRIPTION: 'Shows information about a country.',
		COMMAND_COUNTRY_EXTENDED: {
			extendedHelp: 'This command uses https://restcountries.eu to get information on the provided country.',
			explainedUsage: [['country', 'The name of the country.']],
			examples: ['United Kingdom']
		},
		COMMAND_COUNTRY_TITLES: {
			OVERVIEW: 'Overview',
			LANGUAGES: 'Languages',
			OTHER: 'Other'
		},
		COMMAND_COUNTRY_FIELDS: {
			OVERVIEW: {
				OFFICIAL_NAME: 'Official Name',
				CAPITAL: 'Capital',
				POPULATION: 'Population'
			},
			OTHER: {
				DEMONYM: 'Demonym',
				AREA: 'Area',
				CURRENCIES: 'Currencies'
			}
		},
		COMMAND_ESHOP_DESCRIPTION: 'Solicite información para cualquier tienda digital estadounidense de Nintendo',
		COMMAND_ESHOP_EXTENDED: {
			extendedHelp: 'Este comando consulta a Nintendo of America para mostrar los datos del juego que solicitas.',
			explainedUsage: [['Solicitud', 'El nombre del juego que estás buscando..']],
			examples: ['Breath of the Wild', 'Pokémon', 'Splatoon']
		},
		COMMAND_ESHOP_NOT_IN_DATABASE: 'Ninguno disponible',
		COMMAND_ESHOP_TITLES: {
			PRICE: 'Precio',
			AVAILABILITY: 'Disponibilidad',
			RELEASE_DATE: 'Fecha de lanzamiento',
			NUMBER_OF_PLAYERS: 'Número de jugadores',
			PLATFORM: 'Plataforma',
			CATEGORIES: 'Categorías',
			NO_CATEGORIES: 'Este juego no se ha ordenado en ninguna categoría.',
			NSUID: 'NSUID',
			ESRB: 'ESRB'
		},
		COMMAND_ESHOP_PRICE: ({ price }) => (price > 0 ? `$${price} USD` : 'Gratis'),
		COMMAND_HOROSCOPE_DESCRIPTION: 'Obtén tu último horóscopo',
		COMMAND_HOROSCOPE_EXTENDED: {
			extendedHelp: 'Obtiene el horóscopo de un signo solar dado de The Astrologer de Kelli Fox.',
			explainedUsage: [
				['sunsign', 'El signo solar para el que quieres obtener el horóscopo'],
				[
					'today|tomorrow|yesterday',
					'(Opcional, el valor predeterminado es "today") Si desea obtener el horóscopo de yesterday o de tomorrow, puede especificarlo.'
				]
			],
			examples: ['pisces', 'virgo tomorrow', 'gemini yesterday', 'aries today']
		},
		COMMAND_HOROSCOPE_INVALID_SUNSIGN: ({ sign, maybe }) => `${sign} es un signo solar no válido, ¿tal vez intente con ${maybe}`,
		COMMAND_HOROSCOPE_TITLES: {
			DAILY_HOROSCOPE: ({ sign }) => `Horóscopo diario para ${sign}`,
			METADATA_TITLE: 'Metadatos',
			METADATA: ({ intensity, keywords, mood, rating }) =>
				[
					`**Intensidad:** ${intensity}`,
					`**Palabras clave:** ${this.list(keywords, 'y')}`,
					`**Estado anímico:** ${mood}`,
					`**Rating:** ${rating}`
				].join('\n')
		},
		COMMAND_IGDB_DESCRIPTION: 'Busca en IGDB (Internet Game Database) tus juegos favoritos',
		COMMAND_IGDB_EXTENDED: {
			extendedHelp: 'Este comando consulta la API IGDB para mostrar datos de sus juegos favoritos.',
			explainedUsage: [['query', 'El nombre del juego']],
			examples: ['Breath of the Wild', 'Borderlands 3']
		},
		COMMAND_IGDB_TITLES: {
			USER_SCORE: 'Puntuación del usuario',
			AGE_RATING: 'Calificación de edad',
			RELEASE_DATE: 'Fecha de lanzamiento',
			GENRES: 'Género(s)',
			DEVELOPERS: 'Desarrollador(es)',
			PLATFORMS: 'Plataforma(s)'
		},
		COMMAND_IGDB_DATA: {
			NO_DEVELOPERS: 'Desarrollador(es) desconocidos',
			NO_PLATFORMS: 'Plataforma(s) desconocidas',
			NO_RELEASE_DATE: 'Fecha de lanzamiento desconocida',
			NO_RATING: 'Ninguna calificación de usuario',
			NO_SUMMARY: 'No hay resumen del juego disponible.',
			NO_GENRES: 'No hay géneros conocidos.',
			NO_AGE_RATINGS: 'No hay clasificaciones de edad disponibles.'
		},
		COMMAND_ITUNES_DESCRIPTION: 'Busca en la API de iTunes pistas de música',
		COMMAND_ITUNES_EXTENDED: {
			extendedHelp: 'Este comando consulta la API de iTunes de Apple para mostrar datos sobre la música que solicita.',
			explainedUsage: [['consulta', 'El nombre de la cancion']],
			examples: ['Apocalyptica feat. Brent Smith', "You're Gonna Go Far, Kid"]
		},
		COMMAND_ITUNES_TITLES: {
			ARTIST: 'Artista',
			COLLECTION: 'Colección',
			COLLECTION_PRICE: 'Precio de colección',
			TRACK_PRICE: 'Precio de canción',
			TRACK_RELEASE_DATE: 'Fecha de lanzamiento de la canción',
			NUMBER_OF_TRACKS_IN_COLLECTION: 'Canciones en coleccion',
			PRIMARY_GENRE: 'Genero primario',
			PREVIEW: 'Avance',
			PREVIEW_LABEL: 'Haga clic aquí'
		},
		COMMAND_LMGTFY_CLICK: 'Haga clic en mí para buscar',
		COMMAND_MOVIES_DESCRIPTION: 'Busca en TheMovieDatabase cualquier película',
		COMMAND_MOVIES_EXTENDED: {
			extendedHelp: [
				'Este comando consulta la API de TheMovieDatabase para obtener datos sobre sus películas favoritas',
				"Consejo: Puede usar el filtro 'y:' para reducir sus resultados por año. Ejemplo: 'Star Wars y: 1977'."
			],
			explainedUsage: [['consulta', 'El nombre de la pelicula']],
			examples: ["Ocean's Eleven y:2001", 'Star Wars Revenge of the Sith', 'Spirited Away']
		},
		COMMAND_MOVIES_TITLES: {
			RUNTIME: 'Tiempo de ejecución',
			USER_SCORE: 'Puntuación del usuario',
			STATUS: 'Estado',
			RELEASE_DATE: 'Fecha de lanzamiento',
			IMDB_PAGE: 'Página de IMDB',
			HOME_PAGE: 'Página de inicio',
			COLLECTION: 'Colección',
			GENRES: 'Géneros'
		},
		COMMAND_MOVIES_DATA: {
			VARIABLE_RUNTIME: 'Variable',
			MOVIE_IN_PRODUCTION: 'Película en producción',
			LINK_CLICK_HERE: 'Haga clic aquí',
			NONE: 'Ninguno',
			NOT_PART_OF_COLLECTION: 'No es parte de una colección.',
			NO_GENRES: 'Ninguno en TheMovieDB'
		},
		COMMAND_SHOWS_DESCRIPTION: 'Busca en la base de datos de películas cualquier programa',
		COMMAND_SHOWS_EXTENDED: {
			extendedHelp: 'Este comando consulta la base de datos de películas para obtener información sobre tus programas favoritos',
			explainedUsage: [['consulta', 'El nombre del show.']],
			examples: ['Final Space', 'Gravity Falls', 'Rick and Morty']
		},
		COMMAND_SHOWS_TITLES: {
			EPISODE_RUNTIME: 'Tiempo de ejecución del episodio',
			USER_SCORE: 'Puntuación del usuario',
			STATUS: 'Estado',
			FIRST_AIR_DATE: 'Primera fecha de emisión',
			GENRES: 'Géneros'
		},
		COMMAND_SHOWS_DATA: {
			VARIABLE_RUNTIME: 'Variable',
			UNKNOWN_USER_SCORE: 'Sin puntaje de usuario',
			NO_GENRES: 'Ninguno en TheMovieDB'
		},
		COMMAND_PRICE_CURRENCY: ({ fromCurrency, fromAmount, worths }) =>
			`**${fromAmount}** ${fromCurrency.toUpperCase()} vale ${this.list(worths, 'y')}.`,
		COMMAND_PRICE_CURRENCY_NOT_FOUND: '¡Ha habido un error! Por favor, revise de nuevo la ortografía y que especificaste una moneda válida.',
		COMMAND_QUOTE_MESSAGE: 'Esto es muy raro, pero dicho mensaje no tiene ni contenido ni imagen.',
		COMMAND_ROLES_LIST_EMPTY: '¡Este servidor no tiene ningún rol público!',
		COMMAND_ROLES_ABORT: ({ prefix }) =>
			`He buscado en todos los rincones pero no he encontrado lo que buscabas. ¡Por favor escribe \`${prefix}roles\` para recibir la lista completa!`,
		COMMAND_ROLES_LIST_TITLE: 'Lista de roles públicos',
		COMMAND_ROLES_ADDED: ({ roles }) => `Los siguientes roles han sido añadidos a tu perfil: \`${roles}\``,
		COMMAND_ROLES_REMOVED: ({ roles }) => `Los siguientes roles han sido removidos de tu perfil: \`${roles}\``,
		COMMAND_ROLES_NOT_PUBLIC: ({ roles }) => `Los siguientes roles no son públicos: \`${roles}\``,
		COMMAND_ROLES_NOT_MANAGEABLE: ({ roles }) => `Los siguientes roles no se pudieron entregar debido a la posición jerárquica: \`${roles}\``,
		COMMAND_ROLES_AUDITLOG: "Autorización: Administración de Roles Públicos | Comando 'Roles'.",
		COMMAND_DUCKDUCKGO_NOTFOUND: 'Lo siento, pero la API de DuckDuckGo ha devuelto una respuesta en blanco. Prueba de nuevo con otras palabras.',
		COMMAND_DUCKDUCKGO_LOOKALSO: 'Temas Relacionados:',

		COMMAND_URBAN_NOTFOUND: 'Lo siento, la palabra que buscabas no parece estar definida en UrbanDictionary. ¿Prueba con otra palabra?',
		COMMAND_URBAN_INDEX_NOTFOUND: 'Quizás quieras probar con un número de página más pequeño.',
		SYSTEM_TEXT_TRUNCATED: ({ definition, url }) => `${definition}... [continúa leyendo](${url})`,
		COMMAND_WHOIS_MEMBER_TITLES: {
			JOINED: 'Fecha Ingreso',
			CREATED_AT: 'Fecha Creación'
		},
		COMMAND_WHOIS_MEMBER_FIELDS: ({ member }) => ({
			JOINED: member.joinedTimestamp
				? `Hace ${timestamp.displayUTC(member.joinedTimestamp)}\n${duration(Date.now() - member.joinedTimestamp, 2)}`
				: 'Desconocido',
			CREATED_AT: `${timestamp.displayUTC(member.user.createdAt)}\nHace ${duration(Date.now() - member.user.createdTimestamp, 2)}`,
			FOOTER: `ID: ${member.id}`
		}),
		COMMAND_WHOIS_MEMBER_ROLES: ({ amount }) => (amount === 1 ? 'Rol [1]' : `Roles [${amount}]`),
		COMMAND_WHOIS_MEMBER_PERMISSIONS: 'Permisos Clave',
		COMMAND_WHOIS_MEMBER_PERMISSIONS_ALL: 'Todos los Permisos',
		COMMAND_WHOIS_USER_TITLES: {
			CREATED_AT: 'Fecha Creación'
		},
		COMMAND_WHOIS_USER_FIELDS: ({ user }) => ({
			CREATED_AT: `${timestamp.displayUTC(user.createdAt)}\nHace ${duration(Date.now() - user.createdTimestamp, 2)}`,
			FOOTER: `ID: ${user.id}`
		}),
		COMMAND_FOLLOWAGE: ({ user, channel, time }) => `${user} ha estado siguiendo ${channel} durante ${duration(time, 2)}.`,
		COMMAND_FOLLOWAGE_MISSING_ENTRIES: 'Either the user or the channel do not exist.',
		COMMAND_FOLLOWAGE_NOT_FOLLOWING: 'The user is not following the specified channel.',
		COMMAND_TWITCH_NO_ENTRIES: 'There are no entries, are you sure you wrote the user name correctly?',
		COMMAND_TWITCH_TITLES: {
			FOLLOWERS: 'Followers',
			VIEWS: 'Views',
			CLICK_TO_VISIT: "Click to go to streamer's channel",
			PARTNER: 'Partner'
		},
		COMMAND_TWITCH_MATURITY: ({ mature }) => (mature ? 'This is a mature channel.' : 'This channel is safe for everyone.'),
		COMMAND_TWITCH_PARTNERSHIP: ({ affiliateStatus }) =>
			affiliateStatus === false ? 'This channel is not part of the Twitch affiliate program.' : affiliateStatus,
		COMMAND_TWITCH_AFFILIATE_STATUS: {
			AFFILIATED: 'This is an affiliated channel.',
			PARTNERED: 'This is a partnered channel.'
		},
		COMMAND_TWITCH_CREATED_AT: 'Created At:',
		COMMAND_TWITCHSUBSCRIPTION_REQUIRED_STREAMER: `${REDCROSS} Debes darme el nombre de un canal para subscribirte.`,
		COMMAND_TWITCHSUBSCRIPTION_STREAMER_NOT_FOUND: `${REDCROSS} Perdona, pero no pude encontrar el canal, ¿lo escribiste bien?`,
		COMMAND_TWITCHSUBSCRIPTION_REQUIRED_CHANNEL: `${REDCROSS} Debes decirme adónde quieres que mande los mensajes.`,
		COMMAND_TWITCHSUBSCRIPTION_REQUIRED_STATUS: `${REDCROSS} Debes decirme qué tipo de notificaciones quieres, las opciones son "online" y "offline".`,
		COMMAND_TWITCHSUBSCRIPTION_STATUS_VALUES: ['online', 'offline'],
		COMMAND_TWITCHSUBSCRIPTION_INVALID_STATUS: `${REDCROSS} Eh, esperaba o "online" o "offline", pero no pude entender lo que me dijiste.`,
		COMMAND_TWITCHSUBSCRIPTION_REQUIRED_CONTENT: `${REDCROSS} Mhmm, me pregunto qué quieres que mande cuando el usuario se conecta o algo, ¿puedes darme una pista?`,
		COMMAND_TWITCHSUBSCRIPTION_ADD_DUPLICATED: `${REDCROSS} Ya estás subscrito/a a este canal para el canal de texto y estado que especificaste.`,
		COMMAND_TWITCHSUBSCRIPTION_ADD_SUCCESS: ({ name, channel, status }) =>
			`${GREENTICK} ¡Oído cocina! Cuando ${name} se ${
				status === NotificationsStreamsTwitchEventStatus.Offline ? 'desconecte' : 'conecte'
			}, mandaré un mensaje nuevo en el canal ${channel}.`,
		COMMAND_TWITCHSUBSCRIPTION_REMOVE_STREAMER_NOT_SUBSCRIBED: `${REDCROSS} Perdona, no puedes desubscribirte de un canal en el cual no estás subscrito/a. Por favor, subscríbete para poder desubscribirte.`,
		COMMAND_TWITCHSUBSCRIPTION_REMOVE_ENTRY_NOT_EXISTS: `${REDCROSS} Perdona, ya estás subscrito/a a este usuario, pero sus subscripciones no son publicadas en el canal de texto que especificaste.`,
		COMMAND_TWITCHSUBSCRIPTION_REMOVE_SUCCESS: ({ name, channel, status }) =>
			`${GREENTICK} ¡Hecho! No mandaré más mensajes en el canal ${channel} cuando ${name} se ${
				status === NotificationsStreamsTwitchEventStatus.Offline ? 'desconecte' : 'conecte'
			}.`,
		COMMAND_TWITCHSUBSCRIPTION_RESET_EMPTY: `${REDCROSS} You were not subscribed to any streamer, mission abort!`,
		COMMAND_TWITCHSUBSCRIPTION_RESET_SUCCESS: ({ entries }) =>
			`${GREENTICK} Success! ${entries} subscription${entries === 1 ? '' : 's'} have been removed from this server.`,
		COMMAND_TWITCHSUBSCRIPTION_RESET_STREAMER_NOT_SUBSCRIBED: `${REDCROSS} You were not subscribed to this streamer, are you sure you got the right one?`,
		COMMAND_TWITCHSUBSCRIPTION_RESET_CHANNEL_SUCCESS: ({ name, entries }) =>
			`${GREENTICK} Success! Removed ${entries} subscription${entries === 1 ? '' : 's'} from the streamer ${name}.`,
		COMMAND_TWITCHSUBSCRIPTION_SHOW_STREAMER_NOT_SUBSCRIBED: `${REDCROSS} You wanted to see all subscriptions from this streamer, but there are none!`,
		COMMAND_TWITCHSUBSCRIPTION_SHOW_STATUS: ['Online', 'Offline'],
		COMMAND_TWITCHSUBSCRIPTION_SHOW_EMPTY: `${REDCROSS} There are no subscriptions, who will be the first?`,
		COMMAND_TWITCHSUBSCRIPTION_SHOW_UNKNOWN_USER: 'Unknown',
		COMMAND_WIKIPEDIA_NOTFOUND: 'Lo siento, pero no he podido encontrar algo que coincida con el término que buscas a través de Wikipedia.',
		COMMAND_YOUTUBE_NOTFOUND: 'Lo siento, pero no he podido encontrar algo que coincida con el término que buscas a través de YouTube.',
		COMMAND_YOUTUBE_INDEX_NOTFOUND: 'Quizá quieras probar con un índice de página menor, porque no soy capaz de encontrar algo en éste.',
		COMMAND_DEFINE_DESCRIPTION: 'Busca la definición de una palabra en inglés.',
		COMMAND_DEFINE_EXTENDED: {
			extendedHelp: `¿Qué significa "heel"?`,
			explainedUsage: [['Word', 'La palabra o frase cuya definición quieres buscar.']],
			examples: ['heel']
		},
		COMMAND_DEFINE_NOTFOUND: 'No pude encontrar la definición de esta palabra.',
		COMMAND_DEFINE_PRONOUNCIATION: 'Pronunciación',
		COMMAND_DEFINE_UNKNOWN: 'Desconocido',

		/**
		 * #############
		 * WEEB COMMANDS
		 */

		COMMAND_WBANG: ({ user }) => `Ey ${user}... ¡bang!`,
		COMMAND_WBANGHEAD: '¡Golpeo de cabeza en progreso!',
		COMMAND_WBITE: ({ user }) => `¡Mordiendo ${user}!`,
		COMMAND_WBLUSH: '¡Le/a ruborizaste! 😊',
		COMMAND_WCRY: ({ user }) => `Querido ${user}, ¿le/a hiciste llorar? 💔`,
		COMMAND_WCUDDLE: ({ user }) => `Ahí va un abracito para tí, ${user} 💞`,
		COMMAND_WDANCE: '¡Olé! 💃',
		COMMAND_WGREET: ({ user }) => `¡Buenas ${user}!`,
		COMMAND_WHUG: ({ user }) => `¡Un abrazo! ${user} ❤`,
		COMMAND_WKISS: ({ user }) => `¡Un besito! ${user} 💜`,
		COMMAND_WLEWD: '¡Demasiado lujurioso!',
		COMMAND_WLICK: ({ user }) => `Lamiendo ${user} 👅`,
		COMMAND_WNOM: 'Nom, nom, nom! 😊',
		COMMAND_WNEKO: 'Miau! 🐱',
		COMMAND_WPAT: ({ user }) => `\\*Da palmaditas en la cabeza de ${user}\\* ❤`,
		COMMAND_WPOUT: '¿Oh?',
		COMMAND_WPUNCH: ({ user }) => `¡Dando un puñetazo a ${user}!`,
		COMMAND_WSLAP: ({ user }) => `¡Abofeteando ${user}!`,
		COMMAND_WSLEEPY: 'Durmiéndose...',
		COMMAND_WSMILE: '¡Mostrando una risa radiante!',
		COMMAND_WSMUG: '\\*Sonríe con superioridad\\*',
		COMMAND_WSTARE: ({ user }) => `Querido ${user}... hay alguien observándote 👀`,
		COMMAND_WTHUMBSUP: '¡Tienes su pulgar hacia arriba!',
		COMMAND_WTICKLE: ({ user }) => `Cosquillitas para tí, ${user}!`,

		/**
		 * #################################
		 * #            MONITORS           #
		 * #################################
		 */

		CONST_MONITOR_INVITELINK: 'Enlace Invitación',
		CONST_MONITOR_LINK: 'Link Filtrado',
		CONST_MONITOR_NMS: '[NOMENTIONSPAM]',
		CONST_MONITOR_WORDFILTER: 'Palabra Filtrada',
		CONST_MONITOR_CAPSFILTER: 'Demasiadas Mayúsculas',
		CONST_MONITOR_ATTACHMENTFILTER: 'Demasiados Documentos',
		CONST_MONITOR_MESSAGEFILTER: 'Too Many Message Duplicates',
		CONST_MONITOR_NEWLINEFILTER: 'Too Many Lines',
		CONST_MONITOR_REACTIONFILTER: 'Reacción Eliminada',
		MODERATION_MONITOR_ATTACHMENTS: ({ amount, maximum }) =>
			maximum === 0
				? '[Auto-Moderation] Triggered attachment filter, no threshold.'
				: `[Auto-Moderation] Triggered attachment filter, reached ${amount} out of ${maximum} infractions.`,
		MODERATION_MONITOR_CAPITALS: ({ amount, maximum }) =>
			maximum === 0
				? '[Auto-Moderation] Triggered capital filter, no threshold.'
				: `[Auto-Moderation] Triggered capital filter, reached ${amount} out of ${maximum} infractions.`,
		MODERATION_MONITOR_INVITES: ({ amount, maximum }) =>
			maximum === 0
				? '[Auto-Moderation] Triggered invite filter, no threshold.'
				: `[Auto-Moderation] Triggered invite filter, reached ${amount} out of ${maximum} infractions.`,
		MODERATION_MONITOR_LINKS: ({ amount, maximum }) =>
			maximum === 0
				? '[Auto-Moderation] Triggered link filter, no threshold.'
				: `[Auto-Moderation] Triggered link filter, reached ${amount} out of ${maximum} infractions.`,
		MODERATION_MONITOR_MESSAGES: ({ amount, maximum }) =>
			maximum === 0
				? '[Auto-Moderation] Triggered duplicated message filter, no threshold.'
				: `[Auto-Moderation] Triggered duplicated message filter, reached ${amount} out of ${maximum} infractions.`,
		MODERATION_MONITOR_NEWLINES: ({ amount, maximum }) =>
			maximum === 0
				? '[Auto-Moderation] Triggered newline filter, no threshold.'
				: `[Auto-Moderation] Triggered newline filter, reached ${amount} out of ${maximum} infractions.`,
		MODERATION_MONITOR_WORDS: ({ amount, maximum }) =>
			maximum === 0
				? '[Auto-Moderation] Triggered word filter, no threshold.'
				: `[Auto-Moderation] Triggered word filter, reached ${amount} out of ${maximum} infractions.`,
		MONITOR_INVITE_FILTER_ALERT: ({ user }) => `${REDCROSS} Querido ${user}, los enlaces de invitación no están permitidos aquí.`,
		MONITOR_INVITE_FILTER_LOG: ({ links }) => `**Enlace${links.length === 1 ? '' : 's'}**: ${this.list(links, 'y')}`,
		MONITOR_NOLINK: ({ user }) => `${REDCROSS} Perdona ${user}, los enlaces no están permitidos en este servidor.`,
		MONITOR_WORDFILTER_DM: ({ filtered }) =>
			`¡Parece que dijiste algo malo! Pero como te esforzaste en escribir el mensaje, te lo he mandado por aquí:\n${filtered}`,
		MONITOR_CAPSFILTER_DM: ({ message }) => `Speak lower! I know you need to express your thoughts. There is the message I deleted:\n${message}`,
		MONITOR_WORDFILTER: ({ user }) => `${REDCROSS} Perdona, querido/a ${user}, pero has escrito algo que no está permitido en este servidor.`,
		MONITOR_CAPSFILTER: ({ user }) => `${REDCROSS} ¡EEEEEEH ${user}! ¡POR FAVOR NO GRITE EN ESTE SITIO! ¡HAS SUPERADO EL LÍMITE DE MAYÚSCULAS!`,
		MONITOR_MESSAGEFILTER: ({ user }) => `${REDCROSS} Woah woah woah, please stop re-posting so much ${user}!`,
		MONITOR_NEWLINEFILTER: ({ user }) => `${REDCROSS} Wall of text incoming from ${user}, wall of text taken down!`,
		MONITOR_REACTIONSFILTER: ({ user }) => `${REDCROSS} Hey ${user}, please do not add that reaction!`,
		MONITOR_NMS_MESSAGE: ({ user }) =>
			[
				`El MJOLNIR ha aterrizado y ahora, el usuario ${user.tag} cuya ID es ${user.id} ha sido baneado por spamming de menciones.`,
				'¡No te preocupes! ¡Estoy aquí para ayudarte! 😄'
			].join('\n'),
		MONITOR_NMS_MODLOG: ({ threshold }) => `[NOMENTIONSPAM] Automático: Límite de Spam de Menciones alcanzado.\nLímite: ${threshold}.`,
		MONITOR_NMS_ALERT:
			'Ten cuidado con mencionar otra vez más, estás a punto de ser expulsado por exceder el límite de spam de menciones de este servidor.',
		MONITOR_SOCIAL_ACHIEVEMENT: '¡Felicidades %MEMBER! ¡Has logrado el rol %ROLE%!',

		/**
		 * #################################
		 * #           INHIBITORS          #
		 * #################################
		 */

		INHIBITOR_SPAM: ({ channel }) =>
			`¿Podemos movernos al canal ${channel}, por favor? Este comando puede ser muy molesto y arruinar las conversaciones de otras personas.`,

		/**
		 * #################################
		 * #              GAMES            #
		 * #################################
		 */

		HG_BLOODBATH: [
			'{1} grabs a shovel.',
			'{1} grabs a backpack and retreats.',
			'{1} and {2} fight for a bag. {1} gives up and retreats.',
			'{1} and {2} fight for a bag. {2} gives up and retreats.',
			'{1} finds a bow, some arrows, and a quiver.',
			'{1} runs into the cornucopia and hides.',
			'{1} takes a handful of throwing knives.',
			"{1} rips a mace out of {2}'s hands.",
			'{1} finds a canteen full of water.',
			'{1} stays at the cornucopia for resources.',
			'{1} gathers as much food as they can.',
			'{1} grabs a sword.',
			'{1} takes a spear from inside the cornucopia.',
			'{1} finds a bag full of explosives.',
			'{1} clutches a first aid kit and runs away.',
			'{1} takes a sickle from inside the cornucopia.',
			'{1}, {2}, and {3} work together to get as many supplies as possible.',
			'{1} runs away with a lighter and some rope.',
			'{1} snatches a bottle of alcohol and a rag.',
			'{1} finds a backpack full of camping equipment.',
			'{1} grabs a backpack, not realizing it is empty.',
			"{1} breaks {2}'s nose for a basket of bread.",
			'{1}, {2}, {3}, and {4} share everything they gathered before running.',
			'{1} retrieves a trident from inside the cornucopia.',
			'{1} grabs a jar of fishing bait while {2} gets fishing gear.',
			'{1} scares {2} away from the cornucopia.',
			'{1} grabs a shield leaning on the cornucopia.',
			'{1} snatches a pair of sais.',
			'{1} grabs a lone pair of pants.',
			'{1T} steps off their podium too soon and blows up.',
			"{1} throws a knife into {2T}'s head.",
			'{1T} accidently steps on a landmine.',
			'{1} catches {2T} off guard and kills them.',
			'{1} and {2} work together to drown {3T}.',
			'{1} strangles {2T} after engaging in a fist fight.',
			"{1} shoots an arrow into {2T}'s head.",
			'{1T} cannot handle the circumstances and commits suicide.',
			"{1} bashes {2T}'s head against a rock several times.",
			"{1} snaps {2T}'s neck.",
			'{1} decapitates {2T} with a sword.',
			'{1} spears {2T} in the abdomen.',
			'{1} sets {2T} on fire with a molotov.',
			'{1T} falls into a pit and dies.',
			'{1} stabs {2T} while their back is turned.',
			'{1} severely injures {2T}, but puts them out of their misery.',
			'{1} severely injures {2T} and leaves them to die.',
			"{1} bashes {2T}'s head in with a mace.",
			'{1} pushes {2T} off a cliff during a knife fight.',
			"{1} throws a knife into {2T}'s chest.",
			'{1T} is unable to convince {2} to not kill them.',
			'{1} convinces {2T} to not kill them, only to kill {2T} instead.',
			'{1T} falls into a frozen lake and drowns.',
			'{1}, {2}, and {3T} start fighting, but {2} runs away as {1} kills {3T}.',
			'{1} kills {2T} with their own weapon.',
			'{1} overpowers {2T}, killing them.',
			'{1} sets an explosive off, killing {2T}.',
			'{1} sets an explosive off, killing {2T}, and {3T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, and {4T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, {4T} and {5T}.',
			'{1} kills {2T} as they try to run.',
			'{1T} and {2T} threaten a double suicide. It fails and they die.',
			'{1T}, {2T}, {3T}, and {4T} form a suicide pact, killing themselves.',
			'{1} kills {2T} with a hatchet.',
			'{1} and {2} fight {3T} and {4T}. {1} and {2} survive.',
			'{1T} and {2T} fight {3} and {4}. {3} and {4} survive.',
			'{1T} attacks {2}, but {3} protects them, killing {1T}.',
			'{1} severely slices {2T} with a sword.',
			'{1} strangles {2T} with a rope.',
			'{1} kills {2T} for their supplies.',
			'{1} shoots an arrow at {2}, but misses and kills {3T} instead.',
			"{1} shoots a poisonous blow dart into {2T}'s neck, slowly killing them.",
			'{1} stabs {2T} with a tree branch.',
			'{1} stabs {2T} in the back with a trident.',
			'{1}, {2T}, and {3T} get into a fight. {1} triumphantly kills them both.',
			'{1T}, {2}, and {3T} get into a fight. {2} triumphantly kills them both.',
			'{1T}, {2T}, and {3} get into a fight. {3} triumphantly kills them both.',
			'{1} finds {2T} hiding in the cornucopia and kills them.',
			'{1T} finds {2} hiding in the cornucopia, but {2} kills them.',
			'{1} kills {2T} with a sickle.',
			'{1} and {2T} fight for a bag. {1} strangles {2T} with the straps and runs.',
			'{1T} and {2} fight for a bag. {2} strangles {1T} with the straps and runs.',
			'{1} repeatedly stabs {2T} to death with sais.',
			'{1T} trips over while running from the cornucopia, and is killed by {2}.',
			'{1} trips over while running from the cornucopia, {2} picks them up, they run off together.',
			"{1} aims an arrow at {2}'s head and shoots, {3T} jumps in the way and sacrifies their life to save them."
		].map(HungerGamesUsage.create),
		HG_DAY: [
			'{1} goes hunting.',
			'{1} injures themself.',
			'{1} explores the arena.',
			'{1} scares {2} off.',
			"{1} diverts {2}'s attention and runs away.",
			'{1} stalks {2}.',
			'{1} fishes.',
			'{1} camouflauges themself in the bushes.',
			"{1} steals from {2} while they aren't looking.",
			'{1} makes a wooden spear.',
			'{1} discovers a cave.',
			'{1} attacks {2}, but they manage to escape.',
			'{1} chases {2}.',
			'{1} runs away from {2}.',
			'{1} collects fruit from a tree.',
			'{1} receives a hatchet from an unknown sponsor.',
			'{1} receives clean water from an unknown sponsor.',
			'{1} receives medical supplies from an unknown sponsor.',
			'{1} receives fresh food from an unknown sponsor.',
			'{1} searches for a water source.',
			'{1} defeats {2} in a fight, but spares their life.',
			'{1} and {2} work together for the day.',
			'{1} begs for {2} to kill them. They refuse, keeping {1} alive.',
			'{1} tries to sleep through the entire day.',
			"{1}, {2}, {3}, and {4} raid {5}'s camp while they are hunting.",
			'{1} constructs a shack.',
			'{1} overhears {2} and {3} talking in the distance.',
			'{1} practices their archery.',
			'{1} thinks about home.',
			'{1} is pricked by thorns while picking berries.',
			'{1} tries to spear fish with a trident.',
			'{1} searches for firewood.',
			'{1} and {2} split up to search for resources.',
			'{1} picks flowers.',
			"{1} tends to {2}'s wounds.",
			'{1} sees smoke rising in the distance, but decides not to investigate.',
			'{1} sprains their ankle while running away from {2}.',
			'{1} makes a slingshot.',
			'{1} travels to higher ground.',
			'{1} discovers a river.',
			'{1} hunts for other tributes.',
			'{1} and {2} hunt for other tributes.',
			'{1}, {2}, and {3} hunt for other tributes.',
			'{1}, {2}, {3}, and {4} hunt for other tributes.',
			'{1}, {2}, {3}, {4}, and {5} hunt for other tributes.',
			'{1} receives an explosive from an unknown sponsor.',
			'{1} questions their sanity.',
			'{1} forces {2} to eat pant.',
			'{1} forces {2T} to eat pant. {2T} chokes and dies.',
			'{1} catches {2T} off guard and kills them.',
			"{1} throws a knife into {2T}'s head.",
			'{1T} begs for {2} to kill them. They reluctantly oblige, killing {1T}.',
			'{1} and {2} work together to drown {3T}.',
			'{1} strangles {2T} after engaging in a fist fight.',
			"{1} shoots an arrow into {2T}'s head.",
			'{1T} bleeds out due to untreated injuries.',
			'{1T} cannot handle the circumstances and commits suicide.',
			"{1} bashes {2T}'s head against a rock several times.",
			'{1T} unknowingly eats toxic berries.',
			"{1} silently snaps {2T}'s neck.",
			"{1} taints {2T}'s food, killing them.",
			'{1} decapitates {2T} with a sword.',
			'{1T} dies from an infection.',
			'{1} spears {2T} in the abdomen.',
			'{1} sets {2T} on fire with a molotov.',
			'{1T} falls into a pit and dies.',
			'{1} stabs {2T} while their back is turned.',
			'{1} severely injures {2T}, but puts them out of their misery.',
			'{1} severely injures {2T} and leaves them to die.',
			"{1} bashes {2T}'s head in with a mace.",
			'{1T} attempts to climb a tree, but falls to their death.',
			'{1} pushes {2T} off a cliff during a knife fight.',
			"{1} throws a knife into {2T}'s chest.",
			"{1}'s trap kills {2T}.",
			'{1} kills {2T} while they are resting.',
			'{1T} is unable to convince {2} to not kill them.',
			'{1} convinces {2T} to not kill them, only to kill {2T} instead.',
			'{1T} falls into a frozen lake and drowns.',
			'{1}, {2}, and {3T} start fighting, but {2} runs away as {1} kills {3T}.',
			'{1} kills {2T} with their own weapon.',
			'{1} overpowers {2T}, killing them.',
			'{1} sets an explosive off, killing {2T}.',
			'{1} sets an explosive off, killing {2T}, and {3T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, and {4T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, {4T} and {5T}.',
			'{1} kills {2T} as they try to run.',
			'{1T} and {2T} threaten a double suicide. It fails and they die.',
			'{1T}, {2T}, {3T}, and {4T} form a suicide pact, killing themselves.',
			'{1T} dies from hypothermia.',
			'{1T} dies from hunger.',
			'{1T} dies from thirst.',
			'{1} kills {2T} with a hatchet.',
			'{1} and {2} fight {3T} and {4T}. {1} and {2} survive.',
			'{1T} and {2T} fight {3} and {4}. {3} and {4} survive.',
			'{1T} dies trying to escape the arena.',
			'{1T} dies of dysentery.',
			'{1T} accidently detonates a land mine while trying to arm it.',
			'{1T} attacks {2}, but {3} protects them, killing {1T}.',
			'{1} ambushes {2T} and kills them.',
			'{1T} accidently steps on a landmine.',
			'{1} severely slices {2T} with a sword.',
			'{1} strangles {2T} with a rope.',
			'{1} kills {2T} for their supplies.',
			'{1} shoots an arrow at {2}, but misses and kills {3T} instead.',
			"{1} shoots a poisonous blow dart into {2T}'s neck, slowly killing them.",
			'{1}, {2}, and {3} successfully ambush and kill {4T}, {5T}, and {6T}.',
			'{1T}, {2T}, and {3T} unsuccessfully ambush {4}, {5}, and {6}, who kill them instead.',
			'{1} stabs {2T} with a tree branch.',
			'{1} forces {2} to kill {3T} or {4}. They decide to kill {3T}.',
			'{1} forces {2} to kill {3} or {4T}. They decide to kill {4T}.',
			'{1} forces {2T} to kill {3} or {4}. They refuse to kill, so {1} kills them instead.',
			"{1T} poisons {2}'s drink, but mistakes it for their own and dies.",
			"{1} poisons {2T}'s drink. They drink it and die.",
			'{1} stabs {2T} in the back with a trident.',
			'{1T} attempts to climb a tree, but falls on {2T}, killing them both.',
			'{1}, {2T}, and {3T} get into a fight. {1} triumphantly kills them both.',
			'{1T}, {2}, and {3T} get into a fight. {2} triumphantly kills them both.',
			'{1T}, {2T}, and {3} get into a fight. {3} triumphantly kills them both.',
			'{1} kills {2T} with a sickle.',
			'{1}, {2}, {3}, {4}, and {5} track down and kill {6T}.',
			'{1}, {2}, {3}, and {4} track down and kill {5T}.',
			'{1}, {2}, and {3} track down and kill {4T}.',
			'{1} and {2} track down and kill {3T}.',
			'{1} tracks down and kills {2T}.',
			'{1} repeatedly stabs {2T} to death with sais.',
			'{1} doodles in the dirt.',
			'{1} chases a butterfly.',
			'{1T} falls off a cliff, and is impaled by a stick.',
			'{1} runs into {2}, they decide to team up.',
			'{1} sees {2} through the trees, and plans on killing them.',
			'{1} sneaks up behind {2T}, and snaps their neck.',
			'{1T} challenges {2} to a fight, and promptly dies.',
			'{1} murders their partner, {2T}, to have more supplies for themself.'
		].map(HungerGamesUsage.create),
		HG_NIGHT: [
			'{1} starts a fire.',
			'{1} sets up camp for the night.',
			'{1} loses sight of where they are.',
			'{1} climbs a tree to rest.',
			'{1} goes to sleep.',
			'{1} and {2} tell stories about themselves to each other.',
			'{1}, {2}, {3}, and {4} sleep in shifts.',
			'{1}, {2}, and {3} sleep in shifts.',
			'{1} and {2} sleep in shifts.',
			'{1} tends to their wounds.',
			'{1} sees a fire, but stays hidden.',
			'{1} screams for help.',
			'{1} stays awake all night.',
			'{1} passes out from exhaustion.',
			'{1} cooks their food before putting their fire out.',
			'{1} and {2} run into each other and decide to truce for the night.',
			'{1} fends {2}, {3}, and {4} away from their fire.',
			'{1}, {2}, and {3} discuss the games and what might happen in the morning.',
			'{1} cries themself to sleep.',
			'{1} tries to treat their infection.',
			'{1} and {2} talk about the tributes still alive.',
			'{1} is awoken by nightmares.',
			'{1} and {2} huddle for warmth.',
			'{1} thinks about winning.',
			'{1}, {2}, {3}, and {4} tell each other ghost stories to lighten the mood.',
			'{1} looks at the night sky.',
			'{1} defeats {2} in a fight, but spares their life.',
			'{1} begs for {2} to kill them. They refuse, keeping {1} alive.',
			"{1} destroys {2}'s supplies while they are asleep.",
			'{1}, {2}, {3}, {4}, and {5} sleep in shifts.',
			'{1} lets {2} into their shelter.',
			'{1} receives a hatchet from an unknown sponsor.',
			'{1} receives clean water from an unknown sponsor.',
			'{1} receives medical supplies from an unknown sponsor.',
			'{1} receives fresh food from an unknown sponsor.',
			'{1} tries to sing themself to sleep.',
			'{1} attempts to start a fire, but is unsuccessful.',
			'{1} thinks about home.',
			"{1} tends to {2}'s wounds.",
			'{1} quietly hums.',
			'{1}, {2}, and {3} cheerfully sing songs together.',
			'{1} is unable to start a fire and sleeps without warmth.',
			'{1} and {2} hold hands.',
			'{1} convinces {2} to snuggle with them.',
			'{1} receives an explosive from an unknown sponsor.',
			'{1} questions their sanity.',
			'{1} forces {2} to eat pant.',
			'{1} forces {2T} to eat pant. {2T} chokes and dies.',
			'{1} catches {2T} off guard and kills them.',
			"{1} throws a knife into {2T}'s head.",
			'{1T} begs for {2} to kill them. They reluctantly oblige, killing {1T}.',
			'{1} and {2} work together to drown {3T}.',
			'{1} strangles {2T} after engaging in a fist fight.',
			"{1} shoots an arrow into {2T}'s head.",
			'{1T} bleeds out due to untreated injuries.',
			'{1T} cannot handle the circumstances and commits suicide.',
			"{1} bashes {2T}'s head against a rock several times.",
			'{1T} unknowingly eats toxic berries.',
			"{1} silently snaps {2T}'s neck.",
			"{1} taints {2T}'s food, killing them.",
			'{1} decapitates {2T} with a sword.',
			'{1T} dies from an infection.',
			'{1} spears {2T} in the abdomen.',
			'{1} sets {2T} on fire with a molotov.',
			'{1T} falls into a pit and dies.',
			'{1} stabs {2T} while their back is turned.',
			'{1} severely injures {2T}, but puts them out of their misery.',
			'{1} severely injures {2T} and leaves them to die.',
			"{1} bashes {2T}'s head in with a mace.",
			'{1T} attempts to climb a tree, but falls to their death.',
			'{1} pushes {2T} off a cliff during a knife fight.',
			"{1} throws a knife into {2T}'s chest.",
			"{1}'s trap kills {2T}.",
			'{1} kills {2T} while they are sleeping.',
			'{1T} is unable to convince {2} to not kill them.',
			'{1} convinces {2T} to not kill them, only to kill {2T} instead.',
			'{1T} falls into a frozen lake and drowns.',
			'{1}, {2}, and {3T} start fighting, but {2} runs away as {1} kills {3T}.',
			'{1} kills {2T} with their own weapon.',
			'{1} overpowers {2T}, killing them.',
			'{1} sets an explosive off, killing {2T}.',
			'{1} sets an explosive off, killing {2T}, and {3T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, and {4T}.',
			'{1} sets an explosive off, killing {2T}, {3T}, {4T} and {5T}.',
			'{1} kills {2T} as they try to run.',
			'{1T} and {2T} threaten a double suicide. It fails and they die.',
			'{1T}, {2T}, {3T}, and {4T} form a suicide pact, killing themselves.',
			'{1T} dies from hypothermia.',
			'{1T} dies from hunger.',
			'{1T} dies from thirst.',
			'{1} kills {2T} with a hatchet.',
			'{1} and {2} fight {3T} and {4T}. {1} and {2} survive.',
			'{1T} and {2T} fight {3} and {4}. {3} and {4} survive.',
			'{1T} dies trying to escape the arena.',
			'{1T} dies of dysentery.',
			'{1T} accidently detonates a land mine while trying to arm it.',
			'{1T} attacks {2}, but {3} protects them, killing {1T}.',
			'{1} ambushes {2T} and kills them.',
			'{1T} accidently steps on a landmine.',
			'{1} severely slices {2T} with a sword.',
			'{1} strangles {2T} with a rope.',
			'{1} kills {2T} for their supplies.',
			'{1} shoots an arrow at {2}, but misses and kills {3T} instead.',
			"{1} shoots a poisonous blow dart into {2T}'s neck, slowly killing them.",
			'{1}, {2}, and {3} successfully ambush and kill {4T}, {5T}, and {6T}.',
			'{1T}, {2T}, and {3T} unsuccessfully ambush {4}, {5}, and {6}, who kill them instead.',
			'{1} stabs {2T} with a tree branch.',
			'{1} forces {2} to kill {3T} or {4}. They decide to kill {3T}.',
			'{1} forces {2} to kill {3} or {4T}. They decide to kill {4T}.',
			'{1} forces {2T} to kill {3} or {4}. They refuse to kill, so {1} kills them instead.',
			"{1T} poisons {2}'s drink, but mistakes it for their own and dies.",
			"{1} poisons {2T}'s drink. They drink it and die.",
			'{1} stabs {2T} in the back with a trident.',
			'{1T} attempts to climb a tree, but falls on {2T}, killing them both.',
			'{1}, {2T}, and {3T} get into a fight. {1} triumphantly kills them both.',
			'{1T}, {2}, and {3T} get into a fight. {2} triumphantly kills them both.',
			'{1T}, {2T}, and {3} get into a fight. {3} triumphantly kills them both.',
			'{1} kills {2T} with a sickle.',
			'{1}, {2}, {3}, {4}, and {5} track down and kill {6T}.',
			'{1}, {2}, {3}, and {4} track down and kill {5T}.',
			'{1}, {2}, and {3} track down and kill {4T}.',
			'{1} and {2} track down and kill {3T}.',
			'{1} tracks down and kills {2T}.',
			'{1} repeatedly stabs {2T} to death with sais.',
			'{1} writes in their journal.',
			'{1} watches {2} sitting at their campfire, and considers killing them.'
		].map(HungerGamesUsage.create),

		/**
		 * #################################
		 * #          SERIALIZERS          #
		 * #################################
		 */

		SERIALIZER_AUTOROLE_INVALID: 'Invalid autorole data.',
		SERIALIZER_COMMAND_AUTO_DELETE_INVALID: 'Invalid command auto-delete data.',
		SERIALIZER_CUSTOM_COMMAND_INVALID: 'Invalid custom command data.',
		SERIALIZER_DISABLED_COMMAND_CHANNEL_INVALID: 'Invalid disabled command channel data.',
		SERIALIZER_PERMISSION_NODE_DUPLICATED_COMMAND: ({ command }) => `You have set \`${command}\` twice, either allow it, or deny it.`,
		SERIALIZER_PERMISSION_NODE_INVALID_COMMAND: ({ command }) => `The command \`${command}\` does not exist or is invalid.`,
		SERIALIZER_PERMISSION_NODE_INVALID_TARGET: 'No data could be found from the ID.',
		SERIALIZER_PERMISSION_NODE_INVALID: 'Invalid data.',
		SERIALIZER_PERMISSION_NODE_SECURITY_EVERYONE_ALLOWS: 'For security, the everyone role cannot have allows.',
		SERIALIZER_PERMISSION_NODE_SECURITY_GUARDED: ({ command }) =>
			`For security and for me to work properly, you cannot deny the usage for the command \`${command}\`.`,
		SERIALIZER_PERMISSION_NODE_SECURITY_OWNER: 'You cannot set permission overrides on the server owner.',
		SERIALIZER_REACTION_ROLE_INVALID: 'Invalid reaction role data.',
		SERIALIZER_STICKY_ROLE_INVALID: 'Invalid sticky role data.',
		SERIALIZER_TRIGGER_ALIAS_INVALID: 'Invalid trigger alias data.',
		SERIALIZER_TRIGGER_INCLUDE_INVALID: 'Invalid trigger includes data.',
		SERIALIZER_TWITCH_SUBSCRIPTION_INVALID_STREAMER: 'Invalid data streamer.',
		SERIALIZER_TWITCH_SUBSCRIPTION_INVALID: 'Invalid data.',
		SERIALIZER_UNIQUE_ROLE_SET_INVALID: 'Invalid unique role set data.',

		/**
		 * #################################
		 * #        NOTIFICATIONS          #
		 * #################################
		 */
		NOTIFICATIONS_TWITCH_NO_GAME_NAME: '*Nombre del juego no establecido*',
		NOTIFICATIONS_TWITCH_EMBED_DESCRIPTION: ({ userName, gameName }) =>
			`${userName} ya está en vivo${gameName ? ` - ¡transmitiendo ${gameName}!` : '!'}`,
		NOTIFICATION_TWITCH_EMBED_FOOTER: 'Skyra Twitch Notificaciones',

		/**
		 * #################################
		 * #             UTILS             #
		 * #################################
		 */

		SELF_MODERATION_COMMAND_INVALID_MISSING_ACTION: ({ name }) =>
			`${REDCROSS} Action must be any of the following: \`enable\`, \`disable\`, \`action\`, \`punish\`, \`punish-duration\`, \`threshold-maximum\`, \`threshold-duration\`, or \`show\`. Check \`Skyra, help ${name}\` for more information.`,
		SELF_MODERATION_COMMAND_INVALID_MISSING_ARGUMENTS: ({ name }) =>
			`${REDCROSS} The specified action requires an extra argument to be passed. Check \`Skyra, help ${name}\` for more information.`,
		SELF_MODERATION_COMMAND_INVALID_SOFTACTION: ({ name }) =>
			`${REDCROSS} Value must be any of the following: \`alert\`, \`log\`, or \`delete\`. Check \`Skyra, help ${name}\` for more information.`,
		SELF_MODERATION_COMMAND_INVALID_HARDACTION: ({ name }) =>
			`${REDCROSS} Value must be any of the following: \`none\`, \`warn\`, \`mute\`, \`kick\`, \`softban\`, or \`ban\`. Check \`Skyra, help ${name}\` for more information.`,
		SELF_MODERATION_COMMAND_ENABLED: `${GREENTICK} Successfully enabled sub-system.`,
		SELF_MODERATION_COMMAND_DISABLED: `${GREENTICK} Successfully disabled sub-system.`,
		SELF_MODERATION_COMMAND_SOFT_ACTION: ({ value }) =>
			value ? `${GREENTICK} Successfully set actions to: \`${value}\`` : `${GREENTICK} Successfully disabled actions.`,
		SELF_MODERATION_COMMAND_HARD_ACTION: ({ value }) => `${GREENTICK} Successfully set punishment: ${value}`,
		SELF_MODERATION_COMMAND_HARD_ACTION_DURATION: ({ value }) =>
			value
				? `${GREENTICK} Successfully set the punishment appeal timer to: ${duration(value)}`
				: `${GREENTICK} Successfully removed the punishment appeal timer.`,
		SELF_MODERATION_COMMAND_THRESHOLD_MAXIMUM: ({ value }) =>
			value
				? `${GREENTICK} Successfully set the threshold maximum to: ${value}`
				: `${GREENTICK} Successfully removed the threshold maximum, punishment will take place instantly if set.`,
		SELF_MODERATION_COMMAND_THRESHOLD_DURATION: ({ value }) =>
			value
				? `${GREENTICK} Successfully set the threshold duration to: ${duration(value)}`
				: `${GREENTICK} Successfully removed the threshold duration, punishments will take place instantly if set.`,
		SELF_MODERATION_COMMAND_SHOW: ({ kEnabled, kAlert, kLog, kDelete, kHardAction, hardActionDuration, thresholdMaximum, thresholdDuration }) =>
			[
				`Enabled      : ${kEnabled}`,
				'Action',
				` - Alert     : ${kAlert}`,
				` - Log       : ${kLog}`,
				` - Delete    : ${kDelete}`,
				'Punishment',
				` - Type      : ${kHardAction}`,
				` - Duration  : ${hardActionDuration ? 'Permanent' : duration(hardActionDuration)}`,
				'Threshold',
				` - Maximum   : ${thresholdMaximum ? thresholdMaximum : 'Unset'}`,
				` - Duration  : ${thresholdDuration ? duration(thresholdDuration) : 'Unset'}`
			].join('\n'),
		SELF_MODERATION_SOFT_ACTION_ALERT: 'Alert',
		SELF_MODERATION_SOFT_ACTION_LOG: 'Log',
		SELF_MODERATION_SOFT_ACTION_DELETE: 'Delete',
		SELF_MODERATION_HARD_ACTION_BAN: 'Ban',
		SELF_MODERATION_HARD_ACTION_KICK: 'Kick',
		SELF_MODERATION_HARD_ACTION_MUTE: 'Mute',
		SELF_MODERATION_HARD_ACTION_SOFTBAN: 'SoftBan',
		SELF_MODERATION_HARD_ACTION_WARNING: 'Warning',
		SELF_MODERATION_HARD_ACTION_NONE: 'None',
		SELF_MODERATION_ENABLED: 'Yes',
		SELF_MODERATION_DISABLED: 'No',
		SELF_MODERATION_MAXIMUM_TOO_SHORT: ({ minimum, value }) => `${REDCROSS} The value (${value}) was too short, expected at least ${minimum}.`,
		SELF_MODERATION_MAXIMUM_TOO_LONG: ({ maximum, value }) => `${REDCROSS} The value (${value}) was too long, expected maximum ${maximum}.`,
		SELF_MODERATION_DURATION_TOO_SHORT: ({ minimum, value }) =>
			`${REDCROSS} The value (${duration(value)}) was too short, expected at least ${duration(minimum)}.`,
		SELF_MODERATION_DURATION_TOO_LONG: ({ maximum, value }) =>
			`${REDCROSS} The value (${duration(value)}) was too long, expected maximum ${duration(maximum)}.`,

		ACTION_MUTE_REASON: ({ reason }) => (reason === null ? '[Action] Applied Mute.' : `[Action] Applied Mute | Reason: ${reason}`),
		ACTION_UNMUTE_REASON: ({ reason }) => (reason === null ? '[Action] Revoked Mute.' : `[Action] Revoked Mute | Reason: ${reason}`),
		ACTION_KICK_REASON: ({ reason }) => (reason === null ? '[Action] Applied Kick.' : `[Action] Applied Kick | Reason: ${reason}`),
		ACTION_SOFTBAN_REASON: ({ reason }) => (reason === null ? '[Action] Applying Softban.' : `[Action] Applying Softban | Reason: ${reason}`),
		ACTION_UNSOFTBAN_REASON: ({ reason }) => (reason === null ? '[Action] Applied Softban.' : `[Action] Applied Softban | Reason: ${reason}`),
		ACTION_BAN_REASON: ({ reason }) => (reason === null ? '[Action] Applied Ban' : `[Action] Applied Ban | Reason: ${reason}`),
		ACTION_UNBAN_REASON: ({ reason }) => (reason === null ? '[Action] Applied Unban.' : `[Action] Applied Unban | Reason: ${reason}`),
		ACTION_VMUTE_REASON: ({ reason }) => (reason === null ? '[Action] Applied Voice Mute.' : `[Action] Applied Voice Mute | Reason: ${reason}`),
		ACTION_UNVMUTE_REASON: ({ reason }) => (reason === null ? '[Action] Revoked Voice Mute.' : `[Action] Revoked Voice Mute | Reason: ${reason}`),
		ACTION_VKICK_REASON: ({ reason }) => (reason === null ? '[Action] Applied Voice Kick.' : `[Action] Applied Voice Kick | Reason: ${reason}`),
		ACTION_RESTRICTED_REACT_REASON: ({ reason }) =>
			reason === null ? '[Action] Applied Reaction Restriction.' : `[Action] Applied Reaction Restriction | Reason: ${reason}`,
		ACTION_RESTRICTED_EMBED_REASON: ({ reason }) =>
			reason === null ? '[Action] Applied Embed Restriction.' : `[Action] Applied Embed Restriction | Reason: ${reason}`,
		ACTION_RESTRICTED_ATTACHMENT_REASON: ({ reason }) =>
			reason === null ? '[Action] Applied Attachment Restriction.' : `[Action] Applied Attachment Restriction | Reason: ${reason}`,
		ACTION_RESTRICTED_VOICE_REASON: ({ reason }) =>
			reason === null ? '[Action] Applied Voice Restriction.' : `[Action] Applied Voice Restriction | Reason: ${reason}`,
		ACTION_SET_NICKNAME: ({ reason, nickname }) =>
			reason === null
				? `[Action] ${nickname ? 'Set Nickname' : 'Removed Nickname'}.`
				: `[Action] ${nickname ? 'Set Nickname' : 'Removed Nickname'} | Reason: ${reason}`,
		ACTION_ADD_ROLE: ({ reason }) => (reason === null ? '[Action] Added Role.' : `[Action] Added Role | Reason: ${reason}`),
		ACTION_REMOVE_ROLE: ({ reason }) => (reason === null ? '[Action] Removed Role.' : `[Action] Removed Role | Reason: ${reason}`),
		ACTION_REQUIRED_MEMBER: 'The user does not exist or is not in this server.',
		ACTION_SETUP_MUTE_EXISTS: '**Cancelando la creación del rol de silenciado**: Ya existe un rol de silenciado.',
		ACTION_SETUP_RESTRICTION_EXISTS: '**Cancelando la creación del rol de restricción**: Ya existe un rol de restricción.',
		ACTION_SETUP_TOO_MANY_ROLES: '**Cancelando la creación del rol**: Hay 250 roles en este servidor, necesitas borrar uno.',
		ACTION_SHARED_ROLE_SETUP_EXISTING: 'I could not find a configured role. Do you want to configure an existing one?',
		ACTION_SHARED_ROLE_SETUP_EXISTING_NAME: 'Please give me the name of the role you want to use for further actions of this type.',
		ACTION_SHARED_ROLE_SETUP_NEW: 'Do you want me to create a new role and configure it automatically?',
		ACTION_SHARED_ROLE_SETUP: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} ${channels === 1 ? 'channel' : 'channels'} to apply the role ${role} the following ${
				permissions.length === 1 ? 'permission' : 'permissions'
			}: \`${permissions.join('`, `')}\`?`,
		MUTE_NOT_CONFIGURED: 'The muted role must be configured for this action to happen.',
		RESTRICTION_NOT_CONFIGURED: 'The restriction role must be configured for this action to happen',
		MUTE_NOT_IN_MEMBER: 'The muted role is not set in the member.',
		MUTE_LOW_HIERARCHY: 'I cannot mute a user which higher role hierarchy than me.',
		MUTE_CANNOT_MANAGE_ROLES: `I must have **${PERMS.MANAGE_ROLES}** permissions to be able to mute.`,
		MUTE_NOT_EXISTS: 'The specified user is not muted.',

		RESOLVER_DATE_SUFFIX: ' segundos',
		RESOLVER_POSITIVE_AMOUNT: 'You must give me a positive number.',
		POWEREDBY_WEEBSH: 'Powered by weeb.sh',
		PREFIX_REMINDER: ({ prefix }) => `El prefijo de este servidor está configurado a: \`${prefix}\``,

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
		SYSTEM_PARSE_ERROR: `${REDCROSS} I failed to process the data I was given, sorry~!`,
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
		SYSTEM_ERROR: `¡Algo malo sucedio! Inténtalo de nuevo, o si el problema continúa, únete al servidor de soporte (sugerencia: usa \`Skyra, support\`)`,
		SYSTEM_DATABASE_ERROR: `¡No pude conseguir eso en mi base de datos! Inténtalo de nuevo, o si el problema continúa, únete al servidor de soporte (sugerencia: usa \`Skyra, support\`)`,
		SYSTEM_DISCORD_ABORTERROR: 'He tenido un pequeño error de red al mandar un mensaje a Discord, ¡por favor ejecuta el comando de nuevo!',
		SYSTEM_MESSAGE_NOT_FOUND: 'Lo siento, pero la id del mensaje que escribiste no era correcto, o el mensaje fue borrado.',
		SYSTEM_NOTENOUGH_PARAMETERS: 'Lo siento, pero no proporcionaste suficientes parámetros...',
		SYSTEM_GUILD_MUTECREATE_APPLYING: ({ channels, role }) => `Aplicando permisos en ${channels} para el rol ${role}...`,
		SYSTEM_GUILD_MUTECREATE_EXCEPTIONS: ({ denied }) => (denied.length > 1 ? `, con excepción de los canales ${denied.join(', ')}` : ''),
		SYSTEM_GUILD_MUTECREATE_APPLIED: ({ accepted, exceptions, author, role }) =>
			`Permisos aplicados para ${accepted} ${
				accepted === 1 ? 'canal' : 'canales'
			}${exceptions}. Querido ${author}, puedes modificar los permisos de los canales que quieras para el rol ${role}, por ejemplo si quieres un canal de reclamaciones.`,
		SYSTEM_QUERY_FAIL: 'Lo siento, pero la aplicación no pudo resolver su solicitud. ¿Estás seguro/a que escribiste el nombre correctamente?',
		SYSTEM_NO_RESULTS: 'No pude encontrar ningún resultado para esa consulta',
		SYSTEM_CANNOT_ACCESS_CHANNEL: 'Lo siento, pero no tienes permiso para ver ese canal.',
		SYSTEM_EXCEEDED_LENGTH_OUTPUT: ({ output, time, type }) =>
			`**Salida**:${output}${type !== undefined && time !== undefined ? `\n**Type**:${type}\n${time}` : ''}`,
		SYSTEM_EXCEEDED_LENGTH_OUTPUT_CONSOLE: ({ time, type }) =>
			`Enviado el resultado a la consola.${type !== undefined && time !== undefined ? `\n**Type**:${type}\n${time}` : ''}`,
		SYSTEM_EXCEEDED_LENGTH_OUTPUT_FILE: ({ time, type }) =>
			`Enviado el resultado como un archivo.${type !== undefined && time !== undefined ? `\n**Type**:${type}\n${time}` : ''}`,
		SYSTEM_EXCEEDED_LENGTH_OUTPUT_HASTEBIN: ({ url, time, type }) =>
			`Enviado el resultado a hastebin: ${url}${type !== undefined && time !== undefined ? `\n**Type**:${type}\n${time}` : ''}\n`,
		SYSTEM_EXCEEDED_LENGTH_CHOOSE_OUTPUT: ({ output }) => `Elija una de las siguientes opciones: ${this.list(output, 'o')}`,
		SYSTEM_EXTERNAL_SERVER_ERROR: 'El servicio externo que utilizamos no pudo procesar nuestro mensaje, por favor, inténtelo de nuevo más tarde.',

		JUMPTO: 'Salta al Mensaje ►',

		RESOLVER_INVALID_CHANNELNAME: ({ name }) => `${name} debe ser una mención, nombre, o id válido de un canal.`,
		RESOLVER_INVALID_ROLENAME: ({ name }) => `${name} debe ser una mención, nombre, o id válido de un rol.`,
		RESOLVER_INVALID_USERNAME: ({ name }) => `${name} debe ser una mención, nombre, o id válido de un usuario.`,
		RESOLVER_CHANNEL_NOT_IN_GUILD: 'Lo siento, pero ese comando solo se puede ejecutar en un servidor.',
		RESOLVER_CHANNEL_NOT_IN_GUILD_SUBCOMMAND: ({ command, subcommand }) =>
			`${REDCROSS} Lo siento, pero la subcommandos \`${subcommand}\` para el comando \`${command}\` solo se puede ejecutar en un servidor.`,
		RESOLVER_MEMBERNAME_USER_LEFT_DURING_PROMPT: 'El usuario salió durante la selección de usuarios.',

		LISTIFY_PAGE: ({ page, pageCount, results }) => `Página ${page} / ${pageCount} | ${results} Resultados`,

		MODERATION_LOG_APPEALED: `${REDCROSS} Lo siento, pero el caso de moderación ha expirado o no se puede temporizar.`,
		MODERATION_LOG_EXPIRES_IN: ({ duration }) => `\n❯ **Caduca en**: ${this.duration(duration)}`,
		MODERATION_LOG_DESCRIPTION: ({ data: { caseID, formattedDuration, prefix, reason, type, userDiscriminator, userID, userName } }) =>
			[
				`❯ **Tipo**: ${type}`,
				`❯ **Usuario:** ${userName}#${userDiscriminator} (${userID})`,
				`❯ **Razón:** ${reason || `Por favor use \`${prefix}reason ${caseID} <razón>\` para establecer la razón.`}${formattedDuration}`
			].join('\n'),
		MODERATION_LOG_FOOTER: ({ caseID }) => `Caso ${caseID}`,
		MODERATION_CASE_NOT_EXISTS: `${REDCROSS} Lo siento, pero el caso de moderación seleccionado no existe.`,
		MODERATION_CASES_NOT_EXIST: `${REDCROSS} Lo siento, pero los casos de moderación seleccionados no existen.`,

		GUILD_SETTINGS_CHANNELS_MOD: 'Necesitas configurar un canal de moderación. Utiliza `Skyra, settings set channels.modlog <NombreDeCanal>`.',
		GUILD_SETTINGS_ROLES_RESTRICTED: ({ prefix, path }) =>
			`${REDCROSS} You need to configure a role for this action, use \`${prefix}settings set ${path} <rolename>\` to set it up.`,
		GUILD_MUTE_NOT_FOUND:
			'He fallado al buscar un caso de moderación que justifique el mute del usuario. O el usuario nunca ha sido muteado, o todos sus muteos están reclamados.',
		GUILD_BANS_EMPTY: 'No hay baneos registrados en este servidor.',
		GUILD_BANS_NOT_FOUND: 'Intenté y fallé al buscar el usuario. ¿Estás seguro de que está expulsado/a?.',
		CHANNEL_NOT_READABLE: `Lo siento, pero necesito los permisos **${PERMS.VIEW_CHANNEL}** y **${PERMS.READ_MESSAGE_HISTORY}** para poder leer los mensajes.`,

		USER_NOT_IN_GUILD: 'El usuario no está en este servidor.',
		USER_NOT_EXISTENT: 'El usuario no parece existir. ¿Estás seguro/a que es una ID de usuario válida?',

		EVENTS_GUILDMEMBERADD: 'Nuevo Usuario',
		EVENTS_GUILDMEMBERADD_MUTE: 'Nuevo Usuario Muteado',
		EVENTS_GUILDMEMBERADD_RAID: 'RAID Detectado',
		EVENTS_GUILDMEMBERADD_DESCRIPTION: ({ mention, time }) => `${mention} | **Se Unió a Discord**: Hace ${duration(time, 2)}.`,
		EVENTS_GUILDMEMBERREMOVE: 'Usuario Salió',
		EVENTS_GUILDMEMBERKICKED: 'Usuario Pateado',
		EVENTS_GUILDMEMBERBANNED: 'Usuario Baneado',
		EVENTS_GUILDMEMBERSOFTBANNED: 'Usuario Levemente Baneado',
		EVENTS_GUILDMEMBERREMOVE_DESCRIPTION: ({ mention, time }) =>
			`${mention} | **Se Unió al Servidor**: ${time === -1 ? 'Desconocido' : `Hace ${duration(time, 2)}`}.`,
		EVENTS_GUILDMEMBER_UPDATE_NICKNAME: ({ previous, current }) => `Actualizado el apodo de **${previous}** a **${current}**`,
		EVENTS_GUILDMEMBER_ADDED_NICKNAME: ({ current }) => `Añadido un nuevo apodo **${current}**`,
		EVENTS_GUILDMEMBER_REMOVED_NICKNAME: ({ previous }) => `Eliminado el apodo **${previous}**`,
		EVENTS_GUILDMEMBER_UPDATE_ROLES: ({ removed, added }) =>
			`${removed.length > 0 ? `${removed.length === 1 ? 'Eliminado el rol' : 'Eliminados los roles'}: ${removed.join(', ')}\n` : ''}${
				added.length > 0 ? `${added.length === 1 ? 'Añadido el rol' : 'Añadidos los roles'}: ${added.join(', ')}` : ''
			}`,
		EVENTS_NICKNAME_UPDATE: 'Nickname Edited',
		EVENTS_USERNAME_UPDATE: 'Username Edited',
		EVENTS_NAME_DIFFERENCE: ({ previous, next }) =>
			[`**Previous**: ${previous === null ? 'Unset' : `\`${previous}\``}`, `**Next**: ${next === null ? 'Unset' : `\`${next}\``}`].join('\n'),
		EVENTS_ROLE_DIFFERENCE: ({ addedRoles, removedRoles }) =>
			[
				`**Added roles**: ${addedRoles.length ? addedRoles.join(', ') : 'None'}`,
				`**Removed roles**: ${removedRoles.length ? removedRoles.join(', ') : 'None'}`
			].join('\n'),
		EVENTS_ROLE_UPDATE: 'Roles Edited',
		EVENTS_MESSAGE_UPDATE: 'Mensaje Editado',
		EVENTS_MESSAGE_DELETE: 'Mensaje Eliminado',
		EVENTS_REACTION: 'Reacción Añadida',
		EVENTS_COMMAND: ({ command }) => `Comando Usado: ${command}`,

		SETTINGS_DELETE_CHANNELS_DEFAULT: 'Restablecido el valor para la clave `channels.default`',
		SETTINGS_DELETE_ROLES_INITIAL: 'Restablecido el valor para la clave `roles.initial`',
		SETTINGS_DELETE_ROLES_MUTE: 'Restablecido el valor para la clave `roles.muted`',

		MODLOG_TIMED: ({ remaining }) => `Este caso de moderación ya había sido temporizado. Expira en ${duration(remaining)}`,

		GUILD_WARN_NOT_FOUND:
			'Fallé al buscar el caso de moderación para su reclamación. O no existe, o no es una advertencia, o ya estaba reclamada.',
		GUILD_MEMBER_NOT_VOICECHANNEL: 'No puedo tomar acción en un miembro que no está conectado a un canal de voz.',

		PROMPTLIST_MULTIPLE_CHOICE: ({ list, amount }) =>
			`He encontrado ${amount} ${
				amount === 1 ? 'resultado' : 'resultados'
			}. Por favor escriba un número entre 1 y ${amount}, o escriba **"CANCELAR"** para cancelar la solicitud.\n${list}`,
		PROMPTLIST_ATTEMPT_FAILED: ({ list, attempt, maxAttempts }) => `Valor inválido. Intento **${attempt}** de **${maxAttempts}**\n${list}`,
		PROMPTLIST_ABORTED: 'Cancelada la solicitud con éxito.',

		FUZZYSEARCH_MATCHES: ({ matches, codeblock }) =>
			`¡Encontré múltiples resultados! **Por favor selecciona un número entre 0 y ${matches}**:\n${codeblock}\nEscribe **ABORT** para cancelar la solicitud.`,
		FUZZYSEARCH_INVALID_NUMBER: 'Esperaba que me dieras un número de un dígito, pero recibí una patata.',
		FUZZYSEARCH_INVALID_INDEX: 'Cancelando solicitud... El número no estaba dentro del rango.',

		EVENTS_ERROR_WTF: '¡Vaya fallo más terrible! ¡Lo siento!',
		EVENTS_ERROR_STRING: ({ mention, message }) => `Querido ${mention}, ${message}`,

		CONST_USERS: 'Usuarios',
		UNKNOWN_CHANNEL: 'Canal desconocido',
		UNKNOWN_ROLE: 'Rol desconocido',
		UNKNOWN_USER: 'Usuario desconocido'
	};

	public async init() {
		// noop
	}
}
