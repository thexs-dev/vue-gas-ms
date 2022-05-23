// const styleWidth = (n) => { return "width: %spx;".format((n.toString().length -1) *6 +32) } // TODO: it doesn't work from here as a common function 

const VxSlider = {
  template: /*html*/`<!--  -->
<v-row no-gutters>
  <v-slider class="align-center" :value="value" :disabled="disabled" :min="min" :max="max" :step="step" :label="label" hide-details @input="$emit('input', $event)"
    :color="right ? 'primary lighten-3' : ''" :track-color="right ? 'primary' : ''" >
    <template v-slot:append>
      <v-text-field class="mt-0 pt-0" :style="styleWidth(max)" :value="value" :disabled="disabled" :min="min" :max="max"  :step="step" type="number" hide-details @input="$emit('input', $event)"></v-text-field>
    </template>
  </v-slider>
</v-row>`,

  props: {
    message: String,
    min: String,
    max: String,
    step: 1,
    label: String,
    value: Number,
    right: Boolean,
    disabled: Boolean
  },

  methods: {
    // hacking: input width to show larger numbers
    styleWidth(n) { return "width: %spx;".format((n.toString().length -1) *6 +32) }
  }
}

const VxRange = {
  template: /*html*/`<!--  -->
<v-row no-gutters>
  <v-range-slider class="align-center" :value="value" :disabled="disabled" :min="min" :max="max" :label="label" hide-details @input="$emit('input', $event)">
    <template v-slot:prepend>
      <v-text-field class="mt-0 pt-0" :style="styleWidth(min)" :value="value[0]" :disabled="disabled" :min="min" :max="max" type="number" hide-details @input="$set(value, 0, $event)"></v-text-field>
    </template>
    <template v-slot:append>
      <v-text-field class="mt-0 pt-0" :style="styleWidth(max)" :value="value[1]" :disabled="disabled" :min="min" :max="max" type="number" hide-details @input="$set(value, 1, $event)"></v-text-field>
    </template>
  </v-range-slider>
</v-row>`,

  props: {
    message: String,
    min: String,
    max: String,
    label: String,
    value: Array,
    right: Boolean,
    disabled: Boolean
  },

  methods: {
    // hacking: input width to show larger numbers
    styleWidth(n) { return "width: %spx;".format((n.toString().length -1) *6 +32) }
  }
}

export { VxSlider, VxRange }