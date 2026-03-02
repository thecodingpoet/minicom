import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import App from "./App";
import client from "./utils/apollo";

const root = createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
);
