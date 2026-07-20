"use client"

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { AIBriefButton } from "@/components/AIBriefButton";
import { VendorActionMenu } from "@/components/VendorActionMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface Vendor {
  id: string;
  name: string;
  category: string;
  calculated_risk_score: number;
  sla_uptime_promise: number;
  actual_sla: number;
  compliance_certs: string[];
}

interface VendorDataTableProps {
  initialVendors: Vendor[];
  userRole?: string;
}

export function VendorDataTable({ initialVendors, userRole }: VendorDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: 'sla_uptime_promise' | 'actual_sla', direction: 'asc' | 'desc' } | null>(null);
  
  const itemsPerPage = 10;

  // Filtering
  const filteredVendors = initialVendors.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(query) ||
      v.category.toLowerCase().includes(query) ||
      (v.compliance_certs && v.compliance_certs.some(c => c.toLowerCase().includes(query)))
    );
  });

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVendors = sortedVendors.slice(startIndex, startIndex + itemsPerPage);

  // Pagination Reset on Search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  function getRiskBadge(score: number) {
    if (score <= 3) {
      return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 shadow-sm font-medium px-2 py-0.5 rounded-md text-xs">Low Risk</Badge>;
    }
    if (score <= 6) {
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50 shadow-sm font-medium px-2 py-0.5 rounded-md text-xs">Medium Risk</Badge>;
    }
    return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50 shadow-sm font-medium px-2 py-0.5 rounded-md text-xs">High Risk</Badge>;
  }



  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <h2 className="font-semibold text-[#1C2439] text-sm">Active Directory</h2>
         <div className="relative w-full sm:w-[300px]">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <Input 
             placeholder="Search vendors or certs..." 
             className="pl-9 h-9 text-sm border-slate-200 focus-visible:ring-[#E76257]/20 focus-visible:border-[#E76257] rounded-md shadow-sm"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="font-medium text-slate-500 text-xs h-10 whitespace-nowrap">Vendor Name</TableHead>
              <TableHead className="font-medium text-slate-500 text-xs h-10 whitespace-nowrap">Category</TableHead>
              <TableHead className="font-medium text-slate-500 text-xs h-10 whitespace-nowrap">Risk Score</TableHead>
              <TableHead 
                className="font-medium text-slate-500 text-xs h-10 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setSortConfig(prev => ({ 
                  key: 'sla_uptime_promise', 
                  direction: prev?.key === 'sla_uptime_promise' && prev.direction === 'asc' ? 'desc' : 'asc' 
                }))}
              >
                <div className="flex items-center gap-1">SLA Promise <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead 
                className="font-medium text-slate-500 text-xs h-10 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setSortConfig(prev => ({ 
                  key: 'actual_sla', 
                  direction: prev?.key === 'actual_sla' && prev.direction === 'asc' ? 'desc' : 'asc' 
                }))}
              >
                <div className="flex items-center gap-1">Actual SLA <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead className="font-medium text-slate-500 text-xs h-10 whitespace-nowrap">Certifications</TableHead>
              <TableHead className="text-right font-medium text-slate-500 text-xs h-10 whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVendors.map((vendor) => (
              <TableRow key={vendor.id} className="border-slate-100 transition-colors hover:bg-slate-50/80 group">
                <TableCell className="font-medium text-[#1C2439] py-3 whitespace-nowrap">{vendor.name}</TableCell>
                <TableCell className="text-slate-500 text-sm py-3 whitespace-nowrap">{vendor.category}</TableCell>
                <TableCell className="py-3 whitespace-nowrap">{getRiskBadge(vendor.calculated_risk_score || 0)}</TableCell>
                <TableCell className="text-slate-600 font-mono text-xs py-3 whitespace-nowrap">{vendor.sla_uptime_promise}%</TableCell>
                <TableCell className="text-slate-600 font-mono text-xs py-3 whitespace-nowrap font-medium">{vendor.actual_sla ?? vendor.sla_uptime_promise}%</TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-1.5 flex-wrap min-w-[120px]">
                    {vendor.compliance_certs?.map((cert) => (
                      <Badge key={cert} variant="outline" className="bg-white text-slate-500 border-slate-200 font-medium rounded-md shadow-sm px-2 py-0.5 text-[11px]">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right py-3 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <AIBriefButton vendor={{
                      name: vendor.name,
                      category: vendor.category,
                      calculated_risk_score: vendor.calculated_risk_score || 0,
                      compliance_certs: vendor.compliance_certs || [],
                      sla_uptime_promise: vendor.sla_uptime_promise,
                      actual_sla: vendor.actual_sla ?? vendor.sla_uptime_promise
                    }} />
                    <VendorActionMenu vendor={vendor} userRole={userRole} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {paginatedVendors.length === 0 ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
          <ShieldCheck className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-base font-semibold text-[#1C2439]">No vendors found</p>
          <p className="text-sm mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing <span className="font-medium text-[#1C2439]">{startIndex + 1}</span> to <span className="font-medium text-[#1C2439]">{Math.min(startIndex + itemsPerPage, filteredVendors.length)}</span> of <span className="font-medium text-[#1C2439]">{filteredVendors.length}</span> entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 border-slate-200 text-[#1C2439] hover:bg-slate-50 shadow-sm rounded-md"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 border-slate-200 text-[#1C2439] hover:bg-slate-50 shadow-sm rounded-md"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
