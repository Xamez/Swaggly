import type { PropertySchemaForForm } from '$lib/schemaDefinitions';
import { initialPropertySchema } from '$lib/schemaDefinitions';
import type { ModelProperty, SchemaObject, SchemaOrReference } from '$lib/types';

export function transformSchemaToForm(schema: SchemaOrReference): PropertySchemaForForm {
    const formSchema: PropertySchemaForForm = { ...initialPropertySchema };

    if ('$ref' in schema) {
        // It's a ReferenceObject
        // If the property schema is a direct reference, it's treated as an object reference
        formSchema.type = 'object'; // Set the type to 'object' for the form
        formSchema.object_definition_type = 'reference';
        formSchema.object_ref_path = schema.$ref;
        // Clear/reset other fields from initialPropertySchema that might conflict
        formSchema.format = undefined;
        formSchema.description = undefined; // Keep description if it's on the $ref itself? OpenAPI doesn't place it there.
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
        // Reset array specific fields
        formSchema.items_definition_type = 'simple';
        formSchema.items_simple_type = undefined;
        formSchema.items_ref_path = undefined;
        formSchema.minItems = undefined;
        formSchema.maxItems = undefined;
        formSchema.uniqueItems = false;
        // Reset inline object specific fields
        formSchema.object_properties_json = undefined;
        formSchema.object_required_csv = undefined;
        formSchema.minProperties = undefined;
        formSchema.maxProperties = undefined;
    } else {
        // It's a SchemaObject (inline definition)
        formSchema.type = schema.type || 'string'; // Default to string if type is missing
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
                    // Array items are a reference
                    formSchema.items_definition_type = 'reference';
                    formSchema.items_ref_path = schema.items.$ref;
                    formSchema.items_simple_type = undefined; // Clear simple type
                } else {
                    // Array items are an inline SchemaObject
                    formSchema.items_definition_type = 'simple';
                    formSchema.items_simple_type = schema.items.type;
                    formSchema.items_ref_path = undefined; // Clear ref path
                }
            } else {
                // Default for array items if not specified in loaded data
                formSchema.items_definition_type = 'simple';
                formSchema.items_simple_type = 'string'; // Default item type to string
            }
        } else if (schema.type === 'object') {
            // This is for an inline object definition (not a $ref for the property itself)
            formSchema.object_definition_type = 'inline';
            formSchema.object_properties_json = schema.properties ? JSON.stringify(schema.properties, null, 2) : undefined;
            formSchema.object_required_csv = schema.required?.join(',');
            formSchema.minProperties = schema.minProperties;
            formSchema.maxProperties = schema.maxProperties;
            formSchema.object_ref_path = undefined; // Ensure no $ref path for inline object definition
        }
    }
    return formSchema;
}

export function transformPropertyForPayload(
    p: Partial<ModelProperty> & { schema: PropertySchemaForForm }
): ModelProperty {
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
            } catch (e) {
                console.error('Invalid JSON for example:', p.schema.example_str, e);
            }
        }

        if (p.schema.default_str) {
            try {
                inlineSchema.default = JSON.parse(p.schema.default_str);
            } catch (e) {
                console.error('Invalid JSON for default:', p.schema.default_str, e);
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
            // This implies object_definition_type === 'inline'
            try {
                if (p.schema.object_properties_json) {
                    inlineSchema.properties = JSON.parse(p.schema.object_properties_json);
                }
            } catch (e) {
                console.error('Invalid JSON for object properties:', p.schema.object_properties_json, e);
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
