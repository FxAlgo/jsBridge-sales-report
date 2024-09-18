import { ColumnValueTransformer, dataTypeConfig } from "./dataTypeConfig";
import { FetchTimeRecord, FetchTimeRecordSets } from "./fetch";
import { DateGroupingType } from "./types";

export type DataRecord = {
	date: number; // year*100 + month/quarter
	name: string;
	values: number[] | undefined;
	total: number;
};

type ValueSummary = { value: number; label: string };

enum OrderValueIndex {
	New = 2,
	Upsell = 1,
	Renewal = 0,
}

enum CostValueIndex {
	Personal = 0,
	Office = 1,
	Other = 2,
}

export type DataRecordSet = {
	data: DataRecord[];
	name: string;
	valueNames?: string[];
	actualValues?: ValueSummary[];
};

export type DataRecordSets = Record<string, DataRecordSet>;

export function toDate(rec: DataRecord): { year: number; month: number } {
	const year = Math.floor(rec.date / 100);
	const month = rec.date % 100;
	return { year, month };
}

export function convertFetchRecordSets(fetchDataSets: FetchTimeRecordSets, dateType: DateGroupingType): DataRecordSets {
	const result: DataRecordSets = {};

	for (const name in fetchDataSets) {
		const fetchDataSet = fetchDataSets[name];
		if (fetchDataSet && fetchDataSet.length > 0) {
			const config = dataTypeConfig[name];
			const records = mapFetchRecords(fetchDataSet, dateType, name);
			const data = consolidateFetchRecord(records);
			const actualValues = config.showActualValues === undefined || config.showActualValues ? calculateValueSummaries(data, name) : undefined;
			const valueNames = config?.valueLabels;

			result[name] = { data, name, valueNames, actualValues };
		}
	}
	return pairByDate(result, dateType);
}

export function toValues(data: DataRecord[], index?: number): number[] {
	return data.map(v => Math.round(v.values !== undefined ? v.values[index as number] : v.total));
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
	const current = Math.abs(currentValues);
	const previous = Math.abs(previousValues);

	const trend = previous ? Math.round(((current - previous) * 100) / previous) : 0;
	return { value: currentValues, label: `${title}: ${toEuro(currentValues)} (${trend}%)` };
}

function calculateValueSummaries(data: DataRecord[], name: string): ValueSummary[] {
	const actualValues: ValueSummary[] = [];
	if (data.length > 1) {
		const currValues = data[data.length - 1];
		const prevValues = data[data.length - 2];

		actualValues.push(calculateValueSummary(`Actual ${name}s`, currValues.total, prevValues.total));
		if (currValues.values !== undefined && prevValues.values !== undefined) {
			if (name === "order") {
				const currValue = currValues.values[OrderValueIndex.New] + currValues.values[OrderValueIndex.Upsell];
				const prevValue = prevValues.values[OrderValueIndex.New] + prevValues.values[OrderValueIndex.Upsell];
				actualValues.push(calculateValueSummary(`Actual new & upsales`, currValue, prevValue));
			} else if (name === "cost") {
				const currValue = currValues.values[CostValueIndex.Personal];
				const prevValue = prevValues.values[CostValueIndex.Personal];
				actualValues.push(calculateValueSummary(`Personal costs`, currValue, prevValue));
			}
		}
	}
	return actualValues;
}

function mapFetchRecords(data: FetchTimeRecord[], dateType: DateGroupingType, dataName: string): TempRecord[] {
	const transformer = dataTypeConfig[dataName].valueIndexTransformer;

	return data.map(({ date, name, value, type }: FetchTimeRecord) => ({
		date,
		name,
		value,
		type: transformer && type !== undefined ? transformColumnValue(type, transformer[3]) : undefined,
	}));
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
			set.values[type as OrderValueIndex] = value;
		}
	}

	const arr = Object.values(values).sort((a, b) => a.date - b.date);
	for (const set of arr) {
		if (set.values === undefined) {
			break;
		}
		set.values[OrderValueIndex.Renewal] = set.total - (set.values[OrderValueIndex.New] + set.values[OrderValueIndex.Upsell]);
	}
	return arr;
}

function transformColumnValue(type: string, transformer: ColumnValueTransformer | undefined): OrderValueIndex {
	if (transformer instanceof Object) {
		const t = transformer as Record<string, number>;
		return t[type] ?? t["default"];
	} else if (typeof transformer === "function") {
		const proc = transformer as (idx: string) => number;
		return proc(type);
	}
	return -1 as OrderValueIndex;
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
	type: OrderValueIndex | undefined;
};
