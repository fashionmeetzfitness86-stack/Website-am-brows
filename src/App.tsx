import { motion, AnimatePresence } from 'motion/react';
import { Menu, ArrowRight, Instagram, Facebook, Mail, Calendar, User, Star, X, ChevronRight, ChevronLeft, MapPin, Phone, Plus, Check, Clock, Shield, Sparkles } from 'lucide-react';
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { useSiteContent, type ServiceCMS, type GalleryItemCMS } from './hooks/useSiteContent';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useSEO } from './hooks/useSEO';
import LoginPage from './pages/LoginPage';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './AdminDashboard';

// --- Types ---
type Page = 'home' | 'services' | 'gallery' | 'booking' | 'artist' | 'contact' | 'service-detail' | 'privacy' | 'policies' | 'aftercare';

// Display labels for nav/footer where the page token differs from the wording we
// want shown. Falls back to the raw token (which CSS uppercases) when absent.
const PAGE_LABELS: Partial<Record<Page, string>> = {
  aftercare: 'Preparation & Aftercare',
};
const pageLabel = (p: Page) => PAGE_LABELS[p] ?? p;


// --- Booking ---
// Booking requests go through Ashley's Jotform. Update this constant if she
// changes it. All "Book Now" CTAs open it in a new tab; /booking redirects.
const JOTFORM_BOOKING_URL = 'https://form.jotform.com/210908294397061';
const openBooking = () => window.open(JOTFORM_BOOKING_URL, '_blank', 'noopener,noreferrer');
// Opens Jotform with a `?service=<name>` query parameter so Ashley can prefill
// the dropdown / track which service the inquiry came from.
const openBookingFor = (serviceName?: string) => {
  const url = serviceName
    ? `${JOTFORM_BOOKING_URL}?service=${encodeURIComponent(serviceName)}`
    : JOTFORM_BOOKING_URL;
  window.open(url, '_blank', 'noopener,noreferrer');
};


// CMS content context — App() loads from Supabase and provides; components consume.
const SiteContentContext = createContext<{ services: ServiceCMS[]; galleryItems: GalleryItemCMS[] } | null>(null);
const useSite = () => {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('SiteContentContext missing — wrap your tree in <SiteContentContext.Provider>');
  return ctx;
};

const defaultServices: ServiceCMS[] = [
  {
    id: 'brows',
    title: 'Brows',
    price: '$650+',
    shortDescription: 'Powder brows and Nano/Nano Fusion brows. Soft, natural, customized.',
    description: 'Ashley offers two brow techniques. Each is fully customized to your face shape, undertone and lifestyle. Pick the variant that suits your skin and the look you want, and book directly below.',
    image: '/ashley-home-feature.jpg',
    tags: ['Powder Finish', 'Nano Strokes', 'All Skin Types'],
    variants: [
      {
        title: 'Powder Brows',
        price: '$650',
        image: '/gallery/powder-brows-portrait.jpg',
        description: 'Most popular. Done with a single-needle tattoo machine that layers small pixels of pigment into the skin until the desired amount of saturation is achieved. Can be bold and defined to your preference, or softly shaded with no harsh edges for a natural makeup look. Best suited for all skin types, especially oily and mature types. (Does not include touch-up.)'
      },
      {
        title: 'Nano / Nano Fusion Brows',
        price: '$700',
        image: '/gallery/brows-nano-portrait.jpg',
        description: 'Not to be confused with microblading. Done using a machine, making it gentler on the skin and more sustainable long-term. NANO: a blend of ultra-fine, hair-like strokes for a soft natural enhancement that mimics real brow hair. FUSION: a seamless blend of Nano hair strokes and powder shading. Nano Fusion brows offer the best of both worlds — natural texture with added depth and fullness, perfect for those who want realistic detail in the front and a softly defined, fuller brow overall.'
      }
    ],
    process: [
      { step: 'Consultation', description: 'We map your face and select pigments that harmonize with your skin undertones.' },
      { step: 'Procedure', description: 'A 2 to 2.5 hour session including drawing, numbing, treatment and aftercare instructions.' },
      { step: 'Perfection Session', description: 'A follow-up at 6 to 12 weeks ($150) reinforces any imperfections from the heal.' }
    ],
    testimonials: [
      { author: 'Cindy', text: 'After seeing another senior with beautiful brows created by Ashley I had to give it a try. The result was outstanding. It is remarkable how the brows have so much depth and beauty.' },
      { author: 'Kyla', text: 'Ashley is by far one of the best when it comes to brows. She listens to her clients, gives her honest opinion, and her work is flawless. I have had so many compliments on my brows.' }
    ]
  },
  {
    id: 'lips',
    title: 'Lip Blush',
    price: '$650',
    shortDescription: 'A wash of color restored to your lips, fuller, defined, youthful.',
    description: 'Lip Blush (or "watercolor lips") is another form of cosmetic tattooing. Immediate results look bright, bold and lipstick-like but heal down to a tint/stain. A wash of restored color can make lips appear fuller, more defined and more youthful. Great for covering fordyce spots, scars, pale lips, defining borders, correcting asymmetries and neutralizing dark pigmentation, all while staying within your natural vermillion border. Lasts 2 to 4 years.',
    image: '/lip-blush.webp',
    tags: ['Watercolor Lips', 'Defined Border', 'Lasts 2-4 Years'],
    process: [
      { step: 'Color Theory', description: 'We analyze your natural lip tones and neutralize any blue or purple where needed.' },
      { step: 'Design', description: 'We define the borders, cupid\'s bow and corners while respecting your natural lip shape.' },
      { step: 'Heal & Bloom', description: 'Lips heal in 5 to 7 days, then color blooms back through over a few weeks.' }
    ],
    testimonials: [
      { author: 'Tatjana', text: 'I have had my brows and lips done by her now and I am obsessed with both! Her attention to detail and meticulous eye makes for literal perfection.' },
      { author: 'Carolyn', text: 'She was meticulous about getting my lips perfect and clearly skilled with the process. I left knowing what to expect in terms of healing and results. My lips look great!' }
    ]
  },
  {
    id: 'liner',
    title: 'Defining Liner',
    price: '$400+',
    shortDescription: 'From subtle lash enhancement to a softly shaded winged liner.',
    description: 'Lash Enhancement ($400) is a thin tattooed line just between your lashes, making them appear darker and fuller at the base, very subtle, perfect for anyone not committed to daily eyeliner. Shaded Lash Enhancement ($450) adds thickness for a simple eyeliner look. Shaded Eyeliner ($550) is a softly shaded winged liner using three blended tones for a seamless finish, customized to your eye shape. Bottom/lower-lid eyeliner is not offered at this time.',
    image: '/gallery/lash-enhancement-before-after.jpg',
    tags: ['Lash Enhancement', 'Soft Wing', '3 Blended Tones'],
    process: [
      { step: 'Style Selection', description: 'We pick the depth, thickness and shape that suits your eye and lifestyle.' },
      { step: 'Symmetry Check', description: 'Mirror-perfect alignment confirmed before any pigment is laid down.' },
      { step: 'Pigment Fill', description: 'Worked between or above the lashes for a dense, natural-looking line or wing.' }
    ],
    testimonials: []
  },
  {
    id: 'tooth-gems',
    title: 'Tooth Gems',
    price: '$60+',
    shortDescription: 'Crystal and gold tooth gems, from a single crystal to a full disco tooth.',
    description: 'Tooth gems are non-permanent decorative jewels applied to the surface of the tooth. Single crystals start at $60, with options for multi-crystal sets ($100 / $125), gold applications ($120 and up), and a full "disco tooth" ($250). Gems are sourced from Tegan’s Tooth Gems, Tooth Kandy and Isisngold, email ashleymbrows@gmail.com with a screenshot of your pick to book.',
    image: '/gallery/tooth-gems.jpg',
    tags: ['Crystals', 'Gold Gems', 'Non-Permanent'],
    process: [
      {
        step: 'Pick Your Gem',
        description: (
          <>
            Browse the vendor catalogues,{' '}
            <a href="https://www.teganstoothgems.com/" target="_blank" rel="noopener noreferrer"
               className="text-ink/80 border-b border-accent/40 hover:border-accent hover:text-ink transition-colors">
              Tegan’s
            </a>
            ,{' '}
            <a href="https://toothkandy.com/pages/collections?view=gold" target="_blank" rel="noopener noreferrer"
               className="text-ink/80 border-b border-accent/40 hover:border-accent hover:text-ink transition-colors">
              Tooth Kandy
            </a>
            {' '}and{' '}
            <a href="https://isisngold.com/collections/all-teeth-jewelry" target="_blank" rel="noopener noreferrer"
               className="text-ink/80 border-b border-accent/40 hover:border-accent hover:text-ink transition-colors">
              Isisngold
            </a>
            {' '}, then email your selection.
          </>
        )
      },
      { step: 'Application', description: 'A quick, non-invasive application with dental-grade adhesive, no drilling, no damage.' },
      { step: 'Wear & Enjoy', description: 'Gems typically last several months to a year with normal wear; they can be added to or removed any time.' }
    ],
    testimonials: []
  }
];

const artists = [
  {
    name: 'Ashley Miller',
    role: 'Founder & Master Artist',
    image: '/ashley-portrait.jpg',
    bio: 'Specializing in "The Signature Stroke", Ashley blends hyper-realism with editorial design for a timeless look.'
  }
];

