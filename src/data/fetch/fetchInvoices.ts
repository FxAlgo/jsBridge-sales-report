import { DateGroupingType } from "../types";
import { formatDate } from "./formatDate";
import { aggregate, attributeGroup } from "./helpers";
import { FetchRecord } from "./types";

export async function fetchInvoices(from: Date, type: DateGroupingType): Promise<FetchRecord[]> {
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

export async function aggregateInvoiceSummary(from: Date): Promise<string> {
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
