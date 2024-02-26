import { useEffect, useRef, useState } from "react";
import { MapMarker } from "../MapMarker/MapMarker";
import Cluster from "../Cluster/Cluster";

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

  let prevMarkers = useRef([]);

  let allMarkers = [];

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

  function clearPrevMarkers() {
    for (let prevMarker of prevMarkers.current) {
      prevMarker.setMap(state.map);
      prevMarker.setMap(null);
    }
  }

  function clearMarkers() {
    console.log("clearing the markers");
    clusteredMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    setClusteredMarkers([]);
  }

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
    const visibleMarkers = iterableMarkers.filter((marker) =>
      bounds.contains(marker.getPosition())
    );

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
    const averagePosition = calculateAveragePosition(cluster);

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

  function groupMarkersIntoClusters(markers) {
    var clusters = [];
    allMarkers = markers.map((marker) => {
      return {
        lat: marker.coordinates.latitude,
        lng: marker.coordinates.longitude,
      };
    });

    allMarkers.forEach(function (marker) {
      var clusterAdded = false;
      clusters.forEach(function (cluster) {
        if (markersOverlap(marker, cluster)) {
          if (!clusterAdded) {
            cluster.addMarker(marker);
            clusterAdded = true;
          }
        }
      });
      if (!clusterAdded) {
        var newCluster = new Cluster(state);
        newCluster.addMarker(marker);
        clusters.push(newCluster);
      }
    });
    return clusters;
  }

  function markersOverlap(marker, cluster) {
    var center = cluster.getCenter();
    var distance = state.mapApi.geometry.spherical.computeDistanceBetween(
      center,
      new state.mapApi.LatLng(marker.lat, marker.lng)
    );
    return distance < 1000; // Adjust the distance threshold as needed
  }

  function getZoomLevel(bounds, map) {
    const MAX_ZOOM = 21; // Maximum allowed zoom level
    const MIN_ZOOM = 0; // Minimum allowed zoom level

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    let zoomMax = map.getZoom();
    let zoomMin = MIN_ZOOM;

    let currentBounds;
    let zoom;
    do {
      zoom = Math.floor((zoomMax + zoomMin) / 2);
      currentBounds = new window.google.maps.LatLngBounds(sw, ne);
      const center = currentBounds.getCenter();
      const projection = map.getProjection();
      const swPixel = projection.fromLatLngToPoint(sw);
      const nePixel = projection.fromLatLngToPoint(ne);
      const centerPixel = projection.fromLatLngToPoint(center);

      const halfMapWidth = Math.abs(nePixel.x - swPixel.x) / 2;
      const halfMapHeight = Math.abs(nePixel.y - swPixel.y) / 2;
      const halfBoundsWidth = Math.abs(nePixel.x - centerPixel.x);
      const halfBoundsHeight = Math.abs(nePixel.y - centerPixel.y);

      if (
        halfBoundsWidth <= halfMapWidth &&
        halfBoundsHeight <= halfMapHeight
      ) {
        break;
      }
      if (halfBoundsWidth > halfMapWidth || halfBoundsHeight > halfMapHeight) {
        zoomMin = zoom;
      } else {
        zoomMax = zoom;
      }
    } while (zoomMax - zoomMin > 1);

    return zoom;
  }

  function renderClusters(clusters) {
    clearPrevMarkers();
    const bounds = new window.google.maps.LatLngBounds();
    clusters.forEach(function (cluster) {
      if (cluster.markers.length > 1) {
        cluster.clusterMarker = new cluster.mapApi.Marker({
          position: cluster.center,
          map: cluster.map,
          icon: {
            url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/library_maps.png",
            scaledSize: new cluster.mapApi.Size(30, 30), // Adjust the size of the cluster marker icon
          },
          label: {
            text: "" + cluster.markers.length,
            color: "red",
            fontSize: "16px",
            fontWeight: "bold",
          },
        });
        prevMarkers.current.push(cluster.clusterMarker);
      } else {
        var marker = cluster.markers[0];
        let mapMarker = new cluster.mapApi.Marker({
          position: new cluster.mapApi.LatLng(marker.lat, marker.lng),
          map: cluster.map,
        });
        prevMarkers.current.push(mapMarker);
      }
      bounds.union(cluster.getBounds());
    });
    const zoomLevel = getZoomLevel(bounds, state.map);
    state.map.setCenter(bounds.getCenter());
    // state.map.setZoom(zoomLevel);
    state.map.fitBounds(bounds);
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

  function getMapChildren() {
    let clusters = [];
    clusters = groupMarkersIntoClusters(props.biz);
    renderClusters(clusters);
    return;
  }

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
    getMapChildren,
    mapChildrenOriginal,
    mainLocation,
    renderRestaurants,
  };
};

export default useMapViewHelper;
