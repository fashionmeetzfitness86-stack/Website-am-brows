/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Menu, ArrowRight, Instagram, Facebook, Mail, Calendar, User, Star, X, ChevronRight, ChevronLeft, MapPin, Phone, Plus } from 'lucide-react';
import { useState } from 'react';

// --- Types ---
type Page = 'home' | 'services' | 'gallery' | 'booking' | 'artist' | 'contact' | 'service-detail' | 'privacy' | 'policies';

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

const Navbar = ({ onNavigate, currentPage }: { onNavigate: (page: Page) => void, currentPage: Page }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-paper/80 backdrop-blur-md border-b border-ink/5" aria-label="Main Navigation">
    <div className="flex items-center gap-4">
      <button 
        className="md:hidden p-2 focus-visible:outline-accent" 
        aria-label="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onNavigate('home')}
        className="text-xl font-display uppercase tracking-[0.2em] cursor-pointer focus-visible:outline-accent"
        aria-label="Ashley M. Brows Home"
      >
        Ashley M. Brows
      </button>
    </div>
    <div className="hidden md:flex items-center gap-10">
      {(['home', 'services', 'gallery', 'artist', 'contact'] as Page[]).map((p) => (
        <button 
          key={p}
          onClick={() => onNavigate(p)}
          aria-current={currentPage === p ? 'page' : undefined}
          className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-colors focus-visible:outline-accent px-2 py-1 ${currentPage === p ? 'text-accent' : 'text-ink/40 hover:text-ink'}`}
        >
          {p}
        </button>
      ))}
    </div>
    <button 
      onClick={() => onNavigate('booking')}
      className="flex items-center gap-2 cursor-pointer group focus-visible:outline-accent"
      aria-label="Book a consultation"
    >
      <Calendar className="w-4 h-4 text-accent" />
      <span className="text-[10px] uppercase tracking-widest font-bold group-hover:text-accent transition-colors">Book</span>
    </button>
  </nav>
);

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
  <section className="py-24 bg-white px-6">
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
          className="flex flex-col p-8 bg-white border border-ink/5 hover:shadow-xl transition-shadow duration-500"
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
  <footer className="bg-ink text-paper py-20 px-6">
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
             <button className="focus-visible:outline-accent uppercase text-[10px] font-bold">Our Standards</button>
           </li>
           <li className="hover:text-accent transition-colors">
             <button className="focus-visible:outline-accent uppercase text-[10px] font-bold">Aftercare</button>
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
           <li className="cursor-pointer hover:text-accent transition-colors">Terms</li>
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
          <li><strong className="text-ink">Deposits:</strong> a minimum of $100 deposit is required to book and is <strong className="text-ink">non-refundable</strong> under any circumstance. Your deposit goes towards the overall cost. This ensures you are serious about your appointment.</li>
          <li>A minimum of <strong className="text-ink">48 hours</strong> is required to reschedule your appointment without penalty. Less than 48 hours will result in forfeiture of your deposit and a new deposit will be required to reschedule.</li>
          <li><strong className="text-ink">One reschedule</strong> is allowed within the minimum time frame before a new deposit will be required.</li>
          <li><strong className="text-ink">Any and all cancellations without notice</strong> will result in a charge of the full cost of the service to the card on file. A new deposit will be required to reschedule.</li>
          <li>Being more than <strong className="text-ink">15 minutes late</strong> to your appointment can result in forfeiture of your deposit and/or cancellation of your appointment.</li>
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
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="pt-24 min-h-screen bg-paper flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Mail className="w-10 h-10 text-paper" />
          </div>
          <h2 className="text-4xl font-serif mb-4">Message Sent</h2>
          <p className="text-ink/60 mb-12">Thank you for reaching out. A studio representative will contact you within 24-48 business hours to discuss your inquiry further.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-12 py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            Return to Studio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-paper pb-20">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-20">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1">
          <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Get In Touch</p>
          <h2 className="text-4xl md:text-7xl font-serif mb-12">Contact the Studio</h2>
          <p className="text-ink/70 leading-relaxed mb-12 max-w-md">
            Need additional help? Reach out! Fill out the form and we will be in touch.
          </p>
          <div className="space-y-12">
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
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-accent" />
                  <a href="mailto:ashleymbrows@gmail.com" className="text-lg text-ink/80 hover:text-accent transition-colors">ashleymbrows@gmail.com</a>
                </div>
              </div>
            </div>
            <div>
               <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4">Follow Our Work</h4>
               <div className="flex gap-6">
                <a href="https://www.instagram.com/ashleymbrows?igsh=YXQyM290NW1uMG9n" target="_blank" rel="noopener noreferrer" aria-label="Instagram Profile" className="text-ink/40 hover:text-accent transition-colors focus-visible:outline-accent">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/ashleymbrows" target="_blank" rel="noopener noreferrer" aria-label="Facebook Page" className="text-ink/40 hover:text-accent transition-colors focus-visible:outline-accent">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="mailto:ashleymbrows@gmail.com" aria-label="Email studio" className="text-ink/40 hover:text-accent transition-colors focus-visible:outline-accent">
                  <Mail className="w-6 h-6" />
                </a>
               </div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="flex-1 bg-white p-8 md:p-12 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Your Name *</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full p-4 bg-paper/30 border ${errors.name ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors`}
                placeholder="Enter your name"
              />
              {errors.name && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Email Address *</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full p-4 bg-paper/30 border ${errors.email ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Subject *</label>
              <input 
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className={`w-full p-4 bg-paper/30 border ${errors.subject ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors`}
                placeholder="Service inquiry, media, etc."
              />
              {errors.subject && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.subject}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Message *</label>
              <textarea 
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className={`w-full p-4 bg-paper/30 border ${errors.message ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors resize-none`}
                placeholder="How can we assist you today?"
              />
              {errors.message && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.message}</p>}
            </div>
            <button 
              type="submit"
              className="w-full py-6 mt-8 bg-accent text-paper text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink transition-colors shadow-xl"
            >
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// --- Page Content ---

const ServiceDetailPage = ({ service, onNavigate }: { service: any, onNavigate: (page: Page) => void }) => {
  if (!service) return null;

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
           </motion.div>
        </div>
      </div>
    </div>
  );
};

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
                <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=1200" alt="Detail" className="w-full h-full object-cover opacity-80" />
             </motion.div>
          </div>
       </div>
    </section>
    <Services onSelectService={onSelectService} onNavigate={onNavigate} />
    <Testimonials />
    <FAQSection />
    <section className="py-40 bg-accent-light px-6 text-center overflow-hidden relative">
       <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
         <h2 className="text-5xl md:text-8xl font-serif mb-12">Begin Your <br /> Transformation</h2>
         <p className="max-w-xl mx-auto text-ink/70 mb-12">Booking is by request. Pick a service, send Ashley a few details about your goals, and she will follow up to confirm your appointment and walk you through pre-care.</p>
         <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate('booking')} className="px-16 py-6 bg-accent text-paper text-xs uppercase tracking-widest font-bold shadow-2xl">
            Secure A Consultation
         </motion.button>
         <p className="mt-8 opacity-40 text-[10px] uppercase font-bold tracking-widest">Current Waitlist: 6 Weeks</p>
       </motion.div>
    </section>
  </>
);

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: '',
    birthDate: '',
    email: '',
    phone: '',
    referralSource: '',
    policyAcknowledged: false,
    healthConditions: [] as string[],
    previousPMU: '',
    skinType: '',
    interestedServices: [] as string[],
    serviceType: '',
    notes: '',
    currentAreaPhoto: null as File | null,
    referencePhoto: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

  };

  const handleNext = () => {
    if (validate()) {
      setStep(4);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-paper pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-20 flex justify-center items-center gap-4">
           {[1, 2, 3, 4].map(s => (
             <div key={s} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${step === s ? 'bg-accent text-paper' : step > s ? 'bg-accent/20 text-accent' : 'bg-warm-gray text-ink/20'}`}>
                   {s}
                </div>
                {s < 4 && <div className="w-12 md:w-20 h-px bg-warm-gray" />}
             </div>
           ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <h2 className="text-4xl font-serif mb-12 text-center">Select Your Artist</h2>
             <div className="grid md:grid-cols-2 gap-6 text-center">
                {artists.map(a => (
                  <button 
                    key={a.name}
                    onClick={() => { setSelectedArtist(a.name); setStep(2); }}
                    className={`block p-8 border bg-white transition-colors cursor-pointer group focus-visible:outline-accent ${selectedArtist === a.name ? 'border-accent shadow-lg' : 'border-ink/5 hover:border-accent'}`}
                    aria-label={`Select artist ${a.name}`}
                  >
                     <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                        <img src={a.image} className={`w-full h-full object-cover transition-all group-hover:grayscale-0 ${selectedArtist === a.name ? 'grayscale-0' : 'grayscale'}`} alt="" />
                     </div>
                     <h3 className="text-xl font-serif mb-2">{a.name}</h3>
                     <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-4">{a.role}</p>
                     <p className="text-xs text-ink/50 leading-relaxed">{a.bio}</p>
                  </button>
                ))}
             </div>
          </motion.div>
        )}

        {step === 2 && (
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 mb-8">
                 <ChevronLeft className="w-4 h-4" /> Back to artists
              </button>
              <h2 className="text-4xl font-serif mb-12 text-center">Available Dates</h2>
              <div className="bg-white p-8 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-serif">October 2024</h3>
                    <div className="flex gap-4">
                       <button aria-label="Previous month" className="p-2 focus-visible:outline-accent">
                        <ChevronLeft className="w-5 h-5 cursor-pointer opacity-30 hover:opacity-100" />
                       </button>
                       <button aria-label="Next month" className="p-2 focus-visible:outline-accent">
                        <ChevronRight className="w-5 h-5 cursor-pointer opacity-30 hover:opacity-100" />
                       </button>
                    </div>
                 </div>
                 <div className="grid grid-cols-7 gap-2 text-center mb-8">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                       <div key={d} className="text-[10px] font-bold opacity-30 mb-2">{d}</div>
                    ))}
                    {[...Array(30)].map((_, i) => {
                       const d = i + 1;
                       const availableDates = [10, 11, 14, 18, 22];
                       const limitedDates = [11, 18];
                       const isAvail = availableDates.includes(d);
                       const isLimited = limitedDates.includes(d);
                       
                       return (
                         <button 
                           key={i} 
                           onClick={() => isAvail && setSelectedDate(d)}
                           disabled={!isAvail}
                           aria-label={`${isAvail ? 'Available' : 'Unavailable'} - October ${d}${isLimited ? ', Limited slots' : ''}`}
                           className={`h-14 relative flex flex-col items-center justify-center text-sm transition-all focus-visible:outline-accent border border-transparent
                             ${selectedDate === d 
                               ? 'bg-accent text-paper font-bold shadow-lg scale-105 z-10' 
                               : isAvail 
                                 ? 'bg-accent/5 text-accent font-medium hover:bg-accent/15 hover:border-accent/20 cursor-pointer' 
                                 : 'opacity-20 pointer-events-none'
                             }`}
                         >
                            <span className="relative z-10">{d}</span>
                            {isAvail && !selectedDate === d && (
                               <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                                  <div className={`w-1 h-1 rounded-full ${isLimited ? 'bg-orange-400' : 'bg-accent/40'}`} />
                               </div>
                            )}
                            {isLimited && (
                               <div className="absolute top-1 right-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                               </div>
                            )}
                         </button>
                       );
                    })}
                 </div>
                 <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-ink/5">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-accent" />
                       <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Available</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-orange-400" />
                       <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Limited Slots</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-ink/10" />
                       <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Fully Booked</span>
                    </div>
                 </div>
                 {selectedDate && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                       <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Times for Oct {selectedDate}</p>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['09:00 AM', '11:30 AM', '01:45 PM', '04:00 PM'].map(t => (
                            <button 
                              key={t} 
                              onClick={() => { setSelectedTime(t); setStep(3); }} 
                              className={`py-4 border text-center text-xs font-bold cursor-pointer transition-colors focus-visible:outline-accent ${selectedTime === t ? 'border-accent bg-accent/5 text-accent' : 'border-ink/5 bg-paper/50 hover:border-accent'}`}
                              aria-label={`Select time ${t}`}
                            >
                               {t}
                            </button>
                          ))}
                       </div>
                    </motion.div>
                 )}
              </div>
           </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <button onClick={() => setStep(2)} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 mb-8">
                <ChevronLeft className="w-4 h-4" /> Change Time
             </button>
             <p className="text-accent text-[10px] uppercase tracking-[0.5em] font-bold text-center mb-2">Phase 03</p>
             <h2 className="text-4xl font-serif mb-10 text-center">Client Consultation Form</h2>
             <div className="bg-white p-8 md:p-12 shadow-sm">

               {/* Section I — Identity & Reach */}
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center text-[10px] font-bold text-ink/40">I</div>
                 <h3 className="text-xl font-serif italic">Identity &amp; Reach</h3>
               </div>
               <div className="space-y-6 mb-10">
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Full Name *</label>
                     <input
                       type="text"
                       value={formData.fullName}
                       onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                       className={`w-full p-4 bg-paper/30 border ${errors.fullName ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors`}
                       placeholder="First &amp; Last Name"
                     />
                     {errors.fullName && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.fullName}</p>}
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Birth Date *</label>
                     <input
                       type="date"
                       value={formData.birthDate ?? ''}
                       onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                       className="w-full p-4 bg-paper/30 border border-ink/5 focus:border-accent outline-none text-sm transition-colors"
                     />
                   </div>
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Phone Number *</label>
                     <input
                       type="tel"
                       value={formData.phone}
                       onChange={(e) => setFormData({...formData, phone: e.target.value})}
                       className={`w-full p-4 bg-paper/30 border ${errors.phone ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors`}
                       placeholder="(555) 000-0000"
                     />
                     {errors.phone && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.phone}</p>}
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Email Address *</label>
                     <input
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className={`w-full p-4 bg-paper/30 border ${errors.email ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors`}
                       placeholder="email@example.com"
                     />
                     {errors.email && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.email}</p>}
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">How Did You Find Ashley M Brows? *</label>
                   <input
                     type="text"
                     value={formData.referralSource ?? ''}
                     onChange={(e) => setFormData({...formData, referralSource: e.target.value})}
                     className="w-full p-4 bg-paper/30 border border-ink/5 focus:border-accent outline-none text-sm transition-colors"
                     placeholder="Referral, Social Media, Web Search, etc."
                   />
                 </div>
               </div>

               <div className="border-t border-ink/5 my-10" />

               {/* Section II — Health & Policies */}
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center text-[10px] font-bold text-ink/40">II</div>
                 <h3 className="text-xl font-serif italic">Health &amp; Policies</h3>
               </div>
               <div className="space-y-6 mb-10">
                 <label className="flex items-start gap-4 cursor-pointer group">
                   <input
                     type="checkbox"
                     checked={formData.policyAcknowledged ?? false}
                     onChange={(e) => setFormData({...formData, policyAcknowledged: e.target.checked})}
                     className="mt-1 w-4 h-4 accent-[var(--color-accent)] shrink-0"
                   />
                   <span className="text-sm">
                     <span className="font-bold text-ink">Policies and Preparation Acknowledgment *</span>
                     <br />
                     <span className="text-ink/50 italic text-xs leading-relaxed">
                       I understand that a non-refundable deposit is required to secure an appointment. I also acknowledge that I am responsible for reviewing all FAQ, pre/post-care instructions, and cancellation policies.
                     </span>
                   </span>
                 </label>

                 <div>
                   <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4">Health &amp; Skin Considerations (Select all that apply) *</p>
                   <div className="grid md:grid-cols-2 gap-x-10 gap-y-4">
                     {[
                       'Pregnant or Breastfeeding',
                       'Diabetes',
                       'Blood thinner use',
                       'History of keloid scarring',
                       'Active acne, eczema, psoriasis, or dermatitis',
                       'Recent Botox, filler, laser, or facial procedures',
                       'Use of Accutane within the last year',
                       'Current antibiotic use',
                       'Recent sun exposure, tanning, or sunburn',
                       'Cold Sore history (lip blush services)',
                       'Current Lash serum use (eyeliner services)',
                       'None of the above',
                     ].map((condition) => (
                       <label key={condition} className="flex items-center gap-3 cursor-pointer group">
                         <input
                           type="checkbox"
                           checked={(formData.healthConditions ?? []).includes(condition)}
                           onChange={(e) => {
                             const current = formData.healthConditions ?? [];
                             setFormData({
                               ...formData,
                               healthConditions: e.target.checked
                                 ? [...current, condition]
                                 : current.filter((c: string) => c !== condition)
                             });
                           }}
                           className="w-4 h-4 accent-[var(--color-accent)] shrink-0"
                         />
                         <span className="text-sm text-ink/70 group-hover:text-ink transition-colors">{condition}</span>
                       </label>
                     ))}
                   </div>
                 </div>
               </div>

               <div className="border-t border-ink/5 my-10" />

               {/* Section III — Aesthetic Vision */}
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center text-[10px] font-bold text-ink/40">III</div>
                 <h3 className="text-xl font-serif italic">Aesthetic Vision</h3>
               </div>
               <div className="space-y-6 mb-10">
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Previous Permanent Makeup? *</label>
                     <select
                       value={formData.previousPMU ?? ''}
                       onChange={(e) => setFormData({...formData, previousPMU: e.target.value})}
                       className="w-full p-4 bg-paper/30 border border-ink/5 focus:border-accent outline-none text-sm transition-colors appearance-none"
                     >
                       <option value="">Please Select</option>
                       <option value="No">No</option>
                       <option value="Yes — by Ashley">Yes — by Ashley</option>
                       <option value="Yes — by another artist">Yes — by another artist</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Skin Type? *</label>
                     <select
                       value={formData.skinType ?? ''}
                       onChange={(e) => setFormData({...formData, skinType: e.target.value})}
                       className="w-full p-4 bg-paper/30 border border-ink/5 focus:border-accent outline-none text-sm transition-colors appearance-none"
                     >
                       <option value="">Please Select</option>
                       <option value="Dry">Dry</option>
                       <option value="Normal">Normal</option>
                       <option value="Combination">Combination</option>
                       <option value="Oily">Oily</option>
                       <option value="Sensitive">Sensitive</option>
                       <option value="Mature">Mature</option>
                     </select>
                   </div>
                 </div>

                 <div>
                   <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4">Interested Service(s) *</p>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     {[
                       'Powder Brows',
                       'Nano/Nano Fusion Brows',
                       'Lip Blush',
                       'Ombre Lip Blush',
                       'Shaded Eyeliner',
                       'Lash Line Enhancement',
                     ].map((svc) => (
                       <button
                         key={svc}
                         type="button"
                         onClick={() => {
                           const current = formData.interestedServices ?? [];
                           setFormData({
                             ...formData,
                             interestedServices: current.includes(svc)
                               ? current.filter((s: string) => s !== svc)
                               : [...current, svc]
                           });
                         }}
                         className={`py-4 px-3 border text-[10px] uppercase tracking-widest font-bold transition-colors text-center focus-visible:outline-accent ${(formData.interestedServices ?? []).includes(svc) ? 'border-accent bg-accent/5 text-accent' : 'border-ink/5 hover:border-accent/40 text-ink/40'}`}
                       >
                         {svc}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Aesthetic Goals &amp; Concerns *</label>
                   <textarea
                     rows={4}
                     value={formData.notes}
                     onChange={(e) => setFormData({...formData, notes: e.target.value})}
                     className="w-full p-4 bg-paper/30 border border-ink/5 focus:border-accent outline-none text-sm transition-colors resize-none"
                     placeholder="Please share any thoughts, concerns, past experiences, or aesthetic goals regarding the area being tattooed..."
                   />
                 </div>

                 {/* Clinical Media Uploads */}
                 <div>
                   <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4">Clinical Media Uploads</p>
                   <div className="grid md:grid-cols-2 gap-6">
                     <label className="block cursor-pointer group">
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => setFormData({...formData, currentAreaPhoto: e.target.files?.[0] ?? null})} />
                       <div className={`aspect-[4/3] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${formData.currentAreaPhoto ? 'border-accent bg-accent/5' : 'border-ink/10 hover:border-accent/40'}`}>
                         {formData.currentAreaPhoto ? (
                           <img src={URL.createObjectURL(formData.currentAreaPhoto as File)} alt="Current area" className="w-full h-full object-cover" />
                         ) : (
                           <>
                             <Plus className="w-6 h-6 text-accent/60" />
                             <p className="text-[10px] uppercase tracking-widest font-bold text-ink/40 text-center">Current Area Photo</p>
                             <p className="text-[9px] uppercase tracking-widest font-bold text-ink/25 text-center">Makeup-Free, Natural Light</p>
                           </>
                         )}
                       </div>
                     </label>
                     <label className="block cursor-pointer group">
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => setFormData({...formData, referencePhoto: e.target.files?.[0] ?? null})} />
                       <div className={`aspect-[4/3] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${formData.referencePhoto ? 'border-accent bg-accent/5' : 'border-ink/10 hover:border-accent/40'}`}>
                         {formData.referencePhoto ? (
                           <img src={URL.createObjectURL(formData.referencePhoto as File)} alt="Reference" className="w-full h-full object-cover" />
                         ) : (
                           <>
                             <Star className="w-6 h-6 text-accent/60" />
                             <p className="text-[10px] uppercase tracking-widest font-bold text-ink/40 text-center">Reference Photo</p>
                             <p className="text-[9px] uppercase tracking-widest font-bold text-ink/25 text-center">(Optional) Inspired Look</p>
                           </>
                         )}
                       </div>
                     </label>
                   </div>
                   <p className="text-center text-[9px] uppercase tracking-widest opacity-25 mt-4">Your photos are confidential and securely stored in our clinical database.</p>
                 </div>
               </div>

               <button
                 onClick={handleNext}
                 className="w-full py-6 bg-ink text-paper text-xs uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors shadow-xl flex items-center justify-center gap-4"
               >
                 Submit Formal Request <ArrowRight className="w-4 h-4" />
               </button>
               <p className="text-center text-[9px] uppercase tracking-widest opacity-30 mt-4">Our concierge will contact you within 1-3 business days.</p>
             </div>
          </motion.div>
        )}

        {step === 4 && (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
                 <Calendar className="w-10 h-10 text-paper" />
              </div>
              <h2 className="text-4xl font-serif mb-4">Request Received</h2>
              <p className="text-ink/60 mb-12 max-w-2xl mx-auto leading-relaxed">
                Thank you, <strong>{formData.fullName}</strong>. We have received your consultation request for <strong>{formData.serviceType}</strong> with <strong>{selectedArtist}</strong> on <strong>Oct {selectedDate}, {selectedTime}</strong>. 
                <br /><br />
                A member of our concierge team will reach out to <strong>{formData.email}</strong> within 24 hours to finalize your appointment and discuss pre-care instructions.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-12 py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.2em] font-bold"
              >
                Return to Studio
              </button>
           </motion.div>
        )}
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
    description: '2.5 Hour Procedure • Signature Stroke'
  },
  {
    image: '/gallery/lip-blush-before-healed.jpg',
    title: 'Nude Velvet Blush',
    category: 'Lip Blush',
    description: '2 Hour Procedure • Sheer Application'
  },
  {
    image: '/gallery/brows-before-after.jpg',
    title: 'Architectural Lamination',
    category: 'Signature Brows',
    description: '1.5 Hour Procedure • Hybrid Technique'
  },
  {
    image: '/gallery/lash-enhancement-before-after.jpg',
    title: 'Ethereal Wing',
    category: 'Defining Liner',
    description: '2 Hour Procedure • Soft Shading'
  },
  {
    image: '/gallery/lip-blush-glossy.jpg',
    title: 'Full Satin Lips',
    category: 'Lip Blush',
    description: '2.5 Hour Procedure • Saturated Tint'
  },
  {
    image: '/gallery/powder-brows-portrait.jpg',
    title: 'Feathered Arch',
    category: 'Signature Brows',
    description: '3 Hour Procedure • Nano Strokes'
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
              <img src={`${post.image}?auto=format&fit=crop&q=80&w=400`} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedService, setSelectedService] = useState<any>(null);

  const handleSelectService = (service: any) => {
    setSelectedService(service);
    setCurrentPage('service-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = () => {
    switch (currentPage) {
       case 'home': return <HomePage onNavigate={setCurrentPage} onSelectService={handleSelectService} />;
       case 'booking': return <BookingPage />;
       case 'gallery': return <GalleryPage />;
       case 'services': return <Services onSelectService={handleSelectService} onNavigate={setCurrentPage} />;
       case 'artist': return <ArtistPage />;
       case 'contact': return <ContactPage />;
       case 'privacy': return <PrivacyPage />;
       case 'policies': return <PoliciesPage />;
       case 'service-detail': return <ServiceDetailPage service={selectedService} onNavigate={setCurrentPage} />;
       default: return <HomePage onNavigate={setCurrentPage} onSelectService={handleSelectService} />;
    }
  };

  return (
    <div className="selection:bg-accent/20 min-h-screen bg-paper text-ink font-sans">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {content()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={setCurrentPage} />
      
      {/* Scroll to Top helper (optional UI element) */}
      <div 
        className="fixed bottom-10 right-10 z-40 w-12 h-12 bg-white shadow-2xl flex items-center justify-center cursor-pointer border border-ink/5 hover:bg-paper transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronRight className="w-5 h-5 -rotate-90 opacity-40" />
      </div>
    </div>
  );
}

