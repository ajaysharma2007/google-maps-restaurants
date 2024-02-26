import { useEffect, useState } from "react";

const useMapViewHelper = (props) => {
  const [state, setState] = useState({
    map: null,
    mapApi: null,
    mapApiLoaded: false,
    places: [],
  });

  const [mapMarkers, setMapMarkers] = useState([]);
  const [clusteredMarkers, setClusteredMarkers] = useState([]);

  let listener;

  useEffect(() => {
    if (!state.map) return;
    console.log("Adding zoom_changed event listener...");
    listener = state.map.addListener("zoom_changed", handleZoomChange);

    return () => {
      console.log("Removing zoom_changed event listener...");
      state.mapApi.event.removeListener(listener);
    };
  }, [state.map, mapMarkers, clusteredMarkers]);

  useEffect(() => {
    console.log(clusteredMarkers);
    console.log("clusteredMarkers in use effect - end");
  }, [clusteredMarkers]);

  function apiHasLoaded(mapInstance, maps) {
    console.log("Resetting map in API has loaded");
    setState({
      map: mapInstance,
      mapApi: maps,
      mapApiLoaded: true,
      places: state.places,
    });
  }

  const addPlace = (place) => {
    setState({
      map: state.map,
      mapApi: state.mapApi,
      mapApiLoaded: state.mapApiLoaded,
      places: place,
    });

    const latlng = {
      lat: place[0].geometry.location.lat(),
      lng: place[0].geometry.location.lng(),
    };

    console.log("resetting map markers on place change");
    props.setLoc(latlng);
    props.setBiz([]);
    setMapMarkers([]);
  };

  function handleZoomChange(newMarkers) {
    console.log("In handle zoom change, the clusteredMarkers are : ");
    console.log("clusteredMarkers = ");
    console.log(clusteredMarkers);
    console.log("mapMarkers = ");
    console.log(mapMarkers);
    console.log(newMarkers);
    const bounds = state.map.getBounds();
    if (!bounds) {
      console.log("Empty map bounds. Returning....");
      return;
    }

    const iterableMarkers = mapMarkers.length === 0 ? newMarkers : mapMarkers;

    const clusters = groupMarkersIntoClustersOnSize(iterableMarkers);

    displayClusteredMarkers(clusters);
  }

  function groupMarkersIntoClustersOnSize(markers) {
    const clusters = [];
    markers.forEach((marker) => {
      let addedToCluster = false;
      clusters.forEach((cluster) => {
        if (markersOverlapOnSize(marker, cluster)) {
          if (!addedToCluster) {
            cluster.push(marker);
            addedToCluster = true;
          }
        }
      });
      if (!addedToCluster) {
        clusters.push([marker]);
      }
    });
    return clusters;
  }

  function getPixelPoint(markerPixel) {
    const scale = 1 << state.map.getZoom();
    return new state.mapApi.Point(
      Math.floor(markerPixel.x * scale),
      Math.floor(markerPixel.y * scale)
    );
  }
  function markersOverlapOnSize(marker, cluster) {
    const overlapThreshold = 40;

    const markerPixel = state.map
      .getProjection()
      .fromLatLngToPoint(marker.getPosition());

    const markerPixelPoint = getPixelPoint(markerPixel);

    for (let i = 0; i < cluster.length; i++) {
      const otherMarkerPixel = state.map
        .getProjection()
        .fromLatLngToPoint(cluster[i].getPosition());
      const otherMarkerPixelPoint = getPixelPoint(otherMarkerPixel);

      const distance = Math.sqrt(
        Math.pow(markerPixelPoint.x - otherMarkerPixelPoint.x, 2) +
          Math.pow(markerPixelPoint.y - otherMarkerPixelPoint.y, 2)
      );
      console.log(distance);
      if (distance < overlapThreshold) {
        return true;
      }
    }

    return false;
  }

  function displayClusteredMarkers(clusters) {
    console.log("Current Cluster Length : " + clusters.length);
    console.log(
      "clusteredMarkers Length in display: " + clusteredMarkers.length
    );
    console.log(clusteredMarkers);
    clusteredMarkers.forEach((marker) => marker.setMap(null));
    setClusteredMarkers([]);

    clusters.forEach((cluster) => {
      if (cluster.length === 1) {
        cluster[0].setMap(state.map);
        setClusteredMarkers((prevMarkers) => [...prevMarkers, cluster[0]]);
      } else {
        const averagePosition = calculateAveragePosition(cluster);
        const clusterMarker = new window.google.maps.Marker({
          position: averagePosition,
          map: state.map,
          label: {
            text: "" + cluster.length,
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
          },
        });
        setClusteredMarkers((prevMarkers) => [...prevMarkers, clusterMarker]);
      }
    });
  }

  function calculateAveragePosition(markers) {
    let sumLat = 0;
    let sumLng = 0;
    markers.forEach((marker) => {
      sumLat += marker.getPosition().lat();
      sumLng += marker.getPosition().lng();
    });
    const averageLat = sumLat / markers.length;
    const averageLng = sumLng / markers.length;
    return { lat: averageLat, lng: averageLng };
  }

  function renderRestaurants() {
    console.log("Loading marker data");
    console.log("props.biz");
    console.log(props.biz);
    const newMarkers = props.biz.map((marker) => {
      return new state.mapApi.Marker({
        position: {
          lat: marker.coordinates.latitude,
          lng: marker.coordinates.longitude,
        },
      });
    });
    if (newMarkers.length !== 0 && mapMarkers.length === 0) {
      setMapMarkers(newMarkers);
      handleZoomChange(newMarkers);
    }
  }

  return {
    state,
    apiHasLoaded,
    addPlace,
    renderRestaurants,
  };
};

export default useMapViewHelper;
