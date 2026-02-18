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

  // Ensure suggestedPlans is an array and userProfile exists
  const suggestedPlans = Array.isArray(data.suggestedPlans) ? data.suggestedPlans : [];
  const userProfile = data.userProfile || {
    age: 0,
    salary: 0,
    familyMembers: 0,
    deficiencies: []
  };

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
            Insurance Plan Suggestions
          </h2>
          <div style={{
            fontSize: '14px',
            color: mutedColor
          }}>
            Personalized recommendations for you
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
              background: state?.viewMode === 'compact' ? (isDark ? '#3b82f6' : '#2563eb') : 'transparent',
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
              background: state?.viewMode === 'detailed' ? (isDark ? '#3b82f6' : '#2563eb') : 'transparent',
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

      {/* User Profile Summary */}
      <div style={{
        background: cardBg,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: `1px solid ${borderColor}`
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px',
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👤 Your Profile
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          fontSize: '14px'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              color: mutedColor,
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Age
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: textColor
            }}>
              {userProfile.age} years
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '12px',
              color: mutedColor,
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Salary
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: textColor
            }}>
              {formatCurrency(userProfile.salary)}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '12px',
              color: mutedColor,
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Family Members
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: textColor
            }}>
              {userProfile.familyMembers}
            </div>
          </div>
          {userProfile.deficiencies && userProfile.deficiencies.length > 0 && (
            <div>
              <div style={{
                fontSize: '12px',
                color: mutedColor,
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Health Conditions
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: textColor
              }}>
                {userProfile.deficiencies.length}
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
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: isDark ? '#60a5fa' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💡 Recommendations
          </h3>
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
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px',
          color: textColor
        }}>
          Suggested Plans ({suggestedPlans.length})
        </h3>

        {suggestedPlans.length === 0 ? (
          <div style={{
            background: cardBg,
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: `1px solid ${borderColor}`,
            color: mutedColor
          }}>
            No insurance plans found matching your criteria. Please try adjusting your search parameters.
          </div>
        ) : (
          suggestedPlans.map((plan, index) => (
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
                fontSize: state?.viewMode === 'detailed' ? '20px' : '18px',
                fontWeight: '700',
                marginBottom: state?.viewMode === 'detailed' ? '12px' : '8px',
                paddingRight: '100px',
                color: textColor
              }}>
                {plan.name}
              </div>

              {/* Plan Type */}
              {(plan.type || plan.category) && (
                <div style={{
                  fontSize: '12px',
                  color: mutedColor,
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
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
                      <div style={{
                        fontSize: '12px',
                        color: mutedColor,
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Premium
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: textColor
                      }}>
                        {formatCurrency(plan.premium)}/year
                      </div>
                    </div>
                  )}
                  {plan.coverage && (
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: mutedColor,
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Coverage
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: textColor
                      }}>
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
                    color: mutedColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
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
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: `1px solid ${borderColor}`,
        fontSize: '12px',
        textAlign: 'center',
        color: mutedColor
      }}>
        ✨ Personalized insurance recommendations based on your profile
      </div>
    </div>
  );
}
