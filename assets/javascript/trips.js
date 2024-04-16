//This will be to render the saved information from LS
//so that we can view previously scheduled trips by name, as well as the saved places of interest
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
// testing function to retrieve trips from LS
// TODO remove the console.logs and remove dependency on clicking the button to render
function getTrips() {
  const savedTrips = getLocalStorage("trips");
  console.log(savedTrips);
  return savedTrips;
}
//Make a function to render LS info to Page
// TODO remove the console.logs and remove dependency on clicking the button to render
function renderTrips() {
  const trips = getTrips();
  tripList.empty();
  trips.forEach((trip) => {
    const tripCard = `
    <div class="collapse collapse-arrow bg-base-200">
    <input type="radio" name="my-accordion-2" checked="checked" />
    <div class="collapse-title text-xl font-medium">${trip.trip} Location: ${trip.city} - ${trip.startDate} To: ${trip.tripEndDate}</div>
    <div class="collapse-content">
    <div id="map-${trip.id}" class="row-span-full">
    <img src="https://placehold.co/600x400">
    </div>
    </div>
  </div>`;
    tripList.append(tripCard);
  });
}

function deleteTrip() {}

function getFavPlaceInfo(place) {
  const str = place + " in " + getLocalStorage("currentCity");
  const replacedPlaceStr = str.replace(/\s/g, "%20");
  const url = `https://local-business-data.p.rapidapi.com/search?query=${replacedPlaceStr}&limit=20&zoom=13&language=en&region=us`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "8e3d00daf4mshd8fb0721ff0ee65p100d76jsnde8f75dad54d",
      "X-RapidAPI-Host": "local-business-data.p.rapidapi.com",
    },
  };

  fetch(url, options)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
    });
  console.log(replacedPlaceStr);
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
