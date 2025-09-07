import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'header' | 'footer' | 'compact';
  className?: string;
}

export default function LanguageSelector({ variant = 'header', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-2 text-xs ${className}`}
            data-testid="language-selector-compact"
          >
            <Globe className="h-3 w-3 mr-1" />
            {currentLanguage?.code.toUpperCase()}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`cursor-pointer ${language === lang.code ? 'bg-blue-50' : ''}`}
              data-testid={`language-option-${lang.code}`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-500" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-auto p-0 text-gray-600 hover:text-gray-800"
              data-testid="language-selector-footer"
            >
              {currentLanguage?.name}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`cursor-pointer ${language === lang.code ? 'bg-blue-50' : ''}`}
                data-testid={`language-option-footer-${lang.code}`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Default header variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center space-x-2 text-white hover:text-gray-200 ${className}`}
          data-testid="language-selector-header"
        >
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-blue-50 font-semibold' : ''}`}
            data-testid={`language-option-header-${lang.code}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
            {language === lang.code && <span className="ml-auto text-blue-600">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}