const BookingConfirmedBanner = ({ parcelData, data }) => (
  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-green-800">Booking Confirmed!</h3>
        <p className="text-green-700">Your parcel has been assigned to a traveller</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-green-200">
      <div className="text-center">
        <p className="text-sm text-gray-600">Booking ID</p>
        <p className="text-lg font-bold text-gray-900">{parcelData?.booking?.booking_ref || data.bookingRef || data.bookingId}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Parcel ID</p>
        <p className="text-lg font-bold text-gray-900">{parcelData?.parcel_ref || data.createdParcelId}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Status</p>
        <p className="text-lg font-bold text-green-600">CONFIRMED</p>
      </div>
    </div>

    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <div>
        <h5 className="font-medium text-blue-900">What&apos;s Next?</h5>
        <p className="text-sm text-blue-800 mt-1">
          Your traveller will contact you before pickup. Keep your parcel ready and ensure someone is available at the pickup location.
        </p>
      </div>
    </div>
  </div>
);

export default BookingConfirmedBanner;
