/**
 * Production Seed Script for gomigomi
 *
 * Seeds comprehensive demo data including:
 * - 10 categories
 * - 8 demo users with addresses
 * - 42+ lotteries across all categories (ACTIVE, SCHEDULED, COMPLETED)
 * - Entries with varied point amounts
 * - Point transactions maintaining consistency
 * - Notifications for lottery events
 *
 * Run with: npx prisma db seed
 *
 * Demo login: any @demo.com email with password "DemoPass123!"
 */

import "dotenv/config";
import {
  PrismaClient,
  ItemCondition,
  LotteryStatus,
  PointTransactionType,
  NotificationType,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// ========================================
// CONFIGURATION
// ========================================

const DEMO_PASSWORD = "DemoPass123!";
const DEMO_EMAIL_SUFFIX = "@demo.com";

// ========================================
// HELPER FUNCTIONS
// ========================================

function generateProductImage(
  category: string,
  index: number,
  variant = 0
): string {
  return `https://picsum.photos/seed/${category}-${index}-${variant}/800/600`;
}

function generateAvatar(name: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0); // Normalize to noon
  return date;
}

function hoursFromNow(hours: number): Date {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date;
}

// ========================================
// DATA DEFINITIONS
// ========================================

const categories = [
  { name: "Electronics", slug: "electronics", icon: "laptop" },
  { name: "Clothing & Fashion", slug: "clothing", icon: "shirt" },
  { name: "Home & Garden", slug: "home-garden", icon: "home" },
  { name: "Sports & Outdoors", slug: "sports", icon: "dumbbell" },
  { name: "Books & Media", slug: "books", icon: "book" },
  { name: "Toys & Games", slug: "toys-games", icon: "gamepad-2" },
  { name: "Collectibles & Art", slug: "collectibles", icon: "trophy" },
  { name: "Jewelry & Accessories", slug: "jewelry", icon: "gem" },
  { name: "Musical Instruments", slug: "music", icon: "music" },
  { name: "Other", slug: "other", icon: "box" },
];

interface SampleUser {
  email: string;
  name: string;
}

const sampleUsers: SampleUser[] = [
  { email: "alice@demo.com", name: "Alice Chen" },
  { email: "bob@demo.com", name: "Bob Martinez" },
  { email: "carol@demo.com", name: "Carol Wilson" },
  { email: "david@demo.com", name: "David Kim" },
  { email: "emma@demo.com", name: "Emma Johnson" },
  { email: "frank@demo.com", name: "Frank Brown" },
  { email: "grace@demo.com", name: "Grace Lee" },
  { email: "henry@demo.com", name: "Henry Davis" },
];

interface SampleAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
  isDefault: boolean;
}

const userAddresses: Record<string, SampleAddress[]> = {
  "alice@demo.com": [
    {
      name: "Alice Chen",
      street: "123 Tech Boulevard, Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      phone: "415-555-0101",
      isDefault: true,
    },
  ],
  "bob@demo.com": [
    {
      name: "Bob Martinez",
      street: "456 Oak Street",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      phone: "512-555-0202",
      isDefault: true,
    },
    {
      name: "Bob Martinez (Work)",
      street: "789 Congress Ave, Suite 200",
      city: "Austin",
      state: "TX",
      postalCode: "78702",
      isDefault: false,
    },
  ],
  "carol@demo.com": [
    {
      name: "Carol Wilson",
      street: "321 Pine Avenue",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      phone: "206-555-0303",
      isDefault: true,
    },
  ],
  "david@demo.com": [
    {
      name: "David Kim",
      street: "555 Broadway, Unit 12A",
      city: "New York",
      state: "NY",
      postalCode: "10012",
      phone: "212-555-0404",
      isDefault: true,
    },
  ],
  "emma@demo.com": [
    {
      name: "Emma Johnson",
      street: "888 Sunset Boulevard",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90028",
      phone: "323-555-0505",
      isDefault: true,
    },
  ],
  "frank@demo.com": [
    {
      name: "Frank Brown",
      street: "777 Lake Shore Drive",
      city: "Chicago",
      state: "IL",
      postalCode: "60611",
      phone: "312-555-0606",
      isDefault: true,
    },
  ],
  "grace@demo.com": [
    {
      name: "Grace Lee",
      street: "999 Peachtree Street NE",
      city: "Atlanta",
      state: "GA",
      postalCode: "30309",
      phone: "404-555-0707",
      isDefault: true,
    },
  ],
  "henry@demo.com": [
    {
      name: "Henry Davis",
      street: "111 Main Street",
      city: "Denver",
      state: "CO",
      postalCode: "80202",
      phone: "303-555-0808",
      isDefault: true,
    },
  ],
};

interface LotteryTemplate {
  title: string;
  description: string;
  condition: ItemCondition;
  pointsPerEntry: number;
  maxParticipants: number | null;
  status: LotteryStatus;
  startDaysOffset: number;
  endDaysOffset: number;
  imageCount: number;
  creatorEmail: string;
}

