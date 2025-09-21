<script lang="ts">
	import type { CheckScanResult } from '../rolls/NaturalLanguageCheckScanner';

	let { check }: { check: CheckScanResult } = $props();

	let pre = $derived(check.line.substring(0, check.lineStartIndex));
	let post = $derived(check.line.substring(check.lineEndIndex));
</script>

{pre}<span class="ulmf-mention-highlight">{check.text}</span>{post}
