export interface Provider {
  id: number;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  location: string;
}

export interface Category {
  icon: string;
  name: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
}
