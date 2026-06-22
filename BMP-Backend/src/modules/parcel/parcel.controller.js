import { createParcelRequest } from "./parcel.service.js";
import { responseSuccess, responseError } from "../../utils/response.util.js";
import { getUserParcelRequests, getParcelById as getServiceParcelById } from "./parcel.service.js";
import { enqueueAsyncTask } from "../../jobs/asyncTasks.queue.js";
import ParcelRequest from "../matching/parcelRequest.model.js";

export const createParcel = async (req, res) => {
  try {
    const userId = req.user.id; // from auth
    const parcelData = { ...req.body, user_id: userId };

    const result = await createParcelRequest(parcelData, req.files);

    // Return the parcel ID and booking ID to frontend
    // Note: matching is triggered by the frontend when the user reaches
    // the partner selection step (POST /api/parcel/:id/find-travellers)
    return responseSuccess(res, {
      id: result.parcel.id,
      parcel: result.parcel,
      suggestedPrice: result.suggestedPrice,
      distanceCharge: result.distanceCharge,
      weightCharge: result.weightCharge,
      basePrice: result.basePrice,
      platformFee: result.platformFee,
      gstAmount: result.gstAmount,
      pickupAddress: result.pickupAddress,
      deliveryAddress: result.deliveryAddress
    }, "Parcel request created successfully");
  } catch (error) {
    console.error("Parcel creation error:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("Full error:", error);
    return responseError(res, error.message || "Parcel request failed");
  }
};


export const getUserRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🔥 Fetching orders for userId:", userId);

    const result = await getUserParcelRequests(userId, req.query);

    return responseSuccess(res, result, "Parcel requests fetched successfully");
  } catch (error) {
    console.error("Get parcel error:", error);
    return responseError(res, error.message || "Failed to fetch parcels");
  }
};

// Controller to get a single parcel by ID
export const getParcelById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await getServiceParcelById(id);

    if (!result) {
      return responseError(res, "Parcel not found", 404);
    }

    // Ownership check: parcel owner, confirmed booking traveller, or candidate traveller (expressed interest)
    const isOwner     = result.user_id === userId;
    const isTraveller = result.booking?.traveller_id === userId;

    let isCandidateTraveller = false;
    if (!isOwner && !isTraveller) {
      // Check if the requesting user has a ParcelRequest for this parcel
      const candidateRequest = await ParcelRequest.findOne({
        where: { parcel_id: result.id, traveller_id: userId },
      });
      isCandidateTraveller = !!candidateRequest;
    }

    if (!isOwner && !isTraveller && !isCandidateTraveller) {
      return responseError(res, "Unauthorized", 403);
    }

    return responseSuccess(res, result, "Parcel fetched successfully");
  } catch (error) {
    console.error("Get parcel error:", error);
    return responseError(res, error.message || "Failed to fetch parcel");
  }
};


// Update parcel form step
export const updateParcelStep = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const stepData = req.body;

    // First verify the parcel belongs to the user
    const parcel = await getServiceParcelById(id);
    
    if (!parcel) {
      return responseError(res, "Parcel not found", 404);
    }

    if (parcel.user_id !== userId) {
      return responseError(res, "Unauthorized", 403);
    }

    // Import the service function
    const { updateParcelStep: updateStep } = await import("./parcel.service.js");
    const updatedParcel = await updateStep(id, stepData, req);

    // Re-trigger matching when parcel details are edited (step 1 = parcel details updated)
    // Also re-trigger if pickup/delivery addresses changed
    if (stepData.form_step === 1 || stepData.pickup_address || stepData.delivery_address) {
      await enqueueAsyncTask("match_parcel_with_travellers", {
        parcelId: id,
        pickupCity: parcel.pickupAddress?.city,
        deliveryCity: parcel.deliveryAddress?.city,
      });
    }

    return responseSuccess(
      res,
      updatedParcel,
      "Parcel step updated successfully"
    );
  } catch (error) {
    console.error("Update parcel step error:", error);
    return responseError(res, error.message || "Failed to update parcel step");
  }
};

// Cancel parcel (User cancels their own parcel)
export const cancelParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason = "other", details = "" } = req.body;

    // Import the service function
    const { cancelParcelRequest } = await import("./parcel.service.js");
    const result = await cancelParcelRequest(id, userId, { reason, details }, req);

    return responseSuccess(
      res,
      result,
      "Parcel cancelled successfully"
    );
  } catch (error) {
    console.error("Cancel parcel error:", error);
    return responseError(res, error.message || "Failed to cancel parcel", 400);
  }
};
