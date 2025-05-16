export interface Review {
  id: string;
  title: string;
  website: string;
  summary: string;
  rating: number; // 1-10
  country: string; // 2 chars
  locality: string; // town, city, village, etc. name
  state: string; // province, region, county or state
  email?: string;
  phone?: string;
  positives: string[];
  negatives: string[];
  extra_info?: object;
  user_id: string;
}
