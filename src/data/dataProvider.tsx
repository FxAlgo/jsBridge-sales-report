import { createContext, ReactNode, useContext, useState } from "react";
import { ServiceBridge } from "./serviceBridge";

const DataContext = createContext<ServiceBridge>(null);

type Props = {
	children?: ReactNode;
};

export const DataProvider = ({ children }: Props) => {
	const [service] = useState<ServiceBridge>(new ServiceBridge());

	return <DataContext.Provider value={service}>{children}</DataContext.Provider>;
};

export function useDataService() {
	return useContext(DataContext);
}
