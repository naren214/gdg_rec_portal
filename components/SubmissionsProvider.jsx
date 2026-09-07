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
  recentSubmission: null,
  isLoadingSubmissions: false,
  markSubmitted: () => {},
  clearRecentSubmission: () => {},
  refreshSubmissions: async () => {},
});

export function SubmissionsProvider({ children }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userEmail = user?.email;
  const [submittedSlugs, setSubmittedSlugs] = useState([]);
  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [recentSubmission, setRecentSubmission] = useState(null);
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
    if (userEmail) {
      void Promise.resolve().then(() => fetchSubmissions(userEmail));
      return;
    }

    queueMicrotask(() => {
      setSubmittedSlugs([]);
      setSubmittedDepartments([]);
      setRecentSubmission(null);
      setIsLoadingSubmissions(false);
    });
  }, [userEmail, fetchSubmissions]);

  const markSubmitted = useCallback((slugs = [], names = []) => {
    setSubmittedSlugs((prev) => [...new Set([...prev, ...slugs])]);
    setSubmittedDepartments((prev) => [...new Set([...prev, ...names])]);
    setRecentSubmission({ slugs, names, createdAt: Date.now() });
  }, []);

  const clearRecentSubmission = useCallback(() => {
    setRecentSubmission(null);
  }, []);

  const refreshSubmissions = useCallback(async () => {
    if (userEmail) await fetchSubmissions(userEmail);
  }, [userEmail, fetchSubmissions]);

  return (
    <SubmissionsContext.Provider
      value={{
        submittedSlugs,
        submittedDepartments,
        recentSubmission,
        isLoadingSubmissions,
        markSubmitted,
        clearRecentSubmission,
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
