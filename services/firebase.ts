import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User, setPersistence, browserSessionPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDFDkTgrM5DDEJscn88gjB46FESnvT7TSs",
  authDomain: "family-bingo-live.firebaseapp.com",
  projectId: "family-bingo-live",
  storageBucket: "family-bingo-live.appspot.com",
  messagingSenderId: "380396556801",
  appId: "1:380396556801:web:616c5a7bd7a93807d62600"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

// Set persistence to session before any auth operations.
// This ensures that each browser tab has its own auth session,
// allowing for easy multiplayer testing.
setPersistence(auth, browserSessionPersistence)
    .catch((error) => {
        console.error("Could not set auth persistence:", error);
    });

let authPromise: Promise<User> | null = null;

/**
 * Gets the current Firebase user. If no user is signed in,
 * it will anonymously sign them in and return the new user.
 * This function is resilient and will retry on subsequent calls if it fails.
 */
export const getCurrentUser = (): Promise<User> => {
    if (!authPromise) {
        authPromise = new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, user => {
                unsubscribe();
                if (user) {
                    resolve(user);
                } else {
                    signInAnonymously(auth)
                        .then(credential => resolve(credential.user))
                        .catch(err => {
                            authPromise = null; // Reset on failure to allow retry
                            reject(err);
                        });
                }
            }, err => {
                authPromise = null; // Reset on failure
                reject(err);
            });
        });
    }
    return authPromise;
};

export { firestore, auth };