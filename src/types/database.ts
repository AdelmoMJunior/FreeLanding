export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = "admin" | "editor";
export type LandingPageStatus = "draft" | "published" | "archived";
export type LeadStatus = "new" | "contacted" | "closed" | "spam";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: ProfileRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: ProfileRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: ProfileRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      landing_pages: {
        Row: {
          id: string;
          slug: string;
          name: string;
          status: LandingPageStatus;
          seo_title: string;
          seo_description: string;
          seo_image_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          status?: LandingPageStatus;
          seo_title?: string;
          seo_description?: string;
          seo_image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          status?: LandingPageStatus;
          seo_title?: string;
          seo_description?: string;
          seo_image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      landing_settings: {
        Row: {
          landing_page_id: string;
          headline: string;
          subheadline: string;
          primary_cta_label: string;
          primary_cta_url: string;
          secondary_cta_label: string;
          secondary_cta_url: string;
          whatsapp_number: string;
          whatsapp_message: string;
          contact_email: string;
          contact_phone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          landing_page_id: string;
          headline?: string;
          subheadline?: string;
          primary_cta_label?: string;
          primary_cta_url?: string;
          secondary_cta_label?: string;
          secondary_cta_url?: string;
          whatsapp_number?: string;
          whatsapp_message?: string;
          contact_email?: string;
          contact_phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          landing_page_id?: string;
          headline?: string;
          subheadline?: string;
          primary_cta_label?: string;
          primary_cta_url?: string;
          secondary_cta_label?: string;
          secondary_cta_url?: string;
          whatsapp_number?: string;
          whatsapp_message?: string;
          contact_email?: string;
          contact_phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "landing_settings_landing_page_id_fkey";
            columns: ["landing_page_id"];
            isOneToOne: true;
            referencedRelation: "landing_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      system_modules: {
        Row: {
          id: string;
          landing_page_id: string;
          title: string;
          description: string;
          image_path: string | null;
          image_alt: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landing_page_id: string;
          title: string;
          description: string;
          image_path?: string | null;
          image_alt?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landing_page_id?: string;
          title?: string;
          description?: string;
          image_path?: string | null;
          image_alt?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "system_modules_landing_page_id_fkey";
            columns: ["landing_page_id"];
            isOneToOne: false;
            referencedRelation: "landing_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      benefits: {
        Row: {
          id: string;
          landing_page_id: string;
          title: string;
          description: string;
          icon_name: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landing_page_id: string;
          title: string;
          description: string;
          icon_name?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landing_page_id?: string;
          title?: string;
          description?: string;
          icon_name?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "benefits_landing_page_id_fkey";
            columns: ["landing_page_id"];
            isOneToOne: false;
            referencedRelation: "landing_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      faqs: {
        Row: {
          id: string;
          landing_page_id: string;
          question: string;
          answer: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landing_page_id: string;
          question: string;
          answer: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landing_page_id?: string;
          question?: string;
          answer?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "faqs_landing_page_id_fkey";
            columns: ["landing_page_id"];
            isOneToOne: false;
            referencedRelation: "landing_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          landing_page_id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          message: string;
          source: string;
          status: LeadStatus;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landing_page_id: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          message: string;
          source?: string;
          status?: LeadStatus;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landing_page_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          message?: string;
          source?: string;
          status?: LeadStatus;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_landing_page_id_fkey";
            columns: ["landing_page_id"];
            isOneToOne: false;
            referencedRelation: "landing_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          id: string;
          landing_page_id: string;
          bucket: string;
          path: string;
          alt_text: string;
          mime_type: "image/jpeg" | "image/png" | "image/webp";
          size_bytes: number;
          uploaded_by: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          landing_page_id: string;
          bucket?: string;
          path: string;
          alt_text?: string;
          mime_type: "image/jpeg" | "image/png" | "image/webp";
          size_bytes: number;
          uploaded_by?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          landing_page_id?: string;
          bucket?: string;
          path?: string;
          alt_text?: string;
          mime_type?: "image/jpeg" | "image/png" | "image/webp";
          size_bytes?: number;
          uploaded_by?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_landing_page_id_fkey";
            columns: ["landing_page_id"];
            isOneToOne: false;
            referencedRelation: "landing_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_published_landing: {
        Args: { page_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
