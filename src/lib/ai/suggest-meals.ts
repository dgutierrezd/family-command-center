import type { MealSuggestion } from "@/types";

interface SuggestMealsInput {
  recentMeals: { name: string; meal_type: string }[];
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  householdSize: number | null;
}

export async function suggestMealsFromAI(
  input: SuggestMealsInput
): Promise<MealSuggestion[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const recentMealsList = input.recentMeals
    .map((m) => `${m.meal_type}: ${m.name}`)
    .join("\n");

  const restrictions = input.dietaryRestrictions.length > 0
    ? `Dietary restrictions: ${input.dietaryRestrictions.join(", ")}`
    : "No dietary restrictions";

  const cuisines = input.cuisinePreferences.length > 0
    ? `Preferred cuisines: ${input.cuisinePreferences.join(", ")}`
    : "No cuisine preference";

  const householdInfo = input.householdSize
    ? `Household size: ${input.householdSize} people`
    : "";

  const prompt = `You are a family meal planner. Suggest 3 meals for a family based on the following context.

${restrictions}
${cuisines}
${householdInfo}

Recent meals (avoid repeating these):
${recentMealsList || "No recent meals"}

Return exactly 3 meal suggestions as a JSON array. Each suggestion must have:
- "name": meal name (string)
- "meal_type": one of "breakfast", "lunch", "dinner", "snack" (string)
- "ingredients": array of objects with "name" (string), "quantity" (string like "2 cups"), "category" (one of: Produce, Dairy, Meat, Seafood, Bakery, Pantry, Frozen, Beverages, Condiments, Other)

Suggest a variety of meal types. Keep ingredients practical and quantities appropriate for the household size.

Respond ONLY with the JSON array, no other text.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(content);
  // Handle both { suggestions: [...] } and direct array formats
  const suggestions: MealSuggestion[] = Array.isArray(parsed)
    ? parsed
    : parsed.suggestions || parsed.meals || [];

  return suggestions.slice(0, 3);
}
