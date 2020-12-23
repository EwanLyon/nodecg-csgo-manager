import React from 'react';
import styled from 'styled-components';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

const Handle = styled.div`
	height: 9px;
	width: 18px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const HandleBar = styled.div`
	height: 2px;
	width: 100%;
	background: #525f78;
	border-radius: 1px;
`;

interface Props {
	handleProps: DraggableProvidedDragHandleProps | undefined;
}

export const GrabHandles: React.FC<Props> = (props: Props) => {
	return (
		<Handle {...props.handleProps}>
			<HandleBar />
			<HandleBar />
		</Handle>
	);
};
