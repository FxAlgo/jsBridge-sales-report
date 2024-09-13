import { createRef, useEffect } from "react";
import { useChart } from "./useChart";

export type ChartProps = {
	data: any;
	options: any;
	annotation?: any;
};

export const Chart = ({ data, options, annotation }: ChartProps) => {
	const { create, setData, destroy } = useChart(data, options, annotation);
	const element = createRef<any>();

	useEffect(() => {
		create(element.current);
		return () => {
			destroy();
		};
	}, []);

	useEffect(() => {
		setData(data);
	}, [data]);

	const divStyle = {
		width: "100%",
		height: "100%",
	};

	return <canvas ref={element} />;
};
