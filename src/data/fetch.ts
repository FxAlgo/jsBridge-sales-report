import "@resconet/jsbridge";
import { formatDate } from "./formatDate";
import { DayInMilliseconds } from "./types";

export type DateGroupingType =
	| "month" // month grouping
	| "quarter" // quarter grouping
	| "year"; // fiscal year grouping

export type DataTable = "invoice" | "order";
export type FetchRecord = string[];

export async function aggregatedFetch(dataset: DataTable, type: DateGroupingType): Promise<FetchRecord[]> {
	const from = recordNumberToDate(type);
	if (dataset === "invoice") {
		return fetchInvoice(from, type);
	} else {
		return fetchOrder(from, type);
	}
}

export async function summaryFetch(dataset: DataTable): Promise<string> {
	const from = recordNumberToDate("year", 2);

	try {
		if (dataset === "invoice") {
			return await aggregateInvoiceSummary(from);
		} else {
			return await aggregateOrderSummary(from);
		}
	} catch (e) {
		return e.toString();
	}
}

export function recordNumberToDate(type: DateGroupingType, numberOfSets?: number): Date {
	const now = new Date().valueOf();

	if (type === "month") {
		const days = (numberOfSets ?? 24) * 30 * DayInMilliseconds;
		const date = new Date(now - days);
		return new Date(date.getFullYear(), date.getMonth(), 1);
	} else if (type === "quarter") {
		const days = (numberOfSets ?? 12) * 91 * DayInMilliseconds;
		const date = new Date(now - days);
		return new Date(date.getFullYear(), Math.floor(date.getMonth() / 4), 1);
	} else {
		const days = (numberOfSets ?? 8) * 365 * DayInMilliseconds;
		const date = new Date(now - days);
		return new Date(date.getFullYear(), 0, 1);
	}
}

type DateType = "m000_orderdate" | "createdon";

async function fetchOrder(from: Date, type: DateGroupingType, dateType: DateType = "createdon"): Promise<FetchRecord[]> {
	const entity = new MobileCRM.FetchXml.Entity("salesorder");

	// type = "m000_orderdate"
	entity.attributes.push(
		attributeGroup(dateType, "year", "Year"),
		attributeGroup(dateType, type, "Date"),
		aggregate("totalamount_base", "sum", "Total"),
		groupBy("resco_ordertype", "Type"),
	);

	entity.filter = new MobileCRM.FetchXml.Filter();
	entity.filter.where(dateType, "on-or-after", formatDate(from));
	entity.filter.where("statecode", "ne", 2); // 2 = Cancelled

	entity.orderBy("Year", false);
	entity.orderBy("Date", false);

	const fetch = new MobileCRM.FetchXml.Fetch(entity);
	fetch.aggregate = true;
	return await fetch.executeAsync("Array");
}

async function fetchInvoice(from: Date, type: DateGroupingType): Promise<FetchRecord[]> {
	const entity = new MobileCRM.FetchXml.Entity("invoice");

	//const link = entity.addLink("salesorder", "salesorderid", "salesorderid", "inner");
	//link.alias = "L0";

	entity.attributes.push(
		attributeGroup("createdon", "year", "Year"),
		attributeGroup("createdon", type, "Date"),
		aggregate("totalamount_base", "sum", "Total"),
		//groupBy("resco_ordertype", "Type"),
	);

	entity.filter = new MobileCRM.FetchXml.Filter();
	entity.filter.where("createdon", "on-or-after", formatDate(from));
	entity.filter.where("statecode", "ne", 3); // 3 = Cancelled

	entity.orderBy("Year", false);
	entity.orderBy("Date", false);

	const fetch = new MobileCRM.FetchXml.Fetch(entity);
	fetch.aggregate = true;
	return await fetch.executeAsync("Array");
}

async function aggregateInvoiceSummary(from: Date): Promise<string> {
	//return JSON.stringify(this.toDatasets(await this.aggregateInvoices("month")));
	const entity = new MobileCRM.FetchXml.Entity("invoice");

	entity.attributes.push(
		aggregate("invoicenumber", "count", "ID_CNT"), // Use for Count of orders | we need to st alias for aggregation
		aggregate("totalamount_base", "sum", "AMOUNT_SUM"), // Use for SUM AMOUNT of orders
		aggregate("totalamount_base", "max", "AMOUNT_MAX"), // Use for MAX AMOUNT of orders
		aggregate("totalamount_base", "min", "AMOUNT_MIN"), // Use for MIN AMOUNT of orders
		aggregate("totalamount_base", "avg", "AMOUNT_AVG"), // Use for AconstAGE AMOUNT of orders
	);
	entity.filter = new MobileCRM.FetchXml.Filter();
	entity.filter.where("createdon", "on-or-after", formatDate(from));

	const fetch = new MobileCRM.FetchXml.Fetch(entity);
	fetch.aggregate = true; // Set this attribute to true to allow aggregation functions.
	const res = await fetch.executeAsync("Array");

	return `Summary: Total(${Math.round(res[0][1])} EUR in ${res[0][0]} invoices) Max(${Math.round(res[0][2])}) Min(${Math.round(res[0][3])}) Avg(${Math.round(res[0][4])})`;
}

async function aggregateOrderSummary(from: Date): Promise<string> {
	//return JSON.stringify(this.toDatasets(await this.aggregateInvoices("month")));
	const entity = new MobileCRM.FetchXml.Entity("salesorder");

	entity.attributes.push(
		aggregate("ordernumber", "count", "ID_CNT"), // Use for Count of orders | we need to st alias for aggregation
		aggregate("totalamount_base", "sum", "AMOUNT_SUM"), // Use for SUM AMOUNT of orders
		aggregate("totalamount_base", "max", "AMOUNT_MAX"), // Use for MAX AMOUNT of orders
		aggregate("totalamount_base", "min", "AMOUNT_MIN"), // Use for MIN AMOUNT of orders
		aggregate("totalamount_base", "avg", "AMOUNT_AVG"), // Use for AconstAGE AMOUNT of orders
	);
	entity.filter = new MobileCRM.FetchXml.Filter();
	entity.filter.where("createdon", "on-or-after", formatDate(from));

	const fetch = new MobileCRM.FetchXml.Fetch(entity);
	fetch.aggregate = true; // Set this attribute to true to allow aggregation functions.
	const res = await fetch.executeAsync("Array");

	return `Summary: Total(${Math.round(res[0][1])} EUR in ${res[0][0]} orders) Max(${Math.round(res[0][2])}) Min(${Math.round(res[0][3])}) Avg(${Math.round(res[0][4])})`;
}

function attributeGroup(name: string, dategrouping: DateGroupingType, alias?: string): MobileCRM.FetchXml.Attribute {
	const attr = new MobileCRM.FetchXml.Attribute(name);
	attr.alias = alias;
	attr.groupby = true;
	attr.dategrouping = dategrouping;
	return attr;
}

function aggregate(name: string, type: string, alias: string): MobileCRM.FetchXml.Attribute {
	const attr = new MobileCRM.FetchXml.Attribute(name);
	attr.aggregate = type;
	attr.alias = alias;
	return attr;
}

function groupBy(name: string, alias: string): MobileCRM.FetchXml.Attribute {
	const attr = new MobileCRM.FetchXml.Attribute(name);
	attr.groupby = true;
	attr.alias = alias;
	return attr;
}
