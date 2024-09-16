import { DateGroupingType } from "../types";
import { FetchRecord } from "./types";

export function fetchCosts(type: DateGroupingType): FetchRecord[] {
	if (type === "month") {
		const result: FetchRecord[] = [];
		for (const cost of costs) {
			for (let m = 1; m <= 12; m++) {
				result.push([cost[0], m, (cost[2] as number) / 12, cost[3]]);
			}
		}
		return result;
	} else if (type === "quarter") {
		return costs.flatMap(cost => [
			[cost[0], 1, (cost[2] as number) / 4, cost[3]],
			[cost[0], 2, (cost[2] as number) / 4, cost[3]],
			[cost[0], 3, (cost[2] as number) / 4, cost[3]],
			[cost[0], 4, (cost[2] as number) / 4, cost[3]],
		]);
	} else {
		return costs;
	}
}

export const costs: FetchRecord[] = [
	[2020, 2020, -4262897, "Personal"],
	[2020, 2020, -1186182, "Office"],
	[2020, 2020, -3282025, "Others"],

	[2021, 2021, -6130692, "Personal"],
	[2021, 2021, -1186182, "Office"],
	[2021, 2021, -4129125, "Others"],

	[2022, 2022, -5838229, "Personal"],
	[2022, 2022, -1186182, "Office"],
	[2022, 2022, -4216457, "Others"],

	[2023, 2023, -6564102, "Personal"],
	[2023, 2023, -1186182, "Office"],
	[2023, 2023, -4750830, "Others"],

	[2024, 2024, -3316995, "Personal"],
	[2024, 2024, -792144, "Office"],
	[2024, 2024, -1612410, "Others"],
];
