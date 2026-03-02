import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { setContext } from "@apollo/client/link/context";

const httpLink = new UploadHttpLink({ uri: "/graphql" });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
