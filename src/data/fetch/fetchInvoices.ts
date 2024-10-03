import { DateGroupingType, SecondaryGroupingType } from "../types";
import { formatDate } from "./formatDate";
import { aggregate, attributeGroup, executeFetch, groupBy } from "./helpers";
import { FetchTimeRecord } from "./types";

export async function fetchInvoices(
	from: Date,
	dateGrouping: DateGroupingType,
	secondaryGrouping: SecondaryGroupingType = SecondaryGroupingType.None,
): Promise<FetchTimeRecord[]> {
	const entity = new MobileCRM.FetchXml.Entity("invoice");

	//const link = entity.addLink("salesorder", "salesorderid", "salesorderid", "inner");
	//link.alias = "L0";

	entity.attributes.push(
		attributeGroup("createdon", "year", "Year"),
		attributeGroup("createdon", dateGrouping, "Date"),
		aggregate("totalamount_base", "sum", "Total"),
		//groupBy("resco_ordertype", "Type"),
	);

	if (secondaryGrouping === SecondaryGroupingType.PerOwner) {
		entity.attributes.push(groupBy("owninguser", "Owner"));
	} else if (secondaryGrouping === SecondaryGroupingType.PerProduct) {
		//entity.attributes.push(groupBy("owninguser", "Owner"));
	} else if (secondaryGrouping === SecondaryGroupingType.PerProductGroup) {
		//entity.attributes.push(groupBy("owninguser", "Owner"));
	}

	entity.filter = new MobileCRM.FetchXml.Filter();
	entity.filter.where("createdon", "on-or-after", formatDate(from));
	entity.filter.where("statecode", "ne", 3); // 3 = Cancelled
	entity.filter.where("m000_invoicetypecode", "eq", 200000001); // only invoices, no proforma

	entity.orderBy("Year", false);
	entity.orderBy("Date", false);

	const fetch = new MobileCRM.FetchXml.Fetch(entity);
	fetch.aggregate = true;
	return await executeFetch(fetch, dateGrouping);
}
