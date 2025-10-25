import { redirect } from "@remix-run/cloudflare";
import { useState, useEffect } from 'react';
import { Link } from "@remix-run/react";
import { 
  Smartphone, ArrowRight, Check, Star, Zap, 
  Menu, X, ShoppingBag,
  Sparkles, BarChart3, Bell, Lock
} from 'lucide-react';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { ContactForm } from '../components/ContactForm';
import { NewsletterSignup } from '../components/NewsletterSignup';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const embedded = url.searchParams.get("embedded");
  
  // Wenn ein Shop-Parameter vorhanden ist, checke ob Onboarding abgeschlossen
  if (shop) {
    if (embedded === "1") {
      return redirect(`/dashboard?shop=${shop}`);
    } else {
      return redirect(`/onboarding/welcome?shop=${shop}`);
    }
  }
  
  return {};
}

export default function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePhone, setActivePhone] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Enhanced scroll detection with active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Enhanced scroll effect threshold
      setScrolled(scrollPosition > 50);
      
      // Active section detection with proper offsets
      const sections = ['hero', 'features', 'testimonials', 'pricing'];
      const offset = 100; // Header height offset
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition + offset >= offsetTop && 
              scrollPosition + offset < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhone((prev: number) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scrolling function with header offset
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Height of sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Close mobile menu after navigation
      setMobileMenuOpen(false);
    }
  };

  // FEATURE 1: INTERSECTION OBSERVER for scroll-based animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Optional: Stop observing after animation
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: '10K+', label: 'Aktive Apps' },
    { value: '50M+', label: 'Downloads' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9★', label: 'Bewertung' }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Blitzschnelle Performance',
      description: 'Native Performance mit 60fps für ein flüssiges Nutzererlebnis auf jedem Gerät.'
    },
    {
      icon: Smartphone,
      title: 'iOS & Android',
      description: 'Eine App für beide Plattformen. Kein Kompromiss bei der Qualität.'
    },
    {
      icon: ShoppingBag,
      title: 'E-Commerce Ready',
      description: 'Vollständige Shop-Integration mit Checkout, Zahlungen und Bestellverwaltung.'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Erreiche deine Kunden direkt mit personalisierten Benachrichtigungen.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Detaillierte Analysen und Metriken für datengetriebene Entscheidungen.'
    },
    {
      icon: Lock,
      title: 'Sicher & DSGVO-konform',
      description: 'Höchste Sicherheitsstandards und vollständige DSGVO-Compliance.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Weber',
      role: 'CEO, Fashion Store',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      text: 'Mit turn2app haben wir unsere App in 2 Wochen live gebracht. Die Conversion ist um 40% gestiegen!',
      rating: 5
    },
    {
      name: 'Michael Braun',
      role: 'Gründer, Tech Shop',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: 'Unglaublich einfach zu bedienen. Unsere Kunden lieben die mobile App und bestellen häufiger.',
      rating: 5
    },
    {
      name: 'Lisa Müller',
      role: 'Marketing Lead, Beauty Brand',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      text: 'Die Push-Benachrichtigungen haben unsere Kundenbindung komplett verändert. ROI innerhalb von 3 Monaten!',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      monthlyPrice: 99,
      yearlyPrice: 950, // 20% Ersparnis: 99*12*0.8
      description: 'Perfekt für kleine Shops',
      features: [
        'iOS & Android App',
        'Bis zu 500 Produkte',
        '5.000 aktive Nutzer',
        'Basic Analytics',
        'E-Mail Support'
      ],
      cta: 'Kostenlos testen',
      popular: false
    },
    {
      name: 'Professional',
      monthlyPrice: 249,
      yearlyPrice: 2390, // 20% Ersparnis: 249*12*0.8
      description: 'Für wachsende Unternehmen',
      features: [
        'Alles aus Starter',
        'Unbegrenzte Produkte',
        '50.000 aktive Nutzer',
        'Advanced Analytics',
        'Push Notifications',
        'Priority Support'
      ],
      cta: 'Jetzt starten',
      popular: true
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      yearlyPrice: null,
      description: 'Für große Marken',
      features: [
        'Alles aus Professional',
        'Unbegrenzte Nutzer',
        'Custom Branding',
        'Dedizierter Account Manager',
        'API Zugang',
        '24/7 Support'
      ],
      cta: 'Kontakt aufnehmen',
      popular: false
    }
  ];

  // Helper functions for price calculation
  const getDisplayPrice = (plan: typeof pricingPlans[0]) => {
    if (plan.monthlyPrice === null) return 'Custom';
    
    const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return `€${price}`;
  };

  const getMonthlySavings = (plan: typeof pricingPlans[0]) => {
    if (!plan.monthlyPrice || !plan.yearlyPrice) return 0;
    return Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / 12));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Advanced Animation Styles */}
      <style jsx>{`
        /* Global Smooth Scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        body {
          overflow-x: hidden;
        }
        
        section {
          scroll-margin-top: 80px;
        }
        
        /* ========================================
           FEATURE 3: FADEIN BEIM SCROLLEN
           ======================================== */
        [data-animate] {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        [data-animate].animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Staggered Animation Delays */
        [data-animate]:nth-child(1) { transition-delay: 0s; }
        [data-animate]:nth-child(2) { transition-delay: 0.1s; }
        [data-animate]:nth-child(3) { transition-delay: 0.2s; }
        [data-animate]:nth-child(4) { transition-delay: 0.3s; }
        [data-animate]:nth-child(5) { transition-delay: 0.4s; }
        [data-animate]:nth-child(6) { transition-delay: 0.5s; }
        
        /* Slide from Left */
        [data-animate="slide-left"] {
          opacity: 0;
          transform: translateX(-50px);
        }
        
        [data-animate="slide-left"].animate-in {
          opacity: 1;
          transform: translateX(0);
        }
        
        /* Slide from Right */
        [data-animate="slide-right"] {
          opacity: 0;
          transform: translateX(50px);
        }
        
        [data-animate="slide-right"].animate-in {
          opacity: 1;
          transform: translateX(0);
        }
        
        /* Scale Animation */
        [data-animate="scale"] {
          opacity: 0;
          transform: scale(0.9);
        }
        
        [data-animate="scale"].animate-in {
          opacity: 1;
          transform: scale(1);
        }
        
        /* Fade Up Animation */
        [data-animate="fade-up"] {
          opacity: 0;
          transform: translateY(30px);
        }
        
        [data-animate="fade-up"].animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* ========================================
           FEATURE 4: HERO ANIMATIONEN
           ======================================== */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(37, 99, 235, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(37, 99, 235, 0.8);
          }
        }
        
        .hero-badge {
          animation: fadeInScale 0.6s ease-out;
        }
        
        .hero-title {
          animation: fadeInUp 0.8s ease-out 0.2s backwards;
        }
        
        .hero-description {
          animation: fadeInUp 0.8s ease-out 0.4s backwards;
        }
        
        .hero-cta {
          animation: fadeInUp 0.8s ease-out 0.6s backwards;
        }
        
        .hero-stats {
          animation: fadeInUp 0.8s ease-out 0.8s backwards;
        }
        
        .hero-floating {
          animation: float 6s ease-in-out infinite;
        }
        
        .animated-gradient {
          background: linear-gradient(
            270deg,
            #eff6ff,
            #e0f2fe,
            #f0f9ff,
            #eff6ff
          ) !important;
          background-size: 400% 400% !important;
          animation: gradientShift 15s ease infinite;
        }
        
        /* ========================================
           FEATURE 2: ENHANCED HOVER EFFECTS
           ======================================== */
        .feature-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.5s;
        }
        
        .feature-card:hover::before {
          left: 100%;
        }
        
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
        }
        
        .feature-icon {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.15) rotate(5deg);
        }
        
        .pricing-card {
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .pricing-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 2px;
          background: linear-gradient(135deg, #2563eb, #0891b2);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s;
        }
        
        .pricing-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(37, 99, 235, 0.2);
        }
        
        .pricing-card:hover::after {
          opacity: 1;
        }
        
        .testimonial-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        
        .testimonial-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f9fafb, #ffffff);
          border-radius: 1rem;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.4s;
        }
        
        .testimonial-card:hover {
          transform: scale(1.03);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
        }
        
        .testimonial-card:hover::before {
          opacity: 1;
        }
        
        .cta-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .cta-button:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(37, 99, 235, 0.4);
          animation: pulse-glow 2s infinite;
        }
        
        .cta-button:active {
          transform: translateY(0);
        }
        
        /* Social Proof Cards */
        .brand-card {
          transition: all 0.3s ease;
        }
        
        .brand-card:hover {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.2) !important;
        }
        
        /* Fade-in animation for success states */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      {/* Enhanced Navigation with Active Links */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-200/50' : 'bg-transparent'}`}>
        <div className={`max-w-7xl mx-auto px-6 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center transition-all duration-300 ${scrolled ? 'w-9 h-9' : 'w-10 h-10'}`}>
                <Smartphone className={`text-white transition-all duration-300 ${scrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
              </div>
              <span className="text-xl font-bold text-gray-800">turn2app</span>
            </div>

            {/* Desktop Menu with Active Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className={`relative font-medium transition-all duration-200 py-2 ${
                  activeSection === 'features' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-600 hover:text-blue-600'
                } ${activeSection === 'features' ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full after:animate-in after:slide-in-from-left-full after:duration-300' : ''}`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className={`relative font-medium transition-all duration-200 py-2 ${
                  activeSection === 'pricing' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-600 hover:text-blue-600'
                } ${activeSection === 'pricing' ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full after:animate-in after:slide-in-from-left-full after:duration-300' : ''}`}
              >
                Preise
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className={`relative font-medium transition-all duration-200 py-2 ${
                  activeSection === 'testimonials' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-600 hover:text-blue-600'
                } ${activeSection === 'testimonials' ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full after:animate-in after:slide-in-from-left-full after:duration-300' : ''}`}
              >
                Kunden
              </button>
              <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors py-2">Ressourcen</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Anmelden
              </button>
              <Link 
                to="/install"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105 inline-block text-center"
              >
                Kostenlos starten
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Enhanced Mobile Menu Drawer */}
        <div className={`fixed top-0 right-0 bottom-0 w-80 max-w-[80vw] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800">turn2app</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <nav className="space-y-2 mb-8">
                <button 
                  onClick={() => scrollToSection('features')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    activeSection === 'features' 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    activeSection === 'pricing' 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Preise
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    activeSection === 'testimonials' 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Kunden
                </button>
                <a 
                  href="#" 
                  className="block w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Ressourcen
                </a>
              </nav>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <button className="w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium border border-gray-200 transition-all">
                  Anmelden
                </button>
                <Link 
                  to="/install"
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all inline-block text-center shadow-lg shadow-blue-600/25"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kostenlos starten
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Advanced Animations */}
      <section id="hero" className="pt-32 pb-20 px-6 overflow-hidden animated-gradient" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Badge with Animation */}
              <div className="hero-badge inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Trusted by 10,000+ brands</span>
              </div>

              {/* Title with Animation */}
              <h1 className="hero-title text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Verwandle deinen Shop in eine
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Mobile App</span>
              </h1>

              {/* Description with Animation */}
              <p className="hero-description text-xl text-gray-600 leading-relaxed">
                Erstelle native iOS & Android Apps für deinen E-Commerce Store. 
                Keine Programmierkenntnisse erforderlich. Starte in Minuten.
              </p>

              {/* CTA with Animation */}
              <div className="hero-cta flex justify-center">
                <Link 
                  to="/install"
                  className="cta-button px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-600/30 flex items-center space-x-2 relative z-10"
                >
                  <span>Kostenlos starten</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Stats with Animation */}
              <div className="hero-stats flex items-center space-x-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} data-animate="scale">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image with Float Animation */}
            <div className="relative">
              <div className="relative z-10 hero-floating">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop" 
                  alt="Mobile App Preview"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-600/20 rounded-2xl blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Scroll Animations */}
      <section id="features" className="py-20 px-6 bg-white" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-animate="slide-right">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Alles was du brauchst, in einer Plattform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leistungsstarke Features für eine perfekte Mobile Shopping Experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                data-animate="fade-up"
                className="feature-card group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100"
              >
                <div className="feature-icon w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section with Animations */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto text-center">
          <div data-animate="scale">
            <h2 className="text-4xl font-bold text-white mb-4">
              Vertraut von führenden Marken weltweit
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Über 10.000 Unternehmen nutzen turn2app für ihre Mobile Apps
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-80">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} data-animate="fade-up" className="brand-card bg-white/10 backdrop-blur-sm rounded-xl p-6 h-20 flex items-center justify-center">
                <div className="w-24 h-8 bg-white/30 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section with Carousel */}
      <section id="testimonials" className="py-20 px-6 bg-white" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-animate="scale">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Was unsere Kunden sagen
            </h2>
            <p className="text-xl text-gray-600">
              Echte Erfolgsgeschichten von echten Unternehmen
            </p>
          </div>

          {/* NEW CAROUSEL COMPONENT */}
          <TestimonialCarousel 
            testimonials={testimonials}
            autoPlayInterval={5000}
          />
        </div>
      </section>

      {/* Pricing Section with Enhanced Hover Effects */}
      <section id="pricing" className="py-20 px-6 bg-gray-50" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-animate="slide-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Einfache, transparente Preise
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Wähle den Plan, der zu deinem Business passt
            </p>
            
            {/* BILLING TOGGLE - NEW */}
            <div className="inline-flex items-center bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monatlich
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Jährlich
                {/* "Spare 20%" Badge */}
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                data-animate="fade-up"
                className={`pricing-card relative bg-white rounded-2xl p-8 ${
                  plan.popular 
                    ? 'border-2 border-blue-600 shadow-2xl shadow-blue-600/20 scale-105' 
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Beliebtester Plan
                    </span>
                  </div>
                )}
                
                {/* SAVINGS BADGE - NEW */}
                {billingPeriod === 'yearly' && plan.monthlyPrice && getMonthlySavings(plan) > 0 && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Spare €{getMonthlySavings(plan)}/Monat
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                {/* DYNAMIC PRICE DISPLAY - UPDATED */}
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    {getDisplayPrice(plan)}
                  </span>
                  {plan.monthlyPrice && (
                    <>
                      <span className="text-gray-600">
                        /{billingPeriod === 'monthly' ? 'Monat' : 'Jahr'}
                      </span>
                      {billingPeriod === 'yearly' && (
                        <p className="text-sm text-gray-500 mt-2">
                          entspricht €{Math.round(plan.yearlyPrice! / 12)}/Monat
                        </p>
                      )}
                    </>
                  )}
                </div>

                <Link 
                  to="/install"
                  className={`cta-button w-full py-3 rounded-xl font-semibold mb-8 transition-all inline-block text-center relative z-10 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12" data-animate="scale">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lass uns sprechen
            </h2>
            <p className="text-xl text-gray-600">
              Wir beantworten gerne all deine Fragen
            </p>
          </div>
          <div data-animate="fade-up">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* CTA Section with Animations */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center" data-animate="scale">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Bereit, deine Mobile App zu launchen?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Starte kostenlos und erstelle deine App in weniger als 10 Minuten
          </p>
          <div className="flex justify-center">
            <Link 
              to="/install"
              className="cta-button px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-xl flex items-center justify-center space-x-2 relative z-10"
            >
              <span>Jetzt kostenlos starten</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">turn2app</span>
              </div>
              <p className="text-gray-400 mb-6">
                Die führende Plattform für Mobile Commerce Apps
              </p>
              
              {/* Newsletter Signup in Footer */}
              <div className="max-w-md">
                <NewsletterSignup />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrationen</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Über uns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karriere</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 turn2app. Alle Rechte vorbehalten.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}