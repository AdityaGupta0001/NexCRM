import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload, Download } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { toast } from "@/hooks/use-toast";

import { useAuth } from "@/contexts/AuthContext";

interface Order {
  _id: string;
  order_id: string;
  customer_id_external: string;
  date: string;
  amount: number;
}

interface UserProfile {
  googleId: string;
  displayName: string;
  email: string;
  role: string; // This is the key field
  createdAt: string;
  __v: number;
}

const Orders = () => {
  const { user: authContextUser } = useAuth();
  const apiBaseUrl = "https://nexcrm-service.onrender.com/api";
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [isExportingOrders, setIsExportingOrders] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      setIsLoadingRole(true);
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          if (response.status === 401) {
             toast({
              title: "Authentication Required",
              description: "Please log in to access settings.",
              variant: "default",
            });
          } else {
            throw new Error(`Failed to fetch user role: ${response.statusText}`);
          }
          setUserRole(null);
        } else {
          const data: UserProfile = await response.json();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        toast({
          title: "Error",
          description: "Could not verify user role. Some features might be unavailable.",
          variant: "destructive",
        });
        setUserRole(null); // Default to non-admin or restricted role on error
      } finally {
        setIsLoadingRole(false);
      }
    };

    fetchUserRole();
  }, [apiBaseUrl]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://nexcrm-service.onrender.com/api/data/orders", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Could not load orders. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (userRole !== "admin") {
      toast({ title: "Access Denied", description: "Only admin users can import order data.", variant: "destructive" });
      event.target.value = ""; // Clear the selected file
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== "string") return;
        
        const ordersData = JSON.parse(content);
        
        const response = await fetch("https://nexcrm-service.onrender.com/api/data/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ordersData),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to upload orders data");
        }

        toast({
          title: "Success",
          description: "Order data imported successfully",
        });
        
        fetchOrders();
      } catch (error) {
        console.error("Error importing orders:", error);
        toast({
          title: "Import Failed",
          description: "Could not import order data. Check file format and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Function to convert orders to CSV string [1]
  const convertOrdersToCSV = (ordersData: Order[]): string => {
    if (ordersData.length === 0) return "";

    const headers = ["_id", "order_id", "customer_id_external", "date", "amount"];
    const csvRows = [headers.join(",")]; // Add header row

    ordersData.forEach(order => {
      // Sanitize data for CSV (e.g., handle commas within fields by quoting)
      const sanitize = (value: string | number) => {
        const strValue = String(value);
        if (strValue.includes(",")) {
          return `"${strValue.replace(/"/g, '""')}"`; // Escape double quotes and wrap in double quotes
        }
        return strValue;
      };

      const row = [
        sanitize(order._id),
        sanitize(order.order_id),
        sanitize(order.customer_id_external),
        sanitize(order.date), // Consider formatting date if needed: new Date(order.date).toLocaleDateString()
        sanitize(order.amount)
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  const handleExportOrders = () => {
    if (userRole !== "admin") {
        toast({ title: "Access Denied", description: "Only admin users can export order data.", variant: "destructive" });
        return;
    }

    if (orders.length === 0) {
      toast({
        title: "No Data",
        description: "There are no orders to export.",
        variant: "default",
      });
      return;
    }

    const csvContent = convertOrdersToCSV(orders); // Use the fetched orders [1]
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "orders.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Orders exported successfully.",
    });
  };


  const filteredCustomers = orders.filter(
    (order) =>
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_id_external.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and view Order information.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <div className="flex w-full md:w-96 items-center space-x-2 mb-4 md:mb-0">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="file"
                id="order-file"
                accept=".json"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
            <Button variant="outline" onClick={handleExportOrders}> {/* Added onClick handler */}
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-slow text-lg font-medium">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">Get started by importing your order data</p>
            <div className="relative inline-block">
              <input
                type="file"
                id="order-file-empty"
                accept=".json"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import orders
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((order) => (
              <Card
                key={order._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/orders`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{order.order_id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer ID:</span>
                      <span className="font-medium">{order.customer_id_external}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(order.date).toLocaleDateString() || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${order.amount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
