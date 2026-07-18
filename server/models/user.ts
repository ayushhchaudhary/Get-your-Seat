import {Document, model, Schema} from 'mongoose';

export interface IUser extends Document {
name: string;
email: string;
password?: string;  
phone?: string;
role: "user" | "admin" | "owner";
createdAt: Date;
updatedAt: Date;
}

const userSchema = new Schema<IUser>(
   { name: { type: String, required: true,trim: true },
   email: { type: String, required: true, unique: true,trim: true, lowercase: true },
   password: { type: String, required: true,minlength: 6 },
   phone: { type: String,trim: true,minlength: 10, maxlength: 15 },
   role: { type: String, enum: ["user", "admin", "owner"], default: "user" },
},
{timestamps: true}
)
//remove password when converting to JSON
userSchema.set("toJSON", {
   transform: (doc, ret) => {
       delete ret.password;
       return ret;
   },
});

export const User = model<IUser>("User", userSchema);
