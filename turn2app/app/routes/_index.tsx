import { redirect } from "@remix-run/cloudflare";
import { useState, useEffect } from 'react';
import { Link } from "@remix-run/react";
import { 
  Smartphone, ArrowRight, Check, Star, Zap, 
  Menu, X, ShoppingBag,
  Sparkles, BarChart3, Bell, Lock
} from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhone((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
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
      price: '99',
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
      price: '249',
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
      price: 'Custom',
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">turn2app</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Preise</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Kunden</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Ressourcen</a>
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-blue-600 font-medium">Features</a>
              <a href="#pricing" className="block text-gray-600 hover:text-blue-600 font-medium">Preise</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-blue-600 font-medium">Kunden</a>
              <a href="#" className="block text-gray-600 hover:text-blue-600 font-medium">Ressourcen</a>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                  Anmelden
                </button>
                <Link 
                  to="/install"
                  className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 inline-block text-center"
                >
                  Kostenlos starten
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Trusted by 10,000+ brands</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Verwandle deinen Shop in eine
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Mobile App</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Erstelle native iOS & Android Apps für deinen E-Commerce Store. 
                Keine Programmierkenntnisse erforderlich. Starte in Minuten.
              </p>

              <div className="flex justify-center">
                <Link 
                  to="/install"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center space-x-2"
                >
                  <span>Kostenlos starten</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="relative z-10">
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

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
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
                className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Vertraut von führenden Marken weltweit
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Über 10.000 Unternehmen nutzen turn2app für ihre Mobile Apps
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-80">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-20 flex items-center justify-center">
                <div className="w-24 h-8 bg-white/30 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Was unsere Kunden sagen
            </h2>
            <p className="text-xl text-gray-600">
              Echte Erfolgsgeschichten von echten Unternehmen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Einfache, transparente Preise
            </h2>
            <p className="text-xl text-gray-600">
              Wähle den Plan, der zu deinem Business passt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-2xl p-8 ${
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
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price === 'Custom' ? 'Custom' : `€${plan.price}`}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-600">/Monat</span>
                  )}
                </div>

                <Link 
                  to="/install"
                  className={`w-full py-3 rounded-xl font-semibold mb-8 transition-all inline-block text-center ${
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

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Bereit, deine Mobile App zu launchen?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Starte kostenlos und erstelle deine App in weniger als 10 Minuten
          </p>
          <div className="flex justify-center">
            <Link 
              to="/install"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
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
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">turn2app</span>
              </div>
              <p className="text-gray-400 mb-4">
                Die führende Plattform für Mobile Commerce Apps
              </p>
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