const lotteryTemplates: Record<string, LotteryTemplate[]> = {
  electronics: [
    {
      title: "Vintage Sony Walkman WM-D6C",
      description:
        "Professional portable cassette player from 1984. This is the legendary recording Walkman that audiophiles dream about. Includes original leather case and headphones. Battery compartment clean, no corrosion. Dolby B/C noise reduction working perfectly. Recently serviced with new belts. A true piece of audio history!",
      condition: "GOOD",
      pointsPerEntry: 25,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 3,
      imageCount: 2,
      creatorEmail: "alice@demo.com",
    },
    {
      title: "Nintendo Game Boy Color - Atomic Purple",
      description:
        "The iconic transparent purple Game Boy Color from 1998. Screen has minor scratches but perfectly playable. Includes Pokemon Yellow cartridge with working save battery. All buttons responsive, speaker works great. A piece of gaming history perfect for collectors or players!",
      condition: "LIKE_NEW",
      pointsPerEntry: 15,
      maxParticipants: 20,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 5,
      imageCount: 2,
      creatorEmail: "frank@demo.com",
    },
    {
      title: "Canon AE-1 Film Camera with 50mm Lens",
      description:
        "Classic 35mm SLR camera from 1976. This camera started the photography revolution. Light meter works accurately, shutter speeds tested. Includes Canon FD 50mm f/1.8 lens with clear glass. Perfect for learning film photography or adding to your collection.",
      condition: "GOOD",
      pointsPerEntry: 20,
      maxParticipants: null,
      status: "SCHEDULED",
      startDaysOffset: 2,
      endDaysOffset: 9,
      imageCount: 3,
      creatorEmail: "alice@demo.com",
    },
    {
      title: "Apple iPod Classic 160GB - Final Generation",
      description:
        "The last iPod Classic ever made (7th gen, 2009). 160GB storage holds your entire music library. Battery holds charge for 30+ hours. Some light scratches on back but screen is flawless. Includes original sync cable. These are becoming rare collectors items!",
      condition: "LIKE_NEW",
      pointsPerEntry: 30,
      maxParticipants: null,
      status: "COMPLETED",
      startDaysOffset: -10,
      endDaysOffset: -3,
      imageCount: 2,
      creatorEmail: "carol@demo.com",
    },
  ],
  clothing: [
    {
      title: "Vintage Levi's 501 Original Fit Jeans",
      description:
        "Authentic 1990s Levi's 501 jeans made in USA. Size 32x32. Beautiful fading and whiskering from actual wear - you can't replicate this patina. No holes or tears, all buttons intact. These vintage 501s are getting harder to find!",
      condition: "GOOD",
      pointsPerEntry: 10,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -3,
      endDaysOffset: 4,
      imageCount: 2,
      creatorEmail: "bob@demo.com",
    },
    {
      title: "Burberry Trench Coat - Classic Honey",
      description:
        "Authentic Burberry Westminster trench coat in honey color. Size Medium. Iconic check lining, all buttons original, belt included. Minor wear on cuffs but overall excellent condition. A timeless investment piece that never goes out of style.",
      condition: "LIKE_NEW",
      pointsPerEntry: 50,
      maxParticipants: 15,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 6,
      imageCount: 3,
      creatorEmail: "carol@demo.com",
    },
    {
      title: "Rare Supreme Box Logo Hoodie - Navy",
      description:
        "Supreme FW17 Box Logo Hoodie in Navy. Size Large. Purchased directly from Supreme NY store. Worn maybe 5 times, washed once. No fading, no cracking on the logo. Includes original bag and receipt. Hypebeast grail alert!",
      condition: "LIKE_NEW",
      pointsPerEntry: 35,
      maxParticipants: null,
      status: "SCHEDULED",
      startDaysOffset: 1,
      endDaysOffset: 8,
      imageCount: 2,
      creatorEmail: "david@demo.com",
    },
    {
      title: "Vintage Band T-Shirt Collection (5 Shirts)",
      description:
        "Collection of 5 authentic vintage band tees from the 80s and 90s. Includes: Nirvana (1992), Metallica (1988), Pink Floyd (1987), Led Zeppelin (1979), and The Rolling Stones (1989). All size L. Some fading adds to the authentic vintage look.",
      condition: "FAIR",
      pointsPerEntry: 15,
      maxParticipants: null,
      status: "COMPLETED",
      startDaysOffset: -14,
      endDaysOffset: -7,
      imageCount: 2,
      creatorEmail: "frank@demo.com",
    },
  ],
  "home-garden": [
    {
      title: "Mid-Century Modern Eames Lounge Chair Replica",
      description:
        "High-quality replica of the iconic Eames lounge chair and ottoman. Black leather with walnut veneer. Incredibly comfortable and stylish. Some minor scuffs on the leather but structurally perfect. A statement piece for any living room.",
      condition: "GOOD",
      pointsPerEntry: 40,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 5,
      imageCount: 3,
      creatorEmail: "alice@demo.com",
    },
    {
      title: "Le Creuset Dutch Oven 7.25 Qt - Flame Orange",
      description:
        "Classic Le Creuset enameled cast iron Dutch oven in the iconic Flame (orange) color. 7.25 quart capacity. Light wear marks on bottom but enamel interior is flawless. Cooks beautifully. These last generations!",
      condition: "LIKE_NEW",
      pointsPerEntry: 20,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 4,
      imageCount: 2,
      creatorEmail: "emma@demo.com",
    },
    {
      title: "Vintage Persian Rug - Hand Knotted",
      description:
        "Authentic hand-knotted Persian rug from Isfahan. Approximately 6x9 feet. Rich reds, blues, and ivory in traditional medallion pattern. Some wear consistent with age (estimated 1960s) but no holes or major damage. Adds warmth to any room.",
      condition: "GOOD",
      pointsPerEntry: 45,
      maxParticipants: 10,
      status: "SCHEDULED",
      startDaysOffset: 3,
      endDaysOffset: 10,
      imageCount: 2,
      creatorEmail: "carol@demo.com",
    },
    {
      title: "KitchenAid Stand Mixer - Empire Red",
      description:
        "KitchenAid Artisan 5-quart stand mixer in Empire Red. Includes paddle, dough hook, and wire whip. Used maybe a dozen times - we just don't bake enough! Works perfectly, looks gorgeous on any counter.",
      condition: "LIKE_NEW",
      pointsPerEntry: 25,
      maxParticipants: null,
      status: "COMPLETED",
      startDaysOffset: -12,
      endDaysOffset: -5,
      imageCount: 2,
      creatorEmail: "bob@demo.com",
    },
  ],
  sports: [
    {
      title: "Vintage Wilson Pro Staff 85 Tennis Racket",
      description:
        "The legendary racket used by Pete Sampras. Original Pro Staff 85 from early 1990s. Grip recently replaced. Some paint chips but frame is solid. A collectors dream or actually playable if you have the skills!",
      condition: "GOOD",
      pointsPerEntry: 15,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 5,
      imageCount: 2,
      creatorEmail: "frank@demo.com",
    },
    {
      title: "Complete Camping Set - 4 Person",
      description:
        "Everything you need for camping: 4-person REI tent (2021), 2 sleeping bags (rated to 20°F), 2 sleeping pads, camp stove with fuel, cookware set, and lantern. Used on 3 trips total. Selling as a set only.",
      condition: "LIKE_NEW",
      pointsPerEntry: 30,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 6,
      imageCount: 3,
      creatorEmail: "david@demo.com",
    },
    {
      title: "Peloton Bike (Original) with Mat and Weights",
      description:
        "Original Peloton bike in excellent condition. Less than 200 rides on it. Includes Peloton mat and 2lb/3lb weight set. Screen works perfectly. We moved and it doesn't fit in our new place. Local pickup preferred but can arrange shipping.",
      condition: "LIKE_NEW",
      pointsPerEntry: 55,
      maxParticipants: 8,
      status: "SCHEDULED",
      startDaysOffset: 2,
      endDaysOffset: 9,
      imageCount: 2,
      creatorEmail: "alice@demo.com",
    },
    {
      title: "Vintage Schwinn Stingray Bicycle",
      description:
        "1970s Schwinn Stingray in original condition. Classic banana seat, sissy bar, and high-rise handlebars. Some surface rust but rides great. A nostalgic piece of Americana!",
      condition: "FAIR",
      pointsPerEntry: 20,
      maxParticipants: null,
      status: "COMPLETED",
      startDaysOffset: -15,
      endDaysOffset: -8,
      imageCount: 2,
      creatorEmail: "henry@demo.com",
    },
  ],
  books: [
    {
      title: "First Edition Harry Potter Collection (UK)",
      description:
        "Complete set of UK first edition Harry Potter books (Bloomsbury). Not first printings but still early editions. All in very good condition with dust jackets. A magical collection for any Potter fan!",
      condition: "GOOD",
      pointsPerEntry: 35,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 5,
      imageCount: 2,
      creatorEmail: "emma@demo.com",
    },
    {
      title: "Vintage National Geographic Collection 1960-1980",
      description:
        "Box of 50+ National Geographic magazines from 1960-1980. Amazing photography and articles from the golden age of the magazine. Some covers have minor wear but all complete with maps. Great for collage art or reading!",
      condition: "FAIR",
      pointsPerEntry: 8,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -3,
      endDaysOffset: 4,
      imageCount: 2,
      creatorEmail: "bob@demo.com",
    },
    {
      title: "Signed Stephen King - The Shining",
      description:
        "Signed copy of The Shining by Stephen King. Later printing but authentically signed at a book signing in 2010. Includes photo from the signing. Book is in excellent condition, signature is clean and clear.",
      condition: "LIKE_NEW",
      pointsPerEntry: 40,
      maxParticipants: 12,
      status: "SCHEDULED",
      startDaysOffset: 1,
      endDaysOffset: 8,
      imageCount: 2,
      creatorEmail: "carol@demo.com",
    },
    {
      title: "Criterion Collection Blu-rays (20 Films)",
      description:
        "Collection of 20 Criterion Collection Blu-rays. Includes classics like Seven Samurai, 8½, The 400 Blows, and more. All discs play perfectly, cases have minimal shelf wear. List of titles available on request.",
      condition: "LIKE_NEW",
      pointsPerEntry: 25,
      maxParticipants: null,
      status: "COMPLETED",
      startDaysOffset: -11,
      endDaysOffset: -4,
      imageCount: 2,
      creatorEmail: "frank@demo.com",
    },
  ],
  "toys-games": [
    {
      title: "Complete LEGO Star Wars Millennium Falcon (75192)",
      description:
        "The ultimate LEGO set - 7,541 pieces! Built once, displayed in a glass case, now carefully disassembled. All pieces accounted for, includes minifigures and instructions. Original box included but has some wear.",
      condition: "LIKE_NEW",
      pointsPerEntry: 60,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 7,
      imageCount: 3,
      creatorEmail: "david@demo.com",
    },
    {
      title: "Vintage 1980s Transformers Collection",
      description:
        "Collection of G1 Transformers from the 1980s: Optimus Prime, Megatron, Starscream, Soundwave, and Bumblebee. Various conditions - Optimus is complete, others may be missing small parts. No boxes. Great for collectors!",
      condition: "FAIR",
      pointsPerEntry: 25,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 5,
      imageCount: 2,
      creatorEmail: "alice@demo.com",
    },
    {
      title: "Nintendo Switch OLED with Games Bundle",
      description:
        "Nintendo Switch OLED (white) in perfect condition. Includes: Zelda: Tears of the Kingdom, Mario Kart 8, Animal Crossing, and Smash Bros Ultimate. Also includes Pro Controller and carrying case. Used for less than a year.",
      condition: "LIKE_NEW",
      pointsPerEntry: 35,
      maxParticipants: 15,
      status: "SCHEDULED",
      startDaysOffset: 2,
      endDaysOffset: 9,
      imageCount: 2,
      creatorEmail: "bob@demo.com",
    },
    {
      title: "Vintage Board Game Collection",
      description:
        "Collection of vintage board games from the 70s-90s: original Trivial Pursuit, Risk, Clue, Monopoly (1970s), and Battleship. All complete with pieces. Boxes show age but games are all playable. Nostalgia overload!",
      condition: "GOOD",
      pointsPerEntry: 12,
      maxParticipants: null,
      status: "COMPLETED",
      startDaysOffset: -13,
      endDaysOffset: -6,
      imageCount: 2,
      creatorEmail: "emma@demo.com",
    },
  ],
  collectibles: [
    {
      title: "1st Edition Pokemon Cards - Base Set",
      description:
        "Collection of 20 1st Edition Base Set Pokemon cards. No Charizard (sorry!) but includes Blastoise, Venusaur, Alakazam, and others. Cards are in played condition - not PSA 10s but authentic 1999 originals.",
      condition: "GOOD",
      pointsPerEntry: 50,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 6,
      imageCount: 3,
      creatorEmail: "frank@demo.com",
    },
    {
      title: "Vintage Star Wars Action Figures (1977-1983)",
      description:
        "Collection of 15 original Kenner Star Wars figures: Luke, Leia, Han, Vader, Chewie, droids, Stormtroopers, and more. All have wear from being played with in the 80s. No weapons. A piece of movie and toy history!",
      condition: "FAIR",
      pointsPerEntry: 30,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 5,
      imageCount: 2,
      creatorEmail: "david@demo.com",
    },
    {
      title: "Japanese Anime Cels - Studio Ghibli",
      description:
        "Three authentic production cels from various Ghibli films (1990s era). Each is framed and comes with certificate of authenticity. Beautiful collector pieces for any anime fan.",
      condition: "LIKE_NEW",
      pointsPerEntry: 45,
      maxParticipants: 10,
      status: "ACTIVE",
      startDaysOffset: -3,
      endDaysOffset: 4,
      imageCount: 3,
      creatorEmail: "grace@demo.com",
    },
    {
      title: "Funko Pop Collection - Marvel (50 Pops)",
      description:
        "Massive Marvel Funko Pop collection - 50 figures! Includes exclusives and vaulted figures. All in boxes (some box damage). Highlights: Metallic Spider-Man, Glow Thor, and SDCC exclusives. Selling as complete set only.",
      condition: "GOOD",
      pointsPerEntry: 35,
      maxParticipants: null,
      status: "SCHEDULED",
      startDaysOffset: 1,
      endDaysOffset: 8,
      imageCount: 2,
      creatorEmail: "bob@demo.com",
    },
    {
      title: "Signed Baseball Card Collection - Hall of Famers",
      description:
        "10 authenticated signed baseball cards: Mickey Mantle, Willie Mays, Hank Aaron, Ted Williams, and more. All PSA/DNA authenticated. A serious collection for serious collectors.",
      condition: "LIKE_NEW",
      pointsPerEntry: 75,
      maxParticipants: 8,
      status: "COMPLETED",
      startDaysOffset: -16,
      endDaysOffset: -9,
      imageCount: 2,
      creatorEmail: "alice@demo.com",
    },
  ],
  jewelry: [
    {
      title: "Vintage Rolex Oyster Perpetual - 1985",
      description:
        "Rolex Oyster Perpetual Date from 1985. Reference 15000. 34mm case, original jubilee bracelet. Watch has been serviced, runs accurately. Crystal has some scratches, case has normal wear for age. No box or papers.",
      condition: "GOOD",
      pointsPerEntry: 80,
      maxParticipants: 10,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 7,
      imageCount: 3,
      creatorEmail: "carol@demo.com",
    },
    {
      title: "Estate Pearl Necklace - Mikimoto",
      description:
        "Authentic Mikimoto Akoya pearl necklace. 16 inches, 7-7.5mm pearls. Beautiful luster. Includes original Mikimoto box and certification. Estate piece from my grandmother's collection.",
      condition: "LIKE_NEW",
      pointsPerEntry: 55,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 5,
      imageCount: 2,
      creatorEmail: "emma@demo.com",
    },
    {
      title: "Vintage Cartier Love Bracelet",
      description:
        "Cartier Love bracelet in yellow gold. Size 17. Includes screwdriver. Some light scratches from normal wear. No box or papers but authenticity guaranteed. A timeless piece!",
      condition: "GOOD",
      pointsPerEntry: 70,
      maxParticipants: 8,
      status: "SCHEDULED",
      startDaysOffset: 3,
      endDaysOffset: 10,
      imageCount: 2,
      creatorEmail: "alice@demo.com",
    },
    {
      title: "Art Deco Emerald & Diamond Ring",
      description:
        "Stunning Art Deco ring from the 1920s. Center emerald approximately 1 carat surrounded by old European cut diamonds. Platinum setting. Recently appraised at $8,000. A true vintage treasure.",
      condition: "LIKE_NEW",
      pointsPerEntry: 65,
      maxParticipants: null,
      status: "COMPLETED",
      startDaysOffset: -14,
      endDaysOffset: -7,
      imageCount: 2,
      creatorEmail: "grace@demo.com",
    },
  ],
  music: [
    {
      title: "Fender Stratocaster - 1979 Hardtail",
      description:
        "1979 Fender Stratocaster with hardtail bridge. Natural finish showing beautiful wood grain. All original except tuners (upgraded to locking). Plays and sounds incredible. Includes original hardshell case.",
      condition: "GOOD",
      pointsPerEntry: 60,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 6,
      imageCount: 3,
      creatorEmail: "henry@demo.com",
    },
    {
      title: "Vintage Vinyl Record Collection - 200+ Albums",
      description:
        "Collection of 200+ vinyl records spanning rock, jazz, and soul from 60s-80s. Beatles, Stones, Miles Davis, Marvin Gaye, Zeppelin, and many more. Most VG to VG+. No cherry picking - all or nothing!",
      condition: "GOOD",
      pointsPerEntry: 35,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 5,
      imageCount: 2,
      creatorEmail: "frank@demo.com",
    },
    {
      title: "Roland TR-808 Drum Machine",
      description:
        "THE legendary drum machine. Original Roland TR-808 from 1982. Fully functional, recently serviced. Some wear on housing but all buttons and knobs work perfectly. The sound that defined hip-hop!",
      condition: "GOOD",
      pointsPerEntry: 85,
      maxParticipants: 6,
      status: "SCHEDULED",
      startDaysOffset: 2,
      endDaysOffset: 9,
      imageCount: 2,
      creatorEmail: "david@demo.com",
    },
    {
      title: "Yamaha Grand Piano - Model C3",
      description:
        "Yamaha C3 grand piano from 1998. 6'1\" in polished ebony. Maintained annually by professional tech. Some minor scratches on case. Located in Chicago - buyer arranges moving. A professional-quality instrument.",
      condition: "LIKE_NEW",
      pointsPerEntry: 100,
      maxParticipants: 5,
      status: "COMPLETED",
      startDaysOffset: -20,
      endDaysOffset: -13,
      imageCount: 2,
      creatorEmail: "carol@demo.com",
    },
  ],
  other: [
    {
      title: "Dyson V15 Detect Cordless Vacuum",
      description:
        "Top of the line Dyson cordless vacuum with laser dust detection. Used for 6 months, works perfectly. Includes all attachments and wall mount. Battery holds great charge. Cleaning out and downsizing!",
      condition: "LIKE_NEW",
      pointsPerEntry: 25,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -2,
      endDaysOffset: 4,
      imageCount: 2,
      creatorEmail: "bob@demo.com",
    },
    {
      title: "Antique Steamer Trunk - Early 1900s",
      description:
        "Beautiful antique steamer trunk, estimated early 1900s. Wood and metal construction with leather handles. Interior has original paper lining. Some wear consistent with age but structurally solid. Great as decor or storage!",
      condition: "FAIR",
      pointsPerEntry: 18,
      maxParticipants: null,
      status: "ACTIVE",
      startDaysOffset: -1,
      endDaysOffset: 6,
      imageCount: 2,
      creatorEmail: "emma@demo.com",
    },
    {
      title: "DJI Mavic Air 2 Drone Fly More Combo",
      description:
        "DJI Mavic Air 2 with Fly More Combo (3 batteries, ND filters, bag). Flown maybe 10 times. Perfect for beginners or experienced pilots. Includes original box and all accessories. Registered with FAA - will transfer.",
      condition: "LIKE_NEW",
      pointsPerEntry: 30,
      maxParticipants: null,
      status: "SCHEDULED",
      startDaysOffset: 1,
      endDaysOffset: 8,
      imageCount: 2,
      creatorEmail: "alice@demo.com",
    },
    {
      title: "Vintage Polaroid SX-70 Camera",
      description:
        "The iconic Polaroid SX-70 folding camera from 1972. Chrome and tan leather model. Recently CLA'd (cleaned, lubed, adjusted) by a professional. Works perfectly with modern Polaroid film. A beautiful piece of design history!",
      condition: "GOOD",
      pointsPerEntry: 22,
      maxParticipants: null,
      status: "COMPLETED",
      startDaysOffset: -12,
      endDaysOffset: -5,
      imageCount: 2,
      creatorEmail: "frank@demo.com",
    },
  ],
};

