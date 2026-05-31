// OTP_LENGTH must match the booking table's pickup_otp / delivery_otp column size (VARCHAR(4)).
// The DB column is VARCHAR(4) — never set OTP_LENGTH above 4 without a matching migration.
const OTP_LENGTH_RAW = parseInt(process.env.OTP_LENGTH) || 4;
if (OTP_LENGTH_RAW > 4) {
  console.error(
    `[OTP Config] FATAL: OTP_LENGTH=${OTP_LENGTH_RAW} exceeds the DB column size of 4. ` +
    `This will cause "value too long for type character varying(4)" errors. ` +
    `Either run a migration to expand the column or set OTP_LENGTH=4.`
  );
}

export default {
  OTP_LENGTH:       Math.min(OTP_LENGTH_RAW, 4), // hard-cap at column size to prevent DB errors
  MAX_ATTEMPTS:     parseInt(process.env.OTP_MAX_ATTEMPTS)     || 5,
  EXPIRY_MINUTES:   parseInt(process.env.OTP_EXPIRY_MINUTES)   || 5,   // 5 min TTL in Redis
  LOCKOUT_MINUTES:  parseInt(process.env.OTP_LOCKOUT_MINUTES)  || 15,
};
