export function chartData() {
	return {
		labels: months,
		datasets: [
			{
				...datasetColors,
				label: "# of Votes",
				data: [12, 19, 3, 5, 2, 3],
			},
		],
	};
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const colors = [
	[255, 99, 132],
	[255, 159, 64],
	[255, 205, 86],
	[75, 192, 192],
	[54, 162, 235],
	[153, 102, 255],
	[201, 203, 207],
];

const rgbaColors = (opacity: number) => colors.map(color => `rgba(${color.join(",")}, ${opacity})`);
const rgbColors = colors.map(color => `rgb(${color.join(",")})`);

const datasetColors = {
	backgroundColor: rgbaColors(0.4),
	borderColor: rgbColors,
	borderWidth: 1,
};
