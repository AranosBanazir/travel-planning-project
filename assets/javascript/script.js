//Declaring elements to be used to get values from the form
const html = $("html");
const themeButton = $("#themeButton");
const tripNameInput = $("#tripName"); //Text input on the modal for the name of the trip
const tripStartDate = $("#startDate"); //Datepicker input for start of trip date
const tripEndDate = $("#endDate"); //Datepicker input for end of trip date
const cityInput = $("#cityInput"); //Name of city in which to visit
const modalForm = $("#saveTrip"); //button inside modal to save trip
const filter = $("#filterBtn"); //button to send the selected filters after the trip is picked
const accordianDiv = $("#accordianDiv");
const favPlaceList = $("#favPlaceList");
// Button to transition to the favorite trips pages
const favTripsBtn = $("#favTripsBtn");
const alertDiv = $("#alertDiv");
const restaurantList = $("#restaurantList");
const airportList = $("#airportList");
const hotelList = $("#hotelList");
const clothingList = $("#clothingList");
const healthcareList = $("#healthcareList");
const entertainmentList = $("#entertainmentList");
const footerEl = $("#filterAlertDiv");

let cityInfo = [];

//API Key
const geoKey = "a9d59121cb4743ac9edb7c6853265cb9";

//a function to pull info from LS
function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || []; //this will return the JSON Object in LocalStorage
}

//a function to save LS data
function saveLocalStorage(key, item) {
  localStorage.setItem(key, JSON.stringify(item));
}
// function to get categories from the HTML inputs
function getCategories(num) {
  const options = $(".menu input:checked");
  const categories = [];
  for (let i = 0; i < options.length; i++) {
    categories.push(options[i].dataset.categories);
  }

  if (num) {
    return options.length;
  }
  return categories.toString();
}
// function to clear list of locations in the accordion
function clearLists() {
  const lists = [
    "restaurant",
    "airport",
    "hotel",
    "clothing",
    "healthcare",
    "entertainment",
  ];
  for (const list of lists) {
    const listAccordion = $(`#${list}List`);
    listAccordion.empty();
  }
  markercount = 1;
}

//handles the modal submit to set up where information will be saved
function handleSubmit(e) {
  e.preventDefault();
  clearLists();

  const trips = getLocalStorage("trips");
  // if there is no information in the modal present an error alert
  if (
    !tripNameInput.val() ||
    !tripStartDate.val() ||
    !tripEndDate.val() ||
    !cityInput.val()
  ) {
    const alert =
      $(`<div id="alert-border-2" class="flex items-center p-4 mb-4 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800" role="alert">
    <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
    </svg>
    <div class="ms-3 text-sm font-medium">
      <p>Please fill out all fields</p>
    </div>
    <button type="button" id="alertClose" class="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"  data-dismiss-target="#alert-border-2" aria-label="Close">
      <span class="sr-only">Dismiss</span>
      <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
      </svg>
    </button>
</div>`);
    alert.appendTo(alertDiv);
    $("#alertClose").on("click", function () {
      alertDiv.html("");
    });
    return;
  }
  // creates the new trip object
  const newTrip = {
    trip: tripNameInput.val(),
    startDate: tripStartDate.val(),
    tripEndDate: tripEndDate.val(),
    city: cityInput.val(),
    id: Math.floor(Math.random() * 1000).toString(),
    places: [],
    coords: {},
  };
  // sets local storge with all the information, resets the modal form
  trips.push(newTrip);
  saveLocalStorage("trips", trips);
  saveLocalStorage("currentTrip", tripNameInput.val());
  saveLocalStorage("currentCity", cityInput.val());
  saveLocalStorage("currentTripId", newTrip.id);
  getGeoId(cityInput.val(), true);
  document.getElementById("newTripModal").close();
  tripNameInput.val("");
  tripStartDate.val("");
  tripEndDate.val("");
  cityInput.val("");
}

//function to get geoid: use https://api.geoapify.com/v1/geocode
//if initial then we want to just display the map and not gather information
function getGeoId(place, initial) {
  fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${place}&apiKey=${geoKey}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const id = data.features[0].properties.place_id;
      initMap(data.features[0].properties.lat, data.features[0].properties.lon);
      if (!initial) {
        getCityInfo(id); //this returns the internal ID for the given city from the Geoapify api
      }
      const trips = getLocalStorage("trips");
      // gather coordinates of location
      for (const trip of trips) {
        if (trip.id === getLocalStorage("currentTripId")) {
          trip.coords = {
            lat: data.features[0].properties.lat,
            lon: data.features[0].properties.lon,
          };
        }
      }
      saveLocalStorage("trips", trips);
    });
}

