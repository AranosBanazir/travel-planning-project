//Declaring elements to be used to get values from the form
const tripNameInput = $('#tripName') //Text input on the modal for the name of the trip
const tripStartDate = $('#startDate') //Datepicker input for start of trip date
const tripEndDate   = $('#endDate') //Datepicker input for end of trip date
const cityInput     = $('#cityInput') //Name of city in which to visit

//API Key
const geoKey = 'a9d59121cb4743ac9edb7c6853265cb9'


//function to get geoid: use https://api.geoapify.com/v1/geocode
function getGeoId(place){
    fetch(`https://api.geoapify.com/v1/geocode/search?text=${place}&apiKey=${geoKey}`)
    .then(function(response){
        return response.json()
    })
    .then(function(data){
        const id = data.features[0].properties.place_id
        console.log(data.features[0])

        initMap(data.features[0].properties.lat, data.features[0].properties.lon)
        getLocalInformation(id)
    })   
}


function getLocalInformation(id){
    //fetch information from Geoapify
    fetch(`https://api.geoapify.com/v2/places?categories=catering,healthcare,entertainment&filter=place:${id}&limit=500&apiKey=${geoKey}`)
    .then(function(response){
        return response.json()
    })
    .then(function(data){
        console.log(data)
    })
}



//Uses the Google Maps Library to generate and embed a google map element into a specified element
let map;
async function initMap(lat, lon) {
  const mapEl = $('#map')
  const position = { lat: lat, lng: lon };
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(mapEl, {
    zoom: 13,
    center: position,
    mapId: "123456",
  });

  
  mapEl.css('border-radius', '10px')
}



async function newMarker(location, type = 'feature', lat, lon){
    const position = { lat: lat, lng: lon };
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const {PinElement} = await google.maps.importLibrary("marker")
    //setting styles for each marker based on type
    const styles = {
        feature: {
            background: 'red',
            borderColor: 'black',
            glyph: `${markercount}`,
            glyphColor: 'white',   
        },

        catering: {
            background: 'blue',
            borderColor: 'white',
            glyph: `${markercount}`,
            glyphColor: 'white', 
        },

        healthcare: {
            background: 'green',
            borderColor: 'black',
            glyph: `${markercount}`,
            glyphColor: 'white', 
        },

        airport: {
            background: 'pink',
            borderColor: 'black',
            glyph: `${markercount}`,
            glyphColor: 'white', 
        },

        entertainment: {
            background: 'purple',
            borderColor: 'black',
            glyph: `${markercount}`,
            glyphColor: 'white',   
        },

        accommodation: {
            background: 'white',
            borderColor: 'black',
            glyph: `${markercount}`,
            glyphColor: 'black',
        }
    }

    






    const pin = new PinElement(styles[type])

  const marker = new AdvancedMarkerElement({
    map: map, //using the globally set map var
    position: position,
    title: `${location}`,
    content: pin.element

   
  });

  const list = $('#places')
  const place = $(`<li>     ${markercount}. ${location}</li>`)
  place.css('background-color', styles[type].background)
  place.css('color', styles[type].glyphColor)
  place.appendTo(list)
 
  markercount++ //used to set the number identifier on the marker
}