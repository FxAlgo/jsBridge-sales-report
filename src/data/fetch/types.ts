export type FetchRecord = (string | number | null)[];
//export type FetchRecordSets = Record<string, FetchRecord[]>;

export type FetchTimeRecord = {
	name: string;
	date: number;
	value: number;
	type?: string;
	secondary?: string;
};

export type FetchTimeRecordSets = Record<string, FetchTimeRecord[]>;
