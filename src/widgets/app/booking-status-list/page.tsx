'use client';

import { useTheme, useWidgetState, useWidgetSDK } from '@nitrostack/widgets';

/**
 * Booking Status List Widget
 * Displays all booking statuses for a user, with each booking in a separate card
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

interface BookingStatusListData {
  success: boolean;
  user: User;
  bookings: Booking[];
  count: number;
}

export default function BookingStatusList() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const [state, setState] = useWidgetState<{ viewMode: 'compact' | 'detailed' }>(() => ({
    viewMode: 'detailed'
  }));

  // Access tool output from Widget SDK
  const data = getToolOutput<BookingStatusListData>();

  if (!data) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
      }}>
        Loading booking statuses...
      </div>
    );
  }

  const { user, bookings, count } = data;

  // Ensure bookings is an array
  const bookingsList = Array.isArray(bookings) ? bookings : [];

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
      case 'expired':
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
      maxWidth: '1200px',
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
            Booking Status
          </h2>
          <div style={{
            fontSize: '14px',
            color: mutedColor
          }}>
            {count} {count === 1 ? 'booking' : 'bookings'} found for {user.name}
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

      {/* User Information */}
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
          👤 User Information
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: state?.viewMode === 'compact' ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
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

      {/* Bookings List */}
      {bookingsList.length === 0 ? (
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
            No bookings found
          </div>
          <div style={{ fontSize: '14px' }}>
            This user has no insurance bookings yet.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {bookingsList.map((booking, index) => (
            <div
              key={booking._id || index}
              style={{
                background: cardBg,
                borderRadius: '12px',
                padding: state?.viewMode === 'detailed' ? '24px' : '20px',
                border: `2px solid ${borderColor}`,
                transition: 'all 0.2s',
                position: 'relative'
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
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'flex-end'
              }}>
                <div style={{
                  background: getStatusColor(booking.status),
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {booking.status}
                </div>
                {booking.paymentStatus && (
                  <div style={{
                    background: `${getPaymentStatusColor(booking.paymentStatus)}20`,
                    color: getPaymentStatusColor(booking.paymentStatus),
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {booking.paymentStatus}
                  </div>
                )}
              </div>

              {/* Policy Number */}
              {booking.policyNumber && (
                <div style={{
                  marginBottom: '16px',
                  paddingRight: '120px'
                }}>
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
                    fontSize: '18px',
                    fontWeight: '700',
                    color: accentColor,
                    fontFamily: 'monospace'
                  }}>
                    {booking.policyNumber}
                  </div>
                </div>
              )}

              {/* Financial Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: state?.viewMode === 'compact' ? '1fr' : '1fr 1fr',
                gap: '16px',
                marginBottom: state?.viewMode === 'detailed' ? '16px' : '0'
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
                    fontSize: state?.viewMode === 'compact' ? '18px' : '20px',
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
                    fontSize: state?.viewMode === 'compact' ? '18px' : '20px',
                    fontWeight: '700',
                    color: successColor
                  }}>
                    {formatCurrency(booking.coverageAmount)}
                  </div>
                </div>
              </div>

              {/* Additional Details - Only in Detailed Mode */}
              {state?.viewMode === 'detailed' && (
                <>
                  {/* Dates */}
                  {(booking.startDate || booking.endDate) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '16px',
                      padding: '16px',
                      background: isDark ? '#1a1a1a' : '#ffffff',
                      borderRadius: '8px',
                      border: `1px solid ${borderColor}`
                    }}>
                      {booking.startDate && (
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: mutedColor,
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Start Date
                          </div>
                          <div style={{
                            fontSize: '14px',
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
                            fontSize: '11px',
                            color: mutedColor,
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            End Date
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: textColor
                          }}>
                            {formatDate(booking.endDate)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Information */}
                  {(booking.paymentMethod || booking.transactionId) && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '16px',
                      padding: '16px',
                      background: isDark ? '#1a1a1a' : '#ffffff',
                      borderRadius: '8px',
                      border: `1px solid ${borderColor}`
                    }}>
                      {booking.paymentMethod && (
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: mutedColor,
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Payment Method
                          </div>
                          <div style={{
                            fontSize: '14px',
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
                            fontSize: '11px',
                            color: mutedColor,
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Transaction ID
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: accentColor,
                            fontFamily: 'monospace'
                          }}>
                            {booking.transactionId}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {booking.notes && (
                    <div style={{
                      padding: '16px',
                      background: isDark ? '#1a1a1a' : '#ffffff',
                      borderRadius: '8px',
                      border: `1px solid ${borderColor}`,
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        color: mutedColor,
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Notes
                      </div>
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
                      padding: '12px',
                      background: isDark ? '#1a1a1a' : '#ffffff',
                      borderRadius: '8px',
                      border: `1px solid ${borderColor}`,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        color: mutedColor,
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Booking ID
                      </div>
                      <div style={{
                        fontSize: '12px',
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
          ))}
        </div>
      )}
    </div>
  );
}
