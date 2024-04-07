import { Dataset, Datasets, DayInSeconds } from "./datatype";

export const createCumulativeDataset = (datasets: Datasets, estimate?: boolean) => {
	const inDatasets = datasets.datasets;
	const outData = cloneDatasets(datasets);

	if (estimate && inDatasets.length > 1) {
		const lastIdx = inDatasets.length - 1;
		outData.datasets[lastIdx] = estimatedDataset(inDatasets[lastIdx], inDatasets[lastIdx - 1]);
	}

	return cumulativeDataset(outData);
};

const cloneDatasets = (datasets: Datasets): Datasets => {
	return {
		labels: [...datasets.labels],
		datasets: datasets.datasets.map(dataset => cloneDataset(dataset)),
	};
};

const cloneDataset = (dataset: Dataset): Dataset => {
	return {
		label: dataset.label,
		data: [...dataset.data],
	};
};

function daysIntoYear(date: Date) {
	return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / DayInSeconds / 1000;
}

const cumulativeDataset = (data: Datasets): Datasets => {
	const outData = {
		labels: [...data.labels],
		datasets: [],
	};

	for (const dataset of data.datasets) {
		let sum = 0;
		outData.datasets.push({
			...dataset,
			data: dataset.data.map((val: number) => (sum += val)),
		});
	}
	return outData;
};

const daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const estimatedDataset = (currentYear: Dataset, prevYear: Dataset): Dataset => {
	let sum = 0;
	let m = 0;
	const now = new Date();
	const thisMonth = now.getMonth();
	const outData: Dataset = {
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
