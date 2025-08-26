<script lang="ts">
	import { onMount } from 'svelte';
	import { Copy, Download, FileText } from '@lucide/svelte';
	import CodeHilighter from '$lib/components/CodeHilighter.svelte';
	import { getSwaggerJsonString, getSwaggerYamlString, generateAndDownloadSwagger } from '$lib/swaggerGenerator';
	import { addNotification } from '$lib/notificationStore';
	
	let swaggerJsonContent: string = '';
	let swaggerYamlContent: string = '';
	let activeTab: 'json' | 'yaml' = 'yaml';
	
	onMount(() => {
		updatePreview();
	});
	
	function updatePreview() {
		try {
			swaggerJsonContent = getSwaggerJsonString();
			swaggerYamlContent = getSwaggerYamlString();
		} catch (error) {
			console.error('Error generating swagger:', error);
			swaggerJsonContent = '// Error generating Swagger content';
			swaggerYamlContent = '# Error generating Swagger content';
		}
	}
	
	async function copyToClipboard() {
		try {
			const content = activeTab === 'json' ? swaggerJsonContent : swaggerYamlContent;
			await navigator.clipboard.writeText(content);
			addNotification(`${activeTab.toUpperCase()} content copied to clipboard!`, 'success');
		} catch (error) {
			addNotification('Failed to copy to clipboard', 'error');
		}
	}
	
	function downloadFile() {
		generateAndDownloadSwagger();
	}
	
	$: updatePreview();
</script>

<svelte:head>
	<title>Swagger Preview - Swaggly</title>
</svelte:head>

<div class="mx-auto p-4">
	<div class="bg-background text-text rounded-xl p-6">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h1 class="text-3xl font-bold text-text-heading mb-1">
					Swagger Preview
				</h1>
				<p class="text-text-label text-sm">
					Preview your generated OpenAPI/Swagger specification in YAML or JSON format
				</p>
			</div>
			
			<div class="flex items-center gap-3">
				<button
					on:click={copyToClipboard}
					class="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border cursor-pointer border-border bg-transparent hover:bg-background-darker text-text hover:text-accent transition-colors"
				>
					<Copy class="w-4 h-4" />
					Copy
				</button>
				
				<button
					on:click={downloadFile}
					class="flex items-center gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer bg-accent hover:bg-accent-dark text-white transition-colors"
				>
					<Download class="w-4 h-4" />
					Download
				</button>
			</div>
		</div>
		
		<div class="rounded-lg border border-border overflow-hidden">
			<div class="border-b border-border px-4 py-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<div class="flex items-center space-x-1 bg-background-darker rounded-lg p-1">
                            <button
								class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 {activeTab === 'yaml' 
									? 'bg-accent text-white shadow-sm' 
									: 'text-text hover:text-text-heading hover:bg-background'}"
								on:click={() => activeTab = 'yaml'}
							>
								YAML
							</button>
							<button
								class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 {activeTab === 'json' 
									? 'bg-accent text-white shadow-sm' 
									: 'text-text hover:text-text-heading hover:bg-background'}"
								on:click={() => activeTab = 'json'}
							>
								JSON
							</button>
						</div>
						<h2 class="text-lg font-semibold text-text-heading">
							{activeTab.toUpperCase()} Preview
						</h2>
					</div>
					<span class="text-sm text-text-placeholder">
						{activeTab === 'json' ? swaggerJsonContent.split('\n').length : swaggerYamlContent.split('\n').length} lines
					</span>
				</div>
			</div>
			
			<div class="p-4">
				{#if activeTab === 'json' ? swaggerJsonContent : swaggerYamlContent}
					<CodeHilighter 
						json={activeTab === 'json' ? swaggerJsonContent : swaggerYamlContent}
					/>
				{:else}
					<div class="text-center py-12 text-text-placeholder">
						<FileText class="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p class="text-lg mb-2">No content to preview</p>
						<p class="text-sm">Add some routes and models to generate Swagger content.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>