import "@resconet/jsbridge";
import { Dataset, Datasets, DateGroupingType } from "./datatype";
import { formatDate } from "./formatDate";

export class ServiceBridge {
	async invoices(type: DateGroupingType): Promise<Datasets> {
		if (type != "month" && type != "quarter") {
			throw new Error("Invalid date grouping type");
		}

		const data = await this.aggregateInvoices(type);
		return {
			labels: ServiceBridge.labels[type],
			datasets: this.toDatasets(data),
		};
	}

	async invoicesSummary(): Promise<string> {
		try {
			return await this.aggregateInvoiceSummary();
		} catch (e) {
			return e.toString();
		}
	}

	private toDatasets(data: any[][]): Dataset[] {
		const years: Record<string, Dataset> = {};

		for (const val of data) {
			const year = val[0];
			const month = +val[1];
			const value = +val[2];
			if (years[year] === undefined) {
				//const color = baseColors[3 + j];
				years[year] = {
					label: year.toString(),
					data: new Array(12).fill(0),
					//backgroundColor: rgbaColor(color, i * 0.3),
					//borderColor: rgbColor(color),
					borderWidth: 1,
				};
			}
			years[year].data[month - 1] = value;
		}
		return Object.values(years);
	}

	private async aggregateInvoices(type: DateGroupingType): Promise<any[][]> {
		const now = new Date();
		const thisYear = now.getFullYear();
		const from = new Date(thisYear - 2, 0, 1);

		if (process.env.NODE_ENV === "development") {
			const data = [];

			for (let year = from.getFullYear(); year <= thisYear; year++) {
				const lastMonth = year === thisYear ? now.getMonth() + 1 : 12;
				for (let month = 1; month <= lastMonth; month++) {
					data.push([year, month, fakeData(1)[0]]);
				}
			}
			return data;
		} else {
			const entity = new MobileCRM.FetchXml.Entity("invoice");

			entity.attributes.push(
				attributeGroup("createdon", "year", "Year"),
				attributeGroup("createdon", type, "Mon"),
				attribute("totalamount_base", "sum", "Total"),
			);
			entity.filter = new MobileCRM.FetchXml.Filter();
			entity.filter.where("createdon", "on-or-after", formatDate(from));

			const fetch = new MobileCRM.FetchXml.Fetch(entity);
			fetch.aggregate = true;
			return await fetch.executeAsync("Array");
		}
	}

	private async aggregateInvoiceSummary(): Promise<string> {
		//return JSON.stringify(this.toDatasets(await this.aggregateInvoices("month")));
		const entity = new MobileCRM.FetchXml.Entity("invoice");
		const now = new Date().valueOf();
		const dayInSec = 24 * 60 * 60 * 1000;
		const from = new Date(now - 2 * dayInSec * 365);

		entity.attributes.push(
			attribute("invoicenumber", "count", "ID_CNT"), // Use for Count of orders | we need to st alias for aggregation
			attribute("totalamount_base", "sum", "AMOUNT_SUM"), // Use for SUM AMOUNT of orders
			attribute("totalamount_base", "max", "AMOUNT_MAX"), // Use for MAX AMOUNT of orders
			attribute("totalamount_base", "min", "AMOUNT_MIN"), // Use for MIN AMOUNT of orders
			attribute("totalamount_base", "avg", "AMOUNT_AVG"), // Use for AconstAGE AMOUNT of orders
		);
		entity.filter = new MobileCRM.FetchXml.Filter();
		entity.filter.where("createdon", "on-or-after", formatDate(from));

		const fetch = new MobileCRM.FetchXml.Fetch(entity);
		fetch.aggregate = true; // Set this attribute to true to allow aggregation functions.
		const res = await fetch.executeAsync("Array");

		return `Summary: Total(${Math.round(res[0][1])} EUR in ${res[0][0]} invoices) Max(${Math.round(res[0][2])}) Min(${Math.round(res[0][3])}) Avg(${Math.round(res[0][4])})`;
	}

	private static labels = {
		month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		quarter: ["Q1", "Q2", "Q3", "Q4"],
	};
}

function attribute(name: string, type: string, alias: string): MobileCRM.FetchXml.Attribute {
	const attr = new MobileCRM.FetchXml.Attribute(name);
	attr.aggregate = type;
	attr.alias = alias;
	return attr;
}

function attributeGroup(name: string, dategrouping: DateGroupingType, alias?: string): MobileCRM.FetchXml.Attribute {
	const attr = new MobileCRM.FetchXml.Attribute(name);
	attr.alias = alias;
	attr.groupby = true;
	attr.dategrouping = dategrouping;
	return attr;
}

function fakeData(count: number, min: number = 0, max: number = 1000000): number[] {
	const arr = [];
	for (let i = 0; i < count; i++) {
		arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
	}
	return arr;
}
