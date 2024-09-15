import { ChartDatasets, ChartOptions } from "../charts/useChart";

export const DayInSeconds = 60 * 60 * 24;
export const DayInMilliseconds = DayInSeconds * 1000;

export enum DataType {
	New = 0,
	Upsell = 1,
	Renewal = 2,
	Total = 4,
}

export type ChartData = {
	datasets: ChartDatasets;
	options: ChartOptions;
};