// Entry data: specifies who enters which lottery with how many points
interface EntrySpec {
  category: string;
  lotteryIndex: number;
  userEmail: string;
  points: number;
  boosted: boolean; // If true, this is a boost transaction
}

const entrySpecs: EntrySpec[] = [
  // Electronics - Vintage Sony Walkman (index 0) - 3 participants
  {
    category: "electronics",
    lotteryIndex: 0,
    userEmail: "bob@demo.com",
    points: 25,
    boosted: false,
  },
  {
    category: "electronics",
    lotteryIndex: 0,
    userEmail: "carol@demo.com",
    points: 25,
    boosted: false,
  },
  {
    category: "electronics",
    lotteryIndex: 0,
    userEmail: "carol@demo.com",
    points: 25,
    boosted: true,
  }, // Carol boosts to 50
  {
    category: "electronics",
    lotteryIndex: 0,
    userEmail: "david@demo.com",
    points: 25,
    boosted: false,
  },

  // Electronics - Game Boy (index 1) - 2 participants
  {
    category: "electronics",
    lotteryIndex: 1,
    userEmail: "emma@demo.com",
    points: 15,
    boosted: false,
  },
  {
    category: "electronics",
    lotteryIndex: 1,
    userEmail: "grace@demo.com",
    points: 15,
    boosted: false,
  },
  {
    category: "electronics",
    lotteryIndex: 1,
    userEmail: "grace@demo.com",
    points: 15,
    boosted: true,
  }, // Grace boosts to 30

  // Clothing - Levi's (index 0) - 4 participants
  {
    category: "clothing",
    lotteryIndex: 0,
    userEmail: "alice@demo.com",
    points: 10,
    boosted: false,
  },
  {
    category: "clothing",
    lotteryIndex: 0,
    userEmail: "carol@demo.com",
    points: 10,
    boosted: false,
  },
  {
    category: "clothing",
    lotteryIndex: 0,
    userEmail: "david@demo.com",
    points: 10,
    boosted: false,
  },
  {
    category: "clothing",
    lotteryIndex: 0,
    userEmail: "frank@demo.com",
    points: 10,
    boosted: false,
  },

  // Clothing - Burberry (index 1) - 2 participants
  {
    category: "clothing",
    lotteryIndex: 1,
    userEmail: "david@demo.com",
    points: 50,
    boosted: false,
  },
  {
    category: "clothing",
    lotteryIndex: 1,
    userEmail: "alice@demo.com",
    points: 50,
    boosted: false,
  },

  // Home - Eames Chair (index 0) - 3 participants
  {
    category: "home-garden",
    lotteryIndex: 0,
    userEmail: "bob@demo.com",
    points: 40,
    boosted: false,
  },
  {
    category: "home-garden",
    lotteryIndex: 0,
    userEmail: "grace@demo.com",
    points: 40,
    boosted: false,
  },
  {
    category: "home-garden",
    lotteryIndex: 0,
    userEmail: "henry@demo.com",
    points: 40,
    boosted: false,
  },

  // Home - Le Creuset (index 1) - 2 participants
  {
    category: "home-garden",
    lotteryIndex: 1,
    userEmail: "carol@demo.com",
    points: 20,
    boosted: false,
  },
  {
    category: "home-garden",
    lotteryIndex: 1,
    userEmail: "frank@demo.com",
    points: 20,
    boosted: false,
  },

  // Sports - Tennis Racket (index 0) - 2 participants
  {
    category: "sports",
    lotteryIndex: 0,
    userEmail: "bob@demo.com",
    points: 15,
    boosted: false,
  },
  {
    category: "sports",
    lotteryIndex: 0,
    userEmail: "emma@demo.com",
    points: 15,
    boosted: false,
  },

  // Sports - Camping Set (index 1) - 3 participants
  {
    category: "sports",
    lotteryIndex: 1,
    userEmail: "alice@demo.com",
    points: 30,
    boosted: false,
  },
  {
    category: "sports",
    lotteryIndex: 1,
    userEmail: "carol@demo.com",
    points: 30,
    boosted: false,
  },
  {
    category: "sports",
    lotteryIndex: 1,
    userEmail: "henry@demo.com",
    points: 30,
    boosted: false,
  },

  // Books - Harry Potter (index 0) - 3 participants
  {
    category: "books",
    lotteryIndex: 0,
    userEmail: "bob@demo.com",
    points: 35,
    boosted: false,
  },
  {
    category: "books",
    lotteryIndex: 0,
    userEmail: "david@demo.com",
    points: 35,
    boosted: false,
  },
  {
    category: "books",
    lotteryIndex: 0,
    userEmail: "grace@demo.com",
    points: 35,
    boosted: false,
  },

  // Books - Nat Geo (index 1) - 2 participants
  {
    category: "books",
    lotteryIndex: 1,
    userEmail: "frank@demo.com",
    points: 8,
    boosted: false,
  },
  {
    category: "books",
    lotteryIndex: 1,
    userEmail: "henry@demo.com",
    points: 8,
    boosted: false,
  },

  // Toys - LEGO Falcon (index 0) - 4 participants
  {
    category: "toys-games",
    lotteryIndex: 0,
    userEmail: "alice@demo.com",
    points: 60,
    boosted: false,
  },
  {
    category: "toys-games",
    lotteryIndex: 0,
    userEmail: "bob@demo.com",
    points: 60,
    boosted: false,
  },
  {
    category: "toys-games",
    lotteryIndex: 0,
    userEmail: "carol@demo.com",
    points: 60,
    boosted: false,
  },
  {
    category: "toys-games",
    lotteryIndex: 0,
    userEmail: "frank@demo.com",
    points: 60,
    boosted: false,
  },

  // Toys - Transformers (index 1) - 2 participants
  {
    category: "toys-games",
    lotteryIndex: 1,
    userEmail: "bob@demo.com",
    points: 25,
    boosted: false,
  },
  {
    category: "toys-games",
    lotteryIndex: 1,
    userEmail: "emma@demo.com",
    points: 25,
    boosted: false,
  },

  // Collectibles - Pokemon (index 0) - 3 participants
  {
    category: "collectibles",
    lotteryIndex: 0,
    userEmail: "bob@demo.com",
    points: 50,
    boosted: false,
  },
  {
    category: "collectibles",
    lotteryIndex: 0,
    userEmail: "david@demo.com",
    points: 50,
    boosted: false,
  },
  {
    category: "collectibles",
    lotteryIndex: 0,
    userEmail: "david@demo.com",
    points: 50,
    boosted: true,
  }, // David boosts to 100
  {
    category: "collectibles",
    lotteryIndex: 0,
    userEmail: "emma@demo.com",
    points: 50,
    boosted: false,
  },

  // Collectibles - Star Wars (index 1) - 2 participants
  {
    category: "collectibles",
    lotteryIndex: 1,
    userEmail: "alice@demo.com",
    points: 30,
    boosted: false,
  },
  {
    category: "collectibles",
    lotteryIndex: 1,
    userEmail: "carol@demo.com",
    points: 30,
    boosted: false,
  },

  // Collectibles - Anime Cels (index 2) - 2 participants
  {
    category: "collectibles",
    lotteryIndex: 2,
    userEmail: "david@demo.com",
    points: 45,
    boosted: false,
  },
  {
    category: "collectibles",
    lotteryIndex: 2,
    userEmail: "frank@demo.com",
    points: 45,
    boosted: false,
  },

  // Jewelry - Rolex (index 0) - 3 participants
  {
    category: "jewelry",
    lotteryIndex: 0,
    userEmail: "bob@demo.com",
    points: 80,
    boosted: false,
  },
  {
    category: "jewelry",
    lotteryIndex: 0,
    userEmail: "david@demo.com",
    points: 80,
    boosted: false,
  },
  {
    category: "jewelry",
    lotteryIndex: 0,
    userEmail: "frank@demo.com",
    points: 80,
    boosted: false,
  },

  // Jewelry - Pearls (index 1) - 2 participants
  {
    category: "jewelry",
    lotteryIndex: 1,
    userEmail: "alice@demo.com",
    points: 55,
    boosted: false,
  },
  {
    category: "jewelry",
    lotteryIndex: 1,
    userEmail: "grace@demo.com",
    points: 55,
    boosted: false,
  },

  // Music - Stratocaster (index 0) - 3 participants
  {
    category: "music",
    lotteryIndex: 0,
    userEmail: "alice@demo.com",
    points: 60,
    boosted: false,
  },
  {
    category: "music",
    lotteryIndex: 0,
    userEmail: "bob@demo.com",
    points: 60,
    boosted: false,
  },
  {
    category: "music",
    lotteryIndex: 0,
    userEmail: "david@demo.com",
    points: 60,
    boosted: false,
  },

  // Music - Vinyl Collection (index 1) - 2 participants
  {
    category: "music",
    lotteryIndex: 1,
    userEmail: "carol@demo.com",
    points: 35,
    boosted: false,
  },
  {
    category: "music",
    lotteryIndex: 1,
    userEmail: "emma@demo.com",
    points: 35,
    boosted: false,
  },

  // Other - Dyson (index 0) - 2 participants
  {
    category: "other",
    lotteryIndex: 0,
    userEmail: "carol@demo.com",
    points: 25,
    boosted: false,
  },
  {
    category: "other",
    lotteryIndex: 0,
    userEmail: "grace@demo.com",
    points: 25,
    boosted: false,
  },

  // Other - Steamer Trunk (index 1) - 2 participants
  {
    category: "other",
    lotteryIndex: 1,
    userEmail: "bob@demo.com",
    points: 18,
    boosted: false,
  },
  {
    category: "other",
    lotteryIndex: 1,
    userEmail: "david@demo.com",
    points: 18,
    boosted: false,
  },
];

