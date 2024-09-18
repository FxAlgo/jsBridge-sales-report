import { DateGroupingType, SecondaryGroupingType } from "../types";
import { formatDate } from "./formatDate";
import { aggregate, attributeGroup, executeFetch, groupBy } from "./helpers";
import { FetchTimeRecord } from "./types";

type DateType = "m000_orderdate" | "createdon";

export async function fetchOrders(
	from: Date,
	dateGrouping: DateGroupingType,
	secondaryGrouping: SecondaryGroupingType = SecondaryGroupingType.None,
	dateType: DateType = "createdon",
): Promise<FetchTimeRecord[]> {
	const entity = new MobileCRM.FetchXml.Entity("salesorder");

	// type = "m000_orderdate"
	entity.attributes.push(
		attributeGroup(dateType, "year", "Year"),
		attributeGroup(dateType, dateGrouping, "Date"),
		aggregate("totalamount_base", "sum", "Total"),
		groupBy("resco_ordertype", "Type"),
	);

	if (secondaryGrouping === SecondaryGroupingType.PerOwner) {
		entity.attributes.push(groupBy("owninguser", "Owner"));
	} else if (secondaryGrouping === SecondaryGroupingType.PerProduct) {
		//entity.attributes.push(groupBy("owninguser", "Owner"));
	} else if (secondaryGrouping === SecondaryGroupingType.PerProductGroup) {
		//entity.attributes.push(groupBy("owninguser", "Owner"));
	}

	entity.filter = new MobileCRM.FetchXml.Filter();
	entity.filter.where(dateType, "on-or-after", formatDate(from));
	entity.filter.where("statecode", "ne", 2); // 2 = Cancelled

	entity.orderBy("Year", false);
	entity.orderBy("Date", false);

	const fetch = new MobileCRM.FetchXml.Fetch(entity);
	fetch.aggregate = true;
	return await executeFetch(fetch, dateGrouping);
}
