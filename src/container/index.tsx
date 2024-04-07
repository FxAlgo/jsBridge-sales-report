import { useEffect, useState } from "react";
import { Chart } from "../charts";
import { createCumulativeDataset } from "../data/calculateDataSet";
import { useDataService } from "../data/dataProvider";
import { DateGroupingType } from "../data/datatype";
import { StatusBox } from "./statusBox";

type Props = {
	type: DateGroupingType;
	cumulative?: boolean;
	estimate?: boolean;
};

export const Container = (props: Props) => {
	const service = useDataService();
	const [pureData, setPureData] = useState<any>(null);
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<string>(null);

	useEffect(() => {
		(async () => {
			try {
				const data = !service ? null : await service.invoices(props.type || "month");
				setPureData(data);
			} catch (e) {
				setError(e.toString());
			}
		})();
	}, [service, props.type]);

	useEffect(() => {
		if (pureData) {
			if (props.cumulative) {
				setData(createCumulativeDataset(pureData, props.estimate));
			} else {
				setData(pureData);
			}
		}
	}, [pureData, props.cumulative, props.estimate]);

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
