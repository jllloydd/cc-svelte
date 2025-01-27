<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	//initialization of all variable states
	let amount = $state(0);
	let fromCurrency = $state('');
	let toCurrency = $state('');
	let result = $state<number | null>(null);
	let currencies = $state<[string, string][]>([]);

	const apiKey = 'eeb82de43c3805981e02303a';

	//setting up states for container height, to be tracked continually in order to update the height with transitions
	let containerHeight = $state(0);
	let container: HTMLElement;
	let initialHeight = $state(0);

	// tracking height changes for animation purposes
	$effect(() => {
		if (container) {
			// get the initial height of the container
			if (initialHeight === 0) {
				const contentWrapper = container.querySelector('.content-wrapper');
				initialHeight = contentWrapper?.getBoundingClientRect().height || 0;
				containerHeight = initialHeight;
			}

			// update height when result changes
			if (result !== undefined) {
				setTimeout(() => {
					if (result === null) {
						containerHeight = initialHeight;
					} else {
						const contentWrapper = container.querySelector('.content-wrapper');
						const newHeight = contentWrapper?.getBoundingClientRect().height || 0;
						containerHeight = newHeight;
					}
				}, 0);
			}
		}
	});

	//function to get the name of the currency to be appended to the result text later
	function getCurrencyName(code: string): string {
		const currency = currencies.find(([currencyCode]) => currencyCode === code);
		return currency ? currency[1] : code;
	}

	//function to make the API Call
	onMount(async () => {
		try {
			const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/codes`);
			if (!response.ok) {
				throw new Error('Failed to fetch currency codes');
			}
			const data = await response.json();
			currencies = data.supported_codes;
		} catch (error) {
			console.error('Error fetching currency codes:', error);
			currencies = []; // set to empty currencies array on error, so the user can restart
		}
	});

	// reworked async API Call
	async function performConversion() {
		if (amount > 0 && fromCurrency && toCurrency) {
			try {
				const response = await fetch(
					`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}/${amount}`
				);
				if (!response.ok) {
					throw new Error('API request failed');
				}
				const data = await response.json();
				result = data.conversion_result;
			} catch (error) {
				console.error('Error converting currency:', error);
				result = null;
			}
		} else {
			result = null;
		}
	}

	// effect rune for calling the conversion function as the values change in the DOM
	$effect(() => {
		performConversion();
	});

</script>

<div class="h-full w-full max-w-3xl space-y-5 px-4 sm:px-0">
	<header class="py-4 text-center text-white">
		<h1 class="text-2xl font-bold sm:text-3xl">Simple Currency Conversion App</h1>
	</header>

<!-- appending the containerHeight state in order to track it reactively -->
	<div
		bind:this={container}
		class="height-transition mx-auto space-y-3 rounded-lg bg-white"
		style:height="{containerHeight}px"
	>
		<div class="content-wrapper">
			<div class="grid grid-cols-1 gap-4 p-3 sm:grid-cols-3 sm:p-5">
				<div class="space-y-2 rounded-lg bg-white p-3 shadow-md sm:space-y-3 sm:p-4">
					<label for="amount">Enter amount:</label>
					<input
						type="number"
						id="amount"
						bind:value={amount}
						class="block w-full rounded-lg border border-slate-950 bg-slate-50 p-2 text-sm text-gray-900 hover:cursor-pointer sm:p-2.5"
						placeholder=""
						required
					/>
				</div>

				<div class="space-y-2 rounded-lg bg-white p-3 shadow-md sm:space-y-3 sm:p-4">
					<label for="convertFrom" class="text-gray-500">From</label>
					<select
						name="convertFrom"
						id="from"
						bind:value={fromCurrency}
						class="block w-full rounded-lg border border-slate-950 bg-slate-50 p-2 text-sm text-gray-900 hover:cursor-pointer sm:p-2.5"
					>
						{#each currencies as [code, name]}
							<option value={code}>{name} ({code})</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2 rounded-lg bg-white p-3 shadow-md sm:space-y-3 sm:p-4">
					<label for="convertTo" class="text-gray-500">To</label>
					<select
						name="convertTo"
						id="to"
						bind:value={toCurrency}
						class="block w-full rounded-lg border border-slate-950 bg-slate-50 p-2 text-sm text-gray-900 hover:cursor-pointer sm:p-2.5"
					>
						{#each currencies as [code, name]}
							<option value={code}>{name} ({code})</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Updating the result display section to show partial or complete results -->
			{#if amount > 0 && fromCurrency}
				<div
					class="space-y-3 p-4 text-slate-950 sm:space-y-4 sm:p-5"
					in:fly={{ y: 200, duration: 500, opacity: 0 }}
					out:fly={{ y: -200, duration: 500, opacity: 0 }}
				>
					<h3 class="text-xl font-semibold text-slate-500 sm:text-2xl">
						{amount}
						{getCurrencyName(fromCurrency)}
						{toCurrency ? '=' : ''}
					</h3>
					{#if result !== null && toCurrency}
						<h1 class="text-dark text-3xl font-extrabold sm:text-4xl">
							{result}
							{getCurrencyName(toCurrency)}
						</h1>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* custom CSS styling for main container animation */
	.height-transition {
		transition: height 0.3s ease-in-out;
		overflow: hidden;
	}
	.content-wrapper {
		display: flex;
		flex-direction: column;
	}
</style>
