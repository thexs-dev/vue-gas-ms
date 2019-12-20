export default {
  template: `<!--  -->
<v-layout mt-10>
  <v-text-field label="Predictions base date" v-model="custom.baseDate" :min="custom.min" :max="custom.max" :disabled="custom.disabled" type="date"></v-text-field>
</v-layout>`,

  props: {
    custom: Object
  }
}