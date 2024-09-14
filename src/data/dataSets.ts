import "@resconet/jsbridge";
import { addEstimates } from "../calculations/estimates";
import { ChartDataset, ChartDatasets, ChartOptions } from "../charts/useChart";
import { convertFetchRecordSets, DataRecord, DataRecordSet, DataRecordSets, toValues } from "./convertFetchRecords";
import { demoData } from "./demoData";
import { aggregatedFetch, DataTable, DateGroupingType, FetchRecordSets, summaryFetch } from "./fetch";
import { ChartData, DataType } from "./types";

export async function fetchDataTable(datasets: DataTable[], type: DateGroupingType): Promise<ChartData | undefined> {
	if (type != "month" && type != "quarter" && type != "year") {
		throw new Error("Invalid date grouping type");
	}

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

function toYearChartDatasets(dataRecordSet: DataRecordSets): ChartData | undefined {
	for (const dataTable in dataRecordSet) {
		return toYearStackDatasets(dataRecordSet[dataTable], dataTable as DataTable);
	}
	return undefined;
}

function toYearStackDatasets(dataSet: DataRecordSet, dataTable: DataTable): ChartData {
	const datasets = toDatasets(dataSet, dataTable);
	const options: ChartOptions = { ...stackBarsOptions, ...addAnnotations(dataSet.currentValues) };
	addTrendTooltip(options);
	return { datasets, options };
}

function toMonthChartDatasets(dataRecordSets: DataRecordSets, type: DateGroupingType): ChartData | undefined {
	for (const dataTable in dataRecordSets) {
		return toMonthStackDatasets(dataRecordSets[dataTable], dataTable as DataTable, type);
	}
	return undefined;
}

function toMonthStackDatasets(dataSet: DataRecordSet, dataTable: DataTable, type: DateGroupingType): ChartData {
	const datasets = toDatasets(dataSet, dataTable);
	const options: ChartOptions = { ...stackBarsOptions, ...addAnnotations(dataSet.currentValues) };
	addTrendTooltip(options);
	return { datasets, options };
}

function toDatasets({ data, stackDataType }: DataRecordSet, dataTable: DataTable): ChartDatasets {
	const labels = data.map(v => v.name);
	const datasets: ChartDataset[] = [];

	if (stackDataType) {
		datasets.push({
			type: "bar",
			stack: dataTable,
			label: `New ${dataTable}s`,
			data: toValues(data, DataType.New),
			borderWidth: 1,
		});
		datasets.push({
			type: "bar",
			stack: dataTable,
			label: "Upsells",
			data: toValues(data, DataType.Upsell),
			borderWidth: 1,
		});
		datasets.push({
			type: "bar",
			stack: dataTable,
			label: "Renewals",
			data: toValues(data, DataType.Renewal),
			borderWidth: 1,
		});
	} else {
		datasets.push({
			type: "bar",
			stack: dataTable,
			label: `Total ${dataTable}s`,
			data: toValues(data),
			borderWidth: 1,
		});
	}

	return { datasets, labels };
}

function addTrendTooltip(options: ChartOptions): void {
	const footer = (tooltipItems: any) => {
		if (tooltipItems.length > 0) {
			const item = tooltipItems[0];
			const idx = item.dataIndex;
			let trend = 0;

			if (idx > 0) {
				const data = item.dataset.data;
				const allData = item.chart.data?.datasets;
				const thisValue = data[idx];
				const lastValue = data[idx - 1];

				const trend = lastValue ? Math.round(((thisValue - lastValue) * 100) / lastValue) : 0;
				let result = `Trend: ${trend}%`;

				if (allData && allData.length === 3) {
					let thisTotal = 0;
					let lastTotal = 0;
					for (const { data } of allData) {
						thisTotal += data[idx];
						lastTotal += data[idx - 1];
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

function addAnnotations(lastValue: DataRecord | undefined): object {
	const annotations = [];

	if (lastValue) {
		annotations.push(annotation(lastValue.total, "black", "Current income"));
		if (lastValue.values !== undefined) {
			const value = lastValue.values[DataType.New] + lastValue.values[DataType.Upsell];
			annotations.push(annotation(value, "gray", "Current new & upsales"));
		}
	}

	return {
		plugins: {
			annotation: {
				drawTime: "afterDatasetsDraw",
				annotations,
			},
		},
	};
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
