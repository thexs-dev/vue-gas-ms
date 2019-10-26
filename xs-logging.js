/* client-side version of Log.gs
 mimicking UrlFetchApp.fetch, but using JS fetch instead - just add ? to the Url and the serialized payload as key=value&
 source code within xsLibTrack library (logging.gs)
 published as //thexs.rad3.ca/assets/xs-logging.js for use on xm-app (Mapping web app)
*/
var cLogClient = function(app, from, context) {
  var self = this;
  var app = app;
  var from = from;
  var env = "".concat(getBrowser(), " ", getOS());
  var context = context ? context.concat(" - ", env) : env;
  var formId = "1tI5DlWCc9QIboxBr_vCHMWNEUR7QikurqmJF0ezvjJA"; // default, general log, fixed entry_s below
  var logFormUrl = "https://docs.google.com/a/thexs.ca/forms/d/" + formId + "/formResponse?";
  self.log = function (message, opt_functionName, opcMessage) {
    var functionName = opt_functionName ? opt_functionName : null;
    // {"message":"\"y\" is not defined.","name":"ReferenceError","fileName":"Server","lineNumber":153,"stack":"\tat Server:153 (buildJsonFile)\n"}
    if (message.stack) message += message.stack.replace(/\n/g,"").replace(/\t/g," | ");
    try {
      var payload = { // App	From	Function	Message	Arguments
        entry_2085300 : app,
        entry_1285740863 : from,
        entry_2070870895 : functionName,
        entry_1899992330 : message,
        entry_227589072: context,
        submit: "Submit"
      };
      var options = { "method" : "post", mode: 'no-cors' };
      var theUrl = logFormUrl;
      Object.keys(payload).forEach(function(k){ theUrl = theUrl.concat(k, "=", payload[k], "&"); });
      fetch(theUrl, options);
      return opcMessage || message;
    } catch (e) {
      // Do nothing.
    }
  }
  self.Browser = getBrowser();
  self.OS = getOS();
  self.isEmbedded = isEmbedded();
}
function isEmbedded(){
  return window !== window.parent;
}
// TODO: check this https://github.com/Ahmdrza/detect-browser/blob/master/detect-browser.js AND https://github.com/lancedikson/bowser
function getBrowser(){
  // from https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator#Example_1_Browser_detect_and_return_a_string
  // modified to return single words
  var sBrowser, sUsrAg = navigator.userAgent;
  // The order matters here, and this may report false positives for unlisted browsers.
  if (sUsrAg.indexOf("Firefox") > -1) {
    sBrowser = "Firefox";
    // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
  } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
    sBrowser = "Opera";
    //"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
  } else if (sUsrAg.indexOf("Trident") > -1) {
    sBrowser = "IE";
    // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
  } else if (sUsrAg.indexOf("Edge") > -1) {
    sBrowser = "Edge";
    // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
  } else if (sUsrAg.indexOf("Chrome") > -1) {
    sBrowser = "Chrome";
    // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
  } else if (sUsrAg.indexOf("Safari") > -1) {
    sBrowser = "Safari";
    // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
  } else {
    sBrowser = "Unknown";
  }
  return sBrowser;
}
function getOS() {
  // from https://stackoverflow.com/questions/38241480/detect-macos-ios-windows-android-and-linux-os-with-js
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;
  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'MacOS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }
  if (os === null) os = "Unknown";
  return os;
}