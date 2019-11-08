
import * as marked from 'https://cdn.jsdelivr.net/npm/marked@0.7.0/lib/marked.js';
if (!window.marked) window.marked = marked;

import debounce from "./vx-debounce.js";

// https://github.com/sindresorhus/github-markdown-css
document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend",
  "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/github-markdown-css@3.0.1/github-markdown.css\" />"
);


export default {
  template: `<!--  -->
<div class="markdown-body" v-html="compiledMarkdown"></div>`,

  props: {
    template: String,
    json: {}
  },

  // TODO: use marked within a debounce call, then pass it to dom-purify sanitizer
  computed: {
    compiledMarkdown: function () {
      return window.marked(this.template);
    }
  },

  data() {
    return {
      result: 'Okay, bye.'
    }
  }
}