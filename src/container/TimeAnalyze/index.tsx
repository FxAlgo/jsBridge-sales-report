import { useState } from "react";
import { Button, ButtonGroup, ButtonToolbar, FlexboxGrid } from "rsuite";
import { DateGroupingType } from "../../data/types";
import { DataProvider } from "../dataProvider";
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
			<FlexboxGrid justify="center">
				<PeriodButtonBar appearance="primary" onClick={(a: string) => setPeriodType(a as DateGroupingType)} />
				<AnalyzeButtonBar appearance="primary" onClick={(a: string) => setChartType(a as ChartType)} />
			</FlexboxGrid>
		</DataProvider>
	);
};

type ButtonProps = {
	onClick: (val: string) => void;
	appearance?: "default" | "primary" | "link" | "subtle";
};

const PeriodButtonBar = ({ onClick, appearance }: ButtonProps) => (
	<ButtonToolbar>
		<ButtonGroup>
			<Button appearance={appearance} onClick={() => onClick("year")}>
				{" "}
				Y{" "}
			</Button>
			<Button appearance={appearance} onClick={() => onClick("quarter")}>
				{" "}
				Q{" "}
			</Button>
			<Button appearance={appearance} onClick={() => onClick("month")}>
				{" "}
				M{" "}
			</Button>
		</ButtonGroup>
	</ButtonToolbar>
);

const AnalyzeButtonBar = ({ onClick, appearance }: ButtonProps) => (
	<ButtonToolbar style={{ marginLeft: "0.5rem" }}>
		<ButtonGroup>
			<Button appearance={appearance} onClick={() => onClick("sale")}>
				Sale
			</Button>
			<Button appearance={appearance} onClick={() => onClick("profit")}>
				Est. profit
			</Button>
		</ButtonGroup>
	</ButtonToolbar>
);
