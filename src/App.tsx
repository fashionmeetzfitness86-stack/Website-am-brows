/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Menu, ArrowRight, Instagram, Facebook, Mail, Calendar, User, Star, X, ChevronRight, ChevronLeft, MapPin, Phone, Plus } from 'lucide-react';
import { useState } from 'react';

// --- Types ---
type Page = 'home' | 'services' | 'gallery' | 'booking' | 'artist' | 'contact' | 'service-detail';

const services = [
  {
    id: 'brows',
    title: 'Signature Brows',
    price: '$650+',
    shortDescription: 'A sophisticated fusion of Microblading and Ombre Shading.',
    description: 'Our Signature Brows are the gold standard in facial architecture. Using a proprietary "Mapping of the Golden Ratio", we align your new brows with your unique orbital bone structure. This procedure combines the precision of hyper-real nano-strokes with the soft, ethereal gradient of powder shading. The result is a brow that looks completely authentic in natural sunlight, but possesses the polished definition of a professional makeup application.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=800',
    tags: ['Microblading', 'Nano-Strokes', 'Powder Finish'],
    process: [
      { step: 'Consultation', description: 'We map your face and select pigments that harmonize with your skin undertones.' },
      { step: 'Procedure', description: 'A 2.5-hour meticulous session using single-use, medical-grade tools.' },
      { step: 'Heal & Reveal', description: 'A 6-week healing period followed by a complimentary perfection touch-up.' }
    ],
    testimonials: [
      { author: 'Elena Rodriguez', text: 'Ashley didn\'t just give me brows; she restored a sense of symmetry I hadn\'t seen in decades.' },
      { author: 'Sarah Jenkins', text: 'The result is so natural my own mother couldn\'t tell. Meticulous and graceful work.' }
    ]
  },
  {
    id: 'lips',
    title: 'Ashley M. Lip Blush',
    price: '$550+',
    shortDescription: 'Enhance your natural lip color and redefine the vermillion border.',
    description: 'This is not your average "lip tattoo". Our Lip Blush technique focuses on sheer layers of pigment that create a healthy, youthful glow. We specialize in modifying the vermillion border subtly to create the illusion of fuller lips without the need for fillers. It is the ultimate "your lips but better" treatment.',
    image: '/lip-blush.webp',
    tags: ['Sheer Tint', 'Contour', 'Anti-Aging'],
    process: [
      { step: 'Color Theory', description: 'We analyze your lip health and naturally existing blue/purple tones to neutralize and enhance.' },
      { step: 'Design', description: 'We redefine your cupids bow and corners to bring structural balance.' },
      { step: 'Infusion', description: 'A gentle application that minimizes swelling and ensures even healing.' }
    ],
    testimonials: [
      { author: 'Victoria Shin', text: 'The Lip Blush gave me back the color I lost with age. I look refreshed even when I just wake up.' },
      { author: 'Chloe M.', text: 'Total game changer. My lips look fuller and the color is perfectly sheer.' }
    ]
  },
  {
    id: 'liner',
    title: 'Defining Liner',
    price: '$450+',
    shortDescription: 'From lash enhancement to a soft winged liner, we create a timeless look.',
    description: 'An eye-defining service that eliminates the struggle of daily asymmetric eyeliner. Whether you desire a subtle lash enhancement that makes your lashes look twice as thick, or a soft, smudged wing for a permanent "smoky" look, we tailor the depth and thickness to your eye shape.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
    tags: ['Lash Enhancement', 'Soft Wing', 'Tightline'],
    process: [
      { step: 'Style Selection', description: 'We choose between a tight-line lash enhancement or a soft winged shadow look.' },
      { step: 'Symmetry Check', description: 'Using digital tools to ensure perfectly mirrored results.' },
      { step: 'Pigment Fill', description: 'Working between the lashes to create a dense, natural-looking lash line.' }
    ],
    testimonials: [
      { author: 'Sarah Jenkins', text: 'Masterful work. My eyes look so much brighter and more awake.' },
      { author: 'Linda K.', text: 'The soft wing is perfection. It saves me so much time every morning.' }
    ]
  }
];

