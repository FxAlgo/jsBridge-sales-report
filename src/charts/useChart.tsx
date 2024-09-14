import Chart, { Chart as ChartJS, CoreChartOptions } from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import { useCallback, useRef } from "react";
import { ChartDatasets } from "../data/types";
/*
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);*/

type UseChartProps = {
	create: (element: HTMLCanvasElement) => void;
	setData: (data: ChartDatasets, annotation?: ChartAnnotation) => void;
	destroy: () => void;
};

Chart.register(annotationPlugin);

export type ChartOptions = CoreChartOptions<any>;
export type ChartAnnotation = any;

export function useChart(data: ChartDatasets, options: ChartOptions): UseChartProps {
	const ref = useRef<ChartJS>();

	const create = useCallback(
		(element: HTMLCanvasElement): void => {
			if (ref.current || !element) {
				return;
			}

			ref.current = new ChartJS(element, {
				type: "bar",
				data,
				options: { ...defaultOptions, ...options },
			});
		},
		[data, options],
	);

	const setData = useCallback(
		(data: ChartDatasets, annotation?: ChartAnnotation) => {
			if (ref.current) {
				ref.current.data = data;
				ref.current.options.plugins.annotation = annotation;
				//console.log(JSON.stringify(annotation));
				ref.current.update();
			}
		},
		[ref.current],
	);

	const destroy = () => {
		const chartRef = ref.current;
		if (chartRef !== undefined) {
			ref.current = undefined;
			chartRef.destroy();
		}
	};

	return { create, destroy, setData };
}

const defaultOptions: Partial<CoreChartOptions<any>> = {
	responsive: true,
	maintainAspectRatio: false,
};
