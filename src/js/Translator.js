import fr from '../data/translations/translations.fr.json';
import en from '../data/translations/translations.en.json';

export default class Translator {
    constructor(lang) {
        this.translations = lang.toLowerCase() === 'fr' ? fr : en;
    }
}