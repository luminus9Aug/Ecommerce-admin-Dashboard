import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  usePendingB2BRequests, 
  useApproveB2B, 
  useRejectB2B, 
  useRequestInfoB2B 
} from "@/lib/admin/hooks/useB2BApprovals";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { Check, X, Mail, Search, MessageSquare, Building2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/admin";

export const Route = createFileRoute("/admin/b2b/companies")({
  component: B2BApprovalsPage,
});

function B2BApprovalsPage() {
  const { data, isLoading } = usePendingB2BRequests();
  const [search, setSearch] = useState("");

  const approveMutation = useApproveB2B();
  const rejectMutation = useRejectB2B();
  const requestInfoMutation = useRequestInfoB2B();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState("");

  const filteredData = (data?.items ?? []).filter(user => 
    user.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.firstName.toLowerCase().includes(search.toLowerCase()) ||
    user.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "companyName",
      header: "Company Details",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{row.original.companyName || "N/A"}</span>
            <span className="text-xs text-slate-500">GST: {row.original.gstNumber || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "firstName",
      header: "Contact Person",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">
              {row.original.firstName} {row.original.lastName}
            </span>
            <span className="text-xs text-slate-500">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Requested On",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("en-IN", {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
            onClick={() => approveMutation.mutate(row.original.id)}
            disabled={approveMutation.isPending}
          >
            <Check className="mr-1 h-3.5 w-3.5" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
            onClick={() => setRequestingId(row.original.id)}
          >
            <MessageSquare className="mr-1 h-3.5 w-3.5" /> Ask Info
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => setRejectingId(row.original.id)}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="B2B Account Requests"
        description="Review and manage pending business account applications"
      />

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, name or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-slate-950 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
            {data?.total ?? 0} Pending Requests
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={isLoading}
        emptyState={
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
             <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-slate-300" />
             </div>
             <p className="font-medium text-slate-600">No pending B2B requests</p>
             <p className="text-sm">When a new company signs up, they will appear here for approval.</p>
          </div>
        }
      />

      {/* Reject Confirmation */}
      <ConfirmDialog
        open={!!rejectingId}
        title="Reject Application?"
        description="Are you sure you want to reject this B2B account request? This will permanently remove the user from the system."
        confirmLabel="Reject & Delete"
        confirmVariant="destructive"
        loading={rejectMutation.isPending}
        onConfirm={() => {
          if (rejectingId) {
            rejectMutation.mutate({ id: rejectingId }, {
              onSuccess: () => setRejectingId(null)
            });
          }
        }}
        onCancel={() => setRejectingId(null)}
      />

      {/* Request Info Dialog */}
      <Dialog open={!!requestingId} onOpenChange={(v) => !v && setRequestingId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Additional Information</DialogTitle>
            <DialogDescription>
              Send an email to the applicant asking for specific details or documents.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Message to Applicant</label>
            <Textarea
              placeholder="e.g. Please provide a clear copy of your GST certificate and business license..."
              rows={5}
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              className="resize-none"
            />
            <p className="text-[10px] text-slate-500 mt-2 italic">
              This message will be included in the official email notification sent to the company's registered email address.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestingId(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (requestingId && infoMessage.trim()) {
                  requestInfoMutation.mutate({ id: requestingId, message: infoMessage }, {
                    onSuccess: () => {
                      setRequestingId(null);
                      setInfoMessage("");
                    }
                  });
                } else {
                  toast.error("Please enter a message");
                }
              }}
              disabled={requestInfoMutation.isPending}
            >
              {requestInfoMutation.isPending ? (
                 <Check className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
