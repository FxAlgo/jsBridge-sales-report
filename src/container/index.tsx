import { useEffect, useState } from "react";
import { Chart } from "../charts";
import { useDataService } from "../data/dataProvider";
import { prepareIncomeChart, prepareIncomeExpensesChart } from "../data/dataSets";
import { ChartData, DateGroupingType } from "../data/types";
import { StatusBox } from "./statusBox";

export type AnalyzeType = "sale" | "profit";
type Props = {
	type: DateGroupingType;
	analyzeType: AnalyzeType;
};

export const Container = (props: Props) => {
	const service = useDataService();
	const [pureData, setPureData] = useState<ChartData | undefined>(undefined);
	const [chartData, setChartData] = useState<ChartData | undefined>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);

	useEffect(() => {
		(async () => {
			try {
				const type = props.type ?? "month";
				if (type != "month" && type != "quarter" && type != "year") {
					throw new Error("Invalid date grouping type");
				}

				//const pureData = await aggregatedFetch(["opportunity"], props.type);
				//setError(JSON.stringify(pureData) + "\n\n\n\n\n\n\n");
				//return;

				if (props.analyzeType === "sale") {
					setPureData(await prepareIncomeChart(type));
				} else if (props.analyzeType === "profit") {
					setPureData(await prepareIncomeExpensesChart(type));
				}
			} catch (e: any) {
				setError(e.toString());
			}
		})();
	}, [service, props.type, props.analyzeType]);

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
