export interface Provider {
  id: number;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  location: string;
  professionalTitle?: string;
  services?: string[];
}

export interface Category {
  id?: number;
  icon: string;
  name: string;
  slug?: string;
}

export interface Review {
  id?: number;
  author: string;
  rating: number;
  text: string;
  createdAt?: string;
}

export interface ServiceItem {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
}

export interface PortfolioItem {
  id: number;
  providerId: number;
  imageUrl: string;
  title?: string;
  description?: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

