// API Response Types
export interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  yearsOfExperience: number;
  address?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  historyOfSurgery?: string;
  historyOfIllness?: string[];
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Consultation {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  currentIllnessHistory: string;
  recentSurgery?: string;
  surgeryTimeSpan?: string;
  familyMedicalHistory: {
    diabetics: 'Diabetics' | 'Non-Diabetics';
    allergies?: string;
    others?: string;
  };
  transactionId: string;
  paymentStatus: 'pending' | 'completed';
  status: 'pending' | 'prescribed' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  _id: string;
  consultation: Consultation;
  doctor: Doctor;
  patient: Patient;
  careToBeTaken: string;
  medicines?: string;
  pdfPath?: string;
  status: 'draft' | 'sent';
  createdAt: string;
  updatedAt: string;
}

