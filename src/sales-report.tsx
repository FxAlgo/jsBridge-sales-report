import { useState } from "react";
import { createRoot } from "react-dom/client";
import "rsuite/dist/rsuite.css";
import { TimeAnalyze } from "./container/TimeAnalyze";
import { DataProvider } from "./container/dataProvider";
import "./sales-report.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
const searchParams = new URLSearchParams(window.location.search);
const searchParamValue = <T extends string>(name: string, defaultValue: T): T => (searchParams.get(name) as T) ?? defaultValue;

type AnalyzeType = "time-analyze" | "products" | "sales-team";

const App = () => {
	const [analyzeType] = useState<AnalyzeType>(searchParamValue("analyze-type", "time-analyze"));
	const [testFetch] = useState<boolean>(searchParamValue<string>("fetch-test", "0") === "1" ? true : false);

	const AnalyzePanel = () => {
		if (analyzeType === "products") {
			return <div>Not implemented</div>;
		} else if (analyzeType === "sales-team") {
			return <div>Not implemented</div>;
		} else {
			return <TimeAnalyze testFetch={testFetch} />;
		}
	};

	return (
		<DataProvider>
			<AnalyzePanel />
		</DataProvider>
	);
};

root.render(<App />);
