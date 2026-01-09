const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const migrateCartData = async () => {
  try {
    // Update all cart items to use 'quantity' instead of 'qty'
    const result = await mongoose.connection.db.collection('carts').updateMany(
      { "items.qty": { $exists: true } },
      [
        {
          $set: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  product: "$$item.product",
                  quantity: "$$item.qty",
                  _id: "$$item._id"
                }
              }
            }
          }
        }
      ]
    );
    
    console.log('Migration completed:', result);
    console.log('Matched documents:', result.matchedCount);
    console.log('Modified documents:', result.modifiedCount);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runMigration = async () => {
  await connectDB();
  await migrateCartData();
};

runMigration();
