
Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-toolbar app>
    <v-toolbar-title>{{localize('about')}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">bug_report</v-icon>
    <v-btn icon @click="window.open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="localize('my-review')">star_half</v-icon>
    </v-btn>
  </v-toolbar>
  <v-content>
    <v-container fluid>
      <v-layout row>
        <img src="https://thexs-host.firebaseapp.com/images/xsMapping-128.png"></img>

        <div><br>
          <p>{{localize('about-description')}}</p>
          <p>
            {{localize('licensed-to')}} {{user}}
            (<i>{{localize(subscription ? "advanced-premium-plan" : "basic-free-plan")}}</i>)<br>
            {{localize('version')}} {{version}}
            (<a href="https://www.thexs.ca/xsmapping/mapping-sheets-is-learning-your-language">
              {{localize('localized-in')}} {{localize('language-locale')}}</a>)
            &nbsp;[ {{localize('language')}} ]
          </p>
        </div>

      </v-layout>

      <div>{{localize('about-more')}}
        <v-btn icon href="https://www.thexs.ca/xsmapping">
          <v-icon>link</v-icon>
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
});