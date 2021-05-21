import { createContext, ReactNode, useContext, useState } from 'react';

import { toast } from 'react-toastify';

import { api } from '../services/api';
import { setCart as setCartStorage, getCart } from '../services/storage';
import { Product, Stock } from '../types';

export interface IProduct {
  id: number;
  title: string;
  price: number;
  image: string;
}
interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = getCart();

    if (storagedCart) {
      return storagedCart;
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];

      const foundProduct = updatedCart.find(product => product.id === productId);
      const currentAmount = foundProduct ? foundProduct?.amount : 0;
      const amount = currentAmount + 1;

      const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');

        return;
      }

      if (foundProduct) {
        foundProduct.amount = amount;
      } else {
        const { data: product } = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product,
          amount: 1,
        };

        updatedCart.push(newProduct);
      }

      setCart(updatedCart);
      setCartStorage(updatedCart);
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];

      const foundProduct = updatedCart.findIndex(product => product.id === productId);

      if (foundProduct <= -1) {
        toast.error('Erro na remoção do produto');

        return;
      }

      updatedCart.splice(foundProduct, 1);

      setCart(updatedCart);
      setCartStorage(updatedCart);
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updatedCart = [...cart];

      const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

      if (amount <= 0) {
        return;
      }

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');

        return;
      }

      const productFound = updatedCart.findIndex(product => product.id === productId);

      if (productFound <= -1) return;

      updatedCart[productFound].amount = amount;

      setCart(updatedCart);
      setCartStorage(updatedCart);
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
