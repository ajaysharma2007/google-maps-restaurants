import React, { useEffect, useRef } from "react";

const SearchBox = ({ map, mapApi, addplace }) => {
  let searchInputRef = useRef(null);

  let searchBox;
  useEffect(() => {
    searchBox = new mapApi.places.SearchBox(searchInputRef.current);
    searchBox.addListener("places_changed", onPlacesChanged);
    const boundsChangedListener = () => {
      searchBox.setBounds(map.getBounds());
    };

    map.addListener("bounds_changed", boundsChangedListener);

    return () => {
      mapApi.event.clearInstanceListeners(searchInputRef.current);
    };
  }, []);

  const onPlacesChanged = () => {
    const selected = searchBox.getPlaces();
    const place = selected[0];
    if (!place.geometry) return;
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    addplace(selected);
    searchInputRef.current.blur();
  };

  const clearSearchBox = () => {
    searchInputRef.current.value = "";
  };

  return (
    <input
      ref={searchInputRef}
      type="text"
      onFocus={clearSearchBox}
      placeholder="Enter a location"
    />
  );
};

export default SearchBox;
