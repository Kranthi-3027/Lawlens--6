
import { 
    doc, 
    getDoc, 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase.ts";
import type { ChatSession } from "../types";

export const getChats = async (userId: string): Promise<Map<string, ChatSession>> => {
    const chatsCollection = collection(db, `users/${userId}/chats`);
    const querySnapshot = await getDocs(chatsCollection);
    const chats = new Map<string, ChatSession>();
    querySnapshot.forEach(doc => {
        const data = doc.data();
        chats.set(doc.id, { 
            id: doc.id, 
            ...data, 
            createdAt: data.createdAt?.toDate() // Convert Firestore timestamp to Date
        } as ChatSession);
    });
    return chats;
};

export const getChat = async (userId: string, chatId: string): Promise<ChatSession | null> => {
    const chatDoc = doc(db, `users/${userId}/chats`, chatId);
    const docSnap = await getDoc(chatDoc);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data, 
            createdAt: data.createdAt?.toDate() 
        } as ChatSession;
    }
    return null;
};

export const addChat = async (userId: string, newChat: Omit<ChatSession, 'id' | 'createdAt'>): Promise<string> => {
    const chatsCollection = collection(db, `users/${userId}/chats`);
    const docRef = await addDoc(chatsCollection, {
        ...newChat,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const updateChat = async (userId: string, chatId: string, updates: Partial<ChatSession>): Promise<void> => {
    const chatDoc = doc(db, `users/${userId}/chats`, chatId);
    await updateDoc(chatDoc, updates);
};

export const deleteChat = async (userId: string, chatId: string): Promise<void> => {
    const chatDoc = doc(db, `users/${userId}/chats`, chatId);
    await deleteDoc(chatDoc);
};

// User profile functions
export const getUserProfile = async (userId: string): Promise<{ hasAcceptedTerms: boolean } | null> => {
    const userDoc = doc(db, `users/${userId}`);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
        return docSnap.data() as { hasAcceptedTerms: boolean };
    }
    return null;
};

export const setTermsAccepted = async (userId: string): Promise<void> => {
    const userDoc = doc(db, `users/${userId}`);
    await updateDoc(userDoc, {
        hasAcceptedTerms: true,
        termsAcceptedAt: serverTimestamp()
    }).catch(async () => {
        // If document doesn't exist, create it
        const { setDoc } = await import('firebase/firestore');
        await setDoc(userDoc, {
            hasAcceptedTerms: true,
            termsAcceptedAt: serverTimestamp()
        });
    });
};
