import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────
// /booking/success
// ─────────────────────────────────────────────
export function BookingSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingId = params.get('booking_id');

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-lg w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
          className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
        >
          <Check className="w-12 h-12 text-paper" />
        </motion.div>

        {/* Heading */}
        <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Payment Confirmed</p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
          Your Deposit Was<br />Received
        </h1>
        <p className="text-ink/60 leading-relaxed mb-4">
          Your appointment request is now <strong className="text-ink">confirmed</strong>. Ashley will personally reach out within 1–2 business days with your pre-care instructions.
        </p>
        <p className="text-sm text-ink/40 mb-10">
          A receipt has been sent to your email address on file.
        </p>

        {/* Summary box */}
        <div className="bg-paper-dark border border-ink/10 p-6 mb-10 text-left space-y-3 text-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4">What Happens Next</p>
          {[
            ['1', 'Ashley reviews your consultation details'],
            ['2', 'You receive a confirmation email with your appointment time'],
            ['3', 'Pre-care instructions are sent 5 days before your appointment'],
            ['4', 'Day of appointment — arrive 10 minutes early'],
          ].map(([n, txt]) => (
            <div key={n} className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{n}</div>
              <p className="text-ink/70">{txt}</p>
            </div>
          ))}
        </div>

        {bookingId && (
          <p className="text-[10px] text-ink/30 uppercase tracking-widest mb-8">
            Booking reference: <span className="font-mono">{bookingId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-3 px-10 py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors"
        >
          Return to Studio <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// /booking/cancelled
// ─────────────────────────────────────────────
export function BookingCancelled() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingId = params.get('booking_id');

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-lg w-full"
      >
        {/* Icon */}
        <div className="w-24 h-24 bg-warm-gray rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-12 h-12 text-ink/40" />
        </div>

        <p className="text-ink/40 text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Payment Incomplete</p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">
          Your Deposit Was<br />Not Completed
        </h1>
        <p className="text-ink/60 leading-relaxed mb-4">
          Your appointment is still <strong className="text-ink">pending</strong> — no charge was made to your card. You can return to complete your deposit at any time.
        </p>
        <p className="text-sm text-ink/40 mb-10">
          Your booking details have been saved. Simply return to the booking page to try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/booking')}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-accent text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink transition-colors"
          >
            <Calendar className="w-4 h-4" /> Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 border border-ink/20 text-ink text-[10px] uppercase tracking-[0.3em] font-bold hover:border-accent hover:text-accent transition-colors"
          >
            Return to Studio
          </button>
        </div>

        {bookingId && (
          <p className="text-[10px] text-ink/30 uppercase tracking-widest mt-8">
            Booking reference: <span className="font-mono">{bookingId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
      </motion.div>
    </div>
  );
}