const testimonials = [
  {
    author: 'Cindy',
    role: 'Brows Client',
    text: 'After seeing another "senior" with beautiful brows created by Ashley I had to give it a try. The result was outstanding. It is remarkable how the brows have so much depth and beauty. It really helps to define the face when brows are completely gone or not full.',
    rating: 5
  },
  {
    author: 'Tatjana',
    role: 'Brows & Lip Blush Client',
    text: 'Ashley is the best around. I have had my brows and lips done by her now and I am obsessed with both! Her attention to detail and VERY meticulous eye and application makes for literal perfection. She made it so comfortable with all her knowledge of everything, answered every little question I had and put my nerves at ease.',
    rating: 5
  },
  {
    author: 'Cynthia',
    role: 'Powder Brows Client',
    text: 'Ashley did such a great job on my powder brows! I had {not so great} microblading done previously. She reshaped and made my brows perfectly symmetrical. You can tell she wants your brows to be perfection! She sets expectations right away and gives detailed instructions on aftercare and what to expect as they heal. Don\'t go to anyone else for this procedure!',
    rating: 5
  }
];

const faqs = [
  {
    question: "How long does permanent makeup last?",
    answer: "Brow results typically last 1 to 3 years, depending on lifestyle, skin type, age, medication and sun exposure. Lip blush lasts 2 to 4 years. We recommend an annual or periodic touch-up to keep things looking fresh."
  },
  {
    question: "Does the procedure hurt?",
    answer: "Two topical anesthetics are available on-site to minimize discomfort. Per current Michigan regulations, numbing with lidocaine up to 5% requires a valid doctor's note and prescription. Brows and lip blush can be performed without numbing if preferred."
  },
  {
    question: "What is the healing process like?",
    answer: "Initial redness and inflammation subside quickly. Your tattoo may appear bold or darker than anticipated, this is completely normal. Most healing occurs in 7 to 10 days, with total healing around 4 weeks. Lips heal faster, in roughly 5 to 7 days, but take a few weeks for the color to bloom back through."
  },
  {
    question: "Do I need a touch-up?",
    answer: "Yes. Cosmetic tattoos are a two-step process. A follow-up perfection session at 6 to 12 weeks reinforces pigment and allows for adjustments. After that, periodic touch-ups every 1 to 3 years keep the work looking sharp."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Common Inquiries</p>
          <h2 className="text-4xl md:text-5xl font-serif">Frequently Asked</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-ink/5 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full py-6 flex justify-between items-center text-left group focus-visible:outline-accent"
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="text-lg font-serif group-hover:text-accent transition-colors">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  className="text-accent"
                  aria-hidden="true"
                >
                  <Plus className="w-5 h-5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    role="region"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-8 text-ink/60 leading-relaxed max-w-2xl italic">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Components ---

const Navbar = ({ onNavigate, currentPage }: { onNavigate: (page: Page) => void, currentPage: Page }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navigate = (page: Page) => {
    onNavigate(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks: Page[] = ['home', 'services', 'gallery', 'artist', 'aftercare', 'contact', 'policies'];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-paper/90 backdrop-blur-md border-b border-ink/5" aria-label="Main Navigation">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 focus-visible:outline-accent"
            aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen
                ? <motion.span key="x" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><X className="w-5 h-5" /></motion.span>
                : <motion.span key="m" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><Menu className="w-5 h-5" /></motion.span>
              }
            </AnimatePresence>
          </button>
          <button
            onClick={() => navigate('home')}
            className="cursor-pointer focus-visible:outline-accent flex items-center"
            aria-label="Ashley Brows Home"
          >
            <img src="/logo.png" alt="Ashley Brows" className="h-28 w-auto" />
          </button>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((p) => (
            <button
              key={p}
              onClick={() => navigate(p)}
              aria-current={currentPage === p ? 'page' : undefined}
              className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-colors focus-visible:outline-accent px-2 py-1 ${currentPage === p ? 'text-accent' : 'text-ink/40 hover:text-ink'}`}
            >
              {pageLabel(p)}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('booking')}
          className="flex items-center gap-2 cursor-pointer group focus-visible:outline-accent"
          aria-label="Book a consultation"
        >
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-[10px] uppercase tracking-widest font-bold group-hover:text-accent transition-colors">Book</span>
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            {/* Menu panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[57px] left-0 right-0 z-40 bg-paper border-b border-ink/5 shadow-xl md:hidden px-8 py-10 flex flex-col gap-2"
            >
              {navLinks.map((p, i) => (
                <motion.button
                  key={p}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  onClick={() => navigate(p)}
                  className={`text-left py-4 border-b border-ink/5 text-sm uppercase tracking-[0.3em] font-bold transition-colors ${currentPage === p ? 'text-accent' : 'text-ink/60 hover:text-accent'}`}
                >
                  {pageLabel(p)}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.06 }}
                onClick={() => navigate('booking')}
                className="mt-6 w-full py-5 bg-accent text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink transition-colors"
              >
                Book Consultation
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};


const Hero = ({ onNavigate }: { onNavigate: (page: Page) => void }) => (
  <section className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-40 pb-6 min-h-[80vh]">
    {/* Background video */}
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster="/ashley-home-feature.jpg"
      className="absolute inset-0 w-full h-full object-cover -z-20 pointer-events-none"
      aria-hidden="true"
    >
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>
    {/* Very subtle paper-tinted overlay — kept light so the video shows clearly */}
    <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/10 to-paper/40 -z-10 pointer-events-none" aria-hidden="true" />

    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-accent text-[10px] uppercase tracking-[0.6em] mb-8 font-bold"
    >
      Ashley Miller • Founder
    </motion.p>
    <motion.h1 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="text-5xl md:text-8xl font-serif leading-[1.1] mb-8 max-w-4xl"
    >
      Cosmetic <br />
      <span className="italic font-normal opacity-90">Tattoo</span>
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="max-w-xl text-ink/60 leading-relaxed mb-12 text-sm md:text-base font-sans"
    >
      Permanent makeup in Brighton, Michigan. Brows, lip blush, eyeliner and decorative work — meticulous, customized, and made to look like you.
    </motion.p>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="flex flex-col md:flex-row gap-4"
    >
      <button 
        onClick={() => onNavigate('gallery')}
        className="px-10 py-4 bg-accent text-paper text-[10px] uppercase tracking-widest font-bold hover:bg-ink transition-colors shadow-xl"
      >
        View Portfolio
      </button>
      <button 
        onClick={openBooking}
        className="px-10 py-4 border border-ink/10 text-[10px] uppercase tracking-widest font-bold hover:bg-paper-dark transition-colors"
      >
        Book Consultation
      </button>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-12 left-12 hidden lg:flex flex-col gap-6"
    >
      <a href="https://www.instagram.com/ashleymbrows?igsh=YXQyM290NW1uMG9n" target="_blank" rel="noopener noreferrer" className="text-ink/30 hover:text-accent transition-colors">
        <Instagram className="w-5 h-5" />
      </a>
      <a href="https://www.facebook.com/ashleymbrows" target="_blank" rel="noopener noreferrer" className="text-ink/30 hover:text-accent transition-colors">
        <Facebook className="w-5 h-5" />
      </a>
      <a href="mailto:ashleymbrows@gmail.com" className="text-ink/30 hover:text-accent transition-colors">
        <Mail className="w-5 h-5" />
      </a>
    </motion.div>
    
    {/* Floating Elements/Images backdrop */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full h-full opacity-10 blur-3xl pointer-events-none">
       <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full animate-pulse" />
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-light rounded-full animate-pulse delay-1000" />
    </div>
  </section>
);

const About = () => (
  <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
    <div className="grid md:grid-cols-2 gap-16 items-center">
       <motion.div 
         initial={{ opacity: 0, x: -40, scale: 0.97 }}
         whileInView={{ opacity: 1, x: 0, scale: 1 }}
         viewport={{ once: true }}
         transition={{ duration: 0.9, ease: 'easeOut' }}
         className="relative aspect-[3/4] bg-warm-gray overflow-hidden shadow-2xl rounded-2xl"
       >
         <img
           src="/ashley-portrait.jpg"
           alt="Ashley Miller"
           className="w-full h-full object-cover"
         />
         <motion.div
           initial={{ scaleX: 1 }}
           whileInView={{ scaleX: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.1 }}
           style={{ originX: 0 }}
           className="absolute inset-0 bg-paper pointer-events-none"
         />
       </motion.div>
       <motion.div
         initial={{ opacity: 0, x: 40 }}
         whileInView={{ opacity: 1, x: 0 }}
         viewport={{ once: true }}
         transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
       >
         <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-[10px] uppercase tracking-[0.5em] text-accent mb-6 font-bold">The Studio</motion.p>
         <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.7 }} className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Permanent Makeup, <br /> Done Right</motion.h2>
         <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="space-y-6 text-ink/70 leading-relaxed font-sans">
           <p>
             Ashley Brows is a private permanent makeup studio in Brighton, Michigan, run by Ashley Miller. The work is meticulous, the consultations honest, and the goal is always the same: results that look like you, only better.
           </p>
           <p>
             Cosmetic tattoos are always a two-step process. Your follow-up perfection session at 6 to 12 weeks reinforces any imperfections from the healing process, only after that touch-up is your treatment complete.
           </p>
         </motion.div>
         <div className="mt-12 flex gap-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
              <p className="text-2xl font-serif">Brighton, MI</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Studio Location</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.75 }}>
              <p className="text-2xl font-serif">All Skin Types</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Welcomed</p>
            </motion.div>
         </div>
       </motion.div>
    </div>
  </section>
);

const Services = ({ onSelectService, onNavigate, excludeIds = [], asPage = false }: { onSelectService: (service: any) => void, onNavigate: (page: any) => void, excludeIds?: string[], asPage?: boolean }) => {
  const { services } = useSite();
  return (
  // asPage: standalone /services route — extra top padding clears the fixed navbar
  // and a proper page title is shown. On the homepage (asPage=false) it stays a
  // compact in-page section.
  <section className={`${asPage ? 'pt-40 md:pt-44 min-h-screen ' : ''}py-24 bg-paper-dark px-6`}>
    <div className="max-w-7xl mx-auto">
      <div className="mb-20 text-center">
        {asPage && <p className="text-accent text-[10px] uppercase tracking-[0.5em] mb-4 font-bold">Services &amp; Pricing</p>}
        <h2 className="text-4xl md:text-6xl font-serif mb-4">{asPage ? 'Curated Aesthetics' : 'Curated Aesthetics'}</h2>
        <p className="text-ink/50 uppercase tracking-[0.3em] font-bold text-[10px]">Every procedure is a bespoke masterpiece</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {services.filter(s => !excludeIds.includes(s.id)).map((service, idx) => (
          <motion.button 
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
            transition={{ delay: idx * 0.15, duration: 0.6, ease: 'easeOut' }}
            className="group cursor-pointer text-left w-full focus-visible:outline-accent"
            onClick={() => onSelectService(service)}
            aria-label={`View details for ${service.title}`}
          >
            <div className="aspect-square bg-paper overflow-hidden mb-6 relative rounded-3xl shadow-md group-hover:shadow-xl transition-shadow">
               <img src={service.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="px-2">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-serif">{service.title}</h3>
                <span className="text-sm font-medium text-accent">{service.price}</span>
              </div>
              <p className="text-sm text-ink/60 leading-relaxed mb-5 line-clamp-2">
                {service.shortDescription}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {service.tags.map(tag => (
                  <span key={tag} className="text-[9px] uppercase tracking-widest px-3 py-1 bg-paper font-bold text-ink/40 rounded-full">{tag}</span>
                ))}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectService(service); }}
                className="w-full py-4 bg-accent text-paper text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-ink transition-all duration-300 flex items-center justify-center gap-3"
              >
                Book Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.button>
        ))}
      </div>

      {/* On the homepage (not the full /services page) invite visitors to see the
          rest of the menu — Tooth Gems and any other services hidden here. */}
      {!asPage && (
        <div className="text-center mt-16">
          <button
            onClick={() => onNavigate('services')}
            className="group inline-flex items-center gap-3 px-12 py-4 border border-ink/15 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent hover:text-paper hover:border-accent transition-all focus-visible:outline-accent"
          >
            See More Services <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  </section>
  );
};

const Testimonials = () => (
  <section className="py-24 px-6 max-w-5xl mx-auto">
    <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
       <p className="text-[10px] uppercase tracking-[0.5em] text-accent mb-4 font-bold">In Their Own Words</p>
       <h2 className="text-4xl md:text-5xl font-serif">The Client Perspective</h2>
    </motion.div>
    <div className="grid md:grid-cols-3 gap-12">
      {testimonials.map((t, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.2, duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col p-8 bg-paper-dark border border-ink/5 hover:shadow-xl transition-shadow duration-500"
        >
          <div className="flex gap-1 mb-8">
            {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}
          </div>
          <p className="text-lg font-serif italic mb-8 leading-relaxed text-ink/80">"{t.text}"</p>
          <div className="mt-auto">
            <p className="text-xs font-bold uppercase tracking-widest">{t.author}</p>
            <p className="text-[10px] uppercase tracking-widest opacity-40">{t.role}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

const Footer = ({ onNavigate }: { onNavigate: (page: Page) => void }) => (
  <footer style={{ backgroundColor: '#333D29' }} className="text-paper pt-20 pb-28 md:py-20 px-6">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
         <h2 className="text-3xl font-display uppercase tracking-[0.3em] mb-6">Ashley M. Brows</h2>
         <p className="text-paper/50 max-w-sm leading-relaxed text-sm">
           Artistry in Permanent Beauty. A sanctuary for the modern individual seeking timeless refinement.
         </p>
         <div className="flex gap-4 mt-8">
            <a href="https://www.instagram.com/ashleymbrows?igsh=YXQyM290NW1uMG9n" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
              <Instagram className="w-5 h-5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity focus-visible:outline-accent" />
            </a>
            <a href="https://www.facebook.com/ashleymbrows" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
              <Facebook className="w-5 h-5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity focus-visible:outline-accent" />
            </a>
            <a href="mailto:ashleymbrows@gmail.com" aria-label="Email studio concierge">
              <Mail className="w-5 h-5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity focus-visible:outline-accent" />
            </a>
         </div>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6 opacity-30">Experience</h4>
        <ul className="space-y-3 text-sm">
           <li className="hover:text-accent transition-colors">
             <button 
               onClick={() => onNavigate('home')}
               className="focus-visible:outline-accent uppercase text-[10px] font-bold"
             >
               The Studio
             </button>
           </li>
           <li className="hover:text-accent transition-colors">
             <button className="focus-visible:outline-accent uppercase text-[10px] font-bold" onClick={() => onNavigate('aftercare')}>Preparation &amp; Aftercare</button>
           </li>
           <li className="hover:text-accent transition-colors">
             <button className="focus-visible:outline-accent uppercase text-[10px] font-bold" onClick={() => onNavigate('policies')}>Studio Policies</button>
           </li>
           <li className="hover:text-accent transition-colors">
             <button className="focus-visible:outline-accent uppercase text-[10px] font-bold" onClick={() => onNavigate('contact')}>Contact Studio</button>
           </li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6 opacity-30">Legal</h4>
        <ul className="space-y-3 text-sm">
           <li>
             <button onClick={() => onNavigate('policies')} className="cursor-pointer hover:text-accent transition-colors focus-visible:outline-accent">Booking Policy</button>
           </li>
           <li>
             <button onClick={() => onNavigate('privacy')} className="cursor-pointer hover:text-accent transition-colors focus-visible:outline-accent">Privacy</button>
           </li>
            <li><button onClick={() => onNavigate('policies')} className="cursor-pointer hover:text-accent transition-colors focus-visible:outline-accent">Terms</button></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-paper/10 text-[10px] uppercase tracking-widest font-bold opacity-30 text-center flex justify-between items-center">
       <p>© 2026 Ashley M. Brows. Cosmetic Tattoo Artist.</p>
       <div className="flex gap-8">
          <span>Brighton, Michigan</span>
           <span>USA</span>
       </div>
    </div>
  </footer>
);

// --- Page Content ---
const PrivacyPage = () => (
  <div className="pt-24 min-h-screen bg-paper pb-32">
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Legal</p>
      <h1 className="text-4xl md:text-6xl font-serif mb-4">Privacy Policy</h1>
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-16">Last updated: May 12, 2026</p>

      <div className="space-y-12 text-ink/70 leading-relaxed text-sm md:text-base">
        <section>
          <p>
            Ashley Brows ("we", "our", "us") respects your privacy. This Privacy Policy explains
            what information we collect when you visit our website or book a service with us,
            how we use it, and the choices you have. The studio is operated by Ashley Miller and
            based in Brighton, Michigan.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly to us, including:</p>
          <ul className="space-y-2 list-disc pl-6">
            <li><strong className="text-ink">Booking and consultation requests:</strong> your full name, email address, phone number, the service you are interested in, your preferred date and time, and any notes you choose to share about your goals or skin type.</li>
            <li><strong className="text-ink">Contact form messages:</strong> your name, email, subject line, and the contents of your message.</li>
            <li><strong className="text-ink">Communications:</strong> when you message us on Instagram, Facebook, or by email, we retain a record of the conversation.</li>
          </ul>
          <p className="mt-4">
            We also automatically collect limited technical information when you visit the
            site, for example, your IP address, device and browser type, and the pages
            you view. This data helps us keep the site secure and understand how visitors
            interact with it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">How We Use Your Information</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>To respond to consultation requests and confirm appointments.</li>
            <li>To send appointment confirmations, reminders, and pre-care or aftercare instructions.</li>
            <li>To answer questions you send through the contact form or social channels.</li>
            <li>To maintain client records for ongoing care (for example, touch-up appointments and color history).</li>
            <li>To improve the site, troubleshoot issues, and prevent abuse.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">How We Share Your Information</h2>
          <p className="mb-4">
            We do not sell or rent your personal information. We share information only with
            trusted service providers who help us operate the studio and this site, for
            example, our website host, our email and form-processing tools, and our booking
            and appointment software. These providers may only use your information to provide
            their services to us.
          </p>
          <p>
            We may also disclose information if required by law, or to protect the rights,
            property, or safety of Ashley Brows, our clients, or others.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">Cookies &amp; Analytics</h2>
          <p>
            The site may use cookies and similar technologies to remember your preferences and
            measure aggregate site usage. You can disable cookies in your browser settings,
            though some parts of the site may not function as expected without them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">Data Retention</h2>
          <p>
            We retain client records for as long as needed to provide our services to you and
            for legitimate business or legal purposes (for example, supporting future touch-up
            appointments). When information is no longer required, we delete or anonymize it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Request a copy of the personal information we hold about you.</li>
            <li>Ask us to correct information that is inaccurate or incomplete.</li>
            <li>Ask us to delete your information, subject to any obligations we may have to retain it.</li>
            <li>Opt out of marketing communications at any time.</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, email us at the address below.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">Children's Privacy</h2>
          <p>
            Our services are intended for adults. We do not knowingly collect information from
            anyone under the age of 18. If you believe a minor has provided us with personal
            information, please contact us so that we can remove it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">Security</h2>
          <p>
            We take reasonable steps to protect the information we collect against
            unauthorized access, alteration, or disclosure. No internet transmission is ever
            completely secure, however, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise
            the "Last updated" date at the top of this page. Significant changes will be
            communicated through the site or by email when appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-ink mb-4">Contact Us</h2>
          <p>
            Questions about this Privacy Policy or about how your information is handled?
            Email us at <a href="mailto:ashleymbrows@gmail.com" className="text-accent hover:underline">ashleymbrows@gmail.com</a>, Ashley Brows, Brighton, Michigan.
          </p>
        </section>
      </div>
    </div>
  </div>
);

const PoliciesPage = () => (
  <div className="pt-24 min-h-screen bg-paper pb-32">
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Legal</p>
      <h1 className="text-4xl md:text-6xl font-serif mb-4">Policies</h1>
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-16">Please read carefully before booking</p>

      <div className="space-y-6 text-ink/70 leading-relaxed text-sm md:text-base">
        <ul className="space-y-4 list-disc pl-6">
          <li>Under Body Art Licensure, <strong className="text-ink">no person</strong> under the age of 18 is allowed servicing, even with parental consent.</li>
          <li><strong className="text-ink">Valid ID</strong> is required at the time of your service.</li>
          <li>Guidelines are provided to achieve optimal results, but there are <strong className="text-ink">no guarantees</strong> due to different skin types reacting differently to procedures. Please check the FAQ section to make sure you are an eligible candidate. If you are unsure, please contact us.</li>
          <li><strong className="text-ink">Deposits:</strong> a minimum of <strong className="text-ink">$100 deposit</strong> will be requested in order to book and is <strong className="text-ink">non-refundable</strong> under any circumstance. Your deposit will go towards the overall cost. This ensures you are serious about your appointment.</li>
          <li><strong className="text-ink">Rescheduling:</strong> a minimum of <strong className="text-ink">48 hours</strong> is required to reschedule your appointment without penalty. Less than 48 hours results in <strong className="text-ink">forfeiture of your deposit</strong> and a new deposit will be required to reschedule. One reschedule is allowed within the minimum time frame before a new deposit will be required.</li>
          <li><strong className="text-ink">Cancellations:</strong> any and all cancellations without notice will result in a charge of the <strong className="text-ink">full cost of the service</strong> to the card on file. A new deposit will be required to reschedule.</li>
          <li><strong className="text-ink">Late arrivals:</strong> being more than <strong className="text-ink">15 minutes late</strong> to your appointment can result in forfeiture of your deposit and/or cancellation.</li>
          <li>We accept all major credit cards, however <strong className="text-ink">cash is preferred</strong>. The remaining balance is due at the time of your appointment.</li>
          <li>A minimum of <strong className="text-ink">2 sessions</strong> is highly recommended for desired results. Additional sessions may be needed.</li>
          <li><strong className="text-ink">Touch-up appointments are for existing clientele only.</strong></li>
          <li>Annual touch-ups must be completed before <strong className="text-ink">3 years</strong> from the initial session, otherwise full session pricing applies.</li>
          <li>If you have previous work by another artist you <strong className="text-ink">must</strong> email clear photos of your brows (right, left, and both) in good lighting in order to be approved for booking, <a href="mailto:ashleymbrows@gmail.com" className="text-accent hover:underline">ashleymbrows@gmail.com</a>.</li>
          <li>Pricing is subject to change at any time without notice at the artist&rsquo;s discretion.</li>
          <li><strong className="text-ink">All transactions are final and no refunds will be issued.</strong></li>
        </ul>

        <section className="pt-12">
          <h2 className="text-2xl font-serif text-ink mb-4">Permanent makeup CANNOT be performed if any of the below apply to you</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Pregnant or breastfeeding</li>
            <li>Under the age of 18</li>
            <li>Accutane in the past year</li>
            <li>Undergoing chemotherapy (consult your doctor)</li>
            <li>Serious heart conditions</li>
            <li>Skin irritations in the brow area (rashes, sunburn, acne, psoriasis)</li>
            <li>Frequently sun tan</li>
            <li>Prone to keloid scarring</li>
            <li>Botox in the last 2 weeks</li>
            <li>Chemical peel, laser or microneedling in the last 4 weeks</li>
            <li>Allergy to Lidocaine, Tetracaine, or Epinephrine</li>
            <li>Blood thinners (must be discontinued 24 hours before procedure: Aspirin, Niacin, Vitamin E, Fish Oil or Ibuprofen)</li>
            <li>Hemophilia</li>
            <li>Auto immune diseases</li>
            <li>Diabetic (must have a doctor&rsquo;s note)</li>
            <li>Any active infection</li>
            <li>Non-compliant with aftercare instructions</li>
          </ul>
        </section>

        <section className="pt-8">
          <p>
            Questions about any of the above? Email <a href="mailto:ashleymbrows@gmail.com" className="text-accent hover:underline">ashleymbrows@gmail.com</a> before booking.
          </p>
        </section>
      </div>
    </div>
  </div>
);

// Prep + Aftercare content, recovered from Ashley's previous site. Items beginning
// with "## " render as a small accent sub-heading instead of a bullet.
const aftercareGuides: { title: string; prep: string[]; after: string[] }[] = [
  {
    title: 'Brows',
    prep: [
      'Avoid caffeine/alcohol and use of blood thinners (aspirin, ibuprofen, fish oil, Niacin, etc.) 24+ hours prior.',
      'Discontinue skin care with exfoliants/acids (AHA/BHA, glycolic, Retin-A, etc.) 2 weeks prior.',
      'Avoid sun tanning 30 days prior to and after your appointment. Always use sunscreen. Coming to your appointment with a tan will result in being sent home and rescheduling.',
      'Botox/Filler should be done 2 weeks prior.',
      'Brow waxing and shaping at least 72 hours prior.',
      'Brow tinting 7 days prior.',
      'Come with your brows grown out so Ashley can see how they grow naturally.',
      'Avoid exercise. Elevated heart rates increase oil production and blood flow, leading to poor healed results. Sweat is essentially salt water, which dissolves pigment.',
      'If you regularly fill in your brows, come with them filled in so Ashley can see what you are used to.',
      'Makeup is optional — we take a lot of photos, so come however you are most comfortable.',
    ],
    after: [
      'Very important! One hour after your procedure, wipe away the barrier cream and lymph with a clean, lightly dampened cotton pad or tissue. Gently pat dry and reapply a very thin layer of fresh barrier cream. Repeat every 2–3 hours for the rest of the day, then 4 times per day for the next 3 days. Dry heal thereafter, but keep the area clean.',
      'Lightly wash the area once per day for the first 7 days using a fragrance-free, dye-free, non-exfoliating cleanser and clean fingertips, in a gentle circular motion for 5 seconds. Rinse with cool water and pat dry with a tissue.',
      'Do NOT scratch, rub or pick at the area at all during healing.',
      'Do NOT oversaturate or submerge brows in water for 7 days. Avoid hot showers, swimming, saunas, lakes, pools or any other bodies of water for at least 10 days.',
      'Do NOT perform any exercise or task that causes perspiration for 7 days.',
      'Do NOT tint, thread or wax the area, receive Botox or other injectables, or get a facial or skin treatment for at least 14 days.',
      'Do NOT use any exfoliating products on the brow area EVER (Retin-A, AHA/glycolic acids, anti-aging creams/serums, scrubs, chemical peels).',
      'Avoid sun exposure for 7 days, then always protect with SPF 30 to prevent premature fading.',
      'Do NOT apply makeup, face creams, ointments or balms to the area for at least 7 days.',
      'Your brows will change over the next few weeks — too dark at first, then very light, with color and definition returning around the 4th week. This is normal.',
      'Schedule a Perfection Session 6–8 weeks after the initial procedure to address any healing imperfections.',
    ],
  },
  {
    title: 'Lip Blush',
    prep: [
      'Very important! If you are prone to cold sores, get prescribed an anti-viral to prevent an outbreak — begin 3–5 days prior to and after your appointment.',
      '## 24 hours before',
      'Avoid alcohol and excessive caffeine. Blood thinners (Ibuprofen, Advil, fish oil, etc.) should be avoided unless prescribed by a doctor.',
      '## One week before',
      'Begin to gently exfoliate your lips and keep them hydrated. Dry, flaky lips lead to poor healed results.',
      '## Botox / Filler',
      'Must be done 30 days prior to or after your appointment.',
      '## Waxing / Threading',
      'Please do so at least 2 weeks before your appointment.',
      '## Retin-A',
      'Refrain from any Retin-A products in the area for 2 weeks beforehand.',
      'Avoid exercise — increased blood flow causes excessive bleeding and poor healed results. Sweat dissolves pigment.',
    ],
    after: [
      '## Day 1 (day of the procedure)',
      'One hour after, wipe your lips with the included antiseptic wipe, followed by a cotton round dampened with lukewarm water, pat dry, then reapply the included balm. Repeat at bedtime.',
      'You may refrigerate the included lip mask ~10 minutes, then apply to ease tenderness and swelling.',
      'Apply the included balm whenever your lips feel dry.',
      '## Days 1–5 (or until flaking is finished)',
      'Do not get your lips wet for 7–10 days, aside from the day-1 cleaning. Let them heal!',
      'Keep your lips hydrated with the included balm at all times — never let them dry out.',
      'Do NOT pick or pull at any flaking or scabbing.',
      'Drink all liquids through a straw.',
      '## Please avoid for 10–14 days',
      'Water on the area (aside from cleaning), makeup, sweating/workouts, saunas, pools, jacuzzis and any body of water, tanning beds, direct sun, spicy/acidic food, smoking/vaping (can alter color) and kissing — plus exfoliating products or services of any kind.',
      'Be patient — color starts dark and bold, lightens significantly, then "blooms" back around the 3rd–4th week, healing 40–70% lighter. A touch-up may be scheduled 4–8 weeks after.',
      'If you experience an allergic reaction or signs of an infection, contact your doctor right away.',
    ],
  },
  {
    title: 'Eyeliner',
    prep: [
      'Take a month-long break from exfoliating anti-aging/acne products (retinoids, glycolics, Vitamin C, AHA/BHA, enzyme washes, serums).',
      'Stop all lash growth solutions such as Latisse at least 12 weeks before your session and 2 weeks after, ideally until after your touch-up.',
      'Lasers, peels, tinting, lash lifts, etc. should take place 2 weeks before or after your appointment.',
      'No lash extensions or fake lashes until your eyeliner is fully healed (10–14 days). Extensions must be removed a week before your appointment.',
      'No eye makeup on the day of your appointment — come as clean as possible.',
      'Contacts must be removed at the time of your appointment.',
      '## 24 hours before',
      'Avoid alcohol and caffeine. Blood thinners (Ibuprofen, Advil) should be avoided unless prescribed by a doctor.',
      '## Botox',
      'If you get Botox or Dysport, it must be done at least 14 days prior — receiving it within 14 days results in being sent home to reschedule.',
      'Avoid exercise/sweating before and after your appointment.',
    ],
    after: [
      'Some puffiness is normal right after and for the following couple of days.',
      'A week-long dry heal is recommended — do not put anything on your eyes for at least 10 days.',
      'Avoid soaking the area in water (shower/bath/swimming), saunas, long steamy showers, eye makeup, moisturizer and exercise/sweating. Repeat the same aftercare after your second session.',
      'You may gently clean your eyelids with a lightly dampened cotton round 1–2× a day. A balm is supplied if needed, but it is best to let it dry-heal.',
      'Do not touch your eyes or pick at any flaking during healing.',
    ],
  },
  {
    title: 'Freckles',
    prep: [
      '## 30 days before',
      'No filler or injections in or around the face. Do not tan or sunbathe — irritated or sunburnt skin cannot be worked on. Avoid any facial, laser or waxing treatments on the face.',
      '## 2 weeks before',
      'Discontinue any skincare that encourages exfoliation on the face (Retinol, AHA/BHA, etc.).',
      '## 48 hours before',
      'No blood thinners such as Aspirin, Ibuprofen, caffeine, coffee, tea, smoking, alcohol, soda, Niacin, Vitamin E, Advil or fish oil.',
      '## Day of',
      'Arrive with a fresh, clean face free of makeup — and again, no caffeine!',
      '## Menstrual cycle',
      'Please note you will be more sensitive during your cycle due to hormone fluctuations.',
    ],
    after: [
      '## Normal to dry skin',
      'Cleanse morning and night with a gentle, fragrance-free cleanser such as Cetaphil/Cerave. Keep freckles dry — no ointments or lotions. Very dry skin: Aquaphor may be applied once a day.',
      '## Oily skin',
      'Cleanse morning and night and keep freckles dry. For the first 48 hours, dab any excess lymph or glossiness with a clean tissue or sterile water wipe.',
      '## Avoid for 5–7 days',
      'No picking or scratching, no sunscreen/skincare/makeup, no sun exposure or tanning (this alters the pigment color), no steam baths/showers/saunas, and no working out or increased sweating.',
      '## What to expect',
      'Days 1–2: bold, dark and inflamed. Days 3–4: scabbing. Days 5–7: scabs/peeling fall off naturally — do not pick.',
      'Surface healing takes 5–7 days, but the skin fully heals over 6–8 weeks. Some freckles may ghost and return, some may not retain. Overall they heal 30–40% lighter than the initial result.',
    ],
  },
];

const AftercareList = ({ items }: { items: string[] }) => (
  <ul className="space-y-3">
    {items.map((item, i) =>
      item.startsWith('## ') ? (
        <li key={i} className="text-accent text-[10px] uppercase tracking-[0.3em] font-bold pt-4 first:pt-0 list-none -ml-1">
          {item.slice(3)}
        </li>
      ) : (
        <li key={i} className="text-ink/70 leading-relaxed text-sm md:text-base list-disc ml-5">
          {item}
        </li>
      )
    )}
  </ul>
);

const AftercarePage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => (
  <div className="pt-24 min-h-screen bg-paper pb-32">
    <div className="max-w-4xl mx-auto px-6 py-20">
      <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Before &amp; After Your Appointment</p>
      <h1 className="text-4xl md:text-6xl font-serif mb-4">Preparation &amp; Aftercare</h1>
      <p className="text-ink/60 leading-relaxed max-w-2xl mb-16">
        Proper prep and aftercare are essential to a beautiful, long-lasting result. Please read the instructions for your service carefully — following them closely protects your investment and helps your skin heal evenly.
      </p>

      <div className="space-y-10">
        {aftercareGuides.map((guide) => (
          <section key={guide.title} className="bg-white border border-ink/5 shadow-sm p-8 md:p-12 rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-serif mb-10">{guide.title}</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink/30 mb-6 border-b border-ink/5 pb-4">Preparation</h3>
                <AftercareList items={guide.prep} />
              </div>
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink/30 mb-6 border-b border-ink/5 pb-4">Aftercare</h3>
                <AftercareList items={guide.after} />
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 text-center bg-sage-light rounded-2xl py-14 px-6">
        <h2 className="text-3xl md:text-4xl font-serif mb-4">Questions Before You Book?</h2>
        <p className="text-ink/60 max-w-md mx-auto mb-8 leading-relaxed">
          If you are unsure whether you are an eligible candidate or have any questions about preparing for your appointment, reach out before booking.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="px-12 py-4 bg-accent text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink transition-colors"
        >
          Contact the Studio
        </button>
      </div>
    </div>
  </div>
);


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', service: '', city: '', preferredDate: '', message: '', consent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = 'Invalid email address';
    if (!formData.message.trim()) e.message = 'Please tell Ashley a bit about your goals';
    if (!formData.consent) e.consent = 'Please confirm your consent to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // 1. Save to database so it appears in admin dashboard
      await supabase.from('contacts').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        interested_services: formData.service || null,
        city: formData.city || null,
        preferred_date: formData.preferredDate || null,
        message: formData.message,
        status: 'new',
      });

      // 2. Send notification email to Ashley + auto-reply to client
      const res = await fetch('/.netlify/functions/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          service: formData.service || undefined,
          city: formData.city || undefined,
          preferredDate: formData.preferredDate || undefined,
          message: formData.message,
          consent: formData.consent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        setSubmitError('Unable to send your message. Please try again or email ashleymbrows@gmail.com directly.');
        setIsSubmitting(false);
        return;
      }
    } catch {
      setSubmitError('Something went wrong. Please email ashleymbrows@gmail.com directly.');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const field = (key: keyof typeof formData, label: string, type = 'text', placeholder = '', required = false) => (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">{label}{required && ' *'}</label>
      <input
        type={type}
        value={formData[key] as string}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full p-4 bg-paper/30 border ${
          errors[key] ? 'border-red-400' : 'border-ink/5'
        } focus:border-accent outline-none text-sm transition-colors`}
      />
      {errors[key] && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors[key]}</p>}
    </div>
  );

  if (submitted) {
    return (
      <div className="pt-24 min-h-screen bg-paper flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-paper" />
          </div>
          <h2 className="text-4xl font-serif mb-4">Inquiry Sent</h2>
          <p className="text-ink/60 mb-4 leading-relaxed">Thank you, {formData.name}. Your inquiry has been sent directly to Ashley.</p>
          <p className="text-ink/50 text-sm mb-12 leading-relaxed">Ashley personally reviews every message and will be in touch within 1–2 business days. Check your inbox for a confirmation email.</p>
          <button
            onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', service: '', city: '', preferredDate: '', message: '', consent: false }); }}
            className="px-12 py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-accent transition-colors"
          >
            Send Another Inquiry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-paper pb-20">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-20">
        {/* Left column, studio info */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1">
          <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-serif mb-8">Contact the Studio</h1>
          <p className="text-ink/70 leading-relaxed mb-12 max-w-md">
            Fill out the form and Ashley will respond personally within 1–2 business days. For immediate questions, email or DM on Instagram.
          </p>
          <div className="space-y-10">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4">Located Within</h4>
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-accent mt-1" />
                <p className="text-lg text-ink/80">
                  Stay Gold Beauty<br />
                  8105 Grand River Rd.<br />
                  Brighton, MI 48114
                </p>
              </div>
              <p className="text-sm text-ink/50 mt-4 ml-9">Also available in Miami by appointment.</p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4">Direct Contact</h4>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-accent" />
                <a href="mailto:ashleymbrows@gmail.com" className="text-lg text-ink/80 hover:text-accent transition-colors">ashleymbrows@gmail.com</a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4">Follow Our Work</h4>
              <div className="flex gap-6">
                <a href="https://www.instagram.com/ashleymbrows?igsh=YXQyM290NW1uMG9n" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ink/40 hover:text-accent transition-colors"><Instagram className="w-6 h-6" /></a>
                <a href="https://www.facebook.com/ashleymbrows" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-ink/40 hover:text-accent transition-colors"><Facebook className="w-6 h-6" /></a>
                <a href="mailto:ashleymbrows@gmail.com" aria-label="Email" className="text-ink/40 hover:text-accent transition-colors"><Mail className="w-6 h-6" /></a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right column, inquiry form */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="flex-1 bg-white p-8 md:p-12 shadow-sm">
          <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-2">Consultation Inquiry</p>
          <h2 className="text-2xl font-serif mb-8">Tell Ashley About Your Goals</h2>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {field('name', 'Full Name', 'text', 'Your full name', true)}
            {field('email', 'Email Address', 'email', 'email@example.com', true)}
            {field('phone', 'Phone Number', 'tel', '(555) 000-0000')}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Service of Interest</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full p-4 bg-paper/30 border border-ink/5 focus:border-accent outline-none text-sm transition-colors appearance-none"
              >
                <option value="">Select a service…</option>
                <option>Signature Brows ($650)</option>
                <option>Lip Blush ($650)</option>
                <option>Defining Liner ($400+)</option>
                <option>Tooth Gems ($60+)</option>
                <option>Not sure yet</option>
              </select>
            </div>

            {field('city', 'Preferred City / Location', 'text', 'Brighton, Miami, or other')}
            {field('preferredDate', 'Preferred Date or Timeframe', 'text', 'e.g. June, weekdays, flexible')}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Message / Notes *</label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell Ashley about your goals, skin concerns, or any questions…"
                className={`w-full p-4 bg-paper/30 border ${
                  errors.message ? 'border-red-400' : 'border-ink/5'
                } focus:border-accent outline-none text-sm transition-colors resize-none`}
              />
              {errors.message && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 accent-accent w-4 h-4 flex-shrink-0"
                />
                <span className="text-xs text-ink/60 leading-relaxed">
                  I consent to Ashley M. Brows collecting and using the information above to respond to my inquiry. I understand this does not create a confirmed appointment.
                </span>
              </label>
              {errors.consent && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.consent}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 mt-4 bg-accent text-paper text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink transition-colors shadow-xl disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {isSubmitting ? 'Sending…' : 'Send Inquiry to Ashley'}
            </button>

            {submitError && (
              <p className="text-center text-red-500 text-xs font-bold mt-2">{submitError}</p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// --- Page Content ---

// Slugify a variant title for URLs: "Ombre Lip Blush" -> "ombre-lip-blush"
const slugifyVariant = (title: string) =>
  title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const ServiceDetailPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { services } = useSite();
  const service = slug ? services.find(s => s.id === slug) ?? null : null;

  if (!service) {
    return (
      <div className="pt-24 min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Not Found</p>
          <h1 className="text-4xl font-serif mb-6">Service Not Found</h1>
          <p className="text-ink/60 mb-10 leading-relaxed">The service youÃ¢â‚¬â„¢re looking for doesnÃ¢â‚¬â„¢t exist or the link may be incorrect.</p>
          <button
            onClick={() => onNavigate('services')}
            className="px-10 py-4 bg-accent text-paper text-[10px] uppercase tracking-widest font-bold hover:bg-ink transition-colors"
          >
            View All Services
          </button>
        </div>
      </div>
    );
  }

  const hasVariants = Array.isArray((service as any).variants) && (service as any).variants.length > 0;
  const variants = hasVariants ? (service as any).variants : [];

  return (
    <div className="pt-24 min-h-screen bg-paper pb-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <button onClick={() => onNavigate('services')} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 mb-12">
          <ChevronLeft className="w-4 h-4" /> Back to services
        </button>

        {hasVariants ? (
          // When the service has variants, the page IS the variant grid — no duplicate hero image.
          <div className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-6">Service Detail</p>
              <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">{service.title}</h2>
              <p className="text-xl text-ink/70 leading-relaxed font-serif italic">{service.shortDescription}</p>
              <p className="text-ink/60 leading-relaxed mt-8">{service.description}</p>
            </motion.div>
            <p className="text-center text-[11px] text-ink/40 uppercase tracking-[0.3em] font-bold mb-10">
              Choose your option below — both are bookable
            </p>
            <div className={`grid gap-10 ${variants.length === 2 ? 'md:grid-cols-2' : variants.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {variants.map((v: any, vi: number) => {
                const variantSlug = slugifyVariant(v.title);
                return (
                  <motion.div
                    key={vi}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    transition={{ delay: vi * 0.1, duration: 0.6, ease: 'easeOut' }}
                    className="group bg-white border border-ink/5 rounded-3xl shadow-md hover:shadow-2xl transition-shadow overflow-hidden flex flex-col"
                  >
                    <button
                      onClick={() => { navigate(`/services/${service.id}/${variantSlug}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="block w-full aspect-[4/5] bg-warm-gray overflow-hidden relative focus-visible:outline-accent"
                      aria-label={`See details for ${v.title}`}
                    >
                      <img src={v.image} alt={v.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      <div className="absolute top-5 left-5 bg-ink/85 backdrop-blur text-paper px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold">
                        Option {vi + 1} of {variants.length}
                      </div>
                      <div className="absolute top-5 right-5 bg-paper/95 backdrop-blur px-5 py-3 rounded-2xl shadow-xl">
                        <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-0.5">Price</p>
                        <p className="text-xl font-serif text-accent leading-none">{v.price}</p>
                      </div>
                    </button>
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-3xl font-serif mb-3 leading-tight">{v.title}</h3>
                      <p className="text-sm text-ink/55 leading-relaxed mb-8 flex-1 line-clamp-5">{v.description}</p>
                      <button
                        onClick={() => openBookingFor(v.title)}
                        className="w-full py-5 bg-accent text-paper text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink transition-all shadow-lg rounded-full flex items-center justify-center gap-3"
                      >
                        Book {v.title} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-20 items-start mb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="aspect-[4/5] bg-warm-gray overflow-hidden shadow-2xl relative">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                <div className="absolute top-8 right-8 bg-paper/90 backdrop-blur px-6 py-4 shadow-xl">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">Starting at</p>
                  <p className="text-2xl font-serif text-accent">{service.price}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-6">Service Detail</p>
              <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">{service.title}</h2>
              <p className="text-xl text-ink/70 leading-relaxed mb-12 font-serif italic border-l-2 border-accent pl-8">
                {service.shortDescription}
              </p>
              <div className="prose prose-ink max-w-none mb-12 text-ink/60 leading-relaxed space-y-6">
                <p>{service.description}</p>
              </div>
              <div className="flex flex-wrap gap-3 mb-12">
                {service.tags.map((tag: string) => (
                  <span key={tag} className="px-6 py-2 bg-white border border-ink/5 text-[10px] uppercase tracking-widest font-bold">{tag}</span>
                ))}
              </div>
              <button
                onClick={() => openBookingFor(service.title)}
                className="w-full py-6 bg-accent text-paper text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink transition-all shadow-2xl flex items-center justify-center gap-4"
              >
                Book {service.title} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-20 items-start">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
           >
              <h3 className="text-3xl font-serif">The Process</h3>
              <div className="space-y-8">
                 {service.process.map((p: any, i: number) => (
                   <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 items-start"
                   >
                      <span className="text-4xl font-serif opacity-10">0{i + 1}</span>
                      <div>
                         <h4 className="text-lg font-serif mb-2">{p.step}</h4>
                         <p className="text-sm text-ink/50 leading-relaxed">{p.description}</p>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </motion.div>
           
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white p-12 shadow-sm border border-ink/5"
           >
              <h3 className="text-3xl font-serif mb-12">Testimonials</h3>
              {service.testimonials.length === 0 ? (
                <p className="text-ink/40 italic text-sm">Client testimonials for this service coming soon.</p>
              ) : (
              <div className="space-y-12">
                 {service.testimonials.map((t: any, i: number) => (
                   <motion.div 
                    key={i} 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="border-b border-ink/5 pb-12 last:border-0 last:pb-0"
                   >
                      <div className="flex gap-1 mb-6">
                         {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-accent text-accent" />)}
                      </div>
                      <p className="text-lg font-serif italic mb-6 leading-relaxed text-ink/80">"{t.text}"</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{t.author}</p>
                   </motion.div>
                 ))}
              </div>
              )}
           </motion.div>
        </div>
      </div>
    </div>
  );
};

// Dedicated page for a single service variant (e.g. /services/lips/ombre-lip-blush).
// Shows the full description, large photo, price, book button, and a link back
// to the parent service.
const VariantDetailPage = () => {
  const { slug, variantSlug } = useParams<{ slug: string; variantSlug: string }>();
  const navigate = useNavigate();
  const { services } = useSite();
  const service = slug ? services.find(s => s.id === slug) ?? null : null;
  const variant = service && Array.isArray((service as any).variants)
    ? (service as any).variants.find((v: any) => slugifyVariant(v.title) === variantSlug)
    : null;

  if (!service || !variant) {
    return (
      <div className="pt-24 min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Not Found</p>
          <h1 className="text-4xl font-serif mb-6">Option Not Found</h1>
          <p className="text-ink/60 mb-10 leading-relaxed">This option doesn't exist or the link may be incorrect.</p>
          <button
            onClick={() => navigate('/services')}
            className="px-10 py-4 bg-accent text-paper text-[10px] uppercase tracking-widest font-bold hover:bg-ink transition-colors"
          >
            View All Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-paper pb-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <button
          onClick={() => navigate(`/services/${service.id}`)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 mb-12"
        >
          <ChevronLeft className="w-4 h-4" /> Back to {service.title}
        </button>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="aspect-[4/5] bg-warm-gray overflow-hidden shadow-2xl relative">
              <img src={variant.image} alt={variant.title} className="w-full h-full object-cover" />
              <div className="absolute top-8 right-8 bg-paper/90 backdrop-blur px-6 py-4 shadow-xl">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">Price</p>
                <p className="text-2xl font-serif text-accent">{variant.price}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-6">{service.title}</p>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">{variant.title}</h1>
            <div className="prose prose-ink max-w-none mb-12 text-ink/70 leading-relaxed text-lg whitespace-pre-line">
              {variant.description}
            </div>
            <button
              onClick={() => openBookingFor(variant.title)}
              className="w-full py-6 bg-accent text-paper text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink transition-all shadow-2xl flex items-center justify-center gap-4"
            >
              Book {variant.title} <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] text-ink/30 uppercase tracking-widest mt-4">
              Opens Ashley's booking form in a new tab
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const TrustStack = () => (
  <section className="bg-paper-dark py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4">The Standard</p>
        <h2 className="text-4xl md:text-6xl font-serif">Trust &amp; Safety</h2>
      </div>
      <div className="grid md:grid-cols-4 gap-8">
        {[
          { icon: <Check className="w-6 h-6" />, title: "Master Certified", desc: "8x certified in advanced facial architecture and permanent makeup techniques." },
          { icon: <Shield className="w-6 h-6" />, title: "Clinical Safety", desc: "Strict adherence to OSHA standards, fully licensed, and Bloodborne Pathogen certified." },
          { icon: <Star className="w-6 h-6" />, title: "Premium Pigments", desc: "Using only the highest quality, vegan, cruelty-free, and color-stable pigments." },
          { icon: <Clock className="w-6 h-6" />, title: "The Process", desc: "Every appointment includes an in-depth consultation and custom pre-draw before any tattooing begins." }
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="p-8 border border-ink/10 bg-paper transition-colors hover:border-accent"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
              {item.icon}
            </div>
            <h3 className="text-xl font-serif mb-3">{item.title}</h3>
            <p className="text-sm text-ink/60 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HomePage = ({ onNavigate, onSelectService }: { onNavigate: (page: Page) => void, onSelectService: (service: any) => void }) => (
  <>
    <Hero onNavigate={onNavigate} />
    <About />
    <section className="bg-paper py-24 px-6 overflow-hidden">
       <div className="flex flex-col md:flex-row items-center gap-20 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="flex-1">
             <h2 className="text-4xl md:text-7xl font-serif italic mb-8">A Two-Step <br /> Process</h2>
             <p className="text-ink/60 max-w-md leading-relaxed mb-8">
                Permanent makeup heals in waves, redness softens, color blooms, the tattoo settles. Your initial session shapes the look; the perfection session at 6 to 12 weeks refines it. Only together do they become the final result.
             </p>
             <button onClick={() => onNavigate('artist')} className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-bold">
                Meet Ashley <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </motion.div>
          <div className="flex-1 relative">
             <motion.div 
               initial={{ scale: 1.1 }}
               whileInView={{ scale: 1 }}
               transition={{ duration: 1.5 }}
               className="aspect-[4/5] bg-ink rounded-2xl overflow-hidden"
             >
                <img src="/permanent-makeup-feature.jpg" alt="Ashley working on a client's brows" className="w-full h-full object-cover" />
             </motion.div>
          </div>
       </div>
    </section>
    <TrustStack />
    <Services onSelectService={onSelectService} onNavigate={onNavigate} excludeIds={['tooth-gems']} />
    <Testimonials />
    <FAQSection />
    <section className="py-40 bg-sage-light px-6 text-center overflow-hidden relative">
       <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
         <h2 className="text-5xl md:text-8xl font-serif mb-12">Begin Your <br /> Transformation</h2>
         <p className="max-w-xl mx-auto text-ink/70 mb-12">Booking is by request. Pick a service, send Ashley a few details about your goals, and she will follow up with deposit details, confirmation and pre-care instructions.</p>
         <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={openBooking} className="px-16 py-6 bg-accent text-paper text-xs uppercase tracking-widest font-bold shadow-2xl">
             Book Now
          </motion.button>
          <p className="mt-8 opacity-40 text-[10px] uppercase font-bold tracking-widest">Send Ashley a booking request</p>
       </motion.div>
    </section>
  </>
);


const serviceMenu = [
  { id: 'brows', title: 'Signature Brows', price: '$650', duration: '2.5 hrs', description: 'Soft powder-shaded brows. All skin types.' },
  { id: 'lips',  title: 'Lip Blush', price: '$650', duration: '2 hrs', description: 'Watercolor tint for fuller, defined lips.' },
  { id: 'liner', title: 'Defining Liner', price: '$400+', duration: '1.5 hrs', description: 'Lash enhancement to full shaded wing.' },
  { id: 'tooth-gems', title: 'Tooth Gems', price: '$60+', duration: '30 min', description: 'Crystal and gold tooth gems from $60 to full disco tooth.' },
];

// --- Booking Page ---
// /booking redirects to Ashley's Jotform booking form.

const BookingPage = () => {
  useEffect(() => {
    window.location.href = JOTFORM_BOOKING_URL;
  }, []);
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-6" />
        <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Booking</p>
        <h1 className="text-3xl font-serif mb-4">Opening Booking Form</h1>
        <p className="text-ink/60 text-sm mb-6">
          If you are not redirected automatically, <a href={JOTFORM_BOOKING_URL} className="underline text-accent">click here</a>.
        </p>
      </div>
    </div>
  );
};

const galleryCategories = ['All', 'Signature Brows', 'Lip Blush', 'Defining Liner'];

const defaultGalleryItems: GalleryItemCMS[] = [
  {
    image: '/gallery/brows-nano-portrait.jpg',
    title: 'Nano Fusion',
    category: 'Signature Brows',
    description: '3 Hour Procedure \u00b7 Hair Strokes + Powder Shading'
  },
  {
    image: '/gallery/lip-blush-before-healed.jpg',
    title: 'Lip Blush',
    category: 'Lip Blush',
    description: '2 Hour Procedure \u00b7 Soft Watercolor Tint'
  },
  {
    image: '/gallery/brows-before-after.jpg',
    title: 'Powder Brows',
    category: 'Signature Brows',
    description: '2.5 Hour Procedure \u00b7 Soft Shaded Finish'
  },
  {
    image: '/gallery/lash-enhancement-before-after.jpg',
    title: 'Shaded Eyeliner',
    category: 'Defining Liner',
    description: '2 Hour Procedure \u00b7 Softly Shaded Wing'
  },
  {
    image: '/gallery/lip-blush-glossy.jpg',
    title: 'Ombre Lip Blush',
    category: 'Lip Blush',
    description: '2.5 Hour Procedure \u00b7 Gradient Tint'
  },
  {
    image: '/gallery/powder-brows-portrait.jpg',
    title: 'Powder Brows',
    category: 'Signature Brows',
    description: '2.5 Hour Procedure \u00b7 All Skin Types'
  },
  {
    image: '/gallery/ashley-portfolio-may22.jpg',
    title: 'Nano Fusion',
    category: 'Signature Brows',
    description: '3 Hour Procedure \u00b7 Realistic Hair Strokes'
  }
];

const InstagramFeed = () => {
  const posts = [
    { id: 1, image: '/instagram/post-1.jpg', likes: '1.2k', comments: '42' },
    { id: 2, image: '/instagram/post-2.jpg', likes: '890', comments: '18' },
    { id: 3, image: '/instagram/post-3.jpg', likes: '2.5k', comments: '104' },
    { id: 4, image: '/instagram/post-4.jpg', likes: '1.1k', comments: '29' }
  ];

  return (
    <div className="py-32 bg-paper">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Social Connection</p>
            <h2 className="text-4xl md:text-5xl font-serif">Latest from @ashleymbrows</h2>
          </div>
          <a href="https://www.instagram.com/ashleymbrows?igsh=YXQyM290NW1uMG9n" target="_blank" rel="noopener noreferrer" className="px-8 py-4 border border-ink/10 text-[10px] uppercase tracking-widest font-bold hover:bg-accent hover:text-paper transition-all">
            Follow Studio
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <motion.a 
              key={post.id}
              href="https://www.instagram.com/ashleymbrows?igsh=YXQyM290NW1uMG9n"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -10 }}
              className="relative group cursor-pointer aspect-square overflow-hidden bg-warm-gray rounded-3xl shadow-md hover:shadow-xl transition-shadow focus-visible:outline-accent"
              aria-label={`View Instagram post with ${post.likes} likes`}
            >
              <img src={`${post.image}?auto=format&fit=crop&q=80&w=400`} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-8 text-paper">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-paper" aria-hidden="true" />
                  <span className="text-xs font-bold tracking-widest">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { galleryItems } = useSite();

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredItems = activeFilter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="pt-24 min-h-screen bg-white">
       <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
             <div>
                <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">The Portfolio</p>
                <h2 className="text-4xl md:text-6xl font-serif">Signature Results</h2>
             </div>
             <div className="flex flex-wrap gap-4 md:gap-8 border-b border-ink/5 pb-2" role="tablist" aria-label="Gallery categories">
                {galleryCategories.map(cat => (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={activeFilter === cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`text-[10px] uppercase tracking-[0.3em] font-bold pb-2 transition-all relative focus-visible:outline-accent ${activeFilter === cat ? 'text-accent' : 'text-ink/30 hover:text-ink'}`}
                  >
                    {cat}
                    {activeFilter === cat && (
                      <motion.div layoutId="activeFilter" className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
                    )}
                  </button>
                ))}
             </div>
          </div>
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          >
             <AnimatePresence mode="popLayout">
               {filteredItems.map((item, i) => (
                 <motion.div 
                   key={item.image}
                   layout
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   transition={{ duration: 0.4 }}
                   className="group cursor-pointer"
                   onClick={() => setSelectedItem(item)}
                 >
                    <div className="aspect-square bg-paper overflow-hidden mb-6 relative rounded-2xl shadow-md group-hover:shadow-xl transition-shadow flex items-center justify-center">
                       <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="max-w-full max-h-full object-contain transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                       />
                       <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-paper/90 backdrop-blur flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
                             <ArrowRight className="w-5 h-5 -rotate-45" />
                          </div>
                       </div>
                    </div>
                    <p className="text-accent text-[9px] uppercase tracking-widest font-bold mb-1">{item.category}</p>
                    <h3 className="text-xl font-serif">{item.title}</h3>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mt-1">{item.description}</p>
                 </motion.div>
               ))}
             </AnimatePresence>
          </motion.div>
       </div>

       <InstagramFeed />

       {/* Modal */}
       <AnimatePresence>
          {selectedItem && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="fixed inset-0 bg-ink/90 z-[60] backdrop-blur-sm cursor-zoom-out"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                role="dialog"
                aria-modal="true"
                aria-label="Gallery Image Detail"
                className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none"
              >
                <div className="bg-white max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row pointer-events-auto shadow-2xl relative rounded-3xl">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    aria-label="Close image viewer"
                    className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-paper/50 backdrop-blur flex items-center justify-center hover:bg-accent hover:text-paper transition-colors focus-visible:outline-accent"
                  >
                     <X className="w-5 h-5" />
                  </button>
                  <div className="flex-[3] bg-paper overflow-hidden flex items-center justify-center">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-[2] p-12 flex flex-col justify-center bg-paper">
                    <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4">{selectedItem.category}</p>
                    <h3 className="text-4xl font-serif mb-6">{selectedItem.title}</h3>
                    <p className="text-ink/60 leading-relaxed mb-8">{selectedItem.description}</p>
                    <div className="pt-8 border-t border-ink/5">
                       <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-2">Technical Insight</p>
                       <p className="text-sm italic">Achieved through layered nano-strokes to maintain structural depth and anatomical harmony.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
       </AnimatePresence>
    </div>
  );
};

const ArtistPage = () => (
  <div className="pt-24 min-h-screen bg-paper">
     <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
           <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Meet Your Artist</p>
           <h2 className="text-4xl md:text-6xl font-serif">The Hands Behind the Art</h2>
        </motion.div>
        <div className="space-y-40">
           {artists.map((artist, idx) => (
             <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-20 items-center`}>
                <motion.div initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }} className="flex-1 aspect-[4/5] bg-warm-gray w-full max-w-md overflow-hidden relative shadow-2xl rounded-3xl">
                   <img src={artist.image} alt={artist.name} className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" />
                   <motion.div initial={{ scaleY: 1 }} whileInView={{ scaleY: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: 'easeInOut' }} style={{ originY: 0 }} className="absolute inset-0 bg-paper pointer-events-none" />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }} className="flex-1">
                   <h3 className="text-4xl md:text-5xl font-serif mb-4 italic">{artist.name}</h3>
                   <p className="text-accent text-[10px] uppercase tracking-[0.4em] font-bold mb-8">{artist.role}</p>
                   <p className="text-ink/60 leading-relaxed text-lg mb-8">{artist.bio}. She approaches every face with the eye of a jeweler and the precision of a surgeon.</p>
                   <div className="flex gap-8 border-t border-ink/5 pt-8">
                      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                         <p className="text-xl font-serif">8yrs</p>
                         <p className="text-[10px] uppercase font-bold opacity-30">Experience</p>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.55 }}>
                         <p className="text-xl font-serif">Global</p>
                         <p className="text-[10px] uppercase font-bold opacity-30">Certification</p>
                      </motion.div>
                   </div>
                </motion.div>
             </div>
           ))}
        </div>
     </div>
  </div>
);

// Photo upload with proper object URL memory management
const PhotoUpload = ({ fieldKey, label, sub, formData, setFormData }: {
  fieldKey: string; label: string; sub: string; formData: any; setFormData: (d: any) => void; key?: string | number;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const file = formData[fieldKey];
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url); // cleanup on unmount / file change
  }, [formData[fieldKey]]);

  return (
    <label className="block cursor-pointer">
      <input type="file" accept="image/*" className="hidden"
        onChange={e => setFormData({ ...formData, [fieldKey]: e.target.files?.[0] ?? null })} />
      <div className={`aspect-[4/3] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
        preview ? 'border-accent bg-accent/5' : 'border-ink/15 hover:border-accent/40'
      }`}>
        {preview
          ? <img src={preview} alt="" className="w-full h-full object-cover" />
          : <>
              <Plus className="w-5 h-5 text-accent/50" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-ink/40">{label}</p>
              <p className="text-[9px] uppercase tracking-widest font-bold text-ink/25">{sub}</p>
            </>}
      </div>
    </label>
  );
};

// --- Main App ---

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectService = (service: any) => {
    navigate(`/services/${service.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: Page) => {
    const routes: Record<Page, string> = {
      home: '/', services: '/services', gallery: '/gallery', booking: '/booking',
      artist: '/artist', contact: '/contact', 'service-detail': '/services',
      privacy: '/privacy', policies: '/policies', aftercare: '/preparation-aftercare',
    };
    navigate(routes[page] || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentPage = (): Page => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/services') return 'services';
    if (path.startsWith('/services/')) return 'services';
    if (path === '/gallery') return 'gallery';
    if (path === '/booking') return 'booking';
    if (path === '/contact') return 'contact';
    if (path === '/artist') return 'artist';
    if (path === '/privacy') return 'privacy';
    if (path === '/policies') return 'policies';
    if (path === '/preparation-aftercare') return 'aftercare';
    return 'home';
  };
  const currentPage = getCurrentPage();

  // Dynamic SEO Ã¢â‚¬â€ updates title + meta per route
  useSEO();

  // LocalBusiness structured data (injected once)
  useEffect(() => {
    const id = 'ld-local-business';
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      name: 'Ashley M. Brows',
      description: 'Luxury cosmetic tattoo studio specializing in powder brows, lip blush, and defining liner in Brighton, Michigan.',
      url: 'https://ashleymbrows.netlify.app',
      image: 'https://ashleymbrows.netlify.app/ashley-portrait.jpg',
      telephone: '',
      email: 'ashleymbrows@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '8105 Grand River Rd.',
        addressLocality: 'Brighton',
        addressRegion: 'MI',
        postalCode: '48114',
        addressCountry: 'US',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 42.5262, longitude: -83.7799 },
      openingHours: ['Tu-Fr 09:00-17:00'],
      priceRange: '$400Ã¢â‚¬â€œ$650',
      sameAs: [
        'https://www.instagram.com/ashleymbrows',
        'https://www.facebook.com/ashleymbrows',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Cosmetic Tattoo Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Signature Brows' }, price: '650', priceCurrency: 'USD' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Lip Blush' }, price: '650', priceCurrency: 'USD' },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Defining Liner' }, price: '400', priceCurrency: 'USD' },
        ],
      },
    });
    document.head.appendChild(script);
  }, []);

  // Admin routes render outside the public layout (no Navbar/Footer)
  if (location.pathname === '/login') return <LoginPage />;
  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
    return (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    );
  }

  return (
    <div className="selection:bg-accent/20 min-h-screen bg-paper text-ink font-sans">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage onNavigate={handleNavigate} onSelectService={handleSelectService} />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/services" element={<Services onSelectService={handleSelectService} onNavigate={handleNavigate} asPage />} />
              <Route path="/artist" element={<ArtistPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/preparation-aftercare" element={<AftercarePage onNavigate={handleNavigate} />} />
              <Route path="/services/:slug" element={<ServiceDetailPage onNavigate={handleNavigate} />} />
              <Route path="/services/:slug/:variantSlug" element={<VariantDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNavigate} />
      
      {/* Sticky mobile Book Now Ã¢â‚¬â€ hidden on result pages */}
      {location.pathname !== '/booking' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-paper border-t border-ink/10 p-4 shadow-2xl">
          <button
            onClick={openBooking}
            className="w-full py-4 bg-accent text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink transition-colors flex items-center justify-center gap-3"
          >
            <Calendar className="w-4 h-4" /> Book Now
          </button>
        </div>
      )}

      {/* Scroll to Top Ã¢â‚¬â€ only visible after scrolling down */}
      {showScrollTop && (
        <button
          aria-label="Scroll to top"
          className="fixed bottom-10 right-10 z-40 w-12 h-12 bg-white shadow-2xl flex items-center justify-center cursor-pointer border border-ink/5 hover:bg-paper hover:border-accent transition-colors focus-visible:outline-accent"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronRight className="w-5 h-5 -rotate-90 opacity-40" />
        </button>
      )}
    </div>
  );
}



export default function App() {
  const content = useSiteContent({ services: defaultServices, galleryItems: defaultGalleryItems });
  return (
    <SiteContentContext.Provider value={content}>
      <AppShell />
    </SiteContentContext.Provider>
  );
}
