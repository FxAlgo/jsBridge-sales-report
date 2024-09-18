import { createContext, ReactNode, useContext } from "react";
import { ServiceBridge } from "./serviceBridge";

const DataContext = createContext<ServiceBridge>(new ServiceBridge());

type Props = {
	children?: ReactNode;
};

export const DataProvider = ({ children }: Props) => {
	//const [service] = useState<ServiceBridge>(new ServiceBridge());

	return <DataContext.Provider value={DataContext}>{children}</DataContext.Provider>;
};

export function useDataService() {
	return useContext(DataContext);
}
