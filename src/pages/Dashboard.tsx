import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, ShoppingBag, Activity, TrendingUp, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Define interfaces for the data structure
interface Customer {
  _id: string;
  customer_id: string;
  name: string;
  visits: number;
}

interface Order {
  _id: string;
  order_id: string;
  customer_id_external: string;
  date: string; // Expecting ISO date string or similar parseable format
  amount: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon, description, isLoading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="text-2xl font-bold animate-pulse">Loading...</div>
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      {description && !isLoading && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

interface ChartDataItem {
  name: string; // e.g., "Jan", "Feb"
  value: number; // e.g., total revenue for that month
}

// Helper function to get month labels and year-month keys for the past N months
const getPastNMonthsDataSlots = (n: number): Array<{ name: string; yearMonthKey: string; value: number }> => {
  const slots = [];
  const currentDate = new Date(); // Use current system date to define the window
  currentDate.setDate(1); // Normalize to the first day of the current month for consistent windowing

  for (let i = 0; i < n; i++) {
    const monthName = currentDate.toLocaleDateString('default', { month: 'short' });
    // Create a key like "YYYY-MM" for easy matching
    const yearMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    slots.unshift({ name: monthName, yearMonthKey, value: 0 }); // Add to the beginning to maintain chronological order
    
    // Move to the previous month
    currentDate.setMonth(currentDate.getMonth() - 1);
  }
  return slots; // Returns an array like [{name: "Dec", yearMonthKey: "2024-12", value: 0}, ..., {name: "May", yearMonthKey: "2025-05", value: 0}]
};


const Dashboard = () => {
  const { user } = useAuth();
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingStats(true);
      setIsLoadingChart(true);

      try {
        // Fetch customers
        const customersResponse = await fetch("http://localhost:3000/api/data/customers", {
          method: "GET",
          credentials: "include",
        });
        if (!customersResponse.ok) {
          throw new Error(`Failed to fetch customers: ${customersResponse.statusText}`);
        }
        const customersData: Customer[] = await customersResponse.json();
        setCustomerCount(customersData.length);

        const calculatedTotalVisits = customersData.reduce(
          (sum, customer) => sum + (customer.visits || 0),
          0
        );
        setTotalVisits(calculatedTotalVisits);

        // Fetch orders
        const ordersResponse = await fetch("http://localhost:3000/api/data/orders", {
          method: "GET",
          credentials: "include",
        });
        if (!ordersResponse.ok) {
          throw new Error(`Failed to fetch orders: ${ordersResponse.statusText}`);
        }
        const ordersData: Order[] = await ordersResponse.json();
        setOrderCount(ordersData.length);

        const calculatedRevenue = ordersData.reduce((sum, order) => sum + order.amount, 0);
        setTotalRevenue(calculatedRevenue);

        // Process ordersData for the chart (last 6 months revenue)
        const monthlyRevenueSlots = getPastNMonthsDataSlots(6);

        ordersData.forEach(order => {
          const orderDate = new Date(order.date);
          const orderYearMonthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          
          const slot = monthlyRevenueSlots.find(s => s.yearMonthKey === orderYearMonthKey);
          if (slot) {
            slot.value += order.amount;
          }
        });
        
        // Format for Recharts: { name: "Mon", value: X }
        setChartData(monthlyRevenueSlots.map(s => ({ name: s.name, value: s.value })));
        setIsLoadingChart(false);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error Loading Data",
          description: "Could not load dashboard statistics. Please try again later.",
          variant: "destructive",
        });
        setCustomerCount(0);
        setOrderCount(0);
        setTotalRevenue(0);
        setTotalVisits(0);
        setChartData([]); // Clear chart data on error
        setIsLoadingChart(false); // Ensure loading is false even on error for chart
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.displayName || "User"}</h1>
          <p className="text-muted-foreground">Here's what's happening with your customers today.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={customerCount}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="+12% from last month" // This description can be made dynamic too
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Total Orders"
            value={orderCount}
            icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
            description="+5% from last week" // This description can be made dynamic too
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Total Customer Visits"
            value={totalVisits}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            description="Sum of all customer visits"
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            description="+19% from last month" // This description can be made dynamic too
            isLoading={isLoadingStats}
          />
        </div>

        <div className="mt-8">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                Revenue trends over the past 6 months based on order data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {isLoadingChart ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-pulse">Loading chart data...</div>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-2" />
                    <p>No revenue data available for the past 6 months.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
