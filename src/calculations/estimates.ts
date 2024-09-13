import "@resconet/jsbridge";
import { DataRecord } from "../data/convertFetchRecords";
import { DataType } from "../data/types";

export function estimateThisYear(rec: DataRecord[]): boolean {
	const now = new Date();
	const year = now.getFullYear();
	const startYear = new Date("1/1/" + year).valueOf();
	const endYear = new Date("12/31/" + year).valueOf();
	const nowPart = now.valueOf() - startYear;
	const yearPart = endYear - startYear;
	const factor = nowPart / yearPart;

	if (rec.length > 0 && factor > 0.4 && factor < 0.95) {
		const last = rec[rec.length - 1];
		last.name += " Est.";
		last.values = last.values.map(v => v / factor);
		return true;
	}
	return false;
}

export function addNextYearsEstimates(rec: DataRecord[], yearNumber: number = 2): boolean {
	if (rec.length > 2) {
		for (let i = 0; i < yearNumber; i++) {
			estimateNextYear(rec);
			estimateNextYear(rec);
		}
		return true;
	}
	return false;
}

function estimateNextYear(rec: DataRecord[]): void {
	const last = rec[rec.length - 1];

	const item: DataRecord = {
		sortHelper: 0,
		year: last.year + 1,
		name: `${last.year + 1} Est.`,
		values: [
			calculateCAGR(rec, DataType.New),
			calculateCAGR(rec, DataType.Upsell),
			calculateCAGR(rec, DataType.Renewal),
			calculateCAGR(rec, DataType.Total),
		],
	};
	rec.push(item);
}

function calculateCAGR(rec: DataRecord[], type: DataType, years: number = 2): number | undefined {
	// Moving average
	let len = rec.length;
	let sum = 0;

	if (years > len) {
		years = len;
	}
	if (years < 2) {
		return undefined;
	}
	//	for (let count = 0; count < years; count++) {
	//		sum += rec[--len].values[type];
	//	}
	//return sum / years;

	const startValue = rec[len - 1].values[type];
	const endValue = rec[len - years - 1].values[type];
	const cagr = Math.pow(startValue / endValue, 1 / years) - 1;
	return startValue * (1 + cagr);
}
