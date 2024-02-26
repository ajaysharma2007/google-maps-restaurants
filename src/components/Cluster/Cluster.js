class Cluster {
  constructor(props) {
    this.map = props.map;
    this.mapApi = props.mapApi;
    this.markers = [];
    this.bounds = new window.google.maps.LatLngBounds();
    this.center = null;
    this.clusterMarker = null;
  }

  getCenter() {
    return this.center;
  }

  getBounds() {
    return this.bounds;
  }

  addMarker(marker) {
    this.markers.push(marker);
    this.bounds.extend(new this.mapApi.LatLng(marker.lat, marker.lng));
    if (this.center === null) {
      this.center = new this.mapApi.LatLng(marker.lat, marker.lng);
    } else {
      var lat =
        (this.center.lat() * (this.markers.length - 1) + marker.lat) /
        this.markers.length;
      var lng =
        (this.center.lng() * (this.markers.length - 1) + marker.lng) /
        this.markers.length;
      this.center = new this.mapApi.LatLng(lat, lng);
    }
  }
}

export default Cluster;
