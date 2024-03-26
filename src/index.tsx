import { createRoot } from "react-dom/client";
import { Container } from "./container";
import { DataProvider } from "./data/dataProvider";
import "./styles.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<DataProvider>
		<Container />
	</DataProvider>,
);
