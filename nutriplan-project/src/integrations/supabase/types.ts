export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dietary_preferences: {
        Row: {
          allergies: string[]
          cuisine_preferences: string[]
          diet_type: Database["public"]["Enums"]["diet_enum"]
          dislikes: string[]
          medical_conditions: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[]
          cuisine_preferences?: string[]
          diet_type?: Database["public"]["Enums"]["diet_enum"]
          dislikes?: string[]
          medical_conditions?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[]
          cuisine_preferences?: string[]
          diet_type?: Database["public"]["Enums"]["diet_enum"]
          dislikes?: string[]
          medical_conditions?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          food_id: string
          id: string
          logged_at: string
          meal_type: Database["public"]["Enums"]["meal_type_enum"]
          servings: number
          user_id: string
        }
        Insert: {
          food_id: string
          id?: string
          logged_at?: string
          meal_type: Database["public"]["Enums"]["meal_type_enum"]
          servings?: number
          user_id: string
        }
        Update: {
          food_id?: string
          id?: string
          logged_at?: string
          meal_type?: Database["public"]["Enums"]["meal_type_enum"]
          servings?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          allergens: string[]
          avoid_for: string[]
          calories: number
          carbs_g: number
          created_at: string
          cuisine: string | null
          description: string | null
          diet_tags: string[]
          fat_g: number
          fiber_g: number
          good_for: string[]
          id: string
          image_url: string | null
          meal_types: Database["public"]["Enums"]["meal_type_enum"][]
          name: string
          protein_g: number
          serving_grams: number
          serving_label: string
          sodium_mg: number
          sugar_g: number
        }
        Insert: {
          allergens?: string[]
          avoid_for?: string[]
          calories: number
          carbs_g: number
          created_at?: string
          cuisine?: string | null
          description?: string | null
          diet_tags?: string[]
          fat_g: number
          fiber_g?: number
          good_for?: string[]
          id?: string
          image_url?: string | null
          meal_types?: Database["public"]["Enums"]["meal_type_enum"][]
          name: string
          protein_g: number
          serving_grams?: number
          serving_label?: string
          sodium_mg?: number
          sugar_g?: number
        }
        Update: {
          allergens?: string[]
          avoid_for?: string[]
          calories?: number
          carbs_g?: number
          created_at?: string
          cuisine?: string | null
          description?: string | null
          diet_tags?: string[]
          fat_g?: number
          fiber_g?: number
          good_for?: string[]
          id?: string
          image_url?: string | null
          meal_types?: Database["public"]["Enums"]["meal_type_enum"][]
          name?: string
          protein_g?: number
          serving_grams?: number
          serving_label?: string
          sodium_mg?: number
          sugar_g?: number
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          created_at: string
          food_id: string
          id: string
          meal_type: Database["public"]["Enums"]["meal_type_enum"]
          plan_id: string
          reason: string | null
          score: number | null
          servings: number
          user_id: string
        }
        Insert: {
          created_at?: string
          food_id: string
          id?: string
          meal_type: Database["public"]["Enums"]["meal_type_enum"]
          plan_id: string
          reason?: string | null
          score?: number | null
          servings?: number
          user_id: string
        }
        Update: {
          created_at?: string
          food_id?: string
          id?: string
          meal_type?: Database["public"]["Enums"]["meal_type_enum"]
          plan_id?: string
          reason?: string | null
          score?: number | null
          servings?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          id: string
          plan_date: string
          total_calories: number
          total_carbs: number
          total_fat: number
          total_protein: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_date: string
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_protein?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_date?: string
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_protein?: number
          user_id?: string
        }
        Relationships: []
      }
      nutrition_targets: {
        Row: {
          bmr: number
          calorie_target: number
          carbs_g: number
          fat_g: number
          fiber_g: number
          protein_g: number
          rationale: string | null
          tdee: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bmr: number
          calorie_target: number
          carbs_g: number
          fat_g: number
          fiber_g?: number
          protein_g: number
          rationale?: string | null
          tdee: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bmr?: number
          calorie_target?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number
          protein_g?: number
          rationale?: string | null
          tdee?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_enum"] | null
          age: number | null
          created_at: string
          full_name: string | null
          goal: Database["public"]["Enums"]["goal_enum"] | null
          height_cm: number | null
          id: string
          onboarded: boolean
          sex: Database["public"]["Enums"]["sex_enum"] | null
          target_weight_kg: number | null
          updated_at: string
          weekly_pace_kg: number | null
          weight_kg: number | null
        }
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_enum"] | null
          age?: number | null
          created_at?: string
          full_name?: string | null
          goal?: Database["public"]["Enums"]["goal_enum"] | null
          height_cm?: number | null
          id: string
          onboarded?: boolean
          sex?: Database["public"]["Enums"]["sex_enum"] | null
          target_weight_kg?: number | null
          updated_at?: string
          weekly_pace_kg?: number | null
          weight_kg?: number | null
        }
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_enum"] | null
          age?: number | null
          created_at?: string
          full_name?: string | null
          goal?: Database["public"]["Enums"]["goal_enum"] | null
          height_cm?: number | null
          id?: string
          onboarded?: boolean
          sex?: Database["public"]["Enums"]["sex_enum"] | null
          target_weight_kg?: number | null
          updated_at?: string
          weekly_pace_kg?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: string
          logged_on: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          id?: string
          logged_on?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          id?: string
          logged_on?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_enum:
        | "sedentary"
        | "light"
        | "moderate"
        | "active"
        | "very_active"
      diet_enum:
        | "omnivore"
        | "vegetarian"
        | "vegan"
        | "pescatarian"
        | "keto"
        | "mediterranean"
        | "paleo"
      goal_enum: "lose" | "maintain" | "gain" | "recomp"
      meal_type_enum: "breakfast" | "lunch" | "dinner" | "snack"
      sex_enum: "male" | "female" | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_enum: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ],
      diet_enum: [
        "omnivore",
        "vegetarian",
        "vegan",
        "pescatarian",
        "keto",
        "mediterranean",
        "paleo",
      ],
      goal_enum: ["lose", "maintain", "gain", "recomp"],
      meal_type_enum: ["breakfast", "lunch", "dinner", "snack"],
      sex_enum: ["male", "female", "other"],
    },
  },
} as const
