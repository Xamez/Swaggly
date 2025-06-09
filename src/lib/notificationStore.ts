import { writable } from 'svelte/store';
import type { Notification } from './types';

export const notifications = writable<Notification[]>([]);

export const addNotification = (message: string, type: Notification['type'] = 'info') => {
	const id = Date.now();
	notifications.update((all) => {
		const updated = [{ id, message, type }, ...all];
		return updated.length > 5 ? updated.slice(0, 5) : updated;
	});
	setTimeout(() => removeNotification(id), 6000);
};

export const removeNotification = (id: number) => {
	notifications.update((all) => all.filter((n) => n.id !== id));
};