// function that gathers the information of the city
function getCityInfo(id) {
  //fetch information from Geoapify
  fetch(
    `https://api.geoapify.com/v2/places?categories=${getCategories()}&filter=place:${id}&limit=500&apiKey=${geoKey}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const places = data.features;
      for (const place of places) {
        renderPlacesToList(place.properties);
      }
    });
}
let markercount = 1;

// renders names of selectable locations into the accordion as buttons for the user to select
function renderPlacesToList(places) {
  const categories = places.categories;
  const favBtn = $(`<button>`);
  const newListItem = $(`<li>`);
  let name = places.name;

  if (!name) {
    name = places.address_line1;
  }
  if (categories.includes("catering")) {
    favBtn.text(`${markercount}. ${name}`);
    favBtn.appendTo(newListItem);
    favBtn.attr("data-address", places.address_line2);
    newListItem.appendTo(restaurantList);
    newMarker(name, "catering", places.lat, places.lon, markercount);
  } else if (categories.includes("accommodation")) {
    favBtn.text(`${markercount}. ${name}`);
    favBtn.appendTo(newListItem);
    favBtn.attr("data-address", places.address_line2);
    newListItem.appendTo(hotelList);
    newMarker(name, "accommodation", places.lat, places.lon, markercount);
  } else if (categories.includes("airport")) {
    favBtn.text(`${markercount}. ${name}`);
    favBtn.appendTo(newListItem);
    favBtn.attr("data-address", places.address_line2);
    newListItem.appendTo(airportList);
    newMarker(name, "airport", places.lat, places.lon, markercount);
  } else if (categories.includes("healthcare")) {
    favBtn.text(`${markercount}. ${name}`);
    favBtn.appendTo(newListItem);
    favBtn.attr("data-address", places.address_line2);
    newListItem.appendTo(healthcareList);
    newMarker(name, "healthcare", places.lat, places.lon, markercount);
  } else if (categories.includes("entertainment")) {
    favBtn.text(`${markercount}. ${name}`);
    favBtn.appendTo(newListItem);
    favBtn.attr("data-address", places.address_line2);
    newListItem.appendTo(entertainmentList);
    newMarker(name, "entertainment", places.lat, places.lon, markercount);
  } else if (categories.includes("commercial.clothing")) {
    favBtn.text(`${markercount}. ${name}`);
    favBtn.appendTo(newListItem);
    favBtn.attr("data-address", places.address_line2);
    newListItem.appendTo(clothingList);
    newMarker(name, "commercial", places.lat, places.lon, markercount);
  } else {
  }

  markercount++;
}

//Uses the Google Maps Library to generate and embed a google map element into a specified element
let map;
async function initMap(lat, lon) {
  const mapEl = $("#map");
  const position = { lat: lat, lng: lon };
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.querySelector("#map"), {
    zoom: 13,
    center: position,
    mapId: "123456",
  });

  mapEl.css("border-radius", "100px");
}

// function for generating the markers on the map
async function newMarker(where, type, lat, lon, mark) {
  const position = { lat: lat, lng: lon };
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { PinElement } = await google.maps.importLibrary("marker");

  //setting styles for each marker based on type
  const styles = {
    feature: {
      background: "red",
      borderColor: "black",
      glyph: `${mark}`,
      glyphColor: "white",
    },
    commercial: {
      background: "red",
      borderColor: "black",
      glyph: `${mark}`,
      glyphColor: "white",
    },
    catering: {
      background: "blue",
      borderColor: "white",
      glyph: `${mark}`,
      glyphColor: "white",
    },

    healthcare: {
      background: "green",
      borderColor: "black",
      glyph: `${mark}`,
      glyphColor: "white",
    },

    airport: {
      background: "pink",
      borderColor: "black",
      glyph: `${mark}`,
      glyphColor: "white",
    },

    entertainment: {
      background: "purple",
      borderColor: "black",
      glyph: `${mark}`,
      glyphColor: "white",
    },

    accommodation: {
      background: "white",
      borderColor: "black",
      glyph: `${mark}`,
      glyphColor: "black",
    },
  };

  const pin = new PinElement(styles[type]);

  const marker = new AdvancedMarkerElement({
    map: map, //using the globally set map var
    position: position,
    title: `${where}`,
    content: pin.element,
  });
}

// function for adding selected favorite places to the object in local storage
function addFavoriteToLocalStorage(favorite, name) {
  const address = favorite.dataset.address;
  const trips = getLocalStorage("trips");
  for (const trip of trips) {
    if (trip.id === getLocalStorage("currentTripId")) {
      trip.places.push({ name, address });
    }
  }
  saveLocalStorage("trips", trips);
}
// removes favorite location from object in local storage
function removeFavoritesFromLocalStorage(favorite) {
  const address = favorite.dataset.address;
  const trips = getLocalStorage("trips");

  for (const trip of trips) {
    const placesArray = [];
    if (trip.id === getLocalStorage("currentTripId")) {
      for (let i = 0; i < trip.places.length; i++) {
        if (trip.places[i].address == address) {
        } else {
          placesArray.push({
            name: trip.places[i].name,
            address: trip.places[i].address,
          });
        }
      }
      trip.places = placesArray;
    }

    saveLocalStorage("trips", trips);
  }
}

//event listeners
modalForm.on("submit", handleSubmit);
filter.on("click", function () {
  const errorMessage =
    $(`<div id="alert-border-2" class="flex items-center p-4 mb-4 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800" role="alert">
    <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
    </svg>
    <div class="ms-3 text-sm font-medium">
      <p>Please create a trip before applying filters</p>
    </div>
    <button type="button" id="alertClose" class="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"  data-dismiss-target="#alert-border-2" aria-label="Close">
      <span class="sr-only">Dismiss</span>
      <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
      </svg>
    </button>
</div>`);
  // checks to make sure that there is a trip in local storage on applying filters, otherwise prompts with dismissable alert
  if (getLocalStorage("currentCity").length > 0) {
    clearLists();
    getGeoId(getLocalStorage("currentCity"));
  } else {
    errorMessage.appendTo(footerEl);
    $("#alertClose").on("click", () => {
      footerEl.html("");
    });
  }
});
// event listener for accordion
accordianDiv.on("click", "button", function (e) {
  const name = e.target.innerText.split(".")[1].trim();
  const targetBtn = $(e.target);
  if (e.target.className === "bg-favorite") {
    removeFavoritesFromLocalStorage(e.target);
  } else {
    addFavoriteToLocalStorage(e.target, name);
  }

  targetBtn.toggleClass("bg-favorite");
});
// event listener for favorite trips, moves user to trips.html
favTripsBtn.on("click", function () {
  window.location.href = "./trips.html";
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
  html[0].dataset.theme = getLocalStorage("theme") || "light";
});
