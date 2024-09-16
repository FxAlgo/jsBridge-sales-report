import { ChartDatasets, ChartOptions } from "../charts/useChart";

export const DayInSeconds = 60 * 60 * 24;
export const DayInMilliseconds = DayInSeconds * 1000;

export type ChartData = {
	datasets: ChartDatasets;
	options: ChartOptions;
};

export type DateGroupingType =
	| "month" // month grouping
	| "quarter" // quarter grouping
	| "year"; // fiscal year grouping

export type DataTable = "invoice" | "order" | "opportunity" | "cost" | "profit";
