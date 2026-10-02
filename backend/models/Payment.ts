import mongoose, {
    type HydratedDocument,
    type Model,
    type Types,
} from "mongoose";

export interface PaymentRecord {
  user: Types.ObjectId;
  packageId: string;
  creditsPurchased: number;
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  status: "created" | "paid" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentClient {
  id: string;
  packageId: string;
  creditsPurchased: number;
  amount: number;
  currency: string;
  status: PaymentRecord["status"];
  createdAt?: Date;
}

interface PaymentMethods {
  toClient(): PaymentClient;
}

interface PaymentModel extends Model<PaymentRecord, {}, PaymentMethods> {}

export type PaymentDocument = HydratedDocument<PaymentRecord, PaymentMethods>;

const paymentSchema = new mongoose.Schema<PaymentRecord, PaymentModel, PaymentMethods>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    packageId: { type: String, required: true },
    creditsPurchased: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd" },
    stripeSessionId: { type: String, required: true, index: true },
    stripePaymentIntentId: { type: String, default: null },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
  },
  { timestamps: true },
);

// Returns a safe payment object for the frontend without internal Stripe fields.
paymentSchema.methods.toClient = function (this: PaymentDocument): PaymentClient {
  return {
    id: this._id.toString(),
    packageId: this.packageId,
    creditsPurchased: this.creditsPurchased,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    createdAt: this.createdAt,
  };
};

export const Payment = mongoose.model<PaymentRecord, PaymentModel>(
  "Payment",
  paymentSchema,
);
