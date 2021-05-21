export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
  subtotal?: string;
  formattedPrice?: string;
}

export interface Stock {
  id: number;
  amount: number;
}
