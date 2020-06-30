import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Button, Dialog } from '@pinpt/uic.next';

export const AskDialog = ({title, text, buttonOK, show, onChange, onCancel, onSubmit, textarea, value}: {title: string, text: string, buttonOK: string, show: boolean, onChange: (val: string) => void, onCancel: () => void, onSubmit: () => void, textarea: boolean, value: string}) => {
	const ref = useRef<any>();
	const [submit, setSubmit] = useState(false);
	useEffect(() => {
		if (show && ref?.current) {
			ref.current.focus();
			ref.current.select();
		}
	}, [ref, show]);
	let field: React.ReactElement;
	if (textarea) {
		const onChangeHandler = useCallback((evt: any) => onChange(evt.target.value), []);
		field = (
			<textarea
				ref={ref}
				rows={5}
				style={{
					width: '450px',
					fontSize: '1.5rem',
					padding: '2px',
					outline: 'none',
				}}
				value={value}
				onChange={onChangeHandler} />
		);
	} else {
		const onKeyHandler = useCallback((e: any) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				e.stopPropagation();
				setSubmit(true);
			} else {
				onChange(e.target.value);
			}
		}, []);
		useEffect(() => {
			if (submit) {
				onSubmit();
				setSubmit(false);
			}
		}, [submit, setSubmit]);
		field = (
			<input
				ref={ref}
				type="text"
				value={value}
				style={{
					width: '450px',
					fontSize: '1.5rem',
					padding: '2px',
					outline: 'none',
				}}
				onKeyUp={onKeyHandler}
				onChange={onKeyHandler}
			/>
		);
	}
	return (
		<Dialog open={show} style={{background: 'transparent'}} centered={false}>
			<h1>{title}</h1>
			<p>
				{text}
			</p>
			<p>
				{field}
			</p>
			<div className="buttons">
				<Button color="Mono" weight={500} onClick={onCancel}>Cancel</Button>
				<Button color="Green" weight={500} onClick={onSubmit}>
					<>{buttonOK}</>
				</Button>
			</div>
		</Dialog>	
	);
};
