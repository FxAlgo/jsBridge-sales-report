import "@resconet/jsbridge";
import { DateGroupingType, FetchRecord, FetchRecordSets } from "./fetch";
import { DataType } from "./types";

export type DataRecord = {
	date: number; // year*100 + month/quarter
	name: string;
	values: number[] | undefined;
	total: number;
};

export type DataRecordSet = {
	data: DataRecord[];
	name: string;
	currentValues: DataRecord | undefined;
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

	for (const key in fetchDataSets) {
		const fetchDataSet = fetchDataSets[key];
		if (fetchDataSet && fetchDataSet.length > 0) {
			const records = mapFetchRecords(fetchDataSet, dateType);
			const data = consolidateFetchRecord(records);
			let currentValues: DataRecord | undefined;
			let stackDataType = false;

			if (data.length > 0) {
				currentValues = { ...data[data.length - 1] };
				stackDataType = data[0].values !== undefined ? true : false;
			}
			result[key] = { data, name: key, currentValues, stackDataType };
		}
	}
	return result;
}

export function toValues(data: DataRecord[], type?: DataType): number[] {
	return data.map(v => Math.round(v.values !== undefined ? v.values[type as DataType] : v.total));
}

function mapFetchRecords(data: FetchRecord[], dateType: DateGroupingType): TempRecord[] {
	const hasType = data && data.length > 0 && data[0].length > 3;

	return data.map(row => {
		const val = row as string[];
		return {
			date: +val[0] * 100 + (val[0] == val[1] ? 0 : +val[1]), // year year fix
			name: createName(val[0], val[1], dateType),
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
	type: DataType | undefined;
};
