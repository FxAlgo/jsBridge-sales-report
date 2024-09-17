import { createRef, useEffect } from "react";
import { ChartAnnotation, ChartDatasets, ChartOptions, useChart } from "./useChart";

export type ChartProps = {
	data: ChartDatasets;
	options: ChartOptions;
	annotation?: ChartAnnotation;
};

export const Chart = ({ data, options }: ChartProps) => {
	const { create, setData, destroy } = useChart(data, options);
	const element = createRef<any>();

	useEffect(() => {
		create(element.current);
		return () => {
			destroy();
		};
	}, []);

	useEffect(() => {
		setData(data, options.plugins?.annotation);
	}, [data]);

	const divStyle = {
		width: "100%",
		height: "100%",
	};

	return <canvas ref={element} />;
};
