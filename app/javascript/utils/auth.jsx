import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import client from "./apollo";

const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      email
      firstName
      lastName
      fullName
      role
    }
  }
`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const { data, loading: queryLoading } = useQuery(CURRENT_USER, {
    skip: !token,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    if (!queryLoading) {
      setUser(data?.currentUser || null);
      setLoading(false);
    }
  }, [data, queryLoading, token]);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    client.resetStore();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