const artists = [
  {
    name: 'Ashley Miller',
    role: 'Founder & Master Artist',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    bio: 'Specializing in "The Signature Stroke", Ashley blends hyper-realism with editorial design for a timeless look.'
  },
  {
    name: 'Sophia Chen',
    role: 'Master of Nano-Strokes',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
    bio: 'Sophia\'s meticulous approach to machine-work delivers airy, pixelated textures for the modern, minimalist aesthetic.'
  },
  {
    name: 'Marcus Vance',
    role: 'Shadow & Light Expert',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    bio: 'With a background in fine arts, Marcus excels in ombre shading and corrective work, prioritizing structural harmony.'
  }
];

const testimonials = [
  {
    author: 'Elena Rodriguez',
    role: 'Creative Director',
    text: 'Ashley\'s clinical mastery is evident from the first moment. She didn\'t just give me brows; she restored a sense of symmetry I hadn\'t seen in decades. It is true high-art.',
    rating: 5
  },
  {
    author: 'Sarah Jenkins',
    role: 'Private Pilot',
    text: 'I was nervous about the clinical aspect, but the Ashley M. studio is a sanctuary. The result is so natural my own mother couldn\'t tell. Meticulous and graceful work.',
    rating: 5
  },
  {
    author: 'Victoria Shin',
    role: 'Collector',
    text: 'The Architectural Lift was a revelation. It subtly re-contoured my face in a way I didn\'t think possible without surgery. Ashley is a master technician.',
    rating: 5
  }
];

