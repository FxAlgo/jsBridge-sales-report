import { Chart as ChartJS } from "chart.js/auto";
import { useCallback, useRef } from "react";

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
	setData: (data: any) => void;
	destroy: () => void;
};

export function useChart(data: any, options: any): UseChartProps {
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
		(data: any) => {
			if (ref.current) {
				ref.current.data = data;
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

const defaultOptions = {
	plugins: {
		title: {
			display: true,
			text: "Sales...",
		},
	},
	responsive: true,
	scales: {
		x: {
			stacked: true,
		},
		y: {
			stacked: true,
		},
	},
};
