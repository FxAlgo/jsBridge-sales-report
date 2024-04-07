export type DateGroupingType =
	| "day" // day grouping
	| "week" // week grouping
	| "month" // month grouping
	| "quarter" // quarter grouping
	| "year" // year grouping
	| "fiscal-period" // fiscal period grouping
	| "fiscal-year"; // fiscal year grouping

export const DayInSeconds = 60 * 60 * 24;

export type Dataset = {
	label: string;
	data: number[];
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
};

export type Datasets = {
	labels: string[];
	datasets: Dataset[];
};