// Completed lottery winners (deterministic)
interface CompletedLotteryWinner {
  category: string;
  lotteryIndex: number;
  winnerEmail: string;
  totalPool: number; // Points to transfer to seller
  participants: { email: string; points: number }[];
}

const completedLotteryData: CompletedLotteryWinner[] = [
  {
    category: "electronics",
    lotteryIndex: 3, // iPod Classic
    winnerEmail: "grace@demo.com",
    totalPool: 90,
    participants: [
      { email: "bob@demo.com", points: 30 },
      { email: "david@demo.com", points: 30 },
      { email: "grace@demo.com", points: 30 },
    ],
  },
  {
    category: "clothing",
    lotteryIndex: 3, // Band T-shirts
    winnerEmail: "emma@demo.com",
    totalPool: 45,
    participants: [
      { email: "alice@demo.com", points: 15 },
      { email: "emma@demo.com", points: 15 },
      { email: "henry@demo.com", points: 15 },
    ],
  },
  {
    category: "home-garden",
    lotteryIndex: 3, // KitchenAid
    winnerEmail: "david@demo.com",
    totalPool: 75,
    participants: [
      { email: "carol@demo.com", points: 25 },
      { email: "david@demo.com", points: 25 },
      { email: "emma@demo.com", points: 25 },
    ],
  },
  {
    category: "sports",
    lotteryIndex: 3, // Schwinn
    winnerEmail: "bob@demo.com",
    totalPool: 60,
    participants: [
      { email: "alice@demo.com", points: 20 },
      { email: "bob@demo.com", points: 20 },
      { email: "frank@demo.com", points: 20 },
    ],
  },
  {
    category: "books",
    lotteryIndex: 3, // Criterion
    winnerEmail: "carol@demo.com",
    totalPool: 75,
    participants: [
      { email: "bob@demo.com", points: 25 },
      { email: "carol@demo.com", points: 25 },
      { email: "david@demo.com", points: 25 },
    ],
  },
  {
    category: "toys-games",
    lotteryIndex: 3, // Board games
    winnerEmail: "frank@demo.com",
    totalPool: 36,
    participants: [
      { email: "alice@demo.com", points: 12 },
      { email: "frank@demo.com", points: 12 },
      { email: "henry@demo.com", points: 12 },
    ],
  },
  {
    category: "collectibles",
    lotteryIndex: 4, // Baseball cards
    winnerEmail: "david@demo.com",
    totalPool: 225,
    participants: [
      { email: "bob@demo.com", points: 75 },
      { email: "david@demo.com", points: 75 },
      { email: "frank@demo.com", points: 75 },
    ],
  },
  {
    category: "jewelry",
    lotteryIndex: 3, // Art Deco ring
    winnerEmail: "alice@demo.com",
    totalPool: 195,
    participants: [
      { email: "alice@demo.com", points: 65 },
      { email: "carol@demo.com", points: 65 },
      { email: "david@demo.com", points: 65 },
    ],
  },
  {
    category: "music",
    lotteryIndex: 3, // Yamaha Piano
    winnerEmail: "bob@demo.com",
    totalPool: 300,
    participants: [
      { email: "alice@demo.com", points: 100 },
      { email: "bob@demo.com", points: 100 },
      { email: "david@demo.com", points: 100 },
    ],
  },
  {
    category: "other",
    lotteryIndex: 3, // Polaroid
    winnerEmail: "emma@demo.com",
    totalPool: 66,
    participants: [
      { email: "carol@demo.com", points: 22 },
      { email: "emma@demo.com", points: 22 },
      { email: "grace@demo.com", points: 22 },
    ],
  },
];

