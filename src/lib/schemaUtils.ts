import { addNotification } from '$lib/notificationStore';
import { initialPropertySchema } from '$lib/schemaDefinitions';
import type {
	MediaType,
	ModelProperty,
	Parameter,
	RequestBody,
	Response,
	SchemaObject,
	SchemaOrReference,
	Type
} from '$lib/types';
import type {
	ParameterSchemaForForm,
	PropertySchemaForForm,
	RequestBodySchemaForForm,
	ResponseSchemaForForm
} from './schemaDefinitions';

export function transformSchemaToForm(schema: SchemaOrReference): PropertySchemaForForm {
	const formSchema: PropertySchemaForForm = { ...initialPropertySchema };

	if ('$ref' in schema) {
		formSchema.type = 'object';
		formSchema.object_definition_type = 'reference';
		formSchema.object_ref_path = schema.$ref;
		formSchema.format = undefined;
		formSchema.description = undefined;
		formSchema.example_str = undefined;
		formSchema.default_str = undefined;
		formSchema.enum_csv = undefined;
		formSchema.nullable = false;
		formSchema.deprecated = false;
		formSchema.minLength = undefined;
		formSchema.maxLength = undefined;
		formSchema.pattern = undefined;
		formSchema.minimum = undefined;
		formSchema.maximum = undefined;
		formSchema.items_definition_type = 'simple';
		formSchema.items_simple_type = undefined;
		formSchema.items_ref_path = undefined;
		formSchema.minItems = undefined;
		formSchema.maxItems = undefined;
		formSchema.uniqueItems = false;
		formSchema.object_properties_json = undefined;
		formSchema.object_required_csv = undefined;
		formSchema.minProperties = undefined;
		formSchema.maxProperties = undefined;
	} else {
		formSchema.type = schema.type || 'string';
		formSchema.format = schema.format;
		formSchema.description = schema.description;
		formSchema.example_str = schema.example !== undefined ? JSON.stringify(schema.example) : undefined;
		formSchema.default_str = schema.default !== undefined ? JSON.stringify(schema.default) : undefined;
		formSchema.enum_csv = schema.enum?.join(',');
		formSchema.nullable = schema.nullable || false;
		formSchema.deprecated = schema.deprecated || false;

		if (schema.type === 'string') {
			formSchema.minLength = schema.minLength;
			formSchema.maxLength = schema.maxLength;
			formSchema.pattern = schema.pattern;
		} else if (schema.type === 'number' || schema.type === 'integer') {
			formSchema.minimum = schema.minimum;
			formSchema.maximum = schema.maximum;
		} else if (schema.type === 'array') {
			formSchema.minItems = schema.minItems;
			formSchema.maxItems = schema.maxItems;
			formSchema.uniqueItems = schema.uniqueItems || false;
			if (schema.items) {
				if ('$ref' in schema.items) {
					formSchema.items_definition_type = 'reference';
					formSchema.items_ref_path = schema.items.$ref;
					formSchema.items_simple_type = undefined;
				} else {
					formSchema.items_definition_type = 'simple';
					formSchema.items_simple_type = schema.items.type;
					formSchema.items_ref_path = undefined;
				}
			} else {
				formSchema.items_definition_type = 'simple';
				formSchema.items_simple_type = 'string';
			}
		} else if (schema.type === 'object') {
			formSchema.object_definition_type = 'inline';
			formSchema.object_properties_json = schema.properties ? JSON.stringify(schema.properties, null, 2) : undefined;
			formSchema.object_required_csv = schema.required?.join(',');
			formSchema.minProperties = schema.minProperties;
			formSchema.maxProperties = schema.maxProperties;
			formSchema.object_ref_path = undefined;
		}
	}
	return formSchema;
}

