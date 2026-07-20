import { createClient } from "@/utils/supabase/server";
import { VendorDataTable } from "@/components/VendorDataTable";
import { AddVendorDialog } from "@/components/AddVendorDialog";
import { ExportVendorsButton } from "@/components/ExportVendorsButton";
import { getUserRole } from "@/utils/roles";

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = await getUserRole(user?.email);
  
  let vendors: any[] = [];
  
  try {
    const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      vendors = data;
    }
  } catch (e) {
    // Fail silently, table will show empty state
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#1C2439] tracking-tight">Vendors</h1>
        </div>
        <div className="flex items-center gap-3">
          <ExportVendorsButton vendors={vendors} />
          <AddVendorDialog />
        </div>
      </div>

      {/* Table Section */}
      <VendorDataTable initialVendors={vendors} userRole={role} />
    </div>
  );
}
