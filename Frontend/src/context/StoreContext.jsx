import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const StoreContext = createContext();

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

export const StoreProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const api = useMemo(() => {
        const instance = axios.create({ baseURL: 'http://localhost:5000' });
        instance.interceptors.request.use((config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        return instance;
    }, [token]);

    // Bootstrap auth from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken && !token) {
            setToken(storedToken);
            setIsAuthenticated(true);
            // Optionally fetch user profile
            api.get('/api/auth/me')
                .then((res) => {
                    if (res.data?.user) setUser(res.data.user);
                })
                .catch(() => {});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cart API helpers
    const fetchCart = async () => {
        if (!isAuthenticated) return;
        const res = await api.get('/api/cart');
        const items = res.data?.items || res.data?.cart?.items || [];
        console.log('Fetched cart items:', items);
        setCartItems(items.map((i) => ({
            cake: i.cake?._id || i.cake,
            quantity: i.quantity,
            price: i.price,
            toppings: i.toppings || [],
            toppingsPrice: i.toppingsPrice || 0,
            totalPrice: i.totalPrice || (i.price * i.quantity),
            product: i.cake?._id ? i.cake : undefined,
            productName: i.cake?.productName || i.cake?.name,
            qty: i.cake?.qty,
            image: i.cake?.image
        })));
    };

    const addToCart = async (cakeId, quantity = 1, toppings = []) => {
        const res = await api.post('/api/cart/add', { cakeId, quantity, toppings });
        const items = res.data?.items || [];
        setCartItems(items.map((i) => ({
            cake: i.cake?._id || i.cake,
            quantity: i.quantity,
            price: i.price,
            toppings: i.toppings || [],
            toppingsPrice: i.toppingsPrice || 0,
            totalPrice: i.totalPrice || (i.price * i.quantity),
            product: i.cake?._id ? i.cake : undefined,
            productName: i.cake?.productName || i.cake?.name,
            qty: i.cake?.qty,
            image: i.cake?.image
        })));
    };

    const updateQuantity = async (cakeId, quantity) => {
        const res = await api.put('/api/cart/update', { cakeId, quantity });
        const items = res.data?.items || [];
        setCartItems(items.map((i) => ({
            cake: i.cake?._id || i.cake,
            quantity: i.quantity,
            price: i.price,
            toppings: i.toppings || [],
            toppingsPrice: i.toppingsPrice || 0,
            totalPrice: i.totalPrice || (i.price * i.quantity),
            product: i.cake?._id ? i.cake : undefined,
            productName: i.cake?.productName || i.cake?.name,
            qty: i.cake?.qty,
            image: i.cake?.image
        })));
    };

    const removeFromCart = async (cakeId) => {
        const res = await api.delete('/api/cart/remove', { data: { cakeId } });
        const items = res.data?.items || [];
        setCartItems(items.map((i) => ({
            cake: i.cake?._id || i.cake,
            quantity: i.quantity,
            price: i.price,
            toppings: i.toppings || [],
            toppingsPrice: i.toppingsPrice || 0,
            totalPrice: i.totalPrice || (i.price * i.quantity),
            product: i.cake?._id ? i.cake : undefined,
            productName: i.cake?.productName || i.cake?.name,
            qty: i.cake?.qty,
            image: i.cake?.image
        })));
    };

    const clearCart = async () => {
        // Optional: implement a clear endpoint in future; for now, remove each item
        setCartItems([]);
    };

    const login = (userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);
        setIsAuthenticated(true);
        localStorage.setItem('accessToken', accessToken);
        fetchCart().catch(() => {});
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
        setCartItems([]);
        localStorage.removeItem('accessToken');
    };

    const value = {
        cartItems,
        user,
        token,
        isAuthenticated,
        setToken,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        login,
        logout
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};

export { StoreContext };
