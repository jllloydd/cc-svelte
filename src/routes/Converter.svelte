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

	// derived state to check if all states have values
	let canConvert = $derived(fromCurrency && toCurrency && amount > 0);


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

	//function to convert the currency using an API call
	async function convertCurrency() {
		if (canConvert) {
			try {
				const response = await fetch(
					`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}/${amount}`
				);
				if (!response.ok) {
					throw new Error('API request failed');
				}
				const data = await response.json();
				result = data.conversion_result;
			} catch (error) { //simple error handling
				console.error('Error converting currency:', error);
				result = null;
			}
		}
	}

	//function to reset the data after successful conversion
	function reset() {
		amount = 0;
		fromCurrency = '';
		toCurrency = '';
		result = null;
	}
</script>

<div class="h-full w-full max-w-3xl space-y-5 px-4 sm:px-0">
	<header class="py-4 text-center text-white">
		<h1 class="text-2xl sm:text-3xl font-bold">Simple Currency Conversion App</h1>
	</header>

	<div 
		bind:this={container}
		class="mx-auto space-y-3 rounded-lg bg-white height-transition"
		style:height="{containerHeight}px"
	>
		<div class="content-wrapper">
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 sm:p-5">
				<div class="space-y-2 sm:space-y-3 rounded-lg bg-white p-3 sm:p-4 shadow-md">
					<label for="amount">Enter amount:</label>
					<input
						type="number"
						id="amount"
						bind:value={amount}
						class="block w-full rounded-lg border border-slate-950 bg-slate-50 p-2 sm:p-2.5 text-sm text-gray-900 hover:cursor-pointer"
						placeholder=""
						required
					/>
				</div>

				<div class="space-y-2 sm:space-y-3 rounded-lg bg-white p-3 sm:p-4 shadow-md">
					<label for="convertFrom" class="text-gray-500">From</label>
					<select
						name="convertFrom"
						id="from"
						bind:value={fromCurrency}
						class="block w-full rounded-lg border border-slate-950 bg-slate-50 p-2 sm:p-2.5 text-sm text-gray-900 hover:cursor-pointer"
					>
						{#each currencies as [code, name]}
							<option value={code}>{name} ({code})</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2 sm:space-y-3 rounded-lg bg-white p-3 sm:p-4 shadow-md">
					<label for="convertTo" class="text-gray-500">To</label>
					<select
						name="convertTo"
						id="to"
						bind:value={toCurrency}
						class="block w-full rounded-lg border border-slate-950 bg-slate-50 p-2 sm:p-2.5 text-sm text-gray-900 hover:cursor-pointer"
					>
						{#each currencies as [code, name]}
							<option value={code}>{name} ({code})</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="mx-auto flex py-2">
				<button
					onclick={result !== null ? reset : convertCurrency}
					class="mx-auto rounded-lg bg-slate-950 px-3 py-2 text-white hover:cursor-pointer hover:bg-slate-300 hover:text-slate-950"
					disabled={!canConvert && result === null}
				>
					{#if result !== null}
						Reset
					{:else}
						Convert
					{/if}
				</button>
			</div>

			{#if result !== null}
				<div
					class="space-y-3 sm:space-y-4 p-4 sm:p-5 text-slate-950"
					in:fly={{ y: 200, duration: 500, opacity: 0 }}
					out:fly={{ y: -200, duration: 500, opacity: 0 }}
				>
					<h3 class="text-xl sm:text-2xl font-semibold text-slate-500">
						{amount}
						{getCurrencyName(fromCurrency)} =
					</h3>
					<h1 class="text-dark text-3xl sm:text-4xl font-extrabold">{result} {getCurrencyName(toCurrency)}</h1>
				</div>
			{/if}
		</div>
	</div>
</div>




<style> /* custom CSS styling for main container animation */
    .height-transition {
        transition: height 0.3s ease-in-out;
        overflow: hidden;
    }
    .content-wrapper {
        display: flex;
        flex-direction: column;
    }
</style>