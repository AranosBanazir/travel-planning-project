//This will be to render the saved information from LS
//so that we can view previously scheduled trips by name, as well as the saved places of interest
const html = $("html");
const themeButton = $("#themeButton");
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
  localStorage.setItem(key, JSON.stringify(item));
}

//Make a function to render LS info to Page
function renderTrips() {
  const trips = getLocalStorage("trips");
  tripList.empty();
  trips.forEach((trip) => {
    const formatedStartDate = new Date(trip.startDate).toLocaleDateString();
    const formatedEndDate = new Date(trip.tripEndDate).toLocaleDateString();

    const tripCard = $(`
<div class="collapse collapse-arrow bg-base-200 mt-2 mb-2" id="trip-${trip.id}">

<input type="radio" name="my-accordion-2" />

<div class="collapse-title text-xl text-center font-medium">${trip.trip}        ${trip.city} From: ${formatedStartDate} To: ${formatedEndDate} </div>
<div class="collapse-content">
    <div class="flex flex-col w-full lg:flex-row">
        <div style='background-color: transparent;' class="grid self-center flex-grow w-[600px] h-[400px] lg:max-w-[30%] max-h-fit card bg-base-300 rounded-box place-items-center">
            <div id="map-${trip.id}" class="w-[100%] h-[100%] row-span-full">
                
            </div>
        </div> 
        <div class="divider lg:divider-horizontal">
        </div> 
         <div id='placeCardDiv-${trip.id}' class="flex justify-center flex-wrap gap-[3%]">
            
            </div>
            <button class="btn btn-error" data-id="${trip.id}" id="tripDelButton-${trip.id}">Delete Trip</button>
`);

    for (let i = 0; i < trip.places.length; i++) {
      getFavPlaceInfo(trip.places[i].address, trip.id);
    }

    tripList.append(tripCard);

    //need to init map based on tripid
    initMap(trip.coords.lat, trip.coords.lon, trip.id);
  });
}
// function to get information of favorited places from index.html
function getFavPlaceInfo(place, id) {
  const replacedPlaceStr = place.replace(/\s/g, "%20");
  const url = `https://local-business-data.p.rapidapi.com/search?query=${replacedPlaceStr}&limit=20&zoom=13&language=en&region=us`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "a1a6f39749msha4cefe337e2c0e4p1399cbjsn35c3b62321e4",
      "X-RapidAPI-Host": "local-business-data.p.rapidapi.com",
    },
  };

  fetch(url, options)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data.data[0].directory) {
        return;
      }

      const place = data.data[0].directory[0];
      const placeCardDiv = $(`#placeCardDiv-${id}`);
      let priceRange = "<p></p>";

      if (place.price_range) {
        priceRange = `<p>Price: <span style = 'color: green;'>${place.price_range}</span></p>`;
      }

      const placeCard = $(`
      <div class="flex flex-wrap placeCard" id="placecard-${place.name}">
          <div class="card bg-base-100 shadow-xl mb-[10px] w-[370px] text-wrap">
              <div class="card-body">  
                  <h2 class="card-title">${place.name}</h2>
                   <p class = 'break-words'>Adress: ${place.address}</p>
                   <p class = 'break-words'>Rating: ${place.rating} ⭐️ (${place.review_count} reviews)
                   ${priceRange}   
                   <button class="btn w-[78px] h-[48px] justify-self-end self-end btn-error" id="deleteCard-${place.name}">Delete</button> 
              </div>
              
            </div>
      </div>
      `);

      placeCard.appendTo(placeCardDiv);

      newMarker(id, place.name, place.latitude, place.longitude);
    });
}
// function to initialize the map
const maps = [];
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
  mapEl.css("z-index", "1");
}
// function that creates the markers on the map
async function newMarker(id, name, lat, lon) {
  const position = { lat: lat, lng: lon };
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const marker = new AdvancedMarkerElement({
    map: maps[id],
    position: position,
    title: `${name}`,
  });
}
// event listener for buttons on the document
$(document).on("click", "button", (e) => {
  const name = e.currentTarget.id.split("-");
  const tempArray = [];
  const trips = getLocalStorage("trips");

  let trip;
  trip = $(`#trip-${name[1]}`);
  trip.remove();
  // remove favorite location from travel card as well as from local storage
  let card = $(e.currentTarget).closest(".placeCard");
  card.remove();
  for (const trip of trips) {
    const placesArray = [];
    for (let i = 0; i < trip.places.length; i++) {
      if (trip.places[i].name == name[1]) {
      } else {
        placesArray.push({
          name: trip.places[i].name,
          address: trip.places[i].address,
        });
      }
    }
    trip.places = placesArray;
  }
  // remove trip from local storage
  for (const trip of trips) {
    if (trip.id == name[1]) {
    } else {
      tempArray.push(trip);
    }
  }
  saveLocalStorage("trips", tempArray);
  if (getLocalStorage("trips").length === 0) {
    location.href = "./index.html";
    localStorage.removeItem("currentCity");
    localStorage.removeItem("currentTrip");
    localStorage.removeItem("currentTripId");
  }
});
backButton.on("click", function () {
  //return to landing page
  window.location.href = "./index.html";
});
// theme toggler
themeButton.on("click", function () {
  if (html[0].dataset.theme === "light") {
    html[0].dataset.theme = "retro";
  } else if (html[0].dataset.theme === "retro") {
    html[0].dataset.theme = "halloween";
  } else if (html[0].dataset.theme === "halloween") {
    html[0].dataset.theme = "dark";
  } else if (html[0].dataset.theme === "dark") {
    html[0].dataset.theme = "light";
  } else {
    html[0].dataset.theme = "light";
  }

  saveLocalStorage("theme", html[0].dataset.theme);
});
// load on ready
$(document).ready(function () {
  setTimeout(renderTrips, 500);
  html[0].dataset.theme = getLocalStorage("theme") || "light";
  if (getLocalStorage("trips").length === 0) {
    location.href = "./index.html";
  }
});
