import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Printer, ArrowLeft, ImageOff } from 'lucide-react';

// Extract a storage path from a Supabase Storage URL
function getStoragePath(url: string): string | null {
  if (!url) return null;
  // The URL may be a full signed URL or just a path like "booking-photos/filename.jpg"
  // Try to extract the object path after "/object/public/" or "/object/sign/"
  const match = url.match(/booking-photos\/(.+?)(?:\?|$)/);
  return match ? match[1] : null;
}

async function getSignedUrl(rawUrl: string): Promise<string | null> {
  if (!rawUrl) return null;
  // If already a data URL or blob URL, use as-is
  if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) return rawUrl;
  const path = getStoragePath(rawUrl);
  if (!path) return rawUrl; // fallback: use as-is
  const { data } = await supabase.storage
    .from('booking-photos')
    .createSignedUrl(path, 60 * 60); // 1-hour expiry
  return data?.signedUrl ?? null;
}

function PhotoBlock({ url, label }: { url: string; label: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSignedUrl(url).then(s => {
      if (s) setSignedUrl(s);
      else setError(true);
    });
  }, [url]);

  return (
    <div>
      <span className="block text-[10px] uppercase font-bold text-gray-400 mb-2">{label}</span>
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
        {error ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs">Photo unavailable</span>
          </div>
        ) : signedUrl ? (
          <img src={signedUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
        )}
      </div>
    </div>
  );
}

export default function PrintBookingPage() {
  const location = useLocation();
  const id = location.pathname.split('/admin/print/')[1]?.split('/')[0];
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      if (!id) { setLoading(false); return; }
      const { data } = await supabase.from('bookings').select('*').eq('id', id).single();
      setBooking(data);
      setLoading(false);
    }
    fetchBooking();
  }, [id]);

  if (loading) return <div className="p-10 text-center font-mono text-sm opacity-50">Loading document...</div>;
  if (!booking) return <div className="p-10 text-center font-mono text-sm opacity-50">Booking not found.</div>;

  const hasPhotos = booking.current_area_photo_url || booking.reference_photo_url;

  return (
    <div className="min-h-screen bg-gray-100 font-sans print:bg-white text-black">
      {/* Non-printable toolbar */}
      <div className="print:hidden p-6 max-w-4xl mx-auto flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-ink text-paper px-6 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors shadow-xl">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 shadow-2xl print:shadow-none print:p-0 my-8 print:my-0">

        {/* ── Header ── */}
        <header className="border-b-2 border-black pb-8 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif mb-2">Intake Form</h1>
            <p className="text-sm tracking-widest uppercase font-bold text-gray-500">Ashley M. Brows Studio</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>ID: {booking.id.split('-')[0].toUpperCase()}</p>
            <p>Submitted: {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${
              booking.status === 'Confirmed' ? 'text-emerald-600' :
              booking.status === 'Cancelled' ? 'text-red-500' : 'text-amber-600'
            }`}>{booking.status}</p>
          </div>
        </header>

        {/* ── Section 1: Client Info ── */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-200 pb-2 mb-5">Client Information</h2>
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</span><span className="text-lg">{booking.client_name}</span></div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Service Requested</span><span className="text-lg">{booking.service_name}</span></div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</span>{booking.client_email}</div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number</span>{booking.client_phone}</div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Requested Date</span>{booking.booking_date || '—'}</div>
            <div><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Requested Time</span>{booking.booking_time || '—'}</div>
            {booking.confirmed_date && (
              <div><span className="block text-[10px] uppercase font-bold text-emerald-500 mb-1">Confirmed Date</span><strong>{booking.confirmed_date}</strong></div>
            )}
            {booking.confirmed_time && (
              <div><span className="block text-[10px] uppercase font-bold text-emerald-500 mb-1">Confirmed Time</span><strong>{booking.confirmed_time}</strong></div>
            )}
            {booking.referral_source && (
              <div className="col-span-2"><span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Referral Source</span>{booking.referral_source}</div>
            )}
          </div>
        </section>

        {/* ── Section 2: Client Photos ── */}
        {hasPhotos && (
          <section className="mb-10 print:break-inside-avoid">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-200 pb-2 mb-5">Client Photos</h2>
            <div className="grid grid-cols-2 gap-8">
              {booking.current_area_photo_url && (
                <PhotoBlock url={booking.current_area_photo_url} label="Current Brows / Lips (Before)" />
              )}
              {booking.reference_photo_url && (
                <PhotoBlock url={booking.reference_photo_url} label="Reference / Goal Photo" />
              )}
            </div>
          </section>
        )}

        {/* ── Section 3: Medical & Intake ── */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-200 pb-2 mb-5">Medical & Questionnaire</h2>
          <div className="space-y-5">
            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Health Conditions / Medications</span>
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

        {/* ── Section 4: Admin Notes ── */}
        {booking.admin_notes && (
          <section className="mb-10 print:break-inside-avoid">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-gray-200 pb-2 mb-5">Studio Notes</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap bg-yellow-50 p-4 border border-yellow-200 rounded-sm">{booking.admin_notes}</p>
          </section>
        )}

        {/* ── Signature Footer ── */}
        <section className="mt-16 pt-10 border-t border-gray-200 print:break-inside-avoid">
          <div className="flex justify-between items-end gap-8">
            <div className="flex-1">
              <div className="border-b border-black mb-2 mt-8"></div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Artist / Admin Signature</p>
            </div>
            <div className="flex-1">
              <div className="border-b border-black mb-2 mt-8"></div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Client Signature</p>
            </div>
            <div className="w-36">
              <div className="border-b border-black mb-2 mt-8"></div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Date</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
