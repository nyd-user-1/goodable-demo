import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TypingAnimation } from '@/components/magicui/typing-animation';

interface ProblemStatement {
  id: string;
  text: string;
}

interface AutocompleteComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  isTyping: boolean;
  className?: string;
}

export const AutocompleteCombobox: React.FC<AutocompleteComboboxProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  isTyping,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<ProblemStatement[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const comboboxId = useRef(`combobox-${Math.random().toString(36).substr(2, 9)}`);
  const listboxId = useRef(`listbox-${Math.random().toString(36).substr(2, 9)}`);

  const hasContent = value.trim().length > 0;

  // Fetch problem statements from Supabase
  const fetchProblemStatements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Sample Problems')
        .select('"Sample Problems"')
        .order('"Sample Problems"')
        .limit(20);
      
      if (error) {
        console.error('Error fetching problem statements:', error);
        return;
      }
      
      if (data) {
        const processedData = data.map((item, index) => ({
          id: `problem-${index}`,
          text: item['Sample Problems']
        })).filter(item => item.text);
        setSuggestions(processedData);
      }
    } catch (error) {
      console.error('Error fetching problem statements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblemStatements();
  }, [fetchProblemStatements]);

  const handleInputFocus = () => {
    // Always show dropdown when clicking into the container, regardless of content
    if (suggestions.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if focus is moving to the listbox or problems button
    const relatedTarget = e.relatedTarget as Node;
    if (listboxRef.current?.contains(relatedTarget)) {
      return;
    }
    // Close dropdown when clicking outside
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Close dropdown when clicking outside the entire container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (inputRef.current && !inputRef.current.closest('.input-wrapper')?.contains(target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Close dropdown when user starts typing, keep open when clearing to empty
    if (newValue.trim().length > 0) {
      setIsOpen(false);
    } else if (suggestions.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: ProblemStatement) => {
    const newValue = `It's a problem that ${suggestion.text.toLowerCase()}`;
    onChange(newValue);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
          // Scroll to selected item
          setTimeout(() => {
            const selectedElement = document.getElementById(`${listboxId.current}-option-${newIndex}`);
            selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 0);
          return newIndex;
        });
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
          // Scroll to selected item
          setTimeout(() => {
            const selectedElement = document.getElementById(`${listboxId.current}-option-${newIndex}`);
            selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 0);
          return newIndex;
        });
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (hasContent) {
          onSubmit();
        }
        break;
      
      case 'Tab':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasContent && !isTyping) {
      onSubmit();
    }
  };

  return (
    <div className={`relative w-full min-w-[740px] max-w-[740px] mx-auto ${className}`} style={{ zIndex: 1000 }}>
      {/* Clean unified container with Radix-inspired design */}
      <div className="input-wrapper relative">
        <form onSubmit={handleSubmit}>
          <div 
            className={`relative bg-card border transition-all duration-300 shadow-md min-h-[80px] ${
              isOpen 
                ? 'rounded-t-2xl border-b-0 border-primary/50' 
                : 'rounded-2xl border-border'
            } focus-within:border-primary/50`}
          >
            <div className="relative h-full">
              {/* Input field with established styling */}
              <div className="px-6 py-5">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    id={comboboxId.current}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="h-12 pr-16 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-foreground text-base"
                    disabled={isTyping}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-controls={isOpen ? listboxId.current : undefined}
                    aria-activedescendant={
                      selectedIndex >= 0 ? `${listboxId.current}-option-${selectedIndex}` : undefined
                    }
                    aria-describedby={`${comboboxId.current}-description`}
                  />
                  
                  {/* Submit button with Radix styling */}
                  {hasContent && (
                    <Button
                      type="submit"
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg transition-all duration-300 ${
                        hasContent && !isTyping
                          ? 'opacity-100 bg-primary hover:bg-primary/90'
                          : 'opacity-40 bg-muted-foreground cursor-not-allowed'
                      }`}
                      disabled={!hasContent || isTyping}
                      aria-label="Submit problem statement"
                    >
                      {isTyping ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowUp className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Accessible description */}
        <div
          id={`${comboboxId.current}-description`}
          className="sr-only"
        >
          Start typing or press arrow down to see problem statement suggestions
        </div>

        {/* Clean dropdown with Radix-inspired styling */}
        {isOpen && (
          <div className="dropdown absolute left-0 right-0 top-full bg-card border border-primary/50 border-t-0 rounded-b-2xl shadow-xl z-[9999] overflow-hidden max-h-[80vh]">
            <div className="py-2">
              {/* Simple header */}
              <div className="px-6 py-3 border-b border-border">
                <TypingAnimation
                  className="text-sm font-medium text-muted-foreground"
                  text="Trending Problems"
                  duration={50}
                />
              </div>
              
              {loading ? (
                <div className="px-6 py-8">
                  <span className="text-sm text-muted-foreground">
                    Loading trending problems...
                  </span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="max-h-[60vh] overflow-y-auto">
                  <div className="py-2">
                    <ul
                      ref={listboxRef}
                      id={listboxId.current}
                      role="listbox"
                      aria-label="Problem statement suggestions"
                    >
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={suggestion.id}
                          id={`${listboxId.current}-option-${index}`}
                          role="option"
                          aria-selected={selectedIndex === index}
                          className={`px-6 py-3 cursor-pointer transition-colors text-sm text-left ${
                            selectedIndex === index
                              ? 'bg-primary/10 text-foreground'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <span className="text-foreground">
                            {suggestion.text.charAt(0).toUpperCase() + suggestion.text.slice(1).toLowerCase()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8">
                  <span className="text-sm text-muted-foreground">
                    No trending problems available
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};