import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { apiClient } from "../../lib/api";

interface CMSConfig {
  id: number;
  key: string;
  value: string;
}

const DEFAULT_KEYS = ["logo_url", "hero_banner_url", "hero_banner_mobile_url"];

export function CMSConfigPage() {
  const [configs, setConfigs] = useState<CMSConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});

  const loadConfigs = useCallback(async () => {
    try {
      const data = await apiClient<CMSConfig[]>("/api/cms");
      setConfigs(data);
      const map: Record<string, string> = {};
      for (const c of data) map[c.key] = c.value;
      for (const key of DEFAULT_KEYS) if (!map[key]) map[key] = "";
      setEditing(map);
    } catch {
      const map: Record<string, string> = {};
      for (const key of DEFAULT_KEYS) map[key] = "";
      setEditing(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const handleSave = async (key: string) => {
    try {
      await apiClient("/api/admin/cms", {
        method: "PUT",
        body: JSON.stringify({ key, value: editing[key] }),
      });
      toast.success(`${key} updated`);
      loadConfigs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(msg);
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold">CMS Configuration</h1>
      <p className="mb-6 text-sm text-gray-500">
        Manage store assets via Firebase Storage URLs. Upload images to Firebase and paste the public URL below.
      </p>

      <div className="space-y-6">
        {DEFAULT_KEYS.map((key) => {
          const config = configs.find((c) => c.key === key);
          return (
            <div key={key} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <label className="mb-2 block text-sm font-medium capitalize">
                {key.replace(/_/g, " ")}
              </label>
              <input
                type="url"
                value={editing[key] || ""}
                onChange={(e) => setEditing((prev) => ({ ...prev, [key]: e.target.value }))}
                className="input-field mb-3"
                placeholder="https://firebasestorage.googleapis.com/..."
              />
              {editing[key] && (
                <img src={editing[key]} alt={key} className="mb-3 h-32 w-full rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {config ? "Saved" : "Not set"}
                </span>
                <button
                  onClick={() => handleSave(key)}
                  className="rounded-lg bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                >
                  Save
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
