import { baseColors, Color, rgbaColor, rgbColor } from "../controls/charts/colors";

export type ColumnValueTransformer = Record<string, number> | ((idx: string) => number);
export type DataTypeConfig = {
	color: Color;
	showActualValues?: boolean; // default true
	valueColors?: (Color | string)[];
	valueLabels?: string[] | undefined;
	valueIndexTransformer?: Record<number, ColumnValueTransformer>;
};

export const dataTypeConfig: Record<string, DataTypeConfig> = {
	order: {
		color: baseColors[0],
		valueLabels: ["Renewal", "Upsells", "New orders"],
		valueColors: [rgbaColor(baseColors[0], 0.5), rgbaColor(baseColors[0], 0.8), rgbColor(baseColors[0])],
		valueIndexTransformer: { 3: { New: 2, Upsell: 1, Renewal: 0, default: 0 } },
	},
	invoice: {
		color: baseColors[1],
	},
	cost: {
		color: baseColors[2],
		valueLabels: ["Personal costs", "Office costs", "Other"],
		valueIndexTransformer: { 3: { Personal: 0, Office: 1, Others: 2, default: 2 } },
	},
	profit: {
		color: baseColors[4],
		showActualValues: false,
	},
	opportunity: {
		color: baseColors[5],
		showActualValues: false,
		valueLabels: ["Lost", "Open", "Won opp."],
		valueColors: [rgbaColor(baseColors[2], 0.25), rgbaColor(baseColors[1], 0.25), rgbaColor(baseColors[0], 0.25)],
		valueIndexTransformer: { 3: { 0: 1, 1: 2, 2: 0, default: 2 } }, // Open=0, Won=1, Lost=2
	},
};
