<!--
  @prismicio/svelte 2.2.4's PrismicPreview, for SvelteKit 3 (the same copy as
  caltex-landing and espada, reddoor-maintenance P1-53). The package declares
  peer kit ^2 and calls goto(..., { noScroll }) when a preview ends: kit 3
  removed that option and throws on it in dev. This copy uses refreshAll and
  reset: false. Drop it for the package's own once a release supports kit 3.
-->
<script lang="ts">
  import { beforeNavigate, goto, refreshAll } from "$app/navigation";
  import { getToolbarSrc } from "@prismicio/client";
  import { onMount } from "svelte";

  type Props = {
    repositoryName: string;
    routePrefix?: string;
    routePrefixName?: string;
  };

  const {
    repositoryName,
    routePrefix = "preview",
    routePrefixName = routePrefix,
  }: Props = $props();

  const toolbarSrc = $derived(getToolbarSrc(repositoryName));

  let endingPreview = $state(false);

  onMount(() => {
    const controller = new AbortController();

    window.addEventListener(
      "prismicPreviewUpdate",
      (event) => {
        event.preventDefault();
        refreshAll();
      },
      { signal: controller.signal },
    );
    window.addEventListener(
      "prismicPreviewEnd",
      (event) => {
        event.preventDefault();
        endingPreview = true;
        goto(
          new URL(
            window.location.pathname.replace(
              new RegExp(`^(/${routePrefix}/?$|/${routePrefix}/)`),
              "/",
            ),
            window.location.origin,
          ),
          { refreshAll: true, reset: false },
        );
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  });

  beforeNavigate((navigation) => {
    const fromParams: Record<string, string | undefined> = navigation.from?.params ?? {};
    if (
      navigation.to &&
      fromParams[routePrefixName] === routePrefix &&
      !(routePrefixName in (navigation.to.params || {}))
    ) {
      if (endingPreview) {
        endingPreview = false;
        return;
      }

      navigation.cancel();
      goto(new URL(routePrefix + navigation.to.url.pathname, navigation.to.url.origin));
    }
  });
</script>

<svelte:head>
  <script defer src={toolbarSrc}></script>
</svelte:head>
