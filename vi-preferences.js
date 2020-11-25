import VxSlider from "https://cdn.jsdelivr.net/gh/thexs-dev/vue-gas-ms@0.7.24/vx-slider.js"
import VxMarked from 'https://cdn.jsdelivr.net/gh/thexs-dev/vue-gas-ms@0.7.24/vx-marked.js';
// import VxMarked from './vx-marked.js';

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		}
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	}
}

Vue.component('vi-gas', {
  components: {
    VxSlider, VxMarked
  },

  template: /*html*/`<!--  -->
<div>
  <v-app-bar app>
    <v-menu open-on-hover>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>
      <v-list>
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
        <v-layout align-center>
          <v-checkbox v-model="settings.beta" label="Beta (β) version opt-in" hide-details class="mr-4"></v-checkbox>
          <v-checkbox v-model="settings.map4vue" :disabled="!uidata.map4vueAvailable" label="Mapping 4.0 (α+) opt-in" hide-details></v-checkbox>
          <div v-if="!uidata.map4vueAvailable" class="ml-2 mt-4"><a :href="'https://docs.google.com/forms/d/e/1FAIpQLSdnZxQP7-3q4OpVg3Si4rAKaXAy1lb_G_CKqp6lAZloLBibKw/viewform?usp=pp_url&entry.1705383554=%s&entry.1564022075=Question&entry.272808407=Mapping+4.0+opt-in+request+access'.format(user)">[request access]</a></div>
        </v-layout>
        <v-text-field v-if="uidata.footerInfoAboutAvailable || extended" v-model="settings.footerInfoAbout" class="mt-4" placeholder=" " append-icon="mdi-eye" 
          @click:append="settings.footerInfoAbout = 'Powered by [Mapping Sheets](https://www.thexs.ca/xsmapping)'" :label="'%s (∗)'.format(localize('About information (Markdown)'))"></v-text-field>
        <v-checkbox v-if="settings.spreadsheetLocale.indexOf('en') !== 0" v-model="settings.useEnglishLocale" :label="'Use English language instead of (%s)'.format(settings.spreadsheetLocale)"></v-checkbox>
        <div class="mt-8" style="">{{ "Legend: (β) Beta, (α∗) Alpha/Extended, (+) Premium".format() }}</div>
      </div>

      <div v-show="selected === 'document'">
        <div v-if="uidata.unattendedAvailable">
          <v-layout>
            <v-checkbox class="flex xs11" v-model="settings.unattendedEnabled" @change="unattended" :disabled="!settings.lastBuildDate" label="Unattended BUILD (time-based trigger)"></v-checkbox>
            <v-select :items="uidata.unattendedFrequencies" suffix="hours" v-model="settings.unattendedFrequency" :label="localize('Frequency')" class="mr-3" append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/how-to-update-my-map-automatically-when-the-data-changes')"></v-select>
            <v-checkbox v-model="settings.unattendedAlways" :disabled="!uidata.unattendedAlwaysAvailable" :label="localize('Always')"></v-checkbox>
          </v-layout>
          <div v-if="settings.lastBuildDate" class="body-2 mb-8 ml-4">(*) Unattended BUILD requires access to this Spreadsheet</div>
          <div v-else class="body-2 mb-8 ml-4">(*) BUILD a map first, to get access to the Unattended BUILD option</div>
          <!-- file picker dialog if required -->
          <div v-if="picker.required">
            <p hidden id='picker-result'></p>
          </div>
        </div>
        <v-layout>
          <vx-slider v-model="settings.dataHeadersRowIndex" :min="1" :max="10" :label="localize('label-data-headers-row-index')"></vx-slider>
          <v-checkbox v-model="settings.dataGetDisplayValues" label="Get data as displayed"></v-checkbox>
        </v-layout>
        <v-text-field v-model="settings.locationTemplate" placeholder=" " append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/using-multiple-columns-for-geocoding-with-a-location-template')" :label="'%s {{}}'.format(localize('label-location-template'))"></v-text-field>
      </div>

      <div v-show="selected === 'filters'">
        <v-layout v-if="settings.map4vue">
          <v-checkbox class="mr-3" v-model="settings.searchEnabled" :disabled="!premium" :label="'%s (+)'.format(localize('Search'))"></v-checkbox>
          <v-text-field v-model="settings.searchHeaders" :disabled="!premium || !settings.searchEnabled" placeholder=" " append-icon="mdi-eye" @click:append="settings.searchHeaders = uidata.headers" :label="'%s (csv) (+)'.format(localize('Headers to search from '))"></v-text-field>
          <v-icon class="ml-3" @click="$open('https://www.thexs.ca/xsmapping/filtering-on-your-map')">mdi-help-circle</v-icon>
        </v-layout>
        <v-layout>
          <!-- <vx-slider v-model="settings.filtersQty" :disabled="!premium" :min="0" :max="uidata.filtersMaxQty" :label="'%s (+)'.format(localize('label-filters-qty'))"></vx-slider> -->
          <vx-slider v-model="settings.filtersQty" :disabled="!premium && !settings.map4vue" :min="0" :max="uidata.filtersMaxQty || premium *3 + settings.map4vue *1 + (settings.map4vue && premium) *1" :label="'%s (+)'.format(localize('label-filters-qty'))"></vx-slider>
          <v-text-field v-model="settings.filtersExpandedPanels" :disabled="!settings.map4vue" placeholder=" " append-icon="mdi-eye" @click:append="settings.filtersExpandedPanels = [...Array(1 + settings.filtersQty).keys()].join(',')" :label="'%s (csv)'.format(localize('Panels'))" class="flex xs3"></v-text-field>
        </v-layout>
        <v-layout>
          <v-checkbox class="ml-3 text-no-wrap" v-model="settings.filtersTag" :label="localize('Show quantity')"></v-checkbox>
          <v-text-field class="ml-4" v-model="settings.filtersSplit" :disabled="!premium && !settings.map4vue" placeholder=" " append-icon="mdi-eye" @click:append="settings.filtersSplit = uidata.filtersSplit" :label="localize('label-filters-split')"></v-text-field>
          <v-text-field class="ml-4" v-model="settings.filtersEmpties" :disabled="!premium && !settings.map4vue" placeholder=" " :label="localize('Empties')"></v-text-field>
        </v-layout>
        <v-checkbox v-if="!settings.map4vue" class="ml-3" v-model="settings.filtersDisplay" :label="localize('label-filters-display')"></v-checkbox>
        <v-checkbox v-if="!settings.map4vue" v-model="settings.hideFilters" :label="localize('label-hide-filters-on-load')"></v-checkbox>
        <v-layout v-if="settings.map4vue">
          <v-checkbox class="" v-model="settings.sidebarEnabled" :disabled="!premium" :label="'%s (+)'.format(localize('Sidebar enabled'))"></v-checkbox>
          <v-checkbox class="ml-4" v-model="settings.sidebarCollapsed" :label="localize('Sidebar collapsed')"></v-checkbox>
          <v-checkbox class="ml-4" v-model="settings.appSaveState" :disabled="!(extended || uidata.appSaveStateAvailable)" :label="'%s @local (∗)'.format (localize('Save state'))"></v-checkbox>
        </v-layout>
      </div>

      <div v-show="selected === 'map'">
        <v-layout>
          <v-checkbox class="flex grow mr-3" v-model="settings.showPlace" :disabled="!premium" :label="'%s (+)'.format(localize('label-find-place'))"></v-checkbox>
          <v-text-field class="mr-3" v-model="settings.placeRadius" :disabled="!premium" type="number" min="0" :label="localize('label-place-radius')"></v-text-field>
          <v-select class="mr-3" :items="uidata.placeUnits" v-model="settings.placeUnit" :disabled="!premium" :label="localize('label-place-unit')"></v-select>
          <v-checkbox class="mr-3" v-model="settings.placeStrictBounds" :disabled="!premium" :label="localize('Viewport')"></v-checkbox>
          <v-checkbox v-model="settings.placeFilter" :disabled="!premium" :label="localize('filter')"></v-checkbox>
        </v-layout>
        <v-layout>
          <v-text-field class="flex xs3 mr-3" v-model="settings.pageTitle" :disabled="!premium" :label="'%s (+)'.format(localize('Mapping app title'))"></v-text-field>
          <v-checkbox class="mr-3" v-model="settings.mapCenterOnClick" :label="localize('Center @click')"></v-checkbox>
          <template v-if="settings.map4vue && (extended || uidata.geolocationAvailable)">
            <v-checkbox class="mr-3" v-model="settings.mapFindMe" :disabled="!premium" :label="'%s (∗)'.format(localize('Find me'))"></v-checkbox>
            <v-checkbox class="" v-model="settings.mapFollowMe" :disabled="!premium" :label="'%s (∗)'.format(localize('Follow me'))"></v-checkbox>
          </template>
        </v-layout>
        <v-layout v-if="!settings.map4vue">
          <v-text-field class="flex xs11 mr-3" v-model="settings.styledMap" :disabled="!premium" placeholder=" " append-icon="mdi-eye" @click:append="settings.styledMap = uidata.styledMap" append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/styled-google-map-on-the-mapping-web-app')" :label="'%s (+)'.format(localize('label-styled-map'))"></v-text-field>
          <v-checkbox v-model="settings.styledMapDefault" :disabled="!premium" :label="localize('default')"></v-checkbox>
        </v-layout>

        <v-layout v-if="settings.map4vue">
          <v-select class="flex xs6 mr-1" multiple clearable :items='["fullscreen", "rotate", "scale", "streetView", "zoom"]' v-model="settings.mapControls" placeholder=" " :label="'%s'.format(localize('Controls'))"></v-select>
          <v-select class="flex xs6" multiple clearable :items="mapTypeIds" v-model="settings.mapTypes" placeholder=" " :label="'%s'.format(localize('Types'))"></v-select>
        </v-layout>
        <v-text-field v-if="settings.map4vue" class="flex xs12" v-model="settings.styledMap" placeholder=" " append-icon="mdi-eye" @click:append="settings.styledMap = uidata.styledMap" append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/styled-google-map-on-the-mapping-web-app')" :label="'%s'.format(localize('label-styled-map'))"></v-text-field>

        <!-- mapsApiKey might be required even for non premium/custom plans -->
        <div v-if="uidata.mapsApiKeyAvailable">
          <v-layout>
            <v-text-field class="flex xs8" v-model="settings.mapsApiKey" :label="'%s (∗)'.format(localize('Maps Api key (for the Mapping web app)'))" placeholder=" "></v-text-field>
            <v-text-field class="ml-3" v-model="settings.mapsPageSuffix" prefix="-" :label="'%s (mapping-%s.html) (∗)'.format(localize('Suffix'), settings.mapsPageSuffix)" placeholder=" " append-outer-icon="mdi-help-circle" @click:append-outer="$open('https://www.thexs.ca/posts/how-to-get-and-use-my-own-maps-api-key')"></v-text-field>
          </v-layout>
        </div>
      </div>

      <div v-show="selected === 'icons'">
        <v-layout class="mt-3" align-center>
          <img :src="iconUrl(settings.iconSet)"></img>
          <v-autocomplete class="flex xs3 ml-2 mr-3" :items="uidata.icons" v-model="settings.iconSet" :disabled="!(premium || settings.map4vue)" :title="settings.iconSet" :label="'%s (+)'.format(localize('Icon set'))">
            <template slot="item" slot-scope="data">
              <img style="max-height:24px;" :src="iconUrl(data.item)"></img>
              <div class='ml-2'> {{ data.item }}</div>
            </template>
          </v-autocomplete>
          <!-- select header for alternative icon shape and size as defined in Icons sheet under Shape and Size columns -->
          <v-select v-if="settings.map4vue" class="flex xs3 mr-3" :items="uidata.headersAllOptional" v-model="settings.iconShapeHeader" :disabled="!premium" :label="'%s (+)'.format(localize('Icon shape'))" placeholder=" "></v-select>
          <v-select v-if="settings.map4vue" class="flex xs3 mr-3" :items="uidata.headersAllOptional" v-model="settings.iconSizeHeader" :disabled="!premium" :label="'%s (+)'.format(localize('Icon size'))" placeholder=" "></v-select>
          <v-checkbox v-model="settings.markerDraggable" :label="localize('Draggable')" class="mr-4"></v-checkbox>
          <v-checkbox v-model="settings.markerSpider" :label="localize('Overlapping')"></v-checkbox>
        </v-layout>
        <v-layout v-if="uidata.iconLabelsAvailable || extended">
          <v-checkbox class="mr-3 text-no-wrap" v-model="settings.layers.labels.enabled" :disabled="!premium" :label="'%s (∗)'.format(localize('Labels'))"></v-checkbox>
          <v-combobox class="flex xs4 mr-3" :items="uidata.headersAll" v-model="settings.layers.labels.text" :disabled="!settings.layers.labels.enabled" :label="localize('Text')" placeholder=" "></v-combobox>
          <v-select class="flex xs4 mr-3" :items="'center,top,bottom'.split(',')" v-model="settings.layers.labels.position" :disabled="!settings.layers.labels.enabled" :label="localize('Position')" placeholder=" "></v-select>
          <v-text-field class="mr-3" v-model="settings.layers.labels.options" :disabled="!settings.layers.labels.enabled" :label="localize('Options')" placeholder=" " append-icon="mdi-eye" @click:append="settings.layers.labels.options = 'k:v; x,y,css,zoom'"></v-text-field>
          <v-icon @click="$open('https://www.thexs.ca/posts/how-to-use-custom-labels-for-icons')">mdi-help-circle</v-icon>
        </v-layout>
        <v-layout>
          <v-checkbox v-model="settings.icontitleEnabled" :disabled="!settings.map4vue" :label="localize('Enabled')" class="mr-3"></v-checkbox>
          <v-text-field v-model="settings.titleTemplate" :disabled="!settings.icontitleEnabled" placeholder=" " append-icon="mdi-eye" @click:append="settings.titleTemplate = uidata.titleTemplate" :label="'%s {{}}'.format(localize('label-icon-title'))"></v-text-field>
        </v-layout>
        <v-layout>
          <v-checkbox class="ml-3 mr-4" v-model="settings.markerCluster" :label="localize('Clusters')"></v-checkbox>
          <vx-slider class="mr-2" v-model="settings.markerClusterMinimumClusterSize" :min="2" :max="20" :label="localize('Size')"></vx-slider>
          <vx-slider class="mr-2" v-model="settings.markerClusterMaxZoom" :min="10" :max="16" :label="localize('Zoom')"></vx-slider>
          <v-checkbox v-model="settings.markerClusterToggle" :label="localize('Toggle')"></v-checkbox>
        </v-layout>
      </div>

      <div v-show="selected === 'infowindow'">
        <v-layout>
          <v-checkbox v-model="settings.infowindowEnabled" :disabled="!settings.map4vue" :label="localize('Enabled')" class="mr-3"></v-checkbox>
          <v-text-field v-model="settings.headers" :disabled="!settings.infowindowEnabled" placeholder=" " append-icon="mdi-eye" @click:append="settings.headers = uidata.headers" :label="'%s (csv)'.format(localize('label-headers-show'))"></v-text-field>
          <v-text-field v-model="settings.infowindowMarkedHeaders" :disabled="!settings.map4vue || !premium || !settings.infowindowEnabled" placeholder=" " :label="'%s (csv) (+)'.format(localize('Headers using Markdown'))" class="ml-2"></v-text-field>
        </v-layout>
        <v-layout v-if="settings.map4vue">
          <v-checkbox v-model="settings.infowindowMarkdownEnabled" :disabled="!premium" :label="'%s (+)'.format(localize('Markdown'))" class="mr-4"></v-checkbox>
          <v-text-field :value="settings.infowindowMarkedTemplate" readonly :disabled="!settings.infowindowMarkdownEnabled" :label="localize('Content template (Markdown)')" 
            @click:append-outer="selected = 'infowindow-markdown'" placeholder=" " class="" hide-details append-outer-icon="mdi-pencil">
          </v-text-field>
        </v-layout>
        <v-layout v-if="settings.map4vue">
          <vx-slider class="mr-2" v-model="settings.infowindowWidth" :min="180" :max="400" :label="localize('Width')"></vx-slider>
          <vx-slider class="mr-2" v-model="settings.infowindowHeight" :min="100" :max="420" :label="localize('Height')"></vx-slider>
          <v-checkbox v-model="settings.infowindowHeightLock" :label="localize('Lock')"></v-checkbox>
        </v-layout>
        <v-layout>
          <v-checkbox v-model="settings.infowindowDirections" :label="localize('Add Directions link')" class="pr-4"></v-checkbox>
          <v-checkbox v-model="settings.infowindowZoomIn" :label="localize('Add Zoom-in link')"></v-checkbox>
          <v-text-field class="ml-4 flex xs2" v-model="settings.linksAnchorText" :label="localize('Link text')" placeholder=" "></v-text-field>
          <v-select class="ml-3 flex xs2" :items="['Top','Bottom']" v-model="settings.infowindowButtonsPosition" :disabled="!settings.map4vue" :label="localize('Buttons')"></v-select>        </v-layout>

        <template v-if="uidata.editingAvailable">
          <v-layout>
            <v-checkbox v-model="settings.editingEnabled" :label="localize('Editing')" class="flex xs4"></v-checkbox>
            <v-checkbox v-model="settings.editingAddOverlay" :disabled="!settings.editingEnabled" :label="localize('Add new')" class="flex xs4"></v-checkbox>
            <v-checkbox v-model="settings.editingHeadersOnly" :disabled="!settings.editingEnabled" :label="localize('Only listed')" class="flex xs4"></v-checkbox>
            <v-checkbox v-model="settings.editingAppendCarryOver" :disabled="!settings.editingEnabled" :label="localize('Carry over')" class="flex xs4"></v-checkbox>
          </v-layout>
          <v-layout>
            <v-text-field v-model="settings.editingHeaders" :disabled="!settings.editingEnabled" :label="localize('Headers to edit (csv)')" placeholder=" " class="flex xs6 mr-3"></v-text-field>
            <v-text-field v-model="settings.editingHeadersTextarea" :disabled="!settings.editingEnabled" :label="localize('Headers as textarea (csv)')" placeholder=" " class="flex xs6"></v-text-field>
          </v-layout>
          <v-layout>
            <v-textarea v-model="settings.editingAppendDefaultValues" :disabled="!settings.editingEnabled" :label="localize('Append default values (json)')" :rows=3 placeholder=" " class="flex xs6 mr-3" hide-details></v-textarea>
            <v-textarea v-model="settings.editingUpdatePatchedValues" :disabled="!settings.editingEnabled" :label="localize('Update patched values (json)')" :rows=3 placeholder=" " class="flex xs6" hide-details></v-textarea>
          </v-layout>
        </template>
      </div>

      <div v-if="selected === 'infowindow-markdown'">
        <v-layout>
          <v-textarea :value="settings.infowindowMarkedTemplate" @input="debouncing" xautofocus :label="localize('Content template (Markdown)')" rows=19 no-resize background-color="grey lighten-2" placeholder=" " style="margin-right:8px" hide-details></v-textarea>
          <div style="overflow-y: auto; overflow-x: hidden; border-bottom: 1px solid lightgray;" 
            :style="{ 'width': settings.infowindowWidth + 'px', ...(settings.infowindowHeightLock ? {'height': settings.infowindowHeight + 'px'} : {'height': 'fit-content', 'max-height': settings.infowindowHeight + 'px'}) }">
            <vx-marked :template="settings.infowindowMarkedTemplate" :json="infowindowMarkedJson()" :sanitize="true" :style="iwStyle" ></vx-marked>
          </div>
        </v-layout>
        <v-layout style="position:absolute; top:380px; left:10px" align-center>
          <v-btn @click="selected = 'infowindow'" fab small icon outlined><v-icon>mdi-arrow-left</v-icon></v-btn>
          <v-checkbox v-model="settings.markdownPreserveLinebreaksInData" :label="localize('Preserve linebreaks in data')" class="ml-2 mr-2"></v-checkbox>
          <v-icon @click="$open('https://www.thexs.ca/posts/how-to-use-markdown-for-a-content-template')">mdi-help-circle</v-icon>
        </v-layout>
      </div>

      <div v-show="selected === 'listing'">
        <v-layout>
          <v-checkbox v-if="settings.map4vue" v-model="settings.listingEnabled" :label="localize('Enabled')" class="mr-3"></v-checkbox>
          <v-text-field v-model="settings.listingTemplate" placeholder=" " :disabled="!settings.listingEnabled" :readonly="uidata.listingTemplateMarked"
            append-icon="mdi-eye" @click:append="settings.listingTemplate = settings.map4vue ? uidata.listingTemplateMarkdown : uidata.listingTemplate; uidata.listingTemplateMarked=false" 
            append-outer-icon="mdi-pencil" @click:append-outer="if (settings.map4vue) {selected = 'listing-markdown'; uidata.listingTemplateMarked=true}"
            :label="'%s {{}}'.format(localize('label-listing'))">
          </v-text-field>
        </v-layout>
        <v-layout>
          <vx-slider v-if="settings.map4vue" class="flex xs5 mr-2" v-model="settings.listingWidth" :min="250" :max="450" :label="localize('Width')"></vx-slider>
          <v-checkbox v-model="settings.listingOpenInfowindow" :disabled="!settings.listingEnabled" :label="localize('Open Infowindow on (✜) anchor click')"></v-checkbox>
        </v-layout>
        <v-layout>
          <v-checkbox v-model="settings.listingExportNewTab" :disabled="!settings.listingEnabled" :label="localize('Export Listing to a new tab')" class="mr-3"></v-checkbox>
          <v-checkbox v-model="settings.listingExportCsv" :disabled="!settings.listingEnabled" :label="localize('Export Listing as a CSV file')" class="mr-3"></v-checkbox>
          <v-checkbox v-if="uidata.listingSortableAvailable || extended" v-model="settings.listingSortable" :disabled="!settings.listingEnabled" :label="'%s (∗)'.format(localize('Sortable'))"></v-checkbox>
        </v-layout>
        <v-checkbox class="ml-3" v-model="settings.listingExportNewTabDirections" :disabled="!settings.listingEnabled" :label="localize('View Directions on Google Maps')"></v-checkbox>
      </div>

      <div v-if="selected === 'listing-markdown'">
        <v-layout>
          <v-textarea :value="settings.listingTemplate" @input="debouncing2" xautofocus :label="localize('Content template (Markdown)')" rows=19 no-resize background-color="grey lighten-2" placeholder=" " style="margin-right:8px" hide-details></v-textarea>
          <div style="overflow-y: auto; overflow-x: hidden; border-bottom: 1px solid lightgray;" 
            :style="{ 'width': settings.listingWidth + 'px', 'height': 'fit-content', 'max-height': '75vh' }">
            <vx-marked :template="settings.listingTemplate" :json="infowindowMarkedJson()" :sanitize="true" :style="iwStyle" ></vx-marked>
          </div>
        </v-layout>
        <v-layout style="position:absolute; top:380px; left:10px" align-center>
          <v-btn @click="selected = 'listing'" fab small icon outlined><v-icon>mdi-arrow-left</v-icon></v-btn>
          <v-checkbox v-model="settings.markdownPreserveLinebreaksInData" :label="localize('Preserve linebreaks in data')" class="ml-2 mr-2"></v-checkbox>
          <v-icon @click="$open('https://www.thexs.ca/posts/how-to-use-markdown-for-a-content-template')">mdi-help-circle</v-icon>
        </v-layout>
      </div>

      <div v-show="selected === 'routing'">
        <v-layout>
          <v-checkbox v-model="settings.routingEnabled" :disabled="!premium" append-icon="mdi-help-circle" @click:append="$open('https://www.thexs.ca/xsmapping/optimal-routing')" :label="'%s (+)'.format(localize('label-enable-routing'))"></v-checkbox>
          <v-checkbox v-show="settings.routingEnabled" v-model="settings.routingF2LEnabled" :label="localize('label-F2L')" class="ml-4"></v-checkbox>
          <v-checkbox v-show="settings.routingEnabled && settings.map4vue && (uidata.routingAsIsAvailable || extended)" v-model="settings.routingAsIsEnabled" :label="localize('As-Is')" class="ml-4"></v-checkbox>
          <v-checkbox v-show="settings.routingEnabled && settings.map4vue && (uidata.routingReverseAvailable || extended)" v-model="settings.routingReverseEnabled" :label="localize('Reverse')" class="ml-4"></v-checkbox>
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
            <v-btn icon outlined @click="getHbLatLng" :disabled="!settings.routingHbEnabled || working">
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
            <v-text-field class="ml-3" v-model="settings.routingHbLatLng" :disabled="!settings.routingHbEnabled" :label="localize('label-hb-lat-lng')" placeholder=" "></v-text-field>
          </v-layout>
          <v-layout>
            <v-select class="flex xs3 mr-3" :items="uidata.routingTravelModes" v-model="settings.routingTravelMode" :label="localize('label-travel-mode')"></v-select>
            <v-select class="flex xs3 mr-3" :items="uidata.routingUnitSystems" v-model="settings.routingUnitSystem" :label="localize('label-unit-system')"></v-select>
            <v-select v-if="settings.map4vue" class="flex xs6" :items="'Highways,Tolls,Ferries'.split(',')" v-model="settings.routingAvoid" multiple :label="localize('avoid')" placeholder=" "></v-select>
          </v-layout>
          <v-layout v-if="!settings.map4vue">
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
        <v-layout v-if="uidata.layerGeoJSONAvailable || extended">
          <v-checkbox class="mr-3 text-no-wrap" v-model="settings.layers.geojson.enabled" :label="'%s (∗)'.format(localize('GeoJSON'))"></v-checkbox>
          <v-text-field class="mr-3" v-model="settings.layers.geojson.url" :disabled="!settings.layers.geojson.enabled" :label="localize('File URL')" placeholder=" "></v-text-field>
          <v-text-field class="mr-3" v-model="settings.layers.geojson.fillOpacity" type="number" step="0.01" min="0" max="1" :disabled="!settings.layers.geojson.enabled" :label="localize('label-fill-opacity')"></v-text-field>
          <v-icon @click="$open('https://www.thexs.ca/xsmapping/adding-custom-layers')">mdi-help-circle</v-icon>
        </v-layout>
        <v-layout v-if="uidata.layerKmlAvailable || extended">
          <v-checkbox class="mr-3 text-no-wrap" v-model="settings.layers.kml.enabled" :label="'%s (∗)'.format(localize('Kml/Kmz'))"></v-checkbox>
          <v-text-field class="mr-3" v-model="settings.layers.kml.url" :disabled="!settings.layers.kml.enabled" :label="localize('File URL')" placeholder=" "></v-text-field>
          <v-checkbox class="mr-3" v-model="settings.layers.kml.viewport" :disabled="!settings.layers.kml.enabled" :label="localize('Viewport')"></v-checkbox>
          <v-icon @click="$open('https://www.thexs.ca/xsmapping/adding-custom-layers')">mdi-help-circle</v-icon>
        </v-layout>

        <v-layout v-if="uidata.layerTripBufferAvailable || extended">
          <v-checkbox class="mr-3 text-no-wrap" v-model="settings.layers.buffer.enabled" :label="'%s (∗)'.format(localize('Trip:Buffer'))"></v-checkbox>
          <v-text-field class="mr-0 col-2" v-model.number="settings.layers.buffer.maxWaypoints" type="number" step="1" min=0 max=10 :disabled="!settings.layers.buffer.enabled" :label="localize('Waypoints')"></v-text-field>
          <v-text-field class="mr-0 col-2" v-model.number="settings.layers.buffer.maxRadius" type="number" step="1" min="0" max="10" :disabled="!settings.layers.buffer.enabled" :label="localize('Radius')"></v-text-field>
          <!-- <v-text-field class="mr-0 col-2" v-model="settings.layers.buffer.step" type="number" step="0.1" min="0.1" max="1" :disabled="!settings.layers.buffer.enabled" :label="localize('Step')"></v-text-field> -->
          <v-select class="mr-3" :items="['kilometers','miles']" v-model="settings.layers.buffer.units" :disabled="!settings.layers.buffer.enabled" :label="localize('Units')"></v-select>
          <v-checkbox class="mr-3" v-model="settings.layers.buffer.draggable" :disabled="!settings.layers.buffer.enabled" :label="localize('Draggable')"></v-checkbox>
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
    data.working = false;
    // iwStyle below comes from mapping-vue map.css x-iw-marked class (keep it synced)
    data.iwStyle = "font-weight: 300!important; font-size: 13px!important; letter-spacing: .0178571429em!important; line-height: 1.25rem; font-family: Roboto,sans-serif!important;";
    return data
  },

  async mounted() {
    if (!window.google || !window.google.script) Vue.loadScript("./vx-google.script.js");
    // await Vue.loadScript("./vx-file-picker.js");
    await Vue.loadScript("https://cdn.jsdelivr.net/gh/thexs-dev/vue-gas-ms@0.7.24/vx-file-picker.js");
    Vue.loadScript("https://apis.google.com/js/api.js?onload=onApiLoad");
    this.localeResources["infowindow-markdown"] = this.localize("infowindow") + " (Markdown)"; // hacking localeResources for infowindow-markdown page
    this.localeResources["listing-markdown"] = this.localize("listing") + " (Markdown)"; // hacking localeResources for listing-markdown page
  },

  computed: {
    mapTypeIds() { return ['roadmap','satellite','hybrid','terrain', ... this.settings.styledMap ? ['styled'] : [], ... this.uidata.mapTypeOsmAvailable ? ['OSM'] : []] }
  },

  methods: {
    localize(key) { return this.localeResources[key] || key },
    debouncing: debounce(function(v) { this.settings.infowindowMarkedTemplate = v; }, 1000),
    debouncing2: debounce(function(v) { this.settings.listingTemplate = v; }, 1000),
    infowindowMarkedJson: function(v) {
      return this.settings.markdownPreserveLinebreaksInData ? 
        Object.entries(this.uidata.infowindowMarkedJson).reduce((p,[k,v]) => ( p[k] = typeof v === 'string' ? v.replace(/\n/g, "<br>") : v, p ), {})
        : this.uidata.infowindowMarkedJson
    },

    iconUrl: function (iconSet) { return "https://thexs-mapping.firebaseapp.com/icons/%s/Blue.png".format(iconSet) },

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
      console.log(this.$data);
      this.$gae("test");
    }
  }
});


new Vue({
  el: '#app',
  vuetify: new Vuetify(),
});