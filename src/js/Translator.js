import fr from '../data/translations/translations.fr.json';
import en from '../data/translations/translations.en.json';

export default class Translator {
    constructor(lang) {
        this.lang = lang;
        this.translations = lang === 'fr' ? fr : en;
    }

}