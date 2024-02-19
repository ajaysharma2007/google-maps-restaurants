import ListView from "../components/ListView/ListView";
import MapView from "../components/MapView/MapView";
import "./App.css";
import React, { useEffect, useState } from "react";
import { STATUS, loadBiz } from "../controller";
import { HighlightedContextProvider } from "../contexts/HighlightContext/HighlightContext";

var pastFetchLoc = { lat: null, lng: null };

function App() {
  // Context for managing the highlighted component

  const [biz, setBiz] = useState([]);
  const [bizLoadStatus, setBizLoadStatus] = useState(null);
  const [loc, setLoc] = useState({ lat: 51.532281, lng: -0.1777111 });

  async function reloadBiz() {
    if (
      bizLoadStatus !== STATUS.IN_PROG &&
      !(pastFetchLoc.lat === loc.lat && pastFetchLoc.lng === loc.lng)
    ) {
      console.log("Loading data", loc, bizLoadStatus, pastFetchLoc);
      setBizLoadStatus(STATUS.IN_PROG);
      pastFetchLoc = loc;
      var res = await loadBiz(loc);
      console.log("Res", res);
      setBizLoadStatus(res.status);
      if (res.status === STATUS.SUCC) {
        setBiz(res.biz);
      }
    }
  }

  useEffect(() => {
    reloadBiz();
  });

  return (
    <div className="App">
      <HighlightedContextProvider>
        <ListView biz={biz} />
        <MapView biz={biz} loc={loc} setLoc={setLoc} />
      </HighlightedContextProvider>
    </div>
  );
}

export default App;
