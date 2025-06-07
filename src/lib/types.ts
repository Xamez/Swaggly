export type MediaType = 'application/json' | 'application/xml' | 'text/plain' | 'text/html';
export type Format = 'int32' | 'int64' | 'float' | 'double' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
export type Type = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
export type ParameterIn = 'query' | 'header' | 'path' | 'cookie';
export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export const availableMediaTypes: MediaType[] = ['application/json', 'application/xml', 'text/plain', 'text/html'];
export const availableFormats: Format[] = [
	'int32',
	'int64',
	'float',
	'double',
	'byte',
	'binary',
	'date',
	'date-time',
	'password'
];
export const availableTypes: Type[] = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
export const availableParameterIns: ParameterIn[] = ['query', 'header', 'path', 'cookie'];
export const availableMethods: Method[] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

export interface ReferenceObject {
	$ref: string; // e.g., '#/components/schemas/User'
}

export interface SchemaObject {
	type?: Type;
	format?: Format;
	title?: string;
	description?: string;
	example?: any;
	default?: any;
	nullable?: boolean;
	deprecated?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: string; // Regex
	minimum?: number;
	maximum?: number;
	enum?: any[];
	items?: SchemaOrReference;
	minItems?: number;
	maxItems?: number;
	uniqueItems?: boolean;
	properties?: { [key: string]: SchemaOrReference };
	required?: string[];
	minProperties?: number;
	maxProperties?: number;
}

export type SchemaOrReference = SchemaObject | ReferenceObject;

export interface ModelProperty {
	name: string;
	required?: boolean;
	schema: SchemaOrReference;
}

export interface Model {
	name: string;
	description?: string;
	properties: ModelProperty[];
}

export interface Parameter {
	name: string;
	in: ParameterIn;
	description?: string;
	required?: boolean;
	deprecated?: boolean;
	allowEmptyValue?: boolean;
	schema?: SchemaOrReference;
	example?: any;
	examples?: {
		[exampleName: string]: {
			summary?: string;
			description?: string;
			value?: any;
			externalValue?: string;
			$ref?: string;
		};
	};
}

export interface RequestBody {
	description?: string;
	required?: boolean;
	content: {
		[mediaType: string]: {
			schema: SchemaOrReference;
			example?: any;
		};
	};
}

export interface Response {
	statusCode: string;
	description: string;
	content?: {
		[mediaType: string]: {
			schema: SchemaOrReference;
			example?: any;
		};
	};
}

export interface Route {
	name: string;
	path: string;
	method: Method;
	summary?: string;
	description?: string;
	tags?: string[];
	parameters?: Parameter[];
	requestBody?: RequestBody;
	responses: Response[];
}

export interface AppData {
	models: Model[];
	routes: Route[];
}
