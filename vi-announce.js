import VxMarked from 'https://cdn.jsdelivr.net/gh/thexs-dev/vue-gas-ms@4.x/vx-marked.js';

Vue.component("announce-actions", {
  template: /*html*/`<!--  -->
<div>
  <template v-if="poll.type === 'yorn'">
    <div class="mt-4" v-if="!answered">
      <v-btn @click="vote('YES');" color="success">yes</v-btn>
      <v-btn @click="vote('NO');" color="white" class="ml-2">no</v-btn>
    </div>
    <div class="mt-4" v-else="answered">Thanks for your feedback!</div>
  </template>

  <template v-if="poll.type.substr(0,4) === 'quiz'">
    <v-layout v-if="!answered">
      <v-combobox v-if="poll.type === 'quiz-combobox'" v-model="answer" ref="combo" :items="poll.list.split(',')" label="Select or enter your answer, then Submit"></v-combobox>
      <v-select v-if="poll.type === 'quiz-select'" v-model="answer" :items="poll.list.split(',')"></v-select>
      <v-text-field v-if="poll.type === 'quiz-text'" v-model="answer" ></v-text-field>
      <v-btn @click="submit" color="success" class="ml-2" :disabled="!answer" >submit</v-btn>
    </v-layout>
    <div class="mt-4" v-else="answered">Thanks for your feedback!</div>
  </template>
</div>`,

  props: {
    poll: {},
    entry: 0,
    itsme: false
  },

  data() {
    return {
      answer: "",
      answered: false,
    }
  },

  watch: {
    entry() { this.answered = false; } // hack for itsme navigation init/test
  },

  methods: {
    init() {
      if (!this.poll["created"]) {
        this.$db.ref("/announcements/" + this.entry + "/_poll/created").set(new Date().toISOString());
      }
    },

    vote(arg) {
      this.answered = true;
      if (this.itsme) { 
        this.init();
        if (!this.poll[arg]) this.poll[arg] = 0;
      }
      if (this.poll[arg] >= 0) {
        var oentry = {}; oentry[arg] = this.poll[arg] + 1;
        this.$db.ref("/announcements/" + this.entry + "/_poll").update(oentry);
      }
    },

    submit() {
      // hacking https://github.com/vuetifyjs/vuetify/issues/3424
      if (this.poll.type === 'quiz-combobox') this.$refs.combo.blur();
      this.$nextTick(() => { // same as using Vue.nextTick()
        if (!this.answer) return;
        this.answered = true;
        if (this.itsme) { 
          this.init();
        }
        var dentry = new Date().toISOString().replace(/[T,\.,Z]/g, " ");
        this.$db.ref("/announcements/" + this.entry + "/_poll/~answers/" + dentry).set(this.answer);
      })
    }
  }

});

Vue.component('vi-gas', {
  template: /*html*/`<!--  -->
<div>
  <v-app-bar app>
    <v-toolbar-title>{{announce.title}}</v-toolbar-title>
    <v-spacer></v-spacer>
    <input v-if="itsme" v-model.lazy="key" type="number" min="1" style="width:45px;" @change="update">
    <v-icon v-if="itsme" @click="test">mdi-bug</v-icon>
    <v-icon @click="$open('https://addon.thexs.ca/mapping-sheets'); $gae('review');" :title="$localize('my-review')">mdi-star</v-icon>
    <v-icon :title="$localize('snooze')" @click="google.script.run.flagAnnounce(false,key); google.script.host.close(); $gae('announce-snooze');" class="ml-1">mdi-alarm</v-icon>
    <v-icon :title="$localize('dismiss')" @click="google.script.run.flagAnnounce(true,key); google.script.host.close(); $gae('announce-dismiss');" class="ml-1">mdi-check</v-icon>
  </v-app-bar>
  <v-content>
    <v-container fluid>
      <v-layout>
        <vx-marked :template="announce.content" :json="json" :sanitize="false" ></vx-marked>
      </v-layout>
      <announce-actions v-if="announce._poll" :poll="announce._poll" :entry="key" :itsme="itsme"></announce-actions>
    </v-container>
  </v-content>
</div>`,

  components: {
    VxMarked
  },

  data() {
    data.announce = {
      title: "",
      content: "",
    };
    if (!data.json) data.json = {}; // temporary protection
    data.previousKey = null;
    return data
  },

  async mounted() {
    if (!window.google || !window.google.script) Vue.loadScript("./vx-google.script.js");

    await Vue.loadScript("https://www.gstatic.com/firebasejs/6.2.3/firebase-app.js");
    await Vue.loadScript("https://www.gstatic.com/firebasejs/6.2.3/firebase-database.js");
    Vue.prototype.$db = firebase.initializeApp({
      databaseURL: 'https://thexs-mapping.firebaseio.com/'
    }).database();
    
    this.$db.ref("/announcements/" + this.key).once('value')
      .then( (snapshot) => {
        if (this.itsme) console.log(snapshot.val());
        if (snapshot.val())
          this.announce = snapshot.val();
      });
  },
  
  methods: {
    update(e) {
      if (this.itsme) console.log(this.previousKey, this.key);
      if (this.previousKey) this.$db.ref("/announcements/" + this.previousKey).off();
      this.$db.ref("/announcements/" + this.key).on('value', (snapshot) => {
        if (snapshot.val()) this.announce = snapshot.val();
        else this.announce = {};
      })
      this.previousKey = this.key;
    },

    test() {
      console.log(this.key, this.announce);
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
  vuetify: new Vuetify(),
});