import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  people_id: number;
  name: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  party: string;
  chamber: string;
  district: string;
  role: string;
  email: string;
  phone_capitol: string;
  phone_district: string;
  address: string;
  bio_short: string;
  ballotpedia: string;
}

export const useMembersData = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chambers, setChambers] = useState<string[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState("all");
  const [partyFilter, setPartyFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [fullFilteredCount, setFullFilteredCount] = useState(0);
  const ITEMS_PER_PAGE = 50;
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchChambers();
    fetchParties();
    fetchDistricts();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    filterMembers();
  }, [members, searchTerm, chamberFilter, partyFilter, districtFilter]);

  useEffect(() => {
    filterMembers();
  }, [currentPage]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the total count
      const { count } = await supabase
        .from("People")
        .select("*", { count: 'exact', head: true })
        .not("chamber", "is", null)
        .not("name", "is", null);

      setTotalMembers(count || 0);

      // Then fetch the actual data with increased limit
      const { data, error } = await supabase
        .from("People")
        .select(`
          people_id,
          name,
          first_name,
          last_name,
          photo_url,
          party,
          chamber,
          district,
          role,
          email,
          phone_capitol,
          phone_district,
          address,
          bio_short,
          ballotpedia
        `)
        .not("chamber", "is", null)
        .not("name", "is", null)
        .order("last_name", { ascending: true })
        .limit(200);

      if (error) throw error;

      setMembers(data || []);
    } catch (err) {
      setError("Failed to load members. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChambers = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("chamber")
        .not("chamber", "is", null)
        .order("chamber");

      if (data) {
        const uniqueChambers = Array.from(
          new Set(data.map(item => item.chamber).filter(Boolean))
        ) as string[];
        setChambers(uniqueChambers);
      }
    } catch (error) {
      // Error fetching chambers - handled silently
    }
  };

  const fetchParties = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("party")
        .not("party", "is", null)
        .order("party");

      if (data) {
        const uniqueParties = Array.from(
          new Set(data.map(item => item.party).filter(Boolean))
        ) as string[];
        setParties(uniqueParties);
      }
    } catch (error) {
      // Error fetching parties - handled silently
    }
  };

  const fetchDistricts = async () => {
    try {
      const { data } = await supabase
        .from("People")
        .select("district")
        .not("district", "is", null)
        .order("district");

      if (data) {
        const uniqueDistricts = Array.from(
          new Set(data.map(item => item.district).filter(Boolean))
        ) as string[];
        setDistricts(uniqueDistricts);
      }
    } catch (error) {
      // Error fetching districts - handled silently
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(member => {
        // Create full name combinations for better search
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
        const reverseName = `${member.last_name || ''} ${member.first_name || ''}`.trim();
        const middleReverseName = `${member.last_name || ''}, ${member.first_name || ''}`.trim();
        
        const matches = (
          member.name?.toLowerCase().includes(term) ||
          member.first_name?.toLowerCase().includes(term) ||
          member.last_name?.toLowerCase().includes(term) ||
          fullName.toLowerCase().includes(term) ||
          reverseName.toLowerCase().includes(term) ||
          middleReverseName.toLowerCase().includes(term) ||
          member.party?.toLowerCase().includes(term) ||
          member.district?.toLowerCase().includes(term) ||
          member.role?.toLowerCase().includes(term)
        );
        
        return matches;
      });
    }

    if (chamberFilter !== "all") {
      filtered = filtered.filter(member => member.chamber === chamberFilter);
    }

    if (partyFilter !== "all") {
      filtered = filtered.filter(member => member.party === partyFilter);
    }

    if (districtFilter !== "all") {
      filtered = filtered.filter(member => member.district === districtFilter);
    }

    // Store full filtered results for pagination calculation
    const fullFilteredResults = filtered;
    setFullFilteredCount(fullFilteredResults.length);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedResults = filtered.slice(startIndex, endIndex);

    setFilteredMembers(paginatedResults);
  };

  return {
    members: filteredMembers,
    loading,
    error,
    chambers,
    parties,
    districts,
    searchTerm,
    setSearchTerm,
    chamberFilter,
    setChamberFilter,
    partyFilter,
    setPartyFilter,
    districtFilter,
    setDistrictFilter,
    currentPage,
    setCurrentPage,
    totalMembers,
    totalPages: Math.ceil((fullFilteredCount || totalMembers) / ITEMS_PER_PAGE),
    fetchMembers,
  };
};