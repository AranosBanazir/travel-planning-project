//This will be to render the saved information from LS
//so that we can view previously scheduled trips by name, as well as the saved places of interest
const html = $('html')
const themeButton = $('#themeButton')
const backButton = $("#backButton");
const tripList = $("#tripsList");
const deleteButton = $(".deleteTrip");

// using this to test retrieving data from LS
const testButton = $("#testButton");
const testRender = $("#testRender");
const testTripsList = $("#tripsList");

//a function to pull info from LS
function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || []; //this will return th12345e JSON Object in LocalStorage
}

//a function to save LS data
function saveLocalStorage(key, item) {
  localStorage.setItem(key,JSON.stringify(item));
}

//Make a function to render LS info to Page
// TODO remove the console.logs and remove dependency on clicking the button to render
function renderTrips() {
  const trips = getLocalStorage("trips");
  tripList.empty();
  trips.forEach((trip) => {
//     const tripCard = `
//     <div class="collapse collapse-arrow bg-base-200">
//     <input type="radio" name="my-accordion-2" checked="checked" />
//     <div class="collapse-title text-xl font-medium">${trip.trip} Location: ${trip.city} - ${trip.startDate} To: ${trip.tripEndDate}</div>
//     <div class="collapse-content">
//     <div id="map-${trip.id}" class="row-span-full">
//     <img src="https://placehold.co/600x400">
//     </div>
//     </div>
//   </div>`;


const tripCard = $(`
<div class="collapse collapse-arrow bg-base-200 mt-2 mb-2">
<input type="radio" name="my-accordion-2" />
<div class="collapse-title text-xl text-center font-medium">${trip.trip}        ${trip.city} From: ${trip.startDate} To: ${trip.tripEndDate}</div>
<div class="collapse-content">
    <div class="flex flex-col w-full lg:flex-row">
        <div style='background-color: transparent;' class="grid self-center flex-grow w-[600px] h-[400px] lg:max-w-[30%] max-h-fit card bg-base-300 rounded-box place-items-center">
            <div id="map-${trip.id}" class="w-[100%] h-[100%] row-span-full">
                
            </div>
        </div> 
        <div class="divider lg:divider-horizontal">
        </div> 
         <div id='placeCardDiv-${trip.id}' class="flex justify-center flex-wrap gap-[3%]">
            
            </div>`)

    
    for (let i = 0; i < trip.places.length; i++){
      getFavPlaceInfo(trip.places[i].address, trip.id)
      
    }

    tripList.append(tripCard);


    //need to init map based on tripid
    initMap(trip.coords.lat, trip.coords.lon, trip.id)

  });
}

function deleteTrip() {}

function getFavPlaceInfo(place, id) {
  const replacedPlaceStr = place.replace(/\s/g, "%20");
  const url = `https://local-business-data.p.rapidapi.com/search?query=${replacedPlaceStr}&limit=20&zoom=13&language=en&region=us`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "a663ecdd14mshab2c56faf4558fbp11c070jsnfae22d1e62b6",
      "X-RapidAPI-Host": "local-business-data.p.rapidapi.com",
    },
  };

  fetch(url, options)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data.data[0].directory){
        return
      }

      const place = data.data[0].directory[0]
      console.log(place)
      const placeCardDiv = $(`#placeCardDiv-${id}`)
      let priceRange = '<p></p>'

      if (place.price_range){
        priceRange = `<p>Price: <span style = 'color: green;'>${place.price_range}</span></p>`
      }



      const placeCard = $(`
      <div class="flex flex-wrap">
          <div class="card bg-base-100 shadow-xl mb-[10px] w-[370px] text-wrap">
              <div class="card-body">  
                  <h2 class="card-title">${place.name}</h2>
                   <p class = 'break-words'>Adress: ${place.address}</p>
                   <p class = 'break-words'>Rating: ${place.rating} ⭐️ (${place.review_count} reviews)
                   ${priceRange}   
                   <button class="btn w-[78px] h-[48px] justify-self-end self-end btn-error" id="deleteCard">Delete</button> 
              </div>
              
            </div>
      </div>
      `) 
      placeCard.appendTo(placeCardDiv)
      newMarker(id, place.name, place.latitude, place.longitude)
    });
  
}


const maps = []
async function initMap(lat, lon, id) {
  const mapEl = $(`#map-${id}`);
  const position = { lat: lat, lng: lon };
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps");

  maps[id] = new Map(document.querySelector(`#map-${id}`), {
    zoom: 10,
    center: position,
    mapId: `${id}`,
  });

  mapEl.css("border-radius", "100px");
  mapEl.css('z-index', '1')
}


async function newMarker(id, name, lat, lon) {
  const position = { lat: lat, lng: lon };
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
 

  const marker = new AdvancedMarkerElement({
    map: maps[id], 
    position: position,
    title: `${name}`,
  });
}









// TODO remove the dependency on clicking the button to render
testButton.on("click", () => {
  getTrips();
});
testRender.on("click", () => {
  renderTrips();
});
deleteButton.on("click", () => {
  console.log("delete button clicked");
});
backButton.on("click", function () {
  //return to landing page
  window.location.href = "./index.html";
});

themeButton.on('click', function(){
  console.log(html[0].dataset.theme)
  if (html[0].dataset.theme === 'light') {
    html[0].dataset.theme = 'retro'
  
} else if (html[0].dataset.theme === 'retro'){
  html[0].dataset.theme = 'halloween'
} else if(html[0].dataset.theme === 'halloween'){
  html[0].dataset.theme = 'dark'
} else if (html[0].dataset.theme === 'dark'){
  html[0].dataset.theme = 'light'
}else{
    html[0].dataset.theme = 'light'
}

saveLocalStorage('theme', html[0].dataset.theme)
})

$(document).ready(function (){
  html[0].dataset.theme = getLocalStorage('theme') || 'light'
  if (!getLocalStorage('trips')){
    location.href = './index.html'
  }
})