import React, { useContext } from "react";
import {
  HighlightedContext,
  useHiglightContext,
} from "../../contexts/HighlightContext/HighlightContext";
import "./ListChild.css";

export function ListChild(props) {
  const { highlightedId, setHighlightedId } = useHiglightContext();
  return (
    <div
      id={"list_loc_" + props.bizVal.id}
      className="BizCard"
      onClick={() => setHighlightedId("map_loc_" + props.bizVal.id)}
      style={{
        backgroundColor:
          highlightedId === "list_loc_" + props.bizVal.id
            ? "yellow"
            : "transparent",
      }}
    >
      {props.bizVal.name}
    </div>
  );
}
