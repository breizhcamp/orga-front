<script setup lang="ts">
import { G, List, Rect, SVG, Svg, Tspan } from '@svgdotjs/svg.js';
import axios from 'axios';
import { computed, onMounted, useTemplateRef, watch } from 'vue';

const SVG_WIDTH = 1280;
const SVG_HEIGHT = 389;
const TEXT_COLOR = '#000000';
const SELECTED_BACKGROUND_COLOR = '#0095ff';
const AVAILABLE_BACKGROUND_COLOR = '#65ff00';
const DISABLE_TEXT_COLOR = '#626262';
const DISABLE_BACKGROUND_COLOR = '#7e7e7e';

const props = defineProps<{
  level: string;
  filledPlaces: string[];
  disabled: boolean;
  svgUrl: string;
}>();

const selectedStand = defineModel<string>({ required: true });

const svg = useTemplateRef('svg');
let draw: Svg | undefined = undefined;

const levelLetter = computed(() => props.level.charAt(0));

const handleClick = (stand: string): void => {
  if (props.disabled) return;
  if (!stand.startsWith(levelLetter.value) || props.filledPlaces.includes(stand)) return;
  selectedStand.value = stand;
};

const findBackgroundElement = (gElement: G): Rect | undefined => {
  return gElement
    .children()
    .filter((element) => {
      return element.type === 'rect' && element.node.attributes.getNamedItem('fill');
    })[0] as Rect | undefined;
};

const findParentElement = (tspanElement: Tspan): G | null => {
  const parent = tspanElement.parent()?.parent();
  if (parent?.type !== 'g') return null;
  return parent as G;
};

const updateTspan = (tspanElement: Tspan): void => {
  const parent = findParentElement(tspanElement);
  if (!parent) return;
  const background = findBackgroundElement(parent);
  if (!background) return;
  const stand = tspanElement.text();

  if (stand === selectedStand.value) {
    tspanElement.fill(TEXT_COLOR);
    background.fill(SELECTED_BACKGROUND_COLOR);
    parent.css('cursor', 'pointer');
  } else if (props.disabled || !stand.startsWith(levelLetter.value) || props.filledPlaces.includes(stand)) {
    background.fill(DISABLE_BACKGROUND_COLOR);
    tspanElement.fill(DISABLE_TEXT_COLOR);
    parent.css('cursor', 'not-allowed');
  } else {
    tspanElement.fill(TEXT_COLOR);
    background.fill(AVAILABLE_BACKGROUND_COLOR);
    parent.css('cursor', 'pointer');
  }
};

const forEachTspan = (callback: (tspanElement: Tspan) => void) => {
  if (draw === undefined) return;
  const tspans = draw.find('tspan') as List<Tspan>;
  tspans.each((tspanElement) => {
    const text = tspanElement.text();
    if (text[0] && ['S', 'G', 'P', 'B'].includes(text[0])) {
      callback(tspanElement);
    }
  });
};

onMounted(async () => {
  if (!svg.value) return;

  const response = await axios.get<string>(props.svgUrl);
  draw = SVG().addTo(svg.value).size('100%', '100%');
  draw.svg(response.data);
  draw.viewbox(0, 0, SVG_WIDTH, SVG_HEIGHT);
  forEachTspan((tspanElement) => {
    const parent = findParentElement(tspanElement);
    if (!parent) return;
    const stand = tspanElement.text();
    parent.click(() => {
      handleClick(stand);
    });
    updateTspan(tspanElement);
  });
});

watch([
  selectedStand,
  levelLetter,
  () => props.filledPlaces,
  () => props.disabled,
], () => {
  forEachTspan(updateTspan);
});
</script>

<template>
  <div class="overflow-x-auto w-100 rounded-2">
    <div id="svg" class="w-100" ref="svg"></div>
  </div>
</template>

<style lang="css" scoped>
#svg {
  user-select: none;
  min-width: 1000px;
}
</style>
