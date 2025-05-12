import React, { useState } from 'react';
import './Feedback.css';

const Feedback = ({ responseId, location }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseId,
          rating,
          comment,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const data = await response.json();
      console.log('Feedback submitted:', data);
      setSubmitted(true);
      setError('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="feedback-success">
        <h3>Thank you for your feedback!</h3>
        <button onClick={() => setSubmitted(false)}>Submit Another Feedback</button>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <h3>How was your itinerary?</h3>
      {error && <div className="feedback-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="rating-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-button ${rating >= star ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this itinerary..."
          rows="4"
        />
        <button type="submit" disabled={rating === 0}>
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default Feedback; 