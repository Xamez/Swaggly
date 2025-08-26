<script lang="ts">
	import { addRoute, models, updateRoute } from '$lib/dataStore';
	import { addNotification } from '$lib/notificationStore';
	import {
		initialParameterSchema,
		initialRequestBodySchema,
		initialResponseSchema,
		initialRouteSchema,
		type ParameterSchemaForForm,
		type RequestBodySchemaForForm,
		type ResponseSchemaForForm
	} from '$lib/schemaDefinitions';
	import {
		transformParameterForForm,
		transformParameterForPayload,
		transformRequestBodyForForm,
		transformRequestBodyForPayload,
		transformResponseForForm,
		transformResponseForPayload
	} from '$lib/schemaUtils';
	import { availableMethods, type Method, type Route } from '$lib/types';
	import { AlertTriangle } from '@lucide/svelte';
	import ParameterForm from './ParameterForm.svelte';
	import RequestBodyForm from './RequestBodyForm.svelte';
	import ResponseForm from './ResponseForm.svelte';

	let {
		routeToEdit = undefined,
		onSave,
		onDelete
	}: { routeToEdit?: Route; onSave: (route: Route) => void; onDelete?: () => void } = $props();

	let routePath = $state(routeToEdit?.path || '/');
	let routeMethod: Method = $state(routeToEdit?.method || 'get');
	let routeSummary = $state(routeToEdit?.summary || '');
	let routeDescription = $state(routeToEdit?.description || '');
	let routeTagsCsv = $state(routeToEdit?.tags?.join(', ') || '');

	let parameters = $state<ParameterSchemaForForm[]>([]);
	let requestBody = $state<RequestBodySchemaForForm>({ ...initialRequestBodySchema });
	let responses = $state<ResponseSchemaForForm[]>([]);
	let existingModelNames = $derived($models.map((m) => m.name));

	const methodsWithBody: Method[] = ['post', 'put', 'patch'];
	let showRequestBody = $derived(methodsWithBody.includes(routeMethod));

	function addParameter() {
		parameters.push({ ...initialParameterSchema });
		if (!showRequestBody) {
			requestBody = { ...initialRequestBodySchema };
		}
	}

	function removeParameter(index: number) {
		parameters.splice(index, 1);
	}

	function addResponse() {
		responses.push({ ...initialResponseSchema });
	}

	function removeResponse(index: number) {
		responses.splice(index, 1);
	}

	$effect(() => {
		if (routeToEdit) {
			routePath = routeToEdit.path;
			routeMethod = routeToEdit.method;
			routeSummary = routeToEdit.summary || '';
			routeDescription = routeToEdit.description || '';
			routeTagsCsv = routeToEdit.tags?.join(', ') || '';
			parameters = routeToEdit.parameters?.map(transformParameterForForm) || [];
			requestBody = routeToEdit.requestBody
				? transformRequestBodyForForm(routeToEdit.requestBody)
				: { ...initialRequestBodySchema };
			responses = routeToEdit.responses.map(transformResponseForForm);
		} else {
			const defaultRoute = initialRouteSchema;
			routePath = defaultRoute.path;
			routeMethod = defaultRoute.method;
			routeSummary = defaultRoute.summary || '';
			routeDescription = defaultRoute.description || '';
			routeTagsCsv = defaultRoute.tags_csv || '';
			parameters = [];
			requestBody = { ...initialRequestBodySchema };
			responses = [{ ...initialResponseSchema }];
		}
	});

	let validationErrors = $derived.by(() => {
		const errors: string[] = [];
		const trimmedPath = routePath.trim();
		
		if (!trimmedPath) {
			errors.push('Route path cannot be empty.');
		} else if (!trimmedPath.startsWith('/')) {
			errors.push('Route path must start with a forward slash (/).');
		}

		const pathParamRegex = /\{([^}]+)\}/g;
		const pathParamMatches = [...trimmedPath.matchAll(pathParamRegex)];
		const pathParamNames = pathParamMatches.map(match => match[1]);

		for (let i = 0; i < parameters.length; i++) {
			const parameter = parameters[i];
			const trimmedParamName = parameter.name.trim();
			
			if (!trimmedParamName) {
				errors.push(`Parameter at position ${i + 1} cannot have an empty name.`);
				continue;
			}

			const duplicateIndex = parameters.findIndex((p, idx) => idx !== i && p.name.trim() === trimmedParamName);
			if (duplicateIndex !== -1) {
				errors.push(`Duplicate parameter name "${trimmedParamName}" found.`);
			}

			if (parameter.in === 'path') {
				if (!pathParamNames.includes(trimmedParamName)) {
					errors.push(`Path parameter "${trimmedParamName}" must have a corresponding {${trimmedParamName}} placeholder in the path.`);
				}
				
				if (!parameter.required) {
					errors.push(`Path parameter "${trimmedParamName}" must be marked as required.`);
				}
			}
		}

		const parameterNames = parameters.filter(p => p.in === 'path').map(p => p.name.trim());
		for (const pathParamName of pathParamNames) {
			if (!parameterNames.includes(pathParamName)) {
				errors.push(`Path contains parameter "{${pathParamName}}" but no corresponding path parameter is defined.`);
			}
		}

		return errors;
	});

	let hasValidationErrors = $derived(validationErrors.length > 0);

	function handleSubmit() {
		if (hasValidationErrors) {
			return;
		}

		const trimmedPath = routePath.trim();
		const routeName = `${routeMethod.toUpperCase()} ${trimmedPath}`;

		const routeDataPayload = {
			name: routeName,
			path: trimmedPath,
			method: routeMethod,
			summary: routeSummary,
			description: routeDescription,
			tags: routeTagsCsv.split(',').map((t) => t.trim()),
			parameters: parameters.map(transformParameterForPayload),
			requestBody: showRequestBody ? transformRequestBodyForPayload(requestBody) : undefined,
			responses: responses.map(transformResponseForPayload)
		};

		if (routeToEdit) {
			const updatedRouteData: Route = { ...routeToEdit, ...routeDataPayload };
			updateRoute(updatedRouteData);
			onSave(updatedRouteData);
		} else {
			const result = addRoute(routeDataPayload as Route);
			if (result.success && result.route) {
				onSave(result.route);
			} else {
				addNotification(result.message || 'Failed to create route', 'error');
			}
		}
	}
