import { addNotification } from '$lib/notificationStore';
import { dump, load } from 'js-yaml';
import { get } from 'svelte/store';
import { appDataStore } from './dataStore';
import type { AppData, Response as AppResponse, Method, Model, Parameter, RequestBody, Route, SchemaObject } from './types';

interface OpenApiResponse {
	description: string;
	content?: AppResponse['content'];
}

interface OperationObject {
	summary?: string;
	description?: string;
	tags?: string[];
	parameters?: Parameter[];
	requestBody?: RequestBody;
	responses: { [statusCode: string]: OpenApiResponse };
}

interface PathItemObject {
	[method: string]: OperationObject;
}

interface SwaggerDefinition {
	openapi: string;
	info: {
		title: string;
		version: string;
		description: string;
	};
	paths: { [path: string]: PathItemObject };
	components: {
		schemas: { [name: string]: SchemaObject };
	};
}

function buildSwaggerJson(): SwaggerDefinition {
	const appData = get(appDataStore);

	const swaggerDef: SwaggerDefinition = {
		openapi: '3.0.0',
		info: {
			title: 'Swaggly API',
			version: '1.0.0',
			description: 'API documentation generated with Swaggly'
		},
		paths: {},
		components: {
			schemas: {}
		}
	};

	if (appData.models && appData.models.length > 0) {
		appData.models.forEach((model) => {
			const schema: SchemaObject = {
				type: 'object',
				properties: {}
			};
			const required: string[] = [];
			if (model.properties && model.properties.length > 0) {
				model.properties.forEach((prop) => {
					if (!schema.properties) {
						schema.properties = {};
					}
					schema.properties[prop.name] = prop.schema;
					if (prop.required) {
						required.push(prop.name);
					}
				});
			}
			if (required.length > 0) {
				schema.required = required;
			}
			swaggerDef.components.schemas[model.name] = schema;
		});
	}

	if (appData.routes && appData.routes.length > 0) {
		appData.routes.forEach((route) => {
			if (!swaggerDef.paths[route.path]) {
				swaggerDef.paths[route.path] = {};
			}

			const responses: { [key: string]: OpenApiResponse } = {};
			if (route.responses && route.responses.length > 0) {
				route.responses.forEach((res) => {
					responses[res.statusCode] = {
						description: res.description,
						content: res.content
					};
				});
			}

			const routeDef: OperationObject = {
				responses: responses
			};

			if (route.summary) routeDef.summary = route.summary;
			if (route.description) routeDef.description = route.description;
			if (route.tags && route.tags.length > 0) routeDef.tags = route.tags;
			if (route.parameters && route.parameters.length > 0) routeDef.parameters = route.parameters;
			if (route.requestBody) routeDef.requestBody = route.requestBody;

			swaggerDef.paths[route.path][route.method.toLowerCase()] = routeDef;
		});
	}

	return swaggerDef;
}

function convertSwaggerToAppData(swaggerData: SwaggerDefinition): AppData {
	const appData: AppData = {
		models: [],
		routes: []
	};

	if (swaggerData.components && swaggerData.components.schemas) {
		for (const modelName in swaggerData.components.schemas) {
			const schema = swaggerData.components.schemas[modelName];
			const model: Model = {
				name: modelName,
				description: schema.description || '',
				properties: []
			};
			if (schema.properties) {
				for (const propName in schema.properties) {
					const propSchema = schema.properties[propName];
					model.properties.push({
						name: propName,
						schema: propSchema,
						required: schema.required ? schema.required.includes(propName) : false
					});
				}
			}
			appData.models.push(model);
		}
	}

	if (swaggerData.paths) {
		for (const path in swaggerData.paths) {
			for (const method in swaggerData.paths[path]) {
				const routeDef = swaggerData.paths[path][method as Method];
				const route: Route = {
					name: routeDef.summary || `${method.toUpperCase()} ${path}`,
					path: path,
					method: method.toLowerCase() as Method,
					summary: routeDef.summary || '',
					description: routeDef.description || '',
					tags: routeDef.tags || [],
					parameters: routeDef.parameters || [],
					requestBody: routeDef.requestBody,
					responses: []
				};

				if (routeDef.responses) {
					for (const statusCode in routeDef.responses) {
						const responseDef = routeDef.responses[statusCode];
						route.responses.push({
							statusCode: statusCode,
							description: responseDef.description || '',
							content: responseDef.content
						});
					}
				}
				appData.routes.push(route);
			}
		}
	}

	return appData;
}

export function generateAndDownloadSwagger() {
	const swaggerJson = buildSwaggerJson();
	const swaggerYaml = dump(swaggerJson);
	const swaggerBlob = new Blob([swaggerYaml], { type: 'text/yaml' });
	const url = URL.createObjectURL(swaggerBlob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'swagger.yaml';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export function importSwagger() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.json,.yaml,.yml';
	input.onchange = (event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				try {
					let swaggerData: SwaggerDefinition;
					if (file.name.endsWith('.json')) {
						swaggerData = JSON.parse(content);
					} else {
						swaggerData = load(content) as SwaggerDefinition;
					}

					const appData = convertSwaggerToAppData(swaggerData);
					appDataStore.set(appData);
					addNotification('Swagger file imported successfully.', 'success');
				} catch (error) {
					if (error instanceof Error) {
						addNotification(`Error parsing Swagger file: ${error.message}`, 'error');
					} else {
						addNotification('An unknown error occurred while parsing the Swagger file.', 'error');
					}
				}
			};
			reader.readAsText(file);
		}
	};
	input.click();
}

export function resetStore() {
	appDataStore.set({
		models: [],
		routes: []
	});
	addNotification('Local data cleared.', 'info');
}
