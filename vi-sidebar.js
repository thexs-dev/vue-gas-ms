
Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-app-bar app>
    <v-toolbar-title>{{"%s ⇨ %s".format(localize('data'),localize('map'))}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">mdi-bug</v-icon>
    <v-btn icon @click="window.open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="localize('my-review')">mdi-star</v-icon>
    </v-btn>
    <v-menu open-on-hover>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on" :disabled="working">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item-group>
          <v-list-item @click="Call('insertDemoSheet');$gae('insert');">{{ localize('insert-demo-sheet') }}</v-list-item>
          <v-list-item @click="Call('refreshHeaders');$gae('refresh');">{{ localize('refresh-header-list') }}</v-list-item>
          <v-divider></v-divider>
          <template v-if="itsme">
            <v-list-item @click="google.script.run.showAnnounceForMe()">Announces For Me</v-list-item>
            <v-list-item @click="google.script.run.testingFromSidebarForMe()">Testing For Me</v-list-item>
            <!-- <v-divider></v-divider> -->
            <hr disabled>
          </template>
          <v-list-item @click="google.script.run.vuePreferences()">{{ localize('preferences') }}</v-list-item>
          <v-list-item @click="google.script.run.vueSubscription()">{{ localize('subscription') }}</v-list-item>
          <v-list-item @click="google.script.run.vueSharing(uidata.fid);$gae('share');" :disabled="!uidata.fid">{{ localize('share-my-map') }}</v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="window.open(uidata.urlPath)">{{ localize('view-demo-map') }}</v-list-item>
          <v-list-item @click="window.open('https://www.thexs.ca/about-thexs/legalese')">Privacy & Terms</v-list-item>
          <v-list-item @click="google.script.run.vueAbout()">{{ localize('about') }}</v-list-item>
          <v-list-item @click="window.open('https://www.thexs.ca/xsmapping/faq-and-feedback')">FAQ & Support</v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-content>
    <v-container fluid>
      <v-layout class="align-center">
        <div class="flex body-2">{{localize('fields-header')}} (*)</div>
        <v-icon @click="window.open('https://www.thexs.ca/posts/required-headers-for-mapping')" :title="localize('help')">mdi-help-circle</v-icon>
      </v-layout>
      <v-select v-model="uidata.fields.name" :items="uidata.headers" :label="localize('title')" :disabled="working"></v-select>
      <v-select v-model="uidata.fields.filter" :items="uidata.headers" :label="localize('filter')" :disabled="working"></v-select>
      <v-layout>
        <v-select v-model="uidata.fields.address" :items="uidata.headers" :label="localize('location')" :disabled="working"></v-select>
        <v-icon @click="google.script.run.vuePreferences('document')" title="Location template">mdi-dots-horizontal</v-icon>
      </v-layout>

      <v-layout class="align-center">
        <div class="flex body-2 mt-3">{{localize('filters-header')}} (*)</div>
        <v-icon @click="window.open('https://www.thexs.ca/xsmapping/filtering-on-your-map')" :title="localize('help')">mdi-help-circle</v-icon>
      </v-layout>
      <v-layout v-for="(item, index) in uidata.filters">
        <v-select v-model="item.property" :items="uidata.headers" :disabled="working"></v-select>
        <v-select class="ml-2" v-model="item.kind" :items="filtersKind" :disabled="working"></v-select>
      </v-layout>

      <vx-custom v-model="custom"></vx-custom>

      <v-snackbar v-model="snackbar" multi-line vertical absolute timeout>
        <div v-html="snackbarText"></div>
        <v-btn text color="primary" @click="snackbar = false">Close</v-btn>
      </v-snackbar>

    </v-container>
  </v-content>

  <v-footer app fixed padless class="mt-2 body-2 font-weight-light text-truncate">
    <v-progress-linear :indeterminate="working"></v-progress-linear>
    <v-container>
      <div>{{ localize(status)}}</div>
      <div class="text-truncate">:: {{ localize(uidata.message)}}</div>
      <v-layout class="mt-2 mb-2">
        <v-btn color="success" @click="Call('buildJsonFile',uidata);$gae('build');" :disabled="working || !uidata.fields.name || !uidata.fields.address || !uidata.fields.filter">{{ $localize('build') }}</v-btn>
        <v-spacer></v-spacer>
        <!-- <v-btn v-if="itsme" color="secundary" @click="window.open('http://127.0.0.1:5500/mapping.html?fid=' + uidata.fid)" :disabled="working || !uidata.fid">vu-dev</v-btn> -->
        <v-btn v-if="itsme" color="secundary" @click="window.open('https://script.google.com/a/macros/thexs.ca/s/AKfycbzjd-_KOMG9HoIzjsv3w2M5Wf-hR1syYw6C9grbBXM4/dev?fid=' + uidata.fid)" :disabled="working || !uidata.fid">vu-dev</v-btn>
        <v-btn color="primary" @click="window.open(uidata.urlPath + '?fid=' + uidata.fid)" :disabled="working || !uidata.fid">{{ $localize('view') }}</v-btn>
      </v-layout>
      <div>Mapping Sheets by <a href="http://www.thexs.ca/xsmapping">theXS</a> {{ version }}</div>
    </v-container>
  </v-footer>

</div>`,

  data() {
    if (!window.google || !window.google.script) {
      data.custom = {}; // TODO: review and complete the associated code
      data.uidata = {"fid":"1hNt8yd6Vd-zxj6anWN0Xe8frzwHaEddh","headers":["Name","Category","Address","Company","Status","Range","Due on","Days since Due","More Info","Picture","Notes","Latitude","Longitude","Buffer"],"xfilters":[],"filters":[{"property":"Status","kind":"checkboxes"},{"property":"Range","kind":"slider"}],"fields":{"filter":"Category","name":"Name","address":"Address"},"urlPath":"https://thexs-mapping.firebaseapp.com/mapping.html"}
    }
    data.snackbar = false;
    data.snackbarText = "";
    data.working = true;
    data.status = "loading";
    data.uidata.message = "";
    return data
  },

  mounted() {
    if (!window.google || !window.google.script) Vue.loadScript("./vx-google.script.js");

    // TODO: load this.custom.html file if required

    window.setTimeout(() => {
      this.status = "ready";
      this.working = false;
      if (this.$gae) this.$gae('load'); else console.log("$gae not yet available");
    }, 1000);
  },
  computed: {},

  methods: {
    localize(key) { return this.localeResources[key] || key },

    Call(fnName, param) {
      console.time(fnName);
      this.working = true;
      this.status = "processing";
      this.uidata.message = "...";
      google.script.run
      .withSuccessHandler(d => {
        console.log(fnName,param,d);
        // assuming it always comes back with the full/partial uidata object ...
        this.uidata.message = "";
        if (typeof d === 'object' && d !== null) {
          Object.keys(d).forEach(k => this.uidata[k] = d[k]);
        }
        if (!this.uidata.message) this.uidata.message = "%s (%s)".format("OK", fnName);
        window.setTimeout(() => { this.status = "ready"; this.working = false; }, 1000);
        console.timeEnd(fnName);
      })
      .withFailureHandler(e => {
        console.log(fnName,param,e);
        var extras = ""; // hacking the toast message for specific issues
        var keywordAuthorization = "is not def-ined,Authorization,Authorisation,toestemming,認が,הרשאה,autorisations,autorización,εξουσιοδότηση,인증이,autoryzacja,ตรวจสอบสิทธิ์,авторизация,yetki,autorizzazione,autorisée,lupa,授权,otorisasi,承認,授權,Berechtigung,phép,ترخيص.";
        if (keywordAuthorization.split(",").some(function(v){ return e.message.indexOf(v) > -1; })) {
          extras += "<br><br>If you are logged in with multiple Google accounta, please: <br>" +
          "* Disconnect the other Google accounts <br>" +
          "* Or ensure that your current account ("+this.user+") is the Default";
        }
        var feedback = "<br>Send your feedback using <a href='https://docs.google.com/a/thexs.ca/forms/d/11s6OQoBS1Vn9QGgDCirqPGZq78Dv4RIPAtxuXprJJZw/viewform'>this form</a>."
        this.toast("Problem at %s<hr><br> Original error message: <br> %s %s <br>%s".format(fnName,e,extras,feedback));
        xsLogger.log(e, fnName);
        this.working = false;
        this.uidata.message = e;
        window.setTimeout(() => this.status = "error", 1000);
        console.timeEnd(fnName);
      })
      [fnName](param);
    },

    toast(msg, timeout) {
      this.snackbarText = msg;
      this.snackbar = true;
    },

    test() {
      // var x=y; // throwing error for testing
      // this.toast("Hello from Testing")
      console.log(this.uidata);
      this.working = !this.working;
      window.setTimeout(() => this.working = !this.working, 3000);
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
  vuetify: new Vuetify(),
});