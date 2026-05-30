// useSEO.ts, Dynamic document titles + meta descriptions per route
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOMeta { title: string; description: string; }

const SITE_NAME = 'Ashley M. Brows';
const BASE_URL = 'https://ashleymbrows.netlify.app';

const META: Record<string, SEOMeta> = {
  '/': {
    title: `${SITE_NAME} | Luxury Cosmetic Tattoo Artist, Brighton, Michigan`,
    description: 'Premium permanent makeup in Brighton, MI. Signature Brows, Lip Blush & Defining Liner by master artist Ashley Miller. Book your consultation today.',
  },
  '/services': {
    title: `Services & Pricing | ${SITE_NAME}`,
    description: 'Explore our luxury cosmetic tattoo services: Signature Powder Brows ($650), Lip Blush ($650), and Defining Liner ($400+). All skin types welcomed.',
  },
  '/gallery': {
    title: `Portfolio Gallery | ${SITE_NAME}`,
    description: 'Browse before & after results from Ashley M. Brows, Signature Brows, Lip Blush, and Eyeliner. Real clients, real results in Brighton, Michigan.',
  },
  '/booking': {
    title: `Request a Consultation | ${SITE_NAME}`,
    description: 'Submit a consultation request with Ashley Miller. Select your service, preferred date and time. No deposit required, Ashley will personally confirm your appointment.',
  },
  '/artist': {
    title: `Meet Ashley Miller | ${SITE_NAME}`,
    description: 'Master cosmetic tattoo artist Ashley Miller, 8 years of experience, globally certified, and based in Brighton, Michigan. The hands behind the art.',
  },
  '/contact': {
    title: `Contact the Studio | ${SITE_NAME}`,
    description: 'Get in touch with Ashley M. Brows in Brighton, Michigan. Located within Stay Gold Beauty, 8105 Grand River Rd. Also available in Miami by appointment.',
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'How Ashley M. Brows collects, uses, and protects your personal information.',
  },
  '/policies': {
    title: `Booking Policies | ${SITE_NAME}`,
    description: 'Deposit requirements, cancellation policy, and booking terms for Ashley M. Brows cosmetic tattoo services.',
  },
  '/booking/success': {
    title: `Request Received | ${SITE_NAME}`,
    description: 'Your consultation request has been received. Ashley will review and contact you to confirm availability.',
  },
  '/booking/cancelled': {
    title: `Request Incomplete | ${SITE_NAME}`,
    description: 'Your consultation request was not completed. Return to the booking page to try again.',
  },
};

const DEFAULT_META: SEOMeta = {
  title: `${SITE_NAME} | Luxury Cosmetic Tattoo Artist`,
  description: 'Premium permanent makeup in Brighton, MI. Signature Brows, Lip Blush & Defining Liner by Ashley Miller.',
};

export function useSEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = META[pathname] || DEFAULT_META;

    // Title
    document.title = meta.title;

    // Meta description
    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!desc) {
      desc = document.createElement('meta');
      desc.name = 'description';
      document.head.appendChild(desc);
    }
    desc.content = meta.description;

    // OG tags
    const setOG = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setOG('og:title', meta.title);
    setOG('og:description', meta.description);
    setOG('og:url', `${BASE_URL}${pathname}`);

    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${pathname}`;
  }, [pathname]);
}
