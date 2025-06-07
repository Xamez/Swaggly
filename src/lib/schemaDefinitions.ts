import type { Type, Format, Method, ParameterIn, MediaType } from './types';

export const initialPropertySchema = {
	type: 'string' as Type,
	format: undefined as Format | undefined,
	description: undefined as string | undefined,
	example_str: undefined as string | undefined,
	default_str: undefined as string | undefined,
	enum_csv: undefined as string | undefined,
	nullable: false,
	deprecated: false,
	minLength: undefined as number | undefined,
	maxLength: undefined as number | undefined,
	pattern: undefined as string | undefined,
	minimum: undefined as number | undefined,
	maximum: undefined as number | undefined,
	items_definition_type: 'simple' as 'simple' | 'reference',
	items_simple_type: undefined as Type | undefined,
	items_ref_path: undefined as string | undefined,
	minItems: undefined as number | undefined,
	maxItems: undefined as number | undefined,
	uniqueItems: false,
	object_definition_type: 'inline' as 'inline' | 'reference',
	object_ref_path: undefined as string | undefined,
	object_properties_json: undefined as string | undefined,
	object_required_csv: undefined as string | undefined,
	minProperties: undefined as number | undefined,
	maxProperties: undefined as number | undefined
};

export type PropertySchemaForForm = typeof initialPropertySchema;

export const initialRouteSchema = {
	path: '/',
	method: 'get' as Method,
	summary: undefined as string | undefined,
	description: undefined as string | undefined,
	tags_csv: undefined as string | undefined // For tags as a comma-separated string
	// Parameters will be handled separately, perhaps in a more dynamic way in the form
	// requestBody will also be handled separately
	// responses will also be handled separately
};

export type RouteSchemaForForm = typeof initialRouteSchema;

export const initialParameterSchema = {
	name: '' as string,
	in: 'query' as ParameterIn,
	description: undefined as string | undefined,
	required: false,
	deprecated: false,
	allowEmptyValue: false,
	schema_definition_type: 'simple' as 'simple' | 'reference',
	schema_simple_type: 'string' as Type,
	schema_ref_path: undefined as string | undefined,
	example_str: undefined as string | undefined
};
export type ParameterSchemaForForm = typeof initialParameterSchema;

export const initialRequestBodySchema = {
	description: undefined as string | undefined,
	required: false,
	content_media_type: 'application/json' as MediaType,
	content_schema_definition_type: 'simple' as 'simple' | 'reference',
	content_schema_simple_type: 'object' as Type,
	content_schema_ref_path: undefined as string | undefined,
	content_example_str: undefined as string | undefined
};
export type RequestBodySchemaForForm = typeof initialRequestBodySchema;

export const initialResponseSchema = {
	statusCode: '200' as string,
	description: '' as string,
	has_content: true,
	content_media_type: 'application/json' as MediaType,
	content_schema_definition_type: 'simple' as 'simple' | 'reference',
	content_schema_simple_type: 'object' as Type,
	content_schema_ref_path: undefined as string | undefined,
	content_example_str: undefined as string | undefined
};
export type ResponseSchemaForForm = typeof initialResponseSchema;
