<script lang="ts">
	import { addRoute, models, updateRoute } from '$lib/dataStore';
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

	function handleSubmit() {
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
			const newRoute = addRoute(routeDataPayload as Route);
			onSave(newRoute);
		}
	}
</script>

<div class="bg-background text-text rounded-lg p-4">
	<h2 class="mb-4 text-center text-xl font-semibold">
		{routeToEdit ? `Edit Route: ${routeToEdit.method.toUpperCase()} ${routeToEdit.path}` : 'Create New Route'}
	</h2>
	<form onsubmit={handleSubmit}>
		<!-- Basic Route Info -->
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

		<!-- Parameters -->
		<div class="mt-6">
			<h3 class="text-text-heading mb-2 text-lg font-medium">Parameters</h3>
			{#each parameters as parameter, index (index)}
				<ParameterForm {parameter} {index} onRemove={removeParameter} />
			{/each}
			<button
				type="button"
				onclick={addParameter}
				class="text-accent hover:text-accent-dark mb-4 cursor-pointer text-sm font-medium transition-colors duration-150"
				>+ Add Parameter</button
			>
		</div>

		<!-- Request Body -->
		{#if showRequestBody}
			<div class="mt-6">
				<h3 class="text-text-heading mb-2 text-lg font-medium">Request Body</h3>
				<RequestBodyForm bind:requestBody {existingModelNames} />
			</div>
		{/if}

		<!-- Responses -->
		<div class="mt-6">
			<h3 class="text-text-heading mb-2 text-lg font-medium">Responses</h3>
			{#each responses as response, index (index)}
				<ResponseForm {response} {index} onRemove={removeResponse} {existingModelNames} />
			{/each}
			<button
				type="button"
				onclick={addResponse}
				class="text-accent hover:text-accent-dark mb-4 cursor-pointer text-sm font-medium transition-colors duration-150"
				>+ Add Response</button
			>
		</div>

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
				class="bg-accent hover:bg-accent-dark focus:ring-accent-dark cursor-pointer rounded-md px-6 py-2 text-white transition-colors duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none"
			>
				{routeToEdit ? 'Save Changes' : 'Create Route'}
			</button>
		</div>
	</form>
</div>
