/**
 * Performs a simple full text search on the given element and looks
 * for the given search string.
 * 
 * @param {object|string} elem single nested object or a string
 * @param {*} searchStr what shall be searched for
 * @returns {boolean} whether the search string was found
 */
export const fullTextSearch = (elem, searchStr) => {
    if (typeof elem === "object") {
        const elemVals = Object.values(elem);
        
        for (let value of elemVals) {
            if (String(value).toLowerCase().includes(searchStr.toLowerCase())) {
                return true;
            }
        }
        return false;

    } else if (typeof elem === "string") {
        return elem.toLowerCase().includes(searchStr.toLowerCase());
    } else {
        throw new Error("fullTextSearch only supports objects and string to search in");
    };
};

/**
 * Searches for occurences of a string in an array. 
 * Eeach item in the array that has the searchString as a substring is a valid search result.
 * 
 * @param {*} array holds the items that are searched
 * @param {*} searchString specifies what should be searched for
 * @returns {array} containing the indices of all elements in the array where the searchString matched
 */
 export const performSearch = (array, searchString) => {
    let arrayMappedToIndices = array.map(
        (elem, index) => ({index, value: elem})
    )
    arrayMappedToIndices = arrayMappedToIndices.filter(
        ({index, value}) => fullTextSearch(value, searchString)
    )
    
    return arrayMappedToIndices.map(({index, value}) => index)
}