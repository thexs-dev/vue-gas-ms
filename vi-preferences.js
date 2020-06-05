
import VxSlider from "https://cdn.jsdelivr.net/gh/thexs-dev/vue-gas-ms@0.7.17/vx-slider.js"

Vue.component('vi-gas', {
  components: {
    VxSlider
  },

  template: `<!--  -->
<div>
  <v-app-bar app>
    <v-menu open-on-hover>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>
      <v-list xdense>
        <v-list-item-group>
          <v-list-item v-for="item in 'general,document,filters,map,icons,infowindow,listing,routing,layers'.split(',').concat(uidata.extendedAvailable ? 'extend' : [])" @click="selected = item">
            <v-list-item-title>{{ localize(item) }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>

    <v-toolbar-title>{{ localize(selected) }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">mdi-bug</v-icon>
    <v-btn icon @click="$open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="localize('my-review')">mdi-star</v-icon>
    </v-btn>
    <v-btn icon @click="$open('https://www.thexs.ca/xsmapping/mapping-sheets-add-on-preferences')">
      <v-icon :title="localize('help')">mdi-help-circle</v-icon>
    </v-btn>
    <v-btn icon @click="savePreferences" :disabled="working">
      <v-icon :title="localize('save')">mdi-content-save</v-icon>
    </v-btn>
  </v-app-bar>
  <v-content>
    <v-container pa-2 fluid>

      <div class="mt-3" v-show="selected === 'general'">
        <p>{{ localize('preferences-general-description') }}</p>
        <v-checkbox v-model="settings.beta" label="Beta version opt-in for this spreadsheet (Build the map when opt-in/out)"></v-checkbox>
        <div>The Beta program would give you access to new, advanced and experimental features when available, only in
          those Google Spreadsheets from where you enroll. You will keep using the stable version in any other
          Spreadsheet.</div>
      </div>

      <div v-show="selected === 'document'">
        <div v-if="uidata.unattendedAvailable">
          <v-layout>
            <v-checkbox class="flex xs11" v-model="settings.unattendedEnabled" @change="unattended" :disabled="!settings.lastBuildDate" label="Unattended BUILD (time-based trigger)"></v-checkbox>
            <v-select :items="uidata.unattendedFrequencies" suffix="hours" v-model="settings.unattendedFrequency" :label="localize('Frequency')" append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/how-to-update-my-map-automatically-when-the-data-changes')"></v-select>
          </v-layout>
          <div v-if="settings.lastBuildDate" class="body-2 mb-8 ml-4">(*) Unattended BUILD requires access to this Spreadsheet</div>
          <div v-else class="body-2 mb-8 ml-4">(*) BUILD a map first, to get access to the Unattended BUILD option</div>
          <!-- file picker dialog if required -->
          <div v-if="picker.required">
            <p hidden id='picker-result'></p>
          </div>
        </div>
        <vx-slider v-model="settings.dataHeadersRowIndex" :min="1" :max="10" :label="localize('label-data-headers-row-index')"></vx-slider>
        <v-checkbox v-model="settings.dataGetDisplayValues" v-if="settings.beta" label="Get data as displayed, in text format (experimental)"></v-checkbox>
        <v-text-field v-model="settings.locationTemplate" placeholder=" " append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/using-multiple-columns-for-geocoding-with-a-location-template')" :label="'%s {{}}'.format(localize('label-location-template'))"></v-text-field>
        <v-checkbox v-model="settings.useEnglishLocale" :label="'Use English language instead of this G Sheets locale (%s)'.format(settings.spreadsheetLocale)"></v-checkbox>
      </div>

      <div v-show="selected === 'filters'">
        <vx-slider v-model="settings.filtersQty" :disabled="!premium" :min="0" :max="uidata.filtersMaxQty" :label="'%s (%s)'.format(localize('label-filters-qty'), localize('premium'))"></vx-slider>
        <v-checkbox class="ml-3" v-model="settings.filtersTag" :label="localize('label-filters-tag')"></v-checkbox>
        <v-checkbox class="ml-3" v-model="settings.filtersDisplay" :label="localize('label-filters-display')"></v-checkbox>
        <v-text-field class="ml-3" v-model="settings.filtersSplit" placeholder=" " append-icon="mdi-eye" @click:append="settings.filtersSplit = uidata.filtersSplit" :label="localize('label-filters-split')"></v-text-field>
        <v-checkbox v-model="settings.hideFilters" :label="localize('label-hide-filters-on-load')"></v-checkbox>
      </div>

      <div v-show="selected === 'map'">
        <v-layout>
          <v-checkbox class="flex grow mr-3" v-model="settings.showPlace" :disabled="!premium" :label="'%s (%s)'.format(localize('label-find-place'), localize('premium'))"></v-checkbox>
          <v-text-field class="mr-3" v-model="settings.placeRadius" :disabled="!premium" type="number" min="0" :label="localize('label-place-radius')"></v-text-field>
          <v-select class="mr-3" :items="uidata.placeUnits" v-model="settings.placeUnit" :disabled="!premium" :label="localize('label-place-unit')"></v-select>
          <v-checkbox v-model="settings.placeFilter" :disabled="!premium" :label="localize('filter')"></v-checkbox>
        </v-layout>
        <v-layout>
          <v-text-field class="mr-3" v-model="settings.pageTitle" :disabled="!premium" :label="'%s (%s)'.format(localize('label-page-title'), localize('premium'))"></v-text-field>
          <v-checkbox class="flex shrink" v-model="settings.mapCenterOnClick" :label="localize('label-center-on-click')">
        </v-layout>
        <v-layout>
          <v-text-field class="flex xs11 mr-3" v-model="settings.styledMap" placeholder=" " append-icon="mdi-eye" @click:append="settings.styledMap = uidata.styledMap" append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/styled-google-map-on-the-mapping-web-app')" :label="localize('label-styled-map')"></v-text-field>
          <v-checkbox v-model="settings.styledMapDefault" :label="localize('default')"></v-checkbox>
          <!-- <v-select :items="uidata.mapTypeIds" v-model="settings.styledMapDefault" :label="localize('default')"></v-select> -->
        </v-layout>
        <!-- mapsApiKey might be required even for non premium/custom plans -->
        <div v-if="uidata.mapsApiKeyAvailable">
          <v-layout>
            <v-text-field class="flex xs8" v-model="settings.mapsApiKey" :label="localize('Maps Api key (for the Mapping web app)')" placeholder=" "></v-text-field>
            <v-text-field class="ml-3" v-model="settings.mapsPageSuffix" prefix="-" :label="localize('Suffix') + ' (mapping-%s.html)'.format(settings.mapsPageSuffix)" placeholder=" " append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/how-to-get-and-use-my-own-maps-api-key')"></v-text-field>
          </v-layout>
        </div>
      </div>

      <div v-show="selected === 'icons'">
        <v-layout class="mt-3">
          <v-select dense class="mr-3" :items="uidata.icons" v-model="settings.iconSet" :disabled="!premium" :label="'%s (%s)'.format(localize('label-icon-set'), localize('premium'))">
            <template slot="selection" slot-scope="data">
              <img height="24" width="auto" :src="iconUrl(data.item)"></img>
              <div class='ml-3'> {{ data.item }}</div>
            </template>
            <template slot="item" slot-scope="data">
              <img height="24" width="auto" :src="iconUrl(data.item)"></img>
              <div class='ml-3'> {{ data.item }}</div>
            </template>
          </v-select>
          <v-checkbox v-model="settings.markerDraggable" :label="localize('Draggable')" class="mr-4"></v-checkbox>
          <v-checkbox v-model="settings.markerSpider" :label="localize('Overlapping')"></v-checkbox>
        </v-layout>
        <v-layout>
          <v-checkbox class="ml-3 mr-4" v-model="settings.markerCluster" :label="localize('Clusters')"></v-checkbox>
          <vx-slider class="mr-2" v-model="settings.markerClusterMinimumClusterSize" :min="2" :max="20" :label="localize('Size')"></vx-slider>
          <vx-slider class="mr-2" v-model="settings.markerClusterMaxZoom" :min="10" :max="16" :label="localize('Zoom')"></vx-slider>
          <v-checkbox v-model="settings.markerClusterToggle" :label="localize('Toggle')"></v-checkbox>
        </v-layout>
        <v-text-field v-model="settings.titleTemplate" placeholder=" " append-icon="mdi-eye" @click:append="settings.titleTemplate = uidata.titleTemplate" :label="'%s {{}}'.format(localize('label-icon-title'))"></v-text-field>
      </div>

      <div v-show="selected === 'infowindow'">
        <v-text-field v-model="settings.headers" placeholder=" " append-icon="mdi-eye" @click:append="settings.headers = uidata.headers" :label="localize('label-headers')"></v-text-field>
        <v-layout>
          <v-checkbox v-model="settings.infowindowDirections" :label="localize('Add a Directions link')" class="pr-4"></v-checkbox>
          <v-checkbox v-model="settings.infowindowZoomIn" :label="localize('Add a Zoom in link')"></v-checkbox>
        </v-layout>

        <v-layout v-if="uidata.map4vue">
          <vx-slider class="mr-2" v-model="settings.infowindowWidth" :min="200" :max="400" :label="localize('Width')"></vx-slider>
          <vx-slider class="mr-2" v-model="settings.infowindowHeight" :min="200" :max="420" :label="localize('Height')"></vx-slider>
          <v-checkbox v-model="settings.infowindowHeightLock" :label="localize('Lock')"></v-checkbox>
        </v-layout>

      </div>

      <div v-show="selected === 'listing'">
        <v-text-field v-model="settings.listingTemplate" placeholder=" " append-icon="mdi-eye" @click:append="settings.listingTemplate = uidata.listingTemplate" :label="'%s {{}}'.format(localize('label-listing'))"></v-text-field>
        <v-checkbox v-model="settings.listingOpenInfowindow" :label="localize('Click an anchor (✜) to open the item Infowindow, if not within a cluster')"></v-checkbox>
        <v-layout>
          <v-checkbox v-model="settings.listingExportNewTab" :label="localize('Export Listing to a new tab')" class="mr-4"></v-checkbox>
          <v-checkbox v-model="settings.listingExportCsv" :label="localize('Export Listing as a CSV file')"></v-checkbox>
        </v-layout>
        <v-checkbox class="ml-3" v-model="settings.listingExportNewTabDirections" :label="localize('View Directions on Google Maps')"></v-checkbox>
      </div>

      <div v-show="selected === 'routing'">
        <v-layout>
          <v-checkbox v-model="settings.routingEnabled" :disabled="!premium" append-icon="mdi-help-circle" @click:append="$open('https://www.thexs.ca/xsmapping/optimal-routing')" :label="'%s (%s)'.format(localize('label-enable-routing'), localize('premium'))"></v-checkbox>
          <v-checkbox v-show="settings.routingEnabled" v-model="settings.routingF2LEnabled" :label="localize('label-F2L')" class="ml-4"></v-checkbox>
          <v-checkbox v-show="settings.routingEnabled && uidata.map4vue" v-model="settings.routingAsIsEnabled" :label="localize('As-Is')" class="ml-4"></v-checkbox>
        </v-layout>
        <div v-show="settings.routingEnabled">
          <v-layout>
            <v-checkbox class="flex grow mr-3" v-model="settings.routingHbEnabled" :label="localize('label-hb')"></v-checkbox>
            <v-select class="mr-3" :items="uidata.routingHbOptions" v-model="settings.routingHbOption" :disabled="!settings.routingHbEnabled" :label="localize('label-hb-option')"></v-select>
            <v-checkbox class="mr-3" v-model="settings.routingHbDraggable" :disabled="!settings.routingHbEnabled" :label="localize('Draggable')"></v-checkbox>
            <v-checkbox v-model="settings.routingHbAlwaysVisible" :disabled="!settings.routingHbEnabled" :label="localize('Visible')"></v-checkbox>
          </v-layout>
          <v-layout>
            <v-text-field class="ml-3" v-model="settings.routingHbAddress" :disabled="!settings.routingHbEnabled" :label="localize('label-hb-address')" placeholder=" "></v-text-field>
            <v-btn icon @click="getHbLatLng" :disabled="!settings.routingHbEnabled || working">
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
            <v-text-field class="" v-model="settings.routingHbLatLng" :disabled="!settings.routingHbEnabled" :label="localize('label-hb-lat-lng')" placeholder=" "></v-text-field>
          </v-layout>
          <v-layout>
            <v-select class="mr-3" :items="uidata.routingTravelModes" v-model="settings.routingTravelMode" :label="localize('label-travel-mode')"></v-select>
            <v-select :items="uidata.routingUnitSystems" v-model="settings.routingUnitSystem" :label="localize('label-unit-system')"></v-select>
          </v-layout>
          <v-layout>
            <span class="mt-4 mr-3">{{localize('avoid')}}:</span>
            <v-checkbox class="mr-3" v-model="settings.routingAvoidHighways" :label="localize('label-highways')"></v-checkbox>
            <v-checkbox class="mr-3" v-model="settings.routingAvoidTolls" :label="localize('label-tolls')"></v-checkbox>
            <v-checkbox v-model="settings.routingAvoidFerries" :label="localize('label-ferries')"></v-checkbox>
          </v-layout>
          <v-checkbox class="mt-0" v-model="settings.routingDirectionPanelEnabled" :label="localize('label-show-directions')"></v-checkbox>
          <v-layout>
            <v-checkbox class="mr-3 ml-3 mt-0" v-model="settings.routingSuppressMarkers" :label="localize('label-no-markers')"></v-checkbox>
            <v-checkbox class="mr-3 mt-0" v-model="settings.routingSuppressInfoWindows" :label="localize('label-no-infowindows')"></v-checkbox>
            <v-checkbox class="mr-3 mt-0" v-model="settings.routingShowDirectionsUnderListing" :label="localize('label-show-under-listing')"></v-checkbox>
          </v-layout>
        </div>
      </div>

      <div v-show="selected === 'layers'">
        <v-layout>
          <v-checkbox class="mr-3" v-model="settings.layers.circles.enabled" :label="localize('circles')"></v-checkbox>
          <v-select class="mr-3" :items="uidata.headersAll" v-model="settings.layers.circles.radiusHeader" :disabled="!settings.layers.circles.enabled" :label="localize('label-place-radius')"></v-select>
          <v-select class="mr-3" :items="uidata.placeUnits" v-model="settings.layers.circles.radiusUnit" :disabled="!settings.layers.circles.enabled" :label="localize('label-place-unit')"></v-select>
          <v-text-field class="mr-3" v-model="settings.layers.circles.fillOpacity" type="number" step="0.01" min="0" max="1" :disabled="!settings.layers.circles.enabled" :label="localize('label-fill-opacity')"></v-text-field>
          <v-icon @click="$open('https://www.thexs.ca/xsmapping/adding-custom-layers')">mdi-help-circle</v-icon>
        </v-layout>
        <v-layout>
          <v-checkbox class="mr-3" v-model="settings.layers.heatmap.enabled" :label="localize('heatmap')"></v-checkbox>
          <v-select class="mr-3" :items="uidata.headersAllOptional" v-model="settings.layers.heatmap.weightHeader" :disabled="!settings.layers.heatmap.enabled" :label="'%s (%s)'.format(localize('label-heatmap-weight'), localize('optional'))"></v-select>
          <v-text-field class="mr-3" v-model="settings.layers.heatmap.fillOpacity" type="number" step="0.01" min="0" max="1" :disabled="!settings.layers.heatmap.enabled" :label="localize('label-fill-opacity')"></v-text-field>
          <v-icon @click="$open('https://www.thexs.ca/xsmapping/adding-custom-layers')">mdi-help-circle</v-icon>
        </v-layout>
        <v-layout v-if="uidata.layerGeoJSONAvailable || itsme">
          <v-checkbox class="mr-3 text-no-wrap" v-model="settings.layers.geojson.enabled" :label="localize('GeoJSON')"></v-checkbox>
          <v-text-field class="mr-3" v-model="settings.layers.geojson.url" :disabled="!settings.layers.geojson.enabled" :label="localize('File URL')" placeholder=" "></v-text-field>
          <v-text-field class="mr-3" v-model="settings.layers.geojson.fillOpacity" type="number" step="0.01" min="0" max="1" :disabled="!settings.layers.geojson.enabled" :label="localize('label-fill-opacity')"></v-text-field>
          <v-icon @click="$open('https://www.thexs.ca/xsmapping/adding-custom-layers')">mdi-help-circle</v-icon>
        </v-layout>
        <v-layout v-if="uidata.layerKmlAvailable || itsme">
          <v-checkbox class="mr-3 text-no-wrap" v-model="settings.layers.kml.enabled" :label="localize('Kml/Kmz')"></v-checkbox>
          <v-text-field class="mr-3" v-model="settings.layers.kml.url" :disabled="!settings.layers.kml.enabled" :label="localize('File URL')" placeholder=" "></v-text-field>
          <v-checkbox class="mr-3" v-model="settings.layers.kml.viewport" :disabled="!settings.layers.kml.enabled" :label="localize('Viewport')"></v-checkbox>
          <v-icon @click="$open('https://www.thexs.ca/xsmapping/adding-custom-layers')">mdi-help-circle</v-icon>
        </v-layout>
      </div>

      <div class="mt-3" v-show="selected === 'extend'">
        <p>Coming soon [experimental] for the Extended Custom Plan</p>
        <!-- Geocoding batch (mapsApiKeyGeo/Batch),  -->

      </div>

    </v-container>
  </v-content>
</div>`,

  data() {
    if (!window.google || !window.google.script) {
      data.uidata = {"map4vue":true, "headers":"Name,Category,Address,Company,Status,Range,More Info,Picture,Notes,Latitude,Longitude,Extras","headersAll":["Name","Category","Address","Company","Status","Range","More Info","Picture","Notes","Latitude","Longitude","Extras"],"headersAllOptional":["","Name","Category","Address","Company","Status","Range","More Info","Picture","Notes","Latitude","Longitude","Extras"],"filtersMaxQty":10,"titleTemplate":"{{Name}} ({{Category}})\\n {{Address}}","listingTemplate":"{{Name}}\\n {{Address}}","routingHbOptions":["Roundtrip","Start","End"],"routingTravelModes":["BICYCLING","DRIVING","WALKING"],"routingUnitSystems":["IMPERIAL","METRIC"],"placeUnits":["km","mi","m","ft"],"filtersSplit":",","icons":["locas","pins","flags","dots-10","triangles-10","mdi/pin","mdi/place","mdi/truck","mdi/water"],"styledMap":"","mapTypeIds":["roadmap","satellite","hybrid","terrain","styled"],"mapsApiKeyAvailable":true,"alpha":true,"unattendedAvailable":true,"unattendedFrequencies":["1","2","4","6","8","12"]};
      data.picker = {"ViewId":"SPREADSHEETS","itsme":false,"showModeDialog":"showModalDialog","DeveloperKey":"DeveloperKey","AppId":"AppId","width":600,"height":425,"title":"Select current Spreadsheet from the list","query":"MS Testing as None"};
      data.settings = {"headers":"","beta":false,"dataHeadersRowIndex":1,"dataGetDisplayValues":false,"spreadsheetLocale":"en_US","infowindowDirections":true,"infowindowZoomIn":true,infowindowWidth:250,infowindowHeight:300,infowindowHeightLock:true,"titleTemplate":"{{Name}} ({{Category}})\\n {{Address}}","listingTemplate":"{{Name}} ({{Range}})\\n {{Address}}","listingOpenInfowindow":true,"listingExportNewTab":true,"iconSet":"mdi/pin","pageTitle":"Mapping as None","routingEnabled":true,"routingF2LEnabled":true,"routingHbEnabled":true,"routingHbOption":"Roundtrip","routingHbAddress":"CN Tower","routingHbLatLng":"43.6425662,-79.3870568","routingHbDraggable":true,"routingHbAlwaysVisible":true,"routingTravelMode":"DRIVING","routingUnitSystem":"METRIC","routingDirectionPanelEnabled":true,"routingSuppressMarkers":true,"showPlace":true,"placeRadius":10,"placeFilter":true,"placeUnit":"km","mapCenterOnClick":false,"filtersQty":1,"filtersTag":true,"filtersSplit":"","styledMap":"","styledMapDefault":false,"markerCluster":true,"markerClusterMinimumClusterSize":5,"markerClusterMaxZoom":15,"markerSpider":true,"mapsApiKey":"","mapsPageSuffix":"","lastBuildDate":"12345678","unattendedEnabled":false,"unattendedFrequency":"8","layers":{"circles":{"radiusUnit":"km","fillOpacity":"0.1","enabled":false,"radiusHeader":"Range"},"heatmap":{"enabled":false,"weightHeader":"","fillOpacity":0.6},"geojson":{"enabled":false,"fillOpacity":0.1},"kml":{"enabled":false,"viewport":true}}};
      picker = data.picker;
    }
    data.working = false;
    return data
  },

  async mounted() {
    if (!window.google || !window.google.script) Vue.loadScript("./vx-google.script.js");

    // await Vue.loadScript("./vx-file-picker.js");
    await Vue.loadScript("https://cdn.jsdelivr.net/gh/thexs-dev/vue-gas-ms@0.7.5/vx-file-picker.js");
    Vue.loadScript("https://apis.google.com/js/api.js?onload=onApiLoad");
  },

  computed: {},

  methods: {
    localize(key) { return this.localeResources[key] || key },

    iconUrl: function (iconSet) { return "https://thexs-host.firebaseapp.com/icons/%s/Blue.svg".format(iconSet) },

    getHbLatLng() {
      this.working = true;
      google.script.run
        .withFailureHandler((e) => {
          $gsdlog(e);
          this.working = false;
        })
        .withSuccessHandler((result) => {
          this.settings.routingHbLatLng = result;
          this.working = false;
        })
        .getHomebaseLatLngFromAddress(this.settings.routingHbAddress);
    },

    unattended(e) {
      if (this.settings.unattendedEnabled) {
        this.working = true;
        this.$gae("unattended");
        google.script.run
        .withFailureHandler((e) => {
          $gsdlog(e);
          this.working = false;
        })
        .withSuccessHandler((r) => {
          this.working = false;
          if (!r) {
            this.picker.required = true;
            window.setTimeout(() => this.settings.unattendedEnabled = false, 1000);
            getOAuthToken();
          }
        })
        .checkGetAccessToCurrentDoc();
      }
    },

    savePreferences() {
      this.working = true;
      if (this.itsme) console.log(this.settings);
      this.$gae("save");
      google.script.run
        .withFailureHandler((e) => {
          $gsdlog(e);
          this.working = false;
          google.script.host.close();
        })
        .withSuccessHandler((r) => {
          this.working = false;
          google.script.host.close();
        })
        .savePreferences(this.settings);
    },

    test() {
      console.log(this.settings, this.uidata);
      console.log(this.settings.headers);
      console.log(this.uidata.headers);
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
  vuetify: new Vuetify(),
});