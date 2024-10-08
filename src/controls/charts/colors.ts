export type Color = number[];
export const baseColors: Color[] = [
	[75, 192, 192],
	[54, 162, 235],
	[255, 99, 132],
	[255, 159, 64],
	[255, 205, 86],
	[153, 102, 255],
	[201, 203, 207],
];

export const rgbaColor = (color: Color, opacity: number) => `rgba(${color.join(",")}, ${opacity})`;
export const rgbColor = (color: Color) => `rgb(${color.join(",")})`;

const rgbaColors = (opacity: number) => baseColors.map(color => rgbaColor(color, opacity));
const rgbColors = baseColors.map(color => rgbColor(color));

export const colors = (opacity: number) => (opacity >= 1 ? rgbColors : rgbaColors(opacity));
export const datasetColorOptions = (opacity: number) => ({
	backgroundColor: colors(opacity),
	borderColor: rgbColors,
	borderWidth: 1,
});
