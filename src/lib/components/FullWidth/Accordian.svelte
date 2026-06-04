<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { Plus } from "@lucide/svelte";

  const LOREM =
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat m dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor inc.";

  interface AccordianItem {
    label: string;
    content?: string;
  }

  interface Props {
    accordianProps?: AccordianItem[];
  }

  let {
    accordianProps = [
      { label: "Is this thing on?", content: LOREM },
      { label: "Is this thing on?" },
    ],
  }: Props = $props();

  let activeAccordians: boolean[] = $state(accordianProps.map(() => false));
</script>

<div class="w-full flex flex-col border-dark border-b-2 cursor-pointer">
  {#each accordianProps as accordian, i (i)}
    <button
      class="relative w-full border-t-2 border-dark cursor-pointer flex flex-col xl:flex-row"
      onclick={() => (activeAccordians[i] = !activeAccordians[i])}
    >
      <Plus
        class="absolute top-4 right-0 text-dark transition-transform duration-300 ease-in-out opacity-80 hover:opacity-100 origin-center shrink-0 {activeAccordians[
          i
        ]
          ? 'rotate-45'
          : ''}"
        size={36}
        strokeWidth={1}
      />
      <div class="h-20 py-8 pr-20 w-full flex flex-row items-center">
        <h4 class="text-left text-dark pr-12 md:pr-0 md:text-nowrap">
          {accordian.label}
        </h4>
      </div>
      {#if activeAccordians[i]}
        <div class="pr-16 w-full" transition:slide={{ duration: 500 }}>
          <p
            class="text-left pb-8 pr-8 pt-4 text-[16px] whitespace-pre-wrap leading-relaxed md:text-[24px] xl:text-[20px] transition-opacity {activeAccordians[
              i
            ]
              ? 'opacity-100'
              : 'opacity-0'}"
            transition:fade
          >
            {accordian.content || LOREM}
          </p>
        </div>
      {/if}
    </button>
  {/each}
</div>
