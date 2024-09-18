import { useState } from "react";
import { ButtonGroup } from "../../controls/buttonGroup";
import { DataProvider } from "../../data/dataProvider";
import { DateGroupingType } from "../../data/types";
import { ChartType, TimeBarCharts } from "./chart";

type Props = {
	testFetch?: boolean;
};

export const TimeAnalyze = ({ testFetch }: Props) => {
	const [period, setPeriodType] = useState<DateGroupingType>("year");
	const [chartType, setChartType] = useState<ChartType>("sale");

	return (
		<DataProvider>
			<TimeBarCharts period={period ?? "year"} chartType={chartType} testFetch={testFetch} />
			<div style={{ display: "flex", justifyContent: "center" }}>
				<ButtonGroup
					onSelect={(a: string) => setPeriodType(a as DateGroupingType)}
					buttons={[
						{ title: "Y", value: "year" },
						{ title: "Q", value: "quarter" },
						{ title: "M", value: "month" },
					]}
				/>
				<ButtonGroup
					style={{ marginLeft: "0.5rem" }}
					onSelect={(a: string) => setChartType(a as ChartType)}
					buttons={[
						{ title: "Sale", value: "sale" },
						{ title: "Est. profit", value: "profit" },
					]}
				/>
			</div>
		</DataProvider>
	);
};
