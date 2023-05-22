const VxAnalytics = {
  install(Vue, options) {
    Vue.use(LoadScript);
    Vue.loadScript("https://www.googletagmanager.com/gtag/js?id=" + options.gaid)
      .then(() => {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', options.gaid, {
          'page_title': options.title,
          'page_path': options.path,
          'user_id': options.uid
        });
        Vue.prototype.$gae = function (event) { gtag('event', event, { 'event_category': options.category }); }
        Vue.prototype.$gap = function (title, path) { gtag('config', options.gaid, { 'page_title': title, 'page_path': path }); }
      })
      .catch(() => { Vue.prototype.$gae = () => null });
  }
};