const faqs = [
  {
    question: "How long does permanent makeup last?",
    answer: "Typically, results last between 1 to 3 years. Factors such as skin type (oily vs. dry), sun exposure, and lifestyle can affect longevity. We recommend a color boost every 12-18 months to maintain vibrancy."
  },
  {
    question: "Does the procedure hurt?",
    answer: "We prioritize your comfort. A high-quality topical anesthetic is applied before and during the procedure to minimize discomfort. Most clients describe the sensation as a light scratch or vibration."
  },
  {
    question: "What is the healing process like?",
    answer: "Initial healing takes about 7-10 days. You may experience slight redness and darkening of the pigment, followed by soft flaking. The true color settles after 6 weeks, which is when we perform your perfection touch-up."
  },
  {
    question: "Am I a good candidate for Microblading?",
    answer: "Microblading is ideal for normal to dry skin. For those with oily skin or large pores, we recommend 'Nano-Strokes' or a 'Powder Finish', as these techniques offer better pigment retention and long-term clarity."
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
  <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
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
      Mastery in <br />
      <span className="italic font-normal opacity-90">Permanent Artistry</span>
    </motion.h1>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="max-w-xl text-ink/60 leading-relaxed mb-12 text-sm md:text-base font-sans"
    >
      Clinical precision meets high-fashion editorial aesthetics. Redefining facial architecture through twelve years of specialized technique.
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
      <a href="mailto:concierge@ashleymbrows.com" className="text-ink/30 hover:text-accent transition-colors">
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
         initial={{ opacity: 0, x: -20 }}
         whileInView={{ opacity: 1, x: 0 }}
         className="relative aspect-[3/4] bg-warm-gray overflow-hidden"
       >
         <img 
           src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=1200" 
           alt="Mastery" 
           className="w-full h-full object-cover grayscale-[20%]"
         />
       </motion.div>
       <motion.div
         initial={{ opacity: 0, x: 20 }}
         whileInView={{ opacity: 1, x: 0 }}
       >
         <p className="text-[10px] uppercase tracking-[0.5em] text-accent mb-6 font-bold">Provenance</p>
         <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">12+ Years of <br /> Mastery</h2>
         <div className="space-y-6 text-ink/70 leading-relaxed font-sans">
           <p>
             Ashley Miller has spent over a decade perfecting the delicate intersection of clinical safety and high-art facial enhancement. Her journey began in corrective medical pigmentation, evolving into a world-renowned signature style defined by restraint and anatomical respect.
           </p>
           <p>
             Every procedure is treated as a unique architectural study—balancing facial symmetry with the client\'s innate bone structure to create results that are imperceptible yet transformative.
           </p>
         </div>
         <div className="mt-12 flex gap-12">
            <div>
              <p className="text-2xl font-serif">4,500+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Procedures Completed</p>
            </div>
            <div>
              <p className="text-2xl font-serif">15</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Global Certifications</p>
            </div>
         </div>
       </motion.div>
    </div>
  </section>
);

const Services = ({ onSelectService }: { onSelectService: (service: any) => void }) => (
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
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
            <div className="flex flex-wrap gap-2">
              {service.tags.map(tag => (
                <span key={tag} className="text-[9px] uppercase tracking-widest px-3 py-1 bg-paper font-bold text-ink/40">{tag}</span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="py-24 px-6 max-w-5xl mx-auto">
    <div className="text-center mb-16">
       <p className="text-[10px] uppercase tracking-[0.5em] text-accent mb-4 font-bold">In Their Own Words</p>
       <h2 className="text-4xl md:text-5xl font-serif">The Client Perspective</h2>
    </div>
    <div className="grid md:grid-cols-3 gap-12">
      {testimonials.map((t, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: idx * 0.2 }}
          className="flex flex-col"
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
            <a href="mailto:concierge@ashleymbrows.com" aria-label="Email studio concierge">
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
           <li className="cursor-pointer hover:text-accent transition-colors">Booking Policy</li>
           <li className="cursor-pointer hover:text-accent transition-colors">Privacy</li>
           <li className="cursor-pointer hover:text-accent transition-colors">Terms</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-paper/10 text-[10px] uppercase tracking-widest font-bold opacity-30 text-center flex justify-between items-center">
       <p>© 2024 Ashley M. Brows. Artistry in Every Stroke.</p>
       <div className="flex gap-8">
          <span>Austin, Texas</span>
          <span>Europe</span>
       </div>
    </div>
  </footer>
);

// --- Page Content ---
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
        <div className="flex-1">
          <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Get In Touch</p>
          <h2 className="text-4xl md:text-7xl font-serif mb-12">Contact the Studio</h2>
          <div className="space-y-12">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4">Location</h4>
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-accent mt-1" />
                <p className="text-lg text-ink/80">
                  120 Artisan Way, Suite 400<br />
                  Austin, TX 78701
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4">Direct Contact</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-accent" />
                  <p className="text-lg text-ink/80">(512) 555-0198</p>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-accent" />
                  <p className="text-lg text-ink/80">concierge@ashleymbrows.com</p>
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
                <a href="mailto:concierge@ashleymbrows.com" aria-label="Email studio" className="text-ink/40 hover:text-accent transition-colors focus-visible:outline-accent">
                  <Mail className="w-6 h-6" />
                </a>
               </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white p-8 md:p-12 shadow-sm">
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
        </div>
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
          <div className="flex-1">
             <h2 className="text-4xl md:text-7xl font-serif italic mb-8">Architectural <br /> Enhancement</h2>
             <p className="text-ink/60 max-w-md leading-relaxed mb-8">
                We approach the face not as a canvas for makeup, but as a structure to be optimized. By respecting natural proportions, we create results that heal beautifully and age with grace.
             </p>
             <button onClick={() => onNavigate('artist')} className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-bold">
                Meet the artists <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
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
    <Services onSelectService={onSelectService} />
    <Testimonials />
    <FAQSection />
    <section className="py-40 bg-accent-light px-6 text-center">
       <h2 className="text-5xl md:text-8xl font-serif mb-12">Begin Your <br /> Transformation</h2>
       <p className="max-w-xl mx-auto text-ink/70 mb-12">Consultations with Ashley Miller are limited to four per month to ensure dedicated attention to every facial architecture study.</p>
       <button onClick={() => onNavigate('booking')} className="px-16 py-6 bg-accent text-paper text-xs uppercase tracking-widest font-bold shadow-2xl hover:scale-105 transition-transform">
          Secure A Consultation
       </button>
       <p className="mt-8 opacity-40 text-[10px] uppercase font-bold tracking-widest">Current Waitlist: 6 Weeks</p>
    </section>
  </>
);

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: '',
    notes: ''
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
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
    
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
                <ChevronLeft className="w-4 h-4" /> Back to schedule
             </button>
             <h2 className="text-4xl font-serif mb-12 text-center">Client Information</h2>
             <div className="bg-white p-8 md:p-12 shadow-sm max-w-2xl mx-auto">
                <div className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Full Name *</label>
                         <input 
                           type="text"
                           value={formData.fullName}
                           onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                           className={`w-full p-4 bg-paper/30 border ${errors.fullName ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors`}
                           placeholder="Enter your name"
                         />
                         {errors.fullName && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.fullName}</p>}
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
                         <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Service Type *</label>
                         <select 
                           value={formData.serviceType}
                           onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                           className={`w-full p-4 bg-paper/30 border ${errors.serviceType ? 'border-red-400' : 'border-ink/5'} focus:border-accent outline-none text-sm transition-colors appearance-none`}
                         >
                            <option value="">Select a service</option>
                            <option value="Signature Brows">Signature Brows</option>
                            <option value="Lip Blush">Lip Blush</option>
                            <option value="Defining Liner">Defining Liner</option>
                         </select>
                         {errors.serviceType && <p className="text-red-500 text-[9px] uppercase font-bold tracking-widest">{errors.serviceType}</p>}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Additional Notes</label>
                      <textarea 
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full p-4 bg-paper/30 border border-ink/5 focus:border-accent outline-none text-sm transition-colors resize-none"
                        placeholder="Tell us about your goals or skin type..."
                      />
                   </div>
                   <button 
                     onClick={handleNext}
                     className="w-full py-6 mt-8 bg-accent text-paper text-xs uppercase tracking-[0.2em] font-bold hover:bg-ink transition-colors shadow-xl"
                   >
                     Submit Consultation Request
                   </button>
                   <p className="text-center text-[9px] uppercase tracking-widest opacity-30">This is a non-binding request. Our team will verify availability.</p>
                </div>
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
    { id: 1, image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31', likes: '1.2k', comments: '42' },
    { id: 2, image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d', likes: '890', comments: '18' },
    { id: 3, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601', likes: '2.5k', comments: '104' },
    { id: 4, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796', likes: '1.1k', comments: '29' }
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
        <div className="text-center mb-20">
           <p className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Meet Your Artist</p>
           <h2 className="text-4xl md:text-6xl font-serif">The Hands Behind the Art</h2>
        </div>
        <div className="space-y-40">
           {artists.map((artist, idx) => (
             <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-20 items-center`}>
                <div className="flex-1 aspect-[4/5] bg-warm-gray w-full max-w-md overflow-hidden relative shadow-2xl">
                   <img src={artist.image} alt={artist.name} className="w-full h-full object-cover grayscale-[30%]" />
                </div>
                <div className="flex-1">
                   <h3 className="text-4xl md:text-5xl font-serif mb-4 italic">{artist.name}</h3>
                   <p className="text-accent text-[10px] uppercase tracking-[0.4em] font-bold mb-8">{artist.role}</p>
                   <p className="text-ink/60 leading-relaxed text-lg mb-8">{artist.bio}. She approaches every face with the eye of a jeweler and the precision of a surgeon.</p>
                   <div className="flex gap-8 border-t border-ink/5 pt-8">
                      <div>
                         <p className="text-xl font-serif">8yrs</p>
                         <p className="text-[10px] uppercase font-bold opacity-30">Experience</p>
                      </div>
                      <div>
                         <p className="text-xl font-serif">Global</p>
                         <p className="text-[10px] uppercase font-bold opacity-30">Certification</p>
                      </div>
                   </div>
                </div>
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
       case 'services': return <Services onSelectService={handleSelectService} />;
       case 'artist': return <ArtistPage />;
       case 'contact': return <ContactPage />;
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
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

