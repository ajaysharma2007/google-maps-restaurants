import { createContext, useContext, useState } from "react";

const HighlightedContext = createContext();

function HighlightedContextProvider({ children }) {
  const [highlightedId, setHighlightedId] = useState(null);

  return (
    <HighlightedContext.Provider value={{ highlightedId, setHighlightedId }}>
      {children}
    </HighlightedContext.Provider>
  );
}

function useHiglightContext() {
  const higlightContext = useContext(HighlightedContext);
  if (higlightContext === undefined) {
    throw new Error(
      "Highlight context not availabe at this location. Check if the current element is within the provider"
    );
  }
  return higlightContext;
}

export { HighlightedContextProvider, useHiglightContext };