// ========================================
// SEEDING FUNCTIONS
// ========================================

async function cleanupDemoData(prisma: PrismaClient): Promise<void> {
  console.log("🧹 Cleaning up existing demo data...");

  // Delete in order to respect foreign key constraints
  await prisma.notification.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_SUFFIX } } },
  });

  await prisma.pointTransaction.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_SUFFIX } } },
  });

  await prisma.lotteryEntry.deleteMany({
    where: {
      OR: [
        { lottery: { creator: { email: { endsWith: DEMO_EMAIL_SUFFIX } } } },
        { user: { email: { endsWith: DEMO_EMAIL_SUFFIX } } },
      ],
    },
  });

  await prisma.lottery.deleteMany({
    where: { creator: { email: { endsWith: DEMO_EMAIL_SUFFIX } } },
  });

  await prisma.address.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_SUFFIX } } },
  });

  // Delete accounts (for Better Auth credential cleanup)
  await prisma.account.deleteMany({
    where: { user: { email: { endsWith: DEMO_EMAIL_SUFFIX } } },
  });

  // Delete demo users entirely for clean re-seeding
  await prisma.user.deleteMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
  });

  console.log("✅ Demo data cleaned up");
}

async function seedCategories(
  prisma: PrismaClient
): Promise<Map<string, string>> {
  console.log("📂 Seeding categories...");
  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    categoryMap.set(category.slug, created.id);
  }

  console.log(`✅ Seeded ${categories.length} categories`);
  return categoryMap;
}

