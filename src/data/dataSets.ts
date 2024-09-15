import { baseColors, Color, rgbaColor, rgbColor } from "../charts/colors";
import { ChartDataset, ChartOptions, ChartTooltipItem } from "../charts/useChart";
import { addEstimates } from "./calculations/estimates";
import { addRecordsOperation } from "./calculations/opperations";
import { convertFetchRecordSets, DataRecordSet, DataRecordSets, toEuro, toValues } from "./convertFetchRecords";
import { demoData } from "./demoData";
import { aggregatedFetch, DataTable, DateGroupingType, FetchRecordSets, summaryFetch } from "./fetch";
import { ChartData, DataType } from "./types";

export async function prepareIncomeChart(type: DateGroupingType): Promise<ChartData | undefined> {
	const datasets: DataTable[] = ["order", "invoice"];
	let data: FetchRecordSets;
	if (process.env["NODE_ENV"] === "development") {
		data = demoData(datasets, type);
	} else {
		data = await aggregatedFetch(datasets, type);
	}

	const records = convertFetchRecordSets(data, type);
	addEstimates(records, type, 2);
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
	addEstimates(records, type, 2);
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

const colorMap: Record<string, Color> = {
	order: baseColors[0],
	invoice: baseColors[1],
	cost: baseColors[2],
	profit: baseColors[4],
};

function addToDatasets(datasets: ChartDataset[], { data, name, stackDataType }: DataRecordSet, stack?: string): void {
	const color = colorMap[name];
	if (stackDataType) {
		datasets.push({
			type: "bar",
			stack,
			label: `New ${name}s`,
			data: toValues(data, DataType.New),
			backgroundColor: rgbColor(color),
			borderWidth: 1,
		});
		datasets.push({
			type: "bar",
			stack,
			label: "Upsells",
			data: toValues(data, DataType.Upsell),
			backgroundColor: rgbaColor(color, 0.7),
			borderWidth: 1,
		});
		datasets.push({
			type: "bar",
			stack,
			label: "Renewals",
			data: toValues(data, DataType.Renewal),
			backgroundColor: rgbaColor(color, 0.5),
			borderWidth: 1,
		});
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
		label: {
			display: true,
			backgroundColor: rgbaColor([90, 90, 90], 0.5),
			borderRadius: 5,
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

	if (dataSet.actualValues.length > 0) {
		const annotations = options.plugins.annotation.annotations as any[];

		for (const { value, label } of dataSet.actualValues) {
			annotations.push(annotation(value, "gray", label));
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
