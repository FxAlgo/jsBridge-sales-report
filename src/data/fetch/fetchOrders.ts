import { DateGroupingType } from "../types";
import { formatDate } from "./formatDate";
import { aggregate, attributeGroup, groupBy } from "./helpers";
import { FetchRecord } from "./types";

type DateType = "m000_orderdate" | "createdon";

export async function fetchOrders(from: Date, type: DateGroupingType, dateType: DateType = "createdon"): Promise<FetchRecord[]> {
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

export async function aggregateOrderSummary(from: Date): Promise<string> {
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
