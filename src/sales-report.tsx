import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AnalyzeType, Container } from "./container";
import { ButtonGroup } from "./controls/buttonGroup";
import { DataProvider } from "./data/dataProvider";
import { DateGroupingType } from "./data/types";
import "./sales-report.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
const searchParams = new URLSearchParams(window.location.search);
const searchParamValue = <T extends string>(name: string, defaultValue: T): T => (searchParams.get(name) as T) ?? defaultValue;

const App = () => {
	const [period, setPeriodType] = useState<DateGroupingType>(searchParamValue("type", "year"));
	const [analyzeType, setAnalyzeType] = useState<AnalyzeType>(searchParamValue("analyzeType", "sale"));
	const [testFetch] = useState<boolean>(searchParamValue<string>("fetch-test", "0") === "1" ? true : false);

	const onPeriodSelect = (value: string) => {
		if (value === "month" || value === "quarter" || value === "year") {
			setPeriodType(value);
		}
	};

	return (
		<DataProvider>
			<Container type={period ?? "year"} analyzeType={analyzeType} testFetch={testFetch} />
			<div style={{ display: "flex", justifyContent: "center" }}>
				<ButtonGroup
					onSelect={onPeriodSelect}
					buttons={[
						{ title: "Y", value: "year" },
						{ title: "Q", value: "quarter" },
						{ title: "M", value: "month" },
					]}
				/>
				<ButtonGroup
					style={{ marginLeft: "0.5rem" }}
					onSelect={(a: string) => setAnalyzeType(a as AnalyzeType)}
					buttons={[
						{ title: "Sale", value: "sale" },
						{ title: "Est. profit", value: "profit" },
					]}
				/>
			</div>
		</DataProvider>
	);
};

root.render(<App />);
