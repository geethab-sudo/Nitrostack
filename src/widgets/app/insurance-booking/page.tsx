'use client';

import { useTheme, useWidgetState, useWidgetSDK } from '@nitrostack/widgets';

/**
 * Insurance Booking Widget
 * Displays booking confirmation details after booking an insurance plan
 */

interface Booking {
  _id?: string;
  userId: string;
  insurancePlanId: string;
  policyNumber?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'active';
  premium: number;
  coverageAmount: number;
  startDate?: string | Date;
  endDate?: string | Date;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

interface InsuranceBookingData {
  success: boolean;
  booking: Booking;
  user: User;
  isNewUser: boolean;
}

export default function InsuranceBooking() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const [state, setState] = useWidgetState<{ viewMode: 'compact' | 'detailed' }>(() => ({
    viewMode: 'detailed'
  }));

  // Access tool output from Widget SDK
  const data = getToolOutput<InsuranceBookingData>();

  if (!data) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
      }}>
        Loading booking details...
      </div>
    );
  }

  const { booking, user, isNewUser } = data;

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? '#2d3748' : '#f7fafc';
  const borderColor = isDark ? '#4a5568' : '#e2e8f0';
  const accentColor = isDark ? '#3b82f6' : '#2563eb';
  const successColor = '#10b981';
  const warningColor = '#f59e0b';
  const errorColor = '#ef4444';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'paid':
        return successColor;
      case 'pending':
        return warningColor;
      case 'cancelled':
      case 'failed':
        return errorColor;
      default:
        return mutedColor;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    if (!status) return mutedColor;
    return getStatusColor(status);
  };

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
            Booking Confirmation
          </h2>
          <div style={{
            fontSize: '14px',
            color: mutedColor
          }}>
            {isNewUser ? 'New account created' : 'Existing account updated'}
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

      {/* Success Message */}
      <div style={{
        background: cardBg,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: `2px solid ${successColor}40`,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          fontSize: '32px'
        }}>
          ✅
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '4px',
            color: textColor
          }}>
            Booking Successful!
          </div>
          <div style={{
            fontSize: '14px',
            color: mutedColor
          }}>
            Your insurance booking has been confirmed. Details are provided below.
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: state?.viewMode === 'compact' ? '1fr' : '1fr 1fr',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* User Information */}
        <div style={{
          background: cardBg,
          borderRadius: '12px',
          padding: '20px',
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
            👤 User Information
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <div style={{
                fontSize: '12px',
                color: mutedColor,
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Name
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: textColor
              }}>
                {user.name}
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
                Email
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: textColor
              }}>
                {user.email}
              </div>
            </div>
            {user.phone && (
              <div>
                <div style={{
                  fontSize: '12px',
                  color: mutedColor,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Phone
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: textColor
                }}>
                  {user.phone}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div style={{
          background: cardBg,
          borderRadius: '12px',
          padding: '20px',
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
            📋 Booking Details
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {booking.policyNumber && (
              <div>
                <div style={{
                  fontSize: '12px',
                  color: mutedColor,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Policy Number
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: accentColor,
                  fontFamily: 'monospace'
                }}>
                  {booking.policyNumber}
                </div>
              </div>
            )}
            <div>
              <div style={{
                fontSize: '12px',
                color: mutedColor,
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Status
              </div>
              <div style={{
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                background: `${getStatusColor(booking.status)}20`,
                color: getStatusColor(booking.status),
                textTransform: 'capitalize'
              }}>
                {booking.status}
              </div>
            </div>
            {booking.paymentStatus && (
              <div>
                <div style={{
                  fontSize: '12px',
                  color: mutedColor,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Payment Status
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: `${getPaymentStatusColor(booking.paymentStatus)}20`,
                  color: getPaymentStatusColor(booking.paymentStatus),
                  textTransform: 'capitalize'
                }}>
                  {booking.paymentStatus}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div style={{
        background: cardBg,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
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
          💰 Financial Details
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: state?.viewMode === 'compact' ? '1fr' : '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              color: mutedColor,
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Premium Amount
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: accentColor
            }}>
              {formatCurrency(booking.premium)}
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
              Coverage Amount
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: successColor
            }}>
              {formatCurrency(booking.coverageAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details - Only in Detailed Mode */}
      {state?.viewMode === 'detailed' && (
        <>
          {/* Dates */}
          {(booking.startDate || booking.endDate) && (
            <div style={{
              background: cardBg,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
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
                📅 Coverage Period
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {booking.startDate && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: mutedColor,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Start Date
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: textColor
                    }}>
                      {formatDate(booking.startDate)}
                    </div>
                  </div>
                )}
                {booking.endDate && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: mutedColor,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      End Date
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: textColor
                    }}>
                      {formatDate(booking.endDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {(booking.paymentMethod || booking.transactionId) && (
            <div style={{
              background: cardBg,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
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
                💳 Payment Information
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {booking.paymentMethod && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: mutedColor,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Payment Method
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: textColor,
                      textTransform: 'capitalize'
                    }}>
                      {booking.paymentMethod.replace('_', ' ')}
                    </div>
                  </div>
                )}
                {booking.transactionId && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: mutedColor,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Transaction ID
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: accentColor,
                      fontFamily: 'monospace'
                    }}>
                      {booking.transactionId}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div style={{
              background: cardBg,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              border: `1px solid ${borderColor}`
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📝 Notes
              </h3>
              <div style={{
                fontSize: '14px',
                color: mutedColor,
                lineHeight: '1.6'
              }}>
                {booking.notes}
              </div>
            </div>
          )}

          {/* Booking ID */}
          {booking._id && (
            <div style={{
              background: cardBg,
              borderRadius: '12px',
              padding: '16px',
              border: `1px solid ${borderColor}`,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '12px',
                color: mutedColor,
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Booking ID
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: accentColor,
                fontFamily: 'monospace'
              }}>
                {booking._id}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
