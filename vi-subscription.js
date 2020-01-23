
String.prototype.dot = function () { return this.replace(/[\.%]/g, "_"); }

Vue.component('vi-gas', {
  template: `<!--  -->
<div>
  <v-app-bar app>
    <v-toolbar-title>{{localize('advanced-premium-plan')}} - {{localize('subscription')}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">mdi-bug</v-icon>
    <v-btn icon @click="$open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="localize('my-review')">mdi-star</v-icon>
    </v-btn>
    <v-btn icon @click="$open('https://www.thexs.ca/xsmapping/advanced-premium-plan-subscription')">
      <v-icon :title="localize('help')">mdi-help-circle</v-icon>
    </v-btn>
  </v-app-bar>
  <v-content>
    <v-container fluid>
      <v-layout ma-3>
        <v-flex xs6 mr-2>
          <!-- <v-select items="['user','domain']"></v-select> -->
          <div>{{localize('user')}}: {{user}}</div>
          <div>{{localize('subscribe-contribution')}}: {{subscription.current.mc_gross ? (subscription.current.mc_gross*1).toFixed() : 25}} USD / {{localize(subscription.current.period || "year")}}</div>
          <div v-if="premium">{{localize('thanks')}}!</div>
        </v-flex>

        <v-flex xs6 ml-2>
          <div v-if="premium">
            {{localize('paid')}}: {{subscription.current.payment_date}}<br>
            {{localize('by')}}: {{subscription.current.payer_email}}<br>
            {{localize('next')}}: {{subscription.current.next_payment_date}}<br>
          </div>
          <div v-else>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <input type="hidden" name="cmd" value="_s-xclick">
              <input type="hidden" name="hosted_button_id" value="F3HETXH884ANQ">
              <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_subscribeCC_LG.gif" border="0"
                name="submit" alt="PayPal - The safer, easier way to pay online!">
              <input type="hidden" name="custom" :value="custom">
              <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
            </form>
          </div>
        </v-flex>
      </v-layout>

      <div>
        <p> Get your own data from a Google Sheets into a custom featured Google Map with a few clicks.
        </p>
        ■ Basic Free Plan: Up to 50 locations per map. Includes all the basic (−) features.
        <br>
        ■ Advanced Premium Plan (†): No restrictions in the number of locations per map. Includes all the basic (−) and
        advanced (+) features.
        <br><br>
        (†) <b>Disclaimer</b>: The Advanced Premium Plan <b>does not avoid</b>
        <a href="https://www.thexs.ca/xsmapping/limitations-known-issues-and-common-errors">service errors, limitations
          and quotas</a> like
        <a href="https://www.thexs.ca/posts/exception-service-invoked-too-many-times-for-one-day-geocode">Google
          Geocoding daily quota limit exception</a>, etc.
      </div>

    </v-container>
  </v-content>
</div>`,

  data() {
    return data
  },

  async mounted() {
    if (!window.google || !window.google.script) Vue.loadScript("./vx-google.script.js");

    await Vue.loadScript("https://www.gstatic.com/firebasejs/6.2.3/firebase-app.js");
    await Vue.loadScript("https://www.gstatic.com/firebasejs/6.2.3/firebase-database.js");
    const db = firebase.initializeApp({
      databaseURL: 'https://thexs-apps.firebaseio.com/'
    }).database();

    db.ref("/IPN/Mapping/" + this.user.dot() + "/active/")
      .on("value", (snapshot) => {
        if (this.premium === snapshot.val() || this.subscription.domain) return;

        google.script.run
          .withFailureHandler((e) => {
            $gsdlog(e);
          })
          .withSuccessHandler((subscr) => {
            if (this.itsme) console.log(subscr);
            this.subscription = subscr;
            this.premium = snapshot.val(); // or this.subscription.active
          })
          .getIpnSubscription();
      });
  },

  computed: {
    custom() { return "app=Mapping&uid=" + this.user.dot() },
  },

  methods: {
    localize(key) { return this.localeResources[key] || key },

    test() {
      console.log(this.subscription);
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
  vuetify: new Vuetify(),
});