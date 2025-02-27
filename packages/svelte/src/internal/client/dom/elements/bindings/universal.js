import { render_effect } from '../../../reactivity/effects.js';
import { listen } from './shared.js';

/**
 * @param {'innerHTML' | 'textContent' | 'innerText'} property
 * @param {HTMLElement} element
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_content_editable(property, element, get_value, update) {
	element.addEventListener('input', () => {
		// @ts-ignore
		update(element[property]);
	});

	render_effect(() => {
		var value = get_value();

		if (element[property] !== value) {
			if (value === null) {
				// @ts-ignore
				var non_null_value = element[property];
				update(non_null_value);
			} else {
				// @ts-ignore
				element[property] = value + '';
			}
		}
	});
}

/**
 * @param {string} property
 * @param {string} event_name
 * @param {Element} element
 * @param {(value: unknown) => void} set
 * @param {() => unknown} [get]
 * @returns {void}
 */
export function bind_property(property, event_name, element, set, get) {
	var handler = () => {
		// @ts-ignore
		set(element[property]);
	};

	element.addEventListener(event_name, handler);

	if (get) {
		render_effect(() => {
			// @ts-ignore
			element[property] = get();
		});
	} else {
		handler();
	}

	// @ts-ignore
	if (element === document.body || element === window || element === document) {
		render_effect(() => {
			return () => {
				element.removeEventListener(event_name, handler);
			};
		});
	}
}

/**
 * @param {HTMLElement} element
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_focused(element, update) {
	listen(element, ['focus', 'blur'], () => {
		update(element === document.activeElement);
	});
}
