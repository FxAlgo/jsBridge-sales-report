import "@resconet/jsbridge";
import { DateGroupingType } from "./types";

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
