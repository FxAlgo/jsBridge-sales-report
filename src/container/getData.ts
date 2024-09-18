import { aggregatedFetch } from "../data/fetch/fetch";
import { FetchRecordSets } from "../data/fetch/types";
import { DataTable, DateGroupingType } from "../data/types";

export async function getData(datasets: DataTable[], type: DateGroupingType): Promise<FetchRecordSets | undefined> {
	return await aggregatedFetch(datasets, type);
}
