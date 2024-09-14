export function formatDate(inputDate: Date, format: string = "yyyy-MM-dd"): string {
	if (!inputDate) return "";

	const padZero = (value: number): string => (value < 10 ? `0${value}` : `${value}`);
	const parts = {
		yyyy: inputDate.getFullYear(),
		MM: padZero(inputDate.getMonth() + 1),
		dd: padZero(inputDate.getDate()),
		HH: padZero(inputDate.getHours()),
		hh: padZero(inputDate.getHours() > 12 ? inputDate.getHours() - 12 : inputDate.getHours()),
		mm: padZero(inputDate.getMinutes()),
		ss: padZero(inputDate.getSeconds()),
		tt: inputDate.getHours() < 12 ? "AM" : "PM",
	};

	return format.replace(/yyyy|MM|dd|HH|hh|mm|ss|tt/g, match => (parts as any)[match]);
}
