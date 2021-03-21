import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import {
	CurrentCondition,
	getColors,
	getData,
	getFile,
	getIcons,
	getWeatherName,
	resolveCurrentConditionsImperial,
	resolveCurrentConditionsSI,
	ResolvedConditions,
	ValueWrapper
} from '#lib/weather';
import { baseLanguage, countryLanguage, radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Canvas } from 'canvas-constructor';
import type { Message } from 'discord.js';

const imperial = ['fahrenheit', 'f', 'imperial', 'i'];
const metric = ['celsius', 'c', 'metric', 'm'];

// United States (en-US), Liberia (en-LR), and Myanmar (my-MM) are the only countries in the world that use Imperial:
const imperialCountries = ['US', 'LR', 'MM'];

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 60,
	description: LanguageKeys.Commands.Google.WeatherDescription,
	extendedHelp: LanguageKeys.Commands.Google.WeatherExtended,
	permissions: ['ATTACH_FILES'],
	strategyOptions: { flags: [...imperial, ...metric] }
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const useImperial = this.shouldUseImperial(args);
		const base = baseLanguage(args.t.lng);
		const data = await getData(await args.rest('string'), base);
		const [current] = data.current_condition;

		const resolved = useImperial ? resolveCurrentConditionsImperial(current, args.t) : resolveCurrentConditionsSI(current, args.t);
		const [nearestArea] = data.nearest_area;

		// Region can be an empty string, e.g. `Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu`:
		const place = `${nearestArea.region[0].value || nearestArea.areaName[0].value}, ${nearestArea.country[0].value}`;
		const weatherDescription = this.getWeatherDescription(current, base);

		const attachment = await this.draw(weatherDescription, place, current, resolved);
		return message.channel.send({ files: [{ attachment, name: 'weather.png' }] });
	}

	private shouldUseImperial(args: SkyraCommand.Args) {
		if (args.getFlags(...imperial)) return true;
		if (args.getFlags(...metric)) return false;
		return imperialCountries.includes(countryLanguage(args.t.lng));
	}

	private getWeatherDescription(conditions: CurrentCondition, base: string) {
		const translated = Reflect.get(conditions, `lang_${base}`) as ValueWrapper[] | undefined;
		return translated?.[0].value ?? conditions.weatherDesc[0].value;
	}

	private async draw(weatherDescription: string, place: string, conditions: CurrentCondition, resolved: ResolvedConditions) {
		const weatherName = getWeatherName(conditions.weatherCode);
		const { background, text, theme } = getColors(weatherName);

		const [conditionImage, icons] = await Promise.all([getFile(weatherName), getIcons(theme)]);
		const { width, height, cardWidth, cardHeight, margin, columns, rows } = UserCommand.coordinates;

		const imageSize = 128;
		const halfImageSize = imageSize / 2;

		const iconSize = 32;
		const halfIconSize = iconSize / 2;
		const iconMargin = iconSize + 10;

		return (
			new Canvas(width, height)
				.save()
				.setShadowColor('rgba(0,0,0,.7)')
				.setShadowBlur(margin)
				.setColor(background)
				.createRoundedPath(margin, margin, cardWidth, cardHeight, margin / 2)
				.fill()
				.restore()

				// Place Name
				.setTextFont('24px RobotoRegular')
				.setTextBaseline('middle')
				.setColor(text)
				.printResponsiveText(place, columns[0].left, rows[0].center, columns[2].right - columns[0].left)

				// Weather Icon
				.setTextFont('20px RobotoLight')
				.printImage(conditionImage, columns[0].center - halfImageSize, rows[2].center - halfImageSize)

				// Temperature
				.printImage(icons.temperature, columns[1].left, rows[2].center - halfIconSize)
				.printText(resolved.temperature, columns[1].left + iconMargin, rows[2].center)

				// Wind
				.save()
				.translate(columns[2].left + halfIconSize, rows[2].center)
				.rotate(radians(Number(conditions.winddirDegree)) + Math.PI)
				.printImage(icons.pointer, -halfIconSize, -halfIconSize)
				.restore()
				.printText(resolved.windSpeed, columns[2].left + iconMargin, rows[2].center)

				// Precipitation
				.printImage(icons.precipitation, columns[1].left, rows[3].center - halfIconSize)
				.printText(resolved.precipitation, columns[1].left + iconMargin, rows[3].center)

				// Visibility
				.printImage(icons.visibility, columns[2].left, rows[3].center - halfIconSize)
				.printText(resolved.visibility, columns[2].left + iconMargin, rows[3].center)

				// Weather Name
				.printResponsiveText(weatherDescription, columns[1].left, rows[1].center, columns[2].right - columns[1].left)

				.toBufferAsync()
		);
	}

	private static coordinates = this.resolveCoordinates();
	private static resolveCoordinates(): Coordinates {
		const width = 540;
		const height = 260;
		const margin = 15;

		const cardWidth = width - margin * 2;
		const cardHeight = height - margin * 2;

		const contentWidth = cardWidth - margin * 2;
		const contentHeight = cardHeight - margin * 2;

		const contentMargin = margin * 2;

		const amountColumns = 3;
		const amountRows = 4;

		const columnWidth = contentWidth / amountColumns;
		const rowHeight = contentHeight / amountRows;

		const columns: Column[] = [];
		for (let x = 0; x < amountColumns; ++x) {
			const left = Math.ceil(x * columnWidth) + contentMargin;
			const center = Math.round((x + 0.5) * columnWidth) + contentMargin;
			const right = Math.floor((x + 1) * columnWidth) + contentMargin;
			columns.push({ left, center, right });
		}

		const rows: Row[] = [];
		for (let y = 0; y < amountRows; ++y) {
			const top = Math.ceil(y * rowHeight) + contentMargin;
			const center = Math.round((y + 0.5) * rowHeight) + contentMargin;
			const bottom = Math.floor((y + 1) * rowHeight) + contentMargin;
			rows.push({ top, center, bottom });
		}

		return { width, height, margin, cardWidth, cardHeight, contentWidth, contentHeight, columns, rows };
	}
}

interface Column {
	left: number;
	center: number;
	right: number;
}

interface Row {
	top: number;
	center: number;
	bottom: number;
}

interface Coordinates {
	width: number;
	height: number;
	margin: number;
	cardWidth: number;
	cardHeight: number;
	contentWidth: number;
	contentHeight: number;
	columns: Column[];
	rows: Row[];
}
