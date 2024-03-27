export const baseColors = [
	[255, 99, 132],
	[255, 159, 64],
	[255, 205, 86],
	[75, 192, 192],
	[54, 162, 235],
	[153, 102, 255],
	[201, 203, 207],
];

export const rgbaColor = (color: number[], opacity: number) => `rgba(${color.join(",")}, ${opacity})`;
export const rgbColor = (color: number[]) => `rgb(${color.join(",")})`;

const rgbaColors = (opacity: number) => baseColors.map(color => rgbaColor(color, opacity));
const rgbColors = baseColors.map(color => rgbColor(color));

export const colors = (opacity: number) => (opacity >= 1 ? rgbColors : rgbaColors(opacity));
export const datasetColorOptions = (opacity: number) => ({
	backgroundColor: colors(opacity),
	borderColor: rgbColors,
	borderWidth: 1,
});
