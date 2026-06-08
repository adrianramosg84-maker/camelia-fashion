import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, PaymentConfig, Order } from '../types';

// ─── Productos ────────────────────────────────────────────────────────────────

export function subscribeToProducts(callback: (products: Product[]) => void) {
  const q = query(collection(db, 'products'), orderBy('id', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((d) => d.data() as Product);
    callback(products);
  });
}

export async function saveProduct(product: Product) {
  await setDoc(doc(db, 'products', String(product.id)), product);
}

export async function deleteProduct(id: number) {
  await deleteDoc(doc(db, 'products', String(id)));
}

// ─── Configuración de pagos ───────────────────────────────────────────────────

export async function getPaymentConfig(): Promise<PaymentConfig | null> {
  const snapshot = await getDocs(collection(db, 'config'));
  const configDoc = snapshot.docs.find((d) => d.id === 'payment');
  return configDoc ? (configDoc.data() as PaymentConfig) : null;
}

export async function savePaymentConfig(config: PaymentConfig) {
  await setDoc(doc(db, 'config', 'payment'), config);
}

export function subscribeToPaymentConfig(callback: (config: PaymentConfig | null) => void) {
  return onSnapshot(doc(db, 'config', 'payment'), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as PaymentConfig) : null);
  });
}

// ─── Nombre de colección ──────────────────────────────────────────────────────

export async function saveCollectionName(name: string) {
  await setDoc(doc(db, 'config', 'store'), { collectionName: name });
}

export function subscribeToCollectionName(callback: (name: string) => void) {
  return onSnapshot(doc(db, 'config', 'store'), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().collectionName ?? 'Nueva Colección');
    }
  });
}

// ─── Pedidos ──────────────────────────────────────────────────────────────────

export async function saveOrder(order: Order) {
  await addDoc(collection(db, 'orders'), order);
}

export function subscribeToOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
    callback(orders);
  });
}

export async function deleteOrder(orderId: string) {
  const snapshot = await getDocs(collection(db, 'orders'));
  const docToDelete = snapshot.docs.find((d) => d.data().id === orderId || d.id === orderId);
  if (docToDelete) {
    await deleteDoc(doc(db, 'orders', docToDelete.id));
  }
}

export async function updateOrderStatus(orderId: string, status: 'confirmed' | 'rejected') {
  const snapshot = await getDocs(collection(db, 'orders'));
  const orderDoc = snapshot.docs.find((d) => d.data().id === orderId || d.id === orderId);
  if (orderDoc) {
    await setDoc(doc(db, 'orders', orderDoc.id), { ...orderDoc.data(), status }, { merge: true });
  }
}
