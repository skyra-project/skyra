/* eslint-disable @typescript-eslint/no-invalid-this, @typescript-eslint/member-ordering */
export default class extends Language {
	public PERMISSIONS = {
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
		PRIORITY_SPEAKER: 'Orador Prioritario',
		VIEW_GUILD_INSIGHTS: 'View Guild Insights'
	};

	public HUMAN_LEVELS = {
		NONE: 'Ninguno',
		LOW: 'Bajo',
		MEDIUM: 'Medio',
		HIGH: 'Alto',
		VERY_HIGH: 'Muy alto'
	};

	public duration(time: number, precision?: number) {
		return duration.format(time, precision);
	}

	/** Parses cardinal numbers to the ordinal counterparts */
	public ordinal(cardinal: number) {
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

	public list(values: readonly string[], conjunction: 'o' | 'y') {
		switch (values.length) {
			case 0:
				return '';
			case 1:
				return values[0];
			case 2:
				return `${values[0]} ${conjunction} ${values[1]}`;
			default: {
				const trail = values.slice(0, -1);
				const head = values[values.length - 1];
				return `${trail.join(', ')}, ${conjunction} ${head}`;
			}
		}
	}

	public groupDigits(number: number) {
		return number.toLocaleString(this.name, { useGrouping: true });
	}

	public language: LanguageKeys = {
		/**
		 * ################################
		 * #      FRAMEWORK MESSAGES      #
		 * #         KLASA 0.5.0d         #
		 * ################################
		 */

		default: ({ key }) => `La clave ${key} aún no ha sido traducida a es-ES.`,
		defaultLanguage: 'Lenguaje Predeterminado',
		globalYes: 'Si',
		globalNo: 'No',
		globalNone: 'Ninguno',
		globalIs: 'es',
		globalAnd: 'y',
		globalOr: 'o',
		globalUnknown: 'Unknown',
		settingGatewayKeyNoext: ({ key }) => `The key "${key}" does not exist in the data schema.`,
		settingGatewayChooseKey: ({ keys }) => `You cannot edit a settings group, pick any of the following: "${keys}"`,
		settingGatewayUnconfigurableFolder: 'This settings group does not have any configurable sub-key.',
		settingGatewayUnconfigurableKey: ({ key }) => `The settings key "${key}" has been marked as non-configurable by the bot owners.`,
		settingGatewayMissingValue: ({ path, value }) => `The value "${value}" cannot be removed from the key "${path}" because it does not exist.`,
		settingGatewayDuplicateValue: ({ path, value }) => `The value "${value}" cannot be added to the key "${path}" because it was already set.`,
		settingGatewayInvalidFilteredValue: ({ path, value }) => `The settings key "${path}" does not accept the value "${value}".`,
		resolverBoolFalseOptions: ['falso', 'f', 'no', 'n', 'off', 'desactiva', 'desactivar', 'desactivado', '0', '-'],
		resolverBoolTrueOptions: ['verdadero', 'v', 'si', 'sí', 's', 'on', 'activa', 'activar', 'activado', '1', '+'],
		resolverBoolEnabled: 'Activado',
		resolverBoolDisabled: 'Desactivado',
		resolverMultiTooFew: ({ name, min, conjunctionWord }) =>
			`No pude resolver suficientes ${name}s. Al menos ${min} ${conjunctionWord} requeridos.`,
		resolverInvalidBool: ({ name }) => `${name} debe ser o 'true' para afirmativo, o 'false' para negativo.`,
		resolverInvalidChannel: ({ name }) => `${name} debe ser una mención de canal o una id de canal válida.`,
		resolverInvalidCustom: ({ name, type }) => `${name} debe ser un válido ${type}.`,
		resolverInvalidDate: ({ name }) => `${name} debe ser una fecha válida.`,
		resolverInvalidDuration: ({ name }) => `${name} debe ser una duración válida.`,
		resolverInvalidEmoji: ({ name }) => `${name} debe ser un emoji o una id de emoji válida.`,
		resolverInvalidFloat: ({ name }) => `${name} debe ser un número válido.`,
		resolverInvalidGuild: ({ name }) => `${name} debe ser una id de servidor válida.`,
		resolverInvalidInt: ({ name }) => `${name} debe ser un número entero válido.`,
		resolverInvalidInvite: ({ name }) => `${name} debe ser una invitación de servidor válida.`,
		resolverInvalidWager: ({ bet, validAmounts }) =>
			`Lo siento, pero ${bet} ${SHINY} es una cantidad no válida para apostar. Puedes apostar una de las siguientes cantidades ${validAmounts}`,
		resolverInvalidLiteral: ({ name }) => `La opción no coincide con la única posibilidad: ${name}`,
		resolverInvalidMember: ({ name }) => `${name} debe ser una mención de usuario o una id de usuario válida.`,
		resolverInvalidMessage: ({ name }) => `${name} debe ser una id de mensaje válida.`,
		resolverInvalidPiece: ({ name, piece }) => `${name} debe ser un nombre de ${piece} válido.`,
		resolverInvalidRegexMatch: ({ name, pattern }) => `${name} debe combinar con el siguiente patrón \`${pattern}\`.`,
		resolverInvalidRole: ({ name }) => `${name} debe ser una mención de rol o una id de rol válida.`,
		resolverInvalidString: ({ name }) => `${name} debe ser un texto no vacío válido.`,
		resolverInvalidTime: ({ name }) => `${name} debe ser una duración o fecha válida.`,
		resolverInvalidUrl: ({ name }) => `${name} debe ser un enlace válido.`,
		resolverInvalidUser: ({ name }) => `${name} debe ser una mención o una id de usuario válida.`,
		resolverInvalidSnowflake: ({ name }) => `${name} debe ser un snowflake válido de Discord.`,
		resolverInvalidStore: ({ store }) => `${store} debe ser una tienda válido.`,
		resolverStringSuffix: ' carácteres',
		resolverMinmaxExactlyInclusive: ({ name, min }) => `${name} must be exactly ${min}.`,
		resolverMinmaxExactlyExclusive: ({ name, min }) => `${name} must be exactly ${min}.`,
		resolverMinmaxBothInclusive: ({ name, min, max }) => `${name} must be between ${min} and ${max} inclusively.`,
		resolverMinmaxBothExclusive: ({ name, min, max }) => `${name} must be between ${min} and ${max} exclusively.`,
		resolverMinmaxMinInclusive: ({ name, min }) => `${name} must be greater than ${min} inclusively.`,
		resolverMinmaxMinExclusive: ({ name, min }) => `${name} must be greater than ${min} exclusively.`,
		resolverMinmaxMaxInclusive: ({ name, max }) => `${name} must be less than ${max} inclusively`,
		resolverMinmaxMaxExclusive: ({ name, max }) => `${name} must be less than ${max} exclusively.`,
		reactionhandlerPrompt: '¿A qué página te gustaría saltar?',
		systemHelpTitles: {
			explainedUsage: '⚙ | ***Uso Explicado***',
			possibleFormats: '🔢 | ***Formatos Posibles***',
			examples: '🔗 | ***Ejemplos***',
			reminders: '⏰ | ***Recordatorio***'
		},
		commandmessageMissing: 'Faltan uno o más argumentos al final de la entrada.',
		commandmessageMissingRequired: ({ name }) => `El argumento ${name} es requerido.`,
		commandmessageMissingOptionals: ({ possibles }) => `Falta una opción requerida: (${possibles})`,
		commandmessageNomatch: ({ possibles }) => `Su opción no se pudo encontrar en ninguna de las posibilidades: (${possibles})`,
		monitorCommandHandlerReprompt: ({ tag, name, time, cancelOptions }) =>
			`${tag} | **${name}** | Tienes **${time}** segundos para responder a este mensaje con un argumento válido. Escribe **${cancelOptions}** para cancelar la solicitud.`,
		monitorCommandHandlerRepeatingReprompt: ({ tag, name, time, cancelOptions }) =>
			`${tag} | El argumento **${name}** puede aceptar multiples valores | Tienes **${time}** segundos para responder a esta solicitud con valores adicionales. Escribe **${cancelOptions}** para cancelar la solicitud.`,
		monitorCommandHandlerAborted: 'Cancelado.',
		inhibitorCooldown: ({ remaining }) => `Acabas de usar este comando. Puedes usarlo de nuevo en ${remaining}.`,
		inhibitorMissingBotPerms: ({ missing }) => `No tengo los permisos suficientes, me faltan: ${missing}`,
		inhibitorNsfw: 'Este comando no es apto para este canal, no es un canal marcado como "NSFW"',
		inhibitorPermissions: 'No tienes permisos para usar este comando',
		inhibitorRequiredSettings: ({ settings }) =>
			`El servidor requiere el ajuste del servidor **${settings}**, y por lo tanto, no puedo ejecutar el comando.`,
		inhibitorRequiredSettingsPlural: ({ settings }) =>
			`El servidor requiere los ajustes del servidor **${settings}**, y por lo tanto, no puedo ejecutar el comando.`,
		inhibitorRunin: ({ type }) => `Éste comando sólo está disponible en los canales de ${type}`,
		inhibitorRuninNone: ({ name }) => `El comando ${name} no está configurado para ejecutarse en algún canal.`,
		inhibitorDisabledGuild: 'This command has been disabled by an admin in this guild!.',
		inhibitorDisabledGlobal:
			'This command has been globally disabled by the bot owners. Want to know why and find out when it will be back? Join the official Skyra server: https://join.skyra.pw',
		commandBlocklistDescription: 'Bloquear o permitir que usuarios y gremios utilicen mis funcionalidades.',
		commandBlocklistSaveSuccess: `${GREENTICK} Successfully updated blocked users and/or guilds`,
		commandBlocklistResetSuccess: `${GREENTICK} Successfully reset blocked users and guilds`,
		commandUnload: ({ type, name }) => `${GREENTICK} Eliminado con éxito la pieza tipo ${type}: ${name}`,
		commandUnloadDescription: 'Elimina una pieza de Klasa.',
		commandTransferError: `${REDCROSS} El archivo ya había sido transferido o nunca existió.`,
		commandTransferSuccess: ({ type, name }) => `${GREENTICK} Transferido con éxito la pieza tipo ${type}: ${name}`,
		commandTransferFailed: ({ type, name }) =>
			`La transferencia de la pieza tipo ${type}: ${name} al cliente falló. Por favor revisa la consola.`,
		commandTransferDescription: 'Transfiere una pieza interna a su carpeta respectiva.',
		commandReload: ({ type, name, time }) => `${GREENTICK} Recargada la pieza tipo ${type}: ${name}. (Tomó: ${time})`,
		commandReloadFailed: ({ type, name }) => `${REDCROSS} La recarga de la pieza tipo ${type}: ${name} falló. Por favor revisa su consola.`,
		commandReloadAll: ({ type, time }) => `${GREENTICK} Recargadas todas las piezas tipo ${type}. (Tomó: ${time})`,
		commandReloadEverything: ({ time }) => `${GREENTICK} Recargado todo. (Tomó: ${time})`,
		commandReloadDescription: 'Recarga una pieza de Klasa, o todas las piezas de su lista.',
		commandReboot: `${LOADING} Reiniciando...`,
		commandRebootDescription: 'Reinicia el bot.',
		commandPing: `${LOADING} Ping?`,
		commandPingDescription: 'Establece una prueba de conexión con Discord.',
		commandPingPong: ({ diff, ping }) => `Pong! (El viaje ida y vuelta tomó: ${diff}ms. Pulso: ${ping}ms.)`,
		commandInfoDescription: 'Muestra alguna información sobre mí.',
		commandHelpDescription: 'Muestra la ayuda para un comando o todos.',
		commandHelpNoExtended: 'No está documentado completamente.',
		commandHelpDm: '📥 | La lista de comandos ha sido enviada a tus mensajes privados.',
		commandHelpNodm: `${REDCROSS} | Parece que tienes tus mensajes privados desactivados, no pude mandarte el mensaje.`,
		commandHelpAllFlag: ({ prefix }) =>
			`Mostrando una categoría por página. ¿Problemas con el mensaje? Envía \`${prefix}help --all\` para la lista de todos los comandos en tus Mensajes Directos.`,
		commandHelpCommandCount: ({ count }) => `${count} comando`,
		commandHelpCommandCountPlural: ({ count }) => `${count} comandos`,
		commandEnable: ({ type, name }) => `+ Activado con éxito la pieza tipo ${type}: ${name}`,
		commandEnableDescription: 'Re-activa o activa temporalmente una pieza de Klasa. El estado por defecto es restaurado al recargar.',
		commandDisable: ({ type, name }) => `+ Desactivado con éxito la pieza tipo ${type}: ${name}`,
		commandDisableDescription: 'Re-desactiva o desactiva temporalmente una pieza de Klasa. El estado por defecto es restaurado al recargar.',
		commandDisableWarn: 'Probablemente no quieras desactivar eso, ya que no tendrías ningún comando para re-activarlo.',
		commandConfNoKey: 'Debes proveer el nombre de una clave.',
		commandConfNoValue: 'Debes proveer un valor para la clave.',
		commandConfGuarded: ({ name }) => `La pieza ${toTitleCase(name)} no debería ser desactivada.`,
		commandConfUpdated: ({ key, response }) => `Actualizado con éxito la clave **${key}** al valor: \`${response}\`.`,
		commandConfKeyNotArray: "Esta clave no acepta múltiples valores. Usa la acción 'reset' en su lugar.",
		commandConfGetNoExt: ({ key }) => `The key **${key}** does not seem to exist.`,
		commandConfGet: ({ key, value }) => `The value for the key **${key}** is: \`${value}\``,
		commandConfReset: ({ key, value }) => `The key **${key}** has been reset to: \`${value}\``,
		commandConfNochange: ({ key }) => `The value for **${key}** was already that value.`,
		commandConfServerDescription: 'Define per-server settings.',
		commandConfServer: ({ key, list }) => `**Server Setting ${key}**\n${list}`,
		commandConfUserDescription: 'Define per-user settings.',
		commandConfDashboardOnlyKey: ({ key }) => `\`${key}\` can only be configured through the web dashboard (<https://skyra.pw>)`,
		commandConfUser: ({ key, list }) => `**User Setting ${key}**\n${list}`,
		commandConfSettingNotSet: 'No Establecido',
		messagePromptTimeout: 'La solicitud no recibió ninguna respuesta a tiempo.',
		textPromptAbortOptions: ['abortar', 'parar', 'cancelar'],
		commandLoad: ({ time, type, name }) => `${GREENTICK} Successfully loaded ${type}: ${name}. (Took: ${time})`,
		commandLoadFail: 'The file does not exist, or an error occurred while loading your file. Please check your console.',
		commandLoadError: ({ type, name, error }) => `${REDCROSS} Failed to load ${type}: ${name}. Reason:${codeBlock('js', error)}`,
		commandLoadDescription: 'Load a piece from your bot.',

		/**
		 * ################################
		 * #     COMMAND DESCRIPTIONS     #
		 * ################################
		 */

		argumentRangeInvalid: ({ name }) => `${name} debe ser un número o un rango de números.`,
		argumentRangeMax: ({ name, maximum }) => `El argumento ${name} acepta un rango de máximo ${maximum} 'número`,
		argumentRangeMaxPlural: ({ name, maximum }) => `El argumento ${name} acepta un rango de máximo ${maximum} 'números`,

		commandAddDescription: 'Añade una canción a la cola.',
		commandAddExtended: {
			extendedHelp: [
				`¡Agregue canciones a la lista de reproducción y prepárese para el concierto!
					Puedo reproducir desde YouTube, Bandcamp, SoundCloud, Twitch, Vimeo o Mixer.`,
				'- Para reproducir desde YouTube, dame algo para buscar, un enlace de video o un enlace de lista de reproducción.',
				'- Para reproducir desde SoundCloud, dame un enlace de SoundCloud, o si quieres que busque, incluya `--sc` o` --soundcloud` en su mensaje.',
				'- Para reproducir desde Mixer, escribe la URL de un streamer de Mixer, lo siento pero no puedo (todavía) reproducir VODs.',
				'- Para reproducir desde Bandcamp, Twitch o Vimeo, solo necesita escribir un enlace a un video o lista de reproducción.',
				'- Para reproducir una cola previamente exportada, incluya `--import` y adjunte el archivo de la lista a su mensaje o deme de URL a la.'
			],
			explainedUsage: [['song', 'La canción para incluirlo en la cola. Puede ser un enlace o el nombre de un vídeo o tema musical.']],
			examples: [
				'The Pokémon Theme song',
				'https://youtu.be/fJ9rUzIMcZQ',
				'--sc Imagine Dragons Believer',
				'https://soundcloud.com/vladkurt/imagine-dragons-beliver-vladkurt-remix',
				'https://vimeo.com/channels/music/239029778',
				'https://mixer.com/Ninja',
				'https://thedisappointed.bandcamp.com/album/escapism-2',
				'--import https://cdn.skyra.pw/favsongs.squeue'
			],
			multiline: true
		},
		commandAddPlaylist: ({ songs }) => `🎵 Añadida ${songs} a la cola 🎶`,
		commandAddPlaylistSongs: () => `**una** canción`,
		commandAddPlaylistSongsPlural: ({ count }) => `**${count}** canciones`,
		commandAddSong: ({ title }) => `🎵 Añadida la canción **${title}** a la cola 🎶`,
		commandClearDescription: 'Borra las canciones de la cola.',
		commandClearDenied: '¡No puedes ejecutar este comando mientras que hayan más de 4 usuarios! ¡Debes ser el Dj de esta fiesta!',
		commandClearSuccess: () => '🗑 Una canción fue borrada de la cola.',
		commandClearSuccessPlural: ({ count }) => `🗑 ${count} canciones fueron borradas de la cola.`,
		commandExportQueueDescription: 'Exports your queue to a `.squeue` file.',
		commandExportQueueExtended: {
			extendedHelp: [
				"Have a queue you liked and want to replay later? Or maybe you want to send your friends what you're listening right now",
				"Use `exportqueue` and I'll pack the music in your queue into a neat file you can either save or share with your friends!",
				'When you want to play it back, just use it with `play`, `add` or `importqueue`!'
			],
			reminder: 'If your queue is longer than 100 words, I will only include the first 100, to prevent abuse of my systems',
			multiline: true
		},
		commandExportQueueSuccess: ({ guildName }) => `${GREENTICK} Here's the current queue for ${guildName}!`,
		commandImportQueueDescription: 'Imports a queue saved as an `.squeue` file.',
		commandImportQueueExtended: {
			extendedHelp: [
				'Did a friend send you a queue? Or you maybe want to play back a queue you have saved?',
				'With `importqueue`, I can load the queue for you, and then you can jam to your favourite tracks!'
			],
			reminder: 'You can either give me a link to the `.squeue` file, or attach it along your commands!',
			multiline: true
		},

		commandJoinDescription: 'Unirse al canal de voz del autor del mensaje.',
		commandJoinNoMember:
			'Lo siento, pero Discord no me ha mandado la información necesaria que necesito para saber en qué canal de voz estás conectado/a...',
		commandJoinNoVoicechannel: 'No estás conectado/a a un canal de voz.',
		commandJoinSuccess: ({ channel }) => `Me he conectado con éxito al canal de voz ${channel}`,
		commandJoinVoiceDifferent: 'Lo siento, pero estoy reproduciendo música en otro canal de voz. ¡Intenta de nuevo más tarde o únete a ellos!',
		commandJoinVoiceFull: 'No puedo unirme a tu canal de voz, está lleno... ¡echa a alguien con las botas o haz espacio para mí!',
		commandJoinVoiceNoConnect:
			'No tengo suficientes permisos para unirme a tu canal de voz, necesito el permiso para conectarme a canales de voz.',
		commandJoinVoiceNoSpeak: 'Puedo conectarme... pero no hablar. Por favor dame permisos para hablar.',
		commandJoinVoiceSame: '¡Sube el volumen! ¡Ya estoy reproduciendo música ahí!',
		commandJoinFailed: `${REDCROSS} I could not join your voice channel because there is something wrong with my music player. Please join the support server by using \`@Skyra support\` and alert my developers.`,
		commandLeaveDescription: 'Desconecta del canal de voz.',
		commandLeaveExtended: {
			extendedHelp: [
				'Use este comando para que Skyra deje el canal de voz actual.',
				'Por defecto, dejaré el canal, me olvidaré de la canción que se está reproduciendo actualmente, ero dejaré la cola intacta.',
				'Esto significa que una vez que hagas Skyra, `play`',
				'después del comando de salida, continuaré tocando con la primera canción que estaba en la cola antes de irme.',
				'',
				'Este comportamiento predeterminado se puede modificar con banderas:',
				'`--removeall` o `--ra` para seguir el comportamiento predeterminado, así como borrar la cola, la próxima vez que quieras que comience a jugar tendrás que crear una nueva cola'
			],
			examples: ['leave', 'leave --removeall', 'leave --ra', 'leave --soft'],
			multiline: true
		},
		commandLeaveSuccess: ({ channel }) => `Me he desconectado con éxito del canal de voz ${channel}`,
		commandPauseDescription: 'Pausa la canción actual.',
		commandPauseSuccess: '⏸ Pausado.',
		commandPlayDescription: '¡Empecemos la cola!',
		commandPlayExtended: {
			extendedHelp: [
				`Ponga música en cola y permítame comenzar a improvisar para su disfrute.
				Cuando use este comando, me uniré automáticamente a su canal de voz y comenzaré a reproducir la primera canción en la cola.
					Puedo reproducir desde YouTube, Bandcamp, SoundCloud, Twitch, Vimeo o Mixer.`,
				'- Para reproducir desde YouTube, dame algo para buscar, un enlace de video o un enlace de lista de reproducción.',
				'- Para reproducir desde SoundCloud, dame un enlace de SoundCloud, o si quieres que busque, incluya `--sc` o` --soundcloud` en su mensaje.',
				'- Para reproducir desde Mixer, escribe la URL de un streamer de Mixer, lo siento pero no puedo (todavía) reproducir VODs.',
				'- Para reproducir desde Bandcamp, Twitch o Vimeo, solo necesita escribir un enlace a un video o lista de reproducción.',
				'- Para reproducir una cola previamente exportada, incluya `--import` y adjunte el archivo de la lista a su mensaje o deme de URL a la.'
			],
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
		commandPlayEnd: '⏹ Del 1 al 10, siendo 1 la peor puntuación y 10 la mejor, ¿cómo valorarías la sesión? ¡Ya ha terminado!',
		commandPlayNext: ({ title, requester }) => `🎧 Reproduciendo: **${title}**, pedida por: **${requester}**`,
		commandPlayQueuePaused: ({ song }) => `¡Había una canción pausada! ¡Reproduciéndolo ahora! Ahora reproduciendo: ${song}!`,
		commandPlayQueuePlaying: '¡Ey! ¡El disco ya está girando!',
		commandPlayQueueEmpty:
			'The session is over, add some songs to the queue, you can for example do `Skyra, add Imperial March`, and... *dumbrolls*!',
		commandPlayingDescription: 'Obtén información de la canción actual.',
		commandPlayingDuration: ({ duration }) => `**Duración**: ${duration}`,
		commandPlayingQueueEmpty: '¿Es conmigo? Porque no hay nada en reproducción...',
		commandPlayingQueueNotPlaying: 'Creo que estás escuchando ruido de fondo, no estoy reproduciendo nada.',
		commandRepeatDescription: 'Se alterna repitiendo la canción actual.',
		commandRepeatSuccessEnabled: "This is your JAM isn't it? No te preocupes, repetiremos esto una y otra vez!",
		commandRepeatSuccessDisabled: 'En realidad, también me estaba cansando de esto, pero no quería decir nada.',
		commandQueueDescription: 'Check the queue list.',
		commandQueueLast: 'There are no more songs! After the one playing is over, the session will end!',
		commandQueueTitle: ({ guildname }) => `Music queue for ${guildname}`,
		commandQueueLine: ({ position, duration, title, url, requester }) =>
			`**[\`${position}\`]** │ \`${duration}\` │ [${title}](${url}) │ Requester: **${requester}**.`,
		commandQueueNowplaying: ({ title, url, requester }) => `[${title}](${url})\nRequester: **${requester}**`,
		commandQueueNowplayingLiveStream: 'Live Stream',
		commandQueueNowplayingTimeRemaining: ({ timeRemaining }) => `🕰 Tiempo restante: ${timeRemaining}.`,
		commandQueueNowplayingTitle: 'Now Playing:',
		commandQueueTotalTitle: 'Total songs:',
		commandQueueTotal: ({ songs, remainingTime }) => `${songs} in the queue, with a total duration of ${remainingTime}`,
		commandQueueEmpty: 'parece que nada se está reproduciendo en este momento y la cola está vacía, ¿por qué no inicias el disco?',
		commandQueueDashboardInfo: ({ guild }) =>
			`¿Sabías que también puedes administrar tu música usando una aplicación web elegante? [Haga clic aquí para ir allí](https://skyra.pw/music/${guild.id})`,
		commandRemoveDescription: 'Elimina una canción de la lista de cola.',
		commandRemoveIndexInvalid: 'mira, no soy una experta en mates, pero esperaba un número igual o mayor que 1...',
		commandRemoveIndexOutOfBounds: ({ songs }) => `he intentado acceder a esa canción por tí, ¡pero sólo tengo ${songs} en mi mesa!`,
		commandRemoveDenied: [
			'Lo veo un poco rudo el borrar la canción de alguien de la lista... Habla con ellos para quitarla o',
			'grita al DJ si hay uno en este servidor, si la canción arruina la fiesta, ¡entonces ellos probablemente lo consideren!'
		].join(' '),
		commandRemoveSuccess: ({ title, requester }) => `🗑 Borrada la canción **${title}**, pedida por <@${requester}>, de la cola.`,
		commandSeekDescription: 'Change the player time for the current song.',
		commandSeekSuccess: ({ time }) => `${GREENTICK} Successfully changed the time! Now at ${this.duration(time)}!`,
		commandResumeDescription: 'Reanuda la canción actual.',
		commandResumeSuccess: '▶ Reanudado.',
		commandRolesetDescription: 'Gestionar conjuntos de roles únicos.',
		commandRolesetExtended: {
			extendedHelp: [
				'A role set is a group of roles Skyra identifies as unique for all members in the server, i.e. a roleset named "region" could have the roles `Africa`, `America`, `Asia`, and `Europe`, and members will only be able to have one of them. This is like a kind of "rule" that is applied in the three following situations:',
				'',
				'- When somebody claims a role via the `Skyra, roles`.',
				'- When somebody claims a role via reaction roles.',
				'- When somebody receives a role either manually or from another bot.'
			],
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
		commandRolesetCreated: ({ name, roles }) => `El conjunto de roles único ${name} se ha creado con los siguientes roles: ${roles}`,
		commandRolesetAdded: ({ name, roles }) => `El conjunto de roles único ${name} ahora también tiene los siguientes roles: ${roles}.`,
		commandRolesetInvalidName: ({ name }) => `No puede eliminar el conjunto de roles único ${name} porque no existe.`,
		commandRolesetRemoved: ({ name, roles }) => `El conjunto de roles único ${name} ya no incluirá los siguientes roles:${roles}`,
		commandRolesetResetEmpty: `${REDCROSS} There are no rolesets configured in this groupo.`,
		commandRolesetResetAll: `${GREENTICK} Successfully removed all rolesets.`,
		commandRolesetResetNotExists: ({ name }) => `${REDCROSS} The roleset \`${name}\` does not exist in this server.`,
		commandRolesetResetGroup: ({ name }) => `${GREENTICK} Successfully removed the roleset \`${name}\` from this server.`,
		commandRolesetUpdated: ({ name }) => `El conjunto de roles único ${name} se ha actualizado.`,
		commandRolesetNoRolesets: 'No tienes conjuntos de roles.',
		commandShuffleDescription: 'Aleatoriza el orden de las canciones en la cola.',
		commandShuffleSuccess: ({ amount }) => `${GREENTICK} Canciones aleatorias exitosas de ${amount}.`,
		commandSkipDescription: 'Salta la canción actual.',
		commandSkipPermissions: 'No puedes ejecutar este comando, debes ser un DJ o un Moderador.',
		commandSkipVotesVoted: 'Ya has votado para saltar esta canción.',
		commandSkipVotesTotal: ({ amount, needed }) => `🔸 | Votos: ${amount} de ${needed}`,
		commandSkipSuccess: ({ title }) => `⏭ Saltada la canción ${title}.`,
		commandPlayingTimeDescription: 'Revisa cuánto tiempo falta para terminar la canción.',
		commandPlayingTimeQueueEmpty: '¿Es conmigo? La cola está vacía...',
		commandPromoteDescription: 'Promociona una canción al frente de la fila',
		commandPromoteExtended: {
			explainedUsage: [['number', 'El índice en la cola para ascender al frente. Usa `Skyra, queue` para encontrar el índice de una canción']],
			examples: ['5'],
			reminder: 'Este comando requiere que seas DJ o moderador para usarlo'
		},
		commandPromoteSuccess: ({ title, url }) => `${GREENTICK} **${title}** (<${url}>) promovido con éxito a la parte superior de la cola`,
		commandVolumeDescription: 'Controla el volumen para la canción.',
		commandVolumeSuccess: ({ volume }) => `📢 Volumen: ${volume}%`,
		commandVolumeChanged: ({ emoji, volume }) => `${emoji} Volumen ajustado a: ${volume}%`,
		commandVolumeChangedExtreme: ({ emoji, text, volume }) => `${emoji} ${text} ajustado a: ${volume}%`,
		commandVolumeChangedTexts: ['**VOLUMEN EXTREMO**', '**VOLUMEN TIPO NACELLE DE AVIÓN**', '**VOLUMEN TIPO LANZAMIENTO DE FALCON HEAVY**'],

		inhibitorMusicQueueEmpty: `${REDCROSS} ¡La cola está sin discos! ¡Añade algunas canciones así podemos empezar una fiesta!`,
		inhibitorMusicNotPlaying: `${REDCROSS} Hmm, no parece que esté jugando nada ahora.`,
		inhibitorMusicPaused: `${REDCROSS} ¡El disco ya está girando y la fiesta está en marcha hasta que termine la noche!`,
		inhibitorMusicDjMember: `${REDCROSS} ¡Creo que esto es algo que sólo un moderador o un administrador de la fiesta pueden hacer!`,
		inhibitorMusicUserVoiceChannel: `${REDCROSS} ¡Ey! Necesito que te unas a un canal de voz antes para usar este comando!`,
		inhibitorMusicBotVoiceChannel: `${REDCROSS} Temo que necesito estar en un canal de voz antes de poder usar este comando, ¡por favor muéstreme el camino!`,
		inhibitorMusicBothVoiceChannel: `${REDCROSS} ¡Hey! Parece que no estamos en el mismo canal de voz, ¡por favor únete conmigo!`,
		inhibitorMusicNothingPlaying: `${REDCROSS} Parece que no hay nada en este momento, ¿qué tal si comienzas la fiesta 🎉?`,

		musicManagerFetchNoArguments: '¡Necesito que me des el nombre de una canción!',
		musicManagerFetchNoMatches: 'Lo siento, ¡pero no he sido capaz de encontrar la canción que querías',
		musicManagerFetchLoadFailed: 'Lo siento, ¡pero no he podido cargar esta canción! Por si acaso, ¡intenta con otra canción!',
		musicManagerImportQueueError: `${REDCROSS} Sorry, but I'm having issues trying to import that playlist. Are you sure it's from my own DJ deck?`,
		musicManagerImportQueueNotFound: `${REDCROSS} I need a queue to import!`,
		musicManagerTooManySongs: `${REDCROSS} ¡Ah, estás agregando más canciones de las permitidas!`,
		musicManagerSetvolumeSilent: 'Woah, ¡podrías simplemente salir del canal de voz si quieres silencio!',
		musicManagerSetvolumeLoud: 'Seré honesta, ¡las turbinas de un avión serían menos ruidosos que esto!',
		musicManagerPlayNoSongs: '¡No hay más canciones en la cola!',
		musicManagerPlayPlaying: 'Los discos están girando, ¿no los escuchas?',
		musicManagerStuck: ({ milliseconds }) =>
			`${LOADING} Espera un momento, he tenido un pequeño problema. ¡Estaré de vuelta en: ${this.duration(milliseconds)}!`,

		commandConfMenuNopermissions: `I need the permissions ${this.PERMISSIONS.ADD_REACTIONS} and ${this.PERMISSIONS.MANAGE_MESSAGES} to be able to run the menu.`,
		commandConfMenuRenderAtFolder: ({ path }) => `Currently at: 📁 ${path}`,
		commandConfMenuRenderAtPiece: ({ path }) => `Currently at: ⚙️ ${path}`,
		commandConfMenuRenderNokeys: 'There are no configurable keys for this folder',
		commandConfMenuRenderSelect: 'Please select any of the following entries',
		commandConfMenuRenderTctitle: 'Text Commands:',
		commandConfMenuRenderUpdate: '• Update Value → `set <value>`',
		commandConfMenuRenderRemove: '• Remove Value → `remove <value>`',
		commandConfMenuRenderReset: '• Reset Value → `reset`',
		commandConfMenuRenderUndo: '• Undo Update → `undo`',
		commandConfMenuRenderCvalue: ({ value }) => `Current Value: **\`\`${value}\`\`**`,
		commandConfMenuRenderBack: 'Press ◀ to go back',
		commandConfMenuInvalidKey: 'Invalid Key, please try again with any of the following options.',
		commandConfMenuInvalidAction: 'Invalid Action, please try again with any of the following options.',
		commandConfMenuSaved: 'Successfully saved all changes.',

		settingsPrefix:
			'A prefix is an affix that is added in front of the word, in this case, the message. It allows bots to distinguish between a regular message and a command.',
		settingsLanguage: 'The language I will use for your server. It may not be available in the language you want.',
		settingsDisablenaturalprefix: 'Whether or not I should listen for my natural prefix, `Skyra,`',
		settingsDisabledcommands:
			'The disabled commands, core commands may not be disabled, and moderators will override this. All commands must be in lower case.',
		settingsChannelsAnnouncements:
			'The channel for announcements, in pair with the key `roles.subscriber`, they are required for the announce command.',
		settingsChannelsFarewell:
			'The channel I will use to send farewells, you must enable the events and set up the messages, in other categories.',
		settingsChannelsGreeting:
			'The channel I will use to send greetings, you must enable the events and set up the messages, in other categories.',
		settingsChannelsImageLogs: 'The channel I will use to re-upload all images I see.',
		settingsChannelsMemberLogs:
			'The channel for member logs, you must enable the events (`events.memberAdd` for new members, `events.memberRemove` for members who left).',
		settingsChannelsMessageLogs:
			'The channel for (non-NSFW) message logs, you must enable the events (`events.messageDelete` for deleted messages, `events.messageEdit` for edited messages).',
		settingsChannelsModerationLogs:
			'The channel for moderation logs, once enabled, I will post all my moderation cases there. If `events.banRemove` and/or `events.banRemove` are enabled, I will automatically post anonymous logs.',
		settingsChannelsNsfwMessageLogs:
			'The channel for NSFW message logs, same requirement as normal message logs, but will only send NSFW messages.',
		settingsChannelsPruneLogs: 'The channel for prune logs, same requirement as normal mesasge logs, but will only send prune messages.',
		settingsChannelsReactionLogs:
			"The channel for the reaction logs, same requirement as normal message logs, but will only send message reactions. If you don't want twemojis to be logged you can toggle `events.twemoji-reactions`.",
		settingsChannelsRoles: 'The channel for the reaction roles.',
		settingsChannelsSpam: 'The channel for me to redirect users to when they use commands I consider spammy.',
		settingsChannelsIgnoreMessageDelete: 'Channels I should ignore when checking for deleted messages to log.',
		settingsChannelsIgnoreMessageEdit: 'Channels I should ignore when checking for edited messags to log.',
		settingsChannelsIgnoreReactionAdd: 'Channels I should ignore when checking for added reactions.',
		settingsChannelsIgnoreAll: 'Channels I should ignore for all types of logging.',
		settingsDisabledchannels:
			'A list of channels for disabled commands, for example, setting up a channel called general will forbid all users from using my commands there. Moderators+ override this purposedly to allow them to moderate without switching channels.',
		settingsEventsBanadd: 'This event posts anonymous moderation logs when a user gets banned. You must set up `channels.moderation-logs`.',
		settingsEventsBanremove: 'This event posts anonymous moderation logs when a user gets unbanned. You must set up `channels.moderation-logs`.',
		settingsEventsMemberadd: 'This event posts member logs when a user joins. They will be posted in `channels.member-logs`.',
		settingsEventsMemberNickNameUpdate: 'Whether member nickname updates should be logged or not.',
		settingsEventsMemberUserNameUpdate: 'Whether member username updates should be logged or not.',
		settingsEventsMemberroleupdate: 'Whether memner role changes should be logged or not.',
		settingsEventsMemberremove: 'This event posts member logs when a user leaves. They will be posted in `channels.member-logs`.',
		settingsEventsMessagedelete:
			'This event posts message logs when a message is deleted. They will be posted in `channels.message-logs` (or `channel.nsfw-message-logs` in case of NSFW channels).',
		settingsEventsMessageedit:
			'This event posts message logs when a message is edited. They will be posted in `channels.message-logs` (or `channel.nsfw-message-logs` in case of NSFW channels).',
		settingsEventsTwemojiReactions: 'Whether or not twemoji reactions are posted in the reaction logs channel.',
		settingsMessagesFarewell: 'The message I shall send to when a user leaves. You must set up `channels.farewell` and `events.memberRemove`',
		settingsMessagesGreeting: 'The message I shall send to when a user joins. You must set up `channels.greeting` and `events.memberAdd`',
		settingsMessagesIgnorechannels: 'The channels configured to not increase the point counter for users.',
		settingsMessagesJoinDm: 'The message I shall send to when a user joins in DMs.',
		settingsMessagesModerationAutoDelete: 'Whether or not moderation commands should be auto-deleted or not.',
		settingsMessagesModerationDm: 'Whether or not I should send a direct message to the target user on moderation actions.',
		settingsMessagesModerationMessageDisplay: 'Whether or not a response should be sent for moderation commands.',
		settingsMessagesModerationReasonDisplay: 'Whether the reason will be displayed in moderation commands.',
		settingsMessagesModeratorNameDisplay:
			'Whether or not I should display the name of the moderator who took the action whne sending the target user a moderation message. Requires `messages.moderation-dm` to be enabled.',
		settingsMessagesWarnings: 'Whether or not I should send warnings to the user when they receive one.',
		settingsMessagesAnnouncementEmbed: 'Whether to send announcements in embeds or not',
		settingsMusicAllowStreams: 'Whether livestreams should be allowed to be played.',
		settingsMusicDefaultVolume: 'The default music volume to start playing at for this server.',
		settingsMusicMaximumDuration: 'The maximum length any playable single track can have.',
		settingsMusicMaximumEntriesPerUser: 'The maximum amount of entries one user can have in the queue.',
		settingsNoMentionSpamAlerts: 'Whether or not users should be alerted when they are about to get the ban hammer.',
		settingsNoMentionSpamEnabled: 'Whether or not I should have the ban hammer ready for mention spammers.',
		settingsNoMentionSpamMentionsallowed:
			'The minimum amount of "points" a user must accumulate before landing the hammer. A user mention will count as 1 point, a role mention as 2 points, and an everyone/here mention as 5 points.',
		settingsNoMentionSpamTimeperiod:
			'The amount of time in seconds in which the mention bucket should refresh. For example, if this is set to `8` and you mentioned two users 7 seconds apart, the bucket would run from start with the accumulated amount of points.',
		settingsRolesAdmin: `The administrator roles. Administrators have access to all moderation and management commands. Defaults to anyone with the ${this.PERMISSIONS.MANAGE_GUILD} permission.`,
		settingsRolesDj: "The DJ roles for this server. DJs have more advanced control over Skyra's music commands.",
		settingsRolesInitial: 'The initial role, if configured, I will give it to users as soon as they join.',
		settingsRolesModerator:
			'The moderator roles. Moderators have access to almost all moderation commands. Defaults to anyone who can ban members.',
		settingsRolesMuted: 'The muted role, if configured, I will give new muted users this role. Otherwise I will prompt you the creation of one.',
		settingsRolesPublic: 'The public roles. These can be claimed by any user using the `roles` command.',
		settingsRolesRemoveinitial: 'Whether claiming a public role should remove the initial role at the same time.',
		settingsRolesRestrictedAttachment: 'The role that is used for the restrictAttachment moderation command',
		settingsRolesRestrictedEmbed: 'The role that is used for the restrictEmbed moderation command.',
		settingsRolesRestrictedEmoji: 'The role that is used for the restrictEmoji moderation command.',
		settingsRolesRestrictedReaction: 'The role that is used for the restrictReaction moderation command.',
		settingsRolesRestrictedVoice: 'The role that is used for the restrictVoice moderation command.',
		settingsRolesSubscriber:
			'The subscriber role, this role will be mentioned every time you use the `announce` command. I will always keep it non-mentionable so people do not abuse mentions.',
		settingsSelfmodAttachmentsEnabled: 'Whether or not the attachment filter is enabled.',
		settingsSelfmodAttachmentsIgnoredChannels: 'The channels that will be ignored by the attachments filter sub-system',
		settingsSelfmodAttachmentsIgnoredRoles: 'The roles that will be ignored by the attachments afilters sub-system',
		settingsSelfmodCapitalsEnabled: 'Whether the capitals filter selfmod sub-system is enabled or not.',
		settingsSelfmodCapitalsIgnoredchannels: 'The channels that will be ignored by the capitals filter sub-system',
		settingsSelfmodCapitalsIgnoredroles: 'The roles that will be ignored by the capitals afilters sub-system',
		settingsSelfmodCapitalsMaximum:
			'The maximum amount of characters the messages must have before trying to delete it. You must enable it with the `capitalsMode` command.',
		settingsSelfmodCapitalsMinimum:
			'The minimum amount of characters the message must have before trying to delete it. You must enable it with the `capitalsMode` command.',
		settingsSelfmodFilterEnabled: 'Whether the word filter selfmod sub-system is enabled or not.',
		settingsSelfmodFilterIgnoredchannels: 'The channels that will be ignored by the filters sub-system',
		settingsSelfmodFilterIgnoredroles: 'The roles that will be ignored by the filters sub-system',
		settingsSelfmodIgnorechannels:
			'The channels I will ignore, be careful any channel configured will have all auto-moderation systems (CapsFilter, InviteLinks, and NoMentionSpam) deactivated.',
		settingsSelfmodInvitesEnabled: 'Whether the invites filter selfmod sub-system is enabled or not.',
		settingsSelfmodInvitesIgnoredchannels: 'The channels that will be ignored by the invites sub-system',
		settingsSelfmodInvitesIgnoredroles: 'The roles that will be ignored by the invites sub-system',
		settingsSelfmodInvitesIgnoredcodes: 'The Discord invite codes that will be ignored by the invites sub-system',
		settingsSelfmodInvitesIgnoredguilds: 'The Discord servers that will be ignored by the invites sub-system',
		settingsSelfmodLinksEnabled: 'Whether the links filter selfmod sub-system is enabled or not.',
		settingsSelfmodLinksIgnoredchannels: 'The channels that will be ignored by the links filter sub-system',
		settingsSelfmodLinksIgnoredroles: 'The roles that will be ignored by the links filters sub-system',
		settingsSelfmodLinksWhitelist: 'The whitelisted links that are allowed',
		settingsSelfmodMessagesEnabled: 'Whether Skyra should attempt to remove duplicated messages or not.',
		settingsSelfmodMessagesIgnoredchannels: 'The channels that will be ignored by the duplicate messages sub-system',
		settingsSelfmodMessagesIgnoredroles: 'The roles that will be ignored by the duplicate messages sub-system',
		settingsSelfmodMessagesMaximum:
			'The amount of duplicated messages required in the queue before taking action The queue size is configurable in `selfmod.messages.queue-size`.',
		settingsSelfmodMessagesQueueSize: 'The amount of messages Skyra will keep track of for the message duplication detection.',
		settingsSelfmodNewlinesEnabled: 'Whether the new lines filter selfmod sub-system is enabled or not.',
		settingsSelfmodNewlinesIgnoredchannels: 'The channels that will be ignored by the new lines sub-system',
		settingsSelfmodNewlinesIgnoredroles: 'The roles that will be ignored by the new lines sub-system',
		settingsSelfmodNewlinesMaximum: 'The maximum amount of new lines before Skyra will start applying penalties',
		settingsSelfmodReactionsMaximum: 'The maximum amount of reactions before I will start applying penalties',
		settingsSelfmodReactionsBlacklist: 'The reactions that are blacklisted',
		settingsSelfmodReactionsEnabled: 'Whether the reactions filter selfmod sub-system is enabled or not.',
		settingsSelfmodReactionsIgnoredchannels: 'The channels that will be ignored by the reactions sub-system',
		settingsSelfmodReactionsIgnoredroles: 'The roles that will be ignored by the reactons sub-system',
		settingsSelfmodReactionsWhitelist: 'The reactions that are whitelisted',
		settingsSocialEnabled: 'Whether the social module should be enabled or not',
		settingsSocialMultiplier: 'The multiplier to apply to the gain of points for users',
		settingsSocialAchieve: 'Whether or not I should congratulate people who get a new leveled role.',
		settingsSocialAchievemessage:
			'The congratulation message for people when they get a new leveled role. Requires `social.achieve` to be enabled.',
		settingsSocialIgnorechannels: 'The channels I should ignore when adding points.',
		settingsStarboardChannel:
			'The starboard channel. If you star a message, it will be posted there. Using the `setStarboardEmoji` command allows the emoji customization.',
		settingsStarboardIgnorechannels: 'The channels I should ignore when listening for new stars.',
		settingsStarboardMinimum: 'The minimum amount of stars required before a message is posted to the starboard channel.',
		settingsStarboardSelfstar: 'Si la reacción del autor está incluida en el recuento total de estrellas',
		settingsSuggestionsChannel: 'El canal donde se enviarán las sugerencias.',
		settingsSuggestionsEmojisUpvote: 'El emoji utilizado para votar a favor en las reacciones de las sugerencias.',
		settingsSuggestionsEmojisDownvote: 'El emoji utilizado para votar en contra en las reacciones de las sugerencias.',
		settingsSuggestionsOnActionDm:
			'Si esta opción está habilitada, enviaré un mensaje directo al autor de la sugerencia cada vez que ésta se modifique.',
		settingsSuggestionsOnActionRepost:
			'Si esta opción está habilitada, volveré a publicar el mensaje de la sugerencia cada vez que se ésta se modifique. En caso opuesto editaré el mensaje original.',
		settingsSuggestionsOnActionHideAuthor:
			'Esta configuración le permite actualizar recomendaciónes anónimamente. Sustituirá el nombre del editor con `Un administrador` o` Un moderador`, de acuerdo con su nivel de permisos.',
		settingsDashboardOnlyKey: 'This key can only be configured through [the web dashboard](https://skyra.pw)',

		/**
		 * ################
		 * ANIMALS COMMANDS
		 */

		commandCatfactDescription: 'Let me tell you a mysterious cat fact.',
		commandCatfactExtended: {
			extendedHelp: `Do **you** know cats are very curious, right? They certainly have a lot of fun and weird facts.
				This command queries catfact.ninja and retrieves a fact so you can read it.`
		},
		commandDogDescription: 'Cute doggos! ❤',
		commandDogExtended: {
			extendedHelp: [
				'Do **you** know how cute dogs are? They are so beautiful!',
				'This command uses [dog.ceo](https://dog.ceo) to show pictures of the cuttest doggos!'
			]
		},
		commandFoxDescription: 'Let me show you an image of a fox!',
		commandFoxExtended: {
			extendedHelp: 'This command gives a random image from [randomfox.ca](https://randomfox.ca/)'
		},
		commandKittyDescription: 'KITTENS!',
		commandKittyExtended: {
			extendedHelp: [
				'Do **you** know how cute are kittens? They are so beautiful!',
				'This command uses [cataas.com](https://cataas.com/) to show pictures of the cuttest cats!'
			]
		},
		commandShibeDescription: 'Cute shibas!',
		commandShibeExtended: {
			extendedHelp: "Everyone loves shibas, I shall love them aswell! They're so adorable ❤."
		},

		/**
		 * ##############
		 * ANIME COMMANDS
		 */

		commandAnimeDescription: 'Search your favourite anime by title with this command.',
		commandAnimeExtended: {
			extendedHelp: 'This command queries Kitsu.io to show data for the anime you request.',
			explainedUsage: [['query', "The anime's name you are looking for."]],
			examples: ['One Piece']
		},
		commandMangaDescription: 'Search your favourite manga by title with this command.',
		commandMangaExtended: {
			extendedHelp: 'This command queries Kitsu.io to show data for the manga you request.',
			explainedUsage: [['query', "The manga's name you are looking for."]],
			examples: ['Stone Ocean', 'One Piece']
		},
		commandWaifuDescription: 'Posts a randomly generated waifu image.',
		commandWaifuExtended: {
			extendedHelp: 'This commands posts a random waifu generated by <https://www.thiswaifudoesnotexist.net/>'
		},

		/**
		 * #####################
		 * ANNOUNCEMENT COMMANDS
		 */

		commandAnnouncementDescription: 'Send new announcements, mentioning the announcement role.',
		commandAnnouncementExtended: {
			extendedHelp: [
				'This command requires an announcement channel (**channels.announcement** in the configuration command) which tells Skyra where she should post the announcement messages.',
				'',
				'Question is, is this command needed? Well, nothing stops you from making your announcements by yourself, however, there are many people who hate being mentioned by at everyone/here.',
				'',
				'To avoid this, Skyra gives you the option of creating a subscriber role, which is unmentionable (to avoid people spam mentioning the role), and once you run this command, Skyra will set the role to be mentionable, post the message, and back to unmentionable.',
				'',
				'Furthermore, you can configure Skyra to send the announcement as a message embed by setting the **messages.announcement-embed** option in the configuration command. When sending the message as an an embed you can exclude the mentions of any users, @here or @everyone by providing the `--excludeMentions` flag to the announcement.'
			],
			explainedUsage: [['announcement', 'The announcement text to post.']],
			examples: ['I am glad to announce that we have a bot able to safely send announcements for our subscribers!'],
			reminder:
				'If you want to edit the message you send in an announcement, just edit the message you used to have Skyra send that announcement. Skyra will then edit the message she sent previously. She can do this up to 15 minutes after the initial announcement, so be sure to not wait long!',
			multiline: true
		},
		commandSubscribeDescription: "Subscribe to this server's announcements.",
		commandSubscribeExtended: {
			extendedHelp:
				"This command serves the purpose of **giving** you the subscriber role, which must be configured by the server's administrators. When a moderator or administrator use the **announcement** command, you will be mentioned. This feature is meant to replace everyone/here tags and mention only the interested users."
		},
		commandUnsubscribeDescription: "Unsubscribe from this server's announcements.",
		commandUnsubscribeExtended: {
			extendedHelp:
				"This command serves the purpose of **removing** you the subscriber role, which must be configured by the server's administrators. When a moderator or administrator use the **announcement** command, you will **not longer** be mentioned. This feature is meant to replace everyone/here tags and mention only the interested users."
		},

		/**
		 * ############
		 * FUN COMMANDS
		 */

		command8ballDescription: 'Skyra will read the Holy Bible to find the correct answer for your question.',
		command8ballExtended: {
			extendedHelp: "This command provides you a random question based on your questions' type. Be careful, it may be too smart.",
			explainedUsage: [['question', 'The Holy Question']],
			examples: ['Why did the chicken cross the road?']
		},
		commandChoiceDescription: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
		commandChoiceExtended: {
			extendedHelp:
				'I have an existencial doubt... should I wash the dishes or throw them through the window? The search continues. List me items separated by comma and I will choose one them. On a side note, I am not responsible of what happens next.',
			explainedUsage: [['words', 'A list of words separated by comma.']],
			examples: ['Should Wash the dishes, Throw the dishes out the window', 'Cat, Dog']
		},
		commandChangemymindDescription: 'Skyra is the best, change my mind.',
		commandChangemymindExtended: {
			extendedHelp: "I still think I'm the best, change my mind. I make a photo with your avatar and some text in some paper.",
			explainedUsage: [['text', 'The phrase you want.']],
			examples: ['Skyra is the best bot in this server']
		},
		commandDiceDescription: 'Roll the dice using d20 syntax.',
		commandDiceExtended: {
			extendedHelp:
				"The mechanics of this command are easy. You have a dice, then you roll it __x__ times, but the dice can also be configured to have __y__ sides. By default, this command rolls a dice with 6 sides once. However, you can change the amount of rolls for the dice, and this command will 'roll' (get a random number between 1 and the amount of sides). For example, rolling a dice with 6 sides 3 times will leave a random sequence of three random numbers between 1 and 6, for example: 3, 1, 6; And this command will return 10 as output.",
			examples: ['370d24', '100d6', '6']
		},
		commandEscaperopeDescription: 'Use the escape rope from Pokemon.',
		commandEscaperopeExtended: {
			extendedHelp: '**Skyra** used **Escape Rope**.'
		},
		commandHowToFlirtDescription: 'Captain America, you do not know how to flirt.',
		commandHowToFlirtExtended: {
			extendedHelp:
				"Let me show you how to effectively flirt with somebody using the Tony Stark's style for Captain America, I can guarantee that you'll get him.",
			explainedUsage: [['user', 'The user to flirt with.']],
			examples: ['Skyra']
		},
		commandLoveDescription: 'Lovemeter, online!',
		commandLoveExtended: {
			extendedHelp: "Hey! Wanna check the lovemeter? I know it's a ridiculous machine, but many humans love it! Don't be shy and try it!",
			explainedUsage: [['user', 'The user to rate.']],
			examples: ['Skyra']
		},
		commandMarkovDescription: 'Generate a Markov Chain from the text channel.',
		commandMarkovExtended: {
			extendedHelp:
				'A Markov chain is a stocha... what? Okay, something something a probability theory made by a Russian mathematician, check Wikipedia for more information. **In short**: I will generate a random message given the content of the messages in the channel.'
		},
		commandNorrisDescription: "Enjoy your day reading Chuck Norris' jokes.",
		commandNorrisExtended: {
			extendedHelp:
				"Did you know that Chuck norris does **not** call the wrong number, but you **answer** the wrong phone? Woah, mindblow. He also threw a carton of milk and created the Milky Way. This command queries chucknorris.io and retrieves a fact (do not assume they're false, not in front of him) so you can read it"
		},
		commandRateDescription: 'Let bots have opinions and rate somebody.',
		commandRateExtended: {
			extendedHelp:
				"Just because I am a bot doesn't mean I cannot rate you properly. I can grade you with a random number generator to ease the process. Okay okay, it's not fair, but I mean... I can also give you a 💯.",
			explainedUsage: [['user', 'The user to rate.']],
			examples: ['Skyra', 'me']
		},
		commandXkcdDescription: 'Read comics from XKCD.',
		commandXkcdExtended: {
			extendedHelp:
				"**xkcd** is an archive for nerd comics filled with math, science, sarcasm and languages. If you don't provide any argument, I will get a random comic from xkcd. If you provide a number, I will retrieve the comic with said number. But if you provide a title/text/topic, I will fetch a comic that matches with your input and display it. For example, `Skyra, xkcd Curiosity` will show the comic number 1091.",
			explainedUsage: [['query', 'Either the number of the comic, or a title to search for.']],
			examples: ['1091', 'Curiosity']
		},
		commandPunDescription: 'Shows you a random pun.',
		commandPunExtended: {
			extendedHelp: [
				'A steak pun is a rare medium well done.',
				'Get your daily doses of dad jokes from icanhazdadjoke.com and laugh at witty wisecracks.'
			],
			multiline: true
		},
		commandWakandaDescription: "Helpful descriptions? We don't do that here",
		commandWakandaExtended: {
			extendedHelp:
				"Creates an image macro using the [We Don't Do That Here Meme](https://knowyourmeme.com/memes/we-dont-do-that-here) using the given user."
		},

		/**
		 * ################
		 * GAME INTEGRATION COMMANDS
		 */

		commandBrawlstarsDescription: "Get data on a player or club from Supercell's newest game, Brawl Stars.",
		commandBrawlstarsExtended: {
			extendedHelp: 'Use this command with --save to save your player/club tag.',
			explainedUsage: [
				['category', 'The category of data to get: **club** to get data on a club, or **player** to get data on a player (default).'],
				['query', 'The tag of the player or club, depending on which category you choose.']
			],
			examples: ['player #RJQLQ999']
		},
		commandBrawlstarsPlayerEmbedTitles: {
			trophies: 'Trophies',
			events: 'Events',
			exp: 'Experience',
			gamesModes: 'Game Modes',
			other: 'Other'
		},
		commandBrawlstarsPlayerEmbedFields: {
			total: 'Total',
			personalBest: 'Personal Best',
			events: 'Events',
			roboRumble: 'Best Robo Rumble Rank',
			qualifiedForChamps: 'Qualified for Championship',
			experienceLevel: 'Experience Level',
			victories3v3: '3v3 Victories',
			victoriesSolo: 'Solo Victories',
			victoriesDuo: 'Duo Victories',
			club: 'Club',
			brawlersUnlocked: 'Brawlers Unlocked'
		},
		commandBrawlstarsClubEmbedTitles: {
			totalTrophies: 'Total Trophies',
			averageTrophies: 'Average Trophies',
			requiredTrophies: 'Required Trophies',
			members: 'Members',
			type: 'Type',
			top5Members: 'Top 5 Members',
			president: 'President'
		},
		commandBrawlstarsClubEmbedFields: {
			noPresident: 'No President'
		},
		commandClashofclansDescription: 'Obtenga datos sobre un jugador o clan en el popular juego móvil Choque de clanes',
		commandClashofclansExtended: {
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
		commandClashofclansPlayerEmbedTitles: {
			xpLevel: 'Nivel de XP',
			builderHallLevel: 'Nivel de sala de constructores',
			townhallLevel: 'Nivel del ayuntamiento',
			townhallWeaponLevel: 'Nivel de arma del ayuntamiento',

			trophies: 'Trofeos actuales',
			bestTrophies: 'Mejores trofeos',
			warStars: 'Estrellas de guerra',

			attackWins: 'Gana atacando',
			defenseWins: 'Gana defendiendo',
			amountOfAchievements: 'Cantidad de logros',

			versusTrophies: 'Actual contra trofeos',
			bestVersusTrophies: 'Mejor contra trofeos',
			versusBattleWins: 'Versus batalla gana',

			clanRole: 'Papel del clan',
			clanName: 'Nombre del clan',
			leagueName: 'Nombre de la liga',
			noTownhallWeaponLevel: 'El ayuntamiento no tiene nivel de arma',
			noRole: 'Este jugador no tiene rol de clan.',
			noClan: 'Este jugador no es miembro del clan.',
			noLeague: 'Este usuario no está en ninguna liga'
		},
		commandClashofclansClanEmbedTitles: {
			clanLevel: 'Nivel de clan',
			clanPoints: 'Puntos del clan',
			clanVersusPoints: 'Clan versus puntos',
			amountOfMembers: 'Cantidad de miembros',
			description: 'Descripción',
			locationName: 'Nombre del lugar',
			warFrequency: 'Frecuencia de guerra',
			warWinStreak: 'Racha de victorias de guerra',
			warWins: 'La guerra total gana',
			warTies: 'Lazos de guerra total',
			warLosses: 'Pérdidas de guerra totales',
			warLogPublic: '¿El registro de guerra es público?',
			unknown: 'Desconocido',
			warFrequencyDescr: {
				moreThanOncePerWeek: 'Más de una vez por semana',
				always: 'Siempre',
				lessThanOncePerWeek: 'Menos de una vez por semana',
				oncePerWeek: 'Una vez por semana',
				unknown: 'Desconocido'
			}
		},
		commandBrawlStarsInvalidPlayerTag: ({ playertag }) =>
			`Lo siento, \`${playertag}\` no es una etiqueta de jugador de BrawlStars válida. Las etiquetas de jugador deben comenzar con un \`#\` seguido de la ID.`,
		commandBrawlStarsClansQueryFail: ({ clan }) => `Lo siento, pero no pude obtener datos sobre el clan \`${clan}\`.`,
		commandBrawlStarsPlayersQueryFail: ({ playertag }) =>
			`Lo siento, pero no pude obtener datos sobre el jugador con la etiqueta de jugador \`${playertag}\`.`,
		commandClashofclansInvalidPlayerTag: ({ playertag }) =>
			`Lo siento, \`${playertag}\` no es una etiqueta de jugador de Clash of Clans válida. Las etiquetas de jugador deben comenzar con un \`#\` seguido de la ID.`,
		commandClashOfClansClansQueryFail: ({ clan }) => `Lo siento, pero no pude obtener datos sobre el clan \`${clan}\`.`,
		commandClashofclansPlayersQueryFail: ({ playertag }) =>
			`Lo siento, pero no pude obtener datos sobre el jugador con la etiqueta de jugador \`${playertag}\`.`,
		commandFFXIVDescription: 'Consulta la API de Final Fantasy 14 para obtener datos del juego',
		commandFFXIVExtended: {
			extendedHelp: [
				'Este comando le permite datos de caracteres y elementos para FFXIV.',
				'Para el elemento, se realiza una búsqueda con comodines, por lo que si su término está en el medio del nombre, aún puede coincidir.'
			],
			explainedUsage: [
				['Tipo de búsqueda', '(opcional, el valor predeterminado es `character`)` character` o `item`'],
				['consulta', 'El jugador o cosa a buscar.']
			],
			examples: ['character Laytlan Ardevon', 'Laytlan Ardevon', 'item potion'],
			multiline: true
		},
		commandFFXIVCharacterFields: {
			serverAndDc: 'Servidor - Centro de datos',
			tribe: 'Tribu',
			characterGender: 'Género del personaje',
			nameday: 'Día del nombre',
			guardian: 'Guardián',
			cityState: 'Estado de la Ciudad',
			grandCompany: 'Gran empresa',
			rank: 'Rango',
			none: 'Ninguno',
			male: 'Masculino',
			female: 'Hembra',
			dowDomClasses: '***__Discípulo de clases de guerra y magia__***:',
			tank: 'Tanque',
			healer: 'Curador',
			meleeDps: 'Cuerpo a cuerpo DPS',
			physicalRangedDps: 'DPS a distancia física',
			magicalRangedDps: 'DPS a distancia mágica',
			dohClasses: '***__Trabajos de discípulo de la mano__***:',
			dolClasses: '***__Trabajos de discípulo de la tierra__***:'
		},
		commandFFXIVItemFields: {
			kind: 'Tipo',
			category: 'Categoría',
			levelEquip: 'Nivel equipable',
			none: 'Ninguno'
		},
		commandFFXIVNoCharacterFound: `${REDCROSS} Lo siento, pero no pude encontrar un personaje con ese nombre.`,
		commandFFXIVInvalidServer: `${REDCROSS} Lo siento, pero el nombre del servidor no es válido.`,
		commandFFXIVNoItemFound: `${REDCROSS} Lo siento, pero no pude encontrar un elemento con esa consulta.`,
		commandFortniteDescription: 'Obtiene estadísticas de jugador para un jugador de Fortnite',
		commandFortniteExtended: {
			extendedHelp: 'Este comando recupera estadísticas para cualquier jugador de Fortnite que juegue en PC, Xbox o Playstation',
			explainedUsage: [
				['plataforma', '(opcional, predeterminado a `pc`) Plataforma en la que se reproduce el reproductor, una de` pc`, `xbox` o` psn`.'],
				['jugador', 'El nombre de usuario de Epic Games del jugador.']
			],
			examples: ['ninja', 'pc ninja', 'xbox TTV R1xbox', 'psn TTV IllusionOG']
		},
		commandFortniteNoUser:
			'Lo siento, pero no pude encontrar un usuario con ese nombre.\n¿Estás seguro de que juegan en la plataforma proporcionada? (PC [predeterminado], Xbox o PSN son compatibles)',
		commandFortniteEmbedTitle: ({ epicUserHandle }) => `Estadísticas de jugadores de Fortnite para ${epicUserHandle}`,
		commandFortniteEmbedSectionTitles: {
			lifetimeStats: '**_Estadísticas de por vida_**',
			solos: '**_Solos_**',
			duos: '**_Duos_**',
			squads: '**_Escuadrones_**'
		},
		commandFortniteEmbedStats: ({
			winCount,
			killCount,
			kdrCount,
			matchesPlayedCount,
			top1Count,
			top3Count,
			top5Count,
			top6Count,
			top10Count,
			top12Count,
			top25Count
		}) => ({
			wins: `Victorias: **\`${winCount}\`**`,
			kills: `Matas: **\`${killCount}\`**`,
			kdr: `Mata / Relación de la muerte: **\`${kdrCount}%\`**`,
			matchesPlayed: `Partidos jugados: **\`${matchesPlayedCount}\`**`,
			top1s: `Top 1s: **\`${top1Count}\`**`,
			top3s: `Top 3s: **\`${top3Count}\`**`,
			top5s: `Top 5s: **\`${top5Count}\`**`,
			top6s: `Top 6s: **\`${top6Count}\`**`,
			top10s: `Top 10s: **\`${top10Count}\`**`,
			top12s: `Top 12s: **\`${top12Count}\`**`,
			top25s: `Top 25s: **\`${top25Count}\`**`
		}),
		commandOverwatchDescription: 'Obtiene estadísticas de jugador para un jugador de Overwatch',
		commandOverwatchExtended: {
			extendedHelp: [
				'Este comando recupera estadísticas para cualquier jugador de Overwatch que juegue en PC, Xbox o Playstation.',
				'De manera predeterminada, buscará en los reproductores de PC, si desea comprobar si hay reproductores de',
				'Xbox o Playstation, configure la plataforma en `xbl` o `psn` respectivamente.'
			],
			explainedUsage: [
				['platform', '(opcional, predeterminado en `pc`) Plataforma en la que se reproduce el reproductor, una de `pc`, `xbl` o `psn`'],
				[
					'player',
					'Para PC, la etiqueta de tormenta de nieve completa, para la consola, el nombre de usuario. ¡Distingue mayúsculas y minúsculas!'
				]
			],
			examples: ['bame#1784', 'xbl Dorus NL gamer', 'psn decoda_24'],
			reminder: '**¡Los nombres de los jugadores distinguen entre mayúsculas y minúsculas!**',
			multiline: true
		},
		commandOverwatchInvalidPlayerName: ({ playerTag }) =>
			`\`${playerTag}\` es un nombre de jugador no válido\nPara PC tiene que ser su Blizzard BattleTag completo, por ejemplo \`bame#1784\`.\nPara Xbox y Playstation tiene que ser su nombre de usuario.`,
		commandOverwatchQueryFail: ({ player, platform }) =>
			`No se pudieron obtener datos para \`${player}\`, ¿estás seguro de que juegan en la \`${platform}\`?\nTambién asegúrese de tener la carcasa correcta, los nombres distinguen mayúsculas de minúsculas.`,
		commandOverwatchNoStats: ({ player }) =>
			`Encontré un jugador con la etiqueta \`${player}\` pero no había estadísticas disponibles para ellos.`,
		commandOverwatchNoAverage: 'No hay suficientes datos para determinar el promedio.',
		commandOverwatchEmbedDataStats: ({
			finalBlows,
			deaths,
			damageDone,
			healing,
			objectiveKills,
			soloKills,
			playTime,
			gamesWon,
			goldenMedals,
			silverMedals,
			bronzeMedals
		}) => ({
			finalBlows: `**Golpes finales:** ${this.groupDigits(finalBlows)}`,
			deaths: `**Muertes:** ${this.groupDigits(deaths)}`,
			damageDealt: `**Daño infligido:** ${this.groupDigits(damageDone)}`,
			healing: `**Curación:** ${this.groupDigits(healing)}`,
			objectiveKills: `**El objetivo mata:** ${this.groupDigits(objectiveKills)}`,
			soloKills: `**Solo mata:** ${this.groupDigits(soloKills)}`,
			playTime: `**Tiempo de juego:** ${this.duration(playTime, 2)}`,
			gamesWon: `**Juegos ganados:** ${this.groupDigits(gamesWon)}`,
			goldenMedals: `**Medallas de oro ganadas:** ${this.groupDigits(goldenMedals)}`,
			silverMedals: `**Medallas de plata ganadas:** ${this.groupDigits(silverMedals)}`,
			bronzeMedals: `**Medallas de bronce ganadas:** ${this.groupDigits(bronzeMedals)}`
		}),
		commandOverwatchEmbedDataTopHero: ({ name, playTime }) => `**${toTitleCase(name)}** (${playTime})`,
		commandOverwatchEmbedData: ({ authorName, playerLevel, prestigeLevel, totalGamesWon }) => ({
			title: 'Haga clic aquí para obtener más detalles en overwatchtracker.com',
			ratingsTitle: 'Calificaciones',
			author: `Estadísticas de jugador de Overwatch para ${authorName}`,
			playerLevel: `**Nivel de jugador:** ${this.groupDigits(playerLevel)}`,
			prestigeLevel: `**Nivel de prestigio:** ${this.groupDigits(prestigeLevel)}`,
			totalGamesWon: `**Total de juegos ganados:** ${this.groupDigits(totalGamesWon)}`,
			noGamesWon: `**Total de juegos ganados:** ${this.language.globalNone}`,
			headers: {
				account: '__Estadísticas de cuenta__',
				quickplay: '__Estadísticas de Quickplay__',
				competitive: '__Estadísticas competitivas__',
				topHeroesQuickplay: '__Mejores héroes juego rápido',
				topHeroesCompetitive: '__Mejores héroes competitivos__'
			}
		}),

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		commandSupportDescription: 'Muestra instrucciones de soporte',
		commandSupportExtended: {
			extendedHelp: "Le brinda un enlace a *Skyra's Lounge*, el lugar indicado para todo lo relacionado conmigo."
		},

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		commandCreateMuteDescription: 'Prepare the mute system.',
		commandCreateMuteExtended: {
			extendedHelp: `This command prepares the mute system by creating a role called 'muted', and configuring it to the guild settings. This command also modifies all channels (where possible) permissions and disables the permission **${this.PERMISSIONS.SEND_MESSAGES}** in text channels and **${this.PERMISSIONS.CONNECT}** in voice channels for said role.`
		},
		commandGiveawayDescription: 'Start a new giveaway.',
		commandGiveawayExtended: {
			extendedHelp: [
				'This command is designed to manage giveaways. You can start them with this command by giving it the time and a title.',
				'',
				'When a giveaway has been created, I will send a giveaway message and react to it with 🎉 so the members of the server can participate on it.',
				'',
				'You can pass a flag of `--winners=Xw`, wherein X is a number (for example 2w for 2 winners) to allow multiple people to win a giveaway.',
				'Please note that there is a maximum of 25 winners.'
			],
			explainedUsage: [
				['channel', '(Optional) The channel in which to start the giveaway'],
				['time', 'The time the giveaway should last.'],
				['title', 'The title of the giveaway.']
			],
			examples: ['6h A hug from Skyra.', '60m 5w A mysterious Steam game', '1d Free Discord Nitro! --winners=2w'],
			multiline: true
		},
		commandGiveawayRerollDescription: 'Re-roll the winners from a giveaway.',
		commandGiveawayRerollExtended: {
			extendedHelp: `This command is designed to re-roll finished giveaways. Please check \`Skyra, help gstart\` for more information about creating one.`,
			explainedUsage: [
				['winners', 'The amount of winners to pick.'],
				['message', 'The message to target. Defaults to last giveaway message.']
			],
			examples: ['', '633939404745998346', '5', '5 633939404745998346']
		},
		commandGiveawayScheduleDescription: 'Schedule a giveaway to start at a certain time.',
		commandGiveawayScheduleExtended: {
			extendedHelp: [
				'This command prepares a giveaway to start at a certain time if you do not wish to start it immediately.',
				'You can pass a flag of `--winners=X`, wherein X is a number, to allow multiple people to win this giveaway.',
				'Please note that there is a maximum of 25 winners.'
			],
			explainedUsage: [
				['channel', '(Optional) The channel in which to start the giveaway'],
				['schedule', 'The time to wait before starting the giveaway.'],
				['time', 'The time the giveaway should last.'],
				['title', 'The title of the giveaway.']
			],
			examples: ['30m 6h A hug from Skyra.'],
			multiline: true
		},

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		commandNickDescription: "Change Skyra's nickname for this server.",
		commandNickExtended: {
			extendedHelp: "This command allows you to change Skyra's nickname easily for the server.",
			reminder: `This command requires the **${this.PERMISSIONS.CHANGE_NICKNAME}** permission. Make sure Skyra has it.`,
			explainedUsage: [['nick', "The new nickname. If you don't put any, it'll reset it instead."]],
			examples: ['SkyNET', 'Assistant', '']
		},
		commandPermissionNodesDescription: 'Configure the permission nodes for this server.',
		commandPermissionNodesExtended: {
			extendedHelp: [
				'Permission nodes are per-user and per-role overrides. They are used when the built-in permissions system is not enough.',
				'For example, in some servers they want to give a staff role the permissions to use mute and warn, but not ban and others (reserved to moderators), and only warn is available for the configurable staff-level permission, so you can tell me to allow the mute command for the staff role now.'
			],
			explainedUsage: [
				['action', 'Either `add`, `remove`, `reset`, or `show`. Defaults to `show`.'],
				['target', 'Either a role name or a user name, allowing IDs and mentions for either.'],
				['type', 'Either `allow` or `deny`. This is ignored when `action` is not `add` nor `remove`.'],
				['command', 'The name of the command to allow or deny. This is ignored when `action` is not `add` nor `remove`.']
			],
			examples: ['add staff allow warn', 'add moderators deny ban', 'remove staff allow warn', 'reset staff', 'show staff'],
			reminder: 'The server owner cannot have any actions, nor the `everyone` role can have allowed commands.',
			multiline: true
		},
		commandTriggersDescription: 'Set custom triggers for your guild!.',
		commandTriggersExtended: {
			extendedHelp: [
				'This command allows administrators to go further with the personalization of Skyra in the guild!.',
				'A trigger is a piece that can active other functions.',
				'For example, the aliases are triggers that get executed when the command does not exist in bot, triggering the unknown command event.',
				'When this happens, the alias system executes and tries to find an entry that matches with the input.'
			],
			reminder: `This command requires the **${this.PERMISSIONS.ADD_REACTIONS}** permission so it can test reactions. Make sure Skyra has it.`,
			explainedUsage: [
				['list', 'List all current triggers.'],
				['add <type> <input> <output>', 'Add a new trigger given a type, input and output.'],
				['remove <type> <input>', 'Remove a trigger given the type and input.']
			],
			examples: ['', 'list', 'add reaction "good night" 🌛', 'remove reaction "good night"'],
			multiline: true
		},

		/**
		 * #################################
		 * MANAGEMENT/CONFIGURATION COMMANDS
		 */

		commandManagecommandautodeleteDescription: 'Manage per-channel autodelete timer.',
		commandManagecommandautodeleteExtended: {
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
		commandManageCommandChannelDescription: 'Manage per-channel command blacklist.',
		commandManageCommandChannelExtended: {
			extendedHelp:
				"This command manages this guild's per-channel command blacklist, it serves well to disable certain commands you do not want to be used in certain channels (to disable a command globally, use the `disabledCommands` settings key to disable in all channels.",
			explainedUsage: [
				['show [channel]', 'Show the command blacklist for the selected channel.'],
				['add [channel] <command>', "Add a command to the specified channel's command blacklist."],
				['remove [channel] <command>', "Remove a command to the specified channel's command blacklist."],
				['reset [channel]', 'Clear the command blacklist for the specified channel.']
			],
			reminder: 'The channel argument is optional, but it uses fuzzy search when possible.',
			examples: ['show', 'add #general profile', 'remove #general profile', 'reset #general']
		},
		commandManageReactionRolesDescription: 'Manage the reaction roles for this server.',
		commandManageReactionRolesExtended: {
			extendedHelp: [
				'Seamlessly set up reaction roles in your server! When adding reaction roles, I listen to your reactions for 5 minutes and I bind the first reaction from you alongside the channel and the message, with the specified role.',
				"Otherwise, if a channel is specified, a prompt will not be created, and the reaction role will be bound to all of the channel's messages.",
				'',
				'The best way to add new reaction roles is by using `add @role`. If you prefer not binding the reaction to a specific message then use `add @role #channel emoji`'
			],
			explainedUsage: [
				['show', 'Retrieve the list of all reaction roles.'],
				['add <role>', 'Adds a reaction role binding the first reacted message since the execution with the role.'],
				['remove <role> <message>', 'Removes a reaction role, use `show` to get a list of them.'],
				['reset', 'Removes all reaction roles.']
			],
			multiline: true,
			examples: ['show', 'add @role', 'add @role #channel emoji', 'remove @role 123456789012345678', 'reset']
		},
		commandSetIgnoreChannelsDescription: 'Set a channel to the ignore channel list.',
		commandSetIgnoreChannelsExtended: {
			extendedHelp: [
				"This command helps you setting up ignored channels. An ignored channel is a channel where nobody but moderators can use Skyra's commands.",
				`Unlike removing the **${this.PERMISSIONS.SEND_MESSAGES}** permission, Skyra is still able to send (and therefore execute commands) messages, which allows moderators to use moderation commands in the channel.`,
				'Use this if you want to ban any command usage from the bot in a specific channel.'
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
			examples: ['#general', 'here'],
			multiline: true
		},
		commandSetImageLogsDescription: 'Set the image logs channel.',
		commandSetImageLogsExtended: {
			extendedHelp: [
				'This command helps you setting up the image log channel. Whenever a member sends an image attachment, it will send an embed message with the attachment re-uploaded.',
				`All messages are in embeds so you will need to enable the permission **${this.PERMISSIONS.EMBED_LINKS}** for Skyra.`
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			examples: ['#image-logs', 'here'],
			multiline: true
		},
		commandSetMemberLogsDescription: 'Set the member logs channel.',
		commandSetMemberLogsExtended: {
			extendedHelp: [
				'This command helps you setting up the member log channel. A member log channel only sends two kinds of logs: "Member Join" and "Member Leave".',
				'If a muted user joins, it will send a special "Muted Member Join" event.',
				`All messages are in embeds so you will need to enable the permission **${this.PERMISSIONS.EMBED_LINKS}** for Skyra.`,
				`You also need to individually set the "events" you want to listen: "events.memberAdd" and "events.memberRemove".`,
				'For roles, you would enable "events.memberNicknameChange" and/or "events.memberRoleUpdate" via the "config" command.'
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			examples: ['#member-logs', 'here'],
			multiline: true
		},
		commandSetMessageLogsDescription: 'Set the message logs channel.',
		commandSetMessageLogsExtended: {
			extendedHelp: [
				'This command helps you setting up the message log channel. A message log channel only sends three kinds of logs: "Message Delete", "Message Edit", and "Message Prune".',
				`All messages are in embeds so you will need to enable the permission **${this.PERMISSIONS.EMBED_LINKS}** for Skyra.`,
				'You also need to individually set the "events" you want to listen: "events.messageDelete" and "events.messageEdit" via the "config" command.'
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: `Due to Discord limitations, Skyra cannot know who deleted a message. The only way to know is by fetching audit logs, requiring the permission **${this.PERMISSIONS.VIEW_AUDIT_LOG}** which access is limited in the majority of guilds and the amount of times I can fetch them in a period of time.`,
			examples: ['#message-logs', 'here'],
			multiline: true
		},
		commandSetmodlogsDescription: 'Set the mod logs channel.',
		commandSetmodlogsExtended: {
			extendedHelp: [
				'This command helps you setting up the mod log channel. A mod log channel only sends case reports indexed by a number case and with "claimable" reasons and moderators.',
				'This channel is not a must and you can always retrieve specific modlogs with the "case" command.',
				`All messages are in embeds so you will need to enable the permission **${this.PERMISSIONS.EMBED_LINKS}** for Skyra.`,
				'For auto-detection, you need to individually set the "events" you want to listen: "events.banAdd", "events.banRemove" via the "config" command.'
			],
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: `Due to Discord limitations, the auto-detection does not detect kicks. You need to use the "kick" command if you want to document them as
				a formal moderation log case.`,
			examples: ['#mod-logs', 'here'],
			multiline: true
		},
		commandSetprefixDescription: "Set Skyra's prefix.",
		commandSetprefixExtended: {
			extendedHelp: [
				"This command helps you setting up Skyra's prefix. A prefix is an affix that is added in front of the word, in this case, the message.",
				'It allows bots to distinguish between a regular message and a command. By nature, the prefix between should be different to avoid conflicts.',
				"If you forget Skyra's prefix, simply mention her with nothing else and she will tell you the current prefix.",
				'Alternatively, you can prefix the commands with her name and a comma (for example `Skyra, ping`).'
			],
			explainedUsage: [['prefix', `The prefix to set. Default one in Skyra is "${this.client.options.prefix}".`]],
			reminder: 'Your prefix should only contain characters everyone can write and type.',
			examples: ['&', '='],
			multiline: true
		},
		commandSetrolechannelDescription: 'Set the role channel for role reactions.',
		commandSetrolechannelExtended: {
			extendedHelp:
				'This command sets up the role channel to lock the reactions to, it is a requirement to set up before setting up the **role message**, and if none is given, the role reactions module will not run.',
			explainedUsage: [
				[
					'channel',
					'A TextChannel. You can either put the name of the channel, tag it, or type in "here" to select the channel the message was sent.'
				]
			],
			reminder: 'You cannot set the same channel twice, instead, Skyra will remove it.',
			examples: ['#roles', 'here']
		},
		commandSetrolemessageDescription: 'Set the role message for role reactions.',
		commandSetrolemessageExtended: {
			extendedHelp: [
				'This command sets up the role message to lock the reactions to, it requires a **role channel** to be set up first.',
				'If none is given, Skyra will listen to any reaction in the channel.',
				`Additionally, Skyra requires **${this.PERMISSIONS.READ_MESSAGE_HISTORY}** in order to fetch the message for validation.`
			],
			explainedUsage: [['message', 'An ID, they are 17-18 characters long and numeric.']],
			reminder: 'You must execute this command in the role channel.',
			examples: ['434096799847022598'],
			multiline: true
		},
		commandSetStarboardEmojiDescription: 'Set the emoji reaction for starboard.',
		commandSetStarboardEmojiExtended: {
			extendedHelp:
				'This command sets up the starboard emoji for the starboard, which is, by default, ⭐. Once this is changed, Skyra will ignore any star and will count users who reacted to said emoji.',
			explainedUsage: [['emoji', 'The emoji to set.']],
			reminder: 'Use this wisely, not everyone expects the starboard to listen to a custom emoji.',
			examples: ['⭐']
		},

		/**
		 * #################
		 * GIVEAWAY COMMANDS
		 */

		commandGiveawayRerollInvalid: 'The message ID does not exist or there is no finished giveaway.',

		/**
		 * ###########################
		 * MANAGEMENT/HELPERS COMMANDS
		 */

		commandRoleInfoDescription: 'Check the information for a role.',
		commandRoleInfoExtended: {
			extendedHelp: [
				"The roleinfo command displays information for a role, such as its id, name, color, whether it's hoisted (displays separately) or not, it's role hierarchy position, whether it's mentionable or not, how many members have said role, and its permissions.",
				'It sends an embedded message with the color of the role.'
			],
			explainedUsage: [['role', 'The role name, partial name, mention or id.']],
			examples: ['Administrator', 'Moderator', ''],
			multiline: true
		},
		commandGuildInfoDescription: 'Check the information of the guild!.',
		commandGuildInfoExtended: {
			extendedHelp: [
				'The serverinfo command displays information for the guild the message got sent.',
				'It shows the amount of channels, with the count for each category, the amount of members (given from the API), the owner with their user id, the amount of roles, region, creation date, verification level... between others.'
			],
			multiline: true
		},

		/**
		 * ###########################
		 * MANAGEMENT/MEMBERS COMMANDS
		 */

		commandStickyRolesDescription: 'Manage sticky roles for users.',
		commandStickyRolesExtended: {
			extendedHelp:
				"The stickyRoles command allows you to manage per-member's sticky roles, they are roles that are kept even when you leave, and are applied back as soon as they join.",
			explainedUsage: [
				['action', 'Either you want to check the sticky roles, add one, remove one, or remove all of them.'],
				['user', 'The user target for all the actions.'],
				['role', 'The role to add or remove.']
			],
			examples: ['add Skyra Goddess', 'show Skyra', 'remove Skyra Goddess', 'reset Skyra'],
			reminder: "The member's roles will not be modified by this command, you need to add or remove them."
		},

		/**
		 * ##################################
		 * MANAGEMENT/MESSAGE FILTER COMMANDS
		 */

		commandAttachmentsModeDescription: "Manage this guild's flags for the attachments filter.",
		commandAttachmentsModeExtended: {
			extendedHelp: ['The attachmentsMode command manages the behavior of the attachments system.'],
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
		commandCapitalsModeDescription: "Manage this guild's flags for the caps filter.",
		commandCapitalsModeExtended: {
			extendedHelp: [
				'The capitalsMode command manages the behavior of the caps system.',
				'The minimum amount of characters before filtering can be set with `Skyra, settings set selfmod.capitals.minimum <number>`.',
				'The percentage of uppercase letters can be set with `Skyra, settings set selfmod.capitals.maximum <number>`.'
			],
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
		commandFilterDescription: "Manage this guild's word blacklist.",
		commandFilterExtended: {
			extendedHelp: [
				'The filter command manages the word blacklist for this server and must have a filter mode set up, check `Skyra, help filterMode`.',
				"Skyra's word filter can find matches even with special characters or spaces between the letters of a blacklisted word, as well as it filters duplicated characters for enhanced filtering."
			],
			multiline: true
		},
		commandFilterModeDescription: "Manage this server's word filter modes.",
		commandFilterModeExtended: {
			extendedHelp: 'The filterMode command manages the behavior of the word filter system. Run `Skyra, help filter` for how to add words.',
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
		commandInviteModeDescription: 'Manage the behavior for the invite link filter.',
		commandInviteModeExtended: {
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
		commandLinkModeDescription: 'Manage the behavior for the link filter.',
		commandLinkModeExtended: {
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
		commandMessageModeDescription: 'Manage the behavior for the message filter system.',
		commandMessageModeExtended: {
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
		commandNewlineModeDescription: 'Manage the behavior for the new line filter system.',
		commandNewlineModeExtended: {
			extendedHelp: [
				'The newLineMode command manages the behavior of the new line filter system.',
				'The maximum amount of lines allowed can be set with `Skyra, settings set selfmod.newlines.maximum <number>`'
			],
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
		commandReactionModeDescription: 'Manage the behavior for the reaction filter system.',
		commandReactionModeExtended: {
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

		commandCuddleDescription: 'Cuddle somebody!',
		commandCuddleExtended: {
			extendedHelp:
				"Do you know something that I envy from humans? The warm feeling when somebody cuddles you. It's so cute ❤! I can imagine and draw a image of you cuddling somebody in the bed, I hope you like it!",
			explainedUsage: [['user', 'The user to cuddle with.']],
			examples: ['Skyra']
		},
		commandDeletthisDescription: '*Sees offensive post* DELETTHIS!',
		commandDeletthisExtended: {
			extendedHelp:
				"I see it! I see the hammer directly from your hand going directly to the user you want! Unless... unless it's me! If you try to tell me this, I'm going to take the MJOLNIR! Same if you do with my creator!",
			explainedUsage: [['user', 'The user that should start deleting his post.']],
			examples: ['John Doe']
		},
		commandFDescription: 'Press F to pay respects.',
		commandFExtended: {
			extendedHelp:
				'This command generates an image... to pay respects reacting with 🇫. This command also makes Skyra react the image if she has permissions to react messages.',
			explainedUsage: [['user', 'The user to pray respects to.']],
			examples: ['John Doe', 'Jake']
		},
		commandGoodnightDescription: 'Give somebody a nice Good Night!',
		commandGoodnightExtended: {
			extendedHelp: "Let me draw you giving a goodnight kiss to the person who is going to sleep! Who doesn't like goodnight kisses?",
			explainedUsage: [['user', 'The user to give the goodnight kiss.']],
			examples: ['Jake', 'DefinitivelyNotSleeping']
		},
		commandGoofytimeDescription: "It's Goofy time!",
		commandGoofytimeExtended: {
			extendedHelp:
				"IT'S GOOFY TIME! *Screams loudly in the background* NO, DAD! NO! This is a command based on the Goofy Time meme, what else would it be?",
			explainedUsage: [['user', "The user who will say IT'S GOOFY TIME!"]],
			examples: ['TotallyNotADaddy']
		},
		commandHugDescription: 'Hugs!',
		commandHugExtended: {
			extendedHelp:
				"What would be two people in the middle of the snow with coats and hugging each other? Wait! I get it! Mention somebody you want to hug with, and I'll try my best to draw it in a canvas!",
			explainedUsage: [['user', 'The user to hug with.']],
			examples: ['Bear']
		},
		commandIneedhealingDescription: "*Genji's voice* I NEED HEALING!",
		commandIneedhealingExtended: {
			extendedHelp: [
				'Do you know the worst nightmare for every single healer in Overwatch, specially for Mercy? YES!',
				'You know it, it\'s a cool cyborg ninja that looks like a XBOX and is always yelling "I NEED HEALING" loudly during the entire match.',
				"Well, don't expect so much, this command actually shows a medic with some tool in your chest."
			],
			explainedUsage: [['healer', 'The healer you need to heal you.']],
			examples: ['Mercy'],
			multiline: true
		},
		commandRandRedditDescription: 'Retrieve a random Reddit post.',
		commandRandRedditExtended: {
			extendedHelp: 'This is actually something like a Russian Roulette, you can get a good meme, but you can also get a terrible meme.',
			explainedUsage: [['reddit', 'The reddit to look at.']],
			examples: ['discordapp']
		},
		commandRedditUserDescription: 'Retrieve statistics for a Reddit user.',
		commandRedditUserExtended: {
			extendedHelp: 'Gets statistics of any given Reddit user',
			explainedUsage: [['user', 'The reddit user to look at.']],
			examples: ['GloriousGe0rge']
		},
		commandShipDescription: 'Ships 2 members',
		commandShipExtended: {
			extendedHelp: [
				'This commands generates a ship name between two users and creates more love in the world.',
				'Users are optional, you can provide none, just one or both users. For any non-provided users I will pick a random guild member.'
			],
			explainedUsage: [
				['firstUser', 'The first user to ship'],
				['secondUser', 'The second user to ship']
			],
			examples: ['romeo juliet'],
			reminder: 'If I cannot find either given user then I will pick someone randomly.',
			multiline: true
		},
		commandShipData: ({ romeoUsername, julietUsername, shipName }) => ({
			title: `**Shipping \`${romeoUsername}\` and \`${julietUsername}\`**`,
			description: `I call it... ${shipName}`
		}),
		commandChaseDescription: 'Get in here!',
		commandChaseExtended: {
			extendedHelp: 'Do you love chasing? Start chasing people now for free! Just mention or write their ID and done!',
			explainedUsage: [['pinger', 'The user who you want to chase.']],
			examples: ['IAmInnocent']
		},
		commandShindeiruDescription: 'Omae wa mou shindeiru.',
		commandShindeiruExtended: {
			extendedHelp: [
				'"You are already dead" Japanese: お前はもう死んでいる; Omae Wa Mou Shindeiru, is an expression from the manga and anime series Fist of the North Star.',
				'This shows a comic strip of the character pronouncing the aforementioned words, which makes the opponent reply with "nani?" (what?).'
			],
			explainedUsage: [['user', "The person you're telling that phrase to."]],
			examples: ['Jack'],
			multiline: true
		},
		commandPeepoloveDescription: 'Genera una imagen peepoLove con avatar de usuario.',
		commandPeepoloveExtended: {
			extendedHelp: `Le permite generar una imagen peepoLove a partir del avatar de usuario.`,
			explainedUsage: [['user', 'El usuario que peepo debe abrazar.']],
			examples: ['Jack'],
			reminder:
				'El soporte de imágenes personalizadas se ha deshabilitado temporalmente, la ETA que regresa es aproximadamente noviembre de 2020.'
		},
		commandSlapDescription: 'Slap another user using the Batman & Robin Meme.',
		commandSlapExtended: {
			extendedHelp: 'The hell are you saying? *Slaps*. This meme is based on a comic from Batman and Robin.',
			explainedUsage: [['user', 'The user you wish to slap.']],
			examples: ['Jake'],
			reminder: "You try to slap me and I'll slap you instead."
		},
		commandSnipeDescription: 'Retrieve the last deleted message from a channel',
		commandSnipeExtended: {
			extendedHelp: 'This just sends the last deleted message from this channel, somebody is misbehaving? This will catch them.'
		},
		commandThesearchDescription: 'Are we the only one in the universe, this man on earth probably knows.',
		commandThesearchExtended: {
			extendedHelp: 'One man on Earth probably knows if there is intelligent life, ask and you shall receive an answer.',
			explainedUsage: [['answer', 'The sentence that will reveal the truth.']],
			examples: ['Your waifu is not real.']
		},
		commandTriggeredDescription: 'I am getting TRIGGERED!',
		commandTriggeredExtended: {
			extendedHelp:
				"What? My commands are not userfriendly enough?! (╯°□°）╯︵ ┻━┻. This command generates a GIF image your avatar wiggling fast, with a TRIGGERED footer, probably going faster than I thought, I don't know.",
			explainedUsage: [['user', 'The user that is triggered.']],
			examples: ['kyra']
		},
		commandUpvoteDescription: 'Get a link to upvote Skyra in **Bots For Discord**',
		commandUpvoteExtended: {
			extendedHelp:
				'Bots For Discord is a website where you can find amazing bots for your website. If you really love me, you can help me a lot by upvoting me every 24 hours, so more users will be able to find me!'
		},
		commandVaporwaveDescription: 'Vapowave characters!',
		commandVaporwaveExtended: {
			extendedHelp:
				"Well, what can I tell you? This command turns your messages into unicode monospaced characters. That is, what humans call 'Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ'. I wonder what it means...",
			explainedUsage: [['phrase', 'The phrase to convert']],
			examples: ['A E S T H E T I C']
		},
		/**
		 * ##############################
		 * MODERATION/MANAGEMENT COMMANDS
		 */

		commandHistoryDescription: 'Display the count of moderation cases from this guild or from a user.',
		commandHistoryExtended: {
			extendedHelp: 'This command shows the amount of bans, mutes, kicks, and warnings, including temporary, that have not been appealed.',
			examples: ['', '@Pete']
		},
		commandHistoryFooterNew: ({ warnings, mutes, kicks, bans, warningsText, mutesText, kicksText, bansText }) =>
			`This user has ${warnings} ${warningsText}, ${mutes} ${mutesText}, ${kicks} ${kicksText}, and ${bans} ${bansText}`,
		commandHistoryFooterWarning: () => 'warning',
		commandHistoryFooterWarningPlural: () => 'warnings',
		commandHistoryFooterMutes: () => 'mute',
		commandHistoryFooterMutesPlural: () => 'mutes',
		commandHistoryFooterKicks: () => 'kick',
		commandHistoryFooterKicksPlural: () => 'kicks',
		commandHistoryFooterBans: () => 'ban',
		commandHistoryFooterBansPlural: () => 'bans',
		commandModerationsDescription: 'List all running moderation logs from this guild.',
		commandModerationsExtended: {
			extendedHelp: `This command shows you all the temporary moderation actions that are still running. This command uses a reaction-based menu and requires the permission **${this.PERMISSIONS.MANAGE_MESSAGES}** to execute correctly.`,
			examples: ['', '@Pete', 'mutes @Pete', 'warnings']
		},
		commandModerationsEmpty: 'Nobody has behaved badly yet, who will be the first user to be listed here?',
		commandModerationsAmount: () => 'There is 1 entry.',
		commandModerationsAmountPlural: ({ count }) => `There are ${count} entries.`,
		commandMutesDescription: 'List all mutes from this guild or from a user.',
		commandMutesExtended: {
			extendedHelp: [
				'This command shows either all mutes filed in this guild, or all mutes filed in this guild for a specific user.',
				`This command uses a reaction-based menu and requires the permission **${this.PERMISSIONS.MANAGE_MESSAGES}** to execute correctly.`
			],
			examples: ['', '@Pete'],
			multiline: true
		},
		commandWarningsDescription: 'List all warnings from this guild or from a user.',
		commandWarningsExtended: {
			extendedHelp: [
				'This command shows either all warnings filed in this guild, or all warnings filed in this guild for a specific user.',
				`This command uses a reaction-based menu and requires the permission **${this.PERMISSIONS.MANAGE_MESSAGES}** to execute correctly.`
			],
			examples: ['', '@Pete'],
			multiline: true
		},

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		commandSlowmodeDescription: "Set the channel's slowmode value in seconds.",
		commandSlowmodeExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_CHANNELS}** and will modify the channel's ratelimit per user to any value between 0 and 120 seconds.`,
			examples: ['0', 'reset', '4'],
			reminder: "To reset a channel's ratelimit per user, you can use either 0 or 'reset'."
		},

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		commandBanDescription: 'Hit somebody with the ban hammer.',
		commandBanExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.BAN_MEMBERS}**, and only members with lower role hierarchy position can be banned by me.`,
				"No, the guild's owner cannot be banned.",
				'This action can be optionally timed to create a temporary ban.'
			],
			examples: ['@Pete', '@Pete Spamming all channels.', '@Pete 24h Spamming all channels'],
			multiline: true
		},
		commandDehoistDescription: 'Shoot everyone with the Dehoistinator 3000',
		commandDehoistExtended: {
			extendedHelp: [
				'The act of hoisting involves adding special characters in front of your nickname in order to appear higher in the members list.',
				"This command replaces any member's nickname that includes those special characters with a special character that drags them to the bottom of the list."
			],
			reminder: `This command requires **${this.PERMISSIONS.MANAGE_NICKNAMES}**, and only members with lower role hierarchy position can be dehoisted.`,
			multiline: true
		},
		commandKickDescription: 'Hit somebody with the 👢.',
		commandKickExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.KICK_MEMBERS}**, and only members with lower role hierarchy position can be kicked by me. No, the guild's owner cannot be kicked.`,
			examples: ['@Sarah', '@Sarah Spamming general chat.']
		},
		commandLockdownDescription: 'Close the gates for this channel!',
		commandLockdownExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_CHANNELS}** in order to be able to manage the permissions for a channel.`,
				`This command removes the permission **${this.PERMISSIONS.SEND_MESSAGES}** to the \`@everyone\` role so nobody but the members with roles that have their own overrides (besides administrators, who bypass channel overrides) can send messages.`,
				'Optionally, you can pass time as second argument.'
			],
			examples: ['', '#general', '#general 5m'],
			multiline: true
		},
		commandMuteDescription: 'Mute a user in all text and voice channels.',
		commandMuteExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be muted.",
				"This action can be optionally timed to create a temporary mute. This action saves a member's roles temporarily and will be granted to the user after the unmute.",
				'The muted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Alphonse', '@Alphonse Spamming all channels', '@Alphonse 24h Spamming all channels'],
			multiline: true
		},
		commandSetNicknameDescription: 'Change the nickname of a user.',
		commandSetNicknameExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_NICKNAMES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner nickname cannot be changed."
			],
			examples: ['@Pete peeehteeerrr', '@ꓑ𝗲੮ẻ Pete Unmentionable name'],
			multiline: true
		},
		commandAddRoleDescription: 'Adds a role to a user.',
		commandAddRoleExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner roles cannot be changed."
			],
			examples: ['@John member', '@John member Make John a member'],
			multiline: true
		},
		commandRemoveroleDescription: 'Removes a role from a user',
		commandRemoveroleExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner roles cannot be changed."
			],
			examples: ['@Paula member', '@Paula member Remove member permissions from Paula'],
			multiline: true
		},
		commandPruneDescription: 'Prunes a certain amount of messages w/o filter.',
		commandPruneExtended: {
			extendedHelp: [
				'This command deletes the given amount of messages given a filter within the last 100 messages sent in the channel the command has been run.',
				'Optionally, you can add `--silent` to tell Skyra not to send a response message.'
			],
			explainedUsage: [
				['Messages', 'The amount of messages to prune.'],
				['Filter', 'The filter to apply.'],
				['(Filter) Link', 'Filters messages that have links on the content.'],
				['(Filter) Invite', 'Filters messages that have invite links on the content.'],
				['(Filter) Bots', 'Filters messages sent by bots.'],
				['(Filter) You', 'Filters messages sent by Skyra.'],
				['(Filter) Me', 'Filters your messages.'],
				['(Filter) Upload', 'Filters messages that have attachments.'],
				['(Filter) User', 'Filters messages sent by the specified user.'],
				['(Filter) Human', 'Filters messages sent by humans.'],
				['Position', 'Lets you delete messages before or after a specific message.'],
				['(Position) Before', 'Deletes all messages before the given message.'],
				['(Position) After', 'Deletes all messages after the given message.']
			],
			examples: ['50 me', '75 @kyra', '20 bots', '60 humans before 629992398700675082'],
			reminder: 'Due to a Discord limitation, bots cannot delete messages older than 14 days.',
			multiline: true
		},
		commandCaseDescription: 'Get the information from a case by its index.',
		commandCaseExtended: {
			extendedHelp: 'You can also get the latest moderation case by specifying the case ID as "latest"',
			explainedUsage: [['Case', 'Number of the case ID to get or "latest"']],
			examples: ['5', 'latest']
		},
		commandPermissionsDescription: 'Check the permission for a member, or yours.',
		commandPermissionsExtended: {
			extendedHelp: 'Ideal if you want to know the what permissions are granted to a member when they have a certain set of roles.'
		},
		commandFlowDescription: 'Shows the amount of messages per minute in a channel.',
		commandFlowExtended: {
			extendedHelp: 'This helps you determine the overall activity of a channel',
			explainedUsage: [['channel', '(Optional): The channel to check, if omitted current channel is used']]
		},
		commandReasonDescription: 'Edit the reason field from a moderation log case.',
		commandReasonExtended: {
			extendedHelp: [
				'This command allows moderation log case management, it allows moderators to update the reason.',
				'If you want to modify multiple cases at once you provide a range.',
				'For example `1..3` for the `<range>` will edit cases 1, 2, and 3.',
				'Alternatively you can also give ranges with commas:',
				'`1,3..6` will result in cases 1, 3, 4, 5, and 6',
				'`1,2,3` will result in cases 1, 2, and 3'
			],
			examples: ['420 Spamming all channels', '419..421 Bad memes', '1..3,4,7..9 Posting NSFW', 'latest Woops, I did a mistake!'],
			multiline: true
		},
		commandRestrictAttachmentDescription: 'Restrict a user from sending attachments in all channels.',
		commandRestrictAttachmentExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Sending weird images', '@Pete 24h Sending NSFW images'],
			multiline: true
		},
		commandRestrictEmbedDescription: 'Restrict a user from attaching embeds in all channels.',
		commandRestrictEmbedExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Sending weird links', '@Pete 24h Posted a spam link'],
			multiline: true
		},
		commandRestrictEmojiDescription: 'Restrict a user from using external emojis in all channels.',
		commandRestrictEmojiExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Spamming external emojis', '@Pete 24h Posted cringe'],
			reminder: `This will only prevent the usage of external emojis and so will have no effect for non-nitro users, your own server's emojis and regular build in twemojis can still be used by members with this role.`,
			multiline: true
		},
		commandRestrictReactionDescription: 'Restrict a user from reacting to messages in all channels.',
		commandRestrictReactionExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Spamming reactions', '@Pete 24h Posting weird reactions'],
			multiline: true
		},
		commandRestrictVoiceDescription: 'Restrict a user from joining any voice channel.',
		commandRestrictVoiceExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MANAGE_ROLES}**, and only members with lower role hierarchy position can be managed by me.`,
				"No, the guild's owner cannot be restricted.",
				'This action can be optionally timed to create a temporary restriction.',
				'The restricted role is **sticky**, if the user tries to remove it by rejoining the guild, it will be added back.'
			],
			examples: ['@Pete', '@Pete Earraping in general voice channels', '@Pete 24h Making weird noises'],
			multiline: true
		},
		commandSoftBanDescription: 'Hit somebody with the ban hammer, destroying all their messages for some days, and unban it.',
		commandSoftBanExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.BAN_MEMBERS}**, and only members with lower role hierarchy position can be banned by me.`,
				"No, the guild's owner cannot be banned.",
				"The ban feature from Discord has a feature that allows the moderator to remove all messages from all channels that have been sent in the last 'x' days, being a number between 0 (no days) and 7.",
				'The user gets unbanned right after the ban, so it is like a kick, but that can prune many many messages.'
			],
			examples: ['@Pete', '@Pete Spamming all channels', '@Pete 7 All messages sent in 7 are gone now, YEE HAH!'],
			multiline: true
		},
		commandToggleModerationDmDescription: 'Toggle moderation DMs.',
		commandToggleModerationDmExtended: {
			extendedHelp: `This command allows you to toggle moderation DMs. By default, they are on, meaning that any moderation action (automatic or manual) will DM you, but you can disable them with this command.`
		},
		commandUnbanDescription: 'Unban somebody from this guild!.',
		commandUnbanExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.BAN_MEMBERS}**. It literally gets somebody from the rubbish bin, cleans them up, and allows the pass to this guild's gates.`,
			examples: ['@Pete', '@Pete Turns out he was not the one who spammed all channels ¯\\_(ツ)_/¯']
		},
		commandUnmuteDescription: 'Remove the scotch tape from a user.',
		commandUnmuteExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the muted people's list, and gives the old roles back if the user had them.`,
			examples: ['@Pete', '@Pete (Insert random joke here).']
		},
		commandUnrestrictAttachmentDescription: 'Remove the attachment restriction from one or more users.',
		commandUnrestrictAttachmentExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnrestrictEmbedDescription: 'Remove the embed restriction from one or more users.',
		commandUnrestrictEmbedExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnrestrictEmojiDescription: 'Remove the external emoji restriction from one or more users.',
		commandUnrestrictEmojiExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnrestrictReactionDescription: 'Remove the reaction restriction from one or more users.',
		commandUnrestrictReactionExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnrestrictVoiceDescription: 'Remove the voice restriction from one or more users.',
		commandUnrestrictVoiceExtended: {
			extendedHelp: `This command requires **${this.PERMISSIONS.MANAGE_ROLES}** and removes a user from the restricted people's list.`,
			examples: ['@Pete']
		},
		commandUnwarnDescription: 'Appeal a warning moderation log case.',
		commandUnwarnExtended: {
			extendedHelp: `This command appeals a warning, it requires no permissions, you only give me the moderation log case to appeal and the reason.`,
			examples: ['0 Whoops, wrong dude.', '42 Turns out this was the definition of life.']
		},
		commandVmuteDescription: "Throw somebody's microphone out the window.",
		commandVmuteExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MUTE_MEMBERS}**, and only members with lower role hierarchy position can be silenced by me.`,
				"No, the guild's owner cannot be silenced.",
				'This action can be optionally timed to create a temporary voice mute.'
			],
			examples: ['@Pete', '@Pete Singing too loud', '@Pete 24h Literally sang ear rape'],
			multiline: true
		},
		commandVoiceKickDescription: 'Hit somebody with the 👢 for singing so bad and loud.',
		commandVoiceKickExtended: {
			extendedHelp: [
				`This command requires the permissions **${this.PERMISSIONS.MANAGE_CHANNELS}** to create a temporary (hidden) voice channel, and **${this.PERMISSIONS.MOVE_MEMBERS}** to move the user to the temporary channel.`,
				'After this, the channel is quickly deleted, making the user leave the voice channel.',
				'For scared moderators, this command has almost no impact in the average user, as the channel is created in a way only me and the selected user can see and join, then quickly deleted.'
			],
			examples: ['@Pete', '@Pete Spamming all channels'],
			multiline: true
		},
		commandVunmuteDescription: "Get somebody's microphone back so they can talk.",
		commandVunmuteExtended: {
			extendedHelp: [
				`This command requires **${this.PERMISSIONS.MUTE_MEMBERS}**, and only members with lower role hierarchy position can be un-silenced by me.`,
				"No, the guild's owner cannot be un-silenced."
			],
			examples: ['@Pete', '@Pete Appealed his times signing hear rape.'],
			multiline: true
		},
		commandWarnDescription: 'File a warning to somebody.',
		commandWarnExtended: {
			extendedHelp: [
				'This command files a warning to a user.',
				"This kind of warning is meant to be **formal warnings**, as they will be shown in the 'warnings' command.",
				'It is a good practise to do an informal warning before using this command.'
			],
			examples: ['@Pete Attempted to mention everyone.'],
			multiline: true
		},

		/**
		 * ##################
		 * POKÉMON COMMANDS
		 */
		commandAbilityDescription: 'Obtiene datos de cualquier habilidad Pokémon dada usando mi conjunto de datos Pokémon.',
		commandAbilityExtended: {
			extendedHelp: 'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
			explainedUsage: [['habilidad', 'La capacidad para la que desea encontrar datos']],
			examples: ['multiscale', 'pressure']
		},
		commandAbilityEmbedTitles: {
			authorTitle: 'Habilidad',
			fieldEffectTitle: 'Efecto fuera de la batalla'
		},
		commandAbilityQueryFail: ({ ability }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${ability}\` es realmente una habilidad en Pokémon?`,
		commandFlavorsDescription: 'Obtiene las entradas de dex en varios juegos para un Pokémon.',
		commandFlavorsExtended: {
			extendedHelp: [
				'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
				'Puede proporcionar una bandera de `--shiny` para obtener el sprite brillante.'
			],
			explainedUsage: [['pokemon', 'El Pokémon para el que quieres obtener textos de sabor.']],
			examples: ['dragonite', 'pikachu', 'pikachu --shiny'],
			multiline: true
		},
		commandFlavorsQueryFail: ({ pokemon }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${pokemon}\` es en realidad un Pokémon?`,
		commandItemDescription: 'Obtiene datos para cualquier elemento Pokémon usando mi conjunto de datos Pokémon.',
		commandItemExtended: {
			extendedHelp: 'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
			explainedUsage: [['ítem', 'El elemento para el que desea buscar datos']],
			examples: ['life orb', 'choice specs']
		},
		commandItemEmbedData: ({ availableInGen8 }) => ({
			ITEM: 'Ítem',
			generationIntroduced: 'Generación introducida',
			availableInGeneration8Title: 'Disponible en la generación 8',
			availableInGeneration8Data: availableInGen8
		}),
		commandItemQueryFail: ({ item }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${item}\` es realmente un elemento en Pokémon?`,
		commandLearnDescription: 'Recupera si un Pokémon dado puede aprender uno o más movimientos dados usando mi conjunto de datos Pokémon.',
		commandLearnExtended: {
			extendedHelp: [
				'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
				'Los movimientos se dividen en cada `, ` (coma y espacio) y puedes proporcionar tantos movimientos como desee.',
				'Puede proporcionar una bandera de `--shiny` para obtener el sprite brillante.'
			],
			explainedUsage: [
				['generation', '(Opcional), la generación para la cual verificar los datos'],
				['pokemon', 'El Pokémon cuyo conjunto de aprendizaje quieres comprobar'],
				['movimiento', 'Los movimientos que desea verificar']
			],
			examples: ['7 dragonite dragon dance', 'pikachu thunder bolt', 'pikachu thunder bolt --shiny', 'pikachu thunder bolt, thunder'],
			multiline: true
		},
		commandLearnMethodTypes: ({ level }) => ({
			levelUpMoves: `por subir de nivel en el nivel ${level}`,
			eventMoves: 'a través de un evento',
			tutorMoves: 'de un tutor de movimiento',
			eggMoves: 'como un movimiento de huevo',
			virtualTransferMoves: 'al transfiriendo desde juegos de consola virtual',
			tmMoves: 'utilizando un Máquina Técnico o Disco Técnico',
			dreamworldMoves: 'a través de una captura de Pokémon Dream World'
		}),
		commandLearnInvalidGeneration: ({ generation }) => `Lo siento, pero ${generation} no es una Generación Pokémon admitida`,
		commandLearnMethod: ({ generation, pokemon, move, method }) =>
			`En la generacion ${generation} ${pokemon} __**puede**__ aprender **${move}** ${method}`,
		commandLearnQueryFailed: ({ pokemon, moves }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${toTitleCase(
				pokemon
			)}\` es en realidad un Pokémon y ${moves} son realmente movimientos?`,
		commandLearnCannotLearn: ({ pokemon, moves }) => `Parece que ${toTitleCase(pokemon)} no puede aprender ${moves}`,
		commandLearnTitle: ({ pokemon, generation }) => `Datos de Learnset para ${toTitleCase(pokemon)} en la generación ${generation}`,
		commandMoveDescription: 'Obtiene datos para cualquier movimiento Pokémon usando mi conjunto de datos Pokémon',
		commandMoveExtended: {
			extendedHelp: 'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
			explainedUsage: [['movimiento', 'El movimiento para el que desea buscar datos']],
			examples: ['dragon dance', 'GMax Wildfire', 'Genesis Supernova'],
			reminder: [
				'Los Movimientos Z muestran la potencia para los movimientos en la Octava Generación ya que son calculados con una tabla de conversión.',
				'Si Pokémon añade los Movimientos Z al juego, éstos serían sus niveles de poder teóricos. Sin embargo,',
				'al día de escritura, los Movimientos Z NO están disponibles en la Octava Generación.'
			],
			multiline: true
		},
		commandMoveEmbedData: ({ availableInGen8 }) => ({
			move: 'Movimiento',
			types: 'Tipo',
			basePower: 'Potencia',
			pp: 'PP',
			category: 'Categoría',
			accuracy: 'Precisión',
			priority: 'Movimiento con prioridad',
			target: 'Objetivo',
			contestCondition: 'Cualidad',
			zCrystal: 'Cristal Z',
			gmaxPokemon: 'Gigamax Pokémon',
			availableInGeneration8Title: 'Disponible en la generación 8',
			availableInGeneration8Data: availableInGen8,
			none: 'Ninguno',
			maxMovePower: 'Potencia base como Movimiento Dinamax (Dinamax)',
			zMovePower: 'Potencia base como Movimiento Z (Cristal Z)',
			fieldMoveEffectTitle: 'Efecto fuera de la batalla'
		}),
		commandMoveQueryFail: ({ move }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${move}\` es realmente un movimiento en Pokémon?`,
		commandPokedexDescription: 'Obtiene datos de cualquier Pokémon usando mi conjunto de datos Pokémon.',
		commandPokedexExtended: {
			extendedHelp: [
				'Utiliza una búsqueda difusa para comparar también con coincidencias cercanas.',
				'Puede proporcionar una bandera de `--shiny` para obtener el sprite brillante.'
			],
			explainedUsage: [['Pokémon', 'El Pokémon para el que quieres encontrar datos']],
			examples: ['dragonite', 'pikachu'],
			reminder: [
				'Si hay algún "Otro (s) formulario (s)" en la cuarta página opcional, también se pueden solicitar.',
				'Las formas cosméticas en esa página enumeran cambios puramente cosméticos y estos no tienen entradas separadas en la Pokédex.'
			],
			multiline: true
		},
		commandPokedexEmbedData: ({ otherFormes, cosmeticFormes }) => ({
			types: 'Tipo(s)',
			abilities: 'Habilidades',
			genderRatio: 'Relación de género',
			smogonTier: 'Smogon Tier',
			uknownSmogonTier: 'Forma desconocida / alternativa',
			height: 'Altura',
			weight: 'Peso',
			eggGroups: 'Grupo (s) de huevo',
			evolutionaryLine: 'Línea evolutiva',
			baseStats: 'Puntos de base',
			baseStatsTotal: 'TDPB',
			flavourText: 'Entrada de Pokédex',
			otherFormesTitle: 'Otras formas',
			cosmeticFormesTitle: 'Formas cosméticas',
			otherFormesList: this.list(otherFormes, 'y'),
			cosmeticFormesList: this.list(cosmeticFormes, 'y')
		}),
		commandPokedexQueryFail: ({ pokemon }) =>
			`Lo siento, pero esa consulta falló. ¿Estás seguro de que \`${pokemon}\` es en realidad un Pokémon?`,
		commandTypeDescription: 'Da los emparejamientos de tipos para uno o dos tipos de Pokémon.',
		commandTypeExtended: {
			extendedHelp: 'Los tipos deben ser coincidencias exactas con los tipos de pokemon (se pueden ignorar mayúsculas / minúsculas)',
			explainedUsage: [['tipo', 'El tipo(s) para buscar']],
			examples: ['dragon', 'fire flying']
		},
		commandTypeEmbedData: ({ types }) => ({
			offensive: 'Ofensivo',
			defensive: 'Defensivo',
			superEffectiveAgainst: 'Súper efectivo contra',
			dealsNormalDamageTo: 'Inflige daño normal a',
			doesNotAffect: 'No afecta',
			notVeryEffectiveAgainst: 'No muy efectivo contra',
			vulnerableTo: 'Vulnerable a',
			takesNormalDamageFrom: 'Toma daño normal de',
			resists: 'Resiste',
			notAffectedBy: 'No afectado por',
			typeEffectivenessFor: `Tipo de efectividad para ${this.list(types, 'y')}`
		}),
		commandTypeTooManyTypes: 'Lo siento, pero puedes obtener el emparejamiento para 2 tipos como máximo',
		commandTypeNotAType: ({ type }) => `${type} no es un tipo de Pokémon válido`,
		commandTypeQueryFail: ({ types }) => `Lo siento, pero esa consulta falló. ¿Estás seguro de que los ${types} son realmente tipos en Pokémon?`,

		/**
		 * ###############
		 * SOCIAL COMMANDS
		 */

		commandSocialDescription: "Configure this guild's member points.",
		commandSocialExtended: {
			extendedHelp: "This command allows for updating other members' points.",
			explainedUsage: [
				['set <user> <amount>', 'Sets an amount of points to the user.'],
				['add <user> <amount>', 'Adds an amount of points to the user.'],
				['remove <user> <amount>', 'Removes an amount of points from the user.'],
				['reset <user>', 'Resets all pointss from the user.']
			],
			examples: ['set @kyra 40000', 'add @kyra 2400', 'remove @kyra 3000', 'reset @kyra']
		},
		commandBannerDescription: 'Configure the banner for your profile.',
		commandBannerExtended: {
			extendedHelp: 'Banners are vertical in Skyra, they decorate your profile card.',
			explainedUsage: [
				['list', '(Default) Lists all available banners.'],
				['reset', 'Set your displayed banner to default.'],
				['buy <bannerID>', 'Buy a banner, must be an ID.'],
				['set <bannerID>', 'Set your displayed banner, must be an ID.']
			],
			examples: ['list', 'buy 0w1p06', 'set 0w1p06', 'reset']
		},
		commandToggleDarkModeDescription: 'Toggle between light and dark templates for your profile and rank cards.',
		commandToggleDarkModeExtended: {
			extendedHelp: 'This command lets you toggle the template used to generate your profile.'
		},

		commandAutoRoleDescription: 'List or configure the autoroles for a guild.',
		commandAutoRoleExtended: {
			extendedHelp: [
				'Autoroles are roles that are available for everyone, and automatically given when they reach a configured',
				'amount of (local) points, an administrator must configure them through a setting command.',
				"Note that if the role name has spaces in the name you need to put `'quotes'` around the name!"
			],
			explainedUsage: [
				['list', 'Lists all the current autoroles.'],
				['add <role> <amount>', 'Add a new autorole.'],
				['remove <role>', 'Remove an autorole from the list.'],
				['update <role> <amount>', 'Change the required amount of points for an existing autorole.']
			],
			reminder: 'The current system grants a random amount of points between 4 and 8 points, for each post with a 1 minute cooldown.',
			examples: ['list', "add 'Trusted Member' 20000", "update 'Trusted Member' 15000", "remove 'Trusted Member'"],
			multiline: true
		},

		commandBalanceDescription: 'Check your current balance.',
		commandBalanceExtended: {
			extendedHelp: `The balance command retrieves your amount of ${SHINY}.`
		},
		commandDailyDescription: `Get your semi-daily ${SHINY}'s.`,
		commandDailyExtended: {
			extendedHelp: 'Shiiiiny!',
			reminder: [
				'Skyra uses a virtual currency called Shiny, and it is used to buy stuff such as banners or bet it on slotmachines.',
				'You can claim dailies once every 12 hours.',
				"If you use the --reminder flag, I will remind you when it's time to collect dailies again."
			],
			multiline: true
		},
		commandLeaderboardDescription: 'Check the leaderboards.',
		commandLeaderboardExtended: {
			extendedHelp: [
				'The leaderboard command shows a list of users sorted by their local or global amount of points, by default, when using no arguments, it will show the local leaderboard.',
				'The leaderboards refresh every 10 minutes.'
			],
			reminder: '"Local" leaderboards refer to the guild\'s top list. "Global" refers to all scores from all guilds.',
			multiline: true
		},
		commandLevelDescription: 'Check your global level.',
		commandLevelExtended: {
			extendedHelp: 'How much until the next level?',
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]]
		},
		commandDivorceDescription: 'Break up with your couple!',
		commandDivorceExtended: {
			extendedHelp:
				'Sniff... This command is used to break up with your couple, hopefully in this virtual world, you are allowed to marry the user again.'
		},
		commandMarryDescription: 'Marry somebody!',
		commandMarryExtended: {
			extendedHelp: 'Marry your waifu!',
			explainedUsage: [['user', '(Optional) The user to marry with. If not given, the command will tell you who are you married with.']],
			examples: ['', '@love']
		},
		commandMarriedDescription: 'Check who you are married with.',
		commandMarriedExtended: {
			extendedHelp: 'This command will tell you who are you married with.'
		},
		commandMylevelDescription: 'Check your local level.',
		commandMylevelExtended: {
			extendedHelp: 'How much until next auto role? How many points do I have in this guild?',
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]]
		},
		commandPayDescription: `Pay somebody with your ${SHINY}'s.`,
		commandPayExtended: {
			extendedHelp: 'Businessmen! Today is payday!',
			explainedUsage: [
				['money', `Amount of ${SHINY} to pay, you must have the amount you are going to pay.`],
				['user', 'The targeted user to pay. (Must be mention/id)']
			],
			examples: ['200 @kyra']
		},
		commandProfileDescription: 'Check your user profile.',
		commandProfileExtended: {
			extendedHelp: [
				'This command sends a card image with some of your user profile such as your global rank, experience...',
				"Additionally, you are able to customize your colours with the 'setColor' command."
			],
			explainedUsage: [['user', "(Optional) The user's profile to show. Defaults to the message's author!."]],
			multiline: true
		},
		commandRemindmeDescription: 'Manage your reminders.',
		commandRemindmeExtended: {
			extendedHelp: 'This command allows you to set, delete and list reminders.',
			explainedUsage: [
				['action', 'The action, one of "list", "show", "delete", or "create"/"me". Defaults to "list".'],
				['idOrDuration', 'Dependent of action; "list" → ignored; "delete"/"show" → reminder ID; else → duration.'],
				['description', '(Optional) Dependent of action, this is only read when creating a new reminder.']
			],
			examples: ['me 6h to fix this command.', 'list', 'show jedbcuywb', 'delete jedbcuywb']
		},
		commandReputationDescription: 'Give somebody a reputation point.',
		commandReputationExtended: {
			extendedHelp: [
				"This guy is so helpful... I'll give him a reputation point!",
				"Additionally, you can check how many reputation points a user has by writing 'check' before the mention."
			],
			explainedUsage: [
				['check', '(Optional) Whether you want to check somebody (or yours) amount of reputation.'],
				['user', 'The user to give a reputation point.']
			],
			reminder: 'You can give a reputation point once every 24 hours.',
			examples: ['check @kyra', 'check', '@kyra', 'check "User With Spaces"', '"User With Spaces"'],
			multiline: true
		},
		commandSetColorDescription: "Change your user profile's color.",
		commandSetColorExtended: {
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

		commandStarDescription: 'Get a random starred message from the database or the star leaderboard.',
		commandStarExtended: {
			extendedHelp: 'This command shows a random starred message or the starboard usage and leaderboard for this server.'
		},

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		commandDmDescription: 'Sends a Direct Message.',
		commandDmExtended: {
			extendedHelp: `The DM command is reserved for bot owners, and it's only used for very certain purposes, such as replying feedback messages sent by users.`,
			reminder: 'Reserved for bot owners for replying purposes.'
		},
		commandEvalDescription: 'Evaluates arbitrary Javascript.',
		commandEvalExtended: {
			extendedHelp: [
				'The eval command evaluates code as-in, any error thrown from it will be handled.',
				'It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.',
				'The --wait flag changes the time the eval will run. Defaults to 10 seconds. Accepts time in milliseconds.',
				"The --output and --output-to flag accept either 'file', 'log', 'haste' or 'hastebin'.",
				'The --delete flag makes the command delete the message that executed the message after evaluation.',
				'The --silent flag will make it output nothing.',
				"The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.",
				'The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword',
				'The --showHidden flag will enable the showHidden option in util.inspect.',
				'The --lang and --language flags allow different syntax highlight for the output.',
				'The --json flag converts the output to json',
				'The --no-timeout flag disables the timeout',
				`If the output is too large, it'll send the output as a file, or in the console if the bot does not have the ${this.PERMISSIONS.ATTACH_FILES} permission.`
			],
			examples: ['msg.author!.username;', '1 + 1;'],
			reminder: 'Reserved for bot owners.',
			multiline: true
		},
		commandExecDescription: 'Execute Order 66.',
		commandExecExtended: {
			extendedHelp: 'You better not know about this.'
		},
		commandSetAvatarDescription: "Set Skyra's avatar.",
		commandSetAvatarExtended: {
			extendedHelp: "This command changes Skyra's avatar. You can send a URL or upload an image attachment to the channel.",
			reminder: 'Reserved for bot owners.'
		},
		commandDonateDescription: 'Get information about how to donate to keep Skyra alive longer.',
		commandDonateExtended: {
			extendedHelp: [
				'Skyra Project started on 24th October 2016, if you are reading this, you are',
				`using version ${VERSION}. The development team improves a lot in every iteration of Skyra.`,
				'',
				'However, not everything is free and we need your help to keep Skyra alive.',
				'We will be very thankful if you help us.',
				'We have been working on a lot of things, and Skyra is precious to us. Take care of her ❤',
				'',
				'Do you want to support this amazing project? Feel free to do so! https://donate.skyra.pw/patreon or https://donate.skyra.pw/kofi'
			],
			multiline: true
		},
		commandEchoDescription: 'Make Skyra send a message to this (or another) channel.',
		commandEchoExtended: {
			extendedHelp: 'This should be very obvious...',
			reminder: 'Reserved for bot owners.'
		},
		commandFeedbackDescription: "Send a feedback message to the bot's owner.",
		commandFeedbackExtended: {
			extendedHelp: `This command sends a message to a feedback channel which the bot's owners can read. You'll get a reply from me in your DMs when one of the owners has an update for you.`
		},
		commandStatsDescription: 'Provides some details about the bot and stats.',
		commandStatsExtended: {
			extendedHelp: 'This should be very obvious...'
		},

		/**
		 * ##############
		 * TOOLS COMMANDS
		 */

		commandAvatarDescription: "View somebody's avatar in full size.",
		commandAvatarExtended: {
			extendedHelp: "As this command's name says, it shows somebody's avatar.",
			explainedUsage: [['user', '(Optional) A user mention. Defaults to the author if the input is invalid or not given.']],
			reminder: "Use the --size flag to change the avatar's size."
		},
		commandColorDescription: 'Display some awesome colours.',
		commandColorExtended: {
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
		commandContentDescription: 'Obtener el contenido sin formato de los mensajes.',
		commandContentExtended: {
			extendedHelp: 'Raw content will help you better copy-paste message content as you will not have to reproduce all the formatting',
			explainedUsage: [
				['channel', '(optional) The channel in which the message is to get the content from'],
				['message', 'ID of the message to get the raw content for']
			]
		},
		commandEmojiDescription: 'Obtén información sobre un emoji.',
		commandEmojiExtended: {
			extendedHelp: "I'll give you the emoji name, whether it is a custom emoji or not, the emoji ID and a large image preview of the emoji.",
			explainedUsage: [['emoji', 'The emoji to get information about']],
			reminder: "It doesn't matter whether I share a server with a custom emoji or not!"
		},
		commandEmotesDescription: 'Muestra todos los gestos personalizados disponibles en este servidor.',
		commandEmotesExtended: {
			extendedHelp: 'La lista de emotes se divide por 50 emotes..'
		},
		commandEmotesTitle: 'Emotes en',
		commandPriceDescription: 'Convert the currency with this tool.',
		commandPriceExtended: {
			extendedHelp: 'Convert between any two currencies, even if they are cryptocurrencies.',
			explainedUsage: [
				['from', 'The currency to convert from'],
				['to', 'The currency to convert to'],
				['amount', 'The amount to convert, will default to 1']
			],
			examples: ['EUR USD', 'USD EUR 5', 'USD BAT 10']
		},
		commandQuoteDescription: "Quote another person's message.",
		commandQuoteExtended: {
			extendedHelp: "Quotes also include the message's image, if any",
			explainedUsage: [
				['channel', '(optional) The channel in which the message is to quote'],
				['message', 'ID of the message to quote']
			]
		},
		commandRolesDescription: 'List, claim or unclaim public roles in this server.',
		commandRolesExtended: {
			extendedHelp: [
				'Public roles are roles that are available for everyone.',
				'An administrator must configure them with the configuration command.'
			],
			explainedUsage: [['roles', 'The list of roles to claim or unclaim. Leave this empty to get a list of available roles.']],
			reminder: [
				'When claiming or unclaiming roles you can provide a single or multiple role(s).',
				'To claim multiple roles, you must separate them by a comma, for example `red,green`.',
				'You can specify which roles you want by providing the role ID, name, or a sub-section of the name.',
				'',
				'Administrators can add public roles using `Skyra, conf set roles.public ExamplePublicRole`.'
			],
			examples: ['', 'Designer,Programmer', 'Designer'],
			multiline: true
		},
		commandDuckDuckGoDescription: 'Search the Internet with DuckDuckGo.',
		commandDuckDuckGoExtended: {
			extendedHelp: 'This uses the alternative search enginge DuckDuckGo to search the web',
			reminder: 'If you want to search google use `Skyra, google`'
		},
		commandPollDescription: 'Simplifies reaction-based polls.',
		commandPollExtended: {
			extendedHelp: 'Separate your options using commas.',
			examples: ['Make an anime channel, Make a gaming channel, Make a serious-discussion channel']
		},
		commandPollReactionLimit: "Please don't add emojis while I am reacting!",
		commandVoteDescription: 'Simplified reaction-based vote.',
		commandVoteExtended: {
			examples: ['Should I implement the #anime channel?']
		},
		commandTopInvitesDescription: 'Muestra las 10 invitaciones más utilizadas para este servidor.',
		commandTopInvitesExtended: {
			extendedHelp:
				'Use esto para obtener información sobre el servidor si su servidor no tiene acceso a la información sobre el servidor oficial de Discord.'
		},
		commandTopInvitesNoInvites: '¡No hay invitaciones, o ninguna de ellas ha sido utilizada!',
		commandTopInvitesTop10InvitesFor: ({ guild }) => `Las 10 mejores invitaciones para ${guild}`,
		commandTopInvitesEmbedData: {
			channel: 'Canal',
			link: 'Enlace',
			createdAt: 'Fecha de creacion',
			createdAtUnknown: 'Fecha de creación desconocida',
			expiresIn: 'Expira en',
			neverExpress: 'Nunca',
			temporary: 'Invitación temporal',
			uses: 'Usos'
		},
		commandUrbanDescription: 'Check the definition of a word on UrbanDictionary.',
		commandUrbanExtended: {
			extendedHelp: 'What does "spam" mean?',
			explainedUsage: [
				['Word', 'The word or phrase you want to get the definition from.'],
				['Page', 'Defaults to 1, the page you wish to read.']
			],
			examples: ['spam']
		},
		commandWhoisDescription: 'Who are you?',
		commandWhoisExtended: {
			extendedHelp: 'Gets information on any server member. Also known as `userinfo` in many other bots.'
		},
		commandFollowageDescription: 'Check how long a Twitch user has been following a channel.',
		commandFollowageExtended: {
			extendedHelp: 'Just... that.',
			examples: ['dallas cohhcarnage']
		},
		commandTwitchDescription: 'Check the information about a Twitch profile.',
		commandTwitchExtended: {
			extendedHelp: 'Really, just that.',
			examples: ['riotgames']
		},
		commandTwitchSubscriptionDescription: 'Manage the subscriptions for your server.',
		commandTwitchSubscriptionExtended: {
			extendedHelp: [
				'Manage the subscriptions for this server.',
				'__Online Notifications__',
				'For content, the best way is writing `--embed`, the notifications will then show up in MessageEmbeds with all available data.',
				'Alternatively you can set your own content and it will post as a regular message.',
				'This content can contain some parameters that will be replaced with Twitch data:',
				"- `%TITLE%` for the stream's title",
				'- `%VIEWER_COUNT%` for the amount of current viewers,',
				'- `%GAME_NAME%` for the title being streamed',
				"- `%GAME_ID%` for the game's ID as seen by Twitch",
				'- `%LANGUAGE%` for the language the stream is in',
				"- `%USER_ID%` for the streamer's ID as seen by Twitch",
				"- and `%USER_NAME%` for the Streamer's twitch username.",
				'',
				'__Offline Notifications__',
				"For offline events none of the variables above are available and you'll have to write your own content.",
				'You can still use the `--embed` flag for the notification to show in a nice Twitch-purple MessageEmbed.'
			],
			explainedUsage: [
				['streamer', 'The Twitch username of the streamer to get notifications for.'],
				['channel', 'A Discord channel where to post the notifications in.'],
				['status', `The status that the Twitch streamer should get for an notification, one of online or offline.`],
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
		commandWikipediaDescription: 'Search something through Wikipedia.',
		commandWikipediaExtended: {
			extendedHelp:
				'In NSFW channels I will also add the page image. This restriction is in place because Wikipedia has NSFW images for NSFW pages as they have to be accurate (i.e. diseases or human body parts).',
			reminder: 'Most Wikipedia page titles are case sensitive. Some celeberties will have lowercase redirects, but not many.'
		},
		commandYoutubeDescription: 'Search something through YouTube.',
		commandYoutubeExtended: {
			extendedHelp: `If I have the ${this.PERMISSIONS.MANAGE_MESSAGES} ${this.PERMISSIONS.ADD_REACTIONS} permissions then I will provide the option to navigate through the top 10 results.`
		},

		/**
		 * ################
		 * GOOGLE COMMANDS
		 */

		commandCurrentTimeDescription: 'Obtiene la hora actual en cualquier lugar del mundo',
		commandCurrentTimeExtended: {
			extendedHelp: [
				'Este comando usa Google Maps para obtener las coordenadas del lugar.',
				'Una vez que este comando obtuvo las coordenadas, consulta TimezoneDB para obtener los datos de tiempo'
			],
			explainedUsage: [['ubicación', 'La localidad, el gobierno, el país o el continente para consultar la hora.']],
			examples: ['Madrid', 'Barcelona'],
			multiline: true
		},
		commandCurrentTimeLocationNotFound: 'Lo siento, pero no pude encontrar datos de tiempo para esa ubicación.',
		commandCurrentTimeTitles: ({ dst }) => ({
			currentTime: 'Tiempo actual',
			currentDate: 'Fecha actual',
			country: 'País',
			gmsOffset: 'GMT Offset',
			dst: `**Horario de verano**: ${dst}`
		}),
		commandCurrentTimeDst: 'Observa el horario de verano en este momento',
		commandCurrentTimeNoDst: 'No observa el horario de verano en este momento',
		commandGsearchDescription: 'Encuentra tus cosas favoritas en Google',
		commandGsearchExtended: {
			extendedHelp: `Este comando consulta el poderoso motor de búsqueda de Google para encontrar sitios web para su consulta. Para imágenes, utilice el comando \`gimage\`.`,
			explainedUsage: [['consulta', 'Lo que quieres encontrar en Google']],
			examples: ['Discord', 'Skyra']
		},
		commandGimageDescription: 'Encuentra tus imágenes favoritas en Google',
		commandGimageExtended: {
			extendedHelp: `Este comando consulta el poderoso motor de búsqueda de Google para encontrar imágenes para su consulta. Para obtener resultados web regulares, utilice el comando \`gsearch\`.`,
			explainedUsage: [['consulta', 'La imagen que quieres encontrar en Google']],
			examples: ['Discord', 'Skyra'],
			reminder:
				'Este comando se ha marcado como NSFW porque es inevitable que cuando consulta contenido explícito, obtendrá resultados explícitos.'
		},
		commandLmgtfyDescription: 'Moleste a otro usuario enviándole un enlace LMGTFY (Permítame Google eso para usted).',
		commandLmgtfyExtended: {
			explainedUsage: [['query', 'La consulta a google']]
		},
		commandWeatherDescription: 'Check the weather status in a location.',
		commandWeatherExtended: {
			extendedHelp: [
				'Este comando usa Google Maps para obtener las coordenadas del lugar.',
				'Una vez que este comando obtuvo las coordenadas, consulta a DarkSky para recuperar información sobre el clima.'
			],
			explainedUsage: [['ciudad', 'La localidad, el gobierno, el país o el continente para consultar la hora.']],
			examples: ['Madrid', 'Barcelona'],
			reminder:
				'La temperatura está en ** Celsius ** de forma predeterminada. Use la bandera --imperial o --fahrenheit para verla en ** Fahrenheit **.',
			multiline: true
		},
		googleErrorZeroResults: 'La aplicación no devolvió resultados.',
		googleErrorRequestDenied: 'La aplicación GeoCode ha rechazado su solicitud.',
		googleErrorInvalidRequest: 'Solicitud incorrecta.',
		googleErrorOverQueryLimit: 'Límite de solicitudes excedida, prueba de nuevo mañana.',
		googleErrorUnknown: 'Lo siento, pero no pude obtener un resultado de Google.',

		/**
		 * #############
		 * WEEB COMMANDS
		 */

		commandWblushDescription: 'Blush with a weeb picture!',
		commandWblushExtended: {
			extendedHelp: 'Blush with a random weeb image!'
		},
		commandWcryDescription: 'Cry to somebody with a weeb picture!',
		commandWcryExtended: {
			extendedHelp: 'Cry with a random weeb image!',
			explainedUsage: [['user', 'The user to cry to.']],
			examples: ['@Skyra']
		},
		commandWcuddleDescription: 'Cuddle somebody with a weeb picture!',
		commandWcuddleExtended: {
			extendedHelp: 'Unlike the original cuddle command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to cuddle with.']],
			examples: ['@Skyra']
		},
		commandWdanceDescription: 'Dance with a weeb picture!',
		commandWdanceExtended: {
			extendedHelp: 'Dance with a random weeb image!'
		},
		commandWhugDescription: 'Hug somebody with a weeb picture!',
		commandWhugExtended: {
			extendedHelp: 'Unlike the original hug command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to give the hug.']],
			examples: ['@Skyra']
		},
		commandWkissDescription: 'Kiss somebody with a weeb picture!',
		commandWkissExtended: {
			extendedHelp: 'Kiss somebody with a random weeb image!',
			explainedUsage: [['user', 'The user to give the kiss to.']],
			examples: ['@Skyra']
		},
		commandWlickDescription: 'Lick somebody with a weeb picture!',
		commandWlickExtended: {
			extendedHelp: 'Lick somebody with a random weeb image!',
			explainedUsage: [['user', 'The user to lick.']],
			examples: ['@Skyra']
		},
		commandWnomDescription: 'Nom nom with a 🍞!',
		commandWnomExtended: {
			extendedHelp: "Nom nom nom! Wha~... I'm busy eating!"
		},
		commandWnekoDescription: 'Human kittens!',
		commandWnekoExtended: {
			extendedHelp: `Unlike the original kitten command, this one displays random weeb images, the difference is that they're weebs... and humans, enjoy!`
		},
		commandWpatDescription: "Pats somebody's head!",
		commandWpatExtended: {
			extendedHelp: "Pat somebody's head with a random weeb image!",
			explainedUsage: [['user', 'The user to pat with.']],
			examples: ['@Skyra']
		},
		commandWpoutDescription: 'I feel somebody... mad',
		commandWpoutExtended: {
			extendedHelp: 'Show your expression with a random weeb image!'
		},
		commandWslapDescription: 'Slap somebody with a weeb picture!',
		commandWslapExtended: {
			extendedHelp: 'Unlike the original slap command, this one displays random weeb images, enjoy!',
			explainedUsage: [['user', 'The user to slap.']],
			examples: ['@Pete']
		},
		commandWsmugDescription: 'Smug',
		commandWsmugExtended: {
			extendedHelp: 'Just an anime smug face!'
		},
		commandWstareDescription: '*Stares*',
		commandWstareExtended: {
			extendedHelp: '*Still stares at you*',
			explainedUsage: [['user', 'The user to stare at.']],
			examples: ['@Pete']
		},
		commandWtickleDescription: 'Give tickles to somebody with a weeb picture!',
		commandWtickleExtended: {
			extendedHelp: 'Tickle somebody!',
			explainedUsage: [['user', 'The user to tickle.']],
			examples: ['@Skyra']
		},
		commandWeebUnavailableError: 'I am sorry, but the source of all my weeb images is not available at the moment. Please try again later!',
		commandWeebUnexpectedError: 'Weird! I encountered an error I should have never received!',
		commandWbangDescription: 'Bang 💥🔫!',
		commandWbangExtended: {
			extendedHelp: 'Shoot a user with a random weeb image!',
			explainedUsage: [['user', 'The user to shoot.']],
			examples: ['@Skyra']
		},
		commandWbangheadDescription: "STAHP! I'm banging my head here!",
		commandWbangheadExtended: {
			extendedHelp: 'Bang your head with a random weeb image!'
		},
		commandWbiteDescription: '*nom nom* you are delicious!',
		commandWbiteExtended: {
			extendedHelp: 'Bite a user with a random weeb image!',
			explainedUsage: [['user', 'The user to bite.']],
			examples: ['@Skyra']
		},
		commandWgreetDescription: 'Say hi! to another user',
		commandWgreetExtended: {
			extendedHelp: 'Greet a user with a random weeb image!',
			explainedUsage: [['user', 'The user to greet.']],
			examples: ['@Skyra']
		},
		commandWlewdDescription: 'Lewds! Lewds! Lewds!',
		commandWlewdExtended: {
			extendedHelp: 'Random lewd weeb image!'
		},
		commandWpunchDescription: '*pow* 👊👊',
		commandWpunchExtended: {
			extendedHelp: 'Punch that annoying user with a random weeb image!',
			explainedUsage: [['user', 'The user to punch.']],
			examples: ['@Skyra']
		},
		commandWsleepyDescription: "I'm so sleeeeepy... *yawn*",
		commandWsleepyExtended: {
			extendedHelp: 'Show how sleepy you are with a random weeb image!'
		},
		commandWsmileDescription: "Huh, because I'm happy. Clap along if you feel like a room without a roof",
		commandWsmileExtended: {
			extendedHelp: 'Show just how happy you are with a random weeb image!'
		},
		commandWthumbsupDescription: 'Raise your thumb into the air in a magnificent show of approval',
		commandWthumbsupExtended: {
			extendedHelp: 'Raise your thumb with a random weeb image!'
		},

		/**
		 * ##############
		 * ANIME COMMANDS
		 */

		commandAnimeTypes: {
			tv: '📺 TV',
			movie: '🎥 Película',
			ova: '📼 Animación de Vídeo Original',
			special: '🎴 Especial'
		},
		commandAnimeInvalidChoice: '¡Esa opción no es válida! Selecciona otra opción, por favor.',
		commandAnimeOutputDescription: ({ englishTitle, japaneseTitle, canonicalTitle, synopsis }) =>
			`**Título inglés:** ${englishTitle}\n**Título japonés:** ${japaneseTitle}\n**Título canónico:** ${canonicalTitle}\n${synopsis}`,
		commandAnimeNoSynopsis: 'No hay sinopsis disponible para este título.',
		commandAnimeEmbedData: {
			type: 'Tipo',
			score: 'Puntuación',
			episodes: 'Episodio(s)',
			episodeLength: 'Duración del episodio',
			ageRating: 'Clasificación de edad',
			firstAirDate: 'Primera fecha de emisión',
			watchIt: 'Míralo Aquí:',
			stillAiring: 'Aún se transmite'
		},
		commandMangaOutputDescription: ({ englishTitle, japaneseTitle, canonicalTitle, synopsis }) =>
			`**Título inglés:** ${englishTitle}\n**Título japonés:** ${japaneseTitle}\n**Título canónico:** ${canonicalTitle}\n${synopsis}`,
		commandMangaTypes: {
			manga: '📘 Manga',
			novel: '📕 Novela',
			manhwa: '🇰🇷 Manhwa',
			oneShot: '☄ Cameo',
			special: '🎴 Especial'
		},
		commandMangaEmbedData: {
			ageRating: 'Clasificación de edad',
			firstPublishDate: 'Primera fecha de publicación',
			readIt: 'Léelo Aquí:',
			score: 'Puntuación',
			type: 'Tipo',
			none: 'Ninguno'
		},
		commandWaifuFooter: 'Imagen por thiswaifudoesnotexist.net',

		/**
		 * #####################
		 * ANNOUNCEMENT COMMANDS
		 */

		commandSubscribeNoRole: 'Este servidor no configuró el rol para los anuncios.',
		commandSubscribeSuccess: ({ role }) => `Concedido con éxito el rol: **${role}**`,
		commandUnsubscribeSuccess: ({ role }) => `Removido con éxito el rol: **${role}***`,
		commandSubscribeNoChannel: 'Este servidor no tiene un canal de anuncios configurado.',
		commandAnnouncement: ({ role }) => `**Nuevo anuncio para** ${role}`,
		commandAnnouncementSuccess: 'Se ha publicado un nuevo anuncio con éxito.',
		commandAnnouncementCancelled: 'Se ha cancelado el anuncio con éxito.',
		commandAnnouncementPrompt: 'Éste es el contenido que será mandado al canal de anuncios. ¿Quiere enviarlo ahora?',
		commandAnnouncementEmbedMentions: ({ header }) => `${header}:`,
		commandAnnouncementEmbedMentionsWithMentions: ({ header, mentions }) => `${header}, y mencionando a: ${mentions}:`,

		/**
		 * ################
		 * GENERAL COMMANDS
		 */

		commandInviteDescription: 'Muestra el enlace para invitarme.',
		commandInviteExtended: {
			extendedHelp:
				'Si desea obtener un enlace donde Skyra no solicitará ningún permiso, agregue `noperms`, `--noperms` o `--nopermissions` al comando.',
			examples: ['', 'noperms', '--noperms', '--nopermissions']
		},
		commandInvitePermissionInviteText: 'Invita a Skyra a tu servidor',
		commandInvitePermissionSupportServerText: 'Únase al servidor de soporte',
		commandInvitePermissionsDescription:
			'No tengas miedo de quitar algunos permisos, Skyra te hará saber si estás intentando ejecutar un comando sin los permisos requeridos.',
		commandInfoBody: [
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
		],
		commandHelpData: ({ titleDescription, usage, extendedHelp, footerName }) => ({
			title: `${titleDescription}`,
			usage: `📝 | ***Uso del Comando***\n\`${usage}\`\n`,
			extended: `🔍 | ***Descripción Extendida***\n${extendedHelp}`,
			footer: `Ayuda de comando para ${footerName}`
		}),
		commandSupportEmbedTitle: ({ username }) => `¿Necesita ayuda, ${username}?`,
		commandSupportEmbedDescription:
			"¡Entonces deberías unirte a [Skyra's lounge](https://join.skyra.pw)! Allí, puede recibir ayuda de los desarrolladores y otros miembros de la comunidad.",

		/**
		 * #####################
		 * DEVELOPERS COMMANDS
		 */

		commandYarnDescription: 'Responde con información sobre un paquete NodeJS utilizando el registro del paquete Yarn.',
		commandYarnExtended: {
			extendedHelp: `Esto es para los desarrolladores de NodeJS que desean encontrar rápidamente información sobre un paquete publicado en npm [npm](https://npmjs.com)`,
			explainedUsage: [['package', 'El nombre del paquete a buscar debe ser una coincidencia exacta']],
			examples: ['@skyra/char', '@skyra/saelem', '@skyra/eslint-config']
		},
		commandYarnNoPackage: `${REDCROSS} Lo siento, pero tienes que darme el nombre de un paquete para buscarlo.`,
		commandYarnUnpublishedPackage: ({ pkg }) => `¡Qué desarrollador tan tonto que hizo \`${pkg}\`! ¡No lo publicaron!`,
		commandYarnPackageNotFound: ({ pkg }) => `Lo siento, pero no pude encontrar ningún paquete con el nombre de \`${pkg}\` en el registro.`,
		commandYarnEmbedDescriptionAuthor: ({ author }) => `❯ Autor: ${author}`,
		commandYarnEmbedDescriptionMaintainers: `❯ Mantenedores: `,
		commandYarnEmbedDescriptionLatestVersion: ({ latestVersionNumber }) => `❯ Ultima versión: **${latestVersionNumber}**`,
		commandYarnEmbedDescriptionLicense: ({ license }) => `❯ Licencia: **${license}**`,
		commandYarnEmbedDescriptionMainFile: ({ mainFile }) => `❯ Archivo principal: **${mainFile}**`,
		commandYarnEmbedDescriptionDateCreated: ({ dateCreated }) => `❯ Fecha de creacion: **${dateCreated}**`,
		commandYarnEmbedDescriptionDateModified: ({ dateModified }) => `❯ Fecha modificada: **${dateModified}**`,
		commandYarnEmbedDescriptionDeprecated: ({ deprecated }) => `❯ Aviso de desuso: **${deprecated}**`,
		commandYarnEmbedDescriptionDependenciesLabel: '__*Dependencias:*__',
		commandYarnEmbedDescriptionDependenciesNoDeps: `Sin dependencias ${GREENTICK}!`,
		commandYarnEmbedMoreText: 'más...',

		/**
		 * ##############
		 * FUN COMMANDS
		 */

		command8ballOutput: ({ author, question, response }) => `🎱 Pregunta por ${author}: *${question}*\n${response}`,
		command8ballQuestions: {
			When: '^¿?cu[áa]ndo',
			What: '^¿?qu[ée]',
			HowMuch: '^¿?cu[áa]nto',
			HowMany: '^¿?cu[áa]nto',
			Why: '^¿?por qu[ée]',
			Who: '^¿?qui[ée]n'
		},
		command8ballWhen: ['Pronto™', 'Quizá mañana.', 'Quizá el año que viene...', 'Ahora mismo.', 'En unos cuantos meses.'],
		command8ballWhat: ['Un avión.', '¿Qué? Pregunta de nuevo.', '¡Un regalo!', 'Nada.', 'Un anillo.', 'No lo sé, quizá sea algo.'],
		command8ballHowMuch: [
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
		],
		command8ballHowMany: [
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
		],
		command8ballWhy: [
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
		],
		command8ballWho: [
			'Un humano.',
			'Un robot.',
			'Un avión.',
			'Un pájaro.',
			'Una composición de carbono.',
			'Un puñado de zeros y unos.',
			'No tengo ni idea, ¿es material?',
			'Eso no es lógico.'
		],
		command8ballElse: [
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
		],

		commandCatfactTitle: 'Hecho Gatuno',
		commandChoiceOutput: ({ user, word }) => `🕺 *Pito, pito, gorgorito, ¿dónde vas tan bonito?...* ${user}, Elijo:${codeBlock('', word)}`,
		commandChoiceMissing: 'Por favor, escribe al menos dos opciones separadas con coma.',
		commandChoiceDuplicates: ({ words }) => `¿Por qué aceptaría palabras duplicadas? '${words}'.`,
		commandDiceOutput: ({ result }) => `¡Lanzaste el dado! Obteniste: **${result}**`,
		commandDiceRollsError: 'La cantidad de lanzamientos debe ser un número entre 1 y 1024.',
		commandDiceSidesError: 'La cantidad de lados debe ser un número entre 3 y 1024.',
		commandEscaperopeOutput: ({ user }) => `**${user}** usó **Cuerda Huída**`,
		commandLoveLess45: 'Prueba de nuevo la próxima vez...',
		commandLoveLess75: '¡Bastante bien!',
		commandLoveLess100: '¡Haríais una gran pareja!',
		commandLove100: '¡Emparejamiento perfecto!',
		commandLoveItself: 'Eres una criatura muy especial y deberías amarte a tí mismo más que a los demás <3',
		commandLoveResult: 'Resultado',
		commandMarkovTimer: ({ timer }) => `Processed in ${timer}.`,
		commandMarkovNoMessages: 'The channel or user has no messages.',
		commandNorrisOutput: 'Chuck Norris',
		commandRateOutput: ({ author, userToRate, rate, emoji }) => `**${author}**, Uhm... le daría a **${userToRate}** un **${rate}**/100 ${emoji}`,
		commandRateMyself: ['Me quiero a mí misma mucho 😊', 'yo'],
		commandRateOwners: ['Amo mucho a mis desarrolladores', 'mis desarrolladores'],
		commandPunError: 'Something went wrong. Try again later.',
		commandXkcdComics: ({ amount }) => `Hay ${amount} comics.`,
		commandXkcdNotfound:
			'He buscado en todos los rincones, pero no he tenido suerte encontrando este comic, ¡prueba más tarde o prueba con otro!',

		/**
		 * ##############
		 * GAMES COMMANDS
		 */

		commandGamesSkyra: 'I am sorry, I know you want to play with me, but if I do, I will not be able to help other people! 💔',
		commandGamesBot: 'I am sorry, but I do not think they would like to stop doing what they are doing and play with humans.',
		commandGamesSelf: 'You must be so sad to play against yourself. Try again with another user.',
		commandGamesProgress: 'I am sorry, but there is a game in progress in this channel, try again when it finishes.',
		commandGamesNoPlayers: ({ prefix }) =>
			`Por favor, especifique algunos homenajes para jugar a los Juegos del Hambre, así: \`${prefix}hg Bob, Mark, Jim, Kyra\``,
		commandGamesTooManyOrFew: ({ min, max }) => `I am sorry but the amount of players is less than ${min} or greater than ${max}.`,
		commandGamesRepeat: 'Lo siento, pero un usuario no puede jugar dos veces.',
		commandGamesPromptTimeout: 'I am sorry, but the challengee did not reply on time.',
		commandGamesPromptDeny: 'I am sorry, but the challengee refused to play.',
		commandGamesTimeout: '**The match concluded in a draw due to lack of a response (60 seconds)**',
		commandC4Prompt: ({ challenger, challengee }) =>
			`Dear ${challengee}, you have been challenged by ${challenger} in a Connect-Four match. Reply with **yes** to accept!`,
		commandC4Start: ({ player }) => `Let's play! Turn for: **${player}**.`,
		commandC4GameColumnFull: 'This column is full. Please try another. ',
		commandC4GameWin: ({ user }) => `${user} (red) won!`,
		commandC4GameWinTurn0: ({ user }) => `${user} (blue) won!`,
		commandC4GameDraw: 'This match concluded in a **draw**!',
		commandC4GameNext: ({ user }) => `Turn for: ${user} (red).`,
		commandC4GameNextTurn0: ({ user }) => `Turn for: ${user} (blue).`,
		commandC4Description: 'Play Connect-Four with somebody.',
		commandC4Extended: {
			extendedHelp: [
				'This game is best played on PC.',
				'Connect Four is a two-player connection game in which the players first choose a color and then take turns dropping colored discs from the top into a seven-column, six-row vertically suspended grid.'
			],
			multiline: true
		},
		commandCoinFlipDescription: '¡Lanza una moneda!',
		commandCoinFlipExtended: {
			extendedHelp: [
				'Lanza una moneda. Si adivina el lado que aparece, recupera su apuesta, duplicada.',
				'Si no lo haces, pierdes tu apuesta.',
				'También puede ejecutar un giro sin efectivo, que no cuesta nada, pero tampoco lo recompensa con nada.',
				'Ahora consigue esas monedas volteando.'
			],
			examples: ['heads 50', 'tails 200'],
			multiline: true
		},
		commandCoinFlipInvalidCoinname: ({ arg }) => `Disculpe, pero ${arg} no es una cara de moneda!`,
		commandCoinFlipCoinnames: ['Cabezas', 'Cruz'],
		commandCoinFlipWinTitle: '¡Ganaste!',
		commandCoinFlipLoseTitle: 'Perdiste.',
		commandCoinFlipNoguessTitle: 'Lanzaste una moneda.',
		commandCoinFlipWinDescription: ({ result }) => `La moneda fue lanzada y mostró ${result}. Lo entendiste bien!`,
		commandCoinFlipWinDescriptionWithWager: ({ result, wager }) =>
			`La moneda fue lanzada y mostró ${result}. Adivinaste correctamente y ganaste ${wager} ${SHINY}!`,
		commandCoinFlipLoseDescription: ({ result }) => `La moneda fue lanzada y mostró${result}. No adivinaste correctamente.`,
		commandCoinFlipLoseDescriptionWithWager: ({ result, wager }) =>
			`La moneda fue lanzada y mostró${result}. No adivinaste correctamente y perdido ${wager} ${SHINY}..`,
		commandCoinFlipNoguessDescription: ({ result }) => `La moneda fue lanzada y mostró ${result}.`,
		commandHigherLowerDescription: 'Comenzar un juego de Mayor/Menor',
		commandHigherLowerExtended: {
			extendedHelp: [
				'Mayor/Menor es un juego de suerte.',
				'Elegiré un número y tendrás que adivinar si el próximo número que elijo será **mayor** o **menor** que el actual, usando los ⬆ o ⬇ emojis.',
				'Sus ganancias aumentan a medida que avanza en las rondas, y puede retirar dinero en cualquier momento presionando el 💰 reacción emoji .',
				'¡Pero ten cuidado! ¡Cuanto más lejos vayas, más posibilidades tendrás de perderlo todo!'
			],
			multiline: true
		},
		commandHigherLowerLoading: `${LOADING} Comenzar un nuevo juego de Mayor/Meno`,
		commandHigherLowerNewround: 'Bien. Comenzando una nueva ronda',
		commandHigherLowerEmbed: ({ turn, number }) => ({
			title: `¿Mayor o menor? | Turno ${turn}`,
			description: `Su número es ${number}. ¿Será el siguiente mayor o menor?`,
			footer: 'El juego caducará en 3 minutos, ¡así que actúa rápido!'
		}),
		commandHigherLowerLose: ({ number, losses }) => ({
			title: '¡Perdiste!',
			description: `No lo entendiste del todo. El número era ${number}. Perdiste ${losses} ${SHINY}`,
			footer: '¡Mejor suerte la próxima vez!'
		}),
		commandHigherLowerWin: ({ potentials, number }) => ({
			title: '¡Ganaste!',
			description: `El número era ${number}. ¿Quieres continuar? Con otro intento, puedes ganar ${potentials} ${SHINY}`,
			footer: '¡Actúa rapido! No tienes mucho tiempo.'
		}),
		commandHigherLowerCancel: ({ username }) => ({
			title: 'Juego cancelado por elección',
			description: `Gracias por jugar, ¡${username}! Estaré aquí por si quieres continuar.`
		}),
		commandHigherLowerCashout: ({ amount }) => `${amount} ${SHINY} fueron directo a a su cuenta. ¡Espero que haya sido divertido!`,
		commandHungerGamesResultHeaderBloodbath: () => 'Bloodbath',
		commandHungerGamesResultHeaderSun: ({ game }) => `Day ${game.turn}`,
		commandHungerGamesResultHeaderMoon: ({ game }) => `Night ${game.turn}`,
		commandHungerGamesResultDeaths: ({ deaths }) => `**${deaths} cannon shot can be heard in the distance.**`,
		commandHungerGamesResultDeathsPlural: ({ deaths }) => `**${deaths} cannon shots can be heard in the distance.**`,
		commandHungerGamesResultProceed: 'Proceed?',
		commandHungerGamesStop: 'Game finished by choice! See you later!',
		commandHungerGamesWinner: ({ winner }) => `And the winner is... ${winner}!`,
		commandHungerGamesDescription: 'Play Hunger Games with your friends!',
		commandHungerGamesExtended: {
			extendedHelp: 'Enough discussion, let the games begin!',
			examples: ['Skyra, Katniss, Peeta, Clove, Cato, Johanna, Brutus, Blight']
		},
		commandSlotmachineDescription: `I bet 100${SHINY} you ain't winning this round.`,
		commandSlotmachineExtended: {
			extendedHelp: `Gira una máquina tragamonedas de 3 carretes y juega tus brillos para obtener recompensas más grandes`,
			explainedUsage: [['Cantidad', 'Ya sea 50, 100, 200, 500 o incluso, 1000 shinies para apostar.']],
			reminder: 'Recibirá al menos 5 veces la cantidad (cerezas / tada) al ganar, y hasta 24 veces (siete, diamante sin piel).'
		},
		commandSlotmachinesWin: ({ roll, winnings }) => `**You rolled:**\n${roll}\n**Congratulations!**\nYou won ${winnings}${SHINY}!`,
		commandSlotmachinesLoss: ({ roll }) => `**You rolled:**\n${roll}\n**Mission failed!**\nWe'll get em next time!`,
		commandSlotmachineCanvasTextWon: 'Tú ganaste',
		commandSlotmachineCanvasTextLost: 'Tú perdiste',
		commandSlotmachineTitles: {
			previous: 'Anterior',
			new: 'Nuevo'
		},
		commandTicTacToeDescription: 'Play Tic-Tac-Toe with somebody.',
		commandTicTacToeExtended: {
			extendedHelp: [
				'Tic-tac-toe (también conocido como ceros y cruces o Xs y Os) es un juego de papel y lápiz para dos jugadores, X y O, que se turnan para marcar los espacios en una cuadrícula de 3 × 3.',
				'El jugador que logra colocar tres de sus marcas en una fila horizontal, vertical o diagonal gana el juego.'
			],
			multiline: true
		},
		commandTicTacToePrompt: ({ challenger, challengee }) =>
			`Querido ${challenger}, ${challengee} te ha desafiado en un partido de tres en raya. Responda con **yes** para aceptar`,
		commandTicTacToeTurn: ({ icon, player, board }) => `(${icon}) Girar para ${player}!\n${board}`,
		commandTicTacToeWinner: ({ winner, board }) => `El ganador es ...${winner}!\n${board}`,
		commandTicTacToeDraw: ({ board }) => `Este partido concluyó en un **empate**!\n${board}`,
		commandTriviaDescription: 'Play a game of Trivia.',
		commandTriviaExtended: {
			extendedHelp: [
				'Answer questions of trivia here, with categories ranging from books to mythology! (powered by OpenTDB)',
				'',
				`**Categories**: ${Object.keys(CATEGORIES).join(', ')}`
			],
			explainedUsage: [
				['category', 'The category questions are asked from.'],
				['type', 'The type of question asked: can be boolean (true/false) or multiple choice.'],
				['difficulty', 'The difficulty level of the questions asked.'],
				['duration', 'The amount of time you get to answer.']
			],
			examples: ['trivia history.', 'trivia books multiple easy.', 'trivia videogames 45.'],
			multiline: true
		},
		commandTriviaInvalidCategory: 'Invalid category: Please use `Skyra, help trivia` for a list of categories.',
		commandTriviaActiveGame: 'A game of trivia is already being played in this channel',
		commandTriviaIncorrect: ({ attempt }) => `I am sorry, but **${attempt}** is not the correct answer. Better luck next time!`,
		commandTriviaNoAnswer: ({ correctAnswer }) => `Looks like nobody got it! The right answer was **${correctAnswer}**.`,
		commandTriviaEmbedTitles: {
			trivia: 'Trivia',
			difficulty: 'Difficulty'
		},
		commandTriviaWinner: ({ winner, correctAnswer }) => `We have a winner! ${winner} had a right answer with **${correctAnswer}**!`,
		commandVaultDescription: `Guarde sus ${SHINY} de forma segura en una bóveda para que no pueda gastarlos accidentalmente en juegos de azar.`,
		commandVaultExtended: {
			extendedHelp: [
				'Esto es para los gastadores codiciosos entre nosotros que tienden a jugar demasiado en la máquina tragamonedas o girar la rueda de la fortuna.',
				`Debes retirar activamente a los ${SHINY} de tu bóveda antes de que puedan gastarse el juego.`
			],
			explainedUsage: [
				['acción', 'La acción a realizar: **retirarse** para retirarse de su bóveda o **depositar** para depositar en su bóveda.'],
				['dinero', `La cantidad de ${SHINY} para retirar o depositar.`]
			],
			examples: ['depositar 10000.', 'retirar 10000.'],
			multiline: true
		},
		commandVaultEmbedData: ({ coins }) => ({
			depositedDescription: `Depositó ${coins} ${SHINY} del saldo de su cuenta en su bóveda.`,
			withdrewDescription: `Retiró ${coins} ${SHINY} de su bóveda.`,
			showDescription: 'Su cuenta corriente y saldo de caja fuerte son:',
			accountMoney: 'Dinero de la cuenta',
			accountVault: 'Bóveda de cuenta'
		}),
		commandVaultInvalidCoins: 'Lo siento, pero esa es una cantidad inválida de monedas. ¡Asegúrese de que sea un número positivo!',
		commandVaultNotEnoughMoney: ({ money }) =>
			`Lo siento, ¡pero no tienes suficiente dinero para hacer ese depósito! Su saldo monetario actual es ${money}${SHINY}`,
		commandVaultNotEnoughInVault: ({ vault }) =>
			`Lo siento, ¡pero no tienes suficiente almacenado en tu bóveda para hacer esa retirada! Su saldo actual es ${vault}${SHINY}`,
		commandWheelOfFortuneDescription: 'Juega con tus shinies haciendo girar una rueda de la fortuna.',
		commandWheelOfFortuneExtended: {
			extendedHelp: `Puede perder 0.1, 0.2, 0.3 o 0.5 veces su entrada o ganar 1.2, 1.5, 1.7 o 2.4 veces su entrada.`
		},
		commandWheelOfFortuneTitles: {
			previous: 'Anterior',
			new: 'Nuevo'
		},
		commandWheelOfFortuneCanvasTextWon: 'Tú ganaste',
		commandWheelOfFortuneCanvasTextLost: 'Tú perdiste',
		gamesNotEnoughMoney: ({ money }) =>
			`Lo siento, ¡pero no tienes suficiente dinero para pagar tu apuesta! El saldo de su cuenta corriente es ${money}${SHINY}`,
		gamesCannotHaveNegativeMoney: `No puedes tener una cantidad negativa de ${SHINY}s`,

		/**
		 * #################
		 * GIVEAWAY COMMANDS
		 */

		giveawayTime: 'El sorteo debe durar al menos 10 seconds.',
		giveawayTimeTooLong: '¡Oye! ¡Eso es un tiempo increíblemente largo para contarlo con los dedos de mis manos!',
		giveawayEndsAt: 'Termina en:',
		giveawayDuration: ({ time }) => `This giveaway ends in **${this.duration(time)}**! React to this message with 🎉 to join.`,
		giveawayTitle: '🎉 **GIVEAWAY** 🎉',
		giveawayLastchance: ({ time }) => `**LAST CHANCE**! Remaining time: **${this.duration(time)}**. React to this message with 🎉 to join.`,
		giveawayLastchanceTitle: '🎉 **LAST CHANCE GIVEAWAY** 🎉',
		giveawayEnded: ({ winners }) => `Ganador: ${winners}`,
		giveawayEndedPlural: ({ winners }) => `Ganadores: ${winners}`,
		giveawayEndedNoWinner: 'No winner...',
		giveawayEndedAt: 'Ended at:',
		giveawayEndedTitle: '🎉 **GIVEAWAY ENDED** 🎉',
		giveawayEndedMessage: ({ winners, title }) => `Congratulations ${winners.join(' ')}! You won the giveaway **${title}**`,
		giveawayEndedMessageNoWinner: ({ title }) => `The giveaway **${title}** ended without enough participants.`,
		giveawayScheduled: ({ scheduledTime }) => `El sorteo comenzará en ${this.duration(scheduledTime)}.`,

		/**
		 * ###################
		 * MANAGEMENT COMMANDS
		 */

		commandNickSet: ({ nickname }) => `Changed the nickname to **${nickname}**.`,
		commandNickCleared: 'Nickname cleared.',
		commandPermissionNodesHigher: `${REDCROSS} You cannot modify nor preview the permission nodes for this target.`,
		commandPermissionNodesInvalidType: `${REDCROSS} Invalid type, expected either of \`allow\` or \`deny\`.`,
		commandPermissionNodesAdd: `${GREENTICK} Successfully added the command to the permission node.`,
		commandPermissionNodesNodeNotExists: `${REDCROSS} The selected permission node does not exist.`,
		commandPermissionNodesCommandNotExists: `${REDCROSS} The selected command does not exist in the permision node.`,
		commandPermissionNodesRemove: `${GREENTICK} Successfully removed the command from the permission node.`,
		commandPermissionNodesReset: `${GREENTICK} Successfully removed all commands from the permission node.`,
		commandPermissionNodesShowName: ({ name }) => `Permissions for: __${name}__`,
		commandPermissionNodesShowAllow: ({ allow }) => `**Allow**: ${allow}`,
		commandPermissionNodesShowDeny: ({ deny }) => `**Deny**: ${deny}`,
		commandTriggersNotype: 'You need to insert a trigger type (**alias**|**reaction**)',
		commandTriggersNooutput: 'You need to insert the trigger output.',
		commandTriggersInvalidreaction: 'This reaction does not seem valid for me, either it is not valid unicode or I do not have access to it.',
		commandTriggersInvalidalias: 'There is no command like this.',
		commandTriggersRemoveNottaken: 'There is no trigger with this input.',
		commandTriggersRemove: 'Successfully removed this trigger.',
		commandTriggersAddTaken: 'There is already a trigger with this input.',
		commandTriggersAdd: 'Successfully added the trigger.',
		commandTriggersListEmpty: 'The trigger list for this guild is empty.',
		commandGuildInfoTitles: {
			CHANNELS: 'Channels',
			MEMBERS: 'Members',
			OTHER: 'Other'
		},
		commandGuildInfoRoles: ({ roles }) => `**Roles**\n\n${roles}`,
		commandGuildInfoNoroles: 'Roles? Where? There is no other than the `@everyone` role!',
		commandGuildInfoChannels: ({ text, voice, categories, afkChannelText }) => [
			`• **${text}** Text, **${voice}** Voice, **${categories}** categories.`,
			`• AFK: ${afkChannelText}`
		],
		commandGuildInfoChannelsAfkChannelText: ({ afkChannel, afkTime }) => `**<#${afkChannel}>** after **${afkTime / 60}**min`,
		commandGuildInfoMembers: ({ count, owner }) => [`• **${count}** members`, `• Owner: **${owner.tag}**`, `  (ID: **${owner.id}**)`],
		commandGuildInfoOther: ({ size, region, createdAt, verificationLevel }) => [
			`• Roles: **${size}**`,
			`• Region: **${region}**`,
			`• Created at: **${timestamp.displayUTC(createdAt)}** (UTC - YYYY/MM/DD)`,
			`• Verification Level: **${this.HUMAN_LEVELS[verificationLevel]}**`
		],
		commandRoleInfoTitles: { PERMISSIONS: 'Permissions' },
		commandRoleInfoData: ({ role, hoisted, mentionable }) => [
			`ID: **${role.id}**`,
			`Name: **${role.name}**`,
			`Color: **${role.hexColor}**`,
			`Hoisted: **${hoisted}**`,
			`Position: **${role.rawPosition}**`,
			`Mentionable: **${mentionable}**`
		],
		commandRoleInfoAll: 'All Permissions granted.',
		commandRoleInfoNoPermissions: 'Permissions not granted.',
		commandFilterUndefinedWord: 'You must write what you want me to filter.',
		commandFilterAlreadyFiltered: `This word is already filtered.`,
		commandFilterNotFiltered: `This word is not filtered.`,
		commandFilterAdded: ({ word }) => `${GREENTICK} Success! Added the word ${word} to the filter.`,
		commandFilterRemoved: ({ word }) => `${GREENTICK} Success! Removed the word ${word} from the filter.`,
		commandFilterReset: `${GREENTICK} Success! The filter has been reset.`,
		commandFilterShowEmpty: 'The list of filtered words is empty!',
		commandFilterShow: ({ words }) => `There is the list of all filtered words: ${words}`,

		/**
		 * #################################
		 * MANAGEMENT/CONFIGURATION COMMANDS
		 */

		commandManageCommandAutoDeleteTextChannel:
			'You must input a valid text channel, people cannot use commands in a voice or a category channel!',
		commandManageCommandAutoDeleteRequiredDuration: 'You must specify an amount of seconds for the command to be automatically deleted.',
		commandManageCommandAutoDeleteShowEmpty: 'There are no command autodelete configured right now.',
		commandManageCommandAutoDeleteShow: ({ codeblock }) => `All command autodeletes configured:${codeblock}`,
		commandManageCommandAutoDeleteAdd: ({ channel, time }) =>
			`${GREENTICK} Success! All successful commands in ${channel} will be deleted after ${this.duration(time)}!`,
		commandManageCommandAutoDeleteRemove: ({ channel }) =>
			`${GREENTICK} Success! Commands will not be automatically deleted in ${channel} anymore!`,
		commandManageCommandAutoDeleteRemoveNotset: ({ channel }) =>
			`${REDCROSS} The channel ${channel} was not configured to automatically delete messages!`,
		commandManageCommandAutoDeleteReset: 'All the command autodeletes have been reset.',
		commandManageCommandChannelTextChannel: 'You must input a valid text channel, people cannot use commands in a voice or a category channel!',
		commandManageCommandChannelRequiredCommand: "You must specify what command do you want to add or remove from the channel's filter.",
		commandManageCommandChannelShow: ({ channel, commands }) => `List of disabled commands in ${channel}: ${commands}`,
		commandManageCommandChannelShowEmpty: 'The list of disabled commands for the specified channel is empty!',
		commandManageCommandChannelAddAlreadyset: 'The command you are trying to disable is already disabled!',
		commandManageCommandChannelAdd: ({ channel, command }) => `Successfully disabled the command ${command} for the channel ${channel}!`,
		commandManageCommandChannelRemoveNotset: ({ channel }) => `The command you are trying to enable was not disabled for ${channel}.`,
		commandManageCommandChannelRemove: ({ channel, command }) => `Successfully enabled the command ${command} for the channel ${channel}!`,
		commandManageCommandChannelResetEmpty: 'This channel had no disabled command, so I decided to do nothing.',
		commandManageCommandChannelReset: ({ channel }) => `Successfully enabled all disabled commands in ${channel}, enjoy!`,
		commandManageReactionRolesShowEmpty: 'There are no reaction roles set up in this server.',
		commandManageReactionRolesAddChannel: ({ emoji, channel }) =>
			`${GREENTICK} Success! I will now give the role when people react with ${emoji} to any message from ${channel}!`,
		commandManageReactionRolesAddPrompt: 'Listening now! Please react to a message and I will bind the reaction with the role!',
		commandManageReactionRolesAddMissing: 'I waited, but you did not seem to have reacted to a message.',
		commandManageReactionRolesAdd: ({ emoji, url }) =>
			`${GREENTICK} Success! I will now give the role when people react with ${emoji} at ${url}!`,
		commandManageReactionRolesRemoveNotExists: 'The reaction role you specified does not exist.',
		commandManageReactionRolesRemove: ({ emoji, url }) =>
			`${GREENTICK} Success! I will not longer give the role when people react with ${emoji} at ${url}!`,
		commandManageReactionRolesResetEmpty: 'There were no reaction roles set up.',
		commandManageReactionRolesReset: `${GREENTICK} Successfully removed all reaction roles.`,
		commandSetStarboardEmojiSet: ({ emoji }) => `Successfully set a new emoji for the next star messages: ${emoji}`,
		configurationTextChannelRequired: 'The selected channel is not a valid text channel, try again with another.',
		configurationEquals: 'Successfully configured: no changes were made.',
		commandSetIgnoreChannelsSet: ({ channel }) => `Ignoring all command input from ${channel} now.`,
		commandSetIgnoreChannelsRemoved: ({ channel }) => `Listening all command input from ${channel} now.`,
		commandSetImageLogsSet: ({ channel }) => `Establezca correctamente el canal de registros de imagen en ${channel}.`,
		commandSetMemberLogsSet: ({ channel }) => `Establecer correctamente el canal de registros de miembros en ${channel}.`,
		commandSetMessageLogsSet: ({ channel }) => `Establezca correctamente el canal de registros de mensajes en ${channel}.`,
		commandSetModLogsSet: ({ channel }) => `Establezca con éxito el canal de registros de modificaciones en ${channel}.`,
		commandSetPrefixSet: ({ prefix }) => `Successfully set the prefix to ${prefix}. Use ${prefix}setPrefix <prefix> to change it again.`,

		/**
		 * ###########################
		 * MANAGEMENT/MEMBERS COMMANDS
		 */

		commandStickyRolesRequiredUser: 'A user target is required for this command to work.',
		commandStickyRolesRequiredRole: 'A role name is required when adding or removing a role.',
		commandStickyRolesNotExists: ({ user }) => `The user ${user} does not have any sticky roles or does not have the specified one.`,
		commandStickyRolesReset: ({ user }) => `Successfully removed all sticky roles from ${user}.`,
		commandStickyRolesRemove: ({ user }) => `Successfully removed the specified role from ${user}.`,
		commandStickyRolesAddExists: ({ user }) => `The user ${user} already had the specified role as sticky.`,
		commandStickyRolesAdd: ({ user }) => `Successfully added the specified role as sticky to ${user}.`,
		commandStickyRolesShowEmpty: 'There are no sticky roles to show.',
		commandStickyRolesShowSingle: ({ user, roles }) => `Sticky Role(s) for **${user}**: ${roles}.`,

		/**
		 * #############
		 * MISC COMMANDS
		 */

		commandRandRedditRequiredReddit: 'You must give the name of a reddit.',
		commandRandRedditInvalidArgument: `${REDCROSS} The name you gave was not a valid name for a subreddit.`,
		commandRandRedditBanned: 'This reddit is banned and should not be used.',
		commandRandRedditFail: 'I failed to retrieve data, are you sure you wrote the reddit correctly?',
		commandRandRedditAllNsfw: 'Nothing could be posted as all retrieved posts are NSFW.',
		commandRandRedditAllNsfl: 'Nothing could be posted as all retrieved posts are NSFL. You do not want to see that.',
		commandRandRedditMessage: ({ title, author, url }) => `**${title}** submitted by ${author}\n${url}`,
		commandRandRedditErrorPrivate: `${REDCROSS} No data could be downloaded as the subreddit is marked as private.`,
		commandRandRedditErrorQuarantined: `${REDCROSS} No data could be downloaded as the subreddit is marked as quarantined.`,
		commandRandRedditErrorNotFound: `${REDCROSS} No data could be downloaded as the subreddit does not exist.`,
		commandRandRedditErrorBanned: `${REDCROSS} No data could be downloaded as the subreddit is marked as banned.`,
		commandRedditUserComplexityLevels: ['muy bajo', 'bajo', 'medio', 'alto', 'muy alto', 'muy alto'],
		commandRedditUserInvalidUser: ({ user }) => `\`${user}\` no es un nombre de usuario de Reddit válido`,
		commandRedditUserQueryFailed: 'No se pudieron encontrar datos para ese usuario de reddit',
		commandRedditUserTitles: {
			linkKarma: 'Link Karma',
			commentKarma: 'Comentar Karma',
			totalComments: 'Comentarios totales',
			totalSubmissions: 'Presentaciones totales',
			commentControversiality: 'Comentario controversialidad',
			textComplexity: 'Complejidad de texto',
			top5Subreddits: 'Top 5 Subreddits',
			bySubmissions: 'por sumisión',
			byComments: 'por comentarios',
			bestComment: 'Mejor comentario',
			worstComment: 'Peor comentario'
		},
		commandRedditUserData: ({ user, timestamp }) => ({
			overviewFor: `Resumen de/u/${user}`,
			permalink: 'Enlace permanente',
			dataAvailableFor: 'Los datos están disponibles para los últimos 1000 comentarios y presentaciones (limitación de la API de Reddit)',
			joinedReddit: `Se unió a Reddit ${timestamp}`
		}),
		commandSnipeEmpty: 'There are no sniped messages in this channel.',
		commandSnipeTitle: 'Sniped Message',
		commandUpvoteMessage:
			'Upvote me on **https://top.gg/bot/266624760782258186**, **https://botsfordiscord.com/bot/266624760782258186**, or **https://botlist.space/bot/266624760782258186** for free shinies! Remember, you can vote every 24 hours.',
		commandVaporwaveOutput: ({ str }) => `Here is your converted message:\n${str}`,

		/**
		 * #############################
		 * MODERATION/UTILITIES COMMANDS
		 */

		commandPermissions: ({ username, id }) => `Permissions for ${username} (${id})`,
		commandPermissionsAll: 'All Permissions',
		commandFlow: ({ amount }) => `${amount} messages have been sent within the last minute.`,
		commandTimeTimed: 'The selected moderation case has already been timed.',
		commandTimeUndefinedTime: 'You must specify a time.',
		commandTimeUnsupportedType: 'The type of action for the selected case cannot be reverse, therefore this action is unsupported.',
		commandTimeNotScheduled: 'This task is not scheduled.',
		commandTimeAborted: ({ title }) => `Successfully aborted the schedule for ${title}`,
		commandTimeScheduled: ({ title, user, time }) =>
			`${GREENTICK} Successfully scheduled a moderation action type **${title}** for the user ${user.tag} (${
				user.id
			}) with a duration of ${this.duration(time)}`,

		/**
		 * ###################
		 * MODERATION COMMANDS
		 */

		commandSlowmodeSet: ({ cooldown }) => `The cooldown for this channel has been set to ${this.duration(cooldown)}.`,
		commandSlowmodeReset: 'The cooldown for this channel has been reset.',
		commandSlowmodeTooLong: `${REDCROSS} The maximum amount of time you can set is 6 hours.`,
		commandTimeDescription: 'Set the timer.',
		commandTimeExtended: {
			extendedHelp: 'Updates the timer for a moderation case..',
			explainedUsage: [
				['cancel', 'Whether or not you want to cancel the timer.'],
				['case', 'The case you want to update'],
				['timer', 'The timer, ignored if `cancel` was defined.']
			],
			examples: ['cancel 1234', '1234 6h']
		},
		commandBanNotBannable: 'The target is not bannable for me.',
		commandDehoistStarting: ({ count }) => `I will start dehoisting ${count} members...`,
		commandDehoistProgress: ({ count, percentage }) => `Dehoisted ${count} members so far! (${percentage}%)`,
		commandDehoistEmbed: ({ users, dehoistedMemberCount, dehoistedWithErrorsCount, errored }) => ({
			title: `Finished dehoisting ${users} members`,
			descriptionNoone: 'No members were dehoisted. A round of applause for your law-abiding users!',
			descriptionWithError: `${dehoistedWithErrorsCount} member was dehoisted. We also tried to dehoist an additional ${errored} member, but they errored out`,
			descriptionWithMultipleErrors: `${dehoistedWithErrorsCount} members were dehoisted. We also tried to dehoist an additional ${errored} members, but they errored out`,
			description: `${dehoistedMemberCount} member was dehoisted`,
			descriptionMultipleMembers: `${dehoistedMemberCount} members were dehoisted`,
			fieldErrorTitle: 'The users we encountered an error for:'
		}),
		commandKickNotKickable: 'The target is not kickable for me.',
		commandLockdownLock: ({ channel }) => `The channel ${channel} is now locked.`,
		commandLockdownLocking: ({ channel }) => `${LOADING} Locking the channel ${channel}... I might not be able to reply after this.`,
		commandLockdownLocked: ({ channel }) => `The channel ${channel} was already locked.`,
		commandLockdownUnlocked: ({ channel }) => `The channel ${channel} was not locked.`,
		commandLockdownOpen: ({ channel }) => `The lockdown for the channel ${channel} has been released.`,
		commandMuteLowlevel: 'I am sorry, there is no Mute role configured. Please ask an Administrator or the Guild Owner to set it up.',
		commandMuteConfigureCancelled: 'Prompt aborted, the Mute role creation has been cancelled.',
		commandMuteConfigure: 'Do you want me to create and configure the Mute role now?',
		commandMuteConfigureToomanyRoles: 'There are too many roles (250). Please delete a role before proceeding.',
		commandMuteMuted: 'The target user is already muted.',
		commandMuteUserNotMuted: 'This user is not muted.',
		commandMuteUnconfigured: 'This guild does not have a **Muted** role. Aborting command execution.',
		commandMutecreateMissingPermission: `I need the **${this.PERMISSIONS.MANAGE_ROLES}** permission to create the role and **${this.PERMISSIONS.MANAGE_CHANNELS}** to edit the channels permissions.`,
		commandRestrictLowlevel: `${REDCROSS} I am sorry, there is no restriction role configured. Please ask an Administrator or the server owner to set i up.`,
		commandPruneInvalid: `${REDCROSS} You did not specify the arguments correctly, please make sure you gave a correct limit or filter.`,
		commandPruneAlert: ({ count, total }) => `Successfully deleted ${count} message from ${total}.`,
		commandPruneAlertPlural: ({ count, total }) => `Successfully deleted ${count} messages from ${total}.`,
		commandPruneInvalidPosition: `${REDCROSS} Position must be one of "before" or "after".`,
		commandPruneInvalidFilter: `${REDCROSS} Filtro debe ser uno de "archivo", "autor", "bot", "humano", "invitación", "enlace" o "skyra".`,
		commandPruneNoDeletes: 'No message has been deleted, either no message match the filter or they are over 14 days old.',
		commandPruneLogHeader:
			'The following messages have been generated by request of a moderator.\nThe date formatting is of `YYYY/MM/DD hh:mm:ss`.',
		commandPruneLogMessage: ({ channel, author, count }) => `${count} message deleted in ${channel} by ${author}.`,
		commandPruneLogMessagePlural: ({ channel, author, count }) => `${count} messages deleted in ${channel} by ${author}.`,
		commandReasonMissingCase: 'You need to provide a case or a case range.',
		commandReasonNotExists: `The selected modlog doen't seem to exist.`,
		commandReasonUpdated: ({ newReason }) => [`${GREENTICK} Actualizado 1 caso.`, ` └─ **Set the reason to:** ${newReason}`],
		commandReasonUpdatedPlural: ({ entries, newReason }) => [
			`${GREENTICK} Actualizados ${entries.length} casos.`,
			` └─ **Set their reasons to:** ${newReason}`
		],
		commandToggleModerationDmToggledEnabled: `${GREENTICK} Successfully enabled moderation DMs.`,
		commandToggleModerationDmToggledDisabled: `${GREENTICK} Successfully disabled moderation DMs`,
		commandUnbanMissingPermission: `I will need the **${this.PERMISSIONS.BAN_MEMBERS}** permission to be able to unban.`,
		commandUnmuteMissingPermission: `I will need the **${this.PERMISSIONS.MANAGE_ROLES}** permission to be able to unmute.`,
		commandVmuteMissingPermission: `I will need the **${this.PERMISSIONS.MUTE_MEMBERS}** permission to be able to voice unmute.`,
		commandVmuteUserNotMuted: 'This user is not voice muted.',
		commandWarnDm: ({ moderator, guild, reason }) => `You have been warned by ${moderator} in ${guild} for the reason: ${reason}`,
		commandWarnMessage: ({ user, log }) => `|\`🔨\`| [Case::${log}] **WARNED**: ${user.tag} (${user.id})`,
		commandModerationOutput: ({ range, users }) => `${GREENTICK} Created case ${range} | ${users}.`,
		commandModerationOutputPlural: ({ range, users }) => `${GREENTICK} Created cases ${range} | ${users}.`,
		commandModerationOutputWithReason: ({ range, users, reason }) =>
			`${GREENTICK} Created case ${range} | ${users}.\nWith the reason of: ${reason}`,
		commandModerationOutputWithReasonPlural: ({ range, users, reason }) =>
			`${GREENTICK} Created cases ${range} | ${users}.\nWith the reason of: ${reason}`,
		commandModerationFailed: ({ users }) => `${REDCROSS} Failed to moderate user:\n${users}`,
		commandModerationFailedPlural: ({ users }) => `${REDCROSS} Failed to moderate users:\n${users}`,
		commandModerationDmFooter: 'To disable moderation DMs, write `toggleModerationDM`.',
		commandModerationDmDescription: ({ guild, title }) => [
			`**❯ Server**: ${guild}`, //
			`**❯ Type**: ${title}`,
			`**❯ Reason**: None specified`
		],
		commandModerationDmDescriptionWithReason: ({ guild, title, reason }) => [
			`**❯ Server**: ${guild}`,
			`**❯ Type**: ${title}`,
			`**❯ Reason**: ${reason}`
		],
		commandModerationDmDescriptionWithDuration: ({ guild, title, duration: pDuration }) => [
			`**❯ Server**: ${guild}`,
			`**❯ Type**: ${title}`,
			`**❯ Duration**: ${this.duration(pDuration!)}`,
			`**❯ Reason**: None specified`
		],
		commandModerationDmDescriptionWithReasonWithDuration: ({ guild, title, reason, duration: pDuration }) => [
			`**❯ Server**: ${guild}`,
			`**❯ Type**: ${title}`,
			`**❯ Duration**: ${this.duration(pDuration!)}`,
			`**❯ Reason**: ${reason}`
		],
		commandModerationDays: 'd[ií]as?',

		/**
		 * ###############
		 * SOCIAL COMMANDS
		 */

		commandAutoRolePointsRequired: 'You must input a valid amount of points.',
		commandAutoRoleUpdateConfigured: 'This role is already configured as an autorole. Use the remove type instead.',
		commandAutoRoleUpdateUnconfigured: 'This role is not configured as an autorole. Use the add type instead.',
		commandAutoRoleUpdate: ({ role, points, before }) =>
			`Updated autorole: ${role.name} (${role.id}). Points required: ${points} (before: ${before})`,
		commandAutoRoleRemove: ({ role, before }) => `Removed the autorole: ${role.name} (${role.id}), which required ${before} points.`,
		commandAutoRoleAdd: ({ role, points }) => `Added new autorole: ${role.name} (${role.id}). Points required: ${points}`,
		commandAutoRoleListEmpty: 'There is no role configured as an autorole in this server.',
		commandAutoRoleUnknownRole: ({ role }) => `Unknown role: ${role}`,
		commandBalance: ({ user, amount }) => `The user ${user} has a total of ${amount}${SHINY}`,
		commandBalanceSelf: ({ amount }) => `You have a total of ${amount}${SHINY}`,
		commandBalanceBots: `I think they have 5 gears as much, bots don't have ${SHINY}`,
		commandSocialMemberNotexists: `${REDCROSS} The member is not in this server, and is not in my database either.`,
		commandSocialAdd: ({ user, amount, count }) => `${GREENTICK} Successfully added ${count} point to ${user}. Current amount: ${amount}.`,
		commandSocialAddPlural: ({ user, amount, count }) => `${GREENTICK} Successfully added ${count} points to ${user}. Current amount: ${amount}.`,
		commandSocialRemove: ({ user, amount, count }) => `${GREENTICK} Successfully removed ${count} point to ${user}. Current amount: ${amount}.`,
		commandSocialRemovePlural: ({ user, amount, count }) =>
			`${GREENTICK} Successfully removed ${count} points to ${user}. Current amount: ${amount}.`,
		commandSocialUnchanged: ({ user }) => `${REDCROSS} The user ${user} already had the given amount of points, no update was needed.`,
		commandSocialReset: ({ user }) => `${GREENTICK} The user ${user} got his points removed.`,
		commandBannerMissing: ({ type }) => `You must specify a banner id to ${type}.`,
		commandBannerNotexists: ({ prefix }) =>
			`This banner id does not exist. Please check \`${prefix}banner list\` for a list of banners you can buy.`,
		commandBannerUserlistEmpty: ({ prefix }) => `You did not buy a banner yet. Check \`${prefix}banner list\` for a list of banners you can buy.`,
		commandBannerResetDefault: 'You are already using the default banner.',
		commandBannerReset: 'Your banner has been reset to the default.',
		commandBannerSetNotBought: 'You did not buy this banner yet.',
		commandBannerSet: ({ banner }) => `${GREENTICK} **Success**. You have set your banner to: __${banner}__`,
		commandBannerBought: ({ prefix, banner }) =>
			`You already have this banner, you may want to use \`${prefix}banner set ${banner}\` to make it visible in your profile.`,
		commandBannerMoney: ({ money, cost }) =>
			`You do not have enough money to buy this banner. You have ${money}${SHINY}, the banner costs ${cost}${SHINY}`,
		commandBannerPaymentCancelled: `${REDCROSS} The payment has been cancelled.`,
		commandBannerBuy: ({ banner }) => `${GREENTICK} **Success**. You have bought the banner: __${banner}__`,
		commandBannerPrompt:
			'Reply to this message choosing an option:\n`all` to check a list of all available banners.\n`user` to check a list of all bought banners.',
		commandToggleDarkModeEnabled: `${GREENTICK} Successfully enabled the dark mode.`,
		commandToggleDarkModeDisabled: `${GREENTICK} Successfully disabled the dark mode.`,
		commandDailyTime: ({ time }) => `El siguiente pago está disponible en: ${this.duration(time)}`,
		commandDailyTimeSuccess: ({ amount }) => `¡Yuhu! ¡Has obtenido ${amount}${SHINY}! Siguiente pago en: 12 horas.`,
		commandDailyGrace: ({ remaining }) => [
			'¿Te gustaría recibir el pago temprano? El tiempo restante será añadido al periodo normal de espera, de 12 horas.',
			`Tiempo restante: ${this.duration(remaining)}`
		],
		commandDailyGraceAccepted: ({ amount, remaining }) =>
			`¡Dinero dinero! ¡Has recibido ${amount}${SHINY}! Siguiente pago en: ${this.duration(remaining)}`,
		commandDailyGraceDenied: '¡De acuerdo! ¡Vuelve pronto!',
		commandDailyCollect: 'Collect dailies',
		commandLevel: {
			level: 'Nivel',
			experience: 'Experiencia',
			nextIn: 'Siguiente nivel en'
		},
		commandDivorceSelf: 'I am sorry, but you cannot divorce yourself.',
		commandDivorceNotTaken: 'Who would you divorce? You are not even taken!',
		commandDivorcePrompt: 'Ooh... that sounds quite bad 💔... are you 100% sure about this?',
		commandDivorceCancel: 'Oh lord. I am very glad you will continue with your partner!',
		commandDivorceDm: ({ user }) => `Pardon... but... do you remember ${user}? He decided to break up with you 💔!`,
		commandDivorceSuccess: ({ user }) => `Successful divorce 💔... You are no longer married to ${user}!`,
		commandMarryWith: ({ users }) => `Dear, how could you forget it... You are currently married to ${this.list(users, 'y')}!`,
		commandMarryNotTaken: 'Uh... I am sorry, but I am not aware of you being married... have you tried proposing to somebody?',
		commandMarrySkyra: 'I am sorry, I know you love me, but I am already taken by a brave man I love 💞!',
		commandMarryAelia: 'In your dreams. She is my sister, I am not letting somebody harm her!',
		commandMarryBots: 'Oh no! You should not be marrying bots! They still do not understand what true love is, and they are not warm!',
		commandMarrySelf: 'No! This is not how this works! You cannot marry yourself, who would you spend your life with? 💔',
		commandMarryAuthorTaken: ({ author }) =>
			`You are already married. Is your love big enough for two people? <@${author.id}>, reply with **yes** to confirm!`,
		commandMarryAuthorMultipleCancel: ({ user }) => `Cancelling. Your commitment to ${user} is admirable.`,
		commandMarryTaken: () => `This user is already married to someone. Would you like to join their harem?`,
		commandMarryTakenPlural: ({ count: spousesCount }) =>
			`This user is already married to ${spousesCount} people. Would you like to join their harem?`,
		commandMarryAlreadyMarried: ({ user }) => `You are already married with ${user}, did you forget it?`,
		commandMarryAuthorTooMany: ({ limit }) => `${REDCROSS} Ya estás casado con demasiadas personas, ¡tu límite de casamientos es ${limit}!`,
		commandMarryTargetTooMany: ({ limit }) =>
			`${REDCROSS} La persona a la que intentas casarte ya está casada con demasiadas personas, ¡su límite de casamientos es ${limit}!`,
		commandMarryMultipleCancel: "Cancelling. Don't worry, you'll find someone you don't have to share!",
		commandMarryPetition: ({ author, user }) =>
			`Fresh pair of eyes! ${author.username} is proposing to ${user.username}! 💞 <@${user.id}>, reply with **yes** to accept!`,
		commandMarryNoreply: 'The user did not reply on time... Maybe it was a hard decision?',
		commandMarryDenied: 'O-oh... The user rejected your proposal! 💔',
		commandMarryAccepted: ({ author, user }) => `Congratulations dear ${author}! You're now officially married with ${user}! ❤`,
		commandMylevel: ({ points, next, user }) => `The user ${user} has a total of ${points} points.${next}`,
		commandMylevelSelf: ({ points, next }) => `You have a total of ${points} points.${next}`,
		commandMylevelNext: ({ remaining, next }) => `Points for next rank: **${remaining}** (at ${next} points).`,
		commandPayMissingMoney: ({ needed, has }) => `I am sorry, but you need ${needed}${SHINY} and you have ${has}${SHINY}`,
		commandPayPrompt: ({ user, amount }) => `You are about to pay ${user} ${amount}${SHINY}, are you sure you want to proceed?`,
		commandPayPromptAccept: ({ user, amount }) => `Payment accepted, ${amount}${SHINY} has been sent to ${user}'s profile.`,
		commandPayPromptDeny: 'Payment denied.',
		commandPaySelf: 'If I taxed this, you would lose money, therefore, do not try to pay yourself.',
		commandSocialPayBot: 'Oh, sorry, but money is meaningless for bots, I am pretty sure a human would take advantage of it better.',
		commandProfile: {
			globalRank: 'Posición Mundial',
			credits: 'Créditos | Bóveda',
			reputation: 'Reputación',
			experience: 'Experiencia',
			level: 'Nivel'
		},
		commandRemindmeCreate: ({ id }) => `A reminder with ID \`${id}\` has been created.`,
		commandRemindmeCreateNoDuration: 'You must tell me what you want me to remind you and when.',
		commandRemindmeCreateNoDescription: 'Algo, no me dijiste qué.',
		commandRemindmeDeleteNoId: "To delete a previously created reminder, you must type 'delete' followed by the ID.",
		commandRemindmeDelete: ({ task, id }) =>
			`The reminder with ID \`${id}\` and with a remaining time of **${this.duration(
				task.time.getTime() - Date.now()
			)}** has been successfully deleted.`,
		commandRemindmeListEmpty: 'You do not have any active reminder',
		commandRemindmeShowFooter: ({ id }) => `ID: ${id} | Ends at:`,
		commandRemindmeInvalidId: 'I am sorry, but the ID provided does not seem to be valid.',
		commandRemindmeNotfound: 'I cannot find something here. The reminder either never existed or it ended.',

		commandReputationTime: ({ remaining }) => `You can give a reputation point in ${this.duration(remaining)}`,
		commandReputationUsable: 'You can give a reputation point now.',
		commandReputationUserNotfound: 'You must mention a user to give a reputation point.',
		commandReputationSelf: 'You cannot give a reputation point to yourself.',
		commandReputationBots: 'You cannot give a reputation point to bots.',
		commandReputationGive: ({ user }) => `You have given a reputation point to **${user}**!`,
		commandReputationsBots: 'Bots cannot have reputation points...',
		commandReputationsSelf: ({ points }) => `You have a total of ${points} reputation points.`,
		commandReputation: ({ count }) => `${count} reputation point`,
		commandReputationPlural: ({ count }) => `${count} reputation points`,
		commandReputations: ({ user, points }) => `The user ${user} has a total of ${points}.`,
		commandRequireRole: 'I am sorry, but you must provide a role for this command.',
		commandScoreboardPosition: ({ position }) => `Your placing position is: ${position}`,
		commandSetColor: ({ color }) => `Color changed to ${color}`,

		/**
		 * ##################
		 * STARBOARD COMMANDS
		 */

		commandStarNostars: 'There is no starred message.',
		commandStarNoChannel: `I'm sorry, but a starboard channel hasn't been set up.`,
		commandStarStats: 'Starboard Stats',
		commandStarMessages: ({ count }) => `${count} message`,
		commandStarMessagesPlural: ({ count }) => `${count} messages`,
		commandStars: ({ count }) => `${count} star`,
		commandStarsPlural: ({ count }) => `${count} stars`,
		commandStarStatsDescription: ({ messages, stars }) => `${messages} starred with a total of ${stars}`,
		commandStarTopstarred: 'Top Starred Posts',
		commandStarTopstarredDescription: ({ medal, id, count }) => `${medal}: ${id} (${count} star)`,
		commandStarTopstarredDescriptionPlural: ({ medal, id, count }) => `${medal}: ${id} (${count} stars)`,
		commandStarTopreceivers: 'Top Star Receivers',
		commandStarTopreceiversDescription: ({ medal, id, count }) => `${medal}: <@${id}> (${count} star)`,
		commandStarTopreceiversDescriptionPlural: ({ medal, id, count }) => `${medal}: <@${id}> (${count} stars)`,

		/**
		 * ####################
		 * SUGGESTIONS COMMANDS
		 */

		commandSuggestDescription: 'Manda una sugerencia para el servidor.',
		commandSuggestExtended: {
			extendedHelp: 'Publica una recomendación en el canal de recomendaciones del servidor',
			explainedUsage: [['suggestion', 'Su recomendación']],
			examples: ['Crear un canal de música.'],
			reminder:
				'Debe tener una configuración de canal de sugerencias para que este comando funcione. Si eres un administrador, se le dará la opción de hacerlo al invocar el comando.'
		},
		commandSuggestNoSetup: ({ username }) =>
			`Lo siento ${username}, pero no los administradores no han configurado un canal de texto para las sugerencias.`,
		commandSuggestNoSetupAsk: ({ username }) =>
			`Lo siento ${username}, pero no se ha configurado un canal de texto para las sugerencias... ¿Quieres hacerlo ahora?`,
		commandSuggestNoSetupAbort: '¡Entendido! Puede usar este comando si cambia de opinión.',
		commandSuggestNopermissions: ({ username, channel }) =>
			`Lo siento ${username}, pero los administradores no me dieron permisos para enviar mensajes en ${channel}.`,
		commandSuggestChannelPrompt: 'Mencione el canal de texto o escriba su nombre o ID que en el que quiere que se publiquen las sugerencias.',
		commandSuggestTitle: ({ id }) => `Recomendación #${id}`,
		commandSuggestSuccess: ({ channel }) => `¡Gracias por su sugerencia! Lo he publicado en ${channel}!`,
		commandResolveSuggestionDescription: 'Modifica el estado de la sugerencia.',
		commandResolveSuggestionExtended: {
			extendedHelp: 'Este comando le permite actualizar el estado de una sugerencia, marcándola como aceptada, considerada o denegada',
			examples: [
				'1 accept ¡Gracias por su recomendación!',
				'1 a ¡Gracias por su recomendación!',
				'1 consider Hmm... podemos hacer esto, pero es una prioridad realmente baja.',
				'1 c Hmm... podemos hacer esto, pero es una prioridad realmente baja.',
				'1 deny De ninguna manera de que esto suceda.',
				'1 d De ninguna manera de que esto suceda.'
			],
			reminder: [
				'Se puede configurar para enviar un mensaje directo al autor con respecto al estado de su recomendación, con la configuración `suggestions.on-action.dm`.',
				'Además, en caso de que desee preservar el anonimato, puede ocultar su nombre utilizando la configuración `suggestions.on-action`, que puede anteponerse con las señales `--hide-author` y `--show-author`.'
			],
			multiline: true
		},
		commandResolveSuggestionInvalidId: `${REDCROSS} ¡Eso no era un número! Por favor vuelva a ejecutar el comando pero con el numerito del título de la sugerencia.`,
		commandResolveSuggestionMessageNotFound: `${REDCROSS} No pude recuperar la sugerencia ya que su mensaje ha sido eliminado.`,
		commandResolveSuggestionIdNotFound: `${REDCROSS} ¡No pude encontrar la recomendación! ¿Estás seguro/a de que no te confundiste de numerito?`,
		commandResolveSuggestionDefaultComment: 'Ningún comentario.',
		commandResolveSuggestionAuthorAdmin: 'Un administrador',
		commandResolveSuggestionAuthorModerator: 'Un moderador',
		commandResolveSuggestionActions: ({ author }) => ({
			accept: `${author} ha aceptado esta sugerencia:`,
			consider: `${author} ha considerado esta sugerencia:`,
			deny: `${author} ha negado esta sugerencia:`
		}),
		commandResolveSuggestionActionsDms: ({ author, guild }) => ({
			accept: `${author} ha aceptado su sugerencia en ${guild}:`,
			consider: `${author} ha considerado su sugerencia en ${guild}:`,
			deny: `${author} ha negado su sugerencia en ${guild}:`
		}),
		commandResolveSuggestionDmFail: `${REDCROSS} No pude enviar el mensaje directo al usuario. ¿Están cerrados sus mensajes directos?`,
		commandResolveSuggestionSuccess: ({ id, actionText }) => `${GREENTICK} Recomendación \`${id}\` ${actionText} con éxito!`,
		commandResolveSuggestionSuccessAcceptedText: 'aceptada',
		commandResolveSuggestionSuccessDeniedText: 'denegada',
		commandResolveSuggestionSuccessConsideredText: 'considerada',

		/**
		 * ###############
		 * SYSTEM COMMANDS
		 */

		commandEvalTimeout: ({ seconds }) => `TIMEOUT: Took longer than ${seconds} seconds.`,
		commandEvalError: ({ time, output, type }) => `**Error**:${output}\n**Type**:${type}\n${time}`,

		commandStatsTitles: {
			stats: 'Statistics',
			uptime: 'Uptime',
			serverUsage: 'Server Usage'
		},
		commandStatsFields: ({ stats, uptime, usage }) => ({
			stats: [
				`• **Users**: ${stats.users}`,
				`• **Guilds**: ${stats.guilds}`,
				`• **Channels**: ${stats.channels}`,
				`• **Discord.js**: ${stats.version}`,
				`• **Node.js**: ${stats.nodeJs}`,
				`• **Klasa**: ${klasaVersion}`
			],
			uptime: [
				`• **Host**: ${this.duration(uptime.host, 2)}`,
				`• **Total**: ${this.duration(uptime.total, 2)}`,
				`• **Client**: ${this.duration(uptime.client, 2)}`
			],
			serverUsage: [`• **CPU Load**: ${usage.cpuLoad.join('% | ')}%`, `• **Heap**: ${usage.ramUsed} (Total: ${usage.ramTotal})`]
		}),

		/**
		 * #############
		 * TAGS COMMANDS
		 */

		commandTagDescription: "Manage this guilds' tags.",
		commandTagExtended: {
			extendedHelp: [
				'Tags, also known as custom commands, can give you a chunk of text stored under a specific name.',
				'For example after adding a tag with `Skyra, tag add rule1 <your first rule>` you can use it with `Skyra, rule1` or `Skyra, tag rule1`',
				"When adding tags you can customize the final look by adding flags to the tag content (these won't show up in the tag itself!):",
				'❯ Add `--embed` to have Skyra send the tag embedded.',
				'The content will be in the description, so you can use all the markdown you wish. for example, adding [masked links](https://skyra.pw).',
				'❯ Add `--color=<a color>` or `--colour=<a colour>` to have Skyra colourize the embed. Does nothing unless also specifying `--embed`.',
				'Colours can be RGB, HSL, HEX or Decimal.'
			],
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
		commandTagPermissionlevel: 'Debe ser miembro del personal, moderador o administrador para poder administrar las etiquetas.',
		commandTagNameNotAllowed: 'Un nombre de etiqueta puede no tener un acento grave ni caracteres invisibles.',
		commandTagNameTooLong: 'El nombre de una etiqueta debe tener 50 caracteres o menos.',
		commandTagExists: ({ tag }) => `La etiqueta \`${tag}\` ya existe.`,
		commandTagContentRequired: 'Debe proporcionar un contenido para esta etiqueta.',
		commandTagAdded: ({ name, content }) => `Se agregó con éxito una nueva etiqueta: **${name}** con un contenido de:\n${content}`,
		commandTagRemoved: ({ name }) => `Se eliminó con éxito la etiqueta **${name}**.`,
		commandTagNotexists: ({ tag }) => `La etiqueta \`${tag}\` no existe.`,
		commandTagEdited: ({ name, content }) => `Se editó correctamente la etiqueta **${name}** con un contenido de:\n${content}`,
		commandTagListEmpty: 'La lista de etiquetas para este servidor está vacía.',
		commandTagReset: 'Todas las etiquetas se han eliminado con éxito de este servidor.',

		/**
		 * ##############
		 * TOOLS COMMANDS
		 */

		commandAvatarNone: 'El usuario no tiene ninguna foto de perfil puesta.',
		commandColor: ({ hex, rgb, hsl }) => [`HEX: **${hex}**`, `RGB: **${rgb}**`, `HSL: **${hsl}**`],
		commandEmojiCustom: ({ emoji, id }) => [
			`→ ${inlineCodeBlock('Emoji ::')} **${emoji}**`,
			`→ ${inlineCodeBlock('Type  ::')} **Personalizado**`,
			`→ ${inlineCodeBlock('ID    ::')} **${id}**`
		],
		commandEmojiTwemoji: ({ emoji, id }) => [
			`→ ${inlineCodeBlock('Emoji ::')} \`${emoji}\``,
			`→ ${inlineCodeBlock('Type  ::')} **Twemoji**`,
			`→ ${inlineCodeBlock('ID    ::')} **${id}**`
		],
		commandEmojiInvalid: `El argumento que escribiste no es un emoji válido.`,
		commandEmojiTooLarge: ({ emoji }) =>
			`'${emoji}' es tan pesado que los hámsters no pudieron con su peso. ¿Quizá prueba con un emoji más pequeño?ç`,
		commandCountryDescription: 'Shows information about a country.',
		commandCountryExtended: {
			extendedHelp: 'This command uses https://restcountries.eu to get information on the provided country.',
			explainedUsage: [['country', 'The name of the country.']],
			examples: ['United Kingdom']
		},
		commandCountryTitles: {
			OVERVIEW: 'Overview',
			LANGUAGES: 'Languages',
			OTHER: 'Other'
		},
		commandCountryFields: {
			overview: {
				officialName: 'Official Name',
				capital: 'Capital',
				population: 'Population'
			},
			other: {
				demonym: 'Demonym',
				area: 'Area',
				currencies: 'Currencies'
			}
		},
		commandEshopDescription: 'Solicite información para cualquier tienda digital estadounidense de Nintendo',
		commandEshopExtended: {
			extendedHelp: 'Este comando consulta a Nintendo of America para mostrar los datos del juego que solicitas.',
			explainedUsage: [['Solicitud', 'El nombre del juego que estás buscando..']],
			examples: ['Breath of the Wild', 'Pokémon', 'Splatoon']
		},
		commandEshopNotInDatabase: 'Ninguno disponible',
		commandEshopTitles: {
			price: 'Precio',
			availability: 'Disponibilidad',
			releaseDate: 'Fecha de lanzamiento',
			numberOfPlayers: 'Número de jugadores',
			platform: 'Plataforma',
			categories: 'Categorías',
			noCategories: 'Este juego no se ha ordenado en ninguna categoría.',
			nsuid: 'NSUID',
			esrb: 'ESRB'
		},
		commandEshopPricePaid: ({ price }) => `$${price} USD`,
		commandEshopPriceFree: 'Gratis',
		commandHoroscopeDescription: 'Obtén tu último horóscopo',
		commandHoroscopeExtended: {
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
		commandHoroscopeInvalidSunsign: ({ sign, maybe }) => `${sign} es un signo solar no válido, ¿tal vez intente con ${maybe}`,
		commandHoroscopeTitles: ({ sign, intensity, keywords, mood, rating }) => ({
			dailyHoroscope: `Horóscopo diario para ${sign}`,
			metadataTitle: 'Metadatos',
			metadata: [
				`**Intensidad:** ${intensity}`,
				`**Palabras clave:** ${this.list(keywords, 'y')}`,
				`**Estado anímico:** ${mood}`,
				`**Rating:** ${rating}`
			]
		}),
		commandIgdbDescription: 'Busca en IGDB (Internet Game Database) tus juegos favoritos',
		commandIgdbExtended: {
			extendedHelp: 'Este comando consulta la API IGDB para mostrar datos de sus juegos favoritos.',
			explainedUsage: [['query', 'El nombre del juego']],
			examples: ['Breath of the Wild', 'Borderlands 3']
		},
		commandIgdbTitles: {
			userScore: 'Puntuación del usuario',
			ageRating: 'Calificación de edad',
			releaseDate: 'Fecha de lanzamiento',
			genres: 'Género(s)',
			developers: 'Desarrollador(es)',
			platform: 'Plataforma(s)'
		},
		commandIgdbData: {
			noDevelopers: 'Desarrollador(es) desconocidos',
			noPlatforms: 'Plataforma(s) desconocidas',
			noReleaseDate: 'Fecha de lanzamiento desconocida',
			noRating: 'Ninguna calificación de usuario',
			noSummary: 'No hay resumen del juego disponible.',
			noGenres: 'No hay géneros conocidos.',
			noAgeRatings: 'No hay clasificaciones de edad disponibles.'
		},
		commandItunesDescription: 'Busca en la API de iTunes pistas de música',
		commandItunesExtended: {
			extendedHelp: 'Este comando consulta la API de iTunes de Apple para mostrar datos sobre la música que solicita.',
			explainedUsage: [['consulta', 'El nombre de la cancion']],
			examples: ['Apocalyptica feat. Brent Smith', "You're Gonna Go Far, Kid"]
		},
		commandItunesTitles: {
			artist: 'Artista',
			collection: 'Colección',
			collectionPrice: 'Precio de colección',
			trackPrice: 'Precio de canción',
			trackReleaseDate: 'Fecha de lanzamiento de la canción',
			numberOfTracksInCollection: 'Canciones en coleccion',
			primaryGenre: 'Genero primario',
			preview: 'Avance',
			previewLabel: 'Haga clic aquí'
		},
		commandLmgtfyClick: 'Haga clic en mí para buscar',
		commandMoviesDescription: 'Busca en TheMovieDatabase cualquier película',
		commandMoviesExtended: {
			extendedHelp: [
				'Este comando consulta la API de TheMovieDatabase para obtener datos sobre sus películas favoritas',
				"Consejo: Puede usar el filtro 'y:' para reducir sus resultados por año. Ejemplo: 'Star Wars y: 1977'."
			],
			explainedUsage: [['consulta', 'El nombre de la pelicula']],
			examples: ["Ocean's Eleven y:2001", 'Star Wars Revenge of the Sith', 'Spirited Away'],
			multiline: true
		},
		commandMoviesTitles: {
			runtime: 'Tiempo de ejecución',
			userScore: 'Puntuación del usuario',
			status: 'Estado',
			releaseDate: 'Fecha de lanzamiento',
			imdbPage: 'Página de IMDB',
			homePage: 'Página de inicio',
			collection: 'Colección',
			genres: 'Géneros'
		},
		commandMoviesData: {
			variableRuntime: 'Variable',
			movieInProduction: 'Película en producción',
			linkClickHere: 'Haga clic aquí',
			none: 'Ninguno',
			notPartOfCollection: 'No es parte de una colección.',
			noGenres: 'Ninguno en TheMovieDB'
		},
		commandShowsDescription: 'Busca en la base de datos de películas cualquier programa',
		commandShowsExtended: {
			extendedHelp: 'Este comando consulta la base de datos de películas para obtener información sobre tus programas favoritos',
			explainedUsage: [['consulta', 'El nombre del show.']],
			examples: ['Final Space', 'Gravity Falls', 'Rick and Morty']
		},
		commandShowsTitles: {
			episodeRuntime: 'Tiempo de ejecución del episodio',
			userScore: 'Puntuación del usuario',
			status: 'Estado',
			firstAirDate: 'Primera fecha de emisión',
			genres: 'Géneros'
		},
		commandShowsData: {
			variableRuntime: 'Variable',
			unknownUserScore: 'Sin puntaje de usuario',
			noGenres: 'Ninguno en TheMovieDB'
		},
		commandPriceCurrency: ({ fromCurrency, fromAmount, worths }) =>
			`**${fromAmount}** ${fromCurrency.toUpperCase()} vale ${this.list(worths, 'y')}.`,
		commandPriceCurrencyNotFound: '¡Ha habido un error! Por favor, revise de nuevo la ortografía y que especificaste una moneda válida.',
		commandQuoteMessage: 'Esto es muy raro, pero dicho mensaje no tiene ni contenido ni imagen.',
		commandRolesListEmpty: '¡Este servidor no tiene ningún rol público!',
		commandRolesAbort: ({ prefix }) =>
			`He buscado en todos los rincones pero no he encontrado lo que buscabas. ¡Por favor escribe \`${prefix}roles\` para recibir la lista completa!`,
		commandRolesListTitle: 'Lista de roles públicos',
		commandRolesAdded: ({ roles }) => `Los siguientes roles han sido añadidos a tu perfil: \`${roles}\``,
		commandRolesRemoved: ({ roles }) => `Los siguientes roles han sido removidos de tu perfil: \`${roles}\``,
		commandRolesNotPublic: ({ roles }) => `Los siguientes roles no son públicos: \`${roles}\``,
		commandRolesNotManageable: ({ roles }) => `Los siguientes roles no se pudieron entregar debido a la posición jerárquica: \`${roles}\``,
		commandRolesAuditlog: "Autorización: Administración de Roles Públicos | Comando 'Roles'.",
		commandDuckDuckGoNotfound: 'Lo siento, pero la API de DuckDuckGo ha devuelto una respuesta en blanco. Prueba de nuevo con otras palabras.',
		commandDuckDuckGoLookalso: 'Temas Relacionados:',

		commandUrbanNotFound: 'Lo siento, la palabra que buscabas no parece estar definida en UrbanDictionary. ¿Prueba con otra palabra?',
		commandUrbanIndexNotfound: 'Quizás quieras probar con un número de página más pequeño.',
		systemTextTruncated: ({ definition, url }) => `${definition}... [continúa leyendo](${url})`,
		commandWhoisMemberTitles: {
			joined: 'Fecha Ingreso',
			createdAt: 'Fecha Creación'
		},
		commandWhoisMemberFields: ({ member }) => ({
			joinedWithTimestamp: `Hace ${timestamp.displayUTC(member.joinedTimestamp!)}\n${this.duration(Date.now() - member.joinedTimestamp!, 2)}`,
			joinedUnknown: 'Desconocido',
			createdAt: `${timestamp.displayUTC(member.user.createdAt)}\nHace ${this.duration(Date.now() - member.user.createdTimestamp, 2)}`,
			footer: `ID: ${member.id}`
		}),
		commandWhoisMemberRoles: () => 'Rol [1]',
		commandWhoisMemberRolesPlural: ({ count }) => `Roles [${count}]`,
		commandWhoisMemberPermissions: 'Permisos Clave',
		commandWhoisMemberPermissionsAll: 'Todos los Permisos',
		commandWhoisUserTitles: {
			createdAt: 'Fecha Creación'
		},
		commandWhoisUserFields: ({ user }) => ({
			createdAt: `${timestamp.displayUTC(user.createdAt)}\nHace ${this.duration(Date.now() - user.createdTimestamp, 2)}`,
			footer: `ID: ${user.id}`
		}),
		commandFollowage: ({ user, channel, time }) => `${user} ha estado siguiendo ${channel} durante ${this.duration(time, 2)}.`,
		commandFollowageMissingEntries: 'Either the user or the channel do not exist.',
		commandFollowageNotFollowing: 'The user is not following the specified channel.',
		commandTwitchNoEntries: 'There are no entries, are you sure you wrote the user name correctly?',
		commandTwitchTitles: {
			followers: 'Followers',
			views: 'Views',
			clickToVisit: "Click to go to streamer's channel",
			partner: 'Partner'
		},
		commandTwitchPartnershipWithoutAffiliate: 'This channel is not part of the Twitch affiliate program.',
		commandTwitchAffiliateStatus: {
			affiliated: 'This is an affiliated channel.',
			partnered: 'This is a partnered channel.'
		},
		commandTwitchCreatedAt: 'Created At:',
		commandTwitchSubscriptionRequiredStreamer: `${REDCROSS} Debes darme el nombre de un canal para subscribirte.`,
		commandTwitchSubscriptionStreamerNotFound: `${REDCROSS} Perdona, pero no pude encontrar el canal, ¿lo escribiste bien?`,
		commandTwitchSubscriptionRequiredChannel: `${REDCROSS} Debes decirme adónde quieres que mande los mensajes.`,
		commandTwitchSubscriptionRequiredStatus: `${REDCROSS} Debes decirme qué tipo de notificaciones quieres, las opciones son "online" y "offline".`,
		commandTwitchSubscriptionStatusValues: ['online', 'offline'],
		commandTwitchSubscriptionInvalidStatus: `${REDCROSS} Eh, esperaba o "online" o "offline", pero no pude entender lo que me dijiste.`,
		commandTwitchSubscriptionRequiredContent: `${REDCROSS} Mhmm, me pregunto qué quieres que mande cuando el usuario se conecta o algo, ¿puedes darme una pista?`,
		commandTwitchSubscriptionAddDuplicated: `${REDCROSS} Ya estás subscrito/a a este canal para el canal de texto y estado que especificaste.`,
		commandTwitchSubscriptionAddSuccessOffline: ({ name, channel }) =>
			`${GREENTICK} ¡Oído cocina! Cuando ${name} se desconecte, mandaré un mensaje nuevo en el canal ${channel}.`,
		commandTwitchSubscriptionAddSuccessLive: ({ name, channel }) =>
			`${GREENTICK} ¡Oído cocina! Cuando ${name} se conecte, mandaré un mensaje nuevo en el canal ${channel}.`,
		commandTwitchSubscriptionRemoveStreamerNotSubscribed: `${REDCROSS} Perdona, no puedes desubscribirte de un canal en el cual no estás subscrito/a. Por favor, subscríbete para poder desubscribirte.`,
		commandTwitchSubscriptionRemoveEntryNotExists: `${REDCROSS} Perdona, ya estás subscrito/a a este usuario, pero sus subscripciones no son publicadas en el canal de texto que especificaste.`,
		commandTwitchSubscriptionRemoveSuccessOffline: ({ name, channel }) =>
			`${GREENTICK} ¡Hecho! No mandaré más mensajes en el canal ${channel} cuando ${name} se desconecte.`,
		commandTwitchSubscriptionRemoveSuccessLive: ({ name, channel }) =>
			`${GREENTICK} ¡Hecho! No mandaré más mensajes en el canal ${channel} cuando ${name} se conecte.`,
		commandTwitchSubscriptionResetEmpty: `${REDCROSS} You were not subscribed to any streamer, mission abort!`,
		commandTwitchSubscriptionResetSuccess: ({ count }) => `${GREENTICK} Success! ${count} subscription has been removed from this server.`,
		commandTwitchSubscriptionResetSuccessPlural: ({ count }) =>
			`${GREENTICK} Success! ${count} subscriptions have been removed from this server.`,
		commandTwitchSubscriptionResetStreamerNotSubscribed: `${REDCROSS} You were not subscribed to this streamer, are you sure you got the right one?`,
		commandTwitchSubscriptionResetChannelSuccess: ({ name, count }) =>
			`${GREENTICK} Success! Removed ${count} subscription from the streamer ${name}.`,
		commandTwitchSubscriptionResetChannelSuccessPlural: ({ name, count }) =>
			`${GREENTICK} Success! Removed ${count} subscriptions from the streamer ${name}.`,
		commandTwitchSubscriptionShowStreamerNotSubscribed: `${REDCROSS} You wanted to see all subscriptions from this streamer, but there are none!`,
		commandTwitchSubscriptionShowStatus: ['Online', 'Offline'],
		commandTwitchSubscriptionShowEmpty: `${REDCROSS} There are no subscriptions, who will be the first?`,
		commandTwitchSubscriptionShowUnknownUser: 'Unknown',
		commandWikipediaNotfound: 'Lo siento, pero no he podido encontrar algo que coincida con el término que buscas a través de Wikipedia.',
		commandYoutubeNotfound: 'Lo siento, pero no he podido encontrar algo que coincida con el término que buscas a través de YouTube.',
		commandYoutubeIndexNotfound: 'Quizá quieras probar con un índice de página menor, porque no soy capaz de encontrar algo en éste.',
		commandDefineDescription: 'Busca la definición de una palabra en inglés.',
		commandDefineExtended: {
			extendedHelp: `¿Qué significa "heel"?`,
			explainedUsage: [['Word', 'La palabra o frase cuya definición quieres buscar.']],
			examples: ['heel']
		},
		commandDefineNotfound: 'No pude encontrar la definición de esta palabra.',
		commandDefinePronounciation: 'Pronunciación',
		commandDefineUnknown: 'Desconocido',

		/**
		 * #############
		 * WEEB COMMANDS
		 */

		commandWbang: ({ user }) => `Ey ${user}... ¡bang!`,
		commandWbanghead: '¡Golpeo de cabeza en progreso!',
		commandWbite: ({ user }) => `¡Mordiendo ${user}!`,
		commandWblush: '¡Le/a ruborizaste! 😊',
		commandWcry: ({ user }) => `Querido ${user}, ¿le/a hiciste llorar? 💔`,
		commandWcuddle: ({ user }) => `Ahí va un abracito para tí, ${user} 💞`,
		commandWdance: '¡Olé! 💃',
		commandWgreet: ({ user }) => `¡Buenas ${user}!`,
		commandWhug: ({ user }) => `¡Un abrazo! ${user} ❤`,
		commandWkiss: ({ user }) => `¡Un besito! ${user} 💜`,
		commandWlewd: '¡Demasiado lujurioso!',
		commandWlick: ({ user }) => `Lamiendo ${user} 👅`,
		commandWnom: 'Nom, nom, nom! 😊',
		commandWneko: 'Miau! 🐱',
		commandWpat: ({ user }) => `\\*Da palmaditas en la cabeza de ${user}\\* ❤`,
		commandWpout: '¿Oh?',
		commandWpunch: ({ user }) => `¡Dando un puñetazo a ${user}!`,
		commandWslap: ({ user }) => `¡Abofeteando ${user}!`,
		commandWsleepy: 'Durmiéndose...',
		commandWsmile: '¡Mostrando una risa radiante!',
		commandWsmug: '\\*Sonríe con superioridad\\*',
		commandWstare: ({ user }) => `Querido ${user}... hay alguien observándote 👀`,
		commandWthumbsup: '¡Tienes su pulgar hacia arriba!',
		commandWtickle: ({ user }) => `Cosquillitas para tí, ${user}!`,

		/**
		 * #################################
		 * #            MONITORS           #
		 * #################################
		 */

		constMonitorInvitelink: 'Enlace Invitación',
		constMonitorLink: 'Link Filtrado',
		constMonitorNms: '[NOMENTIONSPAM]',
		constMonitorWordfilter: 'Palabra Filtrada',
		constMonitorCapsfilter: 'Demasiadas Mayúsculas',
		constMonitorAttachmentfilter: 'Demasiados Documentos',
		constMonitorMessagefilter: 'Too Many Message Duplicates',
		constMonitorNewlinefilter: 'Too Many Lines',
		constMonitorReactionfilter: 'Reacción Eliminada',
		moderationMonitorAttachments: '[Auto-Moderation] Triggered attachment filter, no threshold.',
		moderationMonitorAttachmentsWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered attachment filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorCapitals: '[Auto-Moderation] Triggered capital filter, no threshold.',
		moderationMonitorCapitalsWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered capital filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorInvites: '[Auto-Moderation] Triggered invite filter, no threshold.',
		moderationMonitorInvitesWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered invite filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorLinks: '[Auto-Moderation] Triggered link filter, no threshold.',
		moderationMonitorLinksWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered link filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorMessages: '[Auto-Moderation] Triggered duplicated message filter, no threshold.',
		moderationMonitorMessagesWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered duplicated message filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorNewlines: '[Auto-Moderation] Triggered newline filter, no threshold.',
		moderationMonitorNewlinesWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered newline filter, reached ${amount} out of ${maximum} infractions.`,
		moderationMonitorWords: '[Auto-Moderation] Triggered word filter, no threshold.',
		moderationMonitorWordsWithMaximum: ({ amount, maximum }) =>
			`[Auto-Moderation] Triggered word filter, reached ${amount} out of ${maximum} infractions.`,
		monitorAttachmentFilter: ({ user }) => `${REDCROSS} Dear ${user}, file attachments aren't allowed here.`,
		monitorInviteFilterAlert: ({ user }) => `${REDCROSS} Querido ${user}, los enlaces de invitación no están permitidos aquí.`,
		monitorInviteFilterLog: ({ links }) => `**Enlace**: ${this.list(links, 'y')}`,
		monitorInviteFilterLogPlural: ({ links }) => `**Enlaces**: ${this.list(links, 'y')}`,
		monitorNolink: ({ user }) => `${REDCROSS} Perdona ${user}, los enlaces no están permitidos en este servidor.`,
		monitorWordFilterDm: ({ filtered }) =>
			`¡Parece que dijiste algo malo! Pero como te esforzaste en escribir el mensaje, te lo he mandado por aquí:\n${filtered}`,
		monitorCapsFilterDm: ({ message }) => `Speak lower! I know you need to express your thoughts. There is the message I deleted:\n${message}`,
		monitorWordFilter: ({ user }) => `${REDCROSS} Perdona, querido/a ${user}, pero has escrito algo que no está permitido en este servidor.`,
		monitorCapsFilter: ({ user }) => `${REDCROSS} ¡EEEEEEH ${user}! ¡POR FAVOR NO GRITE EN ESTE SITIO! ¡HAS SUPERADO EL LÍMITE DE MAYÚSCULAS!`,
		monitorMessageFilter: ({ user }) => `${REDCROSS} Woah woah woah, please stop re-posting so much ${user}!`,
		monitorNewlineFilter: ({ user }) => `${REDCROSS} Wall of text incoming from ${user}, wall of text taken down!`,
		monitorReactionsFilter: ({ user }) => `${REDCROSS} Hey ${user}, please do not add that reaction!`,
		monitorNmsMessage: ({ user }) => [
			`El MJOLNIR ha aterrizado y ahora, el usuario ${user.tag} cuya ID es ${user.id} ha sido baneado por spamming de menciones.`,
			'¡No te preocupes! ¡Estoy aquí para ayudarte! 😄'
		],
		monitorNmsModlog: ({ threshold }) => `[NOMENTIONSPAM] Automático: Límite de Spam de Menciones alcanzado.\nLímite: ${threshold}.`,
		monitorNmsAlert:
			'Ten cuidado con mencionar otra vez más, estás a punto de ser expulsado por exceder el límite de spam de menciones de este servidor.',
		monitorSocialAchievement: '¡Felicidades %MEMBER! ¡Has logrado el rol %ROLE%!',

		/**
		 * #################################
		 * #           INHIBITORS          #
		 * #################################
		 */

		inhibitorSpam: ({ channel }) =>
			`¿Podemos movernos al canal ${channel}, por favor? Este comando puede ser muy molesto y arruinar las conversaciones de otras personas.`,

		/**
		 * #################################
		 * #              GAMES            #
		 * #################################
		 */

		hgBloodbath: [
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
		],
		hgDay: [
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
		],
		hgNight: [
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
		],

		/**
		 * #################################
		 * #          SERIALIZERS          #
		 * #################################
		 */

		serializerAutoRoleInvalid: 'Invalid autorole data.',
		serializerCommandAutoDeleteInvalid: 'Invalid command auto-delete data.',
		serializerPermissionNodeDuplicatedCommand: ({ command }) => `You have set \`${command}\` twice, either allow it, or deny it.`,
		serializerPermissionNodeInvalidCommand: ({ command }) => `The command \`${command}\` does not exist or is invalid.`,
		serializerPermissionNodeInvalidTarget: 'No data could be found from the ID.',
		serializerPermissionNodeInvalid: 'Invalid data.',
		serializerPermissionNodeSecurityEveryoneAllows: 'For security, the everyone role cannot have allows.',
		serializerPermissionNodeSecurityGuarded: ({ command }) =>
			`For security and for me to work properly, you cannot deny the usage for the command \`${command}\`.`,
		serializerPermissionNodeSecurityOwner: 'You cannot set permission overrides on the server owner.',
		serializerReactionRoleInvalid: 'Invalid reaction role data.',
		serializerStickyRoleInvalid: 'Invalid sticky role data.',
		serializerTriggerAliasInvalid: 'Invalid trigger alias data.',
		serializerTriggerIncludeInvalid: 'Invalid trigger includes data.',
		serializerTriggerIncludeInvalidAction: 'Invalid trigger action.',
		serializerTwitchSubscriptionInvalidStreamer: 'Invalid data streamer.',
		serializerTwitchSubscriptionInvalid: 'Invalid data.',
		serializerUniqueRoleSetInvalid: 'Invalid unique role set data.',
		serializerUnsupported: 'This configuration key cannot be updated via Discord at the moment, please use the dashboard at <https://skyra.pw>!',
		serializerCustomCommandInvalidId: 'The property "id" must be a string.',
		serializerCustomCommandInvalidEmbed: 'The property "embed" must be a boolean.',
		serializerCustomCommandInvalidColor: 'The property "color" must be a number.',
		serializerCustomCommandInvalidContent: 'The property "content" must be a string.',
		serializerCustomCommandInvalidArgs: 'The property "args" must be an array of strings.',
		serializerDisabledCommandChannelsChannelsDoesNotExist: 'The channel does not exist.',
		serializerDisabledCommandChannelsChannelsCommandDoesNotExist: ({ name }) => `The command \`${name}\` does not exist.`,

		/**
		 * #################################
		 * #        NOTIFICATIONS          #
		 * #################################
		 */
		notificationsTwitchNoGameName: '*Nombre del juego no establecido*',
		notificationsTwitchEmbedDescription: ({ userName }) => `${userName} ya está en vivo!`,
		notificationsTwitchEmbedDescriptionWithGame: ({ userName, gameName }) => `${userName} ya está en vivo - ¡transmitiendo ${gameName}!`,
		notificationTwitchEmbedFooter: 'Skyra Twitch Notificaciones',

		/**
		 * #################################
		 * #             UTILS             #
		 * #################################
		 */

		selfModerationCommandInvalidMissingAction: ({ name }) =>
			`${REDCROSS} Action must be any of the following: \`enable\`, \`disable\`, \`action\`, \`punish\`, \`punish-duration\`, \`threshold-maximum\`, \`threshold-duration\`, or \`show\`. Check \`Skyra, help ${name}\` for more information.`,
		selfModerationCommandInvalidMissingArguments: ({ name }) =>
			`${REDCROSS} The specified action requires an extra argument to be passed. Check \`Skyra, help ${name}\` for more information.`,
		selfModerationCommandInvalidSoftaction: ({ name }) =>
			`${REDCROSS} Value must be any of the following: \`alert\`, \`log\`, or \`delete\`. Check \`Skyra, help ${name}\` for more information.`,
		selfModerationCommandInvalidHardaction: ({ name }) =>
			`${REDCROSS} Value must be any of the following: \`none\`, \`warn\`, \`mute\`, \`kick\`, \`softban\`, or \`ban\`. Check \`Skyra, help ${name}\` for more information.`,
		selfModerationCommandEnabled: `${GREENTICK} Successfully enabled sub-system.`,
		selfModerationCommandDisabled: `${GREENTICK} Successfully disabled sub-system.`,
		selfModerationCommandSoftAction: `${GREENTICK} Successfully disabled actions.`,
		selfModerationCommandSoftActionWithValue: ({ value }) => `${GREENTICK} Successfully set actions to: \`${value}\``,
		selfModerationCommandHardAction: ({ value }) => `${GREENTICK} Successfully set punishment: ${value}`,
		selfModerationCommandHardActionDuration: `${GREENTICK} Successfully removed the punishment appeal timer.`,
		selfModerationCommandHardActionDurationWithValue: ({ value }) =>
			`${GREENTICK} Successfully set the punishment appeal timer to: ${this.duration(value)}`,
		selfModerationCommandThresholdMaximum: `${GREENTICK} Successfully removed the threshold maximum, punishment will take place instantly if set.`,
		selfModerationCommandThresholdMaximumWithValue: ({ value }) => `${GREENTICK} Successfully set the threshold maximum to: ${value}`,
		selfModerationCommandThresholdDuration: `${GREENTICK} Successfully removed the threshold duration, punishments will take place instantly if set.`,
		selfModerationCommandThresholdDurationWithValue: ({ value }) =>
			`${GREENTICK} Successfully set the threshold duration to: ${this.duration(value)}`,
		selfModerationCommandShow: ({
			kEnabled,
			kAlert,
			kLog,
			kDelete,
			kHardAction,
			hardActionDurationText,
			thresholdMaximumText,
			thresholdDurationText
		}) => [
			`Enabled      : ${kEnabled}`,
			'Action',
			` - Alert     : ${kAlert}`,
			` - Log       : ${kLog}`,
			` - Delete    : ${kDelete}`,
			'Punishment',
			` - Type      : ${kHardAction}`,
			` - Duration  : ${hardActionDurationText}`,
			'Threshold',
			` - Maximum   : ${thresholdMaximumText}`,
			` - Duration  : ${thresholdDurationText}`
		],
		selfModerationCommandShowDurationPermanent: 'Permanent',
		selfModerationCommandShowUnset: 'Unset',
		selfModerationSoftActionAlert: 'Alert',
		selfModerationSoftActionLog: 'Log',
		selfModerationSoftActionDelete: 'Delete',
		selfModerationHardActionBan: 'Ban',
		selfModerationHardActionKick: 'Kick',
		selfModerationHardActionMute: 'Mute',
		selfModerationHardActionSoftban: 'SoftBan',
		selfModerationHardActionWarning: 'Warning',
		selfModerationHardActionNone: 'None',
		selfModerationEnabled: 'Yes',
		selfModerationDisabled: 'No',
		selfModerationMaximumTooShort: ({ minimum, value }) => `${REDCROSS} The value (${value}) was too short, expected at least ${minimum}.`,
		selfModerationMaximumTooLong: ({ maximum, value }) => `${REDCROSS} The value (${value}) was too long, expected maximum ${maximum}.`,
		selfModerationDurationTooShort: ({ minimum, value }) =>
			`${REDCROSS} The value (${this.duration(value)}) was too short, expected at least ${this.duration(minimum)}.`,
		selfModerationDurationTooLong: ({ maximum, value }) =>
			`${REDCROSS} The value (${this.duration(value)}) was too long, expected maximum ${this.duration(maximum)}.`,

		moderationActions: {
			addRole: 'Added Role',
			mute: 'Mute',
			ban: 'Ban',
			kick: 'Kick',
			softban: 'Softban',
			vkick: 'Voice Kick',
			vmute: 'Voice Mute',
			restrictedReact: 'Reaction Restriction',
			restrictedEmbed: 'Embed Restriction',
			restrictedAttachment: 'Attachment Restriction',
			restrictedVoice: 'Voice Restriction',
			setNickname: 'Set Nickname',
			removeRole: 'Remove Role'
		},
		actionApplyReason: ({ action, reason }) => `[Action] Applied ${action} | Reason: ${reason}`,
		actionApplyNoReason: ({ action }) => `[Action] Applied ${action}`,
		actionRevokeReason: ({ action, reason }) => `[Action] Revoked ${action} | Reason: ${reason}`,
		actionRevokeNoReason: ({ action }) => `[Action] Revoked ${action}`,
		actionSetNicknameSet: ({ reason }) => `[Action] Set Nickname | Reason: ${reason}`,
		actionSetNicknameRemoved: ({ reason }) => `[Action] Removed Nickname | Reason: ${reason}`,
		actionSetNicknameNoReasonSet: `[Action] Set Nickname.`,
		actionSetNicknameNoReasonRemoved: `[Action] Removed Nickname.`,
		actionSoftbanNoReason: '[Action] Applying Softban.',
		actionSoftbanReason: ({ reason }) => `[Action] Applying Softban | Reason: ${reason}`,
		actionUnSoftbanNoReason: '[Action] Applied Softban.',
		actionUnSoftbanReason: ({ reason }) => `[Action] Applied Softban | Reason: ${reason}`,
		actionRequiredMember: 'The user does not exist or is not in this server.',
		actionSetupMuteExists: '**Cancelando la creación del rol de silenciado**: Ya existe un rol de silenciado.',
		actionSetupRestrictionExists: '**Cancelando la creación del rol de restricción**: Ya existe un rol de restricción.',
		actionSetupTooManyRoles: '**Cancelando la creación del rol**: Hay 250 roles en este servidor, necesitas borrar uno.',
		actionSharedRoleSetupExisting: 'I could not find a configured role. Do you want to configure an existing one?',
		actionSharedRoleSetupExistingName: 'Please give me the name of the role you want to use for further actions of this type.',
		actionSharedRoleSetupNew: 'Do you want me to create a new role and configure it automatically?',
		actionSharedRoleSetupAsk: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} channel to apply the role ${role} the following permission: ${permissions}?`,
		actionSharedRoleSetupAskMultipleChannels: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} channels to apply the role ${role} the following permission: ${permissions}?`,
		actionSharedRoleSetupAskMultiplePermissions: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} channel to apply the role ${role} the following permissions: ${permissions}?`,
		actionSharedRoleSetupAskMultipleChannelsMultiplePermissions: ({ role, channels, permissions }) =>
			`${LOADING} Can I modify ${channels} channels to apply the role ${role} the following permissions: ${permissions}?`,
		muteNotConfigured: 'The muted role must be configured for this action to happen.',
		restrictionNotConfigured: 'The restriction role must be configured for this action to happen',
		muteNotInMember: 'The muted role is not set in the member.',
		muteLowHierarchy: 'I cannot mute a user which higher role hierarchy than me.',
		muteCannotManageRoles: `I must have **${this.PERMISSIONS.MANAGE_ROLES}** permissions to be able to mute.`,
		muteNotExists: 'The specified user is not muted.',

		resolverDateSuffix: ' segundos',
		resolverPositiveAmount: 'You must give me a positive number.',
		systemPoweredByWeebsh: 'Powered by weeb.sh',
		prefixReminder: ({ prefix }) => `El prefijo de este servidor está configurado a: \`${prefix}\``,

		unexpectedIssue: '¡Algo inesperado pasó! Cancelando este comando...',

		commandDmNotSent: 'No te he podido enviar el mensaje en mensaje directo... ¿me has bloqueado?',
		commandDmSent: 'Te he enviado la información a través de un mensaje directo.',
		commandRoleHigherSkyra: 'El miembro seleccionado tiene una posición jerárquica más alta o igual que el mío.',
		commandRoleHigher: 'El miembro seleccionado tiene una posición jerárquica más alta o igual al tuyo.',
		commandSuccess: 'Ejecutado el comando con éxito.',
		commandToskyra: '¿Por qué...? ¡Pensaba que me amabas! 💔',
		commandUserself: '¿Por qué te harías eso a tí mismo?',

		systemParseError: `${REDCROSS} I failed to process the data I was given, sorry~!`,
		systemHighestRole: 'La posición del rol es más alta o equivalente al mío, por lo tanto no puedo concederlo a nadie.',
		systemChannelNotPostable: 'No tengo permisos para mandar mensajes a éste canal.',
		systemFetchbansFail: `He fallado al buscar la lista de baneos. ¿Tengo el permiso **${this.PERMISSIONS.BAN_MEMBERS}**?`,
		systemLoading: [
			`${LOADING} Observando a los hamsters correr...`,
			`${LOADING} Encontrando a los jugadores en el escondite...`,
			`${LOADING} Intentando resolver este comando...`,
			`${LOADING} Buscando data desde la nube...`,
			`${LOADING} Calibrando lentes...`,
			`${LOADING} Jugando a Piedra, Papel, Tijeras...`
		],
		systemError: `¡Algo malo sucedio! Inténtalo de nuevo, o si el problema continúa, únete al servidor de soporte (sugerencia: usa \`Skyra, support\`)`,
		systemDatabaseError: `¡No pude conseguir eso en mi base de datos! Inténtalo de nuevo, o si el problema continúa, únete al servidor de soporte (sugerencia: usa \`Skyra, support\`)`,
		systemDiscordAborterror: 'He tenido un pequeño error de red al mandar un mensaje a Discord, ¡por favor ejecuta el comando de nuevo!',
		systemMessageNotFound: 'Lo siento, pero la id del mensaje que escribiste no era correcto, o el mensaje fue borrado.',
		systemNotenoughParameters: 'Lo siento, pero no proporcionaste suficientes parámetros...',
		systemQueryFail: 'Lo siento, pero la aplicación no pudo resolver su solicitud. ¿Estás seguro/a que escribiste el nombre correctamente?',
		systemNoResults: 'No pude encontrar ningún resultado para esa consulta',
		systemCannotAccessChannel: 'Lo siento, pero no tienes permiso para ver ese canal.',
		systemExceededLengthOutput: ({ output }) => `**Salida**:${output}`,
		systemExceededLengthOutputWithTypeAndTime: ({ output, time, type }) => `**Salida**:${output}\n**Type**:${type}\n${time}`,
		systemExceededLengthOutputConsole: ({}) => `Enviado el resultado a la consola.`,
		systemExceededLengthOutputConsoleWithTypeAndTime: ({ time, type }) => `Enviado el resultado a la consola.\n**Type**:${type}\n${time}`,
		systemExceededLengthOutputFile: ({}) => `Enviado el resultado como un archivo.`,
		systemExceededLengthOutputFileWithTypeAndTime: ({ time, type }) => `Enviado el resultado como un archivo.\n**Type**:${type}\n${time}`,
		systemExceededLengthOutputHastebin: ({ url }) => `Enviado el resultado a hastebin: ${url}`,
		systemExceededLengthOutputHastebinWithTypeAndTime: ({ url, time, type }) =>
			`Enviado el resultado a hastebin: ${url}\n**Type**:${type}\n${time}`,
		systemExceededLengthChooseOutput: ({ output }) => `Elija una de las siguientes opciones: ${this.list(output, 'o')}`,
		systemExternalServerError: 'El servicio externo que utilizamos no pudo procesar nuestro mensaje, por favor, inténtelo de nuevo más tarde.',
		systemPokedexExternalResource: 'Recursos Externos',

		jumpTo: 'Salta al Mensaje ►',

		resolverInvalidChannelName: ({ name }) => `${name} debe ser una mención, nombre, o id válido de un canal.`,
		resolverInvalidRoleName: ({ name }) => `${name} debe ser una mención, nombre, o id válido de un rol.`,
		resolverInvalidUsername: ({ name }) => `${name} debe ser una mención, nombre, o id válido de un usuario.`,
		resolverChannelNotInGuild: 'Lo siento, pero ese comando solo se puede ejecutar en un servidor.',
		resolverChannelNotInGuildSubcommand: ({ command, subcommand }) =>
			`${REDCROSS} Lo siento, pero la subcommandos \`${subcommand}\` para el comando \`${command}\` solo se puede ejecutar en un servidor.`,
		resolverMembernameUserLeftDuringPrompt: 'El usuario salió durante la selección de usuarios.',

		listifyPage: ({ page, pageCount, results }) => `Página ${page} / ${pageCount} | ${results} Resultados`,

		moderationLogAppealed: `${REDCROSS} Lo siento, pero el caso de moderación ha expirado o no se puede temporizar.`,
		moderationLogExpiresIn: ({ duration }) => `\n❯ **Caduca en**: ${this.duration(duration)}`,
		moderationLogDescription: ({ data: { caseID, formattedDuration, prefix, reason, type, userDiscriminator, userID, userName } }) =>
			[
				`❯ **Tipo**: ${type}`,
				`❯ **Usuario:** ${userName}#${userDiscriminator} (${userID})`,
				`❯ **Razón:** ${reason || `Por favor use \`${prefix}reason ${caseID} <razón>\` para establecer la razón.`}${formattedDuration}`
			].join('\n'),
		moderationLogFooter: ({ caseID }) => `Caso ${caseID}`,
		moderationCaseNotExists: () => `${REDCROSS} Lo siento, pero el caso de moderación seleccionado no existe.`,
		ModerationCaseNotExistsPlural: () => `${REDCROSS} Lo siento, pero los casos de moderación seleccionados no existen.`,

		guildSettingsChannelsMod: 'Necesitas configurar un canal de moderación. Utiliza `Skyra, settings set channels.modlog <NombreDeCanal>`.',
		guildSettingsRolesRestricted: ({ prefix, path }) =>
			`${REDCROSS} You need to configure a role for this action, use \`${prefix}settings set ${path} <rolename>\` to set it up.`,
		guildMuteNotFound:
			'He fallado al buscar un caso de moderación que justifique el mute del usuario. O el usuario nunca ha sido muteado, o todos sus muteos están reclamados.',
		guildBansEmpty: 'No hay baneos registrados en este servidor.',
		guildBansNotFound: 'Intenté y fallé al buscar el usuario. ¿Estás seguro de que está expulsado/a?.',
		channelNotReadable: `Lo siento, pero necesito los permisos **${this.PERMISSIONS.VIEW_CHANNEL}** y **${this.PERMISSIONS.READ_MESSAGE_HISTORY}** para poder leer los mensajes.`,

		userNotInGuild: 'El usuario no está en este servidor.',
		userNotExistent: 'El usuario no parece existir. ¿Estás seguro/a que es una ID de usuario válida?',

		eventsGuildMemberAdd: 'Nuevo Usuario',
		eventsGuildMemberAddMute: 'Nuevo Usuario Muteado',
		eventsGuildMemberAddDescription: ({ mention, time }) => `${mention} | **Se Unió a Discord**: Hace ${this.duration(time, 2)}.`,
		eventsGuildMemberRemove: 'Usuario Salió',
		eventsGuildMemberKicked: 'Usuario Pateado',
		eventsGuildMemberBanned: 'Usuario Baneado',
		eventsGuildMemberSoftBanned: 'Usuario Levemente Baneado',
		eventsGuildMemberRemoveDescription: ({ mention }) => `${mention} | **Se Unió al Servidor**: Desconocido.`,
		eventsGuildMemberRemoveDescriptionWithJoinedAt: ({ mention, time }) =>
			`${mention} | **Se Unió al Servidor**: Hace ${this.duration(time, 2)}.`,
		eventsGuildMemberUpdateNickname: ({ previous, current }) => `Actualizado el apodo de **${previous}** a **${current}**`,
		eventsGuildMemberAddedNickname: ({ current }) => `Añadido un nuevo apodo **${current}**`,
		eventsGuildMemberRemovedNickname: ({ previous }) => `Eliminado el apodo **${previous}**`,
		eventsNicknameUpdate: 'Nickname Edited',
		eventsUsernameUpdate: 'Username Edited',
		eventsNameUpdatePreviousWasSet: ({ previousName }) => `**Previous**: \`${previousName}\``,
		eventsNameUpdatePreviousWasNotSet: () => `**Previous**: Unset`,
		eventsNameUpdateNextWasSet: ({ nextName }) => `**Next**: \`${nextName}\``,
		eventsNameUpdateNextWasNotSet: () => `**Next**: Unset`,
		eventsGuildMemberNoUpdate: 'No update detected',
		eventsGuildMemberAddedRoles: ({ addedRoles }) => `**Added role**: ${addedRoles}`,
		eventsGuildMemberAddedRolesPlural: ({ addedRoles }) => `**Added roles**: ${addedRoles}`,
		eventsGuildMemberRemovedRoles: ({ removedRoles }) => `**Removed role**: ${removedRoles}`,
		eventsGuildMemberRemovedRolesPlural: ({ removedRoles }) => `**Removed roles**: ${removedRoles}`,
		eventsRoleUpdate: 'Roles Edited',
		eventsMessageUpdate: 'Mensaje Editado',
		eventsMessageDelete: 'Mensaje Eliminado',
		eventsReaction: 'Reacción Añadida',
		eventsCommand: ({ command }) => `Comando Usado: ${command}`,

		settingsDeleteChannelsDefault: 'Restablecido el valor para la clave `channels.default`',
		settingsDeleteRolesInitial: 'Restablecido el valor para la clave `roles.initial`',
		settingsDeleteRolesMute: 'Restablecido el valor para la clave `roles.muted`',

		modlogTimed: ({ remaining }) => `Este caso de moderación ya había sido temporizado. Expira en ${this.duration(remaining)}`,

		guildWarnNotFound: 'Fallé al buscar el caso de moderación para su reclamación. O no existe, o no es una advertencia, o ya estaba reclamada.',
		guildMemberNotVoicechannel: 'No puedo tomar acción en un miembro que no está conectado a un canal de voz.',

		promptlistMultipleChoice: ({ list, count }) =>
			`He encontrado ${count} resultado. Por favor escriba un número entre 1 y ${count}, o escriba **"CANCELAR"** para cancelar la solicitud.\n${list}`,
		promptlistMultipleChoicePlural: ({ list, count }) =>
			`He encontrado ${count} resultados. Por favor escriba un número entre 1 y ${count}, o escriba **"CANCELAR"** para cancelar la solicitud.\n${list}`,
		promptlistAttemptFailed: ({ list, attempt, maxAttempts }) => `Valor inválido. Intento **${attempt}** de **${maxAttempts}**\n${list}`,
		promptlistAborted: 'Cancelada la solicitud con éxito.',

		fuzzySearchMatches: ({ matches, codeblock }) =>
			`¡Encontré múltiples resultados! **Por favor selecciona un número entre 0 y ${matches}**:\n${codeblock}\nEscribe **ABORT** para cancelar la solicitud.`,
		fuzzySearchAborted: 'Successfully aborted the prompt.',
		fuzzySearchInvalidNumber: 'Esperaba que me dieras un número de un dígito, pero recibí una patata.',
		fuzzySearchInvalidIndex: 'Cancelando solicitud... El número no estaba dentro del rango.',

		eventsErrorWtf: '¡Vaya fallo más terrible! ¡Lo siento!',
		eventsErrorString: ({ mention, message }) => `Querido ${mention}, ${message}`,

		constUsers: 'Usuarios',
		unknownChannel: 'Canal desconocido',
		unknownRole: 'Rol desconocido',
		unknownUser: 'Usuario desconocido'
	};

	public async init() {
		// noop
	}
}
