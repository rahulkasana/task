import { useMutation, useQuery } from "@tanstack/react-query";
import { login, signup, fetchMe } from "../api/auth";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => useContext(AuthContext);

export const useLogin = () => {
  const { login: setAuth } = useAuth();
  return useMutation(
    (data: { email: string; password: string }) => login(data),
    {
      onSuccess: ({ data }) => {
        setAuth(data.token);
      },
    },
  );
};

export const useSignup = () => {
  const { login: setAuth } = useAuth();
  return useMutation(
    (data: { email: string; password: string }) => signup(data),
    {
      onSuccess: ({ data }) => setAuth(data.token),
    },
  );
};

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe().then((res) => res.data),
  });
