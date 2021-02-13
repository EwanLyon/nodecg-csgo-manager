import React, { useEffect, useRef } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { useReplicant } from 'use-nodecg';

import { StyledToggleButton } from '../../atoms/toggle-button';
// React imports
import { theme } from '../../theme';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';

// Interfaces
import { bundleStatus as ExampleBundle } from '../../../extension/example-data';
import { BundleStatus } from '../../../../types/bundle-status';

const HlaeActive = styled.div`
	width: 100%;
	padding: 16px 0;
	text-align: center;
	text-transform: uppercase;
	color: ${(props: ActiveProps) => (props.active ? '#44a047' : '#e53835')};
`;

interface ActiveProps {
	active?: boolean;
}

export const Server: React.FunctionComponent = () => {
	const [bundleStatus] = useReplicant<BundleStatus>('bundleStatus', ExampleBundle);
	const [serverRateRep] = useReplicant<number>('serverRate', 0);
	const [hlaeActiveRep] = useReplicant<boolean>('hlaeActive', false);
	const serverBtn = useRef<StyledToggleButton>(null);

	function toggleServer(): void {
		if (bundleStatus.isServerOn) {
			// Turning off
			nodecg.sendMessage('closeServer');
			console.log('Closing server');
		} else {
			// Turning on
			nodecg.sendMessage('listenServer');
			console.log('Starting server');
		}
	}

	useEffect(() => {
		if (!bundleStatus) {
			return;
		}

		if (serverBtn && serverBtn.current) {
			serverBtn.current.toggleButton(bundleStatus.isServerOn);
		}
	}, [bundleStatus]);

	return (
		<ThemeProvider theme={theme}>
			<StyledToggleButton
				ref={serverBtn}
				value="serverBtn"
				style={{ width: '100%' }}
				initialText="Start"
				toggleText="Stop"
				onClick={toggleServer}
			/>
			<Grid container spacing={1}>
				<Grid item xs>
					<Typography color="textSecondary" display="inline">
						Host
					</Typography>
					<Typography display="inline"> {nodecg.config.host}</Typography>
				</Grid>
				<Grid item xs>
					<Typography color="textSecondary" display="inline">
						Port
					</Typography>
					<Typography display="inline"> {nodecg.bundleConfig.port}</Typography>
				</Grid>
			</Grid>
			<Typography>Msg/s {~~serverRateRep}</Typography>
			<HlaeActive active={hlaeActiveRep}>
				HLAE is currently {hlaeActiveRep ? 'active' : 'inactive'}
			</HlaeActive>
		</ThemeProvider>
	);
};

render(<Server />, document.getElementById('server'));
