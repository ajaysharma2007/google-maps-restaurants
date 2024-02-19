import { useState } from "react";
import { MapMarker } from "../MapMarker/MapMarker";
import Cluster from "../Cluster/Cluster";

const useMapViewHelper = (props) => {
  const [state, setState] = useState({
    mapApiLoaded: false,
    mapInstance: null,
    mapApi: null,
    places: [],
  });

  const apiHasLoaded = (map, maps) => {
    setState({
      mapApiLoaded: true,
      mapInstance: map,
      mapApi: maps,
      places: [],
    });
  };

  const addPlace = (place) => {
    setState({
      mapApiLoaded: state.mapApi,
      mapInstance: state.mapInstance,
      mapApi: state.mapApi,
      places: place,
    });

    const latlng = {
      lat: place[0].geometry.location.lat(),
      lng: place[0].geometry.location.lng(),
    };
    props.setLoc(latlng);
  };

  function groupMarkersIntoClusters(markers) {
    var clusters = [];
    markers.forEach(function (marker) {
      var clusterAdded = false;
      clusters.forEach(function (cluster) {
        if (markersOverlap(marker, cluster)) {
          cluster.addMarker(marker);
          clusterAdded = true;
        }
      });
      if (!clusterAdded) {
        var newCluster = new Cluster(props);
        newCluster.addMarker(marker);
        clusters.push(newCluster);
      }
    });
    return clusters;
  }

  function markersOverlap(marker, cluster) {
    var center = cluster.getCenter();
    var distance = props.mapApi.geometry.spherical.computeDistanceBetween(
      center,
      new props.mapApi.LatLng(marker.lat, marker.lng)
    );
    return distance < 10000; // Adjust the distance threshold as needed
  }

  const getMergedCoordinates = (overlappingDist) => {
    var clusters = [];
    props.biz.forEach(function (marker) {
      var clusterAdded = false;
      clusters.forEach(function (cluster) {
        if (markersOverlap(marker, cluster)) {
          cluster.addMarker(marker);
          clusterAdded = true;
        }
      });
      if (!clusterAdded) {
        const newCluster = Cluster(props.map);
        newCluster.addMarker(marker);
        clusters.push(newCluster);
      }
    });
  };

  const mapChildren = getMergedCoordinates(0.5).map(function (coordinate) {
    console.log(coordinate.lat());
    console.log(coordinate.lng());
    return (
      <MapMarker
        lat={coordinate.lat()}
        lng={coordinate.lng()}
        className="marker"
        key={"" + coordinate.lat() + "" + coordinate.lng()}
        text={"" + coordinate.lat() + "" + coordinate.lng()}
      ></MapMarker>
    );
  });

  const mapChildrenOriginal = props.biz.map(function (currentBiz) {
    return (
      <MapMarker
        lat={currentBiz.coordinates.latitude}
        lng={currentBiz.coordinates.longitude}
        className="marker"
        text={currentBiz.name}
        key={"map_" + currentBiz.id}
        bizId={currentBiz.id}
      ></MapMarker>
    );
  });

  const mainLocation = state.places.map(function (currentBiz) {
    return (
      <MapMarker
        lat={currentBiz.geometry.location.lat()}
        lng={currentBiz.geometry.location.lng()}
        text={currentBiz.name}
        key={"map_" + currentBiz.id}
        bizId={currentBiz.id}
        className="marker-center"
      ></MapMarker>
    );
  });

  return {
    state,
    apiHasLoaded,
    addPlace,
    mapChildren,
    mapChildrenOriginal,
    mainLocation,
  };
};

export default useMapViewHelper;
