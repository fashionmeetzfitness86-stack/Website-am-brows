import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintBookingPage() {
  const location = useLocation();
  // Extract the ID from the end of the path: /admin/print/<uuid>
  const id = location.pathname.split('/admin/print/')[1]?.split('/')[0];
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      if (!id) return;
      const { data } = await supabase.from('bookings').select('*').eq('id', id).single();
      setBooking(data);
      setLoading(false);
    }
    fetchBooking();
  }, [id]);

  if (loading) return <div className="p-10 text-center font-mono text-sm opacity-50">Loading document...</div>;
  if (!booking) return <div className="p-10 text-center font-mono text-sm opacity-50">Booking not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans print:bg-white text-black selection:bg-accent/20">
      {/* Non-printable controls */}
      <div className="print:hidden p-6 max-w-4xl mx-auto flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-ink text-paper px-6 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors shadow-xl">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Printable Document (8.5x11 aspect roughly) */}
      <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 shadow-2xl print:shadow-none print:p-0 my-8 print:my-0">
        {/* Header */}
        <header className="border-b-2 border-black pb-8 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif mb-2">Intake Form</h1>
            <p className="text-sm tracking-widest uppercase font-bold text-gray-500">Ashley M. Brows Studio</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>ID: {booking.id.split('-')[0]}</p>
            <p>Submitted: {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </header>

        {/* Section 1: Client Info */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-200 pb-2 mb-4">Client Information</h2>
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</span><span className="text-lg">{booking.client_name}</span></div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Service</span><span className="text-lg">{booking.service_name}</span></div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</span>{booking.client_email}</div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number</span>{booking.client_phone}</div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Requested Date</span>{booking.booking_date || '—'}</div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Requested Time</span>{booking.booking_time || '—'}</div>
            {booking.referral_source && (
              <div className="col-span-2"><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Referral Source</span>{booking.referral_source}</div>
            )}
          </div>
        </section>

        {/* Section 2: Medical & Intake */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-200 pb-2 mb-4">Medical & Questionnaire</h2>
          <div className="space-y-6">
            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Health Conditions</span>
              <p className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-sm border border-gray-100">{booking.health_conditions || 'None reported.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Previous PMU?</span>
                <p className="text-sm leading-relaxed p-3 bg-gray-50 rounded-sm border border-gray-100">{booking.previous_pmu || 'No / Not specified'}</p>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Skin Type</span>
                <p className="text-sm leading-relaxed p-3 bg-gray-50 rounded-sm border border-gray-100">{booking.skin_type || 'Not specified'}</p>
              </div>
            </div>
            {booking.notes && (
              <div>
                <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Client Notes / Questions</span>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-sm border border-gray-100 italic">"{booking.notes}"</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Photos */}
        {(booking.current_area_photo_url || booking.reference_photo_url) && (
          <section className="mb-10 print:break-inside-avoid">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-200 pb-2 mb-4">Client Photos</h2>
            <div className="grid grid-cols-2 gap-8">
              {booking.current_area_photo_url && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Current Brows/Lips</span>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={booking.current_area_photo_url} alt="Current area" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                </div>
              )}
              {booking.reference_photo_url && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Reference Goal</span>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={booking.reference_photo_url} alt="Reference" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Footer for Signature */}
        <section className="mt-16 pt-16 border-t border-gray-200 print:break-inside-avoid">
          <div className="flex justify-between items-end">
            <div className="w-1/2">
              <div className="border-b border-black mb-2"></div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Admin / Artist Signature</p>
            </div>
            <div className="w-1/3">
              <div className="border-b border-black mb-2"></div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Date</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
