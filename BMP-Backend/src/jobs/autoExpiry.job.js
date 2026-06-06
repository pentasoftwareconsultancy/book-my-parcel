import TravellerRoute from "../modules/traveller/travellerRoute.model.js";
import ParcelRequest from "../modules/matching/parcelRequest.model.js";
import { Op } from "sequelize";
import { parseArrivalDateTime } from "../utils/routeExpiry.util.js";

export async function expireRoutes() {

   const routes = await TravellerRoute.findAll({
      where: {
         status: "ACTIVE"
      }
   });

   for (const route of routes) {

      const arrivalDateTime = parseArrivalDateTime(route);

      if (
         arrivalDateTime &&
         arrivalDateTime.getTime() < Date.now()
      ) {

         await route.update({
            status: "EXPIRED"
         });

         await ParcelRequest.update(
           {
             status: "EXPIRED"
           },
           {
             where: {
               route_id: route.id,
               status: "SENT"
             }
           }
         );
      }
   }
}