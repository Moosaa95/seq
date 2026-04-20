'use client';

import { useState } from 'react';
import { X, Upload, Star, Image as ImageIcon } from 'lucide-react';

export interface PropertyImage {
  id?: string;
  file?: File;
  preview: string;
  category: string;
  order: number;
  is_primary: boolean;
}

interface PropertyImageUploadProps {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}

const IMAGE_CATEGORIES = [
  'Living Room',
  'Kitchen',
  'Bedroom',
  'Bathroom',
  'Exterior',
  'Garden',
  'Pool',
  'Gym',
  'Parking',
  'Additional Views',
  'Other',
];

export default function PropertyImageUpload({ images, onChange }: PropertyImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newImages: PropertyImage[] = Array.from(files).map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      category: 'Other',
      order: images.length + index,
      is_primary: images.length === 0 && index === 0, // First image is primary by default
    }));

    onChange([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the primary image, make the first one primary
    if (images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    onChange(newImages);
  };

  const updateImageCategory = (index: number, category: string) => {
    const newImages = [...images];
    newImages[index].category = category;
    onChange(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(newImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];

    // Update order numbers
    newImages.forEach((img, i) => {
      img.order = i;
    });

    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            <span className="text-emerald-600 font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB each</p>
        </label>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative border rounded-lg overflow-hidden ${
                image.is_primary ? 'ring-2 ring-emerald-500' : 'border-gray-200'
              }`}
            >
              {/* Image Preview */}
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" />
                    Primary
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Controls */}
              <div className="p-3 bg-white space-y-2">
                {/* Category Select */}
                <select
                  value={image.category}
                  onChange={(e) => updateImageCategory(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {IMAGE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
                    >
                      <Star className="h-3 w-3" />
                      Set as Primary
                    </button>
                  )}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Order: {index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary by Category */}
      {images.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {IMAGE_CATEGORIES.map((category) => {
              const count = images.filter((img) => img.category === category).length;
              if (count === 0) return null;
              return (
                <div key={category} className="flex justify-between items-center bg-white px-3 py-2 rounded">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-semibold text-emerald-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
