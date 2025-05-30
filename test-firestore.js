const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAArN-80v0fx8q4cLM_u3bbU7YK5y4wz6Q",
  authDomain: "strata-91ddf.firebaseapp.com",
  projectId: "strata-91ddf",
  storageBucket: "strata-91ddf.appspot.com",
  messagingSenderId: "726215155701",
  appId: "1:726215155701:web:4ca6122737fc47a4c8cabc",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to get documents collection
    const documentsRef = collection(db, 'documents');
    const snapshot = await getDocs(documentsRef);
    
    console.log('Documents collection size:', snapshot.size);
    console.log('Documents:');
    snapshot.forEach(doc => {
      console.log('- Document ID:', doc.id);
      console.log('  Data:', doc.data());
    });
    
  } catch (error) {
    console.error('Error testing Firestore:', error);
  }
}

testFirestore(); 