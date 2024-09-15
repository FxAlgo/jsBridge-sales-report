import { DataRecordSet, DataRecordSets } from "../convertFetchRecords";

export function addRecordsOperation(
	datasets: DataRecordSets,
	a: string,
	b: string,
	resultName: string,
	proc: (a: number, b: number) => number,
): void {
	const dataSetA = datasets[a];
	const dataSetB = datasets[b];
	const result: DataRecordSet = { data: [], name: resultName, actualValues: [], stackDataType: false };

	if (dataSetA && dataSetB) {
		const dataA = dataSetA.data;
		const dataB = dataSetB.data;

		result.data = new Array(Math.max(dataA.length, dataB.length));
		for (let idx = 0; idx < dataA.length; idx++) {
			const total = proc(dataA[idx].total, dataB[idx].total);
			result.data[idx] = { ...dataA[idx], total, values: undefined };
		}
	}
	datasets[resultName] = result;
}
