import { ChartData, ChartDataset, DayInSeconds } from "../data/types";

export const createCumulativeDataset = (src: ChartData, estimate?: boolean) => {
	const inDatasets = src.datasets;
	const outData = cloneDatasets(src);

	if (estimate && inDatasets.datasets.length > 1) {
		const lastIdx = inDatasets.datasets.length - 1;
		outData.datasets.datasets[lastIdx] = estimatedDataset(inDatasets[lastIdx], inDatasets[lastIdx - 1]);
	}

	return cumulativeDataset(outData);
};

const cloneDatasets = (src: ChartData): ChartData => {
	const datasets = {
		labels: [...src.datasets.labels],
		datasets: src.datasets.datasets.map(dataset => cloneDataset(dataset)),
	};
	return {
		datasets,
		options: src.options,
	};
};

const cloneDataset = (dataset: ChartDataset): ChartDataset => {
	return {
		label: dataset.label,
		data: [...dataset.data],
	};
};

function daysIntoYear(date: Date) {
	return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / DayInSeconds / 1000;
}

const cumulativeDataset = (data: ChartData): ChartData => {
	const datasets = {
		labels: [...data.datasets.labels],
		datasets: [],
	};

	for (const dataset of data.datasets.datasets) {
		let sum = 0;
		datasets.datasets.push({
			...dataset,
			data: dataset.data.map((val: number) => (sum += val)),
		});
	}
	return { datasets, options: data.options };
};

const daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const estimatedDataset = (currentYear: ChartDataset, prevYear: ChartDataset): ChartDataset => {
	let sum = 0;
	let m = 0;
	const now = new Date();
	const thisMonth = now.getMonth();
	const outData: ChartDataset = {
		label: currentYear.label,
		data: [],
	};

	currentYear.data.forEach((val: number) => (sum += val));
	for (m = 0; m <= thisMonth; m++) {
		outData.data.push(currentYear.data[m]);
	}

	const days = daysIntoYear(now) || 1;
	const currentValuePerDay = sum / days;
	while (m < 12) {
		outData.data.push(daysInMonths[m++] * currentValuePerDay);
	}

	return outData;
};
