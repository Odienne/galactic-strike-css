let lang = 'fr';
let translations = {};

const setLanguage = (newLang) => {
    lang = newLang;

    translateAll();

    return lang;
}

const getTranslations = async (lang) => {
    const translationsFile = `src/data/translations/translations.${lang}.json`;
    try {
        const response = await fetch(translationsFile);
        return await response.json();
    } catch (error) {
        console.error(`Error loading translations file: ${error}`);
        return {};
    }
}

const translate = (key) => {
    return translations[key] || key; // return the original key if no translation is found
}

async function translateAll() {
    translations = await getTranslations(lang);

    // Now safely call translate and update the DOM
    document.getElementById("score-text").textContent = translate("score");
}


window.addEventListener("DOMContentLoaded", () => {
    setLanguage('fr');
});

//to make it accessible to Qt app
window.setLanguage = setLanguage;