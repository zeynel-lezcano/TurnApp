import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein');
      return;
    }

    if (!validateEmail(email)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein');
      return;
    }

    setIsSubmitting(true);

    try {
      // API Call simulieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hier würdest du den echten API Call machen:
      // await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      setIsSuccess(true);
      setEmail('');
    } catch (error) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-green-900 mb-2">
          Erfolgreich angemeldet!
        </h4>
        <p className="text-green-700 text-sm">
          Wir haben dir eine Bestätigungs-E-Mail geschickt.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Newsletter abonnieren
          </h3>
          <p className="text-sm text-gray-600">
            Bleib auf dem Laufenden mit Updates & Tipps
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="deine@email.de"
              className={`w-full pl-4 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span> {error}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Mit der Anmeldung stimmst du unseren{' '}
          <a href="#" className="underline hover:text-gray-700">
            Datenschutzbestimmungen
          </a>{' '}
          zu.
        </p>
      </form>
    </div>
  );
}