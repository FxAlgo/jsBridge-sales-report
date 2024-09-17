import /* webpackChunkName: "[chart]" */ Chart, { Chart as ChartJS, ChartOptions as ChartOptionsJS, TooltipItem } from "chart.js/auto";
import /* webpackChunkName: "[chart]" */ annotationPlugin from "chartjs-plugin-annotation";
import { useCallback, useRef } from "react";
//import { ChartDatasets } from "../data/types";
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

export type ChartSupportedTypes = "bar" | "line";
export type ChartOptions = ChartOptionsJS<ChartSupportedTypes>;
export type ChartTooltipItem = TooltipItem<ChartSupportedTypes>;
export type ChartAnnotation = any;

export type ChartDataset = {
	label: string;
	data: number[];
	type?: ChartSupportedTypes;
	stack?: string;
	borderColor?: string;
	borderWidth?: number;
	backgroundColor?: string;
	backgroundColorHover?: string;
};

export type ChartDatasets = {
	labels: string[];
	datasets: ChartDataset[];
};

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
				if (ref.current.options?.plugins) {
					ref.current.options.plugins.annotation = annotation;
				}
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

const defaultOptions: Partial<ChartOptions> = {
	responsive: true,
	maintainAspectRatio: false,
};
