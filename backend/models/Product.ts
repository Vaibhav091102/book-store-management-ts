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
          require: true,
        },
        author: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          require: true,
        },
        summary: {
          type: String,
        },

        publisher: {
          type: String,
          require: true,
        },
        publishedYear: {
          type: Number,
          require: true,
        },
        availableCopies: {
          type: Number,
          default: 1,
        },
        image: {
          type: String,
          require: true,
        },
      },
    ],
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);

export default Product;
