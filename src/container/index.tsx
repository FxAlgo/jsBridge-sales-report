import { useEffect, useState } from "react";
import { Chart } from "../charts";
import { createCumulativeDataset } from "../data/calculateDataSet";
import { useDataService } from "../data/dataProvider";
import { fetchDataTable } from "../data/dataSets";
import { DataTable, DateGroupingType } from "../data/fetch";
import { ChartData } from "../data/types";
import { StatusBox } from "./statusBox";

type Props = {
	type: DateGroupingType;
	dataset: DataTable;
	cumulative?: boolean;
	estimate?: boolean;
};

export const Container = (props: Props) => {
	const service = useDataService();
	const [pureData, setPureData] = useState<ChartData>(null);
	const [chartData, setChartData] = useState<ChartData>(null);
	const [error, setError] = useState<string>(null);

	useEffect(() => {
		(async () => {
			try {
				const data = !service ? null : await fetchDataTable(props.dataset, props.type ?? "month");

				//const pureData = await aggregatedFetch(props.dataset, props.type);
				//setError(JSON.stringify(pureData) + "\n\n\n\n\n\n\n");

				setPureData(data);
			} catch (e) {
				setError(e.toString());
			}
		})();
	}, [service, props.type, props.dataset]);

	useEffect(() => {
		if (pureData) {
			if (props.cumulative) {
				setChartData(createCumulativeDataset(pureData, props.estimate));
			} else {
				setChartData(pureData);
			}
		}
	}, [pureData, props.cumulative, props.estimate]);

	if (error) {
		return <StatusBox error={error} />;
	} else if (chartData) {
		return <Chart data={chartData.datasets} options={chartData.options} />;
	} else {
		return <StatusBox text="Loading..." />;
	}
};
