import { formatDate } from "./formatDate";
import { aggregate, attributeGroup, groupBy } from "./helpers";
import { DateGroupingType, FetchRecord } from "./types";

export async function fetchOpportunities(from: Date, type: DateGroupingType): Promise<FetchRecord[]> {
	const entity = new MobileCRM.FetchXml.Entity("opportunity");

	//const link = entity.addLink("salesorder", "salesorderid", "salesorderid", "inner");
	//link.alias = "L0";

	entity.attributes.push(
		attributeGroup("createdon", "year", "Year"),
		attributeGroup("createdon", type, "Date"),
		groupBy("statecode", "StateCode"),
		aggregate("actualvalue", "sum", "ValueA"),
		aggregate("actualvalue_base", "sum", "ValueB"),

		//aggregate("estimatedvalue_base", "sum", "EstimatedA"),
		//aggregate("m000_estimatecalc_base", "sum", "EstimatedB"),
		//aggregate("m000_estimatecalc", "sum", "Estimated3"),
		// closeprobability
	);

	entity.filter = new MobileCRM.FetchXml.Filter();
	entity.filter.where("createdon", "on-or-after", formatDate(from));
	entity.filter.where("statecode", "ne", 2); // 2 = Lost

	entity.orderBy("Year", false);
	entity.orderBy("Date", false);

	const fetch = new MobileCRM.FetchXml.Fetch(entity);
	fetch.aggregate = true;
	return await fetch.executeAsync("Array");
}