</script>

<div class="bg-background text-text rounded-lg p-4">
	<h2 class="mb-4 text-center text-xl font-semibold">
		{routeToEdit ? `Edit Route: ${routeToEdit.method.toUpperCase()} ${routeToEdit.path}` : 'Create New Route'}
	</h2>
	<form onsubmit={handleSubmit}>
		<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label for="routePath" class="text-text-label mb-0.5 block text-sm font-medium">Path</label>
				<input
					type="text"
					id="routePath"
					bind:value={routePath}
					required
					class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				/>
			</div>
			<div>
				<label for="routeMethod" class="text-text-label mb-0.5 block text-sm font-medium">Method</label>
				<select
					id="routeMethod"
					bind:value={routeMethod}
					class="border-border focus:ring-accent focus:border-accent bg-background text-text mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
				>
					{#each availableMethods as method (method)}
						<option value={method}>{method.toUpperCase()}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="mb-4">
			<label for="routeSummary" class="text-text-label mb-0.5 block text-sm font-medium">Summary</label>
			<input
				type="text"
				id="routeSummary"
				bind:value={routeSummary}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>

		<div class="mb-4">
			<label for="routeDescription" class="text-text-label mb-0.5 block text-sm font-medium">Description</label>
			<textarea
				id="routeDescription"
				bind:value={routeDescription}
				rows="3"
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block min-h-[40px] w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			></textarea>
		</div>

		<div class="mb-4">
			<label for="routeTags" class="text-text-label mb-0.5 block text-sm font-medium">Tags (comma-separated)</label>
			<input
				type="text"
				id="routeTags"
				bind:value={routeTagsCsv}
				class="border-border focus:ring-accent focus:border-accent bg-background text-text placeholder-text-placeholder mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
			/>
		</div>

		<div class="mt-6">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-text-heading text-base font-medium">Parameters</h3>
				<button
					type="button"
					onclick={addParameter}
					class="px-3 py-1 text-xs bg-accent text-white rounded-md hover:bg-accent-dark transition-colors duration-150"
					>+ Add Parameter</button
				>
			</div>
			<div class="space-y-1">
				{#each parameters as parameter, index (index)}
					<ParameterForm {parameter} {index} onRemove={removeParameter} routePath={routePath} />
				{/each}
			</div>
		</div>

		{#if showRequestBody}
			<div class="mt-6">
				<h3 class="text-text-heading mb-3 text-base font-medium">Request Body</h3>
				<RequestBodyForm bind:requestBody {existingModelNames} />
			</div>
		{/if}

		<div class="mt-6">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-text-heading text-base font-medium">Responses</h3>
				<button
					type="button"
					onclick={addResponse}
					class="px-3 py-1 text-xs bg-accent text-white rounded-md hover:bg-accent-dark transition-colors duration-150"
					>+ Add Response</button
				>
			</div>
			<div class="space-y-1">
				{#each responses as response, index (index)}
					<ResponseForm {response} {index} onRemove={removeResponse} {existingModelNames} />
				{/each}
			</div>
		</div>

		{#if hasValidationErrors}
			<div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
				<div class="flex items-start gap-3">
					<AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
					<div>
						<h4 class="text-sm font-medium text-red-800 mb-2">Please fix the following issues:</h4>
						<ul class="text-sm text-red-700 space-y-1">
							{#each validationErrors as error}
								<li>• {error}</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		{/if}

		<div class="mt-6 flex justify-end gap-x-4">
			{#if routeToEdit}
				<button
					type="button"
					onclick={onDelete}
					class="bg-danger hover:bg-danger-dark cursor-pointer rounded-md px-6 py-2 text-white transition-colors duration-150 focus:outline-none"
				>
					Delete Route
				</button>
			{/if}
			<button
				type="submit"
				disabled={hasValidationErrors}
				class="bg-accent hover:bg-accent-dark focus:ring-accent-dark cursor-pointer rounded-md px-6 py-2 text-white transition-colors duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
			>
				{routeToEdit ? 'Save Changes' : 'Create Route'}
			</button>
		</div>
	</form>
</div>
