import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Search, BookOpen, Scale, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";

type Law = Tables<"ny_laws">;
type LawSection = Tables<"ny_law_sections">;

interface LawDetailProps {
  law: Law;
  onBack: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const LawDetail = ({ 
  law, 
  onBack, 
  onPrevious, 
  onNext, 
  hasPrevious = false, 
  hasNext = false 
}: LawDetailProps) => {
  const [sections, setSections] = useState<LawSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSections, setFilteredSections] = useState<LawSection[]>([]);

  useEffect(() => {
    fetchLawSections();
  }, [law.law_id]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sections.filter(section =>
        section.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.section_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections(sections);
    }
  }, [searchTerm, sections]);

  const fetchLawSections = async () => {
    try {
      setLoading(true);
      const { data: sectionsData } = await supabase
        .from("ny_law_sections")
        .select("*")
        .eq("law_id", law.law_id)
        .order("sort_order", { ascending: true });

      setSections(sectionsData || []);
      setFilteredSections(sectionsData || []);
    } catch (error) {
      console.error("Error fetching law sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatLawType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const getArticleFromSection = (sectionContent: string) => {
    const articleMatch = sectionContent.match(/ARTICLE\s+(\d+|[IVX]+)/i);
    return articleMatch ? articleMatch[0] : null;
  };

  const groupSectionsByArticle = (sections: LawSection[]) => {
    const articles: { [key: string]: LawSection[] } = {};
    sections.forEach(section => {
      const article = getArticleFromSection(section.content || '') || 'General';
      if (!articles[article]) {
        articles[article] = [];
      }
      articles[article].push(section);
    });
    return articles;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const articlesMap = groupSectionsByArticle(filteredSections);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Section */}
        <div className="pb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Laws</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          {/* Law Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="h-8 w-8 p-0"
              title="Previous law"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
              className="h-8 w-8 p-0"
              title="Next law"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Law Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Scale className="h-6 w-6 text-blue-600" />
                  {law.name}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    Chapter {law.chapter}
                  </Badge>
                  <Badge variant="outline">
                    {formatLawType(law.law_type || '')}
                  </Badge>
                  <Badge variant="outline">
                    {law.total_sections} Sections
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <strong>Law ID:</strong> {law.law_id}
              </div>
              <div>
                <strong>Last Updated:</strong> {law.last_updated ? new Date(law.last_updated).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <strong>Type:</strong> {formatLawType(law.law_type || '')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sections, definitions, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} matching "{searchTerm}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Law Content Tabs */}
        <Tabs defaultValue="sections" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Sections ({filteredSections.length})
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              By Article
            </TabsTrigger>
            <TabsTrigger value="full-text" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Full Text
            </TabsTrigger>
          </TabsList>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            <ScrollArea className="h-[600px] w-full">
              <div className="space-y-4 pr-4">
                {filteredSections.map((section) => (
                  <Card key={section.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          § {section.section_number}. {section.title}
                        </CardTitle>
                        <Badge variant="outline" className="ml-2">
                          Level {section.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                          {section.content}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredSections.length === 0 && !loading && (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      {searchTerm ? `No sections found matching "${searchTerm}"` : 'No sections available'}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-4">
            <ScrollArea className="h-[600px] w-full">
              <div className="space-y-6 pr-4">
                {Object.entries(articlesMap).map(([article, articleSections]) => (
                  <Card key={article}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        {article}
                        <Badge variant="secondary">{articleSections.length} sections</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {articleSections.map((section) => (
                          <div key={section.id} className="border-l-2 border-blue-200 pl-4 py-2">
                            <h4 className="font-semibold text-sm">
                              § {section.section_number}. {section.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {section.content?.substring(0, 200)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Full Text Tab */}
          <TabsContent value="full-text" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  Complete Law Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full">
                  <div className="prose prose-sm max-w-none pr-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                      {law.full_text}
                    </pre>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};