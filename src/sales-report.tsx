import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ButtonGroup } from "./buttonGroup";
import { Container } from "./container";
import { DataProvider } from "./data/dataProvider";
import { DataTable, DateGroupingType } from "./data/fetch";
import "./sales-report.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
const searchParams = new URLSearchParams(window.location.search);

const App = () => {
	const [type, setType] = useState<DateGroupingType>((searchParams?.get("type") as DateGroupingType) ?? "year");
	const [dataSet, setDataSet] = useState<DataTable>((searchParams?.get("dataset") as DataTable) ?? "order");
	const [cumulative, setCumulative] = useState<boolean>(searchParams && searchParams.get("cumulative") ? true : false);
	const [estimate, setEstimate] = useState<boolean>(searchParams && searchParams.get("estimate") ? true : false);

	useEffect(() => {
		//
	}, [cumulative]);

	const onSelect = (value: string) => {
		if (value === "order" || value === "invoice") {
			setDataSet(value);
		} else if (value === "Cumulative") {
			setCumulative(true);
		} else if (value === "Estimate") {
			setEstimate(true);
		}
	};

	const onTypeSelect = (value: string) => {
		if (value === "month" || value === "quarter" || value === "year") {
			setType(value);
			setCumulative(false);
		}
	};

	return (
		<DataProvider>
			<Container type={type ?? "year"} dataset={dataSet ?? "order"} cumulative={cumulative} estimate={estimate} />
			<div style={{ display: "flex", justifyContent: "center" }}>
				<ButtonGroup
					style={{ marginRight: "1rem" }}
					onSelect={onTypeSelect}
					buttons={[
						{ title: "Y", value: "year" },
						{ title: "Q", value: "quarter" },
						{ title: "M", value: "month" },
					]}
				/>
				<ButtonGroup
					onSelect={onSelect}
					buttons={[
						{ title: "Orders", value: "order" },
						{ title: "Invoices", value: "invoice" },
					]}
				/>
			</div>
		</DataProvider>
	);
};

root.render(<App />);
