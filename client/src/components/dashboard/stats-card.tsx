import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  todayRevenue: number;
  appointmentCount: number;
  newCustomers: number;
}

export default function StatsCard({ todayRevenue, appointmentCount, newCustomers }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-serif">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Today's Revenue</span>
            <span className="font-bold text-primary">${todayRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Appointments</span>
            <span className="font-bold text-foreground">{appointmentCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">New Customers</span>
            <span className="font-bold text-accent-foreground">{newCustomers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
