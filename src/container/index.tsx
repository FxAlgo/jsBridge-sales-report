import { useEffect, useState } from "react";
import { Chart } from "../charts";
import { useDataService } from "../data/dataProvider";

export const Container = () => {
	const service = useDataService();
	const [data, setData] = useState<any>(null);

	useEffect(() => {
		(async () => {
			const data = !service ? null : await service.salesDataPerMonth();
			setData(data);
		})();
	}, []);

	return <Chart data={data} options={options} />;
};

const options = {
	plugins: {
		title: {
			display: true,
			text: "Sales...",
		},
	},
	responsive: true,
	scales: {
		x: {
			grouped: true,
		},
		y: {
			grouped: true,
		},
	},
};
