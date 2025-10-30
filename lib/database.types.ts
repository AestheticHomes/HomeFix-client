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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_broadcasts: {
        Row: {
          body: string | null
          created_at: string | null
          created_by: string | null
          id: string
          subject: string | null
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          subject?: string | null
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          subject?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_broadcasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_log: {
        Row: {
          booking_id: string | null
          created_at: string | null
          endpoint: string | null
          error_message: string | null
          id: number
          message: string | null
          response_body: Json | null
          status_code: number | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: number
          message?: string | null
          response_body?: Json | null
          status_code?: number | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: number
          message?: string | null
          response_body?: Json | null
          status_code?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: number
          latitude: number | null
          longitude: number | null
          preferred_date: string | null
          preferred_slot: string | null
          price_per_unit: number | null
          professional_service: string | null
          quantity: number | null
          service_id: number | null
          services: Json
          site_location: Json | null
          status: string | null
          total: number | null
          total_price: number
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: never
          latitude?: number | null
          longitude?: number | null
          preferred_date?: string | null
          preferred_slot?: string | null
          price_per_unit?: number | null
          professional_service?: string | null
          quantity?: number | null
          service_id?: number | null
          services?: Json
          site_location?: Json | null
          status?: string | null
          total?: number | null
          total_price?: number
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: never
          latitude?: number | null
          longitude?: number | null
          preferred_date?: string | null
          preferred_slot?: string | null
          price_per_unit?: number | null
          professional_service?: string | null
          quantity?: number | null
          service_id?: number | null
          services?: Json
          site_location?: Json | null
          status?: string | null
          total?: number | null
          total_price?: number
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string | null
          id: number
          last_error: string | null
          payload: Json
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_error?: string | null
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          last_error?: string | null
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          created_at: string | null
          email: string
          id: string
          otp: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          otp: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          otp?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "email_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goods: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          images: Json | null
          is_active: boolean | null
          metadata: Json | null
          price: number | null
          sku: string | null
          stock: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          images?: Json | null
          is_active?: boolean | null
          metadata?: Json | null
          price?: number | null
          sku?: string | null
          stock?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          images?: Json | null
          is_active?: boolean | null
          metadata?: Json | null
          price?: number | null
          sku?: string | null
          stock?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      http_response_log: {
        Row: {
          created_at: string | null
          endpoint: string | null
          error_message: string | null
          id: number
          message: string | null
          request_body: Json | null
          request_url: string | null
          response_body: string | null
          status: number | null
          status_code: number | null
        }
        Insert: {
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: never
          message?: string | null
          request_body?: Json | null
          request_url?: string | null
          response_body?: string | null
          status?: number | null
          status_code?: number | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: never
          message?: string | null
          request_body?: Json | null
          request_url?: string | null
          response_body?: string | null
          status?: number | null
          status_code?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          error: string | null
          id: number
          kind: string
          payload: Json | null
          provider_id: string | null
          status: string | null
          subject: string | null
          to_email: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: never
          kind: string
          payload?: Json | null
          provider_id?: string | null
          status?: string | null
          subject?: string | null
          to_email?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: never
          kind?: string
          payload?: Json | null
          provider_id?: string | null
          status?: string | null
          subject?: string | null
          to_email?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          gallery: Json | null
          icon: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          price: number | null
          title: string
          type: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          gallery?: Json | null
          icon?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          price?: number | null
          title: string
          type?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          gallery?: Json | null
          icon?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          price?: number | null
          title?: string
          type?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trigger_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          event: string | null
          id: number
          message: string | null
          payload: Json | null
          status_code: number | null
          trigger_name: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event?: string | null
          id?: number
          message?: string | null
          payload?: Json | null
          status_code?: number | null
          trigger_name?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event?: string | null
          id?: number
          message?: string | null
          payload?: Json | null
          status_code?: number | null
          trigger_name?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string | null
          phone: string
          phone_verified: boolean | null
          role: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          phone: string
          phone_verified?: boolean | null
          role?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          phone?: string
          phone_verified?: boolean | null
          role?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      http_response_log_readable: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: number | null
          message: string | null
          request_body: Json | null
          request_url: string | null
          response_body: string | null
          status: number | null
          status_text: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: number | null
          message?: string | null
          request_body?: Json | null
          request_url?: string | null
          response_body?: string | null
          status?: number | null
          status_text?: never
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: number | null
          message?: string | null
          request_body?: Json | null
          request_url?: string | null
          response_body?: string | null
          status?: number | null
          status_text?: never
        }
        Relationships: []
      }
    }
    Functions: {
      _homefix_service_key: { Args: never; Returns: string }
      _http_post_json: {
        Args: { headers?: Json; payload: Json; req_url: string }
        Returns: Json
      }
      fn_get_trigger_health: {
        Args: never
        Returns: {
          function_name: string
          last_called_at: string
          last_status_code: number
          table_name: string
          trigger_name: string
        }[]
      }
      safe_http_post: {
        Args: { body?: Json; headers?: Json; url: string }
        Returns: Json
      }
      safe_insert_profile_v2: {
        Args: { name?: string; phone: string }
        Returns: Json
      }
      safe_net_http_post: {
        Args: { body?: Json; headers?: Json; url: string }
        Returns: Json
      }
      universal_http_post: {
        Args: { body: string; headers: Json; url: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
