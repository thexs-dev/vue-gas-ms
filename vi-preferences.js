// import VxSlider from "path/to/vx-slider.js"

const VxSlider = {
  template: `<!--  -->
<v-layout row>
  <v-slider class="mr-3" :value="value" :min="min" :max="max" :label="label" @input="$emit('input', $event)">
  </v-slider>
  <v-text-field :value="value" type="number" :min="min" :max="max" @input="$emit('input', $event)">
  </v-text-field>
</v-layout>`,

  props: {
    message: String,
    min: String,
    max: String,
    label: String,
    value: Number
  }
}

Vue.component('vi-gas', {
  components: {
    VxSlider
  },

  template: `<!--  -->
<div>
  <v-toolbar app>
    <v-menu open-on-hover>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>menu</v-icon>
        </v-btn>
      </template>

      <v-list xdense>
        <v-list-tile style="height:40px;"
          v-for="item in 'general,document,filters,map,infowindow,listing,routing,layers,extend'.split(',')"
          @click="selected = item">
          <v-list-tile-content>{{ localize(item) }}</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-toolbar-title>{{ localize(selected) }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-icon v-if="itsme" @click="test">bug_report</v-icon>
    <v-btn icon @click="window.open('http://addon.thexs.ca/mapping-sheets'); $gae('review');">
      <v-icon :title="localize('my-review')">star_half</v-icon>
    </v-btn>
    <v-btn icon @click="window.open('https://www.thexs.ca/posts/how-to-share-my-map')">
      <v-icon :title="localize('help')">help</v-icon>
    </v-btn>
    <v-btn icon @click="window.open('https://www.thexs.ca/posts/how-to-share-my-map')">
      <v-icon :title="localize('save')">save</v-icon>
    </v-btn>
  </v-toolbar>
  <v-content>
    <v-container pa-2 fluid>

      <div class="mt-3" v-show="selected === 'general'">
        <p>{{ localize('preferences-general-description') }}</p>
        <v-checkbox v-model="settings.beta"
          label="Beta version opt-in for this spreadsheet (Build the map when opt-in/out)"></v-checkbox>
        <div>The Beta program would give you access to new, advanced and experimental features when available, only in
          those Google Spreadsheets from where you enroll. You will keep using the stable version in any other
          Spreadsheet.</div>
      </div>

      <div v-show="selected === 'document'">
        <vx-slider v-model="settings.dataHeadersRowIndex" :min="1" :max="10"
          :label="localize('label-data-headers-row-index')"></vx-slider>
        <v-text-field v-model="settings.locationTemplate" placeholder=" " append-outer-icon="help"
          @click:append-outer="window.open('https://www.thexs.ca/posts/using-multiple-columns-for-geocoding-with-a-location-template')"
          :label="localize('label-location-template')">
        </v-text-field>
        <v-checkbox v-model="settings.useEnglishLocale"
          :label="'Use English language instead of this G Sheets locale (%s)'.format(settings.spreadsheetLocale)">
        </v-checkbox>
      </div>

      <div v-show="selected === 'filters'">
        <v-layout row>
          <v-checkbox class="flex grow mr-3"
            :label="'%s (%s)'.format(localize('label-find-place'), localize('premium'))" v-model="settings.showPlace"
            :disabled="!premium"></v-checkbox>
          <v-text-field class="mr-3" v-model="settings.placeRadius" :disabled="!premium" type="number" min="0"
            :label="localize('label-place-radius')">
          </v-text-field>
          <v-select class="mr-3" :items="uidata.placeUnits" v-model="settings.placeUnit" :disabled="!premium"
            :label="localize('label-place-unit')">
          </v-select>
          <v-checkbox :label="localize('filter')" v-model="settings.placeFilter" :disabled="!premium"></v-checkbox>
        </v-layout>
        <vx-slider v-model="settings.filtersQty" :min="0" :max="uidata.filtersMaxQty"
          :label="'%s (%s)'.format(localize('label-filters-qty'), localize('premium'))"></vx-slider>
        <v-checkbox class="ml-3" v-model="settings.filtersTag" :label="localize('label-filters-tag')"></v-checkbox>
        <v-checkbox class="ml-3" v-model="settings.filtersDisplay" :label="localize('label-filters-display')">
        </v-checkbox>
        <v-text-field class="ml-3" v-model="settings.filtersSplit" placeholder=" " append-icon="visibility"
          @click:append="settings.filtersSplit = uidata.filtersSplit" :label="localize('label-filters-split')">
        </v-text-field>
        <v-checkbox v-model="settings.hideFilters" :label="localize('label-hide-filters-on-load')"></v-checkbox>
      </div>

      <div v-show="selected === 'map'">
        <v-layout row>
          <v-text-field class="mr-3" v-model="settings.pageTitle" :disabled="!premium"
            :label="'%s (%s)'.format(localize('label-page-title'), localize('premium'))"></v-text-field>
          <v-checkbox class="flex shrink" v-model="settings.mapCenterOnClick"
            :label="localize('label-center-on-click')">
        </v-layout>
        <v-layout row>
          <v-select dense class="mr-3" :items="uidata.icons" v-model="settings.iconSet" :disabled="!premium"
            :label="'%s (%s)'.format(localize('label-icon-set'), localize('premium'))">
            <template slot="selection" slot-scope="data">
              <img height="24" width="auto" :src="iconUrl(data.item)"></img>
              <div class='ml-3'> {{ data.item }}</div>
            </template>
            <template slot="item" slot-scope="data">
              <img height="24" width="auto" :src="iconUrl(data.item)"></img>
              <div class='ml-3'> {{ data.item }}</div>
            </template>
          </v-select>
          <v-checkbox v-model="settings.markerDraggable" :label="localize('Draggable')"></v-checkbox>
          <v-checkbox v-model="settings.markerSpider" :label="localize('Overlapping')"></v-checkbox>
        </v-layout>
        <v-layout row>
          <v-checkbox class="ml-3 mr-4" v-model="settings.markerCluster" :label="localize('Clusters')"></v-checkbox>
          <vx-slider class="mr-2" v-model="settings.markerClusterMinimumClusterSize" :min="2" :max="20"
            :label="localize('Size')"></vx-slider>
          <vx-slider class="mr-2" v-model="settings.markerClusterMaxZoom" :min="10" :max="16" :label="localize('Zoom')">
          </vx-slider>
          <v-checkbox v-model="settings.markerClusterToggle" :label="localize('Toggle')"></v-checkbox>
        </v-layout>
        <v-text-field v-model="settings.titleTemplate" placeholder=" " append-icon="visibility"
          @click:append="settings.titleTemplate = uidata.titleTemplate"
          :label="'%s {{}}'.format(localize('label-icon-title'))">
        </v-text-field>
        <v-layout row>
          <v-text-field class="flex xs11 mr-3" v-model="settings.styledMap" placeholder=" " append-icon="visibility"
            @click:append="settings.styledMap = uidata.styledMap" append-outer-icon="help"
            @click:append-outer="window.open('https://www.thexs.ca/posts/styled-google-map-on-the-mapping-web-app')"
            :label="localize('label-styled-map')">
          </v-text-field>
          <v-checkbox v-model="settings.styledMapDefault" :label="localize('default')"></v-checkbox>
          <!-- <v-select :items="uidata.mapTypeIds"
          v-model="settings.styledMapDefault" :label="localize('default')"></v-select>
        </v-layout> -->
      </div>

      <div v-show="selected === 'infowindow'">
        <v-text-field v-model="settings.headers" placeholder=" " append-icon="visibility"
          @click:append="settings.headers = uidata.headers" :label="localize('label-headers')">
        </v-text-field>
        <v-layout row>
          <v-checkbox v-model="settings.infowindowDirections" :label="localize('Add a Directions link')"></v-checkbox>
          <v-checkbox v-model="settings.infowindowZoomIn" :label="localize('Add a Zoom in link')"></v-checkbox>
        </v-layout>
      </div>

      <div v-show="selected === 'listing'">
        <v-text-field v-model="settings.listingTemplate" placeholder=" " append-icon="visibility"
          @click:append="settings.listingTemplate = uidata.listingTemplate"
          :label="'%s {{}}'.format(localize('label-listing'))">
        </v-text-field>
        <v-checkbox v-model="settings.listingOpenInfowindow"
          :label="localize('Click an anchor (✜) to open the item Infowindow, if not within a cluster')"></v-checkbox>
        <v-layout row>
          <v-checkbox v-model="settings.listingExportNewTab" :label="localize('Export Listing to a new tab')"></v-checkbox>
          <v-checkbox v-model="settings.listingExportCsv" :label="localize('Export Listing as a CSV file')"></v-checkbox>
        </v-layout>
        <v-checkbox class="ml-3" v-model="settings.listingExportNewTabDirections" :label="localize('View Directions on Google Maps')"></v-checkbox>
      </div>

      <div v-show="selected === 'routing'">
      </div>

      <div v-show="selected === 'layers'">
      </div>

      <div v-show="selected === 'extend'">
      </div>

    </v-container>
  </v-content>
</div>`,

  data() {
    if (!window.google || !window.google.script) {
      data.uidata = { "itsme": true, "headers": "Name,Category,Address,Company,Status,Range,Due on,Days since Due,More Info,Picture,Notes,Latitude,Longitude,Buffer", "headersAll": ["Name", "Category", "Address", "Company", "Status", "Range", "Due on", "Days since Due", "More Info", "Picture", "Notes", "Latitude", "Longitude", "Buffer"], "headersAllOptional": ["", "Name", "Category", "Address", "Company", "Status", "Range", "Due on", "Days since Due", "More Info", "Picture", "Notes", "Latitude", "Longitude", "Buffer"], "filtersMaxQty": 3, "titleTemplate": "{{Name}} ({{Category}})\\n {{Address}}", "listingTemplate": "{{Name}}\\n {{Address}}", "routingHbOptions": ["Roundtrip", "Start", "End"], "routingTravelModes": ["BICYCLING", "DRIVING", "WALKING"], "routingUnitSystems": ["IMPERIAL", "METRIC"], "placeUnits": ["km", "mi", "m", "ft"], "filtersSplit": ",", "icons": ["locas", "pins", "flags", "dots-10", "triangles-10", "mdi/pin", "mdi/place", "mdi/truck", "mdi/water"], "styledMap": '[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}]', "mapTypeIds": ["roadmap", "satellite", "hybrid", "terrain", "styled"] };
      data.settings = { "beta": true, "dataHeadersRowIndex": 1, "spreadsheetLocale": "en_US", "useEnglishLocale": true, "headers": "", "infowindowDirections": true, "infowindowZoomIn": true, "listingTemplate": "{{Name}}\\n {{Address}}\\n {{Notes}}", "listingOpenInfowindow": true, "listingExportCsv": false, "listingExportNewTab": true, "listingExportNewTabDirections": true, "iconSet": "locas", "pageTitle": "Mapping by theXS", "hideFilters": true, "routingEnabled": true, "routingF2LEnabled": true, "routingHbEnabled": true, "routingHbOption": "Roundtrip", "routingHbAddress": "Main Office", "routingHbLatLng": "43.7734535,-79.50186839", "routingHbDraggable": true, "routingHbAlwaysVisible": true, "routingTravelMode": "DRIVING", "routingUnitSystem": "METRIC", "routingAvoidHighways": false, "routingAvoidTolls": false, "routingDirectionPanelEnabled": true, "routingSuppressMarkers": true, "routingShowDirectionsUnderListing": true, "showPlace": true, "placeRadius": 10, "placeFilter": true, "placeUnit": "km", "mapCenterOnClick": true, "filtersQty": 1, "filtersTag": true, "filtersDisplay": false, "filtersSplit": ",", "styledMap": "", "styledMapDefault": true, "markerDraggable": true, "markerCluster": true, "markerClusterMinimumClusterSize": 3, "markerClusterMaxZoom": 15, "markerClusterToggle": true, "markerSpider": true, "titleTemplate": "", "layers": { "circles": { "radiusUnit": "km", "fillOpacity": "0.15", "enabled": false, "radiusHeader": "Range" }, "heatmap": { "enabled": false, "weightHeader": "Range", "fillOpacity": "0.3" } } };
    }
    return data
  },

  mounted() {
    if (!window.google || !window.google.script) Vue.loadScript("./vx-google.script.js");
  },

  computed: {},

  methods: {
    localize(key) { return this.localeResources[key] || key },

    iconUrl: function (iconSet) { return "https://thexs-host.firebaseapp.com/icons/%s/Blue.svg".format(iconSet) },
    test() {
      console.log(this.settings.markerClusterMinimumClusterSize);
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
});