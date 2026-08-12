// ========================================
// CONTACT FORM UTILITIES & HELPERS
// Reusable functions, hooks, and features
// ========================================

// ========================================
// VALIDATION UTILITIES
// ========================================

/**
 * Comprehensive email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone number validation (flexible)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone.trim()) return true; // Optional
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Name validation
 */
export const validateName = (name: string): string | null => {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 100) return 'Name must be less than 100 characters';
  // Check for valid characters
  if (!/^[a-zA-Z\s\-'áéíóúàèìòùäëïöüâêîôûãõñ]+$/.test(name)) {
    return 'Name contains invalid characters';
  }
  return null;
};

/**
 * Subject validation
 */
export const validateSubject = (subject: string): string | null => {
  if (!subject.trim()) return 'Subject is required';
  if (subject.trim().length < 3) return 'Subject must be at least 3 characters';
  if (subject.trim().length > 100) return 'Subject must be less than 100 characters';
  return null;
};

/**
 * Message validation
 */
export const validateMessage = (message: string): string | null => {
  if (!message.trim()) return 'Message is required';
  if (message.trim().length < 10) return 'Message must be at least 10 characters';
  if (message.trim().length > 2000) return 'Message must be less than 2000 characters';
  return null;
};

/**
 * Validate all form fields
 */
export const validateAllFields = (formData: {
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  subject: string;
  message: string;
}): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  errors.visitor_name = validateName(formData.visitor_name) || '';
  errors.visitor_email = validateEmail(formData.visitor_email)
    ? ''
    : 'Please enter a valid email address';
  if (formData.visitor_phone) {
    errors.visitor_phone = validatePhone(formData.visitor_phone)
      ? ''
      : 'Invalid phone format';
  }
  errors.subject = validateSubject(formData.subject) || '';
  errors.message = validateMessage(formData.message) || '';

  return Object.fromEntries(
    Object.entries(errors).filter(([, v]) => v !== '')
  );
};

// ========================================
// FORMATTING UTILITIES
// ========================================

/**
 * Format phone number with common patterns
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(
    cleaned.length - 10,
    cleaned.length - 7
  )}) ${cleaned.slice(cleaned.length - 7, cleaned.length - 4)}-${cleaned.slice(
    cleaned.length - 4
  )}`;
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// ========================================
// DATE & TIME UTILITIES
// ========================================

/**
 * Get formatted date
 */
export const getFormattedDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get formatted time
 */
export const getFormattedTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Get formatted date and time
 */
export const getFormattedDateTime = (date: Date = new Date()): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Check if response time is within business hours
 */
export const isBusinessHours = (date: Date = new Date()): boolean => {
  const hour = date.getHours();
  const day = date.getDay();

  // Monday (1) to Friday (5), 9 AM to 5 PM
  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
};

// ========================================
// API & EMAILJS UTILITIES
// ========================================

/**
 * Retry async function with exponential backoff
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const backoffDelay = delay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

/**
 * Debounce function for form validation
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for scroll/resize events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ========================================
// LOCAL STORAGE UTILITIES
// ========================================

/**
 * Save form draft to localStorage
 */
export const saveDraft = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

/**
 * Load form draft from localStorage
 */
export const loadDraft = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
};

/**
 * Clear form draft from localStorage
 */
export const clearDraft = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
};

/**
 * Check if draft exists
 */
export const draftExists = (key: string): boolean => {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
};

// ========================================
// ANALYTICS UTILITIES
// ========================================

/**
 * Track form event
 */
export const trackFormEvent = (
  eventName: string,
  eventData?: Record<string, any>
): void => {
  // Google Analytics (if available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventData);
  }

  // Console logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 [Analytics] ${eventName}`, eventData);
  }
};

/**
 * Track form submission
 */
export const trackFormSubmission = (formData: any): void => {
  trackFormEvent('form_submission', {
    category: formData.category,
    message_length: formData.message.length,
    has_phone: !!formData.visitor_phone,
  });
};

/**
 * Track form error
 */
export const trackFormError = (fieldName: string, errorMessage: string): void => {
  trackFormEvent('form_error', {
    field: fieldName,
    error: errorMessage,
  });
};

// ========================================
// ACCESSIBILITY UTILITIES
// ========================================

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Screen reader only
  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => announcement.remove(), 1000);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if dark mode is preferred
 */
export const prefersDarkMode = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// ========================================
// BROWSER DETECTION
// ========================================

/**
 * Detect browser type
 */
export const detectBrowser = (): string => {
  const ua = navigator.userAgent;

  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) return 'Edge';
  if (ua.indexOf('Trident') > -1) return 'IE';

  return 'Unknown';
};

/**
 * Detect if user is on mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if user is on touch device
 */
export const isTouchDevice = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    ((typeof window.ontouchstart !== 'undefined') ||
      (typeof (navigator as any).msMaxTouchPoints !== 'undefined'))
  );
};

// ========================================
// ERROR HANDLING
// ========================================

/**
 * User-friendly error messages
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('Timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Log error for debugging
 */
export const logError = (context: string, error: any): void => {
  console.error(`❌ [${context}]`, error);

  // Send to error tracking service (e.g., Sentry)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      contexts: { context },
    });
  }
};

// ========================================
// EXPORT ALL UTILITIES
// ========================================

export const ContactFormUtils = {
  // Validation
  validateEmail,
  validatePhone,
  validateName,
  validateSubject,
  validateMessage,
  validateAllFields,

  // Formatting
  formatPhoneNumber,
  sanitizeInput,
  capitalizeWords,
  truncateText,

  // Date/Time
  getFormattedDate,
  getFormattedTime,
  getFormattedDateTime,
  isBusinessHours,

  // API
  retryAsync,
  debounce,
  throttle,

  // Storage
  saveDraft,
  loadDraft,
  clearDraft,
  draftExists,

  // Analytics
  trackFormEvent,
  trackFormSubmission,
  trackFormError,

  // Accessibility
  announceToScreenReader,
  prefersReducedMotion,
  prefersDarkMode,

  // Browser
  detectBrowser,
  isMobileDevice,
  isTouchDevice,

  // Errors
  getErrorMessage,
  logError,
};
