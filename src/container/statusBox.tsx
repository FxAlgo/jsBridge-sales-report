import { useEffect, useState } from "react";
import { useDataService } from "../data/dataProvider";

type TextProps = {
	text?: string;
	error?: string;
};

export const StatusBox = (props: TextProps) => {
	if (props.error) {
		return <p className="error">{props.error}</p>;
	} else {
		return <p className="status">{props.text}</p>;
	}
};

export const Summary = () => {
	const [summary, setSummary] = useState<string>("");
	const service = useDataService();

	useEffect(() => {
		(async () => {
			const s = await service.invoicesSummary();
			setSummary(s);
		})();
	}, []);

	return <StatusBox text={summary} />;
};
