
Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-app-bar app>
    <v-toolbar-title>{{$localize('toolbar-title')}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">mdi-bug</v-icon>
    <v-btn icon @click="window.open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="$localize('my-review')">mdi-star</v-icon>
    </v-btn>
    <v-btn icon @click="window.open('https://www.thexs.ca/posts/how-to-share-my-map')">
      <v-icon :title="$localize('help')">mdi-help-circle</v-icon>
    </v-btn>
  </v-app-bar>
  <v-content>
    <v-container fluid>
      <v-layout>

      </v-layout>

    </v-container>
  </v-content>
</div>`,

  data() {
    return data
  },

  mounted() {},
  computed: {},

  methods: {
    // localize(key) { return this.localeResources[key] || key },

    test() {
      console.log(this.localize("language"));
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
  vuetify: new Vuetify(),
});