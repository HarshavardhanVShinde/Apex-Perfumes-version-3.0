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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string
          price: number
          original_price: number | null
          images: string[]
          category: string
          type: string
          notes: Json
          longevity: number
          sillage: string
          rating: number
          stock: number
          description: string
          is_new: boolean
          is_best_seller: boolean
          is_on_sale: boolean
          sizes: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          brand: string
          price: number
          original_price?: number | null
          images: string[]
          category: string
          type: string
          notes: Json
          longevity: number
          sillage: string
          rating: number
          stock: number
          description: string
          is_new?: boolean
          is_best_seller?: boolean
          is_on_sale?: boolean
          sizes?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          price?: number
          original_price?: number | null
          images?: string[]
          category?: string
          type?: string
          notes?: Json
          longevity?: number
          sillage?: string
          rating?: number
          stock?: number
          description?: string
          is_new?: boolean
          is_best_seller?: boolean
          is_on_sale?: boolean
          sizes?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: string
          shipping_address: Json
          payment_method: string
          payment_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: string
          shipping_address: Json
          payment_method: string
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: string
          shipping_address?: Json
          payment_method?: string
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          selected_size: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          selected_size?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          selected_size?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      cart_items_view: {
        Row: {
          id: string | null
          user_id: string | null
          product_id: string | null
          quantity: number | null
          selected_size: string | null
          product_name: string | null
          product_price: number | null
          product_images: string[] | null
          size_price: number | null
          total_price: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      upsert_cart_item: {
        Args: {
          p_user_id: string
          p_product_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      upsert_cart_item_with_size: {
        Args: {
          p_user_id: string
          p_product_id: string
          p_quantity: number
          p_selected_size: string
        }
        Returns: undefined
      }
      remove_cart_item: {
        Args: {
          p_user_id: string
          p_product_id: string
        }
        Returns: undefined
      }
      remove_cart_item_with_size: {
        Args: {
          p_user_id: string
          p_product_id: string
          p_selected_size: string
        }
        Returns: undefined
      }
      set_cart_item_quantity: {
        Args: {
          p_user_id: string
          p_product_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      set_cart_item_quantity_with_size: {
        Args: {
          p_user_id: string
          p_product_id: string
          p_quantity: number
          p_selected_size: string
        }
        Returns: undefined
      }
      clear_cart: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      update_product_stock: {
        Args: {
          product_id: string
          quantity_sold: number
        }
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