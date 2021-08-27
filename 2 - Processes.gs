async function singleColumnProcess() {

  // CHECK DATA =========================================
  let addressRange = getByName("Address");
  if (!addressRange) 
    throw "I don't see a column called 'Address' in your current open Sheet.";


  let addresses = addressRange.getValues();
  addresses = addresses.map(v => v.toString().replace('.',','));
  if (!addresses.reduce((p,v,i) => (p + +!!v), 0))
    throw "The column 'Address' is empty.";

  
  // Process Each!
  let addressData = addresses.map(async (v,i,a) => {
    let data = {}
    if (!v) return data;
    

    //Get Coordinates ===============================================
    // TODO refactor this step into a single batch API call.
    let geocodioResults = await getGeocodio(v)
      .catch((e) => {
        console.error(e);
        return null;
      });
    if (!geocodioResults) return data; //abort rest
    data = { ...data, ...geocodioResults }
    
    //Transform Location Data ===============================================
    let coordinate_span = [
      data.geocodio.lng,
      data.geocodio.lat,
      data.geocodio.lng + 0.0001,
      data.geocodio.lat + 0.0001,
    ].join(',');

    //Call all steps, iterate each and combine data ======================

    let catcher = (e) => {
      console.error(e)
      return {};
    }
    data = await Promise.all([
      getSchoolDistricts,
      getCountyPrecincts,
      getCouncilDistricts
    ].map(f => f.call(this,v,coordinate_span).catch(catcher)))
      .then((v) => {
        let d = data;
        v.forEach(v => { d = {...d, ...v}; })
        return d;
      });

    // ===============================================
    return data;

  });

  addressData = await Promise.all(addressData).catch((e) => {throw e});
  
  // TRANSFORM DATA TO SHEET
  addressData = addressData.map(v => ({
    'Detected Address': v.geocodio?.['Detected Address'],
    'Latitude': v.geocodio?.lat,
    'Longitude': v.geocodio?.lng,
    ...v.isd,
    ...v.precinct,
    ...v.council
  }));

  let addressRangeColumn = addressRange.getColumn();

  let sample = addressData.find(v => Object.keys(v).length !== 0);
  let sampleKeys = Object.keys(sample);
  let blank = sampleKeys.reduce((data,value,index,array) => {
    data[value] = addressData.map(v => v[value]);
    writeArrayToColumn(data[value], addressRangeColumn + 1 + index, value)
    return data;
  }, {})
}

// ================================================================================

function getGeocodio(address) {
  let data = {}
  const GeocodioKey = APIhandling.getKey();
  let GeocodioQuery = GeocodioURL.addQuery({ 
    q: address, 
    api_key: GeocodioKey 
  });

  return new Promise((resolve, reject) => {
    try {
      let response = UrlFetchApp.fetch(GeocodioQuery); // get api endpoint
      let json = JSON.parse(response.getContentText()); //parse text into json
      console.info(json.results.length + " results found by Geocodio.");
      let result = json.results[0];

      resolve({
        geocodio: {
          'Detected Address': result.formatted_address,
          //...result.location, // Latitude, Longitude
          accuracy: result.accuracy,
          accuracy_type: result.accuracy_type,
          source: result.source
        }
      });
    } catch (e) {
      reject(new Error(`Geocodio('${address}'): ${e}`));
    }
  });
}


function getSchoolDistricts(address, coord_string) {
  let SchoolDistrictsQuery = SchoolDistrictsURL.addQuery({
    where: '1=1',
    outFields: 'NAME',
    geometry: coord_string,
    geometryType: 'esriGeometryEnvelope',
    inSR: 4326,
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: false,
    outSR: 4326,
    f: 'json'
  })

  return new Promise((resolve, reject) => { 
    try {
      let response = UrlFetchApp.fetch(SchoolDistrictsQuery); // get api endpoint
      let json = JSON.parse(response.getContentText()); //parse text into json
      console.info(json.features.length + " results found for Bexar County School Districts.");
      let result = json.features[0]?.attributes?.['NAME'];
      resolve({
        isd: {
          'School District': result || ''
        }
      });
    } catch (e) {
      reject(new Error(`SchoolDistricts('${address}'): ${e}`));
    }
  });
}


function getCountyPrecincts(address, coord_string) {
  let PrecinctQuery = CommissionerPrecinctsURL.addQuery({
    where: '1=1',
    outFields: 'Comm,ComName',
    geometry: coord_string,
    geometryType: 'esriGeometryEnvelope',
    inSR: 4326,
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: false,
    outSR: 4326,
    f: 'json'
  });

  return new Promise((resolve, reject) => { 
    try {
      let response = UrlFetchApp.fetch(PrecinctQuery); // get api endpoint
      let json = JSON.parse(response.getContentText()); //parse text into json
      console.info(json.features.length + " results found for Bexar County Precincts.");
      let result = json.features[0]?.attributes;
      resolve({ 
        precinct: {
          'County Precinct': result?.Comm || '',
          'Commissioner Name': result?.ComName || '',
        }
      });
    } catch (e) {
      reject(new Error(`CountyPrecincts('${address}'): ${e}`));
    }
  });
}


function getCouncilDistricts(address, coord_string) {
  let CouncilQuery = CouncilDistrictURL.addQuery({
    where: '1=1',
    outFields: 'District,Name',
    geometry: coord_string,
    geometryType: 'esriGeometryEnvelope',
    inSR: 4326,
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: false,
    outSR: 4326,
    f: 'json'
  });

  return new Promise((resolve, reject) => { 
    try {
      let response = UrlFetchApp.fetch(CouncilQuery); // get api endpoint
      let json = JSON.parse(response.getContentText()); //parse text into json
      console.info(json.features.length + " results found for San Antonio Districts.");
      let result = json.features[0]?.attributes;
      resolve({ 
        council: {
          'Council District': result?.District || '',
          'Council Name': result?.Name || '',
        }
      });
    } catch (e) {
      reject(new Error(`CouncilDistricts('${address}'): ${e}`));
    }
  });
}
