//This will be to render the saved information from LS 
//so that we can view previously scheduled trips by name, as well as the saved places of interest

const backButton = $('#backButton')


//a function to pull info from LS
    function getLocalStorage(key){
        return JSON.parse(localStorage.getItem(key)) || [] //this will return the JSON Object in LocalStorage
    }

//a function to save LS data
    function saveLocalStorage(key, item){
        localStorage.setItem(key. JSON.stringify(item))
    }


//Make a function to render LS info to Page
    function renderTrips(){


    }


     function getFavPlaceInfo(place){
        const str = place + ' in ' + getLocalStorage('currentCity')
        const replacedPlaceStr = str.replace(/\s/g, '%20')
        const url = `https://local-business-data.p.rapidapi.com/search?query=${replacedPlaceStr}&limit=20&zoom=13&language=en&region=us`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '8e3d00daf4mshd8fb0721ff0ee65p100d76jsnde8f75dad54d',
                'X-RapidAPI-Host': 'local-business-data.p.rapidapi.com'
            }
        };

     fetch(url, options).then(function(response){
            return response.json()
        }).then(function(data){
            console.log(data)
        })
        console.log(replacedPlaceStr)
    }





backButton.on('click', function(){
    //return to landing page
})