// Starting points for demo users - enough to participate in multiple lotteries
const DEMO_STARTING_POINTS = 1000;

async function seedUsers(
  prisma: PrismaClient,
  passwordHash: string
): Promise<Map<string, string>> {
  console.log("👥 Seeding users...");
  const userMap = new Map<string, string>();

  for (const user of sampleUsers) {
    const created = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        image: generateAvatar(user.name),
        points: DEMO_STARTING_POINTS,
        emailVerified: true,
      },
    });
    userMap.set(user.email, created.id);

    // Create credential account for Better Auth email/password login
    await prisma.account.create({
      data: {
        userId: created.id,
        accountId: created.id,
        providerId: "credential",
        password: passwordHash,  // Store password hash in Account table
      },
    });

    // Create signup bonus transaction
    await prisma.pointTransaction.create({
      data: {
        userId: created.id,
        amount: DEMO_STARTING_POINTS,
        type: "SIGNUP_BONUS",
        description: "Welcome to gomigomi! (Demo account bonus)",
      },
    });
  }

  console.log(`✅ Seeded ${sampleUsers.length} users`);
  return userMap;
}

async function seedAddresses(
  prisma: PrismaClient,
  userMap: Map<string, string>
): Promise<void> {
  console.log("📍 Seeding addresses...");
  let count = 0;

  for (const [email, addresses] of Object.entries(userAddresses)) {
    const userId = userMap.get(email);
    if (!userId) continue;

    for (const address of addresses) {
      await prisma.address.create({
        data: {
          userId,
          ...address,
          country: "US",
        },
      });
      count++;
    }
  }

  console.log(`✅ Seeded ${count} addresses`);
}

