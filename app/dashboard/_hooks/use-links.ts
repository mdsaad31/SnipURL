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
  created_at: string;
  updated_at: string;
}

interface UseLinksReturn {
  links: LinkData[];
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

  return { links, loading, error, mutate };
}

interface CreateLinkPayload {
  url: string;
  customAlias?: string;
  title?: string;
  password?: string;
  expiresAt?: string;
}

export function useCreateLink(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const createLink = useCallback(
    async (payload: CreateLinkPayload) => {
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
          onSuccess?.();
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
    [onSuccess]
  );

  return { createLink, loading };
}

export function useDeleteLink(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const deleteLink = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/links/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Link deleted successfully");
          onSuccess?.();
        } else {
          toast.error(data.error?.message || "Failed to delete link");
        }
      } catch {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return { deleteLink, loading };
}

export interface EditLinkPayload {
  title?: string;
  password?: string | null;
  expiresAt?: string | null;
  is_active?: boolean;
}

export function useEditLink(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const editLink = useCallback(
    async (id: string, payload: EditLinkPayload) => {
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
          onSuccess?.();
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
    [onSuccess]
  );

  return { editLink, loading };
}

export function useToggleLink() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleLink = useCallback(async (id: string, currentActive: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          currentActive ? "Link deactivated" : "Link activated"
        );
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
  }, []);

  return { toggleLink, loadingId };
}

export function useBulkActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const bulkDelete = useCallback(
    async (ids: string[]) => {
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
          onSuccess?.();
        } else {
          toast.error(data.error?.message || "Failed to delete links");
        }
      } catch {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const bulkToggle = useCallback(
    async (ids: string[], active: boolean) => {
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
          onSuccess?.();
        } else {
          toast.error(data.error?.message || "Failed to update links");
        }
      } catch {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return { bulkDelete, bulkToggle, loading };
}

