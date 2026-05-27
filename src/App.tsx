import { motion, AnimatePresence } from 'motion/react';
import { Menu, ArrowRight, Instagram, Facebook, Mail, Calendar, User, Star, X, ChevronRight, ChevronLeft, MapPin, Phone, Plus, Check, Clock, Shield, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useSEO } from './hooks/useSEO';

// --- Types ---
type Page = 'home' | 'services' | 'gallery' | 'booking' | 'artist' | 'contact' | 'service-detail' | 'privacy' | 'policies';


// --- Booking URL ---
// Update this constant when Ashley's Jotform URL changes.
// --- Booking ---
// On-site booking request form lives at /booking. It POSTs to the Netlify
// function /send-inquiry which sends Ashley a notification email via Resend
// and an auto-reply to the client.


const services = [
  {
    id: 'brows',
    title: 'Signature Brows',
    price: '$650',
    shortDescription: 'Soft, shaded brows for a polished makeup-style finish.',
    description: 'Our most popular brow service. Done with a single-needle tattoo machine that layers small pixels of pigment into the skin until the desired saturation is achieved. Can be bold and defined to your preference, or softly shaded with no harsh edges for a natural makeup look. Best suited for all skin types &mdash; especially oily and mature skin. Does not include touch-up.',
    image: '/gallery/brows-before-after.jpg',
    tags: ['Powder Finish', 'All Skin Types', 'Most Popular'],
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
    title: 'Ashley M. Lip Blush',
    price: '$650',
    shortDescription: 'A wash of color restored to your lips &mdash; fuller, defined, youthful.',
    description: 'Lip Blush (or "watercolor lips") is another form of cosmetic tattooing. Immediate results look bright, bold and lipstick-like but heal down to a tint/stain. A wash of restored color can make lips appear fuller, more defined and more youthful. Great for covering fordyce spots, scars, pale lips, defining borders, correcting asymmetries and neutralizing dark pigmentation &mdash; all while staying within your natural vermillion border. Lasts 2 to 4 years.',
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
    description: 'Lash Enhancement ($400) is a thin tattooed line just between your lashes, making them appear darker and fuller at the base &mdash; very subtle, perfect for anyone not committed to daily eyeliner. Shaded Lash Enhancement ($450) adds thickness for a simple eyeliner look. Shaded Eyeliner ($550) is a softly shaded winged liner using three blended tones for a seamless finish, customized to your eye shape. Bottom/lower-lid eyeliner is not offered at this time.',
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
    shortDescription: 'Crystal and gold tooth gems — from a single crystal to a full disco tooth.',
    description: 'Tooth gems are non-permanent decorative jewels applied to the surface of the tooth. Single crystals start at $60, with options for multi-crystal sets ($100 / $125), gold applications ($120 and up), and a full "disco tooth" ($250). Gems are sourced from Tegan’s Tooth Gems, Tooth Kandy and Isisngold — email ashleymbrows@gmail.com with a screenshot of your pick to book.',
    image: '/gallery/tooth-gems.jpg',
    tags: ['Crystals', 'Gold Gems', 'Non-Permanent'],
    process: [
      {
        step: 'Pick Your Gem',
        description: (
          <>
            Browse the vendor catalogues —{' '}
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
            {' '}— then email your selection.
          </>
        )
      },
      { step: 'Application', description: 'A quick, non-invasive application with dental-grade adhesive — no drilling, no damage.' },
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
    text: 'Ashley is the best around. I have had my brows and lips done by her now and I am obsessed with both! Her attention to detail and VERY meticulous eye and application makes for literal perfection. She made it so comfortable with all her knowledge of everything &mdash; answered every little question I had and put my nerves at ease.',
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
    answer: "Initial redness and inflammation subside quickly. Your tattoo may appear bold or darker than anticipated &mdash; this is completely normal. Most healing occurs in 7 to 10 days, with total healing around 4 weeks. Lips heal faster, in roughly 5 to 7 days, but take a few weeks for the color to bloom back through."
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

  const navLinks: Page[] = ['home', 'services', 'gallery', 'artist', 'contact'];

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
              {p}
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
                  {p}
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
  <section className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-40 pb-6">
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
      Permanent makeup in Brighton, Michigan. Brows, lip blush, lashes, eyeliner and decorative work — meticulous, customized, and made to look like you.
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
        onClick={() => onNavigate('booking')}
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
         className="relative aspect-[3/4] bg-warm-gray overflow-hidden shadow-2xl"
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
             Cosmetic tattoos are always a two-step process. Your follow-up perfection session at 6 to 12 weeks reinforces any imperfections from the healing process &mdash; only after that touch-up is your treatment complete.
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

const Services = ({ onSelectService, onNavigate }: { onSelectService: (service: any) => void, onNavigate: (page: any) => void }) => (
  <section className="py-24 bg-paper-dark px-6">
    <div className="max-w-7xl mx-auto">
      <div className="mb-20 text-center">
        <h2 className="text-4xl md:text-6xl font-serif mb-4">Curated Aesthetics</h2>
        <p className="text-ink/50 uppercase tracking-[0.3em] font-bold text-[10px]">Every procedure is a bespoke masterpiece</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service, idx) => (
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
            <div className="aspect-square bg-paper overflow-hidden mb-8 relative">
               <img src={service.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur px-6 py-4 flex justify-between items-center group-hover:bg-accent group-hover:text-paper transition-colors">
                     <span className="text-[10px] uppercase tracking-widest font-bold">View Details</span>
                     <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                  </div>
               </div>
            </div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-serif">{service.title}</h3>
              <span className="text-sm font-medium text-accent">{service.price}</span>
            </div>
            <p className="text-sm text-ink/60 leading-relaxed mb-6 line-clamp-2">
              {service.shortDescription}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {service.tags.map(tag => (
                <span key={tag} className="text-[9px] uppercase tracking-widest px-3 py-1 bg-paper font-bold text-ink/40">{tag}</span>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('booking'); }}
              className="w-full py-4 border border-ink/15 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent hover:text-paper hover:border-accent transition-all duration-300"
            >
              Book Now
            </button>
          </motion.button>
        ))}
      </div>
    </div>
  </section>
);

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
            site &mdash; for example, your IP address, device and browser type, and the pages
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
            trusted service providers who help us operate the studio and this site &mdash; for
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
            Email us at <a href="mailto:ashleymbrows@gmail.com" className="text-accent hover:underline">ashleymbrows@gmail.com</a> &mdash; Ashley Brows, Brighton, Michigan.
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
          <li>Under Body Art Licensure, <strong className="text-ink">no person</strong> under the age of 18 is allowed servicing &mdash; even with parental consent.</li>
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
          <li>If you have previous work by another artist you <strong className="text-ink">must</strong> email clear photos of your brows (right, left, and both) in good lighting in order to be approved for booking &mdash; <a href="mailto:ashleymbrows@gmail.com" className="text-accent hover:underline">ashleymbrows@gmail.com</a>.</li>
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
          <p className="text-ink/50 text-sm mb-12 leading-relaxed">Ashley personally reviews every message and will be in touch within 1â€“2 business days. Check your inbox for a confirmation email.</p>
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
        {/* Left column â€” studio info */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1">
          <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-serif mb-8">Contact the Studio</h1>
          <p className="text-ink/70 leading-relaxed mb-12 max-w-md">
            Fill out the form and Ashley will respond personally within 1â€“2 business days. For immediate questions, email or DM on Instagram.
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

        {/* Right column â€” inquiry form */}
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
                <option value="">Select a serviceâ€¦</option>
                <option>Signature Brows ($650)</option>
                <option>Ashley M. Lip Blush ($650)</option>
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
                placeholder="Tell Ashley about your goals, skin concerns, or any questionsâ€¦"
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
              {isSubmitting ? 'Sendingâ€¦' : 'Send Inquiry to Ashley'}
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

// Look up a service by its URL slug (id)
const getServiceBySlug = (slug: string) => services.find(s => s.id === slug) ?? null;

const ServiceDetailPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : null;

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

  return (
    <div className="pt-24 min-h-screen bg-paper pb-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <button onClick={() => onNavigate('services')} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 mb-12">
          <ChevronLeft className="w-4 h-4" /> Back to services
        </button>
        
        <div className="grid lg:grid-cols-2 gap-20 items-start mb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
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
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
                onClick={() => onNavigate('booking')}
                className="w-full py-6 bg-accent text-paper text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink transition-all shadow-2xl flex items-center justify-center gap-4"
             >
                Book This Service <ArrowRight className="w-4 h-4" />
             </button>
          </motion.div>
        </div>

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
                Permanent makeup heals in waves &mdash; redness softens, color blooms, the tattoo settles. Your initial session shapes the look; the perfection session at 6 to 12 weeks refines it. Only together do they become the final result.
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
               className="aspect-[4/5] bg-ink"
             >
                <img src="/ashley-home-feature.jpg" alt="Ashley Brows signature work" className="w-full h-full object-cover" />
             </motion.div>
          </div>
       </div>
    </section>
    <TrustStack />
    <Services onSelectService={onSelectService} onNavigate={onNavigate} />
    <Testimonials />
    <FAQSection />
    <section className="py-40 bg-sage-light px-6 text-center overflow-hidden relative">
       <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
         <h2 className="text-5xl md:text-8xl font-serif mb-12">Begin Your <br /> Transformation</h2>
         <p className="max-w-xl mx-auto text-ink/70 mb-12">Booking is by request. Pick a service, send Ashley a few details about your goals, and she will follow up with deposit details, confirmation and pre-care instructions.</p>
         <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate('booking')} className="px-16 py-6 bg-accent text-paper text-xs uppercase tracking-widest font-bold shadow-2xl">
             Book Now
          </motion.button>
          <p className="mt-8 opacity-40 text-[10px] uppercase font-bold tracking-widest">Send Ashley a booking request</p>
       </motion.div>
    </section>
  </>
);


const serviceMenu = [
  { id: 'brows', title: 'Signature Brows', price: '$650', duration: '2.5 hrs', description: 'Soft powder-shaded brows. All skin types.' },
  { id: 'lips',  title: 'Ashley M. Lip Blush', price: '$650', duration: '2 hrs', description: 'Watercolor tint for fuller, defined lips.' },
  { id: 'liner', title: 'Defining Liner', price: '$400+', duration: '1.5 hrs', description: 'Lash enhancement to full shaded wing.' },
  { id: 'tooth-gems', title: 'Tooth Gems', price: '$60+', duration: '30 min', description: 'Crystal and gold tooth gems from $60 to full disco tooth.' },
];

// --- Booking Page ---
// On-site booking request form. POSTs to /.netlify/functions/send-inquiry
// which emails Ashley via Resend and sends an auto-reply to the client.

const BookingPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    service: '', preferredDate: '', preferredTime: '',
    previousPmu: '', skinType: '',
    message: '', consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.phone || !form.service ||
        !form.preferredDate || !form.preferredTime) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.consent) {
      setError('Please confirm the deposit and policies acknowledgement.');
      return;
    }

    const composedMessage = [
      `Preferred time: ${form.preferredTime}`,
      form.previousPmu ? `Previous permanent makeup: ${form.previousPmu}` : '',
      form.skinType ? `Skin type: ${form.skinType}` : '',
      '',
      form.message || '(No additional notes)',
    ].filter(Boolean).join('\n');

    setSubmitting(true);
    try {
      const res = await fetch('/.netlify/functions/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          preferredDate: form.preferredDate,
          message: composedMessage,
          consent: form.consent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setSubmitting(false);
      if (!res.ok || data?.error) {
        setError('Unable to send your request. Please try again or email ashleymbrows@gmail.com directly.');
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitting(false);
      setError('Something went wrong. Please email ashleymbrows@gmail.com directly.');
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-paper px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-accent" />
          </div>
          <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4">Request Received</p>
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Thank you, {form.name.split(' ')[0]}</h1>
          <p className="text-ink/60 leading-relaxed mb-8">
            Your request for <strong>{form.service}</strong> on <strong>{form.preferredDate}</strong> at <strong>{form.preferredTime}</strong> has been sent.
            Ashley will review and follow up within 1–2 business days with deposit details and confirmation.
          </p>
          <p className="text-ink/40 text-sm">
            A confirmation has been sent to <strong>{form.email}</strong>. If you don't see it, check your spam folder or email <a href="mailto:ashleymbrows@gmail.com" className="underline text-accent">ashleymbrows@gmail.com</a>.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold mb-4 text-center">Booking Request</p>
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-4">Book Your Appointment</h1>
          <p className="text-center text-ink/60 max-w-xl mx-auto mb-12 leading-relaxed">
            Bookings are by request. Submit your details below and Ashley will follow up within 1–2 business days with deposit details and appointment confirmation.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-4">
              Select a Service *
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {serviceMenu.map(svc => (
                <button
                  type="button"
                  key={svc.id}
                  onClick={() => setForm({ ...form, service: svc.title })}
                  className={`text-left p-5 border transition-all rounded ${
                    form.service === svc.title
                      ? 'border-accent bg-accent/5'
                      : 'border-ink/10 hover:border-ink/30 bg-white'
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-serif text-lg">{svc.title}</span>
                    <span className="text-accent text-sm font-bold">{svc.price}</span>
                  </div>
                  <p className="text-xs text-ink/50">{svc.duration} · {svc.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">Preferred Date *</label>
              <input
                type="date"
                value={form.preferredDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, preferredDate: e.target.value })}
                required
                className="w-full p-3.5 bg-white border border-ink/10 text-sm text-ink outline-none focus:border-accent transition-colors rounded"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">Preferred Time *</label>
              <input
                type="time"
                value={form.preferredTime}
                onChange={e => setForm({ ...form, preferredTime: e.target.value })}
                required
                className="w-full p-3.5 bg-white border border-ink/10 text-sm text-ink outline-none focus:border-accent transition-colors rounded"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="First and last name"
                className="w-full p-3.5 bg-white border border-ink/10 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent transition-colors rounded"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@example.com"
                className="w-full p-3.5 bg-white border border-ink/10 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent transition-colors rounded"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">Phone *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="(555) 555-5555"
                className="w-full p-3.5 bg-white border border-ink/10 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent transition-colors rounded"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">Previous Permanent Makeup?</label>
              <select
                value={form.previousPmu}
                onChange={e => setForm({ ...form, previousPmu: e.target.value })}
                className="w-full p-3.5 bg-white border border-ink/10 text-sm text-ink outline-none focus:border-accent transition-colors rounded"
              >
                <option value="">Select…</option>
                <option value="No">No</option>
                <option value="Yes, faded">Yes — faded</option>
                <option value="Yes, still visible">Yes — still visible</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">Skin Type</label>
              <select
                value={form.skinType}
                onChange={e => setForm({ ...form, skinType: e.target.value })}
                className="w-full p-3.5 bg-white border border-ink/10 text-sm text-ink outline-none focus:border-accent transition-colors rounded"
              >
                <option value="">Select…</option>
                <option value="Dry">Dry</option>
                <option value="Normal">Normal</option>
                <option value="Combination">Combination</option>
                <option value="Oily">Oily</option>
                <option value="Mature">Mature</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">Notes for Ashley</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={4}
                placeholder="Anything she should know — goals, allergies, concerns…"
                className="w-full p-3.5 bg-white border border-ink/10 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent transition-colors rounded resize-none"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-4 border border-ink/10 rounded bg-white">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={e => setForm({ ...form, consent: e.target.checked })}
              className="mt-1 w-4 h-4 accent-accent"
            />
            <span className="text-sm text-ink/70 leading-relaxed">
              I understand a non-refundable <strong>$100 deposit</strong> is required to secure my appointment, and I agree to the <a href="/policies" className="text-accent border-b border-accent/40 hover:border-accent">booking and cancellation policies</a>.
            </span>
          </label>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-accent text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
          >
            {submitting
              ? <><div className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" /> Sending Request…</>
              : <>Send Booking Request <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

const galleryCategories = ['All', 'Signature Brows', 'Lip Blush', 'Defining Liner'];

const galleryItems = [
  {
    image: '/gallery/brows-nano-portrait.jpg',
    title: 'Signature Stroke Restoration',
    category: 'Signature Brows',
    description: '2.5 Hour Procedure \u00b7 Signature Stroke'
  },
  {
    image: '/gallery/lip-blush-before-healed.jpg',
    title: 'Nude Velvet Blush',
    category: 'Lip Blush',
    description: '2 Hour Procedure \u00b7 Sheer Application'
  },
  {
    image: '/gallery/brows-before-after.jpg',
    title: 'Architectural Lamination',
    category: 'Signature Brows',
    description: '1.5 Hour Procedure \u00b7 Hybrid Technique'
  },
  {
    image: '/gallery/lash-enhancement-before-after.jpg',
    title: 'Ethereal Wing',
    category: 'Defining Liner',
    description: '2 Hour Procedure \u00b7 Soft Shading'
  },
  {
    image: '/gallery/lip-blush-glossy.jpg',
    title: 'Full Satin Lips',
    category: 'Lip Blush',
    description: '2.5 Hour Procedure \u00b7 Saturated Tint'
  },
  {
    image: '/gallery/powder-brows-portrait.jpg',
    title: 'Feathered Arch',
    category: 'Signature Brows',
    description: '3 Hour Procedure \u00b7 Nano Strokes'
  },
  {
    image: '/gallery/ashley-portfolio-may22.jpg',
    title: 'Signature Definition',
    category: 'Signature Brows',
    description: '2.5 Hour Procedure \u00b7 Custom Shaping'
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
              className="relative group cursor-pointer aspect-square overflow-hidden bg-warm-gray focus-visible:outline-accent"
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
                    <div className="aspect-[3/4] bg-warm-gray overflow-hidden mb-6 relative">
                       <img 
                        src={`${item.image}?auto=format&fit=crop&q=80&w=800`} 
                        alt={item.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" 
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
                <div className="bg-white max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row pointer-events-auto shadow-2xl relative">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    aria-label="Close image viewer"
                    className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-paper/50 backdrop-blur flex items-center justify-center hover:bg-accent hover:text-paper transition-colors focus-visible:outline-accent"
                  >
                     <X className="w-5 h-5" />
                  </button>
                  <div className="flex-[3] bg-warm-gray overflow-hidden">
                    <img 
                      src={`${selectedItem.image}?auto=format&fit=crop&q=100&w=1200`} 
                      alt={selectedItem.title} 
                      className="w-full h-full object-cover"
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
                <motion.div initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }} className="flex-1 aspect-[4/5] bg-warm-gray w-full max-w-md overflow-hidden relative shadow-2xl">
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

export default function App() {
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
      privacy: '/privacy', policies: '/policies',
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

  if (location.pathname === '/login' ||
      location.pathname === '/admin' ||
      location.pathname.startsWith('/admin/') ||
      location.pathname === '/staff-join') {
    return <Navigate to="/" replace />;
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
              <Route path="/services" element={<Services onSelectService={handleSelectService} onNavigate={handleNavigate} />} />
              <Route path="/artist" element={<ArtistPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage onNavigate={handleNavigate} />} />
              {/* Catch-all â€” redirect any unmatched URL to home */}
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
            onClick={() => handleNavigate('booking')}
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