interface LotteryRecord {
  id: string;
  category: string;
  index: number;
  creatorEmail: string;
  status: LotteryStatus;
}

async function seedLotteries(
  prisma: PrismaClient,
  userMap: Map<string, string>
): Promise<LotteryRecord[]> {
  console.log("🎰 Seeding lotteries...");
  const lotteries: LotteryRecord[] = [];

  for (const [category, templates] of Object.entries(lotteryTemplates)) {
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const creatorId = userMap.get(template.creatorEmail);
      if (!creatorId) continue;

      // Generate images
      const images: string[] = [];
      for (let j = 0; j < template.imageCount; j++) {
        images.push(generateProductImage(category, i, j));
      }

      const lottery = await prisma.lottery.create({
        data: {
          title: template.title,
          description: template.description,
          images,
          condition: template.condition,
          category,
          maxParticipants: template.maxParticipants,
          pointsPerEntry: template.pointsPerEntry,
          status: template.status,
          startDate: daysFromNow(template.startDaysOffset),
          endDate: daysFromNow(template.endDaysOffset),
          creatorId,
        },
      });

      lotteries.push({
        id: lottery.id,
        category,
        index: i,
        creatorEmail: template.creatorEmail,
        status: template.status,
      });
    }
  }

  console.log(`✅ Seeded ${lotteries.length} lotteries`);
  return lotteries;
}

async function seedEntries(
  prisma: PrismaClient,
  userMap: Map<string, string>,
  lotteries: LotteryRecord[]
): Promise<void> {
  console.log("🎟️ Seeding entries...");
  let entryCount = 0;

  // Group entries by lottery
  const entriesByLottery = new Map<string, EntrySpec[]>();

  for (const spec of entrySpecs) {
    const lottery = lotteries.find(
      (l) => l.category === spec.category && l.index === spec.lotteryIndex
    );
    if (!lottery || lottery.status !== "ACTIVE") continue;

    const key = lottery.id;
    if (!entriesByLottery.has(key)) {
      entriesByLottery.set(key, []);
    }
    entriesByLottery.get(key)!.push(spec);
  }

  for (const [lotteryId, specs] of entriesByLottery) {
    const lottery = lotteries.find((l) => l.id === lotteryId)!;

    // Process entries (handling boosts)
    const userEntries = new Map<string, number>();

    for (const spec of specs) {
      if (spec.userEmail === lottery.creatorEmail) continue; // Can't enter own lottery

      const userId = userMap.get(spec.userEmail);
      if (!userId) continue;

      if (spec.boosted) {
        // Boost existing entry
        const currentPoints = userEntries.get(spec.userEmail) || 0;
        userEntries.set(spec.userEmail, currentPoints + spec.points);

        // Create boost transaction
        await prisma.pointTransaction.create({
          data: {
            userId,
            amount: -spec.points,
            type: "LOTTERY_BOOST",
            description: `Boosted entry: ${lotteryTemplates[lottery.category][lottery.index].title}`,
            lotteryId,
          },
        });

        // Deduct points
        await prisma.user.update({
          where: { id: userId },
          data: { points: { decrement: spec.points } },
        });
      } else {
        // New entry
        userEntries.set(spec.userEmail, spec.points);

        // Create entry transaction
        await prisma.pointTransaction.create({
          data: {
            userId,
            amount: -spec.points,
            type: "LOTTERY_ENTRY",
            description: `Entered lottery: ${lotteryTemplates[lottery.category][lottery.index].title}`,
            lotteryId,
          },
        });

        // Deduct points
        await prisma.user.update({
          where: { id: userId },
          data: { points: { decrement: spec.points } },
        });
      }
    }

    // Create lottery entries
    for (const [email, points] of userEntries) {
      const userId = userMap.get(email);
      if (!userId) continue;

      await prisma.lotteryEntry.create({
        data: {
          userId,
          lotteryId,
          points,
        },
      });
      entryCount++;
    }
  }

  console.log(`✅ Seeded ${entryCount} entries`);
}