export function transformPropertyForPayload(p: Partial<ModelProperty> & { schema: PropertySchemaForForm }): ModelProperty {
	const propertyName = p.name!;
	const propertyRequired = p.required || false;
	let propertySchema: SchemaOrReference;

	if (p.schema.type === 'object' && p.schema.object_definition_type === 'reference' && p.schema.object_ref_path) {
		propertySchema = { $ref: p.schema.object_ref_path };
	} else {
		const inlineSchema: Partial<SchemaObject> = {
			type: p.schema.type
		};

		if (p.schema.format) inlineSchema.format = p.schema.format;
		if (p.schema.description) inlineSchema.description = p.schema.description;

		if (p.schema.example_str) {
			try {
				inlineSchema.example = JSON.parse(p.schema.example_str);
			} catch (_) {
				addNotification('Invalid JSON for example.', 'error');
			}
		}

		if (p.schema.default_str) {
			try {
				inlineSchema.default = JSON.parse(p.schema.default_str);
			} catch (_) {
				addNotification('Invalid JSON for default.', 'error');
			}
		}

		if (p.schema.enum_csv) {
			const enumValues = p.schema.enum_csv
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s);
			if (enumValues.length > 0) {
				const allNumeric = enumValues.every((val) => !isNaN(Number(val)));
				if (allNumeric) {
					inlineSchema.enum = enumValues.map(Number);
				} else {
					inlineSchema.enum = enumValues;
				}
			}
		}

		if (p.schema.nullable) inlineSchema.nullable = true;
		if (p.schema.deprecated) inlineSchema.deprecated = true;

		if (p.schema.type === 'string') {
			if (p.schema.minLength !== null && p.schema.minLength !== undefined) inlineSchema.minLength = p.schema.minLength;
			if (p.schema.maxLength !== null && p.schema.maxLength !== undefined) inlineSchema.maxLength = p.schema.maxLength;
			if (p.schema.pattern) inlineSchema.pattern = p.schema.pattern;
		} else if (p.schema.type === 'number' || p.schema.type === 'integer') {
			if (p.schema.minimum !== null && p.schema.minimum !== undefined) inlineSchema.minimum = p.schema.minimum;
			if (p.schema.maximum !== null && p.schema.maximum !== undefined) inlineSchema.maximum = p.schema.maximum;
		} else if (p.schema.type === 'array') {
			if (p.schema.items_definition_type === 'simple' && p.schema.items_simple_type) {
				inlineSchema.items = { type: p.schema.items_simple_type };
			} else if (p.schema.items_definition_type === 'reference' && p.schema.items_ref_path) {
				inlineSchema.items = { $ref: p.schema.items_ref_path };
			}
			if (p.schema.minItems !== null && p.schema.minItems !== undefined) inlineSchema.minItems = p.schema.minItems;
			if (p.schema.maxItems !== null && p.schema.maxItems !== undefined) inlineSchema.maxItems = p.schema.maxItems;
			if (p.schema.uniqueItems) inlineSchema.uniqueItems = true;
		} else if (p.schema.type === 'object') {
			try {
				if (p.schema.object_properties_json) {
					inlineSchema.properties = JSON.parse(p.schema.object_properties_json);
				}
			} catch (_) {
				addNotification('Invalid JSON for object properties.', 'error');
			}
			if (p.schema.object_required_csv) {
				const requiredProps = p.schema.object_required_csv
					.split(',')
					.map((s) => s.trim())
					.filter((s) => s);
				if (requiredProps.length > 0) inlineSchema.required = requiredProps;
			}
			if (p.schema.minProperties !== null && p.schema.minProperties !== undefined)
				inlineSchema.minProperties = p.schema.minProperties;
			if (p.schema.maxProperties !== null && p.schema.maxProperties !== undefined)
				inlineSchema.maxProperties = p.schema.maxProperties;
		}
		propertySchema = inlineSchema as SchemaObject;
	}

	return {
		name: propertyName,
		required: propertyRequired,
		schema: propertySchema
	};
}

export function transformParameterForPayload(form: ParameterSchemaForForm): Parameter {
	const payload: Parameter = {
		name: form.name,
		in: form.in,
		description: form.description,
		required: form.required,
		deprecated: form.deprecated,
		allowEmptyValue: form.allowEmptyValue,
		schema: form.schema_definition_type === 'simple' ? { type: form.schema_simple_type } : { $ref: form.schema_ref_path || '' }
	};

	if (form.example_str) {
		try {
			payload.example = JSON.parse(form.example_str);
		} catch (_) {
			payload.example = form.example_str;
		}
	}

	return payload;
}

