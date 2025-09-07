import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Header
    'header.startTrial': 'Start Trial',
    'header.signIn': 'Sign In',
    'header.pricing': 'Pricing',
    'header.tournaments': 'See Tournaments',
    
    // Trial Signup
    'trial.title': 'Start Your Free Trial',
    'trial.subtitle': 'Get full access to Tournament Arena for 14 days. No charge until your trial ends.',
    'trial.benefits.title': 'Your 14-Day Free Trial Includes',
    'trial.benefits.access': 'Full platform access - no restrictions',
    'trial.benefits.tournaments': 'Create and manage tournaments',
    'trial.benefits.websites': 'Build custom tournament websites',
    'trial.benefits.payments': 'Payment processing and registration',
    'trial.benefits.branding': 'Professional branding and white-label',
    
    // Plans
    'plan.annual.name': 'Annual Tournament',
    'plan.annual.description': 'Perfect for organizations running one tournament annually',
    'plan.monthly.name': 'Multi-Tournament',
    'plan.monthly.description': 'Perfect for active tournament organizers',
    'plan.enterprise.name': 'Business Enterprise',
    'plan.enterprise.description': 'Complete enterprise features for businesses',
    
    // Form Fields
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.email': 'Email Address',
    'form.organization': 'Organization Name',
    'form.cardNumber': 'Card Number',
    'form.expiryDate': 'Expiry Date',
    'form.cvv': 'CVV',
    'form.billingZip': 'Billing ZIP Code',
    
    // Buttons
    'button.startTrial': 'Start My 14-Day Free Trial',
    'button.backToPricing': 'Back to Pricing',
    
    // Pricing
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.subtitle': 'Choose your plan based on tournament frequency - Start with 14-day free trial',
    'pricing.noHiddenFees': 'No Hidden Fees • Cancel Anytime • Full Access During Trial',
    
    // General
    'general.year': '/year',
    'general.month': '/month',
    'general.cancel': 'Cancel anytime',
    'general.noCharge': 'No charge until trial ends',
    'general.unlimited': 'Unlimited',
    'general.features': 'Features',
  },
  es: {
    // Header
    'header.startTrial': 'Comenzar Prueba',
    'header.signIn': 'Iniciar Sesión',
    'header.pricing': 'Precios',
    'header.tournaments': 'Ver Torneos',
    
    // Trial Signup
    'trial.title': 'Comience Su Prueba Gratuita',
    'trial.subtitle': 'Obtenga acceso completo a Tournament Arena por 14 días. No se cobra hasta que termine la prueba.',
    'trial.benefits.title': 'Su Prueba Gratuita de 14 Días Incluye',
    'trial.benefits.access': 'Acceso completo a la plataforma - sin restricciones',
    'trial.benefits.tournaments': 'Crear y gestionar torneos',
    'trial.benefits.websites': 'Crear sitios web de torneos personalizados',
    'trial.benefits.payments': 'Procesamiento de pagos y registro',
    'trial.benefits.branding': 'Marca profesional y etiqueta blanca',
    
    // Plans
    'plan.annual.name': 'Torneo Anual',
    'plan.annual.description': 'Perfecto para organizaciones que realizan un torneo anualmente',
    'plan.monthly.name': 'Multi-Torneo',
    'plan.monthly.description': 'Perfecto para organizadores activos de torneos',
    'plan.enterprise.name': 'Empresa Enterprise',
    'plan.enterprise.description': 'Características empresariales completas para negocios',
    
    // Form Fields
    'form.firstName': 'Nombre',
    'form.lastName': 'Apellido',
    'form.email': 'Correo Electrónico',
    'form.organization': 'Nombre de la Organización',
    'form.cardNumber': 'Número de Tarjeta',
    'form.expiryDate': 'Fecha de Vencimiento',
    'form.cvv': 'CVV',
    'form.billingZip': 'Código Postal',
    
    // Buttons
    'button.startTrial': 'Comenzar Mi Prueba Gratuita de 14 Días',
    'button.backToPricing': 'Volver a Precios',
    
    // Pricing
    'pricing.title': 'Precios Simples y Transparentes',
    'pricing.subtitle': 'Elija su plan según la frecuencia del torneo - Comience con prueba gratuita de 14 días',
    'pricing.noHiddenFees': 'Sin Tarifas Ocultas • Cancelar En Cualquier Momento • Acceso Completo Durante la Prueba',
    
    // General
    'general.year': '/año',
    'general.month': '/mes',
    'general.cancel': 'Cancelar en cualquier momento',
    'general.noCharge': 'No se cobra hasta que termine la prueba',
    'general.unlimited': 'Ilimitado',
    'general.features': 'Características',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  // Initialize language from browser or localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguageState(savedLanguage);
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        setLanguageState('es');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}