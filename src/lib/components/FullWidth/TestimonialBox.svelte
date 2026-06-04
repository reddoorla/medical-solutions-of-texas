<script lang="ts">
  interface Props {
    icon?: string;
    iconAltText?: string;
    testimonialText?: string;
    attribution?: string;
    attributionLabel?: string;
    backgroundColor?: string;
    float?: string;
    class?: string;
  }

  let {
    icon = "",
    iconAltText = "company logo",
    testimonialText = "",
    attribution = "",
    attributionLabel = "",
    backgroundColor = "transparent",
    float = "center",
    class: passedClasses = "",
  }: Props = $props();

  const justify = $derived(float === "left" ? "start" : float === "right" ? "end" : float);

  const horizontalFloatMargin = $derived(
    float === "left" ? "ml-0 mr-auto" : float === "right" ? "ml-auto mr-0" : "mx-auto",
  );

  const baseClasses = "w-full flex flex-col p-2 sm:p-8";
</script>

<div
  class="{baseClasses} justify-{justify} text-{float} {passedClasses}"
  style="background-color: {backgroundColor}"
>
  {#if icon}
    <img src={icon} alt={iconAltText} class="pl-3 mb-12 {horizontalFloatMargin}" />
  {/if}

  {#if testimonialText}
    <p class="mb-7 max-w-full">{testimonialText}</p>
  {/if}

  {#if attribution}
    <p class="mb-3 max-w-full">{attribution}</p>
  {/if}

  {#if attributionLabel}
    <p class="mb-7 max-w-full text-xs">{attributionLabel}</p>
  {/if}
</div>
