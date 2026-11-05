<script lang="ts">
  import { Plus } from "@lucide/svelte";

  // Each answer is in the server HTML, inside <details>, so a crawler, an AI
  // assistant or a reader without JavaScript gets the text; the browser opens
  // and closes it with no script at all. It used to be a <button> whose answer
  // existed only after a click (Developer Brief Part 2, §14a; the Process FAQ and
  // About's DAPA, ECAT and FSS lines). An item with no content renders no answer,
  // where the old component filled in Lorem ipsum.
  interface AccordianItem {
    label: string;
    content?: string;
  }

  interface Props {
    accordianProps?: AccordianItem[];
  }

  let { accordianProps = [] }: Props = $props();
</script>

<div class="w-full flex flex-col border-dark border-b-2">
  {#each accordianProps as accordian, i (i)}
    <!-- From 1280px the answer sits beside the question, as the old button laid
         them out; where a browser can't lay out <details> as a grid, it sits below. -->
    <details
      class="accordian group relative w-full border-t-2 border-dark xl:grid xl:grid-cols-2 xl:items-start"
    >
      <summary class="w-full cursor-pointer list-none">
        <Plus
          class="absolute top-4 right-0 text-dark transition-transform duration-300 ease-in-out opacity-80 hover:opacity-100 origin-center shrink-0 group-open:rotate-45"
          size={36}
          strokeWidth={1}
          aria-hidden="true"
        />
        <div class="h-20 py-8 pr-20 w-full flex flex-row items-center">
          <h4 class="text-left text-dark pr-12 md:pr-0 md:text-nowrap">
            {accordian.label}
          </h4>
        </div>
      </summary>
      {#if accordian.content}
        <div class="pr-16 w-full">
          <p
            class="text-left pb-8 pr-8 pt-4 text-[16px] whitespace-pre-wrap leading-relaxed md:text-[24px] xl:text-[20px]"
          >
            {accordian.content}
          </p>
        </div>
      {/if}
    </details>
  {/each}
</div>

<style>
  /* No default disclosure triangle: the plus icon is the marker. */
  summary::-webkit-details-marker {
    display: none;
  }
  /* The old component slid open over 500ms. Browsers that can animate a
     <details> to its auto height do the same; the rest open at once. */
  @supports selector(::details-content) {
    .accordian {
      interpolate-size: allow-keywords;
    }
    .accordian::details-content {
      block-size: 0;
      overflow: clip;
      opacity: 0;
      transition:
        block-size 500ms ease,
        opacity 500ms ease,
        content-visibility 500ms allow-discrete;
    }
    .accordian[open]::details-content {
      block-size: auto;
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .accordian::details-content {
      transition: none;
    }
  }
</style>
