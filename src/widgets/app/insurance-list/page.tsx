'use client';

import { useTheme, useWidgetState, useWidgetSDK } from '@nitrostack/widgets';

/**
 * Insurance List Widget
 * Displays a list of insurance plans with name, description, and policy id
 */

interface InsuranceListItem {
  name: string;
  description: string;
  policyId: string;
}

interface InsuranceListData {
  success: boolean;
  count: number;
  total: number;
  limit: number;
  skip: number;
  insurance: InsuranceListItem[];
}

export default function InsuranceList() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const [state, setState] = useWidgetState<{ viewMode: 'compact' | 'detailed' }>(() => ({
    viewMode: 'detailed'
  }));

  // Access tool output from Widget SDK
  const data = getToolOutput<InsuranceListData>();

  if (!data) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
      }}>
        Loading insurance list...
      </div>
    );
  }

  // Ensure insurance is an array
  const insuranceList = Array.isArray(data.insurance) ? data.insurance : [];

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? '#2d3748' : '#f7fafc';
  const borderColor = isDark ? '#4a5568' : '#e2e8f0';
  const accentColor = isDark ? '#3b82f6' : '#2563eb';

  return (
    <div style={{
      padding: '24px',
      background: isDark
        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderRadius: '16px',
      maxWidth: '900px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      color: textColor
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            background: isDark
              ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Insurance Plans
          </h2>
          <div style={{
            fontSize: '14px',
            color: mutedColor
          }}>
            Showing {data.count} of {data.total} plans
            {data.skip > 0 && ` (skipped ${data.skip})`}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: cardBg,
          padding: '4px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`
        }}>
          <button
            onClick={() => setState({ viewMode: 'compact' })}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: state?.viewMode === 'compact' ? accentColor : 'transparent',
              color: state?.viewMode === 'compact' ? 'white' : textColor,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Compact
          </button>
          <button
            onClick={() => setState({ viewMode: 'detailed' })}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: state?.viewMode === 'detailed' ? accentColor : 'transparent',
              color: state?.viewMode === 'detailed' ? 'white' : textColor,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Insurance List */}
      {insuranceList.length === 0 ? (
        <div style={{
          background: cardBg,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: `1px solid ${borderColor}`,
          color: mutedColor
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            No insurance plans found
          </div>
          <div style={{ fontSize: '14px' }}>
            Please try adjusting your search parameters.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {insuranceList.map((item, index) => (
            <div
              key={item.policyId || index}
              style={{
                background: cardBg,
                borderRadius: '12px',
                padding: state?.viewMode === 'detailed' ? '20px' : '16px',
                border: `2px solid ${borderColor}`,
                transition: 'all 0.2s',
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${accentColor}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Policy ID Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: accentColor,
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: 'monospace',
                letterSpacing: '0.5px'
              }}>
                {item.policyId}
              </div>

              {/* Plan Name */}
              <div style={{
                fontSize: state?.viewMode === 'detailed' ? '20px' : '18px',
                fontWeight: '700',
                marginBottom: state?.viewMode === 'detailed' ? '12px' : '8px',
                paddingRight: '140px',
                color: textColor
              }}>
                {item.name}
              </div>

              {/* Description */}
              {state?.viewMode === 'detailed' && (
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: mutedColor,
                  marginTop: '8px'
                }}>
                  {item.description}
                </div>
              )}

              {/* Compact Mode - Inline Description */}
              {state?.viewMode === 'compact' && (
                <div style={{
                  fontSize: '13px',
                  color: mutedColor,
                  marginTop: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {(data.skip > 0 || data.count < data.total) && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: cardBg,
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
          textAlign: 'center',
          fontSize: '14px',
          color: mutedColor
        }}>
          {data.skip > 0 && `Showing results ${data.skip + 1} to ${data.skip + data.count}`}
          {data.skip === 0 && `Showing first ${data.count} results`}
          {data.count < data.total && ` of ${data.total} total plans`}
        </div>
      )}
    </div>
  );
}
