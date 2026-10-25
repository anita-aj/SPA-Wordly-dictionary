const definitionAPi = "https://en.wiktionary.org/api/rest_v1/page/definition/"
const synonymsAPi = "https://api.datamuse.com/words?rel_syn=";


//removes Wiktionary's html tags
function cleanText(html){
    return html.replace(/<[^>]*>/g,"")
}


//gets definitions from the wiktionary API
async function getDefinitions(word){
    const response = await fetch(definitionAPi + word);

    if(!response.ok){
        throw new Error(`No definition found for "${word}"!`);
    }
    
    const data = await response.json();
    
    if(!data.en){
        throw new Error(`No English definition found for "${word}"!`);
    }
    return data.en;
}

//gets synonyms from Datamuse API
async function fetchSynonyms(word){
    try{
        const response = await fetch(synonymsAPi + word + "&max=5");
        const data = await response.json();
        return data.map((item) => item.word);
    }catch(error){
        return [];
    }
}

//selecting elements that will be used in the displayWord function
const meanings = document.getElementById("meanings");
const source = document.getElementById("source");
const wordTitle = document.getElementById("word");
const synonymsDisplay = document.getElementById("synonyms");
const searchResult = document.getElementById("search-result");

let currentWord ="";
//displays the data for the word: part of speech, definition, examples
function displayWord(word, entries, synonyms){
    currentWord = word;
    wordTitle.textContent = word;
    meanings.innerHTML = "";

    entries.forEach((entry) => {
        const partOfSpeech = document.createElement("h3")
        partOfSpeech.textContent = entry.partOfSpeech;
        partOfSpeech.classList.add("mt-4", "font-semibold", "italic");
        meanings.appendChild(partOfSpeech);

        const list = document.createElement("ol");
        list.classList.add("ml-6","list-decimal");
        entry.definitions.forEach((item)=>{
            
            if(!item.definition)
                return;
        
            const listItem = document.createElement("li");
        listItem.textContent = cleanText(item.definition)
        if(item.examples && item.examples.length){
            const example = document.createElement("p");
            example.textContent = "Example: " + cleanText(item.examples[0]);
            example.classList.add("text-sm", "text-gray-500");
            listItem.appendChild(example);
            }
             list.appendChild(listItem);
               });
        meanings.appendChild(list);
    });

//checks whether the synonymsAPI returned any synonyms for the searched word.
    if (synonyms.length) {
        synonymsDisplay.textContent = synonyms.join(", ");
    } else {
        synonymsDisplay.textContent = `There are no synonyms for ${word}`;
    }

//creates a clickable link to the searched word's page on Wiktionary.
    source.href = "https://en.wiktionary.org/wiki/" + word;
    source.textContent = "Wiktionary";

    updateFavourites();
    searchResult.classList.remove("hidden");
}


//handles errors encountered in displaying the data for the word
async function fetchWord(word){
    try{
        const entries = await getDefinitions(word);
        const synonyms = await fetchSynonyms(word);
        hideError();
        displayWord(word, entries, synonyms);
    }catch(error){
        searchResult.classList.add("hidden")    
   //Handles network failure
    if(error instanceof TypeError){
        showError("Network failure! Please check your connection")
    }else{
        showError(error.message);
    }
    }
}



let favourites = [];


const favouriteButton = document.getElementById("favourite-button");
const favouritesList = document.getElementById("favourites");
const noFavourites = document.getElementById("no-favourites");


// Updates the favourite button and restructures the favourites list
function updateFavourites() {
    const saved = favourites.includes(currentWord);
    favouriteButton.textContent = saved ? "\u2665  Favourite" : "\u2661 Favourite";
    searchResult.classList.toggle("bg-yellow-100", saved);

    noFavourites.classList.toggle("hidden", favourites.length > 0);
    favouritesList.innerHTML = "";

    for(const word of favourites){
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = word;
        button.classList.add("rounded", "bg-yellow-100", "px-3", "py-1", "hover:underline");
        button.addEventListener("click", () => fetchWord(word));
        listItem.appendChild(button);
        favouritesList.appendChild(listItem);
    };
}


// Adds the word to favorites, or removes it if it is already saved
function toggleFavourite() {
    if (favourites.includes(currentWord)) {
        favourites = favourites.filter((word) => word !== currentWord);
    } else {
        favourites.push(currentWord);
    }
    //Keeps the selected favourite words even when you refresh the page
    localStorage.setItem("favourites", JSON.stringify(favourites)); 
    updateFavourites();
}


const errorMessage = document.getElementById("error-message");
//manages error messages. showError() displays an error message to the user while hideError() clears the message and hides it.
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}



const form = document.getElementById("form");
const pronunciationButton = document.getElementById("pronunciation-button");
const searchInput = document.getElementById("search-input");


//It checks whether the code is running in a browser, then loads saved favourite words from localStorage or initializes an empty array if none exist.It then refreshes the favourites display to reflect the loaded words.
if (typeof window !== "undefined") {
    favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    updateFavourites();

//adds a submit event listener to the form and ensures a correct word is entered
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); 
        const word = searchInput.value.trim().toLowerCase();

        if (word === "") {
            showError("Please enter a word to search.");
            return;
        }

        if (!/^[a-z' -]+$/.test(word)) {
            showError("Please use letters only. Numbers and symbols are not accepted : )");
            return;
        }
        await fetchWord(word);
    });

    favouriteButton.addEventListener("click", toggleFavourite);

//allows the user to hear the pronunciation of the searched word
    pronunciationButton.addEventListener("click", () => {
        speechSynthesis.speak(new SpeechSynthesisUtterance(currentWord));
    });
}

// Lets indexTest.js use these functions 
if (typeof module !== "undefined") {
    module.exports = { getDefinitions, fetchSynonyms, cleanText };
}




