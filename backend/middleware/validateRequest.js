import Joi from "joi";

/** Accept any valid email format including @cybernest.local and other non-standard TLDs */
const emailSchema = () => Joi.string().email({ tlds: { allow: false } }).required();

/** Validation schemas for common request bodies */
export const schemas = {
  signup: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    email: emailSchema(),
    password: Joi.string().min(6).max(128).required(),
  }),
  login: Joi.object({
    email: emailSchema(),
    password: Joi.string().required(),
  }),
  addChild: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    email: emailSchema(),
  }),
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required(),
  }),
  blockUrl: Joi.object({
    url: Joi.string().trim().min(1).required(),
    email: emailSchema(),
  }),
  unblockUrl: Joi.object({
    url: Joi.string().trim().min(1).required(),
    email: emailSchema(),
  }),
  webUsageFiltered: Joi.object({
    childEmail: emailSchema(),
    timeFrame: Joi.string().valid("today", "yesterday", "week", "month").optional(),
  }),
};

/** Middleware factory: validate req.body against schema, return 400 on error */
export const validate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) return next();
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join("; ");
    return res.status(400).json({ message: "Validation failed", errors: messages });
  }
  req.body = value;
  next();
};

