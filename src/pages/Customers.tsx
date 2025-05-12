import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload, Download } from "lucide-react"; // Plus icon is not used here, can be removed if not needed elsewhere
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Customer {
  _id: string;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  total_spend: number;
  visits: number;
  last_visit: string;
  custom_attributes?: {
    [key: string]: any;
  };
}

interface UserProfile {
  googleId: string;
  displayName: string;
  email: string;
  role: string; // This is the key field
  createdAt: string;
  __v: number;
}

const Customers = () => {
  const { user: authContextUser } = useAuth();
  const apiBaseUrl = "https://nexcrm-service.onrender.com/api";
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [isExportingCustomers, setIsExportingCustomers] = useState(false);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
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

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://nexcrm-service.onrender.com/api/data/customers", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Could not load customers. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (userRole !== "admin") {
      toast({ title: "Access Denied", description: "Only admin users can import customer data.", variant: "destructive" });
      event.target.value = ""; // Clear the selected file
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== "string") return;
        
        const customersData = JSON.parse(content);
        
        const response = await fetch("https://nexcrm-service.onrender.com/api/data/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customersData),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to upload customers data");
        }

        toast({
          title: "Success",
          description: "Customer data imported successfully",
        });
        
        fetchCustomers();
      } catch (error) {
        console.error("Error importing customers:", error);
        toast({
          title: "Import Failed",
          description: "Could not import customer data. Check file format and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Function to convert customer data to CSV string
  const convertCustomersToCSV = (customersData: Customer[]): string => {
    if (customersData.length === 0) return "";

    // Define headers, including a column for stringified custom_attributes
    const headers = [
      "_id", "customer_id", "name", "email", "phone", 
      "total_spend", "visits", "last_visit", "custom_attributes"
    ];
    const csvRows = [headers.join(",")];

    // Sanitize data for CSV: escape double quotes and wrap in double quotes if value contains a comma
    const sanitize = (value: any): string => {
      if (value === null || typeof value === 'undefined') return ""; // Handle null or undefined
      const strValue = String(value);
      if (strValue.includes(",")) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    customersData.forEach(customer => {
      const row = [
        sanitize(customer._id),
        sanitize(customer.customer_id),
        sanitize(customer.name),
        sanitize(customer.email),
        sanitize(customer.phone),
        sanitize(customer.total_spend),
        sanitize(customer.visits),
        sanitize(customer.last_visit ? new Date(customer.last_visit).toLocaleString() : ""), // Format date as YYYY-MM-DD or empty
        sanitize(customer.custom_attributes ? JSON.stringify(customer.custom_attributes) : "{}") // Stringify custom attributes
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  // Function to handle the export action
  const handleExportCustomers = () => {
    if (userRole !== "admin") {
        toast({ title: "Access Denied", description: "Only admin users can export customer data.", variant: "destructive" });
        return;
    }
    
    if (customers.length === 0) {
      toast({
        title: "No Data",
        description: "There are no customers to export.",
        variant: "default",
      });
      return;
    }

    const csvContent = convertCustomersToCSV(customers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "customers.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL

    toast({
      title: "Success",
      description: "Customers exported successfully.",
    });
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm)) || // Ensure phone exists
      customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage and view customer information.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <div className="flex w-full md:w-96 items-center space-x-2 mb-4 md:mb-0">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="file"
                id="customer-file"
                accept=".json"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
            {/* Attach handleExportCustomers to the onClick event of the Export button */}
            <Button variant="outline" onClick={handleExportCustomers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-slow text-lg font-medium">Loading customers...</div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-6">Get started by importing your customer data</p>
            <div className="relative inline-block">
              <input
                type="file"
                id="customer-file-empty"
                accept=".json"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import Customers
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/customers`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-medium">{customer.customer_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{customer.phone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Spend:</span>
                      <span className="font-medium">${customer.total_spend?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visits:</span>
                      <span className="font-medium">{customer.visits || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Visit:</span>
                      <span className="font-medium">
                        {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    {/* Example of displaying a specific custom attribute */}
                    {customer.custom_attributes?.loyalty_tier && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loyalty Tier:</span>
                        <span className="font-medium">{customer.custom_attributes.loyalty_tier}</span>
                      </div>
                    )}
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

export default Customers;
