import { DateGroupingType, FetchRecord, FetchRecordSets } from "./fetch";
import { DataType } from "./types";

export type DataRecord = {
	date: number; // year*100 + month/quarter
	name: string;
	values: number[] | undefined;
	total: number;
};

type ValueSummary = { value: number; label: string };

export type DataRecordSet = {
	data: DataRecord[];
	name: string;
	actualValues: ValueSummary[];
	stackDataType: boolean;
};

export type DataRecordSets = Record<string, DataRecordSet>;

export function toDate(rec: DataRecord): { year: number; month: number } {
	const year = Math.floor(rec.date / 100);
	const month = rec.date % 100;
	return { year, month };
}

export function convertFetchRecordSets(fetchDataSets: FetchRecordSets, dateType: DateGroupingType): DataRecordSets {
	const result: DataRecordSets = {};

	for (const name in fetchDataSets) {
		const fetchDataSet = fetchDataSets[name];
		if (fetchDataSet && fetchDataSet.length > 0) {
			const records = mapFetchRecords(fetchDataSet, dateType);
			const data = consolidateFetchRecord(records);
			const actualValues = calculateValueSummaries(data, name);
			const stackDataType = data.length > 0 && data[0].values !== undefined;
			result[name] = { data, name, actualValues, stackDataType };
		}
	}
	return pairByDate(result, dateType);
}

export function toValues(data: DataRecord[], type?: DataType): number[] {
	return data.map(v => Math.round(v.values !== undefined ? v.values[type as DataType] : v.total));
}

export function toEuro(value: number): string {
	value = +value.toFixed(0);
	return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function pairByDate(dataSets: DataRecordSets, dateType: DateGroupingType): DataRecordSets {
	const dates = uniqueDates(dataSets);
	const dateArr = Object.values(dates).sort((a: number, b: number) => a - b);

	for (const key in dataSets) {
		const data = dataSets[key].data;

		for (let idx = 0; idx < dateArr.length; idx++) {
			const date = dateArr[idx];
			if (data.length <= idx || data[idx].date !== date) {
				const year = Math.floor(date / 100);
				const month = date % 100;
				const name = createName(year.toString(), month, dateType);
				data.splice(idx, 0, { date, name, total: 0, values: undefined });
			}
		}
	}
	return dataSets;
}

function uniqueDates(dataSets: DataRecordSets): Record<number, number> {
	const dates: Record<number, number> = {};

	for (const key in dataSets) {
		const data = dataSets[key].data;
		for (const rec of data) {
			dates[rec.date] = rec.date;
		}
	}
	return dates;
}

function calculateValueSummary(title: string, currentValues: number, previousValues: number): ValueSummary {
	const trend = previousValues ? Math.round(((currentValues - previousValues) * 100) / previousValues) : 0;
	return { value: currentValues, label: `${title}: ${toEuro(currentValues)} (${trend}%)` };
}

function calculateValueSummaries(data: DataRecord[], name: string): ValueSummary[] {
	const actualValues: ValueSummary[] = [];
	if (data.length > 1) {
		const currValues = data[data.length - 1];
		const prevValues = data[data.length - 2];

		actualValues.push(calculateValueSummary(`Actual ${name}s`, currValues.total, prevValues.total));
		if (currValues.values !== undefined && prevValues.values !== undefined && name === "order") {
			const currValue = currValues.values[DataType.New] + currValues.values[DataType.Upsell];
			const prevValue = prevValues.values[DataType.New] + prevValues.values[DataType.Upsell];
			actualValues.push(calculateValueSummary(`Actual new & upsales`, currValue, prevValue));
		}
	}
	return actualValues;
}

function mapFetchRecords(data: FetchRecord[], dateType: DateGroupingType): TempRecord[] {
	const hasType = data && data.length > 0 && data[0].length > 3;

	return data.map(row => {
		const val = row as string[];
		return {
			date: +val[0] * 100 + (val[0] == val[1] ? 0 : +val[1]), // year year fix
			name: createName(val[0], +val[1], dateType),
			value: +val[2],
			type: hasType ? typeToDataType(val[3]) : undefined,
		};
	});
}

function consolidateFetchRecord(records: TempRecord[]): DataRecord[] {
	const values: Record<number, DataRecord> = {};

	for (const { date, name, value, type } of records) {
		if (values[date] === undefined) {
			values[date] = {
				date,
				name,
				total: 0,
				values: type !== undefined ? new Array(3).fill(0) : undefined,
			};
		}
		const set = values[date];
		set.total += value;
		if (set.values) {
			set.values[type as DataType] = value;
		}
	}

	const arr = Object.values(values).sort((a, b) => a.date - b.date);
	for (const set of arr) {
		if (set.values === undefined) {
			break;
		}
		set.values[DataType.Renewal] = set.total - (set.values[DataType.New] + set.values[DataType.Upsell]);
	}
	return arr;
}

function typeToDataType(type: string): DataType {
	if (type == "New" || type == "Personal") {
		return DataType.New;
	} else if (type == "Upsell" || type == "Office") {
		return DataType.Upsell;
	} else if (type == "Renewal" || type == null || type == "Others") {
		return DataType.Renewal;
	} else if (type == "Total") {
		return DataType.Total;
	}
	return -1 as DataType;
}

const months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function createName(year: string, date: number, type: DateGroupingType): string {
	if (type == "year") {
		return year;
	} else if (type == "quarter") {
		return `${year} Q${date}`;
	} else {
		const month = months[date - 1];
		return date === 1 ? `${month}-${year.substring(2)}` : month;
	}
}

type TempRecord = {
	date: number;
	name: string;
	value: number;
	type: DataType | undefined;
};
