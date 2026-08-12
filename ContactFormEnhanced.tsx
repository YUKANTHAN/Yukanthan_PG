// ========================================
// ENHANCED CONTACT FORM COMPONENT
// Advanced features, animations, accessibility
// ========================================

import emailjs from '@emailjs/browser';
import { FormEvent, useState, useRef, useEffect } from 'react';
import './ContactFormEnhanced.css';

// Initialize EmailJS
emailjs.init({
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
});

// ========================================
// TYPE DEFINITIONS
// ========================================

interface ContactFormData {
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  subject: string;
  message: string;
  category?: string;
}

interface SubmitStatus {
  type: 'success' | 'error' | null;
  message: string;
}

interface FieldError {
  [key: string]: string;
}

// ========================================
// VALIDATION UTILITIES
// ========================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,}$/;

const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  return PHONE_REGEX.test(phone.replace(/\s/g, ''));
};

const validateName = (name: string): string | null => {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
};

const validateEmailField = (email: string): string | null => {
  if (!email.trim()) return 'Email is required';
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return null;
};

const validateSubject = (subject: string): string | null => {
  if (!subject.trim()) return 'Subject is required';
  if (subject.trim().length < 3) return 'Subject must be at least 3 characters';
  return null;
};

const validateMessage = (message: string): string | null => {
  if (!message.trim()) return 'Message is required';
  if (message.trim().length < 10) return 'Message must be at least 10 characters';
  if (message.trim().length > 2000) return 'Message must be less than 2000 characters';
  return null;
};

// ========================================
// ENHANCED CONTACT FORM COMPONENT
// ========================================

