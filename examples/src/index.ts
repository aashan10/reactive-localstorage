import {createLocalStorageStore, watch} from '../../dist';

type CartItem = {
    id: number;
    quantity: number;
};

const [cart, setCart] = createLocalStorageStore<Array<CartItem>>('cart', []);

const countCart = () => {
    let count = 0;
    cart().map(i => count += i.quantity);
    return count;
}

watch(() => {

    const items = countCart();

    const cartItemSpan = document.querySelectorAll('[data-cart-count]');
    cartItemSpan.forEach((item: Element, _, __) => {
        // @ts-ignore
        item.innerText = items.toString();
    });
});
