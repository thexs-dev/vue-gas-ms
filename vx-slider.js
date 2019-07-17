export default {
  template: `<!--  -->
<v-layout row>
  <v-slider class="mr-3" :value="value" :disabled="disabled" :min="min" :max="max" :label="label" @input="$emit('input', $event)">
  </v-slider>
  <v-text-field :value="value" type="number" :disabled="disabled" :min="min" :max="max" @input="$emit('input', $event)">
  </v-text-field>
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

