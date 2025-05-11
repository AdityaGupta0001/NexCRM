
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Search, Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { toast } from "@/hooks/use-toast";

interface Campaign {
  campaign_id: string;
  segment_name: string;
  message_template: string;
  audience_size: number;
  status_counts: {
    SENT: number;
    FAILED: number;
    PENDING: number;
  };
  created_at: string;
  created_by: string;
}

interface Segment {
  _id: string;
  name: string;
  audience_size_snapshot: number;
}

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [messageSuggestions, setMessageSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchSegments();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would fetch from your API
      const response = await fetch("http://localhost:3000/api/campaigns", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }

      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Could not load campaigns. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/segments", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch segments");
      }

      const data = await response.json();
      setSegments(data);
    } catch (error) {
      console.error("Error fetching segments:", error);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/campaigns/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segment_id: selectedSegmentId,
          message_template: messageTemplate,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: `Campaign started for ${data.audienceSize} customers`,
      });
      
      setIsCreateDialogOpen(false);
      setSelectedSegmentId("");
      setMessageTemplate("");
      fetchCampaigns();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGetMessageSuggestions = async () => {
    if (!selectedSegmentId) return;
    
    setIsLoadingSuggestions(true);
    
    try {
      // First, get the segment details to use for suggestions
      const segmentResponse = await fetch(`http://localhost:3000/api/segments/${selectedSegmentId}`, {
        credentials: "include",
      });

      if (!segmentResponse.ok) {
        throw new Error("Failed to fetch segment details");
      }

      const segmentData = await segmentResponse.json();
      const segment = segments.find(s => s._id === selectedSegmentId);
      
      // Now get message suggestions
      const response = await fetch("http://localhost:3000/api/ai/message-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objective: "Engage customers in the segment",
          segmentDescription: `${segment?.name} - Customers matching specific criteria`,
          tone: "Friendly and professional"
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get message suggestions");
      }

      const suggestions = await response.json();
      setMessageSuggestions(suggestions);
      setIsSuggestionDialogOpen(true);
    } catch (error) {
      console.error("Error getting message suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to get message suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setMessageTemplate(suggestion);
    setIsSuggestionDialogOpen(false);
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.segment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (sent: number, failed: number, pending: number) => {
    if (pending > 0) return "bg-yellow-500";
    if (failed > 0) return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground text-right">Create and manage communication campaigns for your customer segments.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex w-full md:w-96 items-center space-x-2 mb-4 md:mb-0">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse-slow text-lg font-medium">Loading campaigns...</div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-6">Create your first campaign to engage with your customers</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.campaign_id} className="overflow-hidden">
                <div className={`h-1 ${getStatusColor(
                  campaign.status_counts.SENT,
                  campaign.status_counts.FAILED,
                  campaign.status_counts.PENDING
                )}`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{campaign.segment_name}</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="line-clamp-2">{campaign.message_template}</p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Send className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Sent to {campaign.audience_size} customers</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                          <span>{campaign.status_counts.SENT} sent</span>
                        </div>
                        {campaign.status_counts.FAILED > 0 && (
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                            <span>{campaign.status_counts.FAILED} failed</span>
                          </div>
                        )}
                        {campaign.status_counts.PENDING > 0 && (
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></div>
                            <span>{campaign.status_counts.PENDING} pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Send a message to customers in a specific segment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="segment">Select Segment</Label>
              <select
                id="segment"
                value={selectedSegmentId}
                onChange={(e) => setSelectedSegmentId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a segment</option>
                {segments.map((segment) => (
                  <option key={segment._id} value={segment._id}>
                    {segment.name} ({segment.audience_size_snapshot} customers)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="message">Message Template</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGetMessageSuggestions}
                  disabled={!selectedSegmentId || isLoadingSuggestions}
                  className="text-xs h-8"
                >
                  {isLoadingSuggestions ? "Loading..." : "Get AI Suggestions"}
                </Button>
              </div>
              <Textarea
                id="message"
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                placeholder="Enter your message for customers in this segment"
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              disabled={!selectedSegmentId || !messageTemplate}
            >
              Send Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Suggestions Dialog */}
      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Message Suggestions</DialogTitle>
            <DialogDescription>
              Select one of these AI-generated messages or use them as inspiration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {messageSuggestions.map((suggestion, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => selectSuggestion(suggestion)}
              >
                <CardContent className="pt-4 text-sm">
                  {suggestion}
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuggestionDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Campaigns;
