import { browser } from '$app/environment';
import { addNotification } from '$lib/notificationStore';
import { derived, get, writable, type Writable } from 'svelte/store';
import type { AppData, Model, Route, SchemaOrReference } from './types';

const initialData: AppData = {
	models: [],
	routes: []
};

const localStorageKey = 'swagglyOpenApiData';

function createPersistentStore<T>(key: string, startValue: T): Writable<T> {
	let initialStoreValue = startValue;

	if (browser) {
		const storedValue = localStorage.getItem(key);
		if (storedValue) {
			try {
				initialStoreValue = JSON.parse(storedValue);
			} catch (_) {
				addNotification('Error reading from local storage.', 'error');
				localStorage.removeItem(key);
			}
		}
	}

	const store = writable<T>(initialStoreValue);

	if (browser) {
		store.subscribe((current) => {
			localStorage.setItem(key, JSON.stringify(current));
		});
	}

	return store;
}

export const appDataStore = createPersistentStore<AppData>(localStorageKey, initialData);

export const models = derived(appDataStore, ($data) => $data.models);
export const routes = derived(appDataStore, ($data) => $data.routes);

export function addModel(newModelData: Model): { success: boolean; model?: Model; message?: string } {
	const trimmedName = newModelData.name.trim();
	
	if (!trimmedName) {
		return {
			success: false,
			message: 'Model name cannot be empty.'
		};
	}

	const currentData = get(appDataStore);
	const existingModel = currentData.models.find((m) => m.name === trimmedName);
	
	if (existingModel) {
		return {
			success: false,
			message: `A model with the name "${trimmedName}" already exists.`
		};
	}

	const newModel: Model = { ...newModelData, name: trimmedName };
	appDataStore.update((data) => {
		return {
			...data,
			models: [...data.models, newModel]
		};
	});
	return { success: true, model: newModel };
}

export function updateModel(originalName: string, updatedModel: Model): void {
	appDataStore.update((data) => {
		const modelIndex = data.models.findIndex((m) => m.name === originalName);
		if (modelIndex > -1) {
			const newModels = [...data.models];
			newModels[modelIndex] = updatedModel;
			return { ...data, models: newModels };
		}
		return data;
	});
}

function isModelReferenced(schemaOrRef: SchemaOrReference, modelName: string): boolean {
	if (!schemaOrRef) return false;

	if ('$ref' in schemaOrRef) {
		const refName = schemaOrRef.$ref.split('/').pop();
		return refName === modelName;
	}

	if (schemaOrRef.items) {
		if (isModelReferenced(schemaOrRef.items, modelName)) {
			return true;
		}
	}

	if (schemaOrRef.properties) {
		for (const prop of Object.values(schemaOrRef.properties)) {
			if (isModelReferenced(prop, modelName)) {
				return true;
			}
		}
	}

	return false;
}

export function deleteModel(modelName: string): { success: boolean; message?: string } {
	const routes = get(appDataStore).routes;

	for (const route of routes) {
		if (route.parameters) {
			for (const param of route.parameters) {
				if (param.schema && isModelReferenced(param.schema, modelName)) {
					return {
						success: false,
						message: `Model is in use by parameter "${param.name}" in route "${route.method.toUpperCase()} ${route.path}".`
					};
				}
			}
		}

		if (route.requestBody) {
			for (const mediaType of Object.values(route.requestBody.content)) {
				if (mediaType.schema && isModelReferenced(mediaType.schema, modelName)) {
					return {
						success: false,
						message: `Model is in use by request body in route "${route.method.toUpperCase()} ${route.path}".`
					};
				}
			}
		}

		for (const response of route.responses) {
			if (response.content) {
				for (const mediaType of Object.values(response.content)) {
					if (mediaType.schema && isModelReferenced(mediaType.schema, modelName)) {
						return {
							success: false,
							message: `Model is in use by response "${response.statusCode}" in route "${route.method.toUpperCase()} ${route.path}".`
						};
					}
				}
			}
		}
	}
	appDataStore.update((data) => {
		return {
			...data,
			models: data.models.filter((m) => m.name !== modelName)
		};
	});
	return { success: true };
}

export function addRoute(newRouteData: Route): { success: boolean; route?: Route; message?: string } {
	const trimmedName = newRouteData.name.trim();
	const trimmedPath = newRouteData.path.trim();
	
	if (!trimmedName) {
		return {
			success: false,
			message: 'Route name cannot be empty.'
		};
	}

	if (!trimmedPath) {
		return {
			success: false,
			message: 'Route path cannot be empty.'
		};
	}

	const currentData = get(appDataStore);
	const existingRoute = currentData.routes.find((r) => r.name === trimmedName);
	
	if (existingRoute) {
		return {
			success: false,
			message: `A route with the name "${trimmedName}" already exists.`
		};
	}

	const newRoute: Route = { ...newRouteData, name: trimmedName, path: trimmedPath };
	appDataStore.update((data) => {
		return {
			...data,
			routes: [...data.routes, newRoute]
		};
	});
	return { success: true, route: newRoute };
}

export function updateRoute(updatedRoute: Route): void {
	appDataStore.update((data) => {
		const routeIndex = data.routes.findIndex((r) => r.name === updatedRoute.name);
		if (routeIndex > -1) {
			const newRoutes = [...data.routes];
			newRoutes[routeIndex] = updatedRoute;
			return { ...data, routes: newRoutes };
		}
		return data;
	});
}

export function deleteRoute(routeId: string): void {
	appDataStore.update((data) => {
		return {
			...data,
			routes: data.routes.filter((r) => r.name !== routeId)
		};
	});
}
