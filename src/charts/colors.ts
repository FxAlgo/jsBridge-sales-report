const baseColors = [
	[255, 99, 132],
	[255, 159, 64],
	[255, 205, 86],
	[75, 192, 192],
	[54, 162, 235],
	[153, 102, 255],
	[201, 203, 207],
];

const rgbaColors = (opacity: number) => baseColors.map(color => `rgba(${color.join(",")}, ${opacity})`);
const rgbColors = baseColors.map(color => `rgb(${color.join(",")})`);

export const colors = (opacity: number) => (opacity >= 1 ? rgbColors : rgbaColors(opacity));
export const datasetColorOptions = (opacity: number) => ({
	backgroundColor: colors(opacity),
	borderColor: rgbColors,
	borderWidth: 1,
});
