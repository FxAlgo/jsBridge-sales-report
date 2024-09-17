import { ChartDatasets, ChartOptions } from "../controls/charts/useChart";

export const DayInSeconds = 60 * 60 * 24;
export const DayInMilliseconds = DayInSeconds * 1000;

export type ChartData = {
	datasets: ChartDatasets;
	options: ChartOptions;
};

export type DataTable = "invoice" | "order" | "opportunity" | "cost" | "profit";

export type DateGroupingType =
	| "month" // month grouping
	| "quarter" // quarter grouping
	| "year"; // fiscal year grouping

export enum SecondaryGroupingType {
	None,
	PerOwner,
	PerProduct,
	PerProductGroup,
}
