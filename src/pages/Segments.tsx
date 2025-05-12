
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Plus, Search, Users } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { toast } from "@/hooks/use-toast";

interface Segment {
  _id: string;
  name: string;
  rules: {
    logic: string;
    conditions: any[];
  };
  audience_size_snapshot: number;
  createdAt: string;
  createdBy: {
    displayName: string;
    email: string;
  };
}

const Segments = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would fetch from your API
      const response = await fetch("https://nexcrm-service.onrender.com/api/segments", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch segments");
      }

      const data = await response.json();
      setSegments(data);
    } catch (error) {
      console.error("Error fetching segments:", error);
      toast({
        title: "Error",
        description: "Could not load segments. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSegment = () => {
    // In a real implementation, this would open a segment builder UI
    setIsCreateDialogOpen(true);
  };

  const handleCreateSegmentWithAI = async () => {
    try {
      const response = await fetch("https://nexcrm-service.onrender.com/api/ai/parse-segment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: aiPrompt }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to parse segment with AI");
      }

      const rules = await response.json();
      
      // Now create the segment with the AI-generated rules
      const createResponse = await fetch("https://nexcrm-service.onrender.com/api/segments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: segmentName,
          rules: rules,
        }),
        credentials: "include",
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create segment");
      }

      toast({
        title: "Success",
        description: "Segment created successfully",
      });
      
      // Close dialogs and refresh segments
      setIsAIDialogOpen(false);
      setAiPrompt("");
      setSegmentName("");
      fetchSegments();
      
    } catch (error) {
      console.error("Error creating segment with AI:", error);
      toast({
        title: "Error",
        description: "Failed to create segment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredSegments = segments.filter((segment) =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Customer Segments</h1>
          <p className="text-muted-foreground">Create and manage customer segments for targeted campaigns.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <div className="flex w-full md:w-96 items-center space-x-2 mb-4 md:mb-0">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCreateSegment}>
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
            <Button variant="outline" onClick={() => setIsAIDialogOpen(true)}>
              <Layers className="h-4 w-4 mr-2" />
              AI Segment Builder
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-slow text-lg font-medium">Loading segments...</div>
          </div>
        ) : segments.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No segments found</h3>
            <p className="text-muted-foreground mb-6">Create your first segment to start targeting customers</p>
            <Button onClick={handleCreateSegment}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Segment
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSegments.map((segment) => (
              <Card
                key={segment._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/segments`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{segment.audience_size_snapshot} customers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Logic:</span>
                      <span className="font-medium">{segment.rules.logic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(segment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created By:</span>
                      <span className="font-medium">{segment.createdBy?.displayName || "Unknown"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Segment Builder Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Segment with AI</DialogTitle>
            <DialogDescription>
              Describe your target audience in natural language and our AI will build the segment for you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="segment-name">Segment Name</Label>
              <Input
                id="segment-name"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="e.g., High-Value Customers"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai-prompt">Describe your audience</Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Customers who spent more than $1000 in the last 3 months and visited at least 5 times"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSegmentWithAI} disabled={!segmentName || !aiPrompt}>
              Create Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Segment Dialog (this would be more complex in a real implementation) */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Segment</DialogTitle>
            <DialogDescription>
              Define rules to group your customers based on their attributes and behaviors.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              This is a simplified placeholder. In a real implementation, this would be a complex segment builder UI.
            </p>
            <Button onClick={() => setIsAIDialogOpen(true)}>
              Use AI Builder Instead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Segments;
