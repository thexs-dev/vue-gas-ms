
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
          <div v-else><br></div><br>
        </v-flex>

        <v-flex xs6 ml-2>
          <div v-if="premium">
            {{localize('paid')}}: {{subscription.current.payment_date}}<br>
            {{localize('by')}}: {{subscription.current.payer_email}}<br>
            {{localize(subscription.current.txn_type==='subscr_cancel'?'Expiry':'next')}}: {{subscription.current.next_payment_date}} {{status()}}<br>
            <img v-if="subscription.current.subscr_id && !'subscr_cancel,cancelling'.split(',').some(v => subscription.current.txn_type === v)" 
              @click.stop="hackDialog" src="https://www.paypalobjects.com/en_US/i/btn/btn_unsubscribe_LG.gif" style="cursor: pointer;">
          </div>
          <div v-else>
            <div id="paypal-button-container"></div>
          </div>
        </v-flex>
      </v-layout>

      <div>
        <p> Get your data from Google Sheets into a custom Google Map with a few clicks.
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

  <template>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="500">
        <v-card>
          <v-card-title class="headline">Are you sure?</v-card-title>
          <v-card-text>You can cancel the subscription at any given time within the term<br>
            - It will stop any future automatic renewal payments<br>
            - You will keep the premium plan until the end of the term<br>
            - We would process your request within 1 business day<br>
            - You should get a notification from PayPal when done<br><br>
            Please let us know the reasons for your cancellation in case we can do better in the future. Thanks.<br>
            <v-text-field v-model="reasons" xlabel="Reasons for cancellation?" ref="reasons" autofocus placeholder=" "></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog = false" :disabled="working">Close</v-btn>
            <v-btn text @click.stop="unsubscribe" :disabled="!reasons || working">Unsubscribe</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </template>
</div>`,
  
  data() {
    data.dialog = false;
    data.working = false;
    data.reasons = "";
    data.paypalCustomField = "app=Mapping&uid=" + data.user.dot();
    return data
  },
  
  async mounted() {
    if (!window.google || !window.google.script) Vue.loadScript("./vx-google.script.js");
    // only listen if not premium, waiting for subscription to complete (IPN response)
    if (this.premium || this.subscription.domain) return;

    await Vue.loadScript("https://www.paypal.com/sdk/js?client-id=AVdfQrEmQhAK6pMtqx8Mk44bNqtLGtAy-oa2jEEEzrXiAWWZewptt2EutaFyDWojYtdvDCID41RNXTw5&vault=true&intent=subscription");
    let paypalCustomField = data.paypalCustomField;
    console.log(paypalCustomField);

    paypal.Buttons({
      style: {
        shape: 'pill',
        color: 'blue',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: function (data, actions) {
        return actions.subscription.create({
          'custom': paypalCustomField,
          'custom_id': paypalCustomField,
          'plan_id': 'P-8M4515934T397614EL725EAA'
        });
      },
      onApprove: function (data, actions) {
        console.log(data);
        alert(data.subscriptionID);
      }
    }).render('#paypal-button-container');
    
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

    unsubscribe() {
      this.working = true;
      if (this.itsme) console.log('unsubscribe')
      google.script.run
      .withFailureHandler((e) => {
        $gsdlog(e);
        this.dialog = this.working = false;
      })
      .withSuccessHandler((subscr) => {
        if (this.itsme) console.log(subscr);
        this.subscription = subscr;
        this.dialog = this.working = false;
      })
      .queueUnsubscribe(this.reasons);
    },

    status() {
      const message = {
        subscr_cancel: this.$localize("cancelled"),
        subscr_failed: this.$localize("failing"),
        cancelling: this.$localize("cancelling")
      }
      let s = message[this.subscription.current.txn_type];
      return s ? ` (${s})` : "";
    },

    hackDialog() {
      this.dialog = true;
      setTimeout(() => {
        this.$refs.reasons.focus();
      }, 500)
    },
    
    test() {
      console.log(this.subscription);
      console.log(data);
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
  vuetify: new Vuetify(),
});