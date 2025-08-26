import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starValue) => {
    if (readonly || !onRatingChange) return;
    
    // Se clicar na mesma estrela que já está selecionada, remove a classificação
    if (rating === starValue) {
      onRatingChange(0);
    } else {
      onRatingChange(starValue);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={cn(
            "transition-colors duration-200",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors duration-200",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-300 hover:fill-yellow-200 hover:text-yellow-300",
              readonly && "hover:fill-gray-200 hover:text-gray-300"
            )}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          {rating}/5
        </span>
      )}
    </div>
  );
};

export default StarRating;

