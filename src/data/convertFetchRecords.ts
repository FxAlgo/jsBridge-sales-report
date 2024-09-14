import "@resconet/jsbridge";
import { DateGroupingType, FetchRecord } from "./fetch";
import { DataType } from "./types";

export type DataRecord = {
	date: number; // year*100 + month/quarter
	name: string;
	values: number[];
};

export function toDate(rec: DataRecord): { year: number; month: number } {
	const year = Math.floor(rec.date / 100);
	const month = rec.date % 100;
	return { year, month };
}

export function convertFetchRecords(data: FetchRecord[], dateType: DateGroupingType): DataRecord[] {
	const records = mapFetchRecords(data, dateType);
	return consolidateFetchRecord(records);
}

export function toValues(data: DataRecord[], type: DataType): number[] {
	return data.map(v => Math.round(v.values[type]));
}

function mapFetchRecords(data: FetchRecord[], dateType: DateGroupingType): TempRecord[] {
	const hasType = data && data.length > 0 && data[0].length > 3;

	return data.map(row => ({
		date: +row[0] * 100 + (row[0] == row[1] ? 0 : +row[1]), // year year fix
		name: createName(row[0], row[1], dateType),
		value: +row[2],
		type: hasType ? typeToDataType(row[3]) : DataType.Total,
	}));
}

function consolidateFetchRecord(records: TempRecord[]): DataRecord[] {
	const values: Record<number, DataRecord> = {};

	for (const { date, name, value, type } of records) {
		if (values[date] === undefined) {
			values[date] = {
				date,
				name,
				values: new Array(4).fill(0),
			};
		}
		const set = values[date];
		set.values[DataType.Total] += value;
		set.values[type] = value;
	}

	const arr = Object.values(values).sort((a, b) => a.date - b.date);
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

const months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function createName(year: string, date: string, type: DateGroupingType): string {
	if (type == "year") {
		return year;
	} else if (type == "quarter") {
		return `${year} Q${date}`;
	} else {
		const month = months[+date - 1];
		return date === "1" ? `${month}-${year.substring(2)}` : month;
	}
}

type TempRecord = {
	date: number;
	name: string;
	value: number;
	type: DataType;
};
