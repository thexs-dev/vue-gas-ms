
Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-toolbar app>
    <v-toolbar-title>{{localize('Follow the steps below to share your map')}}</v-toolbar-title>
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
      <p>
        <div>A. Click the <b>COPY</b> button, to copy your map link</div>
        <v-layout ml-3 row>
          <v-text-field id="mapUrl" v-model="mapUrl" label="Your map link"></v-text-field>
          <v-btn color="secondary"
            @click="document.getElementById('mapUrl').select(); document.execCommand('copy'); $gae('copy');">
            {{localize('Copy')}}
          </v-btn>
        </v-layout>
        <div>B. Click the <b>SHARE</b> button, to open the Google sharing page, then</div>
        <div class="ml-3">1. Enter the email(s) you want to share your map with</div>
        <div class="ml-3">2. Click the button on the right and select 'can view'</div>
        <div class="ml-3">3. Add a note advising to just click on the link of your map</div>
        <div class="ml-3">4. After that note, paste the link you copied before</div>
        <div class="ml-3">5. Click Send, confirm if asked and Done.</div>
        <br>
      </p>
      <v-layout row justify-end>
        <v-btn color="white" @click="google.script.host.close()">Close</v-btn>
        <v-btn color="primary" :href="shareUrl" @click="$gae('share');">Share</v-btn>
      </v-layout>
    </v-container>
  </v-content>
</div>`,

  data() {
    return data
  },

  mounted() { },

  computed: {
    shareUrl() { return "https://drive.google.com/file/d/" + this.fileId + "/view?userstoinvite=%20"; },
    mapUrl() { return "https://thexs-mapping.firebaseapp.com/mapping.html?fid=" + this.fileId; },
  },

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