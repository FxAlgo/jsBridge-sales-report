import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ButtonGroup } from "./buttonGroup";
import { AnalyzeType, Container } from "./container";
import { DataProvider } from "./data/dataProvider";
import { DateGroupingType } from "./data/fetch";
import "./sales-report.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
const searchParams = new URLSearchParams(window.location.search);

const App = () => {
	const [period, setPeriodType] = useState<DateGroupingType>((searchParams?.get("type") as DateGroupingType) ?? "year");
	const [analyzeType, setAnalyzeType] = useState<AnalyzeType>((searchParams?.get("analyzeType") as AnalyzeType) ?? "sale");

	const onPeriodSelect = (value: string) => {
		if (value === "month" || value === "quarter" || value === "year") {
			setPeriodType(value);
		}
	};

	return (
		<DataProvider>
			<Container type={period ?? "year"} analyzeType={analyzeType} />
			<div style={{ display: "flex", justifyContent: "center" }}>
				<ButtonGroup
					onSelect={onPeriodSelect}
					buttons={[
						{ title: "Year", value: "year" },
						{ title: "Quarter", value: "quarter" },
						{ title: "Month", value: "month" },
					]}
				/>
				<ButtonGroup
					style={{ marginLeft: "1rem" }}
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
