import React from "react";
import { BsBoxSeam } from "react-icons/bs";
import PhotoGallery from "./PhotoGallery";

const PackageSection = ({
  size = "—",
  weight = "—",
  value = "—",
  speed = "—",
  est_delivery = "—",
  description = "—",
  type = "—",
  length = "—",
  width = "—",
  height = "—",
  notes = "—",
  photos = [],
}) => {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-3">
        Package Information
      </p>

      {/* Package Basics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Size</p>
          <p className="text-xs font-semibold text-gray-900">{size}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Weight</p>
          <p className="text-xs font-semibold text-gray-900">{weight}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Value</p>
          <p className="text-xs font-semibold text-gray-900">₹{value}</p>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Speed</p>
          <p className="text-xs font-semibold text-gray-900">{speed}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Est. Delivery</p>
          <p className="text-xs font-semibold text-gray-900">{est_delivery}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Desc</p>
          <p className="text-xs font-semibold text-gray-900">{description}</p>
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Dimensions</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-600"><span className="font-medium">Length:</span> {length}</p>
            <p className="text-xs text-gray-600"><span className="font-medium">Breadth:</span> {width}</p>
            <p className="text-xs text-gray-600"><span className="font-medium">Height:</span> {height}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Notes</p>
          <p className="text-xs text-gray-700 leading-snug">{notes}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Type</p>
          <p className="text-xs font-semibold text-gray-900">{type}</p>
        </div>
      </div>

      {/* Photos */}
      {photos && photos.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Photos</p>
          <PhotoGallery photos={photos} />
        </div>
      )}
    </div>
  );
};

export default PackageSection;
