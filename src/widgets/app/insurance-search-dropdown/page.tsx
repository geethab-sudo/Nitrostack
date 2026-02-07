'use client';

import { useTheme, useWidgetState, useWidgetSDK } from '@nitrostack/widgets';
import { useState, useMemo, useRef, useEffect } from 'react';

/**
 * Insurance Search Dropdown Widget
 * Displays a searchable dropdown list of insurance names with auto-complete
 */

interface InsuranceName {
  name: string;
  id: string;
}

interface InsuranceSearchData {
  success: boolean;
  count: number;
  searchQuery: string;
  insuranceNames: InsuranceName[];
}

export default function InsuranceSearchDropdown() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceName | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Access tool output from Widget SDK
  const data = getToolOutput<InsuranceSearchData>();

  // Filter insurance names based on search term
  const filteredNames = useMemo(() => {
    if (!data?.insuranceNames) return [];
    
    if (!searchTerm.trim()) {
      return data.insuranceNames;
    }
    
    const term = searchTerm.toLowerCase();
    return data.insuranceNames.filter(insurance =>
      insurance.name.toLowerCase().includes(term)
    );
  }, [data?.insuranceNames, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const hoverBg = isDark ? '#374151' : '#f3f4f6';
  const focusBorder = isDark ? '#60a5fa' : '#3b82f6';

  if (!data) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: textColor,
      }}>
        Loading insurance names...
      </div>
    );
  }

  const handleSelect = (insurance: InsuranceName) => {
    setSelectedInsurance(insurance);
    setSearchTerm(insurance.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setSelectedInsurance(null);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div style={{
      padding: '24px',
      background: isDark
        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderRadius: '16px',
      maxWidth: '600px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>🔍</span>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600',
            color: textColor 
          }}>
            Insurance Search
          </h3>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px', 
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
          }}>
            {data.count} insurance{data.count !== 1 ? 's' : ''} found
            {data.searchQuery && ` for "${data.searchQuery}"`}
          </p>
        </div>
      </div>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <div style={{
          position: 'relative',
          marginBottom: '8px'
        }}>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search insurance names..."
            style={{
              width: '100%',
              padding: '12px 16px',
              paddingRight: '40px',
              fontSize: '16px',
              borderRadius: '8px',
              border: `2px solid ${isOpen ? focusBorder : borderColor}`,
              background: bgColor,
              color: textColor,
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          />
          <span style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '20px',
            pointerEvents: 'none'
          }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '300px',
            overflowY: 'auto',
            background: bgColor,
            border: `2px solid ${borderColor}`,
            borderRadius: '8px',
            marginTop: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            boxSizing: 'border-box'
          }}>
            {filteredNames.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                fontSize: '14px'
              }}>
                No insurance found matching "{searchTerm}"
              </div>
            ) : (
              filteredNames.map((insurance, index) => (
                <div
                  key={insurance.id}
                  onClick={() => handleSelect(insurance)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < filteredNames.length - 1 
                      ? `1px solid ${borderColor}` 
                      : 'none',
                    background: selectedInsurance?.id === insurance.id 
                      ? hoverBg 
                      : 'transparent',
                    transition: 'background 0.15s',
                    color: textColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 
                      selectedInsurance?.id === insurance.id ? hoverBg : 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {insurance.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                  }}>
                    ID: {insurance.id.substring(0, 8)}...
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedInsurance && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          borderRadius: '8px',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
        }}>
          <div style={{
            fontSize: '12px',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            marginBottom: '4px'
          }}>
            Selected Insurance:
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: textColor
          }}>
            {selectedInsurance.name}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        textAlign: 'center',
        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
      }}>
        💡 Type to search • Click to select
      </div>
    </div>
  );
}
