import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// In AI Studio, the config is usually in firebase-applet-config.json
const dummyConfig = {
  apiKey: "dummy",
  authDomain: "dummy.firebaseapp.com",
  projectId: "dummy",
  storageBucket: "dummy.appspot.com",
  messagingSenderId: "dummy",
  appId: "dummy"
};

// We initialize with a placeholder first to avoid crashing on load
const app = getApps().length === 0 ? initializeApp(dummyConfig) : getApp();
export const db = getFirestore(app);

export let isFirebaseConfigured = false;

// Attempt to load the real config and potentially notify the app
// Note: In this environment, we usually expect the file to be present if configured.
// For now, we'll try to detect it to set the flag.
async function initFirebase() {
  try {
    const configResponse = await fetch('/firebase-applet-config.json');
    if (configResponse.ok) {
      const config = await configResponse.json();
      if (config && config.apiKey && config.apiKey !== 'dummy') {
        isFirebaseConfigured = true;
        // In a real app, you might want to re-initialize or provide a provider
        // for the real DB instance. Here we keep it simple for the demo.
      }
    }
  } catch (e) {
    // Ignore fetch errors
  }
}

initFirebase();

// Connectivity check placeholder
async function testConnection() {
  if (!isFirebaseConfigured) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
