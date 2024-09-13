export const DayInSeconds = 60 * 60 * 24;

export enum DataType {
	New = 0,
	Upsell = 1,
	Renewal = 2,
	Total = 3,
}

export type ChartDataset = {
	label: string;
	data: number[];
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
};

export type ChartDatasets = {
	labels: string[];
	datasets: ChartDataset[];
};

export type ChartData = {
	datasets: ChartDatasets;
	options: any;
};
