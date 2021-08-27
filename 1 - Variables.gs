const ui = SpreadsheetApp.getUi();
const ss = SpreadsheetApp.getActiveSpreadsheet();
const scriptProperties = PropertiesService.getScriptProperties();
const userProperties = PropertiesService.getUserProperties();

//=======================================================

const GeocodioURL = "https://api.geocod.io/v1.6/geocode"
//?q=" & [Address] & "&api_key=" & "31cd11d4d4a168751363c62ad425a5c1d26aaad
const SchoolDistrictsURL = "https://maps.bexar.org/arcgis/rest/services/SchoolDistricts/MapServer/0/query"
//?where=1%3D1&outFields=NAME&geometry=" & [coordinate_range] & "&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outSR=4326&f=json")
const CommissionerPrecinctsURL = "https://maps.bexar.org/arcgis/rest/services/CommissionerPrecincts/MapServer/0/query"
//?where=1%3D1&outFields=Comm,ComName&geometry=" & [coordinate_range] & "&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outSR=4326&f=json")
const CouncilDistrictURL = "https://services.arcgis.com/g1fRTDLeMgspWrYp/arcgis/rest/services/CouncilDistricts/FeatureServer/0/query"
//?where=1%3D1&outFields=District,Name&geometry="& [coordinate_range] &"&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outSR=4326&f=json")"

//=======================================================

const help = `
This script was created in August 2021 by Chris Mills for Artpace San Antonio. 
Usage and reuse is defined by the MIT License.
Contact Chris for assistance using this tool.

This tool uses Geocodio, as well as Bexar County/City of San Antonio ArcGIS openData APIs to first get the coordinate data from an address/ZIP via Geocodio, then search those municipal maps for which districts/precincts that coordinate intersects. Make sure to list all your data in one singular 'Address' column (concatenating values/fields if necessary), and that will be detected in your open sheet when you select 'Geocoding SA > Process' to start! Easy error messaging is implemented wherever possible.

Geocodio usage is based on a paid API, which has a free tier of 2500 lookups per day. Sign up at https://www.geocod.io/ and get your API key at https://dash.geocod.io/apikey

This API key must be set by every user that logs in Google to use this sheet.

City/County info is pulled from ArcGIS open data services, and the longevity of the links hardcoded into this tool have not been tested. In the case of needing to update API links, open Tools > Script Editor and go to Google Apps Script. The URL variables are declared at the top of the file 'Variables.gs'.

The maps data provided by the Bexar County/City of San Antonio can be found here:
https://gis-bexar.opendata.arcgis.com/
https://data.sanantonio.gov/group/geospatial
`


