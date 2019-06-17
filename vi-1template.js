
Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-toolbar app>
    <v-toolbar-title>{{localize('toolbar-title')}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn v-if="itsme" icon @click="test">
      <v-icon>bug_report</v-icon>
    </v-btn>
    <v-btn icon @click="window.open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="localize('my-review')">star_half</v-icon>
    </v-btn>
    <v-btn icon @click="window.open('https://www.thexs.ca/posts/how-to-share-my-map')">
      <v-icon :title="localize('help')">help</v-icon>
    </v-btn>
  </v-toolbar>
  <v-content>
    <v-container fluid>
      <v-layout row>

      </v-layout>

    </v-container>
  </v-content>
</div>`,

  data() {
    return data
  },

  mounted() { },
  computed: {},

  methods: {
    localize(key) { return this.localeResources[key] || key },

    test() {
      console.log(this.localize("language"));
    }
  }
});


new Vue({
  el: '#app',
});