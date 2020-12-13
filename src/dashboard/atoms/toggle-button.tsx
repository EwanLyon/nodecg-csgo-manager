import React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { withStyles, emphasize } from '@material-ui/core/styles';
import { ButtonBaseProps } from '@material-ui/core';

const ToggleButtonStyled = withStyles({
	root: {
		border: 'none',
		color: '#fff',
		backgroundColor: '#43A047',
		'&:hover': {
			backgroundColor: emphasize('#43A047')
		},
		'&$selected': {
			backgroundColor: '#E53935',
			'&:hover': {
				backgroundColor: emphasize('#E53935')
			}
		}
	},
	selected: {
		backgroundColor: '#E53935',
		'&:hover': {
			backgroundColor: emphasize('#E53935')
		}
	}
})(ToggleButton);

interface Props extends Omit<ButtonBaseProps, 'ref'> {
	initialText: string;
	toggleText: string;
	style?: React.CSSProperties;
	value: string;
	parRef?: React.Ref<StyledToggleButton>;
}

interface State {
	selected: boolean;
	text: string;
}

export class StyledToggleButton extends React.Component<Props, State> {
	constructor(props: Readonly<Props>) {
		super(props);
		this.state = {
			selected: false,
			text: this.props.initialText
		};

		this.toggleButton = this.toggleButton.bind(this);
	}

	toggleButton(setSelected?: boolean): void {
		if (typeof setSelected === 'boolean') {
			this.setState({
				selected: setSelected,
				text: setSelected ? this.props.toggleText : this.props.initialText
			});
		} else {
			this.setState({
				selected: !this.state.selected,
				text:
					this.state.text === this.props.initialText
						? this.props.toggleText
						: this.props.initialText
			});
		}
	}

	render(): JSX.Element {
		return (
			<ToggleButtonStyled
				ref={this.props.parRef as React.Ref<HTMLButtonElement>}
				value={this.props.value}
				style={this.props.style}
				selected={this.state.selected}
				onChange={(): void => {
					this.setState({
						selected: !this.state.selected,
						text:
							this.state.text === this.props.initialText
								? this.props.toggleText
								: this.props.initialText
					});
				}}
				onClick={this.props.onClick}
			>
				{this.state.text}
			</ToggleButtonStyled>
		);
	}
}
