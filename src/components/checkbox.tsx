import React from 'react';

export interface CheckboxProps {
	className?: string;
	checked: boolean;
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
}

export const Checkbox = ({
	className,
	onChange,
	checked,
	disabled,
}: CheckboxProps) => {
	const onchange = () => {
		if (onChange) {
			onChange(!checked);
		}
	};
	return (
		<input
			className={className}
			type="checkbox"
			checked={checked}
			onChange={onchange}
			disabled={disabled ?? false}
		/>
	);
};