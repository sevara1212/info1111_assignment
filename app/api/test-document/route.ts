import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('Adding test document...');
    
    const testDoc = {
      title: "Building Rules and Regulations",
      description: "Important rules and regulations for all residents of Sevara Apartments",
      fileUrl: "/sample-documents/Building_Rules.md",
      fileName: "Building_Rules.md",
      fileSize: 1024,
      fileType: "text/markdown",
      uploadedAt: serverTimestamp(),
      uploadedBy: "system",
      uploaderName: "System Administrator",
      visibility: "public"
    };
    
    const docRef = await addDoc(collection(db, 'documents'), testDoc);
    console.log('Test document added with ID:', docRef.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test document added successfully',
      documentId: docRef.id 
    });
    
  } catch (error: any) {
    console.error('Error adding test document:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code 
    }, { status: 500 });
  }
} 