export function transformParameterForForm(parameter: Parameter): ParameterSchemaForForm {
	const form: ParameterSchemaForForm = {
		name: parameter.name,
		in: parameter.in,
		description: parameter.description || '',
		required: parameter.required || false,
		deprecated: parameter.deprecated || false,
		allowEmptyValue: parameter.allowEmptyValue || false,
		schema_definition_type: 'simple',
		schema_simple_type: 'string',
		schema_ref_path: undefined,
		example_str: parameter.example ? JSON.stringify(parameter.example) : undefined
	};

	if (parameter.schema) {
		if ('$ref' in parameter.schema) {
			form.schema_definition_type = 'reference';
			form.schema_ref_path = parameter.schema.$ref;
			form.schema_simple_type = 'string';
		} else {
			form.schema_definition_type = 'simple';
			form.schema_simple_type = parameter.schema.type || 'string';
			form.schema_ref_path = undefined;
		}
	}

	return form;
}

export function transformRequestBodyForPayload(form: RequestBodySchemaForForm): RequestBody | undefined {
	if (!form.content_media_type) return undefined;

	const payload: RequestBody = {
		description: form.description,
		required: form.required,
		content: {
			[form.content_media_type]: {
				schema:
					form.content_schema_definition_type === 'simple'
						? { type: form.content_schema_simple_type }
						: { $ref: form.content_schema_ref_path || '' }
			}
		}
	};

	return payload;
}

export function transformRequestBodyForForm(requestBody: RequestBody): RequestBodySchemaForForm {
	const mediaType = Object.keys(requestBody.content)[0] || 'application/json';
	const mediaTypeObject = requestBody.content[mediaType];
	const mediaTypeSchema = mediaTypeObject?.schema;

	const form: RequestBodySchemaForForm = {
		description: requestBody.description || '',
		required: requestBody.required || false,
		content_media_type: mediaType as MediaType,
		content_schema_definition_type: 'simple',
		content_schema_simple_type: 'object',
		content_schema_ref_path: undefined,
		content_example_str: mediaTypeObject?.example ? JSON.stringify(mediaTypeObject.example, null, 2) : undefined
	};

	if (mediaTypeSchema) {
		if ('$ref' in mediaTypeSchema) {
			form.content_schema_definition_type = 'reference';
			form.content_schema_ref_path = mediaTypeSchema.$ref;
			form.content_schema_simple_type = 'object';
		} else {
			form.content_schema_definition_type = 'simple';
			form.content_schema_simple_type = (mediaTypeSchema.type as Type) || 'object';
			form.content_schema_ref_path = undefined;
		}
	}
	return form;
}

export function transformResponseForPayload(form: ResponseSchemaForForm): Response {
	const payload: Response = {
		statusCode: form.statusCode,
		description: form.description
	};

	if (form.has_content) {
		payload.content = {
			[form.content_media_type]: {
				schema:
					form.content_schema_definition_type === 'simple'
						? { type: form.content_schema_simple_type }
						: { $ref: form.content_schema_ref_path || '' }
			}
		};
	}

	return payload;
}

export function transformResponseForForm(response: Response): ResponseSchemaForForm {
	const hasContent = !!response.content;
	const mediaType = hasContent ? Object.keys(response.content!)[0] : 'application/json';
	const mediaTypeObject = hasContent ? response.content![mediaType] : undefined;
	const mediaTypeSchema = mediaTypeObject?.schema;

	const form: ResponseSchemaForForm = {
		statusCode: response.statusCode,
		description: response.description,
		has_content: hasContent,
		content_media_type: mediaType as MediaType,
		content_schema_definition_type: 'simple',
		content_schema_simple_type: 'object',
		content_schema_ref_path: undefined,
		content_example_str: mediaTypeObject?.example ? JSON.stringify(mediaTypeObject.example, null, 2) : undefined
	};

	if (hasContent && mediaTypeSchema) {
		if ('$ref' in mediaTypeSchema) {
			form.content_schema_definition_type = 'reference';
			form.content_schema_ref_path = mediaTypeSchema.$ref;
			form.content_schema_simple_type = 'object';
		} else {
			form.content_schema_definition_type = 'simple';
			form.content_schema_simple_type = (mediaTypeSchema.type as Type) || 'object';
			form.content_schema_ref_path = undefined;
		}
	}
	return form;
}
