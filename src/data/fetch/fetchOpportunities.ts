import { DateGroupingType, SecondaryGroupingType } from "../types";
import { formatDate } from "./formatDate";
import { aggregate, attributeGroup, executeFetch, groupBy } from "./helpers";
import { FetchTimeRecord } from "./types";

export async function fetchOpportunities(
	from: Date,
	type: DateGroupingType,
	secondary: SecondaryGroupingType,
	renewals: boolean,
): Promise<FetchTimeRecord[]> {
	const entity = new MobileCRM.FetchXml.Entity("opportunity");

	entity.attributes.push(
		attributeGroup("createdon", "year", "Year"),
		attributeGroup("createdon", type, "Date"),
		aggregate("estimatedvalue_base", "sum", "Estimated"),
		groupBy("statecode", "StateCode"),
	);

	if (secondary === SecondaryGroupingType.PerOwner) {
		entity.attributes.push(groupBy("owninguser", "Owner"));
	}

	const filter1 = new MobileCRM.FetchXml.Filter();
	filter1.where("createdon", "on-or-after", formatDate(from));

	entity.filter = new MobileCRM.FetchXml.Filter("and");
	entity.filter.filters.push(filter1, addRenewalTeamFilter(renewals));

	entity.orderBy("Year", false);
	entity.orderBy("Date", false);

	const fetch = new MobileCRM.FetchXml.Fetch(entity);
	fetch.aggregate = true;
	return await executeFetch(fetch, type);
}

function addRenewalTeamFilter(renewals: boolean): MobileCRM.FetchXml.Filter {
	const opp = renewals ? "eq" : "ne";
	const filter = new MobileCRM.FetchXml.Filter(renewals ? "or" : "and");

	for (const id in renewalTeam) {
		const condition = filter.where("ownerid", opp, id);
		condition.uitype = "systemuser";
		condition.uiname = renewalTeam[id];
	}
	return filter;
}

const renewalTeam: { [key: string]: string } = {
	"8f14bf62-1fff-e011-8a90-001e0bddb9a9": "Adrian Kocak",
	"75956f75-1837-e811-ab77-00155d0b1304": "Alexander Timko",
};
