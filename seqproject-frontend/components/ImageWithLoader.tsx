'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

// Fallback placeholder image
const FALLBACK_IMAGE = '/placeholder-property.svg';

// Sanitize and validate if URL is properly formatted for Next.js Image
function sanitizeImageUrl(url: string): string {
  if (!url) return FALLBACK_IMAGE;
  
  let sanitized = url;
  
  // Fix common malformed Unsplash URLs
  if (sanitized.includes('images.unsplash') && !sanitized.includes('images.unsplash.com')) {
    sanitized = sanitized.replace('images.unsplash', 'images.unsplash.com');
  }
  
  // Ensure protocol is present
  if (sanitized.startsWith('//')) {
    sanitized = 'https:' + sanitized;
  }
  
  try {
    const parsed = new URL(sanitized);
    // Check if hostname has proper TLD (at least one dot)
    if (parsed.hostname.includes('.')) {
      return sanitized;
    }
    return FALLBACK_IMAGE;
  } catch {
    // If URL parsing fails, check if it's a valid relative path
    return sanitized.startsWith('/') ? sanitized : FALLBACK_IMAGE;
  }
}

export default function ImageWithLoader({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  priority = false,
  sizes
}: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use sanitized src or fallback
  const imageSrc = (hasError || !src) ? FALLBACK_IMAGE : sanitizeImageUrl(src);

  if (!imageSrc) return null;

  return (
    <div className="relative w-full h-full">
      {/* Skeleton Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
        </div>
      )}

      {/* Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        <Image
          src={imageSrc}
          alt={alt}
          fill={fill}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          priority={priority}
          sizes={sizes}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
        />
      </motion.div>
    </div>
  );
}
