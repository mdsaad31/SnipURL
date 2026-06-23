"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface LinkData {
  id: string;
  user_id: string | null;
  original_url: string;
  short_code: string;
  title: string | null;
  clicks_count: number;
  is_active: boolean;
  password_hash: string | null;
  expires_at: string | null;
  analytics_public: boolean;
  analytics_shared_fields: string | null;
  created_at: string;
  updated_at: string;
}

interface UseLinksReturn {
  links: LinkData[];
  setLinks: React.Dispatch<React.SetStateAction<LinkData[]>>;
  loading: boolean;
  error: string | null;
  mutate: () => Promise<void>;
}

export function useLinks(): UseLinksReturn {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success) {
        setLinks(data.data);
      } else {
        setError(data.error?.message || "Failed to fetch links");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mutate();
  }, [mutate]);

  return { links, setLinks, loading, error, mutate };
}

interface CreateLinkPayload {
  url: string;
  customAlias?: string;
  title?: string;
  password?: string;
  expiresAt?: string;
  turnstileToken?: string;
}

export function useCreateLink() {
  const [loading, setLoading] = useState(false);

  const createLink = useCallback(
    async (payload: CreateLinkPayload): Promise<LinkData | null> => {
      setLoading(true);
      try {
        const res = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Link created successfully!");
          return data.data as LinkData;
        } else {
          toast.error(data.error?.message || "Failed to create link");
          return null;
        }
      } catch {
        toast.error("Network error. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createLink, loading };
}

export function useDeleteLink() {
  const [loading, setLoading] = useState(false);

  const deleteLink = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Link deleted successfully");
        return true;
      } else {
        toast.error(data.error?.message || "Failed to delete link");
        return false;
      }
    } catch {
      toast.error("Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteLink, loading };
}

export interface EditLinkPayload {
  title?: string;
  password?: string | null;
  expiresAt?: string | null;
  is_active?: boolean;
  analytics_public?: boolean;
  analytics_shared_fields?: string | null;
}

export function useEditLink() {
  const [loading, setLoading] = useState(false);

  const editLink = useCallback(
    async (id: string, payload: EditLinkPayload): Promise<LinkData | null> => {
      setLoading(true);
      try {
        const res = await fetch(`/api/links/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Link updated successfully!");
          return data.data as LinkData;
        } else {
          toast.error(data.error?.message || "Failed to update link");
          return null;
        }
      } catch {
        toast.error("Network error. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { editLink, loading };
}

export function useToggleLink() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleLink = useCallback(
    async (id: string, currentActive: boolean): Promise<LinkData | null> => {
      setLoadingId(id);
      try {
        const res = await fetch(`/api/links/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !currentActive }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(currentActive ? "Link deactivated" : "Link activated");
          return data.data as LinkData;
        } else {
          toast.error(data.error?.message || "Failed to update link");
          return null;
        }
      } catch {
        toast.error("Network error. Please try again.");
        return null;
      } finally {
        setLoadingId(null);
      }
    },
    []
  );

  return { toggleLink, loadingId };
}

export function useBulkActions() {
  const [loading, setLoading] = useState(false);

  const bulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/links/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.data.deleted} link(s) deleted`);
        return true;
      } else {
        toast.error(data.error?.message || "Failed to delete links");
        return false;
      }
    } catch {
      toast.error("Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkToggle = useCallback(
    async (ids: string[], active: boolean): Promise<boolean> => {
      setLoading(true);
      try {
        const res = await fetch("/api/links/bulk", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, is_active: active }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(
            `${data.data.updated} link(s) ${active ? "activated" : "deactivated"}`
          );
          return true;
        } else {
          toast.error(data.error?.message || "Failed to update links");
          return false;
        }
      } catch {
        toast.error("Network error. Please try again.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { bulkDelete, bulkToggle, loading };
}
