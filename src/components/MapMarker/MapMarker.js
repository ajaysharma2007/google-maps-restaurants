import { useContext } from "react";
import { useHiglightContext } from "../../contexts/HighlightContext/HighlightContext";
import "./MapMarker.css";

export function MapMarker(props) {
  const { highlightedId, setHighlightedId } = useHiglightContext();
  return (
    <div
      id={"map_loc_" + props.bizId}
      className={props.className}
      lat={props.lat}
      lng={props.lng}
      text={props.text}
      onClick={() => setHighlightedId("list_loc_" + props.bizId)}
      style={{
        backgroundColor:
          highlightedId === "map_loc_" + props.bizId ? "yellow" : "transparent",
      }}
    >
      <i className="fi-marker"></i>
    </div>
  );
}
