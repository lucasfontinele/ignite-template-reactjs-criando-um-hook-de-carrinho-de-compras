import { Product } from '../types';

const ProductsCart = '@RocketShoes:cart';

export const setCart = (cart: Product[]) => {
  localStorage.setItem(ProductsCart, JSON.stringify(cart));
};

export const getCart = (): Product[] => JSON.parse(localStorage.getItem(ProductsCart) ?? '[]');
