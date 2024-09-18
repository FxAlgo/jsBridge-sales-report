import { useEffect, useState } from "react";
import { Chart } from "../../controls/charts";
import { aggregatedFetch } from "../../data/fetch";
import { ChartData, DateGroupingType, SecondaryGroupingType } from "../../data/types";
import { useDataService } from "../dataProvider";
import { StatusBox } from "../statusBox";
import { prepareIncomeChart, prepareIncomeExpensesChart } from "./dataSets";

export type ChartType = "sale" | "profit";

type Props = {
	period: DateGroupingType;
	chartType: ChartType;
	testFetch?: boolean;
};

export const TimeBarCharts = ({ period, chartType, testFetch }: Props) => {
	const service = useDataService();
	const [pureData, setPureData] = useState<ChartData | undefined>(undefined);
	const [chartData, setChartData] = useState<ChartData | undefined>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);

	useEffect(() => {
		(async () => {
			try {
				//const type = type ?? "month";
				if (period != "month" && period != "quarter" && period != "year") {
					throw new Error("Invalid date grouping type");
				}

				if (testFetch) {
					const pureData = await aggregatedFetch(["opportunity"], period, SecondaryGroupingType.PerOwner);
					setError(JSON.stringify(pureData) + "\n\n\n\n\n\n\n");
					return;
				}

				if (chartType === "sale") {
					setPureData(await prepareIncomeChart(period));
				} else if (chartType === "profit") {
					setPureData(await prepareIncomeExpensesChart(period));
				}
			} catch (e: any) {
				setError(e.toString());
			}
		})();
	}, [service, period, chartType]);

	useEffect(() => {
		if (pureData) {
			setChartData(pureData);
		}
	}, [pureData]);

	if (error) {
		return <StatusBox error={error} />;
	} else if (chartData) {
		//console.log(JSON.stringify(chartData.options?.plugins?.annotation));
		return <Chart data={chartData.datasets} options={chartData.options} />;
	} else {
		return <StatusBox text="Loading..." />;
	}
};
