import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import {
	CurrentCondition,
	getColors,
	getData,
	getFile,
	getIcons,
	resolveCurrentConditionsImperial,
	resolveCurrentConditionsSI,
	ResolvedConditions,
	resolveWeatherName
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
		const data = await getData(await args.rest('string'));
		const [current] = data.current_condition;

		const resolved = useImperial ? resolveCurrentConditionsImperial(current, args.t) : resolveCurrentConditionsSI(current, args.t);
		const [nearestArea] = data.nearest_area;
		const place = `${nearestArea.areaName[0].value}, ${nearestArea.country[0].value}`;

		const attachment = await this.draw(place, current, resolved);
		return message.channel.send({ files: [{ attachment, name: 'weather.png' }] });
	}

	private async draw(place: string, conditions: CurrentCondition, resolved: ResolvedConditions) {
		const weatherDescription = conditions.weatherDesc[0].value;
		const weatherName = resolveWeatherName(weatherDescription);
		const { background, text, theme } = getColors(weatherDescription);

		const [conditionImage, icons] = await Promise.all([getFile(weatherDescription), getIcons(theme)]);
		const { coordinates } = UserCommand;
		const { columns, rows } = coordinates;

		const imageSize = 128;
		const halfImageSize = imageSize / 2;

		const iconSize = 32;
		const halfIconSize = iconSize / 2;
		const iconMargin = iconSize + 6;

		return (
			new Canvas(400, 230)
				.save()
				.setShadowColor('rgba(0,0,0,.7)')
				.setShadowBlur(7)
				.setColor(background)
				.createRoundedPath(
					coordinates.margin,
					coordinates.margin,
					coordinates.margin + coordinates.contentWidth,
					coordinates.margin + coordinates.contentHeight,
					coordinates.margin / 2
				)
				.fill()
				.restore()

				// Place Name
				.setTextFont('16px Roboto')
				.setColor(text)
				.printResponsiveText(place, columns[0].left, rows[0].bottom, coordinates.contentWidth)

				// Weather Icon
				.printImage(conditionImage, columns[0].center - halfImageSize, rows[2].bottom - halfImageSize)

				// Weather Name
				.printText(weatherName, columns[1].left, rows[1].bottom)

				// Temperature
				.printImage(icons.temperature, columns[1].left, rows[2].bottom, iconSize, iconSize)
				.printText(resolved.temperature, columns[1].left + iconMargin, rows[2].bottom)

				// Wind
				.save()
				.translate(columns[2].left + halfIconSize, rows[2].bottom - halfIconSize)
				.rotate(radians(Number(conditions.winddirDegree)))
				.printImage(icons.pointer, 0, 0, iconSize, iconSize)
				.restore()
				.printText(resolved.temperature, columns[2].left + iconMargin, rows[2].bottom)

				// Precipitation
				.printImage(icons.precipitation, columns[1].left, rows[3].bottom, iconSize, iconSize)
				.printText(resolved.precipitation, columns[1].left + iconMargin, rows[3].bottom)

				// Visibility
				.printImage(icons.visibility, columns[2].left, rows[3].bottom, iconSize, iconSize)
				.printText(resolved.visibility, columns[2].left + iconMargin, rows[3].bottom)

				.toBufferAsync()
		);
	}

	private static coordinates = this.resolveCoordinates();
	private static resolveCoordinates(): Coordinates {
		const width = 450;
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
