import { Request, Response, NextFunction } from "express";

export interface ValidationRule {
  field: string;
  type: "string" | "object" | "number" | "boolean";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export const validateRequest =
  (rules: ValidationRule[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    if (!body) {
      return res.status(400).json({
        error: {
          status: 400,
          message: "Request body is required",
        },
      });
    }

    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const value = body[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === "")) {
        errors[rule.field] = `${rule.field} is required`;
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      // Check type
      if (typeof value !== rule.type) {
        errors[rule.field] = `${rule.field} must be a ${rule.type}`;
        continue;
      }

      // Check string constraints
      if (rule.type === "string") {
        if (rule.minLength && value.length < rule.minLength) {
          errors[
            rule.field
          ] = `${rule.field} must be at least ${rule.minLength} characters`;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors[
            rule.field
          ] = `${rule.field} must be at most ${rule.maxLength} characters`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: {
          status: 400,
          message: "Validation failed",
          details: errors,
        },
      });
    }

    next();
  };