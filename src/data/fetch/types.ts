export type DateGroupingType =
	| "month" // month grouping
	| "quarter" // quarter grouping
	| "year"; // fiscal year grouping

export type DataTable = "invoice" | "order" | "opportunity" | "cost" | "profit";
export type FetchRecord = (string | number | null)[];
export type FetchRecordSets = Record<string, FetchRecord[]>;
