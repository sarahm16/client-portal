function deepSearch(searchTerm, array) {
  let results = [];

  function searchInObject(obj) {
    for (let key in obj) {
      if (typeof obj[key] === "object") {
        if (searchInObject(obj[key])) {
          return true;
        }
      } else if (typeof obj[key] === "string") {
        const propertyValue = obj[key].toLowerCase();
        const searchWords = searchTerm.toLowerCase().split(" ");
        if (searchWords.every((word) => propertyValue.includes(word))) {
          return true;
        }
      } else if (typeof obj[key] === "number") {
        const propertyValue = obj[key].toString();
        const searchWords = searchTerm.toLowerCase().split(" ");
        if (searchWords.every((word) => propertyValue.includes(word))) {
          return true;
        }
      }
    }
    return false;
  }

  for (let i = 0; i < array.length; i++) {
    let obj = array[i];
    if (searchInObject(obj)) {
      results.push(obj);
    }
  }

  return results;
}

export default deepSearch;
