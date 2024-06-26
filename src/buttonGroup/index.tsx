type ButtonProps = {
	title: string;
	value?: string;
};

type ButtonGroupProps = {
	isSwitchable?: boolean;
	buttons: ButtonProps[];
	onSelect: (button: string) => void;
};

export const ButtonGroup = (props: ButtonGroupProps) => {
	const buttons = props.buttons.map((button, i) => {
		return (
			<button key={`btn-${i}`} onClick={() => props.onSelect(button.value || button.title)}>
				{button.title}
			</button>
		);
	});

	return <div className="btn-group">{buttons}</div>;
};
