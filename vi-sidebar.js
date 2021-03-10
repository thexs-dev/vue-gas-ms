
Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-app-bar app>
    <v-toolbar-title>{{"%s ⇨ %s".format(localize('data'),localize('map'))}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">mdi-bug</v-icon>
    <v-btn icon @click="$open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
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
          <v-list-item @click="Call('refreshHeaders');$gae('refresh');">{{ localize('refresh-header-list') }}</v-list-item>
          <v-list-item @click="Call('insertDemoSheet');$gae('insert');">{{ localize('insert-demo-sheet') }}</v-list-item>
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
          <v-list-item @click="$open(uidata.urlPath)">{{ localize('view-demo-map') }}</v-list-item>
          <v-list-item @click="$open('https://www.thexs.ca/about-thexs/legalese')">Privacy & Terms</v-list-item>
          <v-list-item @click="google.script.run.vueAbout()">{{ localize('about') }}</v-list-item>
          <v-list-item @click="$open('https://www.thexs.ca/xsmapping/faq-and-feedback')">FAQ & Support</v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-content>
    <v-container fluid>
      <v-layout class="align-center">
        <div class="flex body-2">{{localize('fields-header')}} (*)</div>
        <v-icon @click="$open('https://www.thexs.ca/posts/required-headers-for-mapping')" :title="localize('help')">mdi-help-circle</v-icon>
        <!-- <v-icon v-if="!missingHeaders" @click="$open('https://www.thexs.ca/posts/required-headers-for-mapping')" :title="localize('help')">mdi-help-circle</v-icon>
        <v-tooltip v-if="missingHeaders" left v-model="missingHeaders" min-width="240">
          <template v-slot:activator="{ on, attrs }">
            <v-icon @click="$open('https://www.thexs.ca/posts/required-headers-for-mapping')" v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
          </template>
          <div>Click on <img src="https://thexs-mapping.firebaseapp.com/images/help-circle-outline.png"> to learn how to start</div>
        </v-tooltip> -->
      </v-layout>
      <v-select v-model="uidata.fields.name" :items="uidata.headers" :label="localize('title')" :disabled="working"></v-select>
      <v-select v-model="uidata.fields.filter" :items="uidata.headers" :label="localize('filter')" :disabled="working"></v-select>
      <v-layout>
        <v-select v-model="uidata.fields.address" :items="uidata.headers" :label="localize('location')" :disabled="working" :placeholder="uidata.locationTemplate" :readonly="!!uidata.locationTemplate"></v-select>
        <v-icon @click="google.script.run.vuePreferences('document')" title="Location template">mdi-dots-horizontal</v-icon>
      </v-layout>

      <v-layout class="align-center">
        <div class="flex body-2 mt-3">{{localize('filters-header')}} (*)</div>
        <v-icon @click="$open('https://www.thexs.ca/xsmapping/filtering-on-your-map')" :title="localize('help')">mdi-help-circle</v-icon>
      </v-layout>
      <v-layout v-for="(item, index) in uidata.filters">
        <v-select v-model="item.property" :items="uidata.headers" :disabled="working"></v-select>
        <v-select class="ml-2" v-model="item.kind" :items="filtersKind" :disabled="working"></v-select>
      </v-layout>

      <vx-custom :custom="uidata.custom"></vx-custom>

      <v-snackbar v-model="snackbar" multi-line vertical top timeout>
        <div v-html="snackbarText"></div>
        <v-btn text color="primary" @click="snackbar = false">Close</v-btn>
      </v-snackbar>

    </v-container>
  </v-content>

  <v-footer app fixed padless class="mt-2 body-2 font-weight-light text-truncate">
    <v-progress-linear :indeterminate="working"></v-progress-linear>
    <v-container>
      <div>{{ localize(status)}}</div>
      <!-- <div class="text-truncate">:: {{ localize(uidata.message)}}</div> -->
      <div class="text-truncate">
        <span v-if="missingHeaders" >:: <a href="https://www.thexs.ca/posts/required-headers-for-mapping" title="">{{ localize("Warning") }}</a> {{ localize("Headers required") }}</span>
        <span v-else>:: {{ localize(uidata.message)}}</span>
      </div>
      <v-layout class="mt-2 mb-2">
        <!-- <v-btn color="success" @click="Call('buildJsonFile',uidata);$gae('build');" :disabled="working || !uidata.fields.name || !uidata.fields.address || !uidata.fields.filter">{{ $localize('build') }}</v-btn> -->
        <v-btn color="success" @click="Call('buildJsonFile',uidata);$gae('build');" :disabled="working || missingHeaders">{{ $localize('build') }}</v-btn>
        <v-spacer></v-spacer>
        <!-- <v-btn v-if="itsme" color="secundary" @click="$open('http://127.0.0.1:5505/mapping.html?fid=' + uidata.fid + '&dev=1')" :disabled="working || !uidata.fid">vu-dev</v-btn> -->
        <v-btn v-if="itsme" color="secundary" @click="$open('%s?fid=%s&dev=1'.format(uidata.urlPath.replace(new RegExp('h(.*\/)'), 'http://localhost:5505/'), uidata.fid))" :disabled="working || !uidata.fid">vu-dev</v-btn>
        <!-- <v-btn color="primary" @click="$open(uidata.urlPath + '?fid=' + uidata.fid)" :disabled="working || !uidata.fid">{{ $localize('view') }}</v-btn> -->
        <v-btn color="primary" @click="$open('%s?fid=%s%s'.format(uidata.urlPath, uidata.fid, itsme?'&dev=1':''))" :disabled="working || !uidata.fid">{{ $localize('view') }}</v-btn>
      </v-layout>
      <div>Mapping Sheets by <a href="http://www.thexs.ca/xsmapping">theXS</a> {{ version }}</div>
    </v-container>
  </v-footer>

</div>`,

  data() {
    if (!window.google || !window.google.script) {
      data.uidata.custom = { xvuejs:"./vi.gp-sidebar.js", baseDate:"2019-11-15", min:"2019-11-01", max:"2019-11-30", disabled:!true };
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

    if (this.uidata.custom && this.uidata.custom.vuejs) {
      // Vue.component("vx-custom", () => import(this.uidata.custom.vuejs));
      Vue.loadScript(this.uidata.custom.vuejs, {type:"module"});
    }

    window.setTimeout(() => {
      this.status = "ready";
      this.working = false;
      if (this.$gae) this.$gae('load'); else console.log("$gae not yet available");
    }, 1000);
  },
  computed: {
    // missingHeaders() { return [this.uidata.fields.name, this.uidata.fields.address, this.uidata.fields.filter].some(v => !v || !this.uidata.headers.includes(v)) },
    missingHeaders() { return [this.uidata.fields.name, this.uidata.fields.filter].some(v => !v || !this.uidata.headers.includes(v)) 
      || !this.uidata.fields.address || ( this.uidata.locationTemplate ? this.uidata.locationTemplate !== this.uidata.fields.address : !this.uidata.headers.includes(this.uidata.fields.address) ) }
  },

  methods: {
    localize(key) { return this.localeResources[key] || key },

    Call(fnName, param) {
      console.time(fnName);
      this.working = true;
      this.status = "processing";
      this.uidata.message = "...";
      google.script.run
      .withSuccessHandler(d => {
        if (this.itsme) console.log(fnName,param,d);
        // assuming it always comes back with the full/partial uidata object ...
        this.uidata.message = this.uidata.status = "";
        if (typeof d === 'object' && d !== null) {
          Object.keys(d).forEach(k => this.uidata[k] = d[k]);
        }
        if (!this.uidata.message) this.uidata.message = "%s (%s)".format("OK", fnName);
        window.setTimeout(() => { this.status = this.uidata.status || "ready"; this.working = false; }, 1000);
        console.timeEnd(fnName);
      })
      .withFailureHandler(e => {
        if (this.itsme) console.log(fnName,param,e);
        var extras = ""; // hacking the toast message for specific issues
        var keywordAuthorization = "is not defi-ned,ScriptError,Spreadsheets,permission,do not have access,разрешения,Authorization,Authorisation,toestemming,認が,הרשאה,autorisations,autorización,εξουσιοδότηση,인증이,autoryzacja,ตรวจสอบสิทธิ์,авторизация,yetki,autorizzazione,autorisée,lupa,授权,otorisasi,承認,授權,Berechtigung,phép,ترخيص.";
        if (keywordAuthorization.split(",").some(function(v){ return e.message && e.message.indexOf(v) > -1; })) {
          extras += "<br><br>If you are using (logged in or not) multiple Google accounts, please: <br>" +
          "* Disconnect the other Google accounts <br>" +
          "* Or ensure that your current account ("+this.user+") is the Default" +
          "<br><br>Learn more on <a href='https://www.thexs.ca/xsmapping/faq-and-feedback#h.5pj25s4jg196'>Current Issues</a>.";
        }
        var feedback = "<br>Send your feedback using <a href='https://docs.google.com/a/thexs.ca/forms/d/11s6OQoBS1Vn9QGgDCirqPGZq78Dv4RIPAtxuXprJJZw/viewform'>this form</a>."
        xsLogger.log(e, fnName);
        this.working = false;
        window.setTimeout(() => this.status = "error", 1000);
        this.uidata.message = e.message;
        this.toast("Problem at %s<hr><br> Original error message: <br> %s %s <br>%s".format(fnName,e.message,extras,feedback));
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
      this.toast("Hello from Testing<hr><br> There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.")
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