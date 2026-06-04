<script lang="ts">
  import Select from "svelte-select";
  import dropdownArrow from "$lib/assets/icons/dropdown-arrow-light.svg";

  type SelectOption = {
    index?: number;
    value?: string;
    label?: string;
  };

  interface Props {
    items: string[] | { label: string; value: string }[];
    value?: SelectOption;
    placeholder?: string;
    class?: string;
  }

  let { items, value = $bindable(), placeholder, class: passedClasses = "" }: Props = $props();

  let selectHover = $state(false);

  const baseClasses = "w-full mx-auto cursor-pointer relative border-light bg-opacity-10";
</script>

<div
  class="{baseClasses} {passedClasses}"
  role="separator"
  onmouseover={() => (selectHover = true)}
  onfocus={() => (selectHover = true)}
  onmouseout={() => (selectHover = false)}
  onblur={() => (selectHover = false)}
>
  <Select {items} bind:value {placeholder} searchable={false} class="svelte-select" />
  <div
    class="absolute h-full aspect-square right-0 top-0 flex items-center justify-center pointer-events-none"
  >
    <img
      src={dropdownArrow}
      alt="decorative dropdown arrow"
      aria-hidden="true"
      class:opacity-55={selectHover}
      class="transition-all pointer-events-none"
    />
  </div>
</div>
