export interface Database {
  public: {
    Tables: {
      quiz_participants: {
        Row: {
          id: number;
          user_id: string;
          quiz_id: string;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          quiz_id: string;
          score?: number;
        };
        Update: {
          score?: number;
        };
      };
    };
  };
}
