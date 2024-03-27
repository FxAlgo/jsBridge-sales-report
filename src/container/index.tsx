import { useEffect, useState } from "react";
import { Chart } from "../charts";
import { useDataService } from "../data/dataProvider";
import { DateGroupingType } from "../data/serviceBridge";
import { StatusBox } from "./statusBox";

export const Container = () => {
	const service = useDataService();
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<string>(null);
	const [type] = useState<DateGroupingType>(() => {
		const searchParams = new URLSearchParams(window.location.search);
		return searchParams ? (searchParams.get("type") as DateGroupingType) : undefined;
	});

	useEffect(() => {
		(async () => {
			try {
				const data = !service ? null : await service.invoices(type || "month");
				setData(data);
			} catch (e) {
				setError(e.toString());
			}
		})();
	}, [service]);

	if (error) {
		return <StatusBox error={error} />;
	} else {
		return <Chart data={data} options={options} />;
	}
};

const options = {
	/*
	plugins: {
		title: {
			display: true,
			text: "Sales...",
		},
	},*/
	scales: {
		x: {
			grouped: true,
		},
		y: {
			grouped: true,
		},
	},
};
