import React, { useState } from "react";

const PhotoGallery = ({ photos = [] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const displayPhotos = photos.slice(0, 3); // Show max 3 photos

  return (
    <div>
      {displayPhotos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {displayPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:opacity-90 transition group h-40"
              style={{ aspectRatio: "1/1" }}
              onClick={() => setSelectedPhoto(photo)}
            >
              {typeof photo === "string" ? (
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                  onError={(e) => (e.target.src = "https://th.bing.com/th?q=Parcel+JS+Logo&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&dpr=1.3&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-xs text-gray-400">No image</p>
                </div>
              )}
              <p className="absolute bottom-3 left-3 bg-gray-900 bg-opacity-60 text-white text-xs px-2.5 py-1.5 rounded font-medium">
                Photo {index + 1}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <p className="text-sm text-gray-500">No photos available</p>
        </div>
      )}

      {/* Simple modal for full photo view */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Full photo"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onError={(e) => (e.target.src = "https://via.placeholder.com/300?text=Image+Error")}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
