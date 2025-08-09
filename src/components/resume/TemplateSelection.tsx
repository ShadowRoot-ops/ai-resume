// src/components/resume/TemplateSelection.tsx

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import PremiumFeatureGate from "@/components/premium/PremiumFeatureGate";
import Image from "next/image";
import { Crown } from "lucide-react";

interface TemplateProps {
  id: string;
  name: string;
  description: string;
  category: string;
  company?: string;
  isPremium: boolean;
  thumbnailUrl: string;
}

interface TemplateSelectionProps {
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
}

export default function TemplateSelection({
  selectedTemplateId,
  onSelect,
}: TemplateSelectionProps) {
  const [templates, setTemplates] = useState<TemplateProps[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user subscription
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/user/subscription");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchTemplates();
    fetchSubscription();
  }, []);

  // Filter templates by category
  const filteredTemplates =
    category === "all"
      ? templates
      : templates.filter((template) => template.category === category);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" onValueChange={setCategory}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="indian_corporate">Indian Corporate</TabsTrigger>
          <TabsTrigger value="startup">Startups</TabsTrigger>
          <TabsTrigger value="government">Government</TabsTrigger>
          <TabsTrigger value="fresher">Campus Placement</TabsTrigger>
        </TabsList>

        {/* Category descriptions */}
        {category !== "all" && category !== "basic" && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
            {category === "indian_corporate" && (
              <p className="text-sm text-blue-700">
                Templates optimized for TCS, Infosys, Wipro, HCL, Cognizant, and
                Accenture. These formats have been verified to perform well with
                their ATS systems.
              </p>
            )}
            {category === "startup" && (
              <p className="text-sm text-blue-700">
                Templates designed for Flipkart, Swiggy, Zomato, Ola, and other
                startups. Modern design with focus on impact and achievements.
              </p>
            )}
            {category === "government" && (
              <p className="text-sm text-blue-700">
                Formats compliant with government job applications, PSUs, and
                competitive exams. Emphasizes qualifications and relevant
                experience in public sector roles.
              </p>
            )}
            {category === "fresher" && (
              <p className="text-sm text-blue-700">
                Templates for campus placements and entry-level positions.
                Highlights education, projects, and relevant skills for new
                graduates.
              </p>
            )}
          </div>
        )}

        <TabsContent value={category} className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-100 animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplateId === template.id;

                // Template card component
                const TemplateCard = () => (
                  <Card
                    className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => onSelect(template.id)}
                  >
                    <div className="relative">
                      <Image
                        src={template.thumbnailUrl}
                        alt={template.name}
                        width={300}
                        height={400}
                        className="w-full h-auto"
                      />
                      {template.isPremium && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1 px-2 text-xs flex items-center">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </div>
                      )}
                      {template.company && (
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs p-1 px-2 rounded">
                          {template.company}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {template.description}
                      </p>
                    </CardContent>
                  </Card>
                );

                // Wrap premium templates with gate
                if (template.isPremium && subscription?.plan !== "PRO") {
                  return (
                    <PremiumFeatureGate
                      key={template.id}
                      featureId={`template_${template.id}`}
                      title="Premium Template"
                      unlockText="Unlock Template"
                      blurIntensity="light"
                    >
                      <TemplateCard />
                    </PremiumFeatureGate>
                  );
                }

                return <TemplateCard key={template.id} />;
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
