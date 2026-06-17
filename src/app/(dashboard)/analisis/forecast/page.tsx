import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getForecastData } from "@/lib/queries/dashboard";
import { ForecastClient } from "@/components/analisis/forecast-client";
import { subMonths, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default async function ForecastPage() {
  await requireRole(["owner", "admin"]);
  const forecasts = await getForecastData();
  const monthLabels = [3, 2, 1].map((i) =>
    format(subMonths(new Date(), i), "MMMM", { locale: idLocale })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecast Stok"
        description="Prediksi kebutuhan stok menggunakan moving average 3 bulan"
      />
      <Card>
        <CardContent className="pt-6">
          <ForecastClient forecasts={forecasts} monthLabels={monthLabels} />
        </CardContent>
      </Card>
    </div>
  );
}
