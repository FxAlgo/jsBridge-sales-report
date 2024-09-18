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
