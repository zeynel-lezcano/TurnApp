import { json, redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, Link } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  let shop = formData.get("shop")?.toString();

  if (!shop) {
    return json({ error: "Bitte Shop-Domain eingeben" }, { status: 400 });
  }

  // Bereinigen: URLs, Leerzeichen, Slashes entfernen
  shop = shop
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/\s+/g, '')
    .toLowerCase();

  // Automatisch .myshopify.com hinzufügen wenn nicht vorhanden
  if (!shop.endsWith('.myshopify.com')) {
    // Entferne andere Domain-Endungen falls vorhanden
    shop = shop.split('.')[0];
    shop = `${shop}.myshopify.com`;
  }

  // Validiere finales Format
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop)) {
    return json({ 
      error: "Ungültiges Shop-Format. Verwenden Sie nur Buchstaben, Zahlen und Bindestriche." 
    }, { status: 400 });
  }

  // Zu OAuth weiterleiten
  return redirect(`/auth/install?shop=${shop}`);
}

export default function Install() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">turn2app</span>
            </Link>
            
            <Link 
              to="/"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              ← Zurück zur Homepage
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              TurnApp installieren
            </h1>
            <p className="text-gray-600">
              Verbinde deinen Shopify Shop mit TurnApp
            </p>
          </div>
          
          <Form method="post">
            <div className="mb-6">
              <label 
                htmlFor="shop" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Shop-Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="shop"
                  id="shop"
                  placeholder="meinshop"
                  className="w-full px-4 py-3 pr-40 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                  .myshopify.com
                </div>
              </div>
              {actionData?.error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {actionData.error}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Gib nur den Namen deines Shops ein. Wir ergänzen automatisch .myshopify.com
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Installation starten</span>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12,5 19,12 12,19"></polyline>
              </svg>
            </button>
          </Form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Du hast noch keinen Shopify Shop?{' '}
              <a 
                href="https://www.shopify.com/de/kostenlos-testen" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Jetzt kostenlos testen
              </a>
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Sicherer Installationsprozess</p>
                <p className="text-blue-700">
                  Du wirst zu Shopify weitergeleitet, um die Installation zu autorisieren. 
                  Deine Daten sind bei uns sicher.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Was passiert als nächstes?
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Du wirst zu Shopify weitergeleitet</li>
              <li>• Bestätige die App-Berechtigungen</li>
              <li>• Starte die App-Konfiguration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}