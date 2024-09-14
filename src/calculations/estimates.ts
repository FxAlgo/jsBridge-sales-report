import { DataRecord, DataRecordSets, toDate } from "../data/convertFetchRecords";
import { DateGroupingType } from "../data/fetch";
import { DataType, DayInMilliseconds } from "../data/types";

export function addEstimates(dataRecordSets: DataRecordSets, type: DateGroupingType, yearNumber: number = 2): void {
	for (const dataTable in dataRecordSets) {
		const data = dataRecordSets[dataTable].data;
		if (type == "month") {
			estimateThisMonth(data);
		} else if (type == "quarter") {
			estimateThisQuarter(data);
		} else if (type == "year") {
			if (estimateThisYear(data)) {
				addNextYearsEstimates(data, yearNumber);
			}
		}
	}
}

function updateRecord(rec: DataRecord, factor: number): void {
	rec.name += " Est.";
	rec.total /= factor;
	rec.values = rec.values !== undefined ? rec.values.map(v => v / factor) : undefined;
}

function estimateThisYear(rec: DataRecord[]): boolean {
	const now = new Date();
	const year = now.getFullYear();
	const startYear = new Date(year, 0, 1).valueOf();
	const endYear = new Date(year, 11, 31).valueOf();
	const nowPart = now.valueOf() - startYear;
	const yearPart = endYear - startYear;
	const factor = nowPart / yearPart;

	if (rec.length > 0 && factor > 0.4 && factor < 0.95) {
		updateRecord(rec[rec.length - 1], factor);
		return true;
	}
	return false;
}

function estimateThisMonth(rec: DataRecord[]): boolean {
	if (rec.length > 0) {
		const last = rec[rec.length - 1];
		const { year, month } = toDate(last);
		const now = new Date();
		const startMon = new Date(year, month - 1, 1).valueOf();
		const endMon = startMon + 30 * DayInMilliseconds;
		const nowPart = now.valueOf() - startMon;
		const factor = nowPart / (endMon - startMon);
		if (factor > 0.4 && factor < 0.95) {
			updateRecord(last, factor);
			return true;
		}
	}
	return false;
}

function estimateThisQuarter(rec: DataRecord[]): boolean {
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
			updateRecord(last, factor);
			return true;
		}
	}
	return false;
}

function addNextYearsEstimates(rec: DataRecord[], yearNumber: number = 2): boolean {
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
		total: calculateCAGR(rec, undefined, usePastYear),
		values: undefined,
	};

	if (last.values !== undefined) {
		item.values = [
			calculateCAGR(rec, DataType.New, usePastYear),
			calculateCAGR(rec, DataType.Upsell, usePastYear),
			calculateCAGR(rec, DataType.Renewal, usePastYear),
		];
	}
	rec.push(item);
}

function calculateCAGR(rec: DataRecord[], type: DataType | undefined, years: number = 2): number {
	const len = rec.length;
	const lastIdx = len - 1;

	// Moving average
	// let sum = 0;
	// for (let count = 0; count < years; count++) {
	//		sum += rec[--len].values[type];
	// }
	//return sum / years;

	const startRec = rec[lastIdx];
	const endRec = rec[lastIdx - years];

	const startValue = startRec.values !== undefined ? startRec.values[type as DataType] : startRec.total;
	const endValue = endRec.values !== undefined ? endRec.values[type as DataType] : endRec.total;
	const cagr = Math.pow(startValue / endValue, 1 / years) - 1;
	return startValue * (1 + cagr);
}
