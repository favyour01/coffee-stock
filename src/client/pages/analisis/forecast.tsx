import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { ForecastClient } from "@/components/analisis/forecast-client";
import { PageHeader } from "@/components/layout/page-header";

export function ForecastPage() {
  const { data = [] } = useQuery({ queryKey: ["analytics", "forecast"], queryFn: analyticsApi.forecast });
  return (
    <div className="space-y-6">
      <PageHeader title="Forecast Stok" description="Prediksi kebutuhan stok berdasarkan tren" />
      <ForecastClient data={data} />
    </div>
  );
}