async function processCompletedLotteries(
  prisma: PrismaClient,
  userMap: Map<string, string>,
  lotteries: LotteryRecord[]
): Promise<void> {
  console.log("🏆 Processing completed lotteries...");

  for (const completedData of completedLotteryData) {
    const lottery = lotteries.find(
      (l) =>
        l.category === completedData.category &&
        l.index === completedData.lotteryIndex
    );
    if (!lottery) continue;

    const template =
      lotteryTemplates[completedData.category][completedData.lotteryIndex];
    const winnerId = userMap.get(completedData.winnerEmail);
    const creatorId = userMap.get(lottery.creatorEmail);
    if (!winnerId || !creatorId) continue;

    // Create entries and transactions for all participants
    for (const participant of completedData.participants) {
      const userId = userMap.get(participant.email);
      if (!userId) continue;

      // Create entry
      await prisma.lotteryEntry.create({
        data: {
          userId,
          lotteryId: lottery.id,
          points: participant.points,
        },
      });

      // Create entry transaction (points already spent)
      await prisma.pointTransaction.create({
        data: {
          userId,
          amount: -participant.points,
          type: "LOTTERY_ENTRY",
          description: `Entered lottery: ${template.title}`,
          lotteryId: lottery.id,
        },
      });

      // Deduct from user balance
      await prisma.user.update({
        where: { id: userId },
        data: { points: { decrement: participant.points } },
      });
    }

    // Update lottery with winner
    await prisma.lottery.update({
      where: { id: lottery.id },
      data: { winnerId },
    });

    // Transfer points to seller
    await prisma.pointTransaction.create({
      data: {
        userId: creatorId,
        amount: completedData.totalPool,
        type: "LOTTERY_CREATED",
        description: `Lottery completed: ${template.title}`,
        lotteryId: lottery.id,
      },
    });

    await prisma.user.update({
      where: { id: creatorId },
      data: { points: { increment: completedData.totalPool } },
    });

    // Create notifications
    // Winner notification
    await prisma.notification.create({
      data: {
        userId: winnerId,
        type: "LOTTERY_WON",
        title: "You won!",
        message: `Congratulations! You won "${template.title}"`,
        data: { lotteryId: lottery.id },
      },
    });

    // Seller notification
    await prisma.notification.create({
      data: {
        userId: creatorId,
        type: "LOTTERY_ENDED",
        title: "Lottery completed",
        message: `Your lottery "${template.title}" has ended. You earned ${completedData.totalPool} points!`,
        data: { lotteryId: lottery.id, pointsEarned: completedData.totalPool },
      },
    });

    // Losers notifications
    for (const participant of completedData.participants) {
      if (participant.email === completedData.winnerEmail) continue;

      const userId = userMap.get(participant.email);
      if (!userId) continue;

      await prisma.notification.create({
        data: {
          userId,
          type: "LOTTERY_ENDED",
          title: "Lottery ended",
          message: `The lottery "${template.title}" has ended. Better luck next time!`,
          data: { lotteryId: lottery.id },
          read: Math.random() > 0.5, // Some read, some unread
        },
      });
    }
  }

  console.log(`✅ Processed ${completedLotteryData.length} completed lotteries`);
}

async function seedAdditionalNotifications(
  prisma: PrismaClient,
  userMap: Map<string, string>,
  lotteries: LotteryRecord[]
): Promise<void> {
  console.log("🔔 Seeding additional notifications...");
  let count = 0;

  // Add NEW_ENTRY notifications for active lottery creators
  for (const lottery of lotteries) {
    if (lottery.status !== "ACTIVE") continue;

    const creatorId = userMap.get(lottery.creatorEmail);
    if (!creatorId) continue;

    const template = lotteryTemplates[lottery.category][lottery.index];

    // Check if lottery has entries
    const entryCount = await prisma.lotteryEntry.count({
      where: { lotteryId: lottery.id },
    });

    if (entryCount > 0) {
      await prisma.notification.create({
        data: {
          userId: creatorId,
          type: "NEW_ENTRY",
          title: "New entry!",
          message: `Someone entered your lottery "${template.title}"`,
          data: { lotteryId: lottery.id },
          read: Math.random() > 0.3, // Most read
        },
      });
      count++;
    }
  }

  console.log(`✅ Seeded ${count} additional notifications`);
}

// ========================================
// DATABASE CONNECTION HELPERS
// ========================================

/**
 * Extract the actual PostgreSQL connection string from DATABASE_URL.
 * Handles both:
 * - Direct PostgreSQL URLs (postgres://...)
 * - Prisma proxy URLs (prisma+postgres://...?api_key=...)
 */
function getConnectionString(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // If it's a Prisma proxy URL, extract the real connection string from the API key
  if (dbUrl.startsWith("prisma+postgres://")) {
    const url = new URL(dbUrl);
    const apiKey = url.searchParams.get("api_key");
    if (!apiKey) {
      throw new Error("Prisma proxy URL missing api_key parameter");
    }

    try {
      const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString("utf8"));
      if (decoded.databaseUrl) {
        return decoded.databaseUrl;
      }
    } catch {
      throw new Error("Failed to decode Prisma proxy api_key");
    }
  }

  // Direct PostgreSQL URL
  return dbUrl;
}

// ========================================
// MAIN EXECUTION
// ========================================

async function main() {
  const connectionString = getConnectionString();

  console.log("🌱 Starting database seed...");
  console.log(
    `📍 Database: ${connectionString.split("@")[1]?.split("/")[0] || "***"}`
  );

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Generate password hash once
    console.log("🔐 Generating password hash...");
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // Run seeding in order
    await cleanupDemoData(prisma);
    const categoryMap = await seedCategories(prisma);
    const userMap = await seedUsers(prisma, passwordHash);
    await seedAddresses(prisma, userMap);
    const lotteries = await seedLotteries(prisma, userMap);
    await seedEntries(prisma, userMap, lotteries);
    await processCompletedLotteries(prisma, userMap, lotteries);
    await seedAdditionalNotifications(prisma, userMap, lotteries);

    // Final summary
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.address.count(),
      prisma.lottery.count(),
      prisma.lotteryEntry.count(),
      prisma.pointTransaction.count(),
      prisma.notification.count(),
    ]);

    console.log("\n📊 Seed Summary:");
    console.log(`   Users: ${stats[0]}`);
    console.log(`   Addresses: ${stats[1]}`);
    console.log(`   Lotteries: ${stats[2]}`);
    console.log(`   Entries: ${stats[3]}`);
    console.log(`   Transactions: ${stats[4]}`);
    console.log(`   Notifications: ${stats[5]}`);

    // Show point balances
    console.log("\n💰 User Point Balances:");
    const users = await prisma.user.findMany({
      where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
      orderBy: { points: "desc" },
      select: { name: true, email: true, points: true },
    });
    for (const user of users) {
      console.log(`   ${user.name}: ${user.points} points`);
    }

    console.log("\n✅ Database seeded successfully!");
    console.log(`\n🔑 Demo login: any @demo.com email with password "${DEMO_PASSWORD}"`);
    console.log("   Example: alice@demo.com / DemoPass123!");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
