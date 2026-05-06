import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { useInvoiceConfigs, useCreateInvoiceConfig, useDeleteInvoiceConfig, useSetDefaultConfig } from "@/lib/admin/hooks/useInvoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Plus, Trash2, CheckCircle, Loader2, Building, Mail, Landmark, Percent } from "lucide-react";

export const Route = createFileRoute("/admin/invoice-config")({
  component: InvoiceConfigPage,
});

function InvoiceConfigPage() {
  const { data: configs, isLoading } = useInvoiceConfigs();
  const createConfig = useCreateInvoiceConfig();
  const deleteConfig = useDeleteInvoiceConfig();
  const setDefault = useSetDefaultConfig();

  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    gstin: "",
    pan: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    email: "",
    phone: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    taxType: "cgst_sgst" as "cgst_sgst" | "igst",
    logoUrl: "",
    stampUrl: "",
    signatureUrl: "",
    isDefault: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createConfig.mutateAsync(form);
    setIsAdding(false);
    setForm({ 
      businessName: "", gstin: "", pan: "", addressLine1: "", addressLine2: "", 
      city: "", state: "", pincode: "", email: "", phone: "", bankName: "", 
      accountNumber: "", ifscCode: "", cgstRate: 9, sgstRate: 9, igstRate: 18, 
      taxType: "cgst_sgst", logoUrl: "", stampUrl: "", signatureUrl: "", isDefault: false 
    });
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Invoice Configuration" 
          description="Manage business details, tax rates, and branding for invoices"
        />
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Add New Config
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-black shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Business Identity</CardTitle>
            <CardDescription>Enter details as they should appear on the tax invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} required placeholder="Your Registered Company Name" />
                </div>
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})} placeholder="e.g. 27AAAAA0000A1Z5" />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} required placeholder="Building, Street" />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input value={form.addressLine2} onChange={e => setForm({...form, addressLine2: e.target.value})} placeholder="Area, Landmark" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                   <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                   </div>
                   <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} required />
                   </div>
                   <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} required />
                   </div>
                </div>
                 <div className="space-y-2">
                  <Label>Billing Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="billing@yourcompany.com" />
                </div>
              </div>

              <div className="border-t pt-6">
                 <h3 className="font-bold mb-4 flex items-center gap-2"><Landmark className="w-4 h-4 text-gray-500" /> Bank Details (For Invoice)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} placeholder="e.g. HDFC Bank" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input value={form.ifscCode} onChange={e => setForm({...form, ifscCode: e.target.value})} />
                    </div>
                 </div>
              </div>

              <div className="border-t pt-6">
                 <h3 className="font-bold mb-4 flex items-center gap-2"><Percent className="w-4 h-4 text-gray-500" /> Tax Rates</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Tax Type</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.taxType} 
                        onChange={e => setForm({...form, taxType: e.target.value as any})}
                      >
                        <option value="cgst_sgst">CGST + SGST (Intra-state)</option>
                        <option value="igst">IGST Only (Inter-state)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>CGST %</Label>
                      <Input type="number" step="0.01" value={form.cgstRate} onChange={e => setForm({...form, cgstRate: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>SGST %</Label>
                      <Input type="number" step="0.01" value={form.sgstRate} onChange={e => setForm({...form, sgstRate: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>IGST %</Label>
                      <Input type="number" step="0.01" value={form.igstRate} onChange={e => setForm({...form, igstRate: parseFloat(e.target.value)})} />
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={createConfig.isPending}>
                  {createConfig.isPending ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs?.map(config => (
          <Card key={config.id} className={`${config.isDefault ? "border-black ring-1 ring-black shadow-md" : "border-gray-200"} transition-all duration-300 hover:shadow-lg`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black uppercase tracking-tight">{config.businessName}</CardTitle>
                <CardDescription className="font-mono text-xs uppercase text-gray-500">GSTIN: {config.gstin || 'N/A'}</CardDescription>
              </div>
              {config.isDefault && <CheckCircle className="w-6 h-6 text-black fill-black/5" />}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-3 mt-4">
                 <p className="flex items-start gap-2"><Building className="w-4 h-4 mt-0.5 text-gray-400" /> <span>{config.addressLine1}, {config.city}, {config.state}</span></p>
                 <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span>{config.email || 'No email set'}</span></p>
                 <p className="flex items-center gap-2"><Percent className="w-4 h-4 text-gray-400" /> <span>{config.taxType === 'cgst_sgst' ? `CGST: ${config.cgstRate}%, SGST: ${config.sgstRate}%` : `IGST: ${config.igstRate}%`}</span></p>
              </div>
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  {!config.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => setDefault.mutate(config.id)} className="text-xs h-8">Set Default</Button>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8" onClick={() => {
                  if(window.confirm("Are you sure you want to delete this configuration?")) {
                    deleteConfig.mutate(config.id);
                  }
                }}>
                   <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!configs || configs.length === 0) && !isAdding && (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
             <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                <Building className="w-10 h-10 text-gray-300" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 tracking-tight">NO BUSINESS IDENTITY</h3>
             <p className="text-gray-500 max-w-sm mx-auto mt-2">You must configure your business details before you can generate professional tax invoices for your customers.</p>
             <Button onClick={() => setIsAdding(true)} className="mt-8 bg-black text-white px-8 py-6 rounded-xl text-lg font-bold hover:scale-105 transition-transform">
               <Plus className="w-5 h-5 mr-2" /> Configure Now
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
