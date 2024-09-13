import "@resconet/jsbridge";
import { addNextYearsEstimates, estimateThisMonth, estimateThisQuarter, estimateThisYear } from "../calculations/estimates";
import { convertFetchRecords, DataRecord, toValues } from "./convertFetchRecords";
import { demoData } from "./demoData";
import { aggregatedFetch, DataTable, DateGroupingType, summaryFetch } from "./fetch";
import { ChartData, ChartDatasets, DataType } from "./types";

export async function fetchDataTable(dataset: DataTable, type: DateGroupingType): Promise<ChartData> {
	if (type != "month" && type != "quarter" && type != "year") {
		throw new Error("Invalid date grouping type");
	}

	let data: any[];
	if (process.env.NODE_ENV === "development") {
		data = demoData(dataset, type);
	} else {
		data = await aggregatedFetch(dataset, type);
	}

	const hasExtraValues = data && data.length > 0 && data[0].length > 3;
	const records = convertFetchRecords(data, type);
	if (type == "year") {
		return toYearStackDatasets(records, dataset, hasExtraValues);
	} else {
		return toMonthStackDatasets(records, dataset, type, hasExtraValues);
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

function toYearStackDatasets(data: DataRecord[], dataTable: DataTable, hasExtraValues: boolean): ChartData {
	const currentValues = data.length > 0 ? { ...data[data.length - 1] } : undefined;
	if (estimateThisYear(data)) {
		addNextYearsEstimates(data);
	}

	const datasets = toDatasets(data, dataTable, hasExtraValues);
	const options: any = { ...stackBarsOptions, ...addAnnotations(currentValues) };
	addTrendTooltip(options);
	return { datasets, options };
}

function toMonthStackDatasets(data: DataRecord[], dataTable: DataTable, type: DateGroupingType, hasExtraValues: boolean): ChartData {
	const currentValues = data.length > 0 ? { ...data[data.length - 1] } : undefined;

	if (type == "month") {
		estimateThisMonth(data);
	} else if (type == "quarter") {
		estimateThisQuarter(data);
	}

	const datasets = toDatasets(data, dataTable, hasExtraValues);
	const options: any = { ...stackBarsOptions, ...addAnnotations(currentValues) };
	addTrendTooltip(options);
	return { datasets, options };
}

function toDatasets(values: DataRecord[], dataTable: DataTable, hasExtraValues: boolean): ChartDatasets {
	const labels = values.map(v => v.name);
	const datasets = [];

	if (hasExtraValues) {
		datasets.push({
			label: `New ${dataTable}s`,
			data: toValues(values, DataType.New),
			borderWidth: 1,
		});
		datasets.push({
			label: "Upsells",
			data: toValues(values, DataType.Upsell),
			borderWidth: 1,
		});
		datasets.push({
			label: "Renewals",
			data: toValues(values, DataType.Renewal),
			borderWidth: 1,
		});
	} else {
		datasets.push({
			label: `Total ${dataTable}s`,
			data: toValues(values, DataType.Total),
			borderWidth: 1,
		});
	}

	return { datasets, labels };
}

function addTrendTooltip(options: any): void {
	const footer = tooltipItems => {
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

function addAnnotations(lastValue: DataRecord): object {
	const annotations = [];

	if (lastValue) {
		annotations.push(annotation(lastValue.values[DataType.Total], "black", "Current income"));
		const value = lastValue.values[DataType.New] + lastValue.values[DataType.Upsell];
		if (value > 0) {
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
