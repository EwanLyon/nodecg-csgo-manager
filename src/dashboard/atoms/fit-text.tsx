// From jr-layouts by Hoishin https://github.com/JapaneseRestream/jr-layouts
// Slightly modified by Ewan Lyon

import React, { useRef, useEffect } from 'react';

import styled from 'styled-components';

export const Text = styled.div`
	white-space: nowrap;
`;

interface Props {
	text: string;
	style?: React.CSSProperties;
	className?: string;
}

export const FitText: React.FunctionComponent<Props> = React.memo((props: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		const text = textRef.current;

		if (!container || !text) {
			return;
		}

		const MAX_WIDTH = container.clientWidth;
		const currentWidth = text.clientWidth;
		const scaleX = currentWidth > MAX_WIDTH ? MAX_WIDTH / currentWidth : 1;
		const newTransform = `scaleX(${scaleX})`;

		text.style.transform = newTransform;
	});

	return (
		<div
			className={props.className}
			style={{ display: 'flex', justifyContent: 'center', ...props.style }}
			ref={containerRef}>
			<Text ref={textRef}>{props.text}</Text>
		</div>
	);
});

FitText.displayName = 'FitText';
