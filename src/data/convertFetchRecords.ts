import "@resconet/jsbridge";
import { DateGroupingType, FetchRecord } from "./fetch";
import { DataType } from "./types";

export type DataRecord = {
	sortHelper: number;
	year: number;
	name: string;
	values: number[];
};

export function convertFetchRecords(data: FetchRecord[], dateType: DateGroupingType): DataRecord[] {
	const records = mapFetchRecords(data, dateType);
	return consolidateFetchRecord(records);
}

function mapFetchRecords(data: FetchRecord[], dateType: DateGroupingType): TempRecord[] {
	const hasType = data && data.length > 0 && data[0].length > 3;

	return data.map(row => ({
		sortHelper: +row[0] * 12 + +row[1],
		year: +row[0],
		name: createName(row[0], row[1], dateType),
		value: +row[2],
		type: hasType ? typeToDataType(row[3]) : DataType.Total,
	}));
}

function consolidateFetchRecord(records: TempRecord[]): DataRecord[] {
	const values: Record<string, DataRecord> = {};

	for (const { sortHelper, name, value, type, year } of records) {
		if (values[name] === undefined) {
			values[name] = {
				sortHelper,
				name,
				year,
				values: new Array(4).fill(0),
			};
		}
		const set = values[name];
		set.values[DataType.Total] += value;
		set.values[type] = value;
	}

	const arr = Object.values(values).sort((a, b) => a.sortHelper - b.sortHelper);
	for (const set of arr) {
		const total = set.values[DataType.Total];
		set.values[DataType.Renewal] = total - (set.values[DataType.New] + set.values[DataType.Upsell]);
	}
	return arr;
}

function typeToDataType(type: string): DataType {
	if (type == "New") {
		return DataType.New;
	} else if (type == "Upsell") {
		return DataType.Upsell;
	}
	// else if (type == "Renewal") {
	//	return DataType;
	//}
	return DataType.Renewal;
}

const labels = {
	month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	quarter: ["Q1", "Q2", "Q3", "Q4"],
};

function createName(year: string, date: string, type: DateGroupingType): string {
	if (type == "year") {
		return year;
	} else if (type == "quarter") {
		return `${year} Q${date}`;
	} else {
		const month = labels.month[+date - 1];
		return date === "1" ? `${month}-${year.substring(2)}` : month;
	}
}

type TempRecord = {
	sortHelper: number;
	year: number;
	name: string;
	value: number;
	type: DataType;
};
