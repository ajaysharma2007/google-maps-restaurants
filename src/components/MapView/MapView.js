import React from "react";
import "./MapView.css";
import { GOOGLE_API_KEY } from "../../constants";
import SearchBox from "../SearchBox/SearchBox";
import UseMyLocation from "../UseMyLocation/UseMyLocation";
import GoogleMapReact from "google-map-react";
import useMapViewHelper from "./MapViewHelper";

export default function MapView(props) {
  const { state, apiHasLoaded, addPlace, renderRestaurants } =
    useMapViewHelper(props);

  return (
    <div id="map-view" className="MapView">
      <GoogleMapReact
        bootstrapURLKeys={{
          key: GOOGLE_API_KEY,
          libraries: ["places", "geometry"],
        }}
        center={props.loc}
        zoom={15}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => apiHasLoaded(map, maps)}
      >
        {renderRestaurants()}
        {/* {state.mapApiLoaded && getMapChildren()} */}
      </GoogleMapReact>
      <div className="SearchBoxContainer">
        {state.mapApiLoaded && (
          <SearchBox
            map={state.map}
            mapApi={state.mapApi}
            addplace={addPlace}
          />
        )}
      </div>
      <div className="UseMyLocationContainer">
        <UseMyLocation {...props} />
      </div>
    </div>
  );
}
