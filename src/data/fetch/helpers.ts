import "@resconet/jsbridge";
import { DateGroupingType } from "../types";
import { FetchRecord, FetchTimeRecord } from "./types";

export async function executeFetch(fetch: MobileCRM.FetchXml.Fetch, dateGrouping: DateGroupingType): Promise<FetchTimeRecord[]> {
	const data = await fetch.executeAsync("Array");
	return convertFetchRecord(data, dateGrouping);
}

type CreateNameProc = (year: string, date: number) => string;

export function convertFetchRecord(data: FetchRecord[], dateGrouping: DateGroupingType): FetchTimeRecord[] {
	const createName = getCreateNameProc(dateGrouping);
	const columns = data && data.length > 0 ? data[0].length : 0;

	return (data as string[][]).map((val: string[]) => ({
		name: createName(val[0], +val[1]),
		date: +val[0] * 100 + (val[0] == val[1] ? 0 : +val[1]), // year year fix
		value: +val[2],
		type: columns > 3 ? val[3] : undefined,
		secondary: columns > 4 ? val[4] : undefined,
	}));
}

const months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getCreateNameProc(type: DateGroupingType): CreateNameProc {
	if (type == "year") {
		return (year: string) => year;
	} else if (type == "quarter") {
		return (year: string, date: number) => `${year} Q${date}`;
	} else {
		return (year: string, date: number) => {
			const month = months[date - 1];
			return date === 1 ? `${month}-${year.substring(2)}` : month;
		};
	}
}

export function attributeGroup(name: string, dategrouping: DateGroupingType, alias?: string): MobileCRM.FetchXml.Attribute {
	const attr = new MobileCRM.FetchXml.Attribute(name);
	if (alias) {
		attr.alias = alias;
	}
	attr.groupby = true;
	attr.dategrouping = dategrouping;
	return attr;
}

export function aggregate(name: string, type: string, alias: string): MobileCRM.FetchXml.Attribute {
	const attr = new MobileCRM.FetchXml.Attribute(name);
	attr.aggregate = type;
	attr.alias = alias;
	return attr;
}

export function groupBy(name: string, alias: string): MobileCRM.FetchXml.Attribute {
	const attr = new MobileCRM.FetchXml.Attribute(name);
	attr.groupby = true;
	attr.alias = alias;
	return attr;
}
