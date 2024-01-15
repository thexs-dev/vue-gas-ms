
Vue.component('vi-gas', {
  template: /*html*/`<!--  -->
<div>
  <v-app-bar app>
    <v-toolbar-title>{{localize('Follow the steps below to share your map')}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">mdi-bug</v-icon>
    <v-btn icon @click="$open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="localize('my-review')">mdi-star</v-icon>
    </v-btn>
    <v-btn icon @click="$open('https://www.thexs.ca/posts/how-to-share-my-map')">
      <v-icon :title="localize('help')">mdi-help-circle</v-icon>
    </v-btn>
  </v-app-bar>
  <v-content>
    <v-container fluid>
      <p>
        <div>A. Click the <b>COPY</b> button, to copy your map link</div>
        <v-layout ml-3>
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
      <v-layout justify-end>
        <v-btn class="mr-2" color="white" @click="google.script.host.close()">Close</v-btn>
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
    // mapUrl() { return "https://thexs-mapping.firebaseapp.com/mapping.html?fid=" + this.fileId; },
    mapUrl() { return "%s?fid=%s&fn=%s".format(this.urlPath, this.fileId, this.fileName); },
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
  vuetify: new Vuetify(),
});