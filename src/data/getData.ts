import { aggregatedFetch } from "./fetch/fetch";
import { FetchRecordSets } from "./fetch/types";
import { DataTable, DateGroupingType } from "./types";

export async function getData(datasets: DataTable[], type: DateGroupingType): Promise<FetchRecordSets | undefined> {
	return await aggregatedFetch(datasets, type);
}
