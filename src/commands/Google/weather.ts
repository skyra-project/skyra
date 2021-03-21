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
	ResolvedConditions
} from '#lib/weather';
import { radians } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Canvas } from 'canvas-constructor';
import type { Message } from 'discord.js';

const flags = ['fahrenheit', 'f', 'imperial', 'i'];

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 120,
	description: LanguageKeys.Commands.Google.WeatherDescription,
	extendedHelp: LanguageKeys.Commands.Google.WeatherExtended,
	permissions: ['ATTACH_FILES'],
	strategyOptions: { flags }
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const useImperial = args.getFlags(...flags);
		const data = await getData(await args.rest('string'), args.t.lng);
		const [current] = data.current_condition;

		const resolved = useImperial ? resolveCurrentConditionsImperial(current, args.t) : resolveCurrentConditionsSI(current, args.t);
		const [nearestArea] = data.nearest_area;
		const place = `${nearestArea.region[0].value}, ${nearestArea.country[0].value}`;

		const attachment = await this.draw(place, current, resolved);
		return message.channel.send({ files: [{ attachment, name: 'weather.png' }] });
	}

	private async draw(place: string, conditions: CurrentCondition, resolved: ResolvedConditions) {
		const weatherDescription = conditions.weatherDesc[0].value;
		const weatherName = getWeatherName(conditions.weatherCode);
		const { background, text, theme } = getColors(weatherName);

		const [conditionImage, icons] = await Promise.all([getFile(weatherName), getIcons(theme)]);
		const { coordinates } = UserCommand;
		const { columns, rows } = coordinates;

		const imageSize = 128;
		const halfImageSize = imageSize / 2;

		const iconSize = 32;
		const halfIconSize = iconSize / 2;
		const iconMargin = iconSize + 6;

		return (
			new Canvas(coordinates.width, coordinates.height)
				.save()
				.setShadowColor('rgba(0,0,0,.7)')
				.setShadowBlur(coordinates.margin / 2)
				.setColor(background)
				.createRoundedPath(
					coordinates.margin,
					coordinates.margin,
					coordinates.contentWidth,
					coordinates.contentHeight,
					coordinates.margin / 2
				)
				.fill()
				.restore()

				// Place Name
				.setTextFont('24px RobotoRegular')
				.setTextBaseline('middle')
				.setColor(text)
				.printResponsiveText(place, coordinates.margin * 2, rows[0].center, coordinates.contentWidth - coordinates.margin * 2)

				// Weather Icon
				.setTextFont('20px RobotoLight')
				.printImage(conditionImage, columns[0].center - halfImageSize, rows[2].center - halfImageSize)

				// Weather Name
				.printText(weatherDescription, columns[1].left, rows[1].center)

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

				.toBufferAsync()
		);
	}

	private static coordinates = this.resolveCoordinates();
	private static resolveCoordinates(): Coordinates {
		const width = 480;
		const height = 250;
		const margin = 15;

		const contentWidth = width - margin * 2;
		const contentHeight = height - margin * 2;

		const amountColumns = 3;
		const amountRows = 4;

		const columnWidth = contentWidth / amountColumns;
		const rowHeight = contentHeight / amountRows;

		const columns: Column[] = [];
		for (let x = 0; x < amountColumns; ++x) {
			const left = Math.ceil(x * columnWidth) + margin;
			const center = Math.round((x + 0.5) * columnWidth) + margin;
			const right = Math.floor((x + 1) * columnWidth) + margin;
			columns.push({ left, center, right });
		}

		const rows: Row[] = [];
		for (let y = 0; y < amountRows; ++y) {
			const top = Math.ceil(y * rowHeight) + margin;
			const center = Math.round((y + 0.5) * rowHeight) + margin;
			const bottom = Math.floor((y + 1) * rowHeight) + margin;
			rows.push({ top, center, bottom });
		}

		return { width, height, margin, contentWidth, contentHeight, columns, rows };
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
	contentWidth: number;
	contentHeight: number;
	columns: Column[];
	rows: Row[];
}
