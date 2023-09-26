export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      category: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          author: string
          category_id: string
          cover_url: string
          created_at: string
          id: string
          title: string
          year: number
        }
        Insert: {
          author: string
          category_id: string
          cover_url: string
          created_at?: string
          id?: string
          title: string
          year: number
        }
        Update: {
          author?: string
          category_id?: string
          cover_url?: string
          created_at?: string
          id?: string
          title?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "media_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      score: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
