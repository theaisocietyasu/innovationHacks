import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegistration extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  school: string;
  levelOfStudy: string;
  yearOfStudy?: string;
  gender: string;
  raceEthnicity: string;
  countryOfResidence: string;
  linkedinUrl?: string;
  githubUrl: string;
  resumeUrl: string;
  resumeFileName: string;
  mlhCodeOfConduct: boolean;
  mlhDataSharing: boolean;
  mlhEmailConsent: boolean;
  registeredAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 16, max: 99 },
  school: { type: String, required: true, trim: true },
  levelOfStudy: {
    type: String,
    required: true,
    enum: [
      'Less than Secondary / High School',
      'Secondary / High School',
      'Undergraduate University (2 year - community college or similar)',
      'Undergraduate University (3+ year)',
      'Graduate University (Masters, Professional, Doctoral, etc)',
      'Code School / Bootcamp',
      'Other Vocational / Trade Program or Apprenticeship',
      'Post Doctorate',
      'Other',
      "I'm not currently a student",
      'Prefer not to answer',
    ],
  },
  yearOfStudy: { type: String, trim: true },
  gender: { type: String, required: true, trim: true },
  raceEthnicity: { type: String, required: true, trim: true },
  countryOfResidence: { type: String, required: true, trim: true },
  linkedinUrl: { type: String, required: false, trim: true },
  githubUrl: { type: String, required: true, trim: true },
  resumeUrl: { type: String, trim: true, required: true },
  resumeFileName: { type: String, trim: true, required: true },
  mlhCodeOfConduct: { type: Boolean, required: true },
  mlhDataSharing: { type: Boolean, required: true },
  mlhEmailConsent: { type: Boolean, required: true },
  registeredAt: { type: Date, default: Date.now },
});

const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default Registration;
