export type DateGroupingType =
	| "month" // month grouping
	| "quarter" // quarter grouping
	| "year"; // fiscal year grouping

export type DataTable = "invoice" | "order";
export type FetchRecord = (string | null)[];
export type FetchRecordSets = Record<string, FetchRecord[]>;
