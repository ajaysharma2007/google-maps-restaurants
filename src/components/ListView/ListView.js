import React from "react";
import { HighlightedContextProvider } from "../../contexts/HighlightContext/HighlightContext";
import "./ListView.css";
import { ListChild } from "../ListChild/ListChild";

export default function ListView(props) {
  return (
    <div id="list-view" className="ListView">
      <h3>List of restaurants are:</h3>
        {props.biz.map(function (key) {
          return <ListChild bizVal={key} key={"list_" + key.id} />;
        })}
    </div>
  );
}
