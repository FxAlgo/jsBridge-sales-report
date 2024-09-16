import { Color, rgbaColor, rgbColor } from "../charts/colors";
import { ChartDataset, ChartOptions, ChartTooltipItem } from "../charts/useChart";
import { addEstimates } from "./calculations/estimates";
import { addRecordsOperation } from "./calculations/operations";
import { convertFetchRecordSets, DataRecordSet, DataRecordSets, toEuro, toValues } from "./convertFetchRecords";
import { dataTypeConfig } from "./dataTypeConfig";
import { demoData } from "./demoData";
import { aggregatedFetch, FetchRecordSets, summaryFetch } from "./fetch";
import { ChartData, DataTable, DateGroupingType } from "./types";

export async function prepareIncomeChart(type: DateGroupingType): Promise<ChartData | undefined> {
	const datasets: DataTable[] = ["order", "invoice", "opportunity"];
	let data: FetchRecordSets;
	if (process.env["NODE_ENV"] === "development") {
		data = demoData(datasets, type);
	} else {
		data = await aggregatedFetch(datasets, type);
	}

	const records = convertFetchRecordSets(data, type);
	addEstimates(records, type, 1);
	return toSalesChartDatasets(records);
}

export async function prepareIncomeExpensesChart(type: DateGroupingType): Promise<ChartData | undefined> {
	const datasets: DataTable[] = ["invoice", "cost"];
	let data: FetchRecordSets;

	if (process.env["NODE_ENV"] === "development") {
		data = demoData(datasets, type);
	} else {
		data = await aggregatedFetch(datasets, type);
	}

	const records = convertFetchRecordSets(data, type);
	addRecordsOperation(records, "invoice", "cost", "profit", (a: number, b: number) => a + b);
	addEstimates(records, type, 1);
	return toIncomeExpensesChartDatasets(records);
}

export async function fetchSummary(dataset: DataTable): Promise<string> {
	return await summaryFetch(dataset);
}
function toSalesChartDatasets(dataRecordSets: DataRecordSets): ChartData | undefined {
	const charDatasets: ChartDataset[] = [];
	const options: ChartOptions = { ...stackBarsOptions };
	let labels: string[] | undefined;

	for (const dataTable in dataRecordSets) {
		const dataSet = dataRecordSets[dataTable];

		if (labels === undefined) {
			labels = dataSet.data.map(v => v.name);
		}
		addToDatasets(charDatasets, dataSet, dataSet.name);
		addAnnotations(options, dataSet);
		addTrendTooltip(options);
	}
	return { datasets: { datasets: charDatasets, labels: labels as string[] }, options };
}

function toIncomeExpensesChartDatasets(dataRecordSets: DataRecordSets): ChartData | undefined {
	const charDatasets: ChartDataset[] = [];
	const options: ChartOptions = { ...stackBarsOptions };
	let labels: string[] | undefined;

	for (const dataTable in dataRecordSets) {
		const dataSet = dataRecordSets[dataTable];

		if (labels === undefined) {
			labels = dataSet.data.map(v => v.name);
		}
		addToDatasets(charDatasets, dataSet, dataTable === "profit" ? dataTable : undefined);
		addAnnotations(options, dataSet);
		addTrendTooltip(options);
	}
	return { datasets: { datasets: charDatasets, labels: labels as string[] }, options };
}

function addToDatasets(datasets: ChartDataset[], { data, name, valueNames }: DataRecordSet, stack?: string): void {
	const color = dataTypeConfig[name].color;
	if (valueNames && valueNames.length > 0) {
		const valueColors = dataTypeConfig[name].valueColors;
		for (let i = 0; i < valueNames.length; i++) {
			let backgroundColor = rgbaColor(color, 1 - i * 0.25);

			if (valueColors !== undefined) {
				if (valueColors[i] instanceof Array) {
					backgroundColor = rgbColor(valueColors[i] as Color);
				} else {
					backgroundColor = valueColors[i] as string;
				}
			}
			datasets.push({
				type: "bar",
				stack,
				label: valueNames[i],
				data: toValues(data, i),
				backgroundColor,
				borderWidth: 1,
			});
		}
	} else {
		const label = `${capitalize(name)}s`;
		if (name === "profit") {
			datasets.unshift({
				type: "line",
				stack,
				label,
				data: toValues(data),
				borderColor: rgbColor(color),
				backgroundColor: rgbColor(color),
				borderWidth: 2,
			});
		} else {
			datasets.push({
				type: "bar",
				stack,
				label,
				data: toValues(data),
				backgroundColor: rgbColor(color),
				borderWidth: 1,
			});
		}
	}
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

type TooltipDataset = { data: number[]; stack: string };
function addTrendTooltip(options: ChartOptions): void {
	const sumDataset = (dataset: TooltipDataset[], name: string, idx: number) => {
		let thisTotal = 0;
		let lastTotal = 0;
		for (const { data, stack } of dataset) {
			if (stack === name) {
				thisTotal += data[idx] as number;
				lastTotal += data[idx - 1] as number;
			}
		}
		if (thisTotal > 0) {
			const trend = lastTotal ? Math.round(((thisTotal - lastTotal) * 100) / lastTotal) : 0;
			return `\nTotal: ${toEuro(thisTotal)} (${trend}%)`;
		}
		return "";
	};

	const footer = (tooltipItems: ChartTooltipItem[]) => {
		if (tooltipItems.length > 0) {
			const item = tooltipItems[0];
			const idx = item.dataIndex;

			if (idx > 0) {
				const stack = item.dataset.stack;
				const data = item.dataset.data;
				const allData = item.chart.data?.datasets;
				const thisValue = data[idx] as number;
				const lastValue = data[idx - 1] as number;

				const trend = lastValue ? Math.round(((thisValue - lastValue) * 100) / lastValue) : 0;
				let result = `${item.dataset.label} trend: ${trend}%`;

				if (allData && stack) {
					result += sumDataset(allData as TooltipDataset[], stack, idx);
				}
				return result;
			}
		}
		return "";
	};

	if (!options.plugins) {
		options.plugins = {};
	}
	options.plugins.tooltip = {
		callbacks: {
			footer,
		},
	};
}

function annotation(value: number, borderColor: string, content: string): object {
	return {
		drawTime: "afterDraw",
		type: "line",
		mode: "horizontal",
		scaleID: "y",
		value,
		borderColor,
		borderWidth: 1,
		borderDash: [1, 1],
		label: {
			position: "start",
			display: true,
			backgroundColor: rgbaColor([90, 90, 90], 0.6),
			borderRadius: 3,
			content,
			rotation: "auto",
		},
	};
}

function addAnnotations(options: ChartOptions, dataSet: DataRecordSet): void {
	if (!options.plugins) {
		options.plugins = {};
	}

	if (options.plugins.annotation === undefined) {
		options.plugins.annotation = {
			//drawTime: "afterDatasetsDraw",
			annotations: [],
		};
	}

	if (dataSet.actualValues && dataSet.actualValues.length > 0) {
		const annotations = options.plugins.annotation.annotations as any[];
		let isMain = true;

		for (const { value, label } of dataSet.actualValues) {
			annotations.push(annotation(value, isMain ? "black" : "gray", label));
			isMain = false;
		}
	}
}

const groupedBarsOptions = {
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

const stackBarsOptions = {
	scales: {
		x: {
			stacked: true,
		},
		y: {
			stacked: true,
		},
	},
};
