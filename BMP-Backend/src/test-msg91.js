import dotenv from "dotenv";
dotenv.config();

import { sendMsg91SMS } from "./modules/notification/msg91.sms.js";

await sendMsg91SMS({
  phone:     "7709841895",
  type_code: "Parcel_Create_Template",
  meta: {
    var1: "Akshay",
    var2: "bmp234532",
    var3: "bmp765486",
  },
});