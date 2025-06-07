import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import type { AppData, Model, Route } from './types'; // Import types from ./types.ts

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
            } catch (e) {
                console.error('Erreur lors de la lecture du localStorage pour la clé :', key, e);
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

export function getModels(): Model[] {
    let models: Model[] = [];
    appDataStore.subscribe((data) => {
        models = data.models;
    })();
    return models;
}

export function getRoutes(): Route[] {
    let routes: Route[] = [];
    appDataStore.subscribe((data) => {
        routes = data.routes;
    })();
    return routes;
}

export function addModel(newModelData: Model): Model {
    const newModel: Model = { ...newModelData };
    appDataStore.update((data) => {
        return {
            ...data,
            models: [...data.models, newModel]
        };
    });
    return newModel;
}

export function updateModel(updatedModel: Model): void {
    appDataStore.update((data) => {
        const modelIndex = data.models.findIndex((m) => m.name === updatedModel.name);
        if (modelIndex > -1) {
            const newModels = [...data.models];
            newModels[modelIndex] = updatedModel;
            return { ...data, models: newModels };
        }
        return data;
    });
}

export function deleteModel(modelId: string): void {
    appDataStore.update((data) => {
        return {
            ...data,
            models: data.models.filter((m) => m.name !== modelId)
        };
    });
}

export function addRoute(newRouteData: Route): Route {
    const newRoute: Route = { ...newRouteData };
    appDataStore.update((data) => {
        return {
            ...data,
            routes: [...data.routes, newRoute]
        };
    });
    return newRoute;
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
