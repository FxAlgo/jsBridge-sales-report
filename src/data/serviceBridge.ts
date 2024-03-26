export class ServiceBridge {
	async salesDataPerMonth(): Promise<Record<string, unknown>> {
		return {
			labels: ServiceBridge.labels,
			datasets: [
				{
					label: "2024",
					data: this.fakeData(12),
					backgroundColor: "rgb(255, 99, 132)",
				},
				{
					label: "2023",
					data: this.fakeData(12),
					backgroundColor: "rgb(75, 192, 192)",
				},
				{
					label: "2022",
					data: this.fakeData(12),
					backgroundColor: "rgb(75, 192, 192)",
				},
			],
		};
	}

	async executeFromXML(fetch: string) {
		return new Promise((resolve, reject) => {
			MobileCRM.FetchXml.Fetch.executeFromXML(fetch, resolve, reject);
		});
	}

	private static labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	private fakeData(count: number, min: number = 0, max: number = 1000000): number[] {
		const arr = [];
		for (let i = 0; i < count; i++) {
			arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
		}
		return arr;
	}
}
