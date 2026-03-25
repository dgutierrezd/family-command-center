import { z } from "zod/v4";

export const createFamilySchema = z.object({
  name: z.string().min(1, "Family name is required").max(50),
});

export const joinFamilySchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  all_day: z.boolean().default(false),
  recurrence_rule: z.string().nullable().optional(),
  color: z.string().default("blue"),
});

export const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required").max(200),
  date: z.string().min(1, "Date is required"),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  recipe_url: z.url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.string().optional(),
        category: z.string().default("Other"),
      })
    )
    .optional(),
});

export const groceryItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200),
  quantity: z.string().optional(),
  category: z.string().default("Other"),
});

export const choreSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  assigned_to: z.string().nullable().optional(),
  recurrence_rule: z.string().nullable().optional(),
  points: z.number().int().min(0).max(100).default(1),
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type MealInput = z.infer<typeof mealSchema>;
export type GroceryItemInput = z.infer<typeof groceryItemSchema>;
export type ChoreInput = z.infer<typeof choreSchema>;
