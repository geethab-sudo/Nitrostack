'use client';

import { useTheme, useWidgetState, useWidgetSDK } from '@nitrostack/widgets';

/**
 * Insurance Suggestion Widget
 * Displays suggested insurance plans based on user profile
 */

interface SuggestedPlan {
  _id: string;
  name: string;
  type?: string;
  category?: string;
  premium?: number;
  coverage?: number;
  matchScore: number;
  reasons: string[];
  [key: string]: any;
}

interface InsuranceSuggestionData {
  success: boolean;
  userProfile: {
    age: number;
    salary: number;
    familyMembers: number;
    deficiencies: string[];
  };
  suggestedPlans: SuggestedPlan[];
  recommendations: string;
}

export default function InsuranceSuggestion() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const [state, setState] = useWidgetState<{ viewMode: 'compact' | 'detailed' }>(() => ({
    viewMode: 'detailed'
  }));

  // Access tool output from Widget SDK
  const data = getToolOutput<InsuranceSuggestionData>();

  if (!data) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
      }}>
        Loading insurance suggestions...
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? '#2d3748' : '#f7fafc';
  const borderColor = isDark ? '#4a5568' : '#e2e8f0';

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{
      padding: '24px',
      background: isDark
        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderRadius: '16px',
      maxWidth: '800px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      color: textColor
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>💡</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              Insurance Plan Suggestions
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.7 }}>
              Personalized recommendations for you
            </p>
          </div>
        </div>
        <button
          onClick={() => setState({
            viewMode: state?.viewMode === 'compact' ? 'detailed' : 'compact'
          })}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s',
          }}
        >
          {state?.viewMode === 'compact' ? '📊 Detailed' : '📋 Compact'}
        </button>
      </div>

      {/* User Profile Summary */}
      <div style={{
        background: cardBg,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        border: `1px solid ${borderColor}`
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '12px',
          opacity: 0.8
        }}>
          Your Profile
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          fontSize: '14px'
        }}>
          <div>
            <div style={{ opacity: 0.6, fontSize: '12px' }}>Age</div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>{data.userProfile.age} years</div>
          </div>
          <div>
            <div style={{ opacity: 0.6, fontSize: '12px' }}>Salary</div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>
              {formatCurrency(data.userProfile.salary)}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.6, fontSize: '12px' }}>Family Members</div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>
              {data.userProfile.familyMembers}
            </div>
          </div>
          {data.userProfile.deficiencies.length > 0 && (
            <div>
              <div style={{ opacity: 0.6, fontSize: '12px' }}>Health Conditions</div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>
                {data.userProfile.deficiencies.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations && (
        <div style={{
          background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: isDark ? '#60a5fa' : '#2563eb'
          }}>
            💡 Recommendations
          </div>
          <div style={{
            fontSize: '14px',
            lineHeight: '1.6',
            whiteSpace: 'pre-line'
          }}>
            {data.recommendations}
          </div>
        </div>
      )}

      {/* Suggested Plans */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Suggested Plans ({data.suggestedPlans.length})
        </div>

        {data.suggestedPlans.map((plan, index) => (
          <div
            key={plan._id}
            style={{
              background: cardBg,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              border: `2px solid ${index === 0 ? getScoreColor(plan.matchScore) : borderColor}`,
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            {/* Match Score Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: getScoreColor(plan.matchScore),
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {plan.matchScore}% Match
            </div>

            {/* Plan Name */}
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              paddingRight: '100px'
            }}>
              {plan.name}
            </div>

            {/* Plan Type */}
            {(plan.type || plan.category) && (
              <div style={{
                fontSize: '12px',
                opacity: 0.7,
                marginBottom: '12px'
              }}>
                Type: {plan.type || plan.category}
              </div>
            )}

            {/* Plan Details */}
            {state?.viewMode === 'detailed' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {plan.premium && (
                  <div>
                    <div style={{ opacity: 0.6, fontSize: '12px' }}>Premium</div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {formatCurrency(plan.premium)}/year
                    </div>
                  </div>
                )}
                {plan.coverage && (
                  <div>
                    <div style={{ opacity: 0.6, fontSize: '12px' }}>Coverage</div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {formatCurrency(plan.coverage)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Match Reasons */}
            {plan.reasons && plan.reasons.length > 0 && (
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  opacity: 0.8
                }}>
                  Why this plan matches:
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {plan.reasons.map((reason, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: `1px solid ${borderColor}`
                      }}
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        fontSize: '12px',
        textAlign: 'center',
        opacity: 0.6,
        paddingTop: '16px',
        borderTop: `1px solid ${borderColor}`
      }}>
        ✨ Personalized insurance recommendations based on your profile
      </div>
    </div>
  );
}