export const ContactFormEnhanced = () => {
  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    subject: '',
    message: '',
    category: 'General Inquiry',
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: null,
    message: '',
  });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Focus state for animations
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Refs for advanced features
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // ========================================
  // FORM VALIDATION
  // ========================================

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'visitor_name':
        return validateName(value);
      case 'visitor_email':
        return validateEmailField(value);
      case 'visitor_phone':
        return value ? (validatePhone(value) ? null : 'Invalid phone format') : null;
      case 'subject':
        return validateSubject(value);
      case 'message':
        return validateMessage(value);
      default:
        return null;
    }
  };

  const validateAllFields = (): boolean => {
    const errors: FieldError = {};

    errors.visitor_name = validateName(formData.visitor_name) || '';
    errors.visitor_email = validateEmailField(formData.visitor_email) || '';
    if (formData.visitor_phone) {
      errors.visitor_phone = (validatePhone(formData.visitor_phone) ? '' : 'Invalid phone') || '';
    }
    errors.subject = validateSubject(formData.subject) || '';
    errors.message = validateMessage(formData.message) || '';

    setFieldErrors(errors);
    return Object.values(errors).every((error) => !error);
  };

  // ========================================
  // HANDLE FIELD CHANGE
  // ========================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.currentTarget;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation if field was touched
    if (touchedFields.has(name)) {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error || '',
      }));
    }
  };

  // ========================================
  // HANDLE FIELD BLUR
  // ========================================

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setFocusedField(null);
    setTouchedFields((prev) => new Set([...prev, name]));

    // Validate on blur
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error || '',
    }));
  };

  // ========================================
  // HANDLE FIELD FOCUS
  // ========================================

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocusedField(e.currentTarget.name);
  };

  // ========================================
  // SEND WELCOME EMAIL
  // ========================================

  const sendWelcomeEmail = async (data: ContactFormData): Promise<boolean> => {
    try {
      const templateParams = {
        to_email: data.visitor_email,
        visitor_name: data.visitor_name,
        visitor_email: data.visitor_email,
        subject: data.subject,
        current_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID!,
        process.env.REACT_APP_EMAILJS_WELCOME_TEMPLATE_ID!,
        templateParams
      );

      console.log('✨ Welcome email sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  };

  // ========================================
  // SEND OWNER NOTIFICATION
  // ========================================

  const sendOwnerNotification = async (data: ContactFormData): Promise<boolean> => {
    try {
      const templateParams = {
        to_email: process.env.REACT_APP_OWNER_EMAIL,
        visitor_name: data.visitor_name,
        visitor_email: data.visitor_email,
        visitor_phone: data.visitor_phone || 'Not provided',
        subject: data.subject,
        category: data.category || 'General Inquiry',
        message: data.message,
        submission_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        submission_id: `SUB-${Date.now()}`,
        visitor_ip: 'N/A',
        current_datetime: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID!,
        process.env.REACT_APP_EMAILJS_NOTIFICATION_TEMPLATE_ID!,
        templateParams
      );

      console.log('📬 Owner notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send owner notification:', error);
      return false;
    }
  };

  // ========================================
  // HANDLE FORM SUBMISSION
  // ========================================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus({ type: null, message: '' });

    // Validate all fields
    if (!validateAllFields()) {
      setIsLoading(false);
      // Add error animation to form
      containerRef.current?.classList.add('form-shake');
      setTimeout(() => {
        containerRef.current?.classList.remove('form-shake');
      }, 500);
      return;
    }

    try {
      // Send both emails in parallel
      const [welcomeSuccess, notificationSuccess] = await Promise.all([
        sendWelcomeEmail(formData),
        sendOwnerNotification(formData),
      ]);

      if (welcomeSuccess && notificationSuccess) {
        setSubmitStatus({
          type: 'success',
          message: '✨ Message sent successfully! Check your email for confirmation.',
        });

        // Add success animation
        submitButtonRef.current?.classList.add('button-success');

        // Reset form
        setFormData({
          visitor_name: '',
          visitor_email: '',
          visitor_phone: '',
          subject: '',
          message: '',
          category: 'General Inquiry',
        });
        setTouchedFields(new Set());
        setFieldErrors({});

        // Auto-clear success message
        setTimeout(() => {
          setSubmitStatus({ type: null, message: '' });
          submitButtonRef.current?.classList.remove('button-success');
        }, 5000);
      } else {
        throw new Error('Failed to send emails');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: '✗ Failed to send message. Please try again later.',
      });
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // RENDER FORM FIELD WITH ERROR
  // ========================================

  const renderFormField = (
    name: string,
    label: string,
    type: string = 'text',
    placeholder: string = '',
    required: boolean = false,
    rows?: number
  ) => {
    const value = formData[name as keyof ContactFormData];
    const error = fieldErrors[name];
    const isTouched = touchedFields.has(name);
    const isFocused = focusedField === name;

    const inputProps = {
      id: name,
      name,
      className: `form-input ${error && isTouched ? 'input-error' : ''} ${isFocused ? 'input-focused' : ''}`,
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      placeholder,
      disabled: isLoading,
      'aria-label': label,
      'aria-invalid': !!(error && isTouched),
      'aria-describedby': error && isTouched ? `${name}-error` : undefined,
    };

    return (
      <div key={name} className="form-group" data-field={name}>
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>

        <div className="form-input-wrapper">
          {rows ? (
            <textarea
              {...(inputProps as any)}
              rows={rows}
              className={inputProps.className.replace('form-input', 'form-textarea')}
            />
          ) : (
            <input {...(inputProps as any)} type={type} />
          )}
          <div className="input-accent"></div>
        </div>

        {error && isTouched && (
          <span className="error-message" id={`${name}-error`} role="alert">
            {error}
          </span>
        )}

        {name === 'message' && (
          <div className="char-count">
            {formData.message.length} / 2000
          </div>
        )}
      </div>
    );
  };

  // ========================================
  // RENDER COMPONENT
  // ========================================

  return (
    <div className="contact-form-container" ref={containerRef}>
      {/* Animated background elements */}
      <div className="background-elements">
        <div className="bg-sphere bg-sphere-1"></div>
        <div className="bg-sphere bg-sphere-2"></div>
        <div className="bg-line bg-line-1"></div>
        <div className="bg-line bg-line-2"></div>
      </div>

      <form onSubmit={handleSubmit} className="contact-form" ref={formRef} noValidate>
        {/* Status Message */}
        {submitStatus.type && (
          <div
            className={`status-message status-${submitStatus.type}`}
            role="alert"
            aria-live="polite"
          >
            <span className="status-icon">
              {submitStatus.type === 'success' ? '✨' : '⚠️'}
            </span>
            <span className="status-text">{submitStatus.message}</span>
            <button
              type="button"
              className="status-close"
              onClick={() => setSubmitStatus({ type: null, message: '' })}
              aria-label="Close message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Header */}
        <div className="form-header">
          <div className="header-badge">Get in Touch</div>
          <h2>Let's Create Something Extraordinary</h2>
          <p>I'm excited to hear from you. Drop me a message and I'll respond within 24-48 hours.</p>
        </div>

        {/* First Row: Name & Email */}
        <div className="form-row">
          <div className="form-col">
            {renderFormField('visitor_name', 'Full Name', 'text', 'Your full name', true)}
          </div>
          <div className="form-col">
            {renderFormField('visitor_email', 'Email Address', 'email', 'your@email.com', true)}
          </div>
        </div>

        {/* Second Row: Phone & Category */}
        <div className="form-row">
          <div className="form-col">
            {renderFormField('visitor_phone', 'Phone Number', 'tel', '+1 (555) 123-4567', false)}
          </div>
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Inquiry Type
              </label>
              <div className="form-select-wrapper">
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isLoading}
                  aria-label="Inquiry category"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Job Opportunity">Job Opportunity</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
                <div className="select-accent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject */}
        {renderFormField('subject', 'Subject', 'text', 'What is this about?', true)}

        {/* Message */}
        {renderFormField('message', 'Message', 'text', 'Tell me more about your inquiry...', true, 6)}

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
          ref={submitButtonRef}
          aria-busy={isLoading}
        >
          <span className="button-content">
            <span className="button-text">{isLoading ? 'Sending your message...' : 'Send Message'}</span>
            <span className="button-icon">{isLoading ? '⏳' : '→'}</span>
          </span>
          <div className="button-shimmer"></div>
        </button>

        {/* Form Footer */}
        <div className="form-footer">
          <p>📧 I'll get back to you as soon as possible</p>
          <div className="form-divider"></div>
          <p className="form-hint">Never spam, only meaningful conversations</p>
        </div>
      </form>
    </div>
  );
};

export default ContactFormEnhanced;
