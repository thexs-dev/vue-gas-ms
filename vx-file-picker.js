// copied from xFilePicker.gscript library picker-ui-js (version 3)

/** 
  var picker. object MUST be defined in full before loading this script file
  getOAuthToken() function should be called somewhere to initiate the picker process, in this library from a button in the picker-ui
  the script tag with src= https://apis.google.com/js/api.js?onload=onApiLoad MUST be included after loading this script file
*/

var pickerApiLoaded = false;

/**
* Loads the Google Picker API.
*/
function onApiLoad() {
  gapi.load('picker', {'callback': function() {
    pickerApiLoaded = true;
  }});
}

/**
* Gets the user's OAuth 2.0 access token from the server-side script so that
* it can be passed to Picker. This technique keeps Picker from needing to
* show its own authorization dialog, but is only possible if the OAuth scope
* that Picker needs is available in Apps Script. Otherwise, your Picker code
* will need to declare its own OAuth scopes.
*/
function getOAuthToken() {
  google.script.run
  .withSuccessHandler(createPicker)
  .withFailureHandler(showError)
  .getOAuthTokenForPicker();
}

/**
* Creates a Picker that can access the user's spreadsheets. This function
* uses advanced options to hide the Picker's left navigation panel and
* default title bar.
*
* @param {string} token An OAuth 2.0 access token that lets Picker access the
*     file type specified in the addView call.
*/
function createPicker(token) {
  if (pickerApiLoaded && token) {
    var view = new google.picker.DocsView(google.picker.ViewId[picker.ViewId]);
    view.setMode(google.picker.DocsViewMode.LIST);
    view.setQuery(picker.query);
    
    var thePicker = new google.picker.PickerBuilder()
    .addView(view)
    // Hide the navigation panel so that Picker fills more of the dialog.
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .enableFeature(google.picker.Feature.SUPPORT_DRIVES) // search/query stopped working on Aug.2019, this is a fix/workaround +> tested OK on Oct.16, but leave it here so far
    .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
    // Hide the title bar since an Apps Script dialog already has a title.
    .hideTitleBar()
    .setTitle(picker.title || "")
    .setOAuthToken(token)
    .setDeveloperKey(picker.DeveloperKey)
    .setAppId(picker.AppId)
    .setCallback(pickerCallback)
    .setOrigin(google.script.host.origin)
    // Instruct Picker to 'fill' the dialog.
    .setSize(picker.width - 20, picker.height *.5)
    .build();
    thePicker.setVisible(true);
  } else {
    showError('Unable to load the file picker.');
  }
}

/**
* A callback function that extracts the chosen document's metadata from the
* response object. For details on the response object, see
* https://developers.google.com/picker/docs/results
*
* @param {object} data The response object.
*/
function pickerCallback(data) {
  console.log(data);
  var result = document.getElementById('picker-result');
  var action = data[google.picker.Response.ACTION];
  if (action == google.picker.Action.PICKED) {
    for (var i=0; i<data[google.picker.Response.DOCUMENTS].length; i++) {
      var doc = data[google.picker.Response.DOCUMENTS][i];
      var id = doc[google.picker.Document.ID];
      var url = doc[google.picker.Document.URL];
      var title = doc[google.picker.Document.NAME];
      google.script.run
      .withSuccessHandler((r) => result.innerHTML += "Access granted to selected file: " + r.title + "<br>")
      .withFailureHandler((r) => result.innerHTML += "Error accessing selected file: " + r + "<br>")
      .testingAccessToFileForPicker(id);
    }
  } else if (action == google.picker.Action.CANCEL) {
    document.getElementById('picker-result').innerHTML += 'Select a file was canceled.<br>';
  }
}

/**
* Displays an error message within the #result element.
*
* @param {string} message The error message to display.
*/
function showError(message) {
  document.getElementById('picker-result').innerHTML = 'Error: ' + message;
}
