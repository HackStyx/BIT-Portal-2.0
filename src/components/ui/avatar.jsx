import React from 'react';

export function Avatar({ children, className = '' }) {
  return (
    <div className={`relative h-10 w-10 rounded-full ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = '', className = '' }) {
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  if (hasError || isLoading) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full rounded-full object-cover ${className}`}
      onError={() => setHasError(true)}
      onLoad={() => setIsLoading(false)}
    />
  );
}

export function AvatarFallback({ children, className = '' }) {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-700 text-white ${className}`}>
      {children}
    </div>
  );
}
