const mongoose = require('mongoose')

// ── DB Config ──────────────────────────────────────────────
const MONGO_URI = 'mongodb+srv://mitrajsinh9:SVGtIaiqDT9chkTn@jwelcluster.xamohdt.mongodb.net/jwelleryDB'

// ── Schemas ────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  stock:       { type: Number, default: 0 },
  images:      [{ type: String }],
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true })

const Category = mongoose.model('Category', categorySchema)
const Product   = mongoose.model('Product', productSchema)

// ── Seed Data ──────────────────────────────────────────────
const CATEGORIES = [
  'Rings',
  'Necklaces',
  'Bracelets',
  'Earrings',
  'Watches',
]

// 2 products per category → 10 total
const PRODUCTS_BY_CATEGORY = {
  Rings: [
    {
      name: 'Diamond Solitaire Ring',
      description: 'Classic 18k white gold ring with a brilliant-cut 1ct diamond center stone. Perfect for engagements or everyday elegance.',
      price: 1299.99,
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
        'https://images.unsplash.com/photo-1586878341523-7ff7b9d71c22?w=400',
      ],
    },
    {
      name: 'Rose Gold Band',
      description: 'Minimalist 14k rose gold stacking band with a matte finish. Pairs beautifully with any engagement ring.',
      price: 349.99,
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      ],
    },
  ],
  Necklaces: [
    {
      name: 'Pearl Pendant Necklace',
      description: 'Lustrous freshwater pearl drop on a delicate 925 sterling silver chain, 18 inches in length.',
      price: 199.99,
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400',
      ],
    },
    {
      name: 'Gold Layered Chain',
      description: '14k gold-filled triple layered chain necklace. Adjustable lengths of 16", 18", and 20". Tarnish resistant.',
      price: 449.99,
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
      ],
    },
  ],
  Bracelets: [
    {
      name: 'Tennis Bracelet',
      description: 'Elegant 925 sterling silver bracelet adorned with 3ct total weight channel-set cubic zirconia stones.',
      price: 599.99,
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1573408301185-9519f94815b9?w=400',
      ],
    },
    {
      name: 'Beaded Lapis Bracelet',
      description: 'Natural lapis lazuli beads strung on elastic cord. 8mm beads, fits most wrists. Promotes calm and clarity.',
      price: 89.99,
      stock: 60,
      images: [
        'https://images.unsplash.com/photo-1601121141461-9d6647bef0ef?w=400',
      ],
    },
  ],
  Earrings: [
    {
      name: 'Diamond Stud Earrings',
      description: '0.5ct total weight round brilliant diamonds set in 18k white gold with secure screw backs.',
      price: 799.99,
      stock: 18,
      images: [
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400',
      ],
    },
    {
      name: 'Gold Hoop Earrings',
      description: 'Classic 14k gold 30mm hoops with a polished finish. Lightweight and comfortable for all-day wear.',
      price: 279.99,
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1588444650733-d0e5085cc773?w=400',
      ],
    },
  ],
  Watches: [
    {
      name: 'Rose Gold Minimalist Watch',
      description: 'Slim quartz watch with a rose gold case, white dial, and genuine leather strap. 3ATM water resistant.',
      price: 899.99,
      stock: 10,
      images: [
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
      ],
    },
    {
      name: 'Silver Mesh Band Watch',
      description: 'Swiss-movement timepiece with a stainless steel mesh bracelet and sapphire crystal glass. 5ATM water resistant.',
      price: 1199.99,
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
      ],
    },
  ],
}

// ── Runner ─────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅  Connected to MongoDB:', MONGO_URI)

    // Optional: wipe existing data
    await Product.deleteMany({})
    await Category.deleteMany({})
    console.log('🗑️   Cleared existing products and categories')

    // Insert categories
    const categoryDocs = await Category.insertMany(
      CATEGORIES.map(name => ({ name }))
    )
    console.log(`📁  Inserted ${categoryDocs.length} categories`)

    // Build a name → _id map
    const categoryMap = {}
    categoryDocs.forEach(doc => { categoryMap[doc.name] = doc._id })

    // Insert products
    const productsToInsert = []
    for (const [catName, items] of Object.entries(PRODUCTS_BY_CATEGORY)) {
      const categoryId = categoryMap[catName]
      items.forEach(item => {
        productsToInsert.push({ ...item, category: categoryId })
      })
    }

    const productDocs = await Product.insertMany(productsToInsert)
    console.log(`💎  Inserted ${productDocs.length} products`)

    // Summary
    console.log('\n── Seed Summary ────────────────────────────')
    for (const cat of categoryDocs) {
      const count = productsToInsert.filter(
        p => p.category.toString() === cat._id.toString()
      ).length
      console.log(`  ${cat.name}: ${count} product(s)`)
    }
    console.log('────────────────────────────────────────────\n')

  } catch (err) {
    console.error('❌  Seed failed:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌  Disconnected from MongoDB')
  }
}

seed()
