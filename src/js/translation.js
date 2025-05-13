const getLangParam = () =>  {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || 'fr'; // default to French if no lang param is provided
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

const lang = getLangParam();
let translations = {};

window.addEventListener("DOMContentLoaded", async () => {
    translations = await getTranslations(lang);

    // Now safely call translate and update the DOM
    document.getElementById("score-text").textContent = translate("score");
});