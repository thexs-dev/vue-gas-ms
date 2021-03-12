// https://github.com/markedjs/marked
import * as marked from 'https://cdn.jsdelivr.net/npm/marked@1.1.0/lib/marked.js';
if (!window.marked) window.marked = marked;

// https://github.com/cure53/DOMPurify
// DOMPurify() is loaded async/await/then on demand if sanitize is required (only for user's content)
// window.DOMPurify = false;
import ("https://cdn.jsdelivr.net/npm/dompurify@2.2/dist/purify.min.js")

// replace {{key-field}} placeholders with matching json key-field
String.prototype.mustache = function(json){
  return (this.match(/\{\{[^\{]+\}\}/g) || []).reduce(function(p,v){
    var d = json[v.replace(/[{}]/g, "")];
    if (d === undefined) d = "";
    p = p.replace(v,d);
    return p;
  }, this);
}

// https://github.com/sindresorhus/github-markdown-css
document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend",
  "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.css\" />"
);


export default {
  template: `<!--  -->
<div class="markdown-body" v-html="compiledMarkdown"></div>`,

  props: {
    template: "Loading...",
    sanitize: false,
    json: {}
  },

  computed: {
    compiledMarkdown: function () {
      var local = this.template || "";
      local = local.mustache(this.json || {});
      local = window.marked(local);
      if (!this.sanitize) return local;
      else if (!DOMPurify) {
        Vue.loadScript("https://cdn.jsdelivr.net/npm/dompurify@2.2/dist/purify.min.js")
        .then(() => {
          return DOMPurify.sanitize(local);
        })
      }
      else return DOMPurify.sanitize(local);
    }
  },

}