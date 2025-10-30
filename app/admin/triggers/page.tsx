"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type TriggerHealth = {
  trigger_name: string;
  function_name: string;
  table_name: string;
  endpoint_url: string | null;
  last_status_code: number | null;
  last_called_at: string | null;
};

export default function TriggerHealthPage() {
  const supabase = createClientComponentClient();
  const [triggers, setTriggers] = useState<TriggerHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.rpc("fn_get_trigger_health");
      if (error) console.error("❌ RPC error:", error);
      else setTriggers(data || []);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const getStatusColor = (status: number | null) => {
    if (status === null) return "bg-gray-400";
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-blue-500";
    if (status >= 400) return "bg-red-500";
    return "bg-gray-400";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Trigger Health Dashboard</h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={32} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {triggers.map((t) => (
            <Card
              key={t.trigger_name}
              className="shadow-sm border rounded-2xl hover:shadow-md transition"
            >
              <CardHeader>
                <CardTitle className="text-lg flex justify-between">
                  <span>{t.function_name}</span>
                  <Badge
                    className={`${getStatusColor(
                      t.last_status_code
                    )} text-white`}
                  >
                    {t.last_status_code ?? "N/A"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Trigger:</span>{" "}
                  {t.trigger_name}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Table:</span>{" "}
                  {t.table_name}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Endpoint:</span>{" "}
                  <a
                    href={t.endpoint_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-words"
                  >
                    {t.endpoint_url || "—"}
                  </a>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Called:</span>{" "}
                  {t.last_called_at
                    ? new Date(t.last_called_at).toLocaleString()
                    : "—"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
