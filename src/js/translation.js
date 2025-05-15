import Translator from './Translator.js';

let lang = 'fr';
let translations = {};

function setLanguage(newLang) {
    lang = newLang;

    translateAll();

    return lang;
}

const translate = (key) => {
    return translations[key] || key; // return the original key if no translation is found
}

async function translateAll() {
    translations = new Translator(lang).translations;

    // Now safely call translate and update the DOM
    document.getElementById("score-text").textContent = translate("score");
}


window.addEventListener("DOMContentLoaded", () => {
    setLanguage('fr');
});

//to make it accessible to Qt app
window.setLanguage = setLanguage;