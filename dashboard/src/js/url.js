

export function getLocation() {
    let parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;

    parser.href = window.location;

    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}

/**
 * Derive the app's state from the url. Values are not parsed into their expected types, and missing parameters will be
 * left as undefined.
 *
 * examples
 *
 *     /dashboard?plan=apollo&mission=eca72d57a7a6473385877a7e0d1ba5ac&dark
 *
 * --> display the mission eca72d57a7a6473385877a7e0d1ba5ac from the plan apollo and enable dark mode
 *
 *     /dashboard?plan=apollo&view=pictogram&labels=false
 *
 * --> display the plan apollo with no selected mission with the pictogram view mode with labels disabled
 *
 */
export function URLToState() {
  let location = getLocation();
  let state = {};

  location.search.slice(1).split("&").forEach(d => {

    let dd = d.split("=");

    state[dd[0]] = decodeURIComponent(dd[1] ?? "true")

  });

  return state
}


/**
 * Convert the current state of the app to a URL string given the changes to state defined in the mappings provided.
 * @param mappings
 * @returns {string}
 */
export function stateToURL(mappings) {

  // get the current state to get the values of all other params
  let state = URLToState();

  // never show the key in the URL
  delete state.key

  mappings.forEach(d => {
    Object.assign(state, d)
  });

  let params = Object.keys(state).map(d => {
    // if parameter value is just null or 'true' leave it out, and it will take the default value
    if (d === "" || state[d] === null) {
      return null
    }
    // if parameter value is just 'true' leave it out, and it will take the default value
    else if (encodeURIComponent(state[d]) === "true") {
      return d
    }
    // if the value is false and the key is labels or dark just remove them, and they will take the default (false)
    else if (d === "demo" || d === "dark") {
      return null
    }
    else {
      return `${d}=${encodeURIComponent(state[d])}`
    }
  }).filter(d => d !== null).join("&");

  return window.location.pathname + (params ? "?" + params : "")
}
