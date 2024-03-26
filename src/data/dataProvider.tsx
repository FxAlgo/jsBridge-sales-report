import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ServiceBridge } from "./serviceBridge";

const DataContext = createContext<ServiceBridge>(null);

type Props = {
	children?: ReactNode;
};

export const DataProvider = ({ children }: Props) => {
	const [service, setService] = useState<ServiceBridge>();

	useEffect(() => {
		(async () => {
			// const backendType = await MobileCRM.bridge.invokeCommandPromise("getBackendType", null);
			setService(new ServiceBridge());
		})();
	}, []);

	return <DataContext.Provider value={service}>{children}</DataContext.Provider>;
};

export const useDataService = () => useContext(DataContext);
