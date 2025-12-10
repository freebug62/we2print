
class LibraryLoader {
    /**
     * Loads a JSON file from the given path and returns its content as a JSON object.
     * If the loading fails, it logs an error message to the console and returns an empty array.
     *
     * @static
     * @public
     * @param {string} path - The path to the JSON file to load.
     * @returns {Promise<JSON>} - A promise resolving to the loaded JSON object or an empty array in case of failure.
     */
    static async load(path) {
        try {
            const response = await fetch(path);
            const json = await response.json();
            return json;
        } catch (err) {
            console.log(`%cFailed to load library: ${err}`, 'background:tomato;color:white;padding:3px;');
            return [];
        }
    }
}

module.exports = LibraryLoader;
