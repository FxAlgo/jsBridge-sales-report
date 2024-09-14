import "@resconet/jsbridge";
import { addEstimates } from "../calculations/estimates";
import { baseColors, Color, rgbaColor, rgbColor } from "../charts/colors";
import { ChartDataset, CharTooltipItem, ChartOptions } from "../charts/useChart";
import { convertFetchRecordSets, DataRecordSet, DataRecordSets, toValues } from "./convertFetchRecords";
import { demoData } from "./demoData";
import { aggregatedFetch, DataTable, DateGroupingType, FetchRecordSets, summaryFetch } from "./fetch";
import { ChartData, DataType } from "./types";

export async function fetchDataTable(datasets: DataTable[], type: DateGroupingType): Promise<ChartData | undefined> {
	if (type != "month" && type != "quarter" && type != "year") {
		throw new Error("Invalid date grouping type");
	}

	datasets = ["order", "invoice"];
	let data: FetchRecordSets;
	if (process.env["NODE_ENV"] === "development") {
		data = demoData(datasets, type);
	} else {
		data = await aggregatedFetch(datasets, type);
	}

	const records = convertFetchRecordSets(data, type);
	addEstimates(records, type, 2);
	if (type == "year") {
		return toYearChartDatasets(records);
	} else {
		return toMonthChartDatasets(records, type);
	}
}

export async function fetchSummary(dataset: DataTable): Promise<string> {
	return await summaryFetch(dataset);
}

/*
function toDatasets(data: any[], type: DateGroupingType): ChartData {
	const years: Record<string, ChartDataset> = {};

	for (const val of data) {
		const year = val[0];
		const month = +val[1];
		const value = +val[2];
		const type = val.length > 3 ? val[3] : null;
		if (years[year] === undefined) {
			//const color = baseColors[3 + j];
			years[year] = {
				label: year.toString(),
				data: new Array(12).fill(0),
				//backgroundColor: rgbaColor(color, i * 0.3),
				//borderColor: rgbColor(color),
				borderWidth: 1,
			};
		}
		years[year].data[month - 1] = value;
	}

	const datasets = Object.values(years);
	return { datasets: { datasets, labels: labels[type] }, options: groupedBarsOptions };
}*/

function toYearChartDatasets(dataRecordSets: DataRecordSets): ChartData | undefined {
	const charDatasets: ChartDataset[] = [];
	const options: ChartOptions = { ...stackBarsOptions };
	let labels: string[] | undefined;
	let idx = 0;

	for (const dataTable in dataRecordSets) {
		const dataSet = dataRecordSets[dataTable];

		if (labels === undefined) {
			labels = dataSet.data.map(v => v.name);
		}
		addToDatasets(charDatasets, dataRecordSets[dataTable], baseColors[idx++]);
		addAnnotations(options, dataSet);
		addTrendTooltip(options);
	}
	return { datasets: { datasets: charDatasets, labels: labels as string[] }, options };
}

function toMonthChartDatasets(dataRecordSets: DataRecordSets, type: DateGroupingType): ChartData | undefined {
	const charDatasets: ChartDataset[] = [];
	const options: ChartOptions = { ...stackBarsOptions };
	let labels: string[] | undefined;
	let idx = 0;

	for (const dataTable in dataRecordSets) {
		const dataSet = dataRecordSets[dataTable];

		if (labels === undefined) {
			labels = dataSet.data.map(v => v.name);
		}
		addToDatasets(charDatasets, dataRecordSets[dataTable], baseColors[idx++]);
		addAnnotations(options, dataSet);
		addTrendTooltip(options);
	}
	return { datasets: { datasets: charDatasets, labels: labels as string[] }, options };
}

function addToDatasets(datasets: ChartDataset[], { data, name, stackDataType }: DataRecordSet, color: Color): void {
	if (stackDataType) {
		datasets.push({
			type: "bar",
			stack: name,
			label: `New ${name}s`,
			data: toValues(data, DataType.New),
			backgroundColor: rgbColor(color),
			borderWidth: 1,
		});
		datasets.push({
			type: "bar",
			stack: name,
			label: "Upsells",
			data: toValues(data, DataType.Upsell),
			backgroundColor: rgbaColor(color, 0.7),
			borderWidth: 1,
		});
		datasets.push({
			type: "bar",
			stack: name,
			label: "Renewals",
			data: toValues(data, DataType.Renewal),
			backgroundColor: rgbaColor(color, 0.5),
			borderWidth: 1,
		});
	} else {
		datasets.push({
			type: "bar",
			stack: name,
			label: `Total ${name}s`,
			data: toValues(data),
			backgroundColor: rgbColor(color),
			borderWidth: 1,
		});
	}
}

function addTrendTooltip(options: ChartOptions): void {
	const footer = (tooltipItems: CharTooltipItem[]) => {
		if (tooltipItems.length > 0) {
			const item = tooltipItems[0];
			const idx = item.dataIndex;

			if (idx > 0) {
				const data = item.dataset.data;
				const allData = item.chart.data?.datasets;
				const thisValue = data[idx] as number;
				const lastValue = data[idx - 1] as number;

				const trend = lastValue ? Math.round(((thisValue - lastValue) * 100) / lastValue) : 0;
				let result = `Trend: ${trend}%`;

				if (allData && allData.length === 3) {
					let thisTotal = 0;
					let lastTotal = 0;
					for (const { data } of allData) {
						thisTotal += data[idx] as number;
						lastTotal += data[idx - 1] as number;
					}
					const trend = lastValue ? Math.round(((thisTotal - lastTotal) * 100) / lastTotal) : 0;
					return result + `\nTotal: ${toEuro(thisTotal)} (${trend}%)`;
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

function toEuro(value: number): string {
	value = +value.toFixed(0);
	return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function annotation(value: number, borderColor: string, title: string): object {
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
			backgroundColor: "darkgray",
			borderRadius: 5,
			content: `${title}: ${toEuro(value)}`,
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

	if (dataSet.currentValues) {
		const annotations = options.plugins.annotation.annotations as any[];
		const { values, total } = dataSet.currentValues;

		annotations.push(annotation(total, "gray", `Actual ${dataSet.name}s`));
		if (values !== undefined) {
			const value = values[DataType.New] + values[DataType.Upsell];
			annotations.push(annotation(value, "gray", "Actual new & upsales"));
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
