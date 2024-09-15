import { DateGroupingType, FetchRecord } from "./types";

export enum CostType {
	Office = 0,
	Personal = 1,
	Others = 2,
}

export function fetchCosts(type: DateGroupingType): FetchRecord[] {
	const inData = costs.filter(v => v[3] === "Total").map(v => [v[0], v[1], v[2]] as FetchRecord);

	if (type === "month") {
		const result: FetchRecord[] = [];
		for (const cost of inData) {
			for (let m = 1; m <= 12; m++) {
				result.push([cost[0], m, (cost[2] as number) / 12, cost[3]]);
			}
		}
		return result;
	} else if (type === "quarter") {
		return inData.flatMap(cost => [
			[cost[0], 1, (cost[2] as number) / 4, cost[3]],
			[cost[0], 2, (cost[2] as number) / 4, cost[3]],
			[cost[0], 3, (cost[2] as number) / 4, cost[3]],
			[cost[0], 4, (cost[2] as number) / 4, cost[3]],
		]);
	} else {
		return inData;
	}
}

export const costs: FetchRecord[] = [
	[2020, 2020, -4262897, "Personal"],
	[2020, 2020, -1186182, "Office"],
	[2020, 2020, -9157812, "Total"],

	[2021, 2021, -6130692, "Personal"],
	[2021, 2021, -1186182, "Office"],
	[2021, 2021, -11445999, "Total"],

	[2022, 2022, -5838229, "Personal"],
	[2022, 2022, -1186182, "Office"],
	[2022, 2022, -11240868, "Total"],

	[2023, 2023, -6564102, "Personal"],
	[2023, 2023, -1186182, "Office"],
	[2023, 2023, -12501114, "Total"],

	[2024, 2024, -3316995, "Personal"],
	[2024, 2024, -792144, "Office"],
	[2024, 2024, -(2404554 - 792144), "Others"],
	[2024, 2024, -(3316995 + 2404554), "Total"],

	//	[2024, 2024, -6116011, "Personal"],
	//	[2024, 2024, -1152560, "Office"],
	//	[2024, 2024, -10427964, "Total"],
];
