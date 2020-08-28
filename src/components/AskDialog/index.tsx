import React, { useEffect, useRef, useCallback, useState } from 'react';
import Button from '@pinpt/uic.next/Button';
import Dialog from '@pinpt/uic.next/Dialog';
import styles from './styles.less';

interface AskDialogProps {
	title: string,
	text: string | React.ReactElement,
	buttonSaveText: string,
	open: boolean,
	onChange: (val: string) => void,
	onCancel: () => void,
	onSubmit: () => void,
	textArea: boolean,
	value: string
}

export const AskDialog = ({title, text, buttonSaveText, open, onChange, onCancel, onSubmit, textArea, value}: AskDialogProps) => {
	const ref = useRef<any>();
	const [submit, setSubmit] = useState(false);
	useEffect(() => {
		if (open && ref?.current) {
			ref.current.focus();
			ref.current.select();
		}
	}, [ref, open]);

	let field: React.ReactElement;

	if (textArea) {
		const onChangeHandler = useCallback((evt: any) => onChange(evt.target.value), []);

		field = (
			<textarea
				ref={ref}
				rows={5}
				value={value}
				onChange={onChangeHandler}
			/>
		);
	} else {
		const onChangeHandler = useCallback((e: any) => {
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
				onKeyUp={onChangeHandler}
				onChange={onChangeHandler}
			/>
		);
	}

	return (
		<Dialog
			open={open}
			className={styles.Wrapper}
			onClickOutside={onCancel}
		>
			<h1>
				{title}
			</h1>

			<p>
				{text}
			</p>

			{field}

			<div className="Buttons">
				<Button color="Mono" weight={500} onClick={onCancel}>
					Cancel
				</Button>

				<Button color="Green" weight={500} onClick={onSubmit}>
					{buttonSaveText}
				</Button>
			</div>
		</Dialog>	
	);
};
