import React, { useState } from 'react';
import { Package, Truck, CheckCircle, MapPin, Plus, Loader2 } from 'lucide-react';
import { useOrderTracking, useAddTracking } from '@/lib/admin/hooks/useOrderAdmin';
import { format } from 'date-fns';

interface TrackingTimelineProps {
  orderId: string;
}

export function TrackingTimeline({ orderId }: TrackingTimelineProps) {
  const { data: tracking, isLoading } = useOrderTracking(orderId);
  const addTracking = useAddTracking(orderId);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ status: '', location: '', notes: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTracking.mutateAsync(form);
    setForm({ status: '', location: '', notes: '' });
    setIsAdding(false);
  };

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Tracking History</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs flex items-center gap-1 text-black font-medium hover:underline bg-gray-50 px-2 py-1 rounded"
        >
          <Plus className="w-3 h-3" /> Add Update
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
          <input
            placeholder="Status (e.g. In Transit)"
            className="w-full text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-black"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            required
          />
          <input
            placeholder="Location (Optional)"
            className="w-full text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-black"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />
          <textarea
            placeholder="Notes (Optional)"
            className="w-full text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-black"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs px-2 py-1 text-gray-500">Cancel</button>
            <button
              type="submit"
              disabled={addTracking.isPending}
              className="text-xs px-3 py-1 bg-black text-white rounded disabled:opacity-50"
            >
              {addTracking.isPending ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      )}

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
        {tracking?.map((entry, index) => (
          <div key={entry.id} className="relative">
            <div className={`absolute -left-[1.375rem] p-1 rounded-full bg-white border-2 ${index === 0 ? 'border-black' : 'border-gray-200'}`}>
              {entry.status.toLowerCase().includes('deliver') ? <CheckCircle className="w-3 h-3" /> :
               entry.status.toLowerCase().includes('transit') || entry.status.toLowerCase().includes('ship') ? <Truck className="w-3 h-3" /> :
               <Package className="w-3 h-3" />}
            </div>
            <div>
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-gray-900">{entry.status}</p>
                <span className="text-[10px] text-gray-400">{format(new Date(entry.createdAt), 'MMM d, h:mm a')}</span>
              </div>
              {entry.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="w-3 h-3" /> {entry.location}
                </div>
              )}
              {entry.notes && <p className="text-xs text-gray-600 mt-1 italic">"{entry.notes}"</p>}
            </div>
          </div>
        ))}
        {(!tracking || tracking.length === 0) && (
          <div className="relative py-2">
            <div className="absolute -left-[1.375rem] p-1 rounded-full bg-white border-2 border-gray-100">
              <Package className="w-3 h-3 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 italic">No tracking updates yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
