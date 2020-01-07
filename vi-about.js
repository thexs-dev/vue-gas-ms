
Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-app-bar app>
    <v-toolbar-title>{{localize('about')}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">mdi-bug</v-icon>
    <v-btn icon @click="$open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="localize('my-review')">mdi-star</v-icon>
    </v-btn>
  </v-app-bar>
  <v-content>
    <v-container fluid>
      <v-layout>
        <span>
          <img src="https://thexs-host.firebaseapp.com/images/xsMapping-128.png"></img>
        </span>

        <div><br>
          <p>{{localize('about-description')}}</p>
          <p>
            {{localize('licensed-to')}} {{user}}
            (<i>{{localize(premium ? "advanced-premium-plan" : "basic-free-plan")}}</i>)<br>
            {{localize('version')}} {{version}}
            (<a href="https://www.thexs.ca/xsmapping/mapping-sheets-is-learning-your-language">
              {{localize('localized-in')}} {{localize('language-locale')}}</a>)
            &nbsp;[ {{localize('language')}} ]
          </p>
        </div>

      </v-layout>

      <div>{{localize('about-more')}}
        <v-btn icon href="https://www.thexs.ca/xsmapping">
          <v-icon>mdi-link</v-icon>
        </v-btn>
      </div>
      <p>By using this add-on you acknowledge, consent and agree to our
        <a href="https://www.thexs.ca/about-thexs/legalese">Privacy Policy and Terms</a>
      </p>

      <p v-if="premium"></p>
      <p v-else></p>
      <p>{{localize('thanks')}}</p>
    </v-container>
  </v-content>
</div>`,

  data() {
    return data
  },

  mounted() { },

  methods: {
    localize(key) { return this.localeResources[key] || key },

    test() {
      console.log(this.localize("language"));
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
  vuetify: new Vuetify(),
})