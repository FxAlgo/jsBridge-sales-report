import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ButtonGroup } from "./buttonGroup";
import { Container } from "./container";
import { DataProvider } from "./data/dataProvider";
import { DateGroupingType } from "./data/datatype";
import "./sales-report.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
const searchParams = new URLSearchParams(window.location.search);

const App = () => {
	const [type, setType] = useState<DateGroupingType>(searchParams ? (searchParams.get("type") as DateGroupingType) : undefined);
	const [cumulative, setCumulative] = useState<boolean>(searchParams && searchParams.get("cumulative") ? true : false);
	const [estimate, setEstimate] = useState<boolean>(searchParams && searchParams.get("estimate") ? true : false);

	useEffect(() => {
		//
	}, [cumulative]);

	const onSelect = (value: string) => {
		if (value === "month" || value === "quarter") {
			setType(value);
			setCumulative(false);
		} else if (value === "Cumulative") {
			setCumulative(true);
		} else if (value === "Estimate") {
			setEstimate(true);
		}
	};

	return (
		<DataProvider>
			<Container type={type} cumulative={cumulative} estimate={estimate} />
			<div style={{ display: "flex", justifyContent: "center" }}>
				<ButtonGroup
					onSelect={onSelect}
					buttons={[{ title: "Month", value: "month" }, { title: "Quarter", value: "quarter" }, { title: "Cumulative" }, { title: "Estimate" }]}
				/>
			</div>
		</DataProvider>
	);
};

root.render(<App />);
