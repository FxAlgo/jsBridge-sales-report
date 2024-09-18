import { aggregatedFetch } from "../data/fetch/fetch";
import { FetchTimeRecordSets } from "../data/fetch/types";
import { DataTable, DateGroupingType } from "../data/types";

export async function getData(datasets: DataTable[], type: DateGroupingType): Promise<FetchTimeRecordSets | undefined> {
	return await aggregatedFetch(datasets, type);
}
