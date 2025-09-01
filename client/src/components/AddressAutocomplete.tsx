import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin } from 'lucide-react';

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface AddressAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export default function AddressAutocomplete({
  value = '',
  onChange,
  placeholder = "Enter address or location",
  className = '',
  'data-testid': testId
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Get user's approximate location for better results
  const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          () => {
            // Default to USA center if location denied
            resolve({ lat: 39.8283, lon: -98.5795 });
          }
        );
      } else {
        // Default to USA center
        resolve({ lat: 39.8283, lon: -98.5795 });
      }
    });
  };

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const userLocation = await getUserLocation();
      
      // Using Nominatim (OpenStreetMap) - free geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `limit=8&` +
        `countrycodes=us&` + // Focus on US addresses
        `lat=${userLocation.lat}&` +
        `lon=${userLocation.lon}&` +
        `bounded=1&` +
        `addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        // Format addresses to be more readable
        const formattedSuggestions = data.map((item: any) => ({
          ...item,
          display_name: formatAddress(item)
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Address search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format address to be more user-friendly
  const formatAddress = (item: any) => {
    const address = item.address || {};
    const parts = [];
    
    // Add house number and street
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      parts.push(address.road);
    }
    
    // Add city
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    
    // Add state
    if (address.state) {
      parts.push(address.state);
    }
    
    // Add postcode
    if (address.postcode) {
      parts.push(address.postcode);
    }
    
    return parts.length > 0 ? parts.join(', ') : item.display_name;
  };

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAddresses(searchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    setSearchQuery(suggestion.display_name);
    onChange(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay hiding to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className={`${className} pr-8`}
          data-testid={testId}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              ref={(el) => suggestionRefs.current[index] = el}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 text-sm border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-900' : ''
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{suggestion.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}