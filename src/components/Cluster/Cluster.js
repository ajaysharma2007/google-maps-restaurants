function Cluster(props) {
  this.map = props.map;
  this.markers = [];
  this.bounds = props.mapApi.LatLngBounds();
  this.center = null;
  this.clusterMarker = null;

  function addMarker(marker) {
    this.markers.push(marker);
    this.bounds.extend(new props.mapApi.LatLng(marker.lat, marker.lng));
    if (this.center === null) {
      this.center = new props.mapApi.LatLng(marker.lat, marker.lng);
    } else {
      var lat =
        (this.center.lat() * (this.markers.length - 1) + marker.lat) /
        this.markers.length;
      var lng =
        (this.center.lng() * (this.markers.length - 1) + marker.lng) /
        this.markers.length;
      this.center = new props.mapApi.LatLng(lat, lng);
    }
    this.updateCluster();
  }

  function updateCluster(cluster) {
    if (this.clusterMarker) {
      this.clusterMarker.setMap(null);
    }
    if (this.markers.length > 1) {
      this.clusterMarker = new props.mapApi.Marker({
        position: this.center,
        map: this.map,
        icon: {
          url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/library_maps.png",
          scaledSize: new props.mapApi.Size(50, 50), // Adjust the size of the cluster marker icon
        },
        label: {
          text: "" + this.markers.length,
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
        },
      });
    } else {
      var marker = this.markers[0];
      new props.mapApi.Marker({
        position: new props.mapApi.LatLng(marker.lat, marker.lng),
        map: this.map,
      });
    }
  }
}

export default Cluster;
