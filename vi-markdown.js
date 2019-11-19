// import * as marked from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.js';
// if (!window.marked) window.marked = marked;

// import debounce from "./vx-debounce.js";

import VxMarked from './vx-marked.js';

Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-toolbar app>
    <v-toolbar-title>{{localize('toolbar-title')}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">bug_report</v-icon>
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
        <textarea class="flex xs6 pa-2" v-model:value="markdown"></textarea>
        <vx-marked class="flex xs6 pa-2" :template="markdown"></vx-marked>
      </v-layout>
    </v-container>
  </v-content>
</div>`,

  components: {
    VxMdRender
  },

  data() {
    data.markdown = "# Hello \n---\n > some quotes";
    return data
  },

  mounted() { },
  computed: {},

  methods: {
    localize(key) { return this.localeResources[key] || key },

    

    test() {
      console.log(this.localize("language"));
      this.$gae("test");
      console.log(window.marked(this.markdown));
      // debounce(console.log(window.marked(this.markdown)));
    }
  }
});


new Vue({
  el: '#app',
});