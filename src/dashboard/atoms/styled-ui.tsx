import styled from 'styled-components';

import { Button, Checkbox, TextField } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';

export const GreenButton = styled(Button)`
	&.MuiButton-contained {
		background: ${green[600]};
		color: white;
	}

	&.MuiButton-contained:hover {
		background: ${green[300]};
	}
`;

export const RedButton = styled(Button)`
	&.MuiButton-contained {
		background: ${red[600]};
		color: white;
	}

	&.MuiButton-contained:hover {
		background: ${red[600]};
	}
`;

export const GreenCheckbox = styled(Checkbox)`
	&.MuiCheckbox-colorSecondary.Mui-checked:hover {
		background-color: ${green[600]}0a;
	}

	&.MuiIconButton-colorSecondary:hover {
		background-color: ${green[600]}0a;
	}

	&.MuiCheckbox-colorSecondary.Mui-checked {
		color: ${green[600]};
	}

	& svg {
		background-color: #ffffff;
	}
`;

export const LightTextfield = styled(TextField)`
	&.Mui-focused {
		color: #a8bde3;
	}

	&.MuiInput-underline:after {
		border-bottom: 2px solid #a8bde3;
	}

	&.MuiInputBase-input {
		color: #ffffff;
	}
`;
