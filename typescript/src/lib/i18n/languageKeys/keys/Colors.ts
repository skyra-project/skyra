import { FT } from '#lib/types';

export const InvalidBase10 = FT<{ value: number }>('colors:invalidBase10');
export const InvalidHexRed = FT<{ value: string }>('colors:invalidHexRed');
export const InvalidHexGreen = FT<{ value: string }>('colors:invalidHexGreen');
export const InvalidHexBlue = FT<{ value: string }>('colors:invalidHexBlue');
export const InvalidHslHue = FT<{ value: number }>('colors:invalidHslHue');
export const InvalidHslSaturation = FT<{ value: number }>('colors:invalidHslSaturation');
export const InvalidHslLightness = FT<{ value: number }>('colors:invalidHslLightness');
export const InvalidRgbRed = FT<{ value: number }>('colors:invalidRgbRed');
export const InvalidRgbGreen = FT<{ value: number }>('colors:invalidRgbGreen');
export const InvalidRgbBlue = FT<{ value: number }>('colors:invalidRgbBlue');
