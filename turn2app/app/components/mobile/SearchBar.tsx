/**
 * Search Bar Component - TapCart-Style
 * 
 * Moderne Suchleiste mit Autocomplete-Unterstützung und Mobile-optimierter UX.
 * Bietet sofortige Suchergebnisse und kürzlich gesuchte Begriffe.
 */

import { useState, useRef, useEffect } from 'react';
import type { SearchBarProps } from './types';

export function SearchBar({ 
  value, 
  onChangeText, 
  onSubmit,
  placeholder = "Search products...",
  autoFocus = false
}: SearchBarProps) {
  
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mock suggestions - in real app, these would come from API
  const suggestions = [
    'iPhone case',
    'wireless earbuds',
    'phone charger',
    'screen protector',
    'phone stand'
  ].filter(suggestion => 
    suggestion.toLowerCase().includes(value.toLowerCase()) && value.length > 0
  );

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChangeText(suggestion);
    onSubmit(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          {/* Search Icon */}
          <div className="search-icon">
            🔍
          </div>
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          
          {/* Clear Button */}
          {value.length > 0 && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          
          {/* Voice Search Button */}
          <button
            type="button"
            className="voice-button"
            aria-label="Voice search"
          >
            🎤
          </button>
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (suggestions.length > 0 || isFocused) && (
        <div className="suggestions-container">
          {suggestions.length > 0 ? (
            <>
              <div className="suggestions-header">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                  type="button"
                >
                  <span className="suggestion-icon">🔍</span>
                  <span className="suggestion-text">{suggestion}</span>
                </button>
              ))}
            </>
          ) : value.length > 0 ? (
            <div className="no-suggestions">
              No suggestions found
            </div>
          ) : (
            <div className="recent-searches">
              <div className="suggestions-header">
                Recent Searches
              </div>
              <button className="suggestion-item" type="button">
                <span className="suggestion-icon">🕐</span>
                <span className="suggestion-text">wireless headphones</span>
              </button>
              <button className="suggestion-item" type="button">
                <span className="suggestion-icon">🕐</span>
                <span className="suggestion-text">phone case</span>
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .search-container {
          position: relative;
          width: 100%;
        }
        
        .search-form {
          width: 100%;
        }
        
        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
          background: ${isFocused ? 'white' : '#f8f8f8'};
          border: 2px solid ${isFocused ? 'var(--primary-color, #007C3B)' : 'transparent'};
          border-radius: 24px;
          transition: all 0.2s ease;
          box-shadow: ${isFocused ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'};
        }
        
        .search-icon {
          position: absolute;
          left: 16px;
          color: ${isFocused ? 'var(--primary-color, #007C3B)' : '#999'};
          font-size: 16px;
          pointer-events: none;
          z-index: 2;
        }
        
        .search-input {
          flex: 1;
          padding: 12px 16px 12px 48px;
          border: none;
          background: transparent;
          font-size: 16px;
          color: #1a1a1a;
          outline: none;
          border-radius: 24px;
        }
        
        .search-input::placeholder {
          color: #999;
        }
        
        .clear-button {
          position: absolute;
          right: 48px;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          background: #e0e0e0;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-button:hover {
          background: #d0d0d0;
        }
        
        .voice-button {
          position: absolute;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 16px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .voice-button:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .suggestions-container {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          margin-top: 4px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
        }
        
        .suggestions-header {
          padding: 12px 16px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .suggestion-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .suggestion-item:hover {
          background: #f5f5f5;
        }
        
        .suggestion-icon {
          font-size: 14px;
          color: #999;
          width: 16px;
          text-align: center;
        }
        
        .suggestion-text {
          font-size: 15px;
          color: #1a1a1a;
        }
        
        .no-suggestions {
          padding: 20px 16px;
          text-align: center;
          color: #999;
          font-size: 14px;
        }
        
        .recent-searches {
          /* Styling handled by parent elements */
        }
        
        /* Mobile optimizations */
        @media (max-width: 375px) {
          .search-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
          
          .suggestions-container {
            margin-top: 2px;
          }
        }
      `}</style>
    </div>
  );
}