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


backButton.on('click', function(){
    //return to landing page
})