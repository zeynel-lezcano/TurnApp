import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { useState } from "react";
import { prisma } from "../lib/prisma.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return redirect("/auth/install");
  }
  
  return json({
    shop,
    isFirstTime: true
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return json({ 
      error: "Shop parameter ist erforderlich",
      success: false 
    });
  }
  
  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const appName = formData.get("appName") as string;
    const company = formData.get("company") as string;
    const acceptTerms = formData.get("acceptTerms") as string;
    const acceptPrivacy = formData.get("acceptPrivacy") as string;
    
    // Validierung
    if (!firstName || !lastName || !email || !acceptTerms) {
      return json({
        error: "Bitte füllen Sie alle Pflichtfelder aus und akzeptieren Sie die AGB.",
        success: false
      });
    }
    
    // Shop aus Datenbank laden oder erstellen
    const existingShop = await prisma.shop.findUnique({
      where: { shopDomain: shop }
    });
    
    if (!existingShop) {
      return json({ 
        error: "Shop nicht gefunden. Bitte installieren Sie die App über den Shopify App Store.",
        success: false 
      });
    }
    
    // Onboarding-Daten in Shop-Record speichern und als abgeschlossen markieren
    await prisma.shop.update({
      where: { shopDomain: shop },
      data: {
        ownerFirstName: firstName.trim(),
        ownerLastName: lastName.trim(),
        ownerEmail: email.trim().toLowerCase(),
        ownerPhone: phone?.trim() || null,
        appName: appName?.trim() || shop.split('.')[0],
        onboardingCompleted: true,
        onboardingStep: 'completed',
        lastActiveAt: new Date(),
        // Company info in app settings
        appSettings: JSON.stringify({
          company: company?.trim() || '',
          marketingConsent: !!formData.get("marketingConsent")
        })
      }
    });
    
    console.log(`✅ Onboarding completed for shop: ${shop}`);
    
    // Nach erfolgreicher Registrierung zur App-Preview
    return redirect(`/onboarding/preview?shop=${shop}`);
    
  } catch (error) {
    console.error("❌ Failed to save onboarding data:", error);
    return json({
      error: "Onboarding-Daten konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.",
      success: false
    });
  }
}

export default function OnboardingWelcome() {
  const { shop } = useLoaderData<typeof loader>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    appName: '',
    gdprConsent: false,
    marketingConsent: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-800 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl mb-6 shadow-2xl">
            <span className="text-4xl">📱</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Willkommen bei TurnApp
          </h1>
          <p className="text-xl text-white/90">
            Erstelle deine eigene Mobile App in wenigen Minuten
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="shop" value={shop} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Vorname</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="Max"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nachname</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">E-Mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                placeholder="max@beispiel.de"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Telefon (optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                placeholder="+49 123 456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Unternehmen</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                placeholder="Mein Shop GmbH"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">App Name</label>
              <input
                type="text"
                name="appName"
                value={formData.appName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                placeholder="Mein Shop App"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/20">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.gdprConsent}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 rounded border-white/30 bg-white/20 text-violet-600 focus:ring-2 focus:ring-white/50"
                  required
                />
                <span className="text-sm text-white/90 group-hover:text-white transition-colors">
                  Ich stimme den <span className="underline">Datenschutzbestimmungen</span> und <span className="underline">AGB</span> zu. (Erforderlich)
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="marketingConsent"
                  checked={formData.marketingConsent}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 rounded border-white/30 bg-white/20 text-violet-600 focus:ring-2 focus:ring-white/50"
                />
                <span className="text-sm text-white/90 group-hover:text-white transition-colors">
                  Ich möchte Newsletter und Updates erhalten. (Optional)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!formData.gdprConsent}
              className="w-full bg-white text-violet-600 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span>Weiter zur App-Vorschau</span>
              <span>→</span>
            </button>
          </Form>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        /* Custom styles for glassmorphism effect */
        .backdrop-blur-xl {
          backdrop-filter: blur(16px);
        }
        
        .backdrop-blur-2xl {
          backdrop-filter: blur(40px);
        }
      `}</style>
    </div>
  );
}