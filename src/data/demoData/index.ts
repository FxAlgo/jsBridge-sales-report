import { DataTable, DateGroupingType, FetchRecord, FetchRecordSets, recordNumberToDate } from "../fetch";
import { fetchCosts } from "../fetch/fetchCosts";
import { demoInvoices } from "./demoInvoices";
import { demoOpportunities } from "./demoOpportunities";
import { demoOrders, demoOrdersM, demoOrdersQ } from "./demoOrders";

export function demoData(datasets: DataTable[], type: DateGroupingType): FetchRecordSets {
	const result: FetchRecordSets = {};

	for (const dataset of datasets) {
		if (dataset === "cost") {
			result[dataset] = fetchCosts(type);
		} else if (type === "year") {
			switch (dataset) {
				case "order":
					result[dataset] = demoOrders;
					break;
				case "invoice":
					result[dataset] = demoInvoices;
					break;
				case "opportunity":
					result[dataset] = demoOpportunities;
					break;
			}
		} else if (type === "quarter") {
			result[dataset] = demoOrdersQ;
		} else {
			result[dataset] = demoOrdersM;
		}
	}
	return result;
}

function generateDemoData(type: DateGroupingType): FetchRecord[] {
	const data: FetchRecord[] = [];
	const from = recordNumberToDate(type);
	const now = new Date();
	const thisYear = now.getFullYear();

	for (let year = from.getFullYear(); year <= thisYear; year++) {
		const lastMonth = year === thisYear ? now.getMonth() + 1 : 12;
		for (let month = 1; month <= lastMonth; month++) {
			data.push([year.toString(), month.toString(), fakeData(1)[0].toString()]);
		}
	}
	return data;
}

function fakeData(count: number, min: number = 0, max: number = 1000000): number[] {
	const arr = [];
	for (let i = 0; i < count; i++) {
		arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
	}
	return arr;
}
