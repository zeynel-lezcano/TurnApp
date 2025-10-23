/**
 * Product Reviews Component - TapCart-Style
 * 
 * Reviews Section mit Rating-Übersicht und Placeholder für Review-System.
 * Optimiert für mobile Darstellung und zukünftige Integration.
 */

interface ProductReviewsProps {
  rating?: number;
  reviewCount?: number;
  productId: string;
}

interface MockReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
}

export function ProductReviews({ 
  rating, 
  reviewCount, 
  productId 
}: ProductReviewsProps) {
  
  // Mock reviews data - in real app, this would come from API
  const mockReviews: MockReview[] = [
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      title: 'Amazing sound quality!',
      content: 'These earbuds exceeded my expectations. The sound is crystal clear and the battery life is incredible.',
      date: '2024-01-15',
      verified: true
    },
    {
      id: '2',
      author: 'Mike T.',
      rating: 4,
      title: 'Great for workouts',
      content: 'Perfect for the gym. They stay in place and the noise cancellation works really well.',
      date: '2024-01-10',
      verified: true
    },
    {
      id: '3',
      author: 'Jessica L.',
      rating: 5,
      title: 'Love them!',
      content: 'Best purchase I\'ve made this year. Quick charging and comfortable to wear all day.',
      date: '2024-01-08',
      verified: false
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number, size: 'small' | 'medium' = 'medium') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${size} ${i <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (!rating && !reviewCount) {
    return (
      <div className="reviews-section">
        <h3 className="section-title">Reviews</h3>
        <div className="no-reviews">
          <div className="no-reviews-icon">💬</div>
          <p className="no-reviews-text">No reviews yet</p>
          <button className="write-review-btn" type="button">
            Be the first to review
          </button>
        </div>

        <style jsx>{`
          .reviews-section {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e5e5;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 16px;
          }
          
          .no-reviews {
            text-align: center;
            padding: 32px 16px;
            color: #666;
          }
          
          .no-reviews-icon {
            font-size: 32px;
            margin-bottom: 12px;
          }
          
          .no-reviews-text {
            margin: 0 0 16px;
            font-size: 15px;
          }
          
          .write-review-btn {
            background: var(--primary-color, #007C3B);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .write-review-btn:hover {
            background: var(--secondary-color, #005c2b);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h3 className="section-title">Reviews</h3>
      
      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="rating-overview">
          <div className="rating-score">
            <span className="rating-number">{rating}</span>
            <div className="rating-stars">
              {renderStars(Math.floor(rating || 0), 'medium')}
            </div>
          </div>
          <div className="rating-info">
            <p className="review-count">
              Based on {reviewCount || 0} review{(reviewCount || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <button className="write-review-btn" type="button">
          Write a Review
        </button>
      </div>

      {/* Rating Breakdown */}
      <div className="rating-breakdown">
        {[5, 4, 3, 2, 1].map(stars => {
          // Mock distribution - in real app, calculate from actual reviews
          const percentage = stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : 5;
          
          return (
            <div key={stars} className="rating-bar">
              <span className="rating-label">{stars} ★</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="rating-percentage">{percentage}%</span>
            </div>
          );
        })}
      </div>

      {/* Recent Reviews */}
      <div className="recent-reviews">
        <h4 className="recent-title">Recent Reviews</h4>
        
        {mockReviews.slice(0, 3).map(review => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <span className="reviewer-name">{review.author}</span>
                {review.verified && (
                  <span className="verified-badge">✓ Verified</span>
                )}
              </div>
              <span className="review-date">{formatDate(review.date)}</span>
            </div>
            
            <div className="review-rating">
              {renderStars(review.rating, 'small')}
            </div>
            
            <h5 className="review-title">{review.title}</h5>
            <p className="review-content">{review.content}</p>
          </div>
        ))}
        
        {(reviewCount || 0) > 3 && (
          <button className="view-all-btn" type="button">
            View All {reviewCount} Reviews
          </button>
        )}
      </div>

      <style jsx>{`
        .reviews-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e5e5;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 20px;
        }
        
        .rating-summary {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding: 16px;
          background: #f8f8f8;
          border-radius: 12px;
        }
        
        .rating-overview {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .rating-score {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .rating-number {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
        }
        
        .rating-stars {
          display: flex;
          gap: 2px;
        }
        
        .star {
          line-height: 1;
        }
        
        .star.small {
          font-size: 14px;
        }
        
        .star.medium {
          font-size: 16px;
        }
        
        .star.filled {
          color: #ffa500;
        }
        
        .star.empty {
          color: #e0e0e0;
        }
        
        .review-count {
          font-size: 13px;
          color: #666;
          margin: 0;
        }
        
        .write-review-btn {
          background: var(--primary-color, #007C3B);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .write-review-btn:hover {
          background: var(--secondary-color, #005c2b);
        }
        
        .rating-breakdown {
          margin-bottom: 24px;
        }
        
        .rating-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .rating-label {
          font-size: 13px;
          color: #666;
          width: 30px;
        }
        
        .bar-container {
          flex: 1;
          height: 6px;
          background: #e5e5e5;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .bar-fill {
          height: 100%;
          background: #ffa500;
          transition: width 0.3s ease;
        }
        
        .rating-percentage {
          font-size: 12px;
          color: #666;
          width: 35px;
          text-align: right;
        }
        
        .recent-reviews {
          margin-top: 24px;
        }
        
        .recent-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 16px;
        }
        
        .review-item {
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .review-item:last-child {
          border-bottom: none;
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .reviewer-name {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
        }
        
        .verified-badge {
          font-size: 11px;
          color: #00c851;
          font-weight: 500;
        }
        
        .review-date {
          font-size: 12px;
          color: #999;
        }
        
        .review-rating {
          margin-bottom: 8px;
        }
        
        .review-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 6px;
          line-height: 1.3;
        }
        
        .review-content {
          font-size: 14px;
          color: #333;
          margin: 0;
          line-height: 1.4;
        }
        
        .view-all-btn {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          background: white;
          color: var(--primary-color, #007C3B);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 16px;
        }
        
        .view-all-btn:hover {
          border-color: var(--primary-color, #007C3B);
          background: rgba(0, 124, 59, 0.05);
        }
        
        @media (max-width: 375px) {
          .rating-summary {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          
          .write-review-btn {
            align-self: stretch;
            text-align: center;
          }
          
          .review-header {
            flex-direction: column;
            gap: 4px;
          }
          
          .reviewer-info {
            align-self: flex-start;
          }
          
          .review-date {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}