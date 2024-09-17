import { DataTable, DateGroupingType, DayInMilliseconds, SecondaryGroupingType } from "../types";
import { fetchCosts } from "./fetchCosts";
import { aggregateInvoiceSummary, fetchInvoices } from "./fetchInvoices";
import { fetchOpportunities } from "./fetchOpportunities";
import { aggregateOrderSummary, fetchOrders } from "./fetchOrders";
import { FetchRecordSets } from "./types";

export async function aggregatedFetch(
	datasets: DataTable[],
	type: DateGroupingType,
	secondary: SecondaryGroupingType = SecondaryGroupingType.None,
): Promise<FetchRecordSets> {
	const from = recordNumberToDate(type);
	const result: FetchRecordSets = {};

	for (const dataset of datasets) {
		if (dataset === "invoice") {
			result[dataset] = await fetchInvoices(from, type);
		} else if (dataset === "order") {
			result[dataset] = await fetchOrders(from, type);
		} else if (dataset === "opportunity") {
			result[dataset] = await fetchOpportunities(from, type, secondary, false);
		} else if (dataset === "cost") {
			result[dataset] = fetchCosts(type);
		}
	}

	return result;
}

export async function summaryFetch(dataset: DataTable): Promise<string> {
	const from = recordNumberToDate("year", 2);

	try {
		if (dataset === "invoice") {
			return await aggregateInvoiceSummary(from);
		} else if (dataset === "order") {
			return await aggregateOrderSummary(from);
		} else {
			return "";
		}
	} catch (e: any) {
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
		if (numberOfSets) {
			const days = (numberOfSets ?? 12) * 91 * DayInMilliseconds;
			const date = new Date(now - days);
			return new Date(date.getFullYear(), Math.floor(date.getMonth() / 4), 1);
		} else {
			return new Date(new Date().getFullYear() - 2, 0, 1);
		}
	} else {
		const days = (numberOfSets ?? 5) * 365 * DayInMilliseconds;
		const date = new Date(now - days);
		return new Date(date.getFullYear(), 0, 1);
	}
}
