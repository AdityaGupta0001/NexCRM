import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea"; // Not used
import { Settings as SettingsIcon, Upload, User, Bell, Shield, Download, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// --- Data Interfaces ---
interface Customer {
  _id: string; // Assuming API provides _id
  customer_id: string;
  name: string;
  email: string;
  phone?: string;
  total_spend?: number;
  visits?: number;
  last_visit?: string;
  custom_attributes?: {
    [key: string]: any;
  };
}

interface Order {
  _id: string; // Assuming API provides _id
  order_id: string;
  customer_id_external: string;
  date: string;
  amount: number;
}

// Updated Campaign interfaces based on your JSON
interface CampaignStatusCounts {
  SENT: number;
  FAILED: number;
  PENDING: number;
}

interface CampaignFromAPI { // Represents the structure directly from API
  campaign_id: string;
  segment_name: string;
  message_template: string;
  audience_size: number;
  status_counts: CampaignStatusCounts;
  created_at: string;
  created_by: string;
  // Note: No _id field in the provided campaign JSON example.
  // If your API *does* wrap each campaign object with an _id, add it here.
}

// This will be the structure we convert to CSV after processing
interface ProcessedCampaignForCSV {
  campaign_id: string;
  segment_name: string;
  message_template: string;
  audience_size: number;
  status_SENT: number;
  status_FAILED: number;
  status_PENDING: number;
  created_at: string;
  created_by: string;
}

interface UserProfile { // For the /api/auth/me response
  _id: string;
  googleId: string;
  displayName: string;
  email: string;
  role: string; // This is the key field
  createdAt: string;
  __v: number;
}

const Settings = () => {
  const { user } = useAuth();
  const { user: authContextUser } = useAuth();
  const apiBaseUrl = "https://nexcrm-service.onrender.com/api";

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [isExportingCustomers, setIsExportingCustomers] = useState(false);
  const [isExportingOrders, setIsExportingOrders] = useState(false);
  const [isExportingCampaigns, setIsExportingCampaigns] = useState(false);
  
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
  // --- CSV Export Helper Functions (remain largely the same) ---

  const sanitizeForCSV = (value: any): string => {
    if (value === null || typeof value === 'undefined') return "";
    let strValue = String(value);
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      strValue = `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  // Generic CSV converter
  const convertToCSV = <T extends Record<string, any>>(data: T[], headers: string[]): string => {
    if (data.length === 0) return "";

    const headerRow = headers.map(header => sanitizeForCSV(header)).join(",");
    const dataRows = data.map(item => {
      return headers.map(headerKey => {
        // Access item properties using the headerKey string
        const value = item[headerKey];
        // Stringify objects (like custom_attributes if any were left as objects after processing)
        if (typeof value === 'object' && value !== null) {
          return sanitizeForCSV(JSON.stringify(value));
        }
        return sanitizeForCSV(value);
      }).join(",");
    });

    return [headerRow, ...dataRows].join("\n");
  };

  const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generic export handler for Customers and Orders (which don't need special pre-processing)
  const handleSimpleExport = async <T extends Record<string, any>>(
    endpoint: string,
    filename: string,
    headers: (keyof T | string)[], // These headers should be direct keys of T
    setIsLoading: (loading: boolean) => void
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, { method: "GET", credentials: "include" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch data" }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      const data: T[] = await response.json();

      if (data.length === 0) {
        toast({ title: "No Data", description: `No data found to export for ${filename}.`});
        return; // No need to proceed further
      }

      // Convert headers to string array for convertToCSV
      const stringHeaders = headers.map(h => String(h));
      const csvData = convertToCSV(data, stringHeaders);
      downloadCSV(csvData, filename);
      toast({ title: "Export Successful", description: `${filename} exported successfully.` });

    } catch (error) {
      console.error(`Error exporting ${filename}:`, error);
      toast({
        title: "Export Failed",
        description: `Could not export ${filename}. ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Specific Export Handlers ---

  const handleExportCustomers = () => {
    if (userRole !== "admin") {
      toast({ title: "Access Denied", description: "Only admin users can export customer data.", variant: "destructive" });
      return;
    }
    setIsExportingCustomers(true);

    const customerHeaders: (keyof Customer)[] = [ // Using keyof for type safety
      "_id", "customer_id", "name", "email", "phone", 
      "total_spend", "visits", "last_visit", "custom_attributes"
    ];
    handleSimpleExport<Customer>(`${apiBaseUrl}/data/customers`, "customers.csv", customerHeaders, setIsExportingCustomers);
  };

  const handleExportOrders = () => {
    if (userRole !== "admin") {
      toast({ title: "Access Denied", description: "Only admin users can export order data.", variant: "destructive" });
      return;
    }
    const orderHeaders: (keyof Order)[] = ["_id", "order_id", "customer_id_external", "date", "amount"];
    handleSimpleExport<Order>(`${apiBaseUrl}/data/orders`, "orders.csv", orderHeaders, setIsExportingOrders);
  };
  
  const handleExportCampaigns = async () => {
    if (userRole !== "admin") {
      toast({ title: "Access Denied", description: "Only admin users can export campaign data.", variant: "destructive" });
      return;
    }

    setIsExportingCampaigns(true);
    try {
      const response = await fetch(`${apiBaseUrl}/campaigns`, { method: "GET", credentials: "include" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch campaigns" }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      const rawCampaignsData: CampaignFromAPI[] = await response.json();

      if (rawCampaignsData.length === 0) {
        toast({ title: "No Data", description: "No campaign data found to export." });
        setIsExportingCampaigns(false); // Ensure loading state is reset
        return;
      }

      // Define headers for the processed CSV structure
      const campaignCSVHeaders: string[] = [
          "campaign_id", "segment_name", "message_template", "audience_size",
          "status_SENT", "status_FAILED", "status_PENDING", // Flattened status_counts
          "created_at", "created_by"
      ];

      // Pre-process campaign data to flatten status_counts
      const processedCampaignsForCSV: ProcessedCampaignForCSV[] = rawCampaignsData.map(campaign => ({
          campaign_id: campaign.campaign_id,
          segment_name: campaign.segment_name,
          message_template: campaign.message_template,
          audience_size: campaign.audience_size,
          status_SENT: campaign.status_counts.SENT,
          status_FAILED: campaign.status_counts.FAILED,
          status_PENDING: campaign.status_counts.PENDING,
          created_at: campaign.created_at,
          created_by: campaign.created_by
      }));
      
      const csvData = convertToCSV(processedCampaignsForCSV, campaignCSVHeaders);
      downloadCSV(csvData, "campaigns.csv");
      toast({ title: "Export Successful", description: "campaigns.csv exported successfully." });

    } catch (error) {
      console.error("Error exporting campaigns.csv:", error);
      toast({
        title: "Campaign Export Failed",
        description: `Could not export campaigns. ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsExportingCampaigns(false);
    }
  };

  // Placeholder for import (same as before)
  const handleFileImport = (dataType: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (dataType === "customers" && userRole !== "admin") {
      toast({ title: "Access Denied", description: "Only admin users can import customer data.", variant: "destructive" });
      event.target.value = ""; // Clear the selected file
      return;
    }
    if (dataType === "orders" && userRole !== "admin") {
      toast({ title: "Access Denied", description: "Only admin users can import order data.", variant: "destructive" });
      event.target.value = ""; // Clear the selected file
      return;
    }
    console.log(`Importing ${dataType} from file:`, file.name);
    toast({ title: "Import Started", description: `Importing ${dataType} data... (stub)`});
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your application settings and preferences.</p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your profile information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" defaultValue={user?.displayName || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                <p className="text-sm text-muted-foreground">
                  Email changes are managed through your identity provider.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={(user as any)?.role || "User"} disabled /> 
              </div>
              <Button onClick={() => toast({title: "Note", description: "Profile save not implemented."})}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about customer activity by email
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Campaign Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Get email reports when campaigns complete
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
              </div>
              <Button onClick={() => toast({title: "Note", description: "Notification preferences save not implemented."})}>Save Notification Preferences</Button>
            </CardContent>
          </Card>
          
          {/* Data Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5 text-primary" /> {/* Changed icon to SettingsIcon as Upload is used below */}
                <CardTitle>Data Management</CardTitle>
              </div>
              <CardDescription>
                Import and export customer, order, and campaign information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Import Section */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Import Customers</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a JSON file with customer data.
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      id="customer-file-import"
                      accept=".json"
                      onChange={handleFileImport("customers")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Button variant="outline" className="w-full" asChild>
                        <div>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Customer File
                        </div>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Import Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a JSON file with order data.
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      id="orders-file-import"
                      accept=".json"
                      onChange={handleFileImport("orders")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                     <Button variant="outline" className="w-full" asChild>
                        <div>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Order File
                        </div>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Export Section */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Export Data</h3>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                  <Button variant="outline" onClick={handleExportCustomers} disabled={isExportingCustomers}>
                    {isExportingCustomers ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Export Customers
                  </Button>
                  <Button variant="outline" onClick={handleExportOrders} disabled={isExportingOrders}>
                    {isExportingOrders ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Export Orders
                  </Button>
                  <Button variant="outline" onClick={handleExportCampaigns} disabled={isExportingCampaigns}>
                    {isExportingCampaigns ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Export Campaigns
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
