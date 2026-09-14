import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { submitRsvp } from '../lib/supabase';

export const RsvpSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    guestsCount: '1',
    attendance: 'yes' as 'yes' | 'no',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await submitRsvp({
        name: formData.name,
        guestsCount: formData.guestsCount,
        attendance: formData.attendance,
        message: formData.message,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);

      if (formData.attendance === 'yes') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#866739', '#747B54', '#C5A059', '#F9E6D4', '#E2BA6D'],
        });
      }
    } catch (err: any) {
      console.error('RSVP submit error:', err);
      setIsSubmitting(false);
      setIsSubmitted(true); // Still proceed since local fallback was stored
    }
  };

  return (
    <section id="rsvp" className="section-block">
      <h2 className="section-title">RSVP</h2>
      
      <img
        src="/assets/line_divider.png"
        alt="Divider"
        className="floral-divider"
      />

      <div className="rsvp-form-box">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your Name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Number of Guests</label>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={formData.guestsCount}
              onChange={(e) => setFormData({ ...formData, guestsCount: e.target.value })}
              placeholder="1"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Will you be attending?</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="attendance"
                  value="yes"
                  checked={formData.attendance === 'yes'}
                  onChange={() => setFormData({ ...formData, attendance: 'yes' })}
                />
                <span>Yes, I will gladly attend</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="attendance"
                  value="no"
                  checked={formData.attendance === 'no'}
                  onChange={() => setFormData({ ...formData, attendance: 'no' })}
                />
                <span>Regretfully, I cannot attend</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Warm Wishes / Notes (Optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Leave a sweet message for the couple..."
              className="form-input"
              rows={2}
              style={{ resize: 'vertical', minHeight: '60px' }}
            />
          </div>

          {errorMessage && (
            <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '4px' }}>
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-btn"
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
          </button>

        </form>
      </div>

      {isSubmitted && (
        <div className="modal-overlay" onClick={() => setIsSubmitted(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-script)', fontSize: '36px', color: 'var(--color-oud)', marginBottom: '8px' }}>
              Thank You, {formData.name}!
            </h3>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', color: 'var(--color-charcoal)', lineHeight: '1.6', marginBottom: '20px' }}>
              {formData.attendance === 'yes'
                ? 'Your RSVP has been confirmed. We look forward to celebrating this special day with you!'
                : 'Thank you for letting us know. You will be missed!'}
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="submit-btn"
              style={{ width: '120px', height: '38px', margin: '0 auto' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
