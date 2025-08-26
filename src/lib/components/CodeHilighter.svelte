<script lang="ts">
	export let json: string | object | any[] = '';
	export let indent: number = 2;

	$: highlightedContent = (() => {
		try {
			let yamlString: string;
			if (typeof json === 'string') {
				yamlString = json;
			} else {
				yamlString = JSON.stringify(json, null, indent);
			}
			
			return highlightYaml(yamlString);
		} catch (error) {
			return `<span class="error">Content invalid: ${error instanceof Error ? error.message : 'Unknown error'}</span>`;
		}
	})();

	function highlightYaml(yaml: string): string {
		yaml = yaml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		
		return yaml
			.replace(/^(\s*)([a-zA-Z_][\w\s\-_]*?)(\s*:)(?=\s|$)/gm, '$1<span class="key">$2</span>$3')
			.replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="string">$1</span>')
			.replace(/:\s*('(?:[^'\\]|\\.)*')/g, ': <span class="string">$1</span>')
			.replace(/:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, ': <span class="number">$1</span>')
			.replace(/:\s*(true|false)/g, ': <span class="boolean">$1</span>')
			.replace(/:\s*(null|~)/g, ': <span class="null">$1</span>')
			.replace(/^(\s*)(-\s)/gm, '$1<span class="bracket">$2</span>')
			.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
	}
</script>

<div class="code-highlighter">
	<pre><code>{@html highlightedContent}</code></pre>
</div>

<style>
.code-highlighter {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Fira Code', monospace;
  background-color: #1a202c;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
  border: 1px solid #4a5568;
  position: relative;
}

.code-highlighter pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.code-highlighter code {
  font-size: 14px;
  line-height: 1.6;
  color: #e2e8f0;
}

/* Global styles for syntax highlighting classes */
.code-highlighter :global(.key) {
  color: #68d391;
  font-weight: 500;
}

.code-highlighter :global(.string) {
  color: #fbb6ce;
}

.code-highlighter :global(.number) {
  color: #90cdf4;
}

.code-highlighter :global(.boolean) {
  color: #fbb6ce;
  font-weight: bold;
}

.code-highlighter :global(.null) {
  color: #a0aec0;
  font-style: italic;
}

.code-highlighter :global(.bracket) {
  color: #f7fafc;
  font-weight: bold;
}

.code-highlighter :global(.comma) {
  color: #e2e8f0;
}

.code-highlighter :global(.comment) {
  color: #a0aec0;
  font-style: italic;
}

.code-highlighter :global(.error) {
  color: #fc8181;
  font-weight: bold;
  background-color: #fed7d7;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>