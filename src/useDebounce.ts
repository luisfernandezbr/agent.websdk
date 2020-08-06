import { useEffect, useState } from 'react';

export default (value: any, delay = 200) => {
	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(
		() => {
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay]
	);

	return debouncedValue;
};
