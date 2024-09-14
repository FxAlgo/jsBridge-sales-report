import "@resconet/jsbridge";
import { DataRecord, toDate } from "../data/convertFetchRecords";
import { DataType, DayInMilliseconds } from "../data/types";

export function estimateThisYear(rec: DataRecord[]): boolean {
	const now = new Date();
	const year = now.getFullYear();
	const startYear = new Date(year, 0, 1).valueOf();
	const endYear = new Date(year, 11, 31).valueOf();
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

export function estimateThisMonth(rec: DataRecord[]): boolean {
	if (rec.length > 0) {
		const last = rec[rec.length - 1];
		const { year, month } = toDate(last);
		const now = new Date();
		const startMon = new Date(year, month - 1, 1).valueOf();
		const endMon = startMon + 30 * DayInMilliseconds;
		const nowPart = now.valueOf() - startMon;
		const factor = nowPart / (endMon - startMon);
		if (factor > 0.4 && factor < 0.95) {
			const last = rec[rec.length - 1];
			last.name += " Est.";
			last.values = last.values.map(v => v / factor);
			return true;
		}
	}
	return false;
}

export function estimateThisQuarter(rec: DataRecord[]): boolean {
	if (rec.length > 0) {
		const last = rec[rec.length - 1];
		const { year, month } = toDate(last);
		const now = new Date();
		const startMon = month * 3 - 2;
		const startDate = new Date(year, startMon - 1, 1).valueOf();
		const endDate = startDate + 91 * DayInMilliseconds;
		const nowPart = now.valueOf() - startDate;
		const factor = nowPart / (endDate - startDate);
		if (factor > 0.4 && factor < 0.95) {
			last.name += " Est.";
			last.values = last.values.map(v => v / factor);
			return true;
		}
	}
	return false;
}

export function addNextYearsEstimates(rec: DataRecord[], yearNumber: number = 2): boolean {
	if (rec.length > 2) {
		for (let i = 0; i < yearNumber; i++) {
			estimateNextYear(rec);
		}
		return true;
	}
	return false;
}

function estimateNextYear(rec: DataRecord[]): void {
	const last = rec[rec.length - 1];
	const { year } = toDate(last);
	const usePastYear = 2;

	if (rec.length < usePastYear) {
		return;
	}

	const item: DataRecord = {
		date: (year + 1) * 100,
		name: `${year + 1} Est.`,
		values: [
			calculateCAGR(rec, DataType.New, usePastYear),
			calculateCAGR(rec, DataType.Upsell, usePastYear),
			calculateCAGR(rec, DataType.Renewal, usePastYear),
			calculateCAGR(rec, DataType.Total, usePastYear),
		],
	};
	rec.push(item);
}

function calculateCAGR(rec: DataRecord[], type: DataType, years: number = 2): number | undefined {
	let len = rec.length;

	if (years < 2 || years > len) {
		return undefined;
	}

	// Moving average
	// let sum = 0;
	// for (let count = 0; count < years; count++) {
	//		sum += rec[--len].values[type];
	// }
	//return sum / years;

	const startValue = rec[len - 1].values[type];
	const endValue = rec[len - years - 1].values[type];
	const cagr = Math.pow(startValue / endValue, 1 / years) - 1;
	return startValue * (1 + cagr);
}
