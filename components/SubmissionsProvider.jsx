"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authClient } from "@/lib/auth-client";

const SubmissionsContext = createContext({
  submittedSlugs: [],
  submittedDepartments: [],
  isLoadingSubmissions: false,
  markSubmitted: () => {},
  refreshSubmissions: async () => {},
});

export function SubmissionsProvider({ children }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [submittedSlugs, setSubmittedSlugs] = useState([]);
  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const fetchSubmissions = useCallback(async (email) => {
    if (!email) {
      setSubmittedSlugs([]);
      setSubmittedDepartments([]);
      return;
    }
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch(
        `/api/check-applications?email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data?.submittedSlugs) setSubmittedSlugs(data.submittedSlugs);
      if (data?.submittedDepartments)
        setSubmittedDepartments(data.submittedDepartments);
    } catch (err) {
      console.error("Error checking submissions:", err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email) fetchSubmissions(user.email);
    else {
      setSubmittedSlugs([]);
      setSubmittedDepartments([]);
    }
  }, [user?.email, fetchSubmissions]);

  const markSubmitted = useCallback((slugs = [], names = []) => {
    setSubmittedSlugs((prev) => [...new Set([...prev, ...slugs])]);
    setSubmittedDepartments((prev) => [...new Set([...prev, ...names])]);
  }, []);

  const refreshSubmissions = useCallback(async () => {
    if (user?.email) await fetchSubmissions(user.email);
  }, [user?.email, fetchSubmissions]);

  return (
    <SubmissionsContext.Provider
      value={{
        submittedSlugs,
        submittedDepartments,
        isLoadingSubmissions,
        markSubmitted,
        refreshSubmissions,
      }}
    >
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  return useContext(SubmissionsContext);
}
