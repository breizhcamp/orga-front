<template>
  <img
    v-if="src != undefined && src!= ''"
    :src="src"
    class="member-profile"
    style="object-fit: cover;"
  >
  <div
    v-else
    class="member-profile d-inline-flex fs-6"
    :style="nameToStyle(name)"
  >
    <b class="m-auto">{{ name[0] }}</b>
  </div>
</template>

<script lang="ts">
import { type CSSProperties, defineComponent } from 'vue';

export default defineComponent({
  name: "ProfilePicture",

  props: {
    src: { type: String, required: false },
    name: { type: String, required: true }
  },

  methods: {
    nameToStyle(name: string): CSSProperties {
      let value = 0;

      // Simple hash to get icon color as hex
      for(let i = 0; i < name.length; i++) {
        const code = name.charCodeAt(i);
        value += (code + code * value);
        value &= 0xFFFFFF;
      }

      const backgroundColor = "#" + value.toString(16);
      const [r, g, b] = [
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF,
      ];

      // Text and border color determined by the luminance of the background to
      // maximise contrast
      const textColor = (
        0.2126 * r / 256 + 
        0.7152 * g / 256 + 
        0.0722 * b / 256
      ) < 0.5 ? "#EAEAEA" : "#181818";

      return {
        backgroundColor,
        color: textColor,
        borderColor: textColor,
        borderWidth: "1px",
        borderStyle: "solid"
      } as CSSProperties
    }
  }
})


</script>