import mongoose from 'mongoose';
const productSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
      required: true,
    },
    books: [
      {
        name: {
          type: String,
          required: true,
        },
        author: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },
        summary: {
          type: String,
        },

        publisher: {
          type: String,
          required: true,
        },
        publishedYear: {
          type: Number,
          required: true,
        },
        availableCopies: {
          type: Number,
          default: 1,
        },
        image: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);

export default Product;
