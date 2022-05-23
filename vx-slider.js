export default {
  template: /*html*/`<!--  -->
<v-layout>
  <v-slider class="align-center mr-3" :value="value" :disabled="disabled" :min="min" :max="max" :label="label" @input="$emit('input', $event)" hide-details>
    <template v-slot:append>
      <v-text-field class="mt-0 pt-0" :value="value" :disabled="disabled" :min="min" :max="max"  type="number" @input="$emit('input', $event)" hide-details>
      </v-text-field>
    </template>
  </v-slider>
</v-layout>`,

  props: {
    message: String,
    min: String,
    max: String,
    label: String,
    value: Number,
    disabled: Boolean
  }
}

/**
https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components

import VxSlider from "..... vx-slider.js"

  components: {
    VxSlider
  },

 */

