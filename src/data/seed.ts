import { formatUpiHandle } from "../lib/domain";
import type { GuideRequest, Place, Profile, UserBadge, VouchRecord } from "../types/domain";

export const SEED_PROFILES: Profile[] = [
  {
    id: "11111111-1111-4111-8111-111111111101",
    username: "ananya_himalaya",
    displayName: "Ananya Negi",
    trailblazerScore: 345,
    tier: "Local Legend",
    isGuide: true,
    isVerifiedLocal: true,
    guideRegion: "Spiti & Kinnaur",
    languages: ["Hindi", "English", "Kinnauri"],
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    username: "biju_khasi",
    displayName: "Biju Nongrum",
    trailblazerScore: 310,
    tier: "Local Legend",
    isGuide: true,
    isVerifiedLocal: true,
    guideRegion: "Meghalaya & Northeast",
    languages: ["Khasi", "English", "Hindi"],
  },
  {
    id: "11111111-1111-4111-8111-111111111103",
    username: "kavya_deccan",
    displayName: "Kavya Kulkarni",
    trailblazerScore: 165,
    tier: "Pathfinder",
    isGuide: true,
    isVerifiedLocal: true,
    guideRegion: "Deccan & Western Ghats",
    languages: ["Kannada", "Marathi", "English", "Hindi"],
  },
  {
    id: "11111111-1111-4111-8111-111111111104",
    username: "arjun_kutch",
    displayName: "Arjun Jadeja",
    trailblazerScore: 220,
    tier: "Pathfinder",
    isGuide: true,
    isVerifiedLocal: true,
    guideRegion: "Kutch & Thar",
    languages: ["Gujarati", "Kutchi", "Hindi", "English"],
  },
  {
    id: "11111111-1111-4111-8111-111111111105",
    username: "meenakshi_coast",
    displayName: "Meenakshi Nair",
    trailblazerScore: 140,
    tier: "Pathfinder",
    isGuide: true,
    isVerifiedLocal: true,
    guideRegion: "Malabar & Konkan",
    languages: ["Malayalam", "Tamil", "English"],
  },
  {
    id: "11111111-1111-4111-8111-111111111106",
    username: "rohan_demo",
    displayName: "Rohan Verma (Demo Traveler)",
    trailblazerScore: 40,
    tier: "Wanderer",
    isGuide: false,
    isVerifiedLocal: false,
    guideRegion: null,
    languages: ["English", "Hindi"],
  },
];

export const SEED_PLACES_RAW: Place[] = [
  {
    id: "22222222-2222-4222-8222-222222222001",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Kalpa Apple Orchards & Roghi Cliff Trail",
    region: "Spiti & Kinnaur",
    category: "Hidden Village",
    rawDescription:
      "Tucked above Reckong Peo in Kinnaur, Kalpa wakes up to Kinnaur Kailash snow peaks and wood-smoke kitchens serving buckwheat chilta and apricot-kernel oil stew.",
    lat: 31.5359,
    lng: 78.2535,
    media: [
      {
        type: "video",
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Dawn mist drifting across Roghi cliff path (0:18)",
        durationSec: 18,
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Kinnaur Kailash ridge above terraced stone homes",
      },
    ],
    structuredCards: {
      commute: [
        "Take the overnight HRTC bus from Shimla ISBT to Reckong Peo (8 hrs).",
        "Catch a shared local Bolero or walk 40 mins uphill via the old pine bridle path to Kalpa.",
      ],
      food: [
        { name: "Chilta & Chulli Oil", detail: "Buckwheat pancakes dipped in cold-pressed wild apricot kernel oil.", priceHint: "INR 80" },
        { name: "Thukpa & Siddu", detail: "Hand-pulled millet noodles and steamed walnut-stuffed bread.", priceHint: "INR 140" },
      ],
      activities: [
        "Walk the quiet Roghi Suicide Point cliff road at sunrise before tour jeeps arrive.",
        "Visit the 12th-century Narayan Nagini wooden temple courtyard.",
      ],
    },
    localVendors: [
      {
        id: "v-kalpa-1",
        name: "Padma Heritage Homestay",
        category: "Homestay",
        specialty: "Mud-plastered cedar rooms & home-cooked Kinnauri thali",
        lat: 31.5378,
        lng: 78.2554,
        contact: "+91 98160-44112",
      },
      {
        id: "v-kalpa-2",
        name: "Devraj Cold-Press Mill",
        category: "Artisan",
        specialty: "Wild apricot-kernel (Chulli) oil & sun-dried apples",
        lat: 31.5342,
        lng: 78.2512,
        contact: "+91 98160-88301",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "Only BSNL/Jio work reliably past Roghi bend; download offline card first.", lat: 31.533, lng: 78.248 },
      { tag: "Avoid After Dark", message: "Unfenced cliff drop along Roghi link road has zero street lighting.", lat: 31.529, lng: 78.244 },
    ],
    mainstreamPopularityIndex: 18,
    vouchesCount: 44,
    verifiedCheckinsCount: 16,
    createdAt: "2026-11-10T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222002",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Kongthong — The Whistling Village",
    region: "Meghalaya & Northeast",
    category: "Living Heritage",
    rawDescription:
      "In the misty East Khasi hills, every villager has a unique musical lullaby tune instead of just a spoken name. Bamboo footbridges cross emerald streams to organic ginger farms.",
    lat: 25.3025,
    lng: 91.8551,
    media: [
      {
        type: "video",
        url: "https://media.w3.org/2010/05/sintel/trailer.mp4",
        thumbnail: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Bamboo ridge trail & monsoon stream song (0:15)",
        durationSec: 15,
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Khasi hillside trails draped in mist",
      },
    ],
    structuredCards: {
      commute: [
        "Hire a shared sumo from Shillong Bara Bazaar to Khatarshnong junction (2 hrs).",
        "Descend the paved ridge road 8 km into Kongthong valley (last mile has steep hairpins).",
      ],
      food: [
        { name: "Jadoh & Tungrymbai", detail: "Red hill rice slow-cooked with fermented soybean and wild herbs.", priceHint: "INR 160" },
        { name: "Raw Wild Forest Honey", detail: "Harvested from cliff hives in the Khasi sacred groves.", priceHint: "INR 350/jar" },
      ],
      activities: [
        "Attend an evening Jingrwai Iawbei (tune-naming) storytelling session with village elders.",
        "Walk the bamboo skywalk to the organic broom-grass and turmeric terraces.",
      ],
    },
    localVendors: [
      {
        id: "v-kong-1",
        name: "Mei Siew Kitchen & Stay",
        category: "Homestay",
        specialty: "Wood-fire Khasi meals & guided tune-heritage walk",
        lat: 25.3036,
        lng: 91.8562,
        contact: "+91 94361-12009",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Ask permission before recording elders singing family Jingrwai Iawbei tunes.", lat: 25.302, lng: 91.854 },
      { tag: "Low Network", message: "Zero mobile data inside the lower river gorge.", lat: 25.299, lng: 91.851 },
    ],
    mainstreamPopularityIndex: 12,
    vouchesCount: 51,
    verifiedCheckinsCount: 19,
    createdAt: "2026-11-11T09:15:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222003",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Anegundi Granary Alley & Coracle Ferry",
    region: "Deccan & Western Ghats",
    category: "Living Heritage",
    rawDescription:
      "Across the Tungabhadra river from crowded Hampi lies Anegundi—a living 14th-century river village where banana-fiber weavers work inside lime-washed courtyards.",
    lat: 15.3516,
    lng: 76.4926,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
        aspect: "square",
        caption: "Granite boulder alleys and heritage stone verandas",
      },
    ],
    structuredCards: {
      commute: [
        "Take a morning train to Hosapete Junction, then an auto-rickshaw to Talwar Ghat (35 mins).",
        "Cross the Tungabhadra river by traditional bamboo coracle ferry to Anegundi landing.",
      ],
      food: [
        { name: "Jolada Rotti & Ennegai", detail: "Crisp sorghum flatbread with stuffed baby brinjal curry and flaxseed chutney.", priceHint: "INR 110" },
        { name: "Banana Blossom Fry", detail: "Spiced river-village snack cooked in earthen pans.", priceHint: "INR 70" },
      ],
      activities: [
        "Learn banana-bark basket weaving at the Kishkinda Trust women's collective.",
        "Cycle through quiet paddy fields to Durga temple on Anjanadri ridge.",
      ],
    },
    localVendors: [
      {
        id: "v-aneg-1",
        name: "Kishkinda Banana-Fiber Collective",
        category: "Artisan",
        specialty: "Handwoven banana-stem mats, bags & natural-dye textiles",
        lat: 15.3529,
        lng: 76.4941,
        contact: "+91 94481-77120",
      },
      {
        id: "v-aneg-2",
        name: "Urmila's Courtyard Meals",
        category: "Food Vendor",
        specialty: "North Karnataka Jolada Rotti thali on banana leaf",
        lat: 15.3504,
        lng: 76.4912,
        contact: "+91 94481-33490",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Coracle ferries stop at 6:00 PM sharp; last bridge loop is 28 km around.", lat: 15.349, lng: 76.489 },
      { tag: "Scam Alert", message: "Fixed government coracle fare is INR 50/person; decline inflated sunset 'private boat' touts.", lat: 15.348, lng: 76.493 },
    ],
    mainstreamPopularityIndex: 25,
    vouchesCount: 38,
    verifiedCheckinsCount: 15,
    createdAt: "2026-11-12T10:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222004",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Nirona Rogan Art & Copper Bell Hamlet",
    region: "Kutch & Thar",
    category: "Sacred & Craft",
    rawDescription:
      "A quiet desert hamlet 40 km north of Bhuj where two centuries-old crafts survive side by side: castor-oil Rogan hand painting and tuneful Luhar copper bells.",
    lat: 23.4574,
    lng: 69.5218,
    media: [
      {
        type: "video",
        url: "https://media.w3.org/2010/05/bunny/trailer.mp4",
        thumbnail: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Hand-forged desert artisan craft studio (0:14)",
        durationSec: 14,
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Sun-baked courtyard walls and intricate geometric motifs",
      },
    ],
    structuredCards: {
      commute: [
        "Board a morning GSRTC bus from Bhuj Bus Stand toward Nakhatrana, alight at Nirona crossroad.",
        "Walk or take a shared chakda (3-wheeler) 2.5 km into the artisan lane.",
      ],
      food: [
        { name: "Kutchi Dabeli & Bajra Rotlo", detail: "Millet flatbread with garlic-chili paste and spiced buttermilk.", priceHint: "INR 90" },
        { name: "Kharek Date Halwa", detail: "Slow-simmered desert date dessert made in winter.", priceHint: "INR 120" },
      ],
      activities: [
        "Watch Khatri artisans stretch boiled castor-oil pigment into intricate Tree of Life designs.",
        "Test hand-tuned brass-coated copper bells crafted without a single weld.",
      ],
    },
    localVendors: [
      {
        id: "v-nir-1",
        name: "Abdul Gafur Khatri Rogan Studio",
        category: "Cultural Practitioner",
        specialty: "400-year-old castor-oil Rogan cloth painting demonstrations",
        lat: 23.4581,
        lng: 69.5229,
        contact: "+91 98253-11904",
      },
      {
        id: "v-nir-2",
        name: "Husen Luhar Copper Bells",
        category: "Artisan",
        specialty: "Hand-hammered musical camel & home bells",
        lat: 23.4565,
        lng: 69.5205,
        contact: "+91 98253-66421",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Remove shoes before entering family craft courtyards; ask before close-up portraits.", lat: 23.457, lng: 69.522 },
      { tag: "Low Network", message: "Carry small INR cash notes—UPI intermittently fails inside mud workshops.", lat: 23.456, lng: 69.521 },
    ],
    mainstreamPopularityIndex: 14,
    vouchesCount: 41,
    verifiedCheckinsCount: 14,
    createdAt: "2026-11-12T14:20:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222005",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Chettinad Karaikudi Athangudi Tile Mansions",
    region: "Malabar & Konkan",
    category: "Regional Cuisine",
    rawDescription:
      "Behind sun-bleached heritage lanes in Athangudi, craftsmen pour river sand and natural oxides into glass-backed molds to cure cool terracotta floor tiles while home kitchens serve fiery pepper crab.",
    lat: 10.1235,
    lng: 78.8421,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Burma-teak pillars & cool hand-poured Athangudi floors",
      },
    ],
    structuredCards: {
      commute: [
        "Take the morning train from Madurai or Tiruchirappalli to Karaikudi Junction.",
        "Take a local town bus (#14) 18 km east to Athangudi Palace Road.",
      ],
      food: [
        { name: "Kuzhi Paniyaram & Kavuni Arisi", detail: "Crisp fermented lentil dumplings with black sticky-rice coconut pudding.", priceHint: "INR 95" },
        { name: "Chettinad Milagu Nandu", detail: "Fresh mud crab roasted with 18 stone-ground spices and curry leaves.", priceHint: "INR 380" },
      ],
      activities: [
        "Watch artisans hand-pour floral Athangudi cement tiles on glass plates.",
        "Stroll the quiet antique bazaar on Muneeswaran Kovil Street.",
      ],
    },
    localVendors: [
      {
        id: "v-chet-1",
        name: "Sivakami Handmade Tile Works",
        category: "Artisan",
        specialty: "Custom hand-pressed heritage Athangudi floor tiles",
        lat: 10.1244,
        lng: 78.8433,
        contact: "+91 94431-55210",
      },
      {
        id: "v-chet-2",
        name: "Aachi Mess Courtyard",
        category: "Food Vendor",
        specialty: "Slow-roasted Chettinad spice blends & banana-leaf lunches",
        lat: 10.1221,
        lng: 78.8409,
        contact: "+91 94431-90342",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Many mansions are private ancestral homes—confirm caretaker entry before stepping onto verandas.", lat: 10.123, lng: 78.842 },
    ],
    mainstreamPopularityIndex: 28,
    vouchesCount: 36,
    verifiedCheckinsCount: 11,
    createdAt: "2026-11-13T07:45:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222006",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Turtuk — Balti Apricot & Glacier Hamlet",
    region: "Spiti & Kinnaur",
    category: "Hidden Village",
    rawDescription:
      "One of the northernmost villages in Ladakh along the Shyok river, opened to travelers only in 2010. Stone aqueducts feed organic buckwheat plots and zero-electricity natural cold-storage rock caves.",
    lat: 34.8473,
    lng: 76.8261,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
        aspect: "landscape",
        caption: "Stone water channels winding past Balti wooden homes",
      },
    ],
    structuredCards: {
      commute: [
        "Board a shared Sumo from Leh via Khardung La to Diskit (5 hrs), then continue 85 km along the Shyok gorge.",
        "Cross the suspension footbridge on foot into Youl, the pedestrian heritage quarter.",
      ],
      food: [
        { name: "Kisir & Tsamik", detail: "Buckwheat pancakes with tangy crushed walnut and wild mint chutney.", priceHint: "INR 130" },
        { name: "Prapu Noodle Soup", detail: "Hand-rolled wheat ribbons simmered with sun-dried apricots.", priceHint: "INR 150" },
      ],
      activities: [
        "Inspect the ancient natural stone-fridge caves (Nangchung) cooled by glacier streams.",
        "Hike to the Balti Heritage House museum overlooking the valley.",
      ],
    },
    localVendors: [
      {
        id: "v-turt-1",
        name: "Ashoor Balti Kitchen",
        category: "Food Vendor",
        specialty: "Authentic Balti Kisir, walnut chutney & dried apricot tea",
        lat: 34.8482,
        lng: 76.8271,
        contact: "+91 94191-78211",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "Only postpaid BSNL/Airtel connections function reliably near the Shyok border.", lat: 34.847, lng: 76.826 },
      { tag: "Cultural Etiquette", message: "Dress modestly inside Youl village lanes and never photograph military checkpoints.", lat: 34.846, lng: 76.824 },
    ],
    mainstreamPopularityIndex: 22,
    vouchesCount: 33,
    verifiedCheckinsCount: 12,
    createdAt: "2026-11-13T12:10:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222007",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Dzukou Bamboo Valley & Seasonal Lily Trail",
    region: "Meghalaya & Northeast",
    category: "Nature & Trail",
    rawDescription:
      "Straddling Nagaland and Manipur, Dzukou's rolling dwarf-bamboo folds turn emerald in monsoon and host the rare pink Dzukou lily with zero plastic allowed on the ridge.",
    lat: 25.5658,
    lng: 94.0715,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Velvet dwarf-bamboo folds above the Kohima mist line",
      },
    ],
    structuredCards: {
      commute: [
        "Take a shared taxi from Kohima south to Viswema village (45 mins).",
        "Hire a local jeep to the Viswema trailhead, then trek 2.5 hrs via stone steps to the valley crest.",
      ],
      food: [
        { name: "Smoked Naga Rice & Bamboo Shoot Broth", detail: "Warm mountain meal cooked by trail caretakers at the wooden rest house.", priceHint: "INR 180" },
        { name: "Wild Axone Chutney", detail: "Fermented soybean relish eaten with sticky hill rice.", priceHint: "INR 60" },
      ],
      activities: [
        "Follow the quiet stream-bed trail through the bamboo amphitheater at sunrise.",
        "Camp in the community-run wooden dormitory overlooking the valley floor.",
      ],
    },
    localVendors: [
      {
        id: "v-dzuk-1",
        name: "Viswema Youth Eco-Guide Desk",
        category: "Cultural Practitioner",
        specialty: "Certified local trail guides & zero-plastic trek briefings",
        lat: 25.5612,
        lng: 94.0841,
        contact: "+91 98620-44519",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Temperatures plunge below 4°C after sunset and fog wipes out trail markers.", lat: 25.566, lng: 94.071 },
      { tag: "Low Network", message: "Zero connectivity across the entire valley plateau.", lat: 25.564, lng: 94.073 },
    ],
    mainstreamPopularityIndex: 20,
    vouchesCount: 29,
    verifiedCheckinsCount: 10,
    createdAt: "2026-11-14T06:40:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222008",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Kumbalangi Backwater Crab & Pokkali Farms",
    region: "Malabar & Konkan",
    category: "Regional Cuisine",
    rawDescription:
      "India's first model eco-tourism fishing village just south of Kochi, where Chinese fishing nets dip into bioluminescent brackish lagoons beside organic Pokkali rice fields.",
    lat: 9.8634,
    lng: 76.2836,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
        aspect: "square",
        caption: "Still evening lagoons and traditional cantilevered nets",
      },
    ],
    structuredCards: {
      commute: [
        "Take a public ferry or local bus from Ernakulam South to Palluruthy (25 mins).",
        "Take an auto-rickshaw 10 mins across Kumbalangi bridge to the mangrove jetty.",
      ],
      food: [
        { name: "Karimeen Pollichathu", detail: "Pearl-spot fish marinated in shallots and roasted inside banana leaf.", priceHint: "INR 320" },
        { name: "Kallappam & Crab Roast", detail: "Toddy-fermented rice hoppers served with peppered mud crab.", priceHint: "INR 290" },
      ],
      activities: [
        "Paddle a wooden country canoe through quiet mangrove tunnels at dusk.",
        "Learn coir-rope spinning and crab-trap weaving with village cooperatives.",
      ],
    },
    localVendors: [
      {
        id: "v-kumb-1",
        name: "Thankappan's Canoe & Crab Kitchen",
        category: "Food Vendor",
        specialty: "Lagoon-to-table crab roast & quiet sunset canoe rides",
        lat: 9.8645,
        lng: 76.2849,
        contact: "+91 98470-61188",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Book canoe rides directly at the village Panchayat counter rather than Fort Kochi street brokers.", lat: 9.862, lng: 76.282 },
    ],
    mainstreamPopularityIndex: 24,
    vouchesCount: 27,
    verifiedCheckinsCount: 9,
    createdAt: "2026-11-14T15:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222009",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Kaas Laterite Plateau & Kasai Village Kitchens",
    region: "Deccan & Western Ghats",
    category: "Nature & Trail",
    rawDescription:
      "Beyond the main fenced flower boardwalk lies the quiet western laterite shelf of Kumudini lake and Kasai village kitchens serving wild bamboo-shoot bhaji.",
    lat: 17.7204,
    lng: 73.8229,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
        aspect: "landscape",
        caption: "Misty plateau lakes and seasonal monsoon wildflowers",
      },
    ],
    structuredCards: {
      commute: [
        "Catch an MSRTC bus from Satara Bus Stand toward Bamnoli (45 mins).",
        "Walk the marked forest footpath 1.5 km east to Kumudini lake rim.",
      ],
      food: [
        { name: "Nachni Bhakri & Bamboo Shoot Curry", detail: "Finger-millet flatbread with seasonal wild monsoon greens.", priceHint: "INR 110" },
        { name: "Pithla & Thecha", detail: "Smoky gram-flour porridge with crushed green-chili peanut paste.", priceHint: "INR 85" },
      ],
      activities: [
        "Spot endemic carnivorous sundews and floating Kumudini lilies along the lake edge.",
        "Join a village seed-conservation walk in Kasai hamlet.",
      ],
    },
    localVendors: [
      {
        id: "v-kaas-1",
        name: "Kasai Mahila Bachat Gat Kitchen",
        category: "Food Vendor",
        specialty: "Home-cooked Satara millet thalis & wild honey",
        lat: 17.7192,
        lng: 73.8208,
        contact: "+91 94220-77415",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Never step off designated stone paths onto fragile wildflower moss beds.", lat: 17.721, lng: 73.823 },
    ],
    mainstreamPopularityIndex: 31,
    vouchesCount: 24,
    verifiedCheckinsCount: 8,
    createdAt: "2026-11-15T08:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222010",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Bundi Stepwells & Blue Brahmin Alleys",
    region: "Kutch & Thar",
    category: "Living Heritage",
    rawDescription:
      "Overshadowed by Jaipur and Udaipur, Bundi preserves over 50 medieval carved stepwells (baoris), miniature fresco courtyards, and saffron-cardamom street kachoris.",
    lat: 25.4305,
    lng: 75.6499,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Indigo-washed lane walls leading down to Raniji ki Baori",
      },
    ],
    structuredCards: {
      commute: [
        "Take a local passenger train or bus from Kota Junction (50 mins).",
        "Walk directly into Sadar Bazaar and the old city stepwell quarter (no cars fit inside).",
      ],
      food: [
        { name: "Kadhi Kachori & Mawa Lassi", detail: "Crisp lentil kachori drenched in spiced yogurt gravy.", priceHint: "INR 45" },
        { name: "Gatte ki Sabzi", detail: "Gram-flour dumplings simmered in Hadoti mustard curry.", priceHint: "INR 110" },
      ],
      activities: [
        "Trace 17th-century stone carvings down Raniji ki Baori and Dhabhai Kund.",
        "Visit independent miniature painting studios near Taragarh gate.",
      ],
    },
    localVendors: [
      {
        id: "v-bun-1",
        name: "Babu Lal Miniature Atelier",
        category: "Artisan",
        specialty: "Natural mineral-pigment Bundi school paintings on handmade paper",
        lat: 25.4321,
        lng: 75.6484,
        contact: "+91 94141-88530",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Taragarh fort ruins lack lighting and have aggressive macaque troops after 5:30 PM.", lat: 25.434, lng: 75.646 },
    ],
    mainstreamPopularityIndex: 27,
    vouchesCount: 25,
    verifiedCheckinsCount: 7,
    createdAt: "2026-11-15T11:20:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222011",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Majuli Satra Mask Makers & Clay Riverbanks",
    region: "Meghalaya & Northeast",
    category: "Sacred & Craft",
    rawDescription:
      "On the world's largest inhabited river island in the Brahmaputra, monastic Satras craft expressive bamboo-and-clay Bhaona theatre masks using natural lampblack and vermilion.",
    lat: 26.9502,
    lng: 94.1674,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
        aspect: "square",
        caption: "Bamboo riverbanks and quiet ferry landings on the Brahmaputra",
      },
    ],
    structuredCards: {
      commute: [
        "Take a shared auto from Jorhat to Nimati Ghat (35 mins).",
        "Board the morning government wooden ferry across the Brahmaputra to Kamalabari Ghat (75 mins).",
      ],
      food: [
        { name: "Apong & Sungat Diya Mas", detail: "Mising rice beer and river fish steamed inside green bamboo tubes.", priceHint: "INR 210" },
        { name: "Komal Saul Breakfast", detail: "Soft-soak zero-cook Assamese rice topped with fresh curd and jaggery.", priceHint: "INR 70" },
      ],
      activities: [
        "Observe mask-making artisans at Samaguri Satra shaping articulated Bhaona masks.",
        "Cycle along Mising stilt-house embankments at golden hour.",
      ],
    },
    localVendors: [
      {
        id: "v-maj-1",
        name: "Samaguri Satra Mask Workshop",
        category: "Cultural Practitioner",
        specialty: "500-year-old bamboo & alluvial clay Mukha masks",
        lat: 26.9428,
        lng: 94.1812,
        contact: "+91 94350-91204",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Last Nimati–Kamalabari return ferry departs around 4:30 PM; check river fog timings.", lat: 26.912, lng: 94.155 },
    ],
    mainstreamPopularityIndex: 21,
    vouchesCount: 30,
    verifiedCheckinsCount: 9,
    createdAt: "2026-11-16T09:10:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222012",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Gokarna Kudle Back-Trail & Konkan Kokum Stalls",
    region: "Malabar & Konkan",
    category: "Regional Cuisine",
    rawDescription:
      "Skip the main beach shacks and follow the coastal headland footpath past Belekan fishing cove where local families press tangy wild kokum syrup and serve fresh mackerel thalis.",
    lat: 14.5256,
    lng: 74.3168,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Quiet basalt cove beyond the headland footpath",
      },
    ],
    structuredCards: {
      commute: [
        "Take a morning KSRTC bus to Gokarna Road station or town stand.",
        "Walk the red laterite cliff path south from Om Beach past Half Moon to Belekan cove.",
      ],
      food: [
        { name: "Bangude Masala & Sol Kadhi", detail: "Pan-seared Indian mackerel with chilled kokum-coconut digestive.", priceHint: "INR 180" },
        { name: "Patoli", detail: "Sweet jaggery-coconut rice parcels steamed in turmeric leaves.", priceHint: "INR 60" },
      ],
      activities: [
        "Hike the 4-cove coastal trail early morning before midday glare.",
        "Join local fishermen sorting the morning catch at Belekan jetty.",
      ],
    },
    localVendors: [
      {
        id: "v-gok-1",
        name: "Shanta's Belekan Fish Kitchen",
        category: "Food Vendor",
        specialty: "Catch-of-the-day coastal thali & sun-dried kokum syrup",
        lat: 14.5221,
        lng: 74.3212,
        contact: "+91 94488-22103",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "The rocky headland trail has steep unlit drops; carry a headlamp or return by boat.", lat: 14.524, lng: 74.319 },
    ],
    mainstreamPopularityIndex: 35,
    vouchesCount: 21,
    verifiedCheckinsCount: 6,
    createdAt: "2026-11-16T14:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222013",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Gurez Valley — Habba Khatoon & Log Huts",
    region: "Spiti & Kinnaur",
    category: "Hidden Village",
    rawDescription:
      "Surrounded by pyramid-shaped limestone peaks along the Kishanganga river, Dawar's wooden log-homes preserve Dard-Shina mountain heritage and buckwheat hearth bread.",
    lat: 34.6331,
    lng: 74.8325,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80",
        aspect: "landscape",
        caption: "Limestone pyramid ridge overlooking wooden log settlements",
      },
    ],
    structuredCards: {
      commute: [
        "Drive or take a shared cab from Bandipora across Razdan Pass (3,556m) to Dawar (3.5 hrs).",
        "Walk the riverside path along Kishanganga to Achoora wooden bridge.",
      ],
      food: [
        { name: "Dard Noon Chai & Makki Roti", detail: "Pink salted mountain tea with warm cornmeal bread and walnut paste.", priceHint: "INR 80" },
        { name: "Wild Morel (Gucchi) Pulao", detail: "Foraged mountain mushrooms cooked with saffron rice.", priceHint: "INR 260" },
      ],
      activities: [
        "Photograph Habba Khatoon spring and limestone peak at sunrise.",
        "Listen to Dard-Shina folk poetry at the community heritage center.",
      ],
    },
    localVendors: [
      {
        id: "v-gur-1",
        name: "Lone Timber Homestay",
        category: "Homestay",
        specialty: "Hand-notched cedar cabins & wild-foraged Gurez dinners",
        lat: 34.6345,
        lng: 74.8342,
        contact: "+91 94190-55912",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "Carry physical photo ID for Razdan Pass permit check; only Jio/BSNL postpaid work.", lat: 34.618, lng: 74.812 },
    ],
    mainstreamPopularityIndex: 11,
    vouchesCount: 28,
    verifiedCheckinsCount: 8,
    createdAt: "2026-11-17T08:45:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222014",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Channapatna Lacquer Toy Courtyard",
    region: "Deccan & Western Ghats",
    category: "Sacred & Craft",
    rawDescription:
      "Inside side-lanes off old Bengaluru–Mysuru road, 200-year-old family lathes turn pale ivory-wood into vegetable-dyed, glossy lacquered toys polished with screwpine leaves.",
    lat: 12.6518,
    lng: 77.2067,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=900&q=80",
        aspect: "square",
        caption: "Natural turmeric, indigo, and lac pigment sticks on ivory-wood",
      },
    ],
    structuredCards: {
      commute: [
        "Take a morning MEMU passenger train from Bengaluru City to Channapatna (75 mins).",
        "Walk 10 mins from the station into Syedwadi artisan lane.",
      ],
      food: [
        { name: "Thatte Idli & Benne Dose", detail: "Steamed plate-sized idli served with fresh white farm butter.", priceHint: "INR 75" },
        { name: "Ragi Mudde & Soppu Saaru", detail: "Nutritious millet balls with spicy greens broth.", priceHint: "INR 90" },
      ],
      activities: [
        "Watch master turners apply natural lac sticks onto spinning ivory-wood.",
        "Buy non-toxic plant-dyed toys directly from the workshop floor.",
      ],
    },
    localVendors: [
      {
        id: "v-chan-1",
        name: "Basha Heritage Lacquer Workshop",
        category: "Artisan",
        specialty: "Lead-free vegetable-dyed Channapatna wooden toys",
        lat: 12.6531,
        lng: 77.2079,
        contact: "+91 98451-39022",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Highway gift emporiums often resell factory plastic-painted imitations; verify screwpine-leaf polish inside Syedwadi.", lat: 12.65, lng: 77.205 },
    ],
    mainstreamPopularityIndex: 26,
    vouchesCount: 22,
    verifiedCheckinsCount: 7,
    createdAt: "2026-11-17T12:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222015",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Patan Patola Double-Ikat Loom House",
    region: "Kutch & Thar",
    category: "Sacred & Craft",
    rawDescription:
      "Only a handful of Salvi families in Patan still tie-dye both warp and weft silk threads before weaving double-ikat Patola saris alongside the sunken 11th-century Rani ki Vav stepwell.",
    lat: 23.8548,
    lng: 72.1194,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Hand-tied silk warp threads aligned on angled bamboo looms",
      },
    ],
    structuredCards: {
      commute: [
        "Take a morning GSRTC express bus or train from Ahmedabad to Patan (2.5 hrs).",
        "Take a shared rickshaw to Salviwado old weaving quarter.",
      ],
      food: [
        { name: "Patan Devda & Khandvi", detail: "Cardamom-infused flaky sweet paired with rolled gram-flour savory.", priceHint: "INR 80" },
        { name: "Undhiyu & Puri", detail: "Clay-pot roasted winter vegetables with carom-seed puffs.", priceHint: "INR 140" },
      ],
      activities: [
        "Inspect the mathematical precision of double-ikat yarn alignment in the Salvi museum.",
        "Descend 7 sculptural levels into Rani ki Vav before midday heat.",
      ],
    },
    localVendors: [
      {
        id: "v-pat-1",
        name: "Salvi Patola Heritage Loom",
        category: "Cultural Practitioner",
        specialty: "900-year-old natural-dye double-ikat silk weaving demos",
        lat: 23.8559,
        lng: 72.1208,
        contact: "+91 98240-33189",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Authentic double-ikat Patola takes 4–6 months; cheap street 'Patolas' are machine single-ikat.", lat: 23.853, lng: 72.118 },
    ],
    mainstreamPopularityIndex: 23,
    vouchesCount: 26,
    verifiedCheckinsCount: 6,
    createdAt: "2026-11-18T10:15:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222016",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Dhanushkodi Ghost Pier & Dry-Fish Coast",
    region: "Malabar & Konkan",
    category: "Nature & Trail",
    rawDescription:
      "At India's southeastern sandbar tip where the Bay of Bengal meets the Indian Ocean, fishing families mend catamaran nets beside cyclonic coral-stone railway ruins.",
    lat: 9.1794,
    lng: 79.4158,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=900&q=80",
        aspect: "landscape",
        caption: "Two-ocean sandbar convergence and coral-stone ruins",
      },
    ],
    structuredCards: {
      commute: [
        "Catch the 6:00 AM TNSTC town bus (#3) from Rameswaram temple stand straight to Arichal Munai.",
        "Walk the quiet southern lagoon spit away from the main turn-around circle.",
      ],
      food: [
        { name: "Karuvadu & Parotta", detail: "Crisp coastal flatbread with spiced dry-fish curry cooked by fisher families.", priceHint: "INR 130" },
        { name: "Palmyra Ice Apple (Nungu)", detail: "Chilled translucent palm fruit sold along the sandbar road.", priceHint: "INR 40" },
      ],
      activities: [
        "Walk the tidal sandbar where gentle Gulf waves meet turbulent Bay swells.",
        "Explore the coral-brick ruins of the 1964 church and old post office.",
      ],
    },
    localVendors: [
      {
        id: "v-dhan-1",
        name: "Muthu Fisherfolk Craft Stall",
        category: "Artisan",
        specialty: "Natural sea-shell chimes & handwoven palmyra palm baskets",
        lat: 9.1805,
        lng: 79.4141,
        contact: "+91 94432-88710",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Police close the sandbar road at 5:30 PM due to high tides and zero lighting.", lat: 9.178, lng: 79.417 },
      { tag: "Low Network", message: "Signal drops sharply past Mukundarayar Chathiram.", lat: 9.185, lng: 79.402 },
    ],
    mainstreamPopularityIndex: 29,
    vouchesCount: 20,
    verifiedCheckinsCount: 6,
    createdAt: "2026-11-18T16:45:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222017",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Pandavula Gutta Prehistoric Cliffs & Millet Kitchens",
    region: "Deccan & Western Ghats",
    category: "Living Heritage",
    rawDescription:
      "Older than Bhimbetka in Telangana's Jayashankar Bhupalpally forests, sandstone overhangs hide ochre Mesolithic rock art above quiet tribal jowar-roti kitchens.",
    lat: 18.2341,
    lng: 79.8825,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Red sandstone ridge shelter with Mesolithic rock art",
      },
    ],
    structuredCards: {
      commute: [
        "Take a morning TSRTC bus from Warangal Bus Stand to Regonda crossroad (75 mins).",
        "Hire a local auto 6 km through dry-deciduous forest road to Pandavula Gutta base shelter.",
      ],
      food: [
        { name: "Jonna Rotte & Wild Tamarind Pulusu", detail: "Hand-patted sorghum flatbread with forest-herb tamarind gravy.", priceHint: "INR 95" },
        { name: "Sarvapindi", detail: "Crisp savory rice-flour pancake studded with peanuts and sesame.", priceHint: "INR 60" },
      ],
      activities: [
        "Walk the sandstone ridge gallery spotting ancient deer, fish, and geometric motifs.",
        "Join village naturalists on the morning climbing-trail conservation walk.",
      ],
      livingHeritage: [
        "Never trace or wet prehistoric mineral rock-art panels—moisture fades millennia-old ochre.",
        "Hire forest-community elders from Regonda as local storytelling guides.",
      ],
    },
    localVendors: [
      {
        id: "v-pand-1",
        name: "Gutta Eco-Guide & Millet Kitchen",
        category: "Food Vendor",
        specialty: "Telangana Jonna Rotte, Sarvapindi & rock-shelter trail orientation",
        lat: 18.2355,
        lng: 79.8842,
        contact: "+91 94401-66219",
        upiId: "guttamillet@upi",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Zero touching or chalking near Mesolithic cave walls.", lat: 18.234, lng: 79.882 },
      { tag: "Low Network", message: "Patchy cellular data inside forest clefts; save Offline Pocket Card first.", lat: 18.233, lng: 79.88 },
    ],
    mainstreamPopularityIndex: 13,
    vouchesCount: 42,
    verifiedCheckinsCount: 15,
    createdAt: "2026-11-19T08:15:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222018",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Ziro Valley — Apatani Bamboo & Paddy-Fish Terraces",
    region: "Meghalaya & Northeast",
    category: "Hidden Village",
    rawDescription:
      "In Arunachal's pine-ringed plateau, Apatani villages raise carp right inside flooded wet-rice terraces without machinery, pairing bamboo shoots with earthen salt.",
    lat: 27.5449,
    lng: 93.8197,
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
        aspect: "portrait",
        caption: "Apatani wet-rice terraces and bamboo grove fences in morning mist",
      },
    ],
    structuredCards: {
      commute: [
        "Take the overnight Donyi Polo train from Guwahati to Naharlagun (8 hrs).",
        "Take a shared Tata Sumo uphill through pine valleys to Hapoli / Hong village (3 hrs).",
      ],
      food: [
        { name: "Pika Pila & Bamboo Shoot Stew", detail: "Traditional Apatani pickle and smoked bamboo shoot broth with valley carp.", priceHint: "INR 170" },
        { name: "Tapyo Black Salt", detail: "Mineral plant-ash salt crafted from native valley reeds.", priceHint: "INR 90" },
      ],
      activities: [
        "Walk the bund trails of Hong village observing integrated rice-and-fish farming.",
        "Visit weaver cooperatives crafting hand-spun Apatani geometric shawls.",
      ],
      livingHeritage: [
        "Walk only on reinforced bunds between paddy fields to avoid breaching fish channels.",
        "Confirm Inner Line Permit (ILP) check before boarding the Sumo at Naharlagun.",
      ],
    },
    localVendors: [
      {
        id: "v-ziro-1",
        name: "Kago Heritage Bamboo Stay",
        category: "Homestay",
        specialty: "Stilt bamboo homestay & Apatani rice-fish farm tours",
        lat: 27.5462,
        lng: 93.8211,
        contact: "+91 94362-54108",
        upiId: "kagostayziro@upi",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Seek consent before photographing Apatani elders; carry valid Arunachal ILP.", lat: 27.545, lng: 93.82 },
      { tag: "Avoid After Dark", message: "Valley roads drop into dense mist after 5:00 PM.", lat: 27.541, lng: 93.815 },
    ],
    mainstreamPopularityIndex: 19,
    vouchesCount: 39,
    verifiedCheckinsCount: 14,
    createdAt: "2026-11-19T12:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222019",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Barot Valley Trout Streams & Deodar Trails",
    region: "Western Himalaya",
    category: "Nature & Trail",
    rawDescription:
      "A deep-green valley on the Uhl River in Mandi, ringed by deodar forest and terraced fields around a British-era hydel settlement. Rainbow-trout angling, riverside camping, and the trailhead of the great Bada Bhangal wilderness crossing.",
    lat: 32.04316,
    lng: 76.83941,
    media: [
      {
        type: "image",
        url: "https://static2.tripoto.com/media/filter/nl/img/1912403/TripDocument/1588103737_barot_valley_has_many_unexplored_and_unexploited_landscapes.jpg.webp",
        aspect: "portrait",
        caption: "Uhl river bends below Barot's terraced hamlets",
      },
    ],
    structuredCards: {
      commute: [
        "HRTC bus or shared jeep from Joginder Nagar (2 hrs) up the winding Uhl valley road.",
        "From Mandi, take the Mandi–Padhar–Barot road (65 km); last stretch is single-lane, drive slow.",
      ],
      food: [
        { name: "Grilled Rainbow Trout", detail: "River-fresh trout from Barot's trout farm, pan-grilled with local mustard and herbs.", priceHint: "INR 350" },
        { name: "Siddu & Rajma Madra", detail: "Steamed walnut-stuffed bread with slow-cooked kidney beans in curd gravy.", priceHint: "INR 150" },
      ],
      activities: [
        "Try catch-and-release trout angling at the Uhl river pools near the barrage.",
        "Walk the cedar trail toward Chuhar valley villages before the Bada Bhangal crowds (there are none).",
      ],
    },
    localVendors: [
      {
        id: "v-gem19-1",
        name: "Thakur Riverside Homestay",
        category: "Homestay",
        specialty: "Riverside rooms & home-style Himachali dham meals",
        lat: 32.04526,
        lng: 76.84131,
        contact: "+91 98100-60000",
      },
      {
        id: "v-gem19-2",
        name: "Uhl Trout Point",
        category: "Food Vendor",
        specialty: "Fresh trout fry & maggi point by the barrage",
        lat: 32.04136,
        lng: 76.83711,
        contact: "+91 98231-63311",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "Only BSNL works reliably in the valley; download offline cards at Joginder Nagar.", lat: 32.04016, lng: 76.83701 },
      { tag: "Avoid After Dark", message: "The single-lane valley road has rockfall stretches and no lighting after sunset.", lat: 32.04576, lng: 76.84221 },
    ],
    mainstreamPopularityIndex: 14,
    vouchesCount: 31,
    verifiedCheckinsCount: 11,
    createdAt: "2026-11-06T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222020",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Khirsu Ridge Village & Chaukhamba Views",
    region: "Western Himalaya",
    category: "Hidden Village",
    rawDescription:
      "A quiet ridge-top village in Pauri Garhwal wrapped in oak, deodar and rhododendron forest, facing an unbroken wall of snow peaks — Chaukhamba and the Gangotri group on a clear morning. Almost nothing to do except walk, watch terraces change colour, and hear the silence.",
    lat: 30.17171,
    lng: 78.86867,
    media: [
      {
        type: "image",
        url: "https://www.tusktravel.com/blog/wp-content/uploads/2022/10/Khirsu-Uttarakhand.jpg",
        aspect: "portrait",
        caption: "Snow wall of Chaukhamba above Khirsu's oak ridge",
      },
    ],
    structuredCards: {
      commute: [
        "Shared jeep or taxi from Pauri town (15 km) — the nearest railhead is Kotdwar (115 km).",
        "Buses run Pauri–Khirsu twice daily; mornings are most reliable.",
      ],
      food: [
        { name: "Chainsoo & Phaanu", detail: "Slow-roasted black gram dal and mixed-lentil Garhwali staples with bhang chutney.", priceHint: "INR 160" },
        { name: "Mandua Roti & Aloo Ke Gutke", detail: "Finger-millet flatbread with spiced pahadi potatoes and jakhya tempering.", priceHint: "INR 120" },
      ],
      activities: [
        "Sunrise walk to the ridge meadow for the full Chaukhamba–Gangotri panorama.",
        "Forest-bathe the oak trail to the ancient Ghandiyal Devta temple.",
      ],
    },
    localVendors: [
      {
        id: "v-gem20-1",
        name: "Rawat Pahadi Homestay",
        category: "Homestay",
        specialty: "Sun-facing rooms & Garhwali thali cooked on a wood chulha",
        lat: 30.17381,
        lng: 78.87057,
        contact: "+91 98107-69771",
      },
      {
        id: "v-gem20-2",
        name: "Khirsu Chai Point",
        category: "Food Vendor",
        specialty: "Buransh (rhododendron) juice & pakodas at the ridge bend",
        lat: 30.16991,
        lng: 78.86637,
        contact: "+91 98238-73082",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "Signal drops in the oak forest stretches; keep your homestay's number saved offline.", lat: 30.16871, lng: 78.86627 },
      { tag: "Avoid After Dark", message: "Leopards are occasionally sighted on forest paths after dusk — walk in groups.", lat: 30.17431, lng: 78.87147 },
    ],
    mainstreamPopularityIndex: 9,
    vouchesCount: 24,
    verifiedCheckinsCount: 8,
    createdAt: "2026-11-07T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222021",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Bangus Valley — Kashmir's Hidden Meadow Bowl",
    region: "Western Himalaya",
    category: "Nature & Trail",
    rawDescription:
      "A vast bowl-shaped alpine meadow at ~10,000 ft in Kupwara, carpeted with wildflowers in summer and ringed by the forested Rajwar and Shamshabari ranges. Gujjar and Bakarwal shepherds graze their flocks here; no hotels, no crowds — just an enormous green amphitheatre under snow peaks.",
    lat: 34.39677,
    lng: 74.2813,
    media: [
      {
        type: "image",
        url: "https://brownchinarkashmir.com/wp-content/uploads/2024/01/bangus-valley_brown_chinar_kashmir.jpg",
        aspect: "portrait",
        caption: "The great green bowl of Bangus under the Shamshabari range",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Handwara (30 km) via Reshwari; a J&K Tourism permit check applies en route.",
        "Base yourself in Handwara or Kupwara town — there is no stay inside the valley yet.",
      ],
      food: [
        { name: "Makki Roti & Nadru Yakhni", detail: "Cornmeal flatbread with lotus-stem cooked in spiced yogurt, Dogra-Kashmiri style.", priceHint: "INR 200" },
        { name: "Noon Chai & Girda", detail: "Pink salted tea with a crusty Kashmiri girda bread from a shepherd dhaba.", priceHint: "INR 60" },
      ],
      activities: [
        "Ride a local pony across the Badi Bangus meadow to the shepherd deras.",
        "Trek the forest edge toward Chota Bangus for wildflower meadows in June–July.",
      ],
    },
    localVendors: [
      {
        id: "v-gem21-1",
        name: "Reshwari Shepherd Dhaba",
        category: "Food Vendor",
        specialty: "Noon chai, makki roti & fresh curd at the valley entry",
        lat: 34.39887,
        lng: 74.2832,
        contact: "+91 98114-79542",
      },
      {
        id: "v-gem21-2",
        name: "Handwara Heritage Homestay",
        category: "Homestay",
        specialty: "Family rooms in Handwara town, Bangus trip desk",
        lat: 34.39497,
        lng: 74.279,
        contact: "+91 98245-82853",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "No mobile network inside the valley; inform family and carry the permit copy offline.", lat: 34.39377, lng: 74.2789 },
      { tag: "Cultural Etiquette", message: "Shepherd deras are private homes — ask before photographing families or livestock.", lat: 34.39937, lng: 74.2841 },
    ],
    mainstreamPopularityIndex: 8,
    vouchesCount: 19,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-08T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222022",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Hanle — Dark Sky Village & Observatory",
    region: "Western Himalaya",
    category: "Hidden Village",
    rawDescription:
      "A tiny Changpa village at ~4,500 m on the Changthang plateau holding two wonders side by side: a 17th-century monastery and one of the world's highest astronomical observatories. By day, pashmina-goat plains and wild kiang; by night, inside India's first Dark Sky Reserve, the Milky Way casts shadows.",
    lat: 32.7794,
    lng: 78.9822,
    media: [
      {
        type: "image",
        url: "https://discoverlehladakh.in/wp-content/uploads/2024/04/Hanle-village-and-astronomical-observatory.jpg",
        aspect: "portrait",
        caption: "Hanle observatory above the Changpa village rooftops",
      },
    ],
    structuredCards: {
      commute: [
        "Only via Leh–Nyoma–Loma road (255 km from Leh); Inner Line Permit is checked at Loma bridge.",
        "Hire a Leh-registered taxi for 2 days minimum — there is no public transport to Hanle.",
      ],
      food: [
        { name: "Thukpa & Skyu", detail: "Hand-pulled noodle soup and slow-cooked Changthang wheat pasta with root vegetables.", priceHint: "INR 180" },
        { name: "Butter Tea & Khambir", detail: "Salted butter tea with thick Ladakhi whole-wheat bread at a family kitchen.", priceHint: "INR 70" },
      ],
      activities: [
        "Stargaze from the village edge after 10 pm — no moon nights are unreal.",
        "Visit the Hanle monastery at dawn prayers, then the observatory viewpoint (outside only).",
      ],
    },
    localVendors: [
      {
        id: "v-gem22-1",
        name: "Padma Changpa Homestay",
        category: "Homestay",
        specialty: "Mud-brick rooms, wood stoves & home-cooked Ladakhi meals",
        lat: 32.7815,
        lng: 78.9841,
        contact: "+91 98121-89313",
      },
      {
        id: "v-gem22-2",
        name: "Hanle Astro Cafe",
        category: "Food Vendor",
        specialty: "Tea, thukpa & telescope evenings run by local youth",
        lat: 32.7776,
        lng: 78.9799,
        contact: "+91 98252-92624",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "BSNL postpaid only, often down for days; carry cash and offline maps for the whole Changthang loop.", lat: 32.7764, lng: 78.9798 },
      { tag: "Avoid After Dark", message: "Temperatures drop below -10°C even in summer nights; altitude sickness is real — acclimatise 2 days in Leh first.", lat: 32.782, lng: 78.985 },
    ],
    mainstreamPopularityIndex: 16,
    vouchesCount: 27,
    verifiedCheckinsCount: 7,
    createdAt: "2026-11-09T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222023",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Rewalsar — The Three-Faith Lotus Lake",
    region: "Western Himalaya",
    category: "Sacred & Craft",
    rawDescription:
      "A small emerald lake sacred to three religions at once: Hindu temples, a Sikh gurudwara honouring Guru Gobind Singh's visit, and Tibetan Buddhist monasteries honouring Guru Padmasambhava, whose meditation caves honeycomb the hill above. Prayer flags and temple bells share one shoreline.",
    lat: 31.63212,
    lng: 76.83248,
    media: [
      {
        type: "image",
        url: "https://traveltriangle.com/blog/wp-content/uploads/2024/11/Rewalsar-Lake-1.jpg",
        aspect: "portrait",
        caption: "Rewalsar lake ringed by monasteries, temples and the gurudwara",
      },
    ],
    structuredCards: {
      commute: [
        "HRTC bus from Mandi (24 km, 1 hr) up the switchbacks to Rewalsar town.",
        "Taxis from Mandi ISBT are easy; the last caves need a 30-min uphill walk.",
      ],
      food: [
        { name: "Momos & Thenthuk", detail: "Tibetan quarter staples — steamed momos and hand-torn noodle soup near the monastery gate.", priceHint: "INR 140" },
        { name: "Himachali Dham Thali", detail: "Festive kangri dham served at lakeside dhabas on weekends.", priceHint: "INR 220" },
      ],
      activities: [
        "Circumambulate the lake at dawn with monks, feeding the sacred fish.",
        "Climb to Padmasambhava's meditation caves and the giant statue viewpoint above town.",
      ],
    },
    localVendors: [
      {
        id: "v-gem23-1",
        name: "Tso Pema Lakeside Stay",
        category: "Homestay",
        specialty: "Lake-facing rooms run by a Tibetan-Himachali family",
        lat: 31.63422,
        lng: 76.83438,
        contact: "+91 98128-99084",
      },
      {
        id: "v-gem23-2",
        name: "Nyingma Monastery Kitchen",
        category: "Food Vendor",
        specialty: "Simple vegetarian Tibetan meals inside the monastery complex",
        lat: 31.63032,
        lng: 76.83018,
        contact: "+91 98259-12395",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Walk clockwise around the lake and stupas; ask before photographing inside monasteries.", lat: 31.62912, lng: 76.83008 },
      { tag: "Scam Alert", message: "Feed-sellers may overcharge tourists for fish feed — agree the price before taking the packet.", lat: 31.63472, lng: 76.83528 },
    ],
    mainstreamPopularityIndex: 15,
    vouchesCount: 22,
    verifiedCheckinsCount: 9,
    createdAt: "2026-11-10T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222024",
    authorId: "11111111-1111-4111-8111-111111111106",
    title: "Kalinjar Fort — Bundelkhand's Sleeping Giant",
    region: "Gangetic Plains & Bundelkhand",
    category: "Living Heritage",
    rawDescription:
      "A brooding Vindhyan hill-fort, capital of the Chandela kingdom, coveted by Mahmud of Ghazni and the fort where Sher Shah Suri died in 1545. Inside: the Neelkanth Mahadev temple with its ever-seeping Swarg Kund, a towering Kal Bhairav, rock-cut tanks and palace ruins — with almost no other visitors.",
    lat: 25.01087,
    lng: 80.4709,
    media: [
      {
        type: "image",
        url: "https://tfipost.com/wp-content/uploads/2022/07/Kalinjar-fort.jpg",
        aspect: "portrait",
        caption: "Kalinjar's Vindhyan ramparts above the Bundelkhand plains",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Banda (55 km) or Atarra; nearest railheads are Banda and Atarra stations.",
        "Start the fort climb before 9 am — the plateau is shadeless by noon.",
      ],
      food: [
        { name: "Bundeli Thali & Bara", detail: "Urad-dal bara, baingan bharta and coarse millet rotis at fort-base dhabas.", priceHint: "INR 150" },
        { name: "Mahua Ladoo", detail: "Sweet ladoos made from dried mahua flowers, a Bundelkhand forest delicacy.", priceHint: "INR 60" },
      ],
      activities: [
        "See the Neelkanth Mahadev lingam that 'sweats' — the Swarg Kund never runs dry.",
        "Walk the Chaube Mahal ruins and the Kal Bhairav colossus at the plateau's far end.",
      ],
    },
    localVendors: [
      {
        id: "v-gem24-1",
        name: "Kalinjar Base Dhaba",
        category: "Food Vendor",
        specialty: "Thalis & tea at the fort entry village",
        lat: 25.01297,
        lng: 80.4728,
        contact: "+91 98135-18855",
      },
      {
        id: "v-gem24-2",
        name: "Bundelkhand Heritage Guide Desk",
        category: "Cultural Practitioner",
        specialty: "Local ASI-trained guides at the ticket window",
        lat: 25.00907,
        lng: 80.4686,
        contact: "+91 98266-22166",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "The fort plateau has no lighting or fencing on cliff edges — descend before sunset.", lat: 25.00787, lng: 80.4685 },
      { tag: "Low Network", message: "Carry cash; card machines and ATMs are only back in Banda town.", lat: 25.01347, lng: 80.4737 },
    ],
    mainstreamPopularityIndex: 10,
    vouchesCount: 17,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-11T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222025",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Rakhigarhi — The Largest Harappan City",
    region: "Gangetic Plains & Bundelkhand",
    category: "Living Heritage",
    rawDescription:
      "Quite possibly the largest city of the Indus Valley Civilisation — larger by area than Mohenjo-daro — spread as a chain of ancient mounds through a working farming village in Hisar. Excavated streets, drains, burials and jewellery workshops are 4,500+ years old; this is the site whose ancient DNA study made global headlines.",
    lat: 29.27735,
    lng: 76.11687,
    media: [
      {
        type: "image",
        url: "https://cf-images.assettype.com/outlookindia/2025-02-03/pwru6jv6/5-Aerial-shot-of-Rakhigarhi-excavation-site.jpg?w=801&auto=format%2Ccompress&fit=max&format=webp&dpr=1.0",
        aspect: "portrait",
        caption: "ASI excavation trenches across the Rakhigarhi mounds",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Hisar (55 km) via Narnaund; HRTC buses run Hisar–Narnaund through the day.",
        "Combine with Agroha mound and Hisar's Firoz Shah palace for a full Harappan day.",
      ],
      food: [
        { name: "Haryanvi Bajra Khichdi & Lassi", detail: "Millet khichdi with white butter and a tall glass of sweet lassi at village dhabas.", priceHint: "INR 130" },
        { name: "Ghevar & Kheer", detail: "Festive ghevar from Hisar's old-city sweet shops on the return leg.", priceHint: "INR 90" },
      ],
      activities: [
        "Walk mound RGR-2 with a local guide to read the street grid and drain lines.",
        "See the site museum's bead, shell and terracotta finds from the current digs.",
      ],
    },
    localVendors: [
      {
        id: "v-gem25-1",
        name: "Rakhigarhi Heritage Resort",
        category: "Homestay",
        specialty: "Rooms beside the mounds with site-walk arrangements",
        lat: 29.27945,
        lng: 76.11877,
        contact: "+91 98142-28626",
      },
      {
        id: "v-gem25-2",
        name: "Village Potter of Rakhigarhi",
        category: "Artisan",
        specialty: "Black-slipped pottery in Harappan-inspired forms",
        lat: 29.27555,
        lng: 76.11457,
        contact: "+91 98273-31937",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "The mounds sit inside a living village — stay on marked paths and don't pocket any surface finds; it's a legal offence.", lat: 29.27435, lng: 76.11447 },
      { tag: "Low Network", message: "Carry a printed route; signal is patchy between Narnaund and the village.", lat: 29.27995, lng: 76.11967 },
    ],
    mainstreamPopularityIndex: 12,
    vouchesCount: 15,
    verifiedCheckinsCount: 3,
    createdAt: "2026-11-12T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222026",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Kalari Cheese of the Dogras — Jammu",
    region: "Western Himalaya",
    category: "Regional Cuisine",
    rawDescription:
      "Jammu's own indigenous cheese — dense, mozzarella-like discs of cow or buffalo milk from the Ramnagar–Udhampur belt, ripened and then pan-fried in their own fat until crisp outside and stretchy inside. Eaten sizzling with chutney, or stuffed into the beloved Kalari kulcha from Jammu street carts.",
    lat: 32.8066,
    lng: 75.3234,
    media: [
      {
        type: "image",
        url: "https://www.puremart.in/images/recipes/100-jammu-kaladikalari-local-cheese-1777452671.jpeg",
        aspect: "portrait",
        caption: "Kalari sizzling crisp outside, molten inside",
      },
    ],
    structuredCards: {
      commute: [
        "Kalari heartland is Ramnagar (Udhampur district); buses from Jammu (65 km) run all day.",
        "In Jammu city, the old-city carts near Raghunath Bazaar fry it fresh through the evening.",
      ],
      food: [
        { name: "Kalari Kulcha", detail: "The cheese disc fried and stuffed in a soft kulcha with tangy chutney — Jammu's signature snack.", priceHint: "INR 80" },
        { name: "Kalari with Anardana Chutney", detail: "Plain fried kalari dusted with spices, dipped in sour pomegranate chutney.", priceHint: "INR 100" },
      ],
      activities: [
        "Watch a Ramnagar dairy family stretch and disc the cheese by hand in the morning.",
        "Do a Jammu old-city evening crawl: kalari cart, then rajma-chawal at a Dogra dhaba.",
      ],
    },
    localVendors: [
      {
        id: "v-gem26-1",
        name: "Ramnagar Dairy Collective",
        category: "Artisan",
        specialty: "Fresh kalari discs sold by weight at the source",
        lat: 32.8087,
        lng: 75.3253,
        contact: "+91 98149-38397",
      },
      {
        id: "v-gem26-2",
        name: "Raghunath Bazaar Kalari Cart",
        category: "Food Vendor",
        specialty: "Evening kalari kulcha cart in Jammu old city",
        lat: 32.8048,
        lng: 75.3211,
        contact: "+91 98280-41708",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Some city stalls sell paneer as kalari — real kalari stretches and browns in its own fat; watch it being fried.", lat: 32.8036, lng: 75.321 },
      { tag: "Cultural Etiquette", message: "Dairy visits are family homes; mornings only, and ask before filming the process.", lat: 32.8092, lng: 75.3262 },
    ],
    mainstreamPopularityIndex: 11,
    vouchesCount: 21,
    verifiedCheckinsCount: 6,
    createdAt: "2026-11-13T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222027",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Mechuka — The Valley Near the Sky Border",
    region: "Meghalaya & Northeast",
    category: "Hidden Village",
    rawDescription:
      "A remote Himalayan valley town at ~1,830 m, barely 29 km from the McMahon Line, where the Siyom river braids through golden grassland beneath snow peaks. Hanging bridges, a 400-year-old hilltop monastery, and Memba and Bokar family kitchens — it feels closer to Tibet than to India.",
    lat: 28.59935,
    lng: 94.13535,
    media: [
      {
        type: "image",
        url: "https://vibenortheast.com/mechuka.jpg",
        aspect: "portrait",
        caption: "Siyom river braiding through Mechuka's golden valley",
      },
    ],
    structuredCards: {
      commute: [
        "Fly or train to Dibrugarh/Silapathar, then shared sumos via Aalo (a full mountain day).",
        "Inner Line Permit required for Arunachal — arrange online before you travel.",
      ],
      food: [
        { name: "Memba Thukpa & Churpi", detail: "Noodle soup with fermented yak-cheese churpi from Memba family kitchens.", priceHint: "INR 170" },
        { name: "Pika Pila & Rice Beer", detail: "Bamboo-shoot pickle heat with traditional apong served in bamboo cups.", priceHint: "INR 90" },
      ],
      activities: [
        "Cross the hanging bridges over the Siyom at first light for monastery views.",
        "Trek to Samten Yongcha monastery, older than Tawang's, above the town.",
      ],
    },
    localVendors: [
      {
        id: "v-gem27-1",
        name: "Siyom Valley Homestay",
        category: "Homestay",
        specialty: "Wooden Memba homes with kitchen-garden meals",
        lat: 28.60145,
        lng: 94.13725,
        contact: "+91 98156-48168",
      },
      {
        id: "v-gem27-2",
        name: "Mechuka Handloom House",
        category: "Artisan",
        specialty: "Memba jackets, carpets & dried churpi by women's groups",
        lat: 28.59755,
        lng: 94.13305,
        contact: "+91 98287-51479",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "BSNL only and weather-dependent; finish permits and bookings before Aalo.", lat: 28.59635, lng: 94.13295 },
      { tag: "Avoid After Dark", message: "Border-area roads close early and are landslide-prone in monsoon — travel by day only.", lat: 28.60195, lng: 94.13815 },
    ],
    mainstreamPopularityIndex: 13,
    vouchesCount: 18,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-14T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222028",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Mawlyngbna — Khasi Fossil Village & Rock Pools",
    region: "Meghalaya & Northeast",
    category: "Nature & Trail",
    rawDescription:
      "A Khasi village on the edge of the world's wettest region where you kayak the glassy Umkhakoi reservoir, swim in natural rock pools carved into a stone 'water park', and walk past marine fossils left from when this plateau lay under the sea. Guides tell the legend of the Iew Luri-Lura rock, etched with hoofprints of mythical beasts.",
    lat: 25.3527,
    lng: 91.5833,
    media: [
      {
        type: "image",
        url: "https://lypublicbucket.s3.ap-south-2.amazonaws.com/places/Umkhakoi%20Water%20Park%20Mawlyngbna/0.jpg",
        aspect: "portrait",
        caption: "Umkhakoi's still waters at Mawlyngbna",
      },
    ],
    structuredCards: {
      commute: [
        "Taxi from Shillong (55 km) via Mawsynram road; village guides meet you at the entry point.",
        "Combine with Mawsynram cave the same day — Mawlyngbna is the quieter half of the trip.",
      ],
      food: [
        { name: "Jadoh & Dohneiiong", detail: "Khasi red rice with pork in black-sesame gravy at village eateries.", priceHint: "INR 180" },
        { name: "Kwai & Sha", detail: "Betel nut with slaked lime and strong Khasi tea — the village welcome ritual.", priceHint: "INR 30" },
      ],
      activities: [
        "Kayak Umkhakoi reservoir between forested banks in the early morning.",
        "Swim the ladder of natural rock pools and see the split fossil boulders with a guide.",
      ],
    },
    localVendors: [
      {
        id: "v-gem28-1",
        name: "Umkhakoi Guide Collective",
        category: "Cultural Practitioner",
        specialty: "Village-run kayaking, fossil walks & pool guides",
        lat: 25.3548,
        lng: 91.5852,
        contact: "+91 98163-57939",
      },
      {
        id: "v-gem28-2",
        name: "Mawlyngbna Village Kitchen",
        category: "Food Vendor",
        specialty: "Khasi thalis cooked by the women's society",
        lat: 25.3509,
        lng: 91.581,
        contact: "+91 98294-61240",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "Rain kills the signal for days in monsoon; book guides in person at the village office.", lat: 25.3497, lng: 91.5809 },
      { tag: "Avoid After Dark", message: "Rock pools turn dangerously slick after rain — no swimming without the guide's go-ahead.", lat: 25.3553, lng: 91.5861 },
    ],
    mainstreamPopularityIndex: 10,
    vouchesCount: 16,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-15T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222029",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Keibul Lamjao — The World's Only Floating Park",
    region: "Meghalaya & Northeast",
    category: "Nature & Trail",
    rawDescription:
      "A wilderness of phumdi — thick drifting mats of vegetation on Loktak Lake, firm enough to walk on — and the last natural home of the Sangai, the 'dancing deer' that seems to tiptoe across the floating meadow. Dawn watchtowers, mist on the lake, and a park found nowhere else on Earth.",
    lat: 24.4797,
    lng: 93.7722,
    media: [
      {
        type: "image",
        url: "https://thirdeyetraveller.com/wp-content/uploads/Keibul-Lamjao-National-Park-Manipur-Loktak-Lake-Sangai-27-of-29-1400x1050.jpg",
        aspect: "portrait",
        caption: "Phumdi meadows of Keibul Lamjao on Loktak Lake",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Imphal (55 km) via Moirang; park entry is at Keibul village.",
        "Stay in Moirang town and enter at 6 am — Sangai sightings are a dawn game.",
      ],
      food: [
        { name: "Eromba & Singju", detail: "Manipuri mashed potato-fish chutney and the crunchy lotus-stem salad, at Moirang eateries.", priceHint: "INR 150" },
        { name: "Ngari Thongba", detail: "Fermented-fish curry with rice — the taste of Loktak's fishing villages.", priceHint: "INR 190" },
      ],
      activities: [
        "Climb the watchtower at sunrise to spot Sangai deer tiptoeing on phumdi.",
        "Take a fisherman's boat along the park edge to see floating huts and phumdi rings.",
      ],
    },
    localVendors: [
      {
        id: "v-gem29-1",
        name: "Moirang Lakeside Homestay",
        category: "Homestay",
        specialty: "Rooms near Sendra with park-trip arrangements",
        lat: 24.4818,
        lng: 93.7741,
        contact: "+91 98170-67700",
      },
      {
        id: "v-gem29-2",
        name: "Loktak Fisherfolk Kitchen",
        category: "Food Vendor",
        specialty: "Lake-fish meals cooked by fishing families",
        lat: 24.4779,
        lng: 93.7699,
        contact: "+91 98301-71011",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "Carry your park permit and ID in offline form; gates open only in daylight hours.", lat: 24.4767, lng: 93.7698 },
      { tag: "Cultural Etiquette", message: "Phumdi fishing zones are livelihood areas — never step onto a phum without a guide.", lat: 24.4823, lng: 93.775 },
    ],
    mainstreamPopularityIndex: 14,
    vouchesCount: 20,
    verifiedCheckinsCount: 6,
    createdAt: "2026-11-16T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222030",
    authorId: "11111111-1111-4111-8111-111111111106",
    title: "Unakoti — The Rock-Cut Gods of Tripura",
    region: "Meghalaya & Northeast",
    category: "Sacred & Craft",
    rawDescription:
      "Deep in forested hills near Kailashahar, a lost Shaivite city carved into rock between the 7th–9th centuries: the 30-foot face of Unakotiswara Kal Bhairava, giant Ganeshas and half-buried Nandis around a sacred pool. Legend says Shiva cursed the 99,99,999 gods who overslept here into stone — Unakoti means one less than a crore.",
    lat: 24.3183,
    lng: 92.00302,
    media: [
      {
        type: "image",
        url: "https://www.tamera.fr/sites/default/files/inline-images/newsletter_seven_sisters_photo_8_tripura_unakoti.jpg",
        aspect: "portrait",
        caption: "The great rock faces of Unakoti in the forest",
      },
    ],
    structuredCards: {
      commute: [
        "Train or bus to Dharmanagar/Kailashahar; the site is 8 km from Kailashahar town.",
        "Hire an auto for the full site — carvings are spread over several forested levels.",
      ],
      food: [
        { name: "Mui Borok Thali", detail: "Tripuri tribal thali — bamboo-shoot and fermented-fish (berma) preparations with rice.", priceHint: "INR 200" },
        { name: "Awandru & Mosdeng", detail: "Rice-flour steamed cakes with fiery mosdeng serma chutney at town stalls.", priceHint: "INR 70" },
      ],
      activities: [
        "Descend the steps to the central pool and read the Kal Bhairava face at eye level.",
        "Walk the upper ridge carvings — Ganesha and Durga panels most visitors miss.",
      ],
    },
    localVendors: [
      {
        id: "v-gem30-1",
        name: "Kailashahar Heritage Homestay",
        category: "Homestay",
        specialty: "Family stay with Unakoti day-trip support",
        lat: 24.3204,
        lng: 92.00492,
        contact: "+91 98177-77471",
      },
      {
        id: "v-gem30-2",
        name: "Unakoti Site Guides' Desk",
        category: "Cultural Practitioner",
        specialty: "Local guides at the ASI entry point",
        lat: 24.3165,
        lng: 92.00072,
        contact: "+91 98308-80782",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Forest steps are moss-slick and unlit; the site empties by 5 pm — plan a morning visit.", lat: 24.3153, lng: 92.00062 },
      { tag: "Cultural Etiquette", message: "It is an active place of worship; dress modestly and don't climb the carved panels.", lat: 24.3209, lng: 92.00582 },
    ],
    mainstreamPopularityIndex: 9,
    vouchesCount: 14,
    verifiedCheckinsCount: 3,
    createdAt: "2026-11-17T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222031",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Longwa — The Village Between Two Nations",
    region: "Meghalaya & Northeast",
    category: "Living Heritage",
    rawDescription:
      "A Konyak Naga hilltop village where the Angh's great thatched longhouse straddles the India–Myanmar border — he is said to eat in India and sleep in Myanmar, ruling villages in both countries. Tattooed elder headhunters still live here, and the morungs hold carved skulls, woodwork and opium-era stories.",
    lat: 26.66122,
    lng: 95.21914,
    media: [
      {
        type: "image",
        url: "https://chalohoppo.com/wp-content/uploads/2025/08/FAQ.jpg",
        aspect: "portrait",
        caption: "Longwa's hilltop longhouses on the Myanmar ridge",
      },
    ],
    structuredCards: {
      commute: [
        "Shared sumos from Mon town (42 km) on rough hill roads — leave early, return before dark.",
        "Inner Line Permit for Nagaland required; Mon DC office issues them.",
      ],
      food: [
        { name: "Smoked Pork & Axone", detail: "Fire-smoked pork with fermented soybean axone, the Konyak kitchen signature.", priceHint: "INR 220" },
        { name: "Sticky Rice & King Chilli Chutney", detail: "Hill rice with raja mircha chutney — approach with respect, it's volcanic.", priceHint: "INR 120" },
      ],
      activities: [
        "Stand with one foot in India and one in Myanmar at the Angh's longhouse.",
        "Hear first-hand headhunting-era stories from tattooed elders in the morung.",
      ],
    },
    localVendors: [
      {
        id: "v-gem31-1",
        name: "Angh's Guest Longhouse",
        category: "Homestay",
        specialty: "Traditional Konyak longhouse stay in the village",
        lat: 26.66332,
        lng: 95.22104,
        contact: "+91 98184-87242",
      },
      {
        id: "v-gem31-2",
        name: "Longwa Woodcraft House",
        category: "Artisan",
        specialty: "Carved figures, beadwork & dao sheaths by village craftsmen",
        lat: 26.65942,
        lng: 95.21684,
        contact: "+91 98315-90553",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Photograph elders only with permission, and never touch morung skull relics.", lat: 26.65822, lng: 95.21674 },
      { tag: "Low Network", message: "Roads to Mon district wash out in monsoon; buffer a full spare day.", lat: 26.66382, lng: 95.22194 },
    ],
    mainstreamPopularityIndex: 12,
    vouchesCount: 17,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-18T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222032",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Reiek Heritage Village & Tlang Peak",
    region: "Meghalaya & Northeast",
    category: "Hidden Village",
    rawDescription:
      "A preserved traditional Mizo village on a forested ridge — the chief's house (Lal In), the bachelors' hall (Zawlbuk) and thatched homes arranged exactly as Mizo villages stood a century ago. Above it, a short forest trek climbs Reiek Tlang (1,548 m) to a cliff-edge summit over a sea of blue ridges rolling toward Bangladesh.",
    lat: 23.69861,
    lng: 92.60779,
    media: [
      {
        type: "image",
        url: "https://knowledgeofindia.com/wp-content/uploads/2019/12/Reiek-Town-Seen-From-Tourist-Rest-House-Reiek.jpg",
        aspect: "portrait",
        caption: "Reiek village ridge seen from the tourist rest house",
      },
    ],
    structuredCards: {
      commute: [
        "Taxi from Aizawl (29 km, 1 hr) — the heritage village is state-tourism maintained.",
        "The Tlang trek starts behind the village; carry water, there's none on the ridge.",
      ],
      food: [
        { name: "Bai & Sawhchiar", detail: "Mizo bai stew of vegetables and pork, with sawchiar rice-meat porridge.", priceHint: "INR 180" },
        { name: "Zawlaidi & Local Pickles", detail: "Wild-grape zawlaidi (seasonal) and bamboo-shoot pickles from village stalls.", priceHint: "INR 80" },
      ],
      activities: [
        "Walk the heritage village lane reading how a Mizo chiefdom actually ran.",
        "Climb Reiek Tlang for sunset over layered ridges into Bangladesh.",
      ],
    },
    localVendors: [
      {
        id: "v-gem32-1",
        name: "Reiek Tourist Lodge Kitchen",
        category: "Food Vendor",
        specialty: "Mizo meals at the state lodge below the peak",
        lat: 23.70071,
        lng: 92.60969,
        contact: "+91 98191-97013",
      },
      {
        id: "v-gem32-2",
        name: "Mizo Handloom Stall",
        category: "Artisan",
        specialty: "Puan textiles woven by village women's groups",
        lat: 23.69681,
        lng: 92.60549,
        contact: "+91 98322-10324",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Sunday is church day and the village goes quiet — visit on other days and dress modestly.", lat: 23.69561, lng: 92.60539 },
      { tag: "Avoid After Dark", message: "The Tlang cliff edge has no railing; descend well before dusk.", lat: 23.70121, lng: 92.61059 },
    ],
    mainstreamPopularityIndex: 8,
    vouchesCount: 13,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-19T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222033",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Dzongu — The Lepcha Hidden Land",
    region: "Meghalaya & Northeast",
    category: "Hidden Village",
    rawDescription:
      "A protected Lepcha homeland the Lepchas call Mayal Lyang, 'the hidden land blessed by the gods' — a green amphitheatre of cardamom fields, hot springs and waterfalls where the Teesta is still wild. Family homestays in villages like Lingthem, shamans' stories, and Kanchenjunga filling the morning window.",
    lat: 27.5031,
    lng: 88.5278,
    media: [
      {
        type: "image",
        url: "https://ekaxp.in/wp-content/uploads/2021/05/Sikkim-Road-Trip-Eka-Experiences-village1-2.jpg",
        aspect: "portrait",
        caption: "Cardamom valleys of Dzongu under Kanchenjunga",
      },
    ],
    structuredCards: {
      commute: [
        "Enter via Mangan with a special Dzongu permit (arranged by your homestay).",
        "Shared jeeps Gangtok–Mangan (4 hrs), then homestay pickup across the Teesta.",
      ],
      food: [
        { name: "Khuri & Sisnu Soup", detail: "Buckwheat rolls and nettle soup — Lepcha mountain staples at homestay tables.", priceHint: "INR 150" },
        { name: "Cardamom Tea & Sel Roti", detail: "Large-cardamom-spiced tea with crisp rice-flour sel roti.", priceHint: "INR 60" },
      ],
      activities: [
        "Soak in the Lingzya hot springs after a cardamom-field walk.",
        "Listen to a Lepcha shaman (bongthing) narrate Mayal Lyang creation stories.",
      ],
    },
    localVendors: [
      {
        id: "v-gem33-1",
        name: "Lingthem Family Homestay",
        category: "Homestay",
        specialty: "Lepcha family home, farm meals & permit help",
        lat: 27.5052,
        lng: 88.5297,
        contact: "+91 98198-16784",
      },
      {
        id: "v-gem33-2",
        name: "Dzongu Cardamom Collective",
        category: "Artisan",
        specialty: "Large cardamom & handloom from reserve villages",
        lat: 27.5013,
        lng: 88.5255,
        contact: "+91 98329-20095",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "No network beyond Mangan on most days; permits are checked at the bridge — keep copies.", lat: 27.5001, lng: 88.5254 },
      { tag: "Cultural Etiquette", message: "Dzongu is a sacred reserve for Lepchas; follow homestay guidance on photography and river rituals.", lat: 27.5057, lng: 88.5306 },
    ],
    mainstreamPopularityIndex: 11,
    vouchesCount: 18,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-20T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222034",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Asharikandi Terracotta Village — Assam",
    region: "Meghalaya & Northeast",
    category: "Sacred & Craft",
    rawDescription:
      "India's largest terracotta craft cluster in Dhubri, where 130+ families — most of them women artisans — shape local hiramati clay into deities, toys and the iconic Hatima Putul mother-and-child doll, a National Award winner in 1982. Kilns smoke in every courtyard; the craft took a GI tag in March 2024.",
    lat: 26.09233,
    lng: 89.99871,
    media: [
      {
        type: "image",
        url: "https://img-cdn.publive.online/fit-in/1200x675/30-stades/media/media_files/guEMvVCkWCfPuyBRgnTC.jpg",
        aspect: "portrait",
        caption: "Hatima dolls drying in an Asharikandi courtyard",
      },
    ],
    structuredCards: {
      commute: [
        "Auto or bus from Dhubri town (14 km); Guwahati–Dhubri is a 5-hr drive or train ride.",
        "Mornings are best — kilns open and dolls come out to dry in the courtyards.",
      ],
      food: [
        { name: "Masor Jhol & Khar", detail: "Assamese fish curry with the alkaline khar starter at Dhubri eateries.", priceHint: "INR 190" },
        { name: "Pitha & Jolpan", detail: "Rice cakes and curd-jaggery jolpan at village tea stalls.", priceHint: "INR 60" },
      ],
      activities: [
        "Try the potter's wheel with a Kumar family and shape your own Hatima doll.",
        "Walk the full craft lane comparing kiln styles courtyard to courtyard.",
      ],
    },
    localVendors: [
      {
        id: "v-gem34-1",
        name: "Hatima Putul Artisan Home",
        category: "Artisan",
        specialty: "Award-lineage terracotta dolls sold from the maker's courtyard",
        lat: 26.09443,
        lng: 90.00061,
        contact: "+91 98205-26555",
      },
      {
        id: "v-gem34-2",
        name: "Asharikandi Craft Society Shop",
        category: "Artisan",
        specialty: "Village collective store with GI-tagged pieces",
        lat: 26.09053,
        lng: 89.99641,
        contact: "+91 98336-29866",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Middlemen at Dhubri town resell at 3x — buy inside the village courtyards.", lat: 26.08933, lng: 89.99631 },
      { tag: "Cultural Etiquette", message: "Most artisans are women working from home; ask at the gate before entering a courtyard.", lat: 26.09493, lng: 90.00151 },
    ],
    mainstreamPopularityIndex: 9,
    vouchesCount: 15,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-21T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222035",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Kiradu — The Cursed Temples of the Thar",
    region: "Kutch & Thar",
    category: "Sacred & Craft",
    rawDescription:
      "A ghost cluster of 11th–12th century sandstone temples standing alone in the Thar scrub near Barmer, carved so densely they're called the 'Khajuraho of Rajasthan'. The Someshvara temple rises out of rubble and silence — no queues, no shops. Legend says the town was cursed and abandoned overnight, so nobody stays after dark.",
    lat: 25.75293,
    lng: 71.09745,
    media: [
      {
        type: "image",
        url: "https://alchetron.com/cdn/kiradu-temples-8ed55cf5-c6c0-4b44-a36e-b6a10e97d87-resize-750.jpeg",
        aspect: "portrait",
        caption: "Someshvara temple standing alone in the Thar scrub",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Barmer (35 km); hire a jeep in Barmer — no public transport reaches the site.",
        "Pair with Barmer's wood-carving lanes and the Mahabar dunes at sunset.",
      ],
      food: [
        { name: "Ker Sangri & Bajra Roti", detail: "Desert beans and sangri pods in spiced curd with millet roti at Barmer dhabas.", priceHint: "INR 170" },
        { name: "Pyaaz Kachori & Mirchi Bada", detail: "Barmer's breakfast of champions with lashun chutney.", priceHint: "INR 60" },
      ],
      activities: [
        "Read the Someshvara shikhara sculptures panel by panel in the morning light.",
        "Find the Vishnu and Shiva temples scattered across the silent site.",
      ],
    },
    localVendors: [
      {
        id: "v-gem35-1",
        name: "Barmer Woodcraft Lane",
        category: "Artisan",
        specialty: "Carved furniture and blocks from Barmer's artisan quarters",
        lat: 25.75503,
        lng: 71.09935,
        contact: "+91 98212-36326",
      },
      {
        id: "v-gem35-2",
        name: "Kiradu Site Chowkidar Desk",
        category: "Cultural Practitioner",
        specialty: "The site caretaker's informal guided walk — ask at the gate",
        lat: 25.75113,
        lng: 71.09515,
        contact: "+91 98343-39637",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Locals honour the curse legend and the site is unlit desert — leave before sunset, respectfully.", lat: 25.74993, lng: 71.09505 },
      { tag: "Low Network", message: "No water or shops at site; carry 2 litres per person from Barmer.", lat: 25.75553, lng: 71.10025 },
    ],
    mainstreamPopularityIndex: 10,
    vouchesCount: 16,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-22T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222036",
    authorId: "11111111-1111-4111-8111-111111111106",
    title: "Polo Forest — Temples the Jungle Took Back",
    region: "Kutch & Thar",
    category: "Nature & Trail",
    rawDescription:
      "A 400 sq km deciduous jungle in the Aravalli foothills of Sabarkantha where 15th-century Hindu and Jain temples are being swallowed by teak and vines along the Harnav river. Trek between ruined shrines and a check-dam in leopard and sloth-bear country — emerald and waterfall-dotted right after monsoon.",
    lat: 23.9972,
    lng: 73.24913,
    media: [
      {
        type: "image",
        url: "https://gujarattourism.com/content/dam/gujrattourism/images/-flora---fauna/polo-forest/Polo_forest_1.jpg",
        aspect: "portrait",
        caption: "Ancient shrines inside Polo's teak forest",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Ahmedabad (150 km) or Idar; base at Vijaynagar village.",
        "Enter with a local guide from the forest gate — trails are unmarked.",
      ],
      food: [
        { name: "Gujarati Thali at Vijaynagar", detail: "Rotla, shaak, dal and kadhi at village thali houses near the gate.", priceHint: "INR 180" },
        { name: "Masala Chhas & Handvo", detail: "Spiced buttermilk and baked handvo from highway stalls.", priceHint: "INR 70" },
      ],
      activities: [
        "Trek the Harnav river trail linking the Jain and Shiv temple ruins.",
        "Birdwatch at the check-dam at dawn — peacocks, owls and paradise flycatchers.",
      ],
    },
    localVendors: [
      {
        id: "v-gem36-1",
        name: "Polo Forest Guide Sangh",
        category: "Cultural Practitioner",
        specialty: "Village guide collective at the forest entry",
        lat: 23.9993,
        lng: 73.25103,
        contact: "+91 98219-46097",
      },
      {
        id: "v-gem36-2",
        name: "Vijaynagar Riverside Homestay",
        category: "Homestay",
        specialty: "Simple rooms and farm meals near the Harnav",
        lat: 23.9954,
        lng: 73.24683,
        contact: "+91 98350-49408",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Leopards move at dusk; be back at the gate before sunset, no exceptions.", lat: 23.9942, lng: 73.24673 },
      { tag: "Low Network", message: "Monsoon turns forest tracks to slush — check road state at Vijaynagar before entering.", lat: 23.9998, lng: 73.25193 },
    ],
    mainstreamPopularityIndex: 12,
    vouchesCount: 19,
    verifiedCheckinsCount: 6,
    createdAt: "2026-11-23T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222037",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Mandu — The Abandoned City of Joy",
    region: "Central India & Deccan",
    category: "Living Heritage",
    rawDescription:
      "An entire abandoned Afghan-era capital scattered across a green Mandu plateau: the Jahaz Mahal 'ship palace' floating between two lakes, Hindola Mahal's sloping walls, and baobabs planted centuries ago. Cycle empty royal roads at dawn and hear the Baz Bahadur–Rani Roopmati romance at her hilltop pavilion.",
    lat: 22.327,
    lng: 75.4053,
    media: [
      {
        type: "image",
        url: "https://www.indiaimagine.com/wp-content/uploads/2020/06/jahaz-mahal-mandu.jpg",
        aspect: "portrait",
        caption: "Jahaz Mahal floating between Mandu's lakes",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Indore (95 km, 2.5 hrs); MP Tourism buses run in season.",
        "Rent a bicycle at the village square — Mandu is best read at cycling speed.",
      ],
      food: [
        { name: "Dal Bafla & Ladoo", detail: "MP's festive wheat bafla drowned in ghee with dal, at Mandu village dhabas.", priceHint: "INR 160" },
        { name: "Khopra Patties & Poha-Jalebi", detail: "Indori breakfast detour on the drive in — worth the stop at Mhow.", priceHint: "INR 90" },
      ],
      activities: [
        "Photograph Jahaz Mahal's reflection at sunrise before the day buses arrive.",
        "Climb Roopmati Pavilion at dusk for the Narmada valley haze and the love story.",
      ],
    },
    localVendors: [
      {
        id: "v-gem37-1",
        name: "Mandu Village Cycle Point",
        category: "Cultural Practitioner",
        specialty: "Cycle hire with hand-drawn ruin maps",
        lat: 22.3291,
        lng: 75.4072,
        contact: "+91 98226-55868",
      },
      {
        id: "v-gem37-2",
        name: "Baobab Juice Stall",
        category: "Food Vendor",
        specialty: "Khurasani imli (baobab) sherbet near the palace cluster",
        lat: 22.3252,
        lng: 75.403,
        contact: "+91 98357-59179",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Ruins are unfenced and spread over kilometres; finish by sunset.", lat: 22.324, lng: 75.4029 },
      { tag: "Scam Alert", message: "Unofficial 'guides' at the gate inflate prices — hire through MP Tourism or your hotel.", lat: 22.3296, lng: 75.4081 },
    ],
    mainstreamPopularityIndex: 22,
    vouchesCount: 26,
    verifiedCheckinsCount: 9,
    createdAt: "2026-11-24T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222038",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Lonar Crater Lake — A Mars Analogue in Maharashtra",
    region: "Deccan & Western Ghats",
    category: "Nature & Trail",
    rawDescription:
      "A near-perfect circular lake punched into basalt by a meteor tens of thousands of years ago — one of only four impact craters in basaltic rock on Earth, and a Ramsar site. Hike the forested rim past medieval temples to an emerald alkaline lake that famously turned pink in 2020; NASA studies it as a Mars analogue.",
    lat: 19.97047,
    lng: 76.51498,
    media: [
      {
        type: "image",
        url: "https://travvana.com/assets/images/states/maharashtra/lonar-crater-lake.webp",
        aspect: "portrait",
        caption: "The emerald crater lake inside Lonar's basalt bowl",
      },
    ],
    structuredCards: {
      commute: [
        "Bus or taxi from Jalna (railhead, 85 km) or Buldhana; MTDC resort sits on the rim.",
        "The rim-to-lake trail takes 45 mins down; carry water, there's none below.",
      ],
      food: [
        { name: "Shev Bhaji & Bhakri", detail: "Vidarbha's fiery gram-flour shev curry with jowar bhakri at Lonar eateries.", priceHint: "INR 140" },
        { name: "Saoji Mutton (detour)", detail: "If routing via Nagpur side, the legendary saoji spice houses are a pilgrimage.", priceHint: "INR 320" },
      ],
      activities: [
        "Walk the full rim trail linking the Daitya Sudhan and other crater temples.",
        "Descend to the lakeshore and watch the water shift colour with the light.",
      ],
    },
    localVendors: [
      {
        id: "v-gem38-1",
        name: "MTDC Lonar Resort",
        category: "Homestay",
        specialty: "Rim-side stay with crater guide desk",
        lat: 19.97257,
        lng: 76.51688,
        contact: "+91 98233-65639",
      },
      {
        id: "v-gem38-2",
        name: "Lonar Crater Guide Mandal",
        category: "Cultural Practitioner",
        specialty: "Local naturalist guides at the rim entry",
        lat: 19.96867,
        lng: 76.51268,
        contact: "+91 98364-68940",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "The descent trail is steep and slippery after rain; no night entry to the crater.", lat: 19.96747, lng: 76.51258 },
      { tag: "Low Network", message: "Download the trail map at Jalna; signal fades inside the bowl.", lat: 19.97307, lng: 76.51778 },
    ],
    mainstreamPopularityIndex: 17,
    vouchesCount: 23,
    verifiedCheckinsCount: 7,
    createdAt: "2026-11-06T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222039",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Tambdi Surla — Goa's Oldest Temple, Hidden by Forest",
    region: "Malabar & Konkan",
    category: "Sacred & Craft",
    rawDescription:
      "Goa's oldest surviving temple — a 12th-century Kadamba-era Shiva shrine of dark basalt at the end of a jungle road in Bhagwan Mahavir Wildlife Sanctuary. It survived invasions and the Portuguese era because the forest hid it; the carved ceiling lotus and headless Nandi are still in worship, with a stream running beside it.",
    lat: 15.4397,
    lng: 74.3132,
    media: [
      {
        type: "image",
        url: "https://tripxl.com/blog/wp-content/uploads/2024/09/Mahadev-Tambdi-Surla-Temple.jpg",
        aspect: "portrait",
        caption: "Basalt Mahadev temple in the sanctuary forest",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Ponda (25 km) or Sanvordem into the sanctuary; taxis wait at the gate.",
        "Pair with a spice-farm lunch in Ponda on the way back.",
      ],
      food: [
        { name: "Goan Hindu Thali", detail: "Rice, sol kadhi, bhaji and fried fish at family eateries near Sanvordem.", priceHint: "INR 210" },
        { name: "Kokum Sherbet & Mirchi Pakoda", detail: "Forest-edge stall refreshments by the sanctuary gate.", priceHint: "INR 60" },
      ],
      activities: [
        "Study the ceiling lotus carving — Kadamba craftsmanship at its finest.",
        "Walk the stream trail behind the temple into the sanctuary buffer forest.",
      ],
    },
    localVendors: [
      {
        id: "v-gem39-1",
        name: "Surla Forest Edge Homestay",
        category: "Homestay",
        specialty: "Village homes near the sanctuary gate",
        lat: 15.4418,
        lng: 74.3151,
        contact: "+91 98240-75400",
      },
      {
        id: "v-gem39-2",
        name: "Ponda Spice Farm Kitchen",
        category: "Food Vendor",
        specialty: "Traditional Goan Saraswat meals among the spice groves",
        lat: 15.4379,
        lng: 74.3109,
        contact: "+91 98371-78711",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Active temple — leather items are traditionally left outside; dress modestly.", lat: 15.4367, lng: 74.3108 },
      { tag: "Avoid After Dark", message: "Sanctuary roads close at dusk and wildlife crosses freely; plan a daytime visit.", lat: 15.4423, lng: 74.316 },
    ],
    mainstreamPopularityIndex: 15,
    vouchesCount: 21,
    verifiedCheckinsCount: 8,
    createdAt: "2026-11-07T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222040",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Amarkantak — Where Three Rivers Are Born",
    region: "Central India & Deccan",
    category: "Hidden Village",
    rawDescription:
      "A forested hill town at 1,048 m where the Narmada flows west and the Son flows east from the same sacred kund ringed by white Kalchuri-era temples. Crowd-less aarti at Narmada Udgam, the Kapil Dhara waterfall through sal forest, and air scented with the medicinal herbs of the Maikal hills.",
    lat: 22.68265,
    lng: 81.75307,
    media: [
      {
        type: "image",
        url: "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/09/How-To-Reach-Amarkantak-Temple-Madhya-Pradesh.jpg",
        aspect: "portrait",
        caption: "Narmada Udgam temples in the Maikal hills",
      },
    ],
    structuredCards: {
      commute: [
        "Nearest railhead Pendra Road (30 km) with taxis up the ghat; Jabalpur is 5 hrs by road.",
        "Stay in town — the kund aarti and waterfalls are all walkable or a short auto ride.",
      ],
      food: [
        { name: "Satvik Thali at Ashram Bhojanalaya", detail: "Simple no-onion-garlic pilgrim meals near the kund.", priceHint: "INR 110" },
        { name: "Mahua & Sal Seed Sweets", detail: "Forest-produce sweets sold by Baiga tribal vendors in the bazaar.", priceHint: "INR 50" },
      ],
      activities: [
        "Attend the quiet evening aarti where the Narmada first surfaces.",
        "Trek through sal forest to Kapil Dhara and Dudh Dhara waterfalls.",
      ],
    },
    localVendors: [
      {
        id: "v-gem40-1",
        name: "Narmada Udgam Pilgrim Niwas",
        category: "Homestay",
        specialty: "Simple stays run by temple trusts near the kund",
        lat: 22.68475,
        lng: 81.75497,
        contact: "+91 98247-85171",
      },
      {
        id: "v-gem40-2",
        name: "Baiga Herbal Collective",
        category: "Artisan",
        specialty: "Forest herbs, honey & mahua products by Baiga families",
        lat: 22.68085,
        lng: 81.75077,
        contact: "+91 98378-88482",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "The kund is deeply sacred — no photography during aarti and no entering the water.", lat: 22.67965, lng: 81.75067 },
      { tag: "Low Network", message: "Monsoon landslides can cut the Pendra Road ghat; check before travelling June–Sept.", lat: 22.68525, lng: 81.75587 },
    ],
    mainstreamPopularityIndex: 18,
    vouchesCount: 20,
    verifiedCheckinsCount: 7,
    createdAt: "2026-11-08T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222041",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Surti Locho — Surat's Happy Accident",
    region: "Kutch & Thar",
    category: "Regional Cuisine",
    rawDescription:
      "Surat's beloved 'mistake dish' — a khaman batter that slumped in the steamer ('locho thai gayo' — it went loose) and became a legend. Served steaming and scoop-soft, drowned in butter, sev, onion, coriander and locho masala, eaten with a spoon standing at a street stall at breakfast.",
    lat: 21.1859,
    lng: 72.83661,
    media: [
      {
        type: "image",
        url: "https://www.rachnakar.com/wp-content/uploads/2021/08/Surti-locho-768x796.jpg",
        aspect: "portrait",
        caption: "A plate of butter-drowned Surti locho",
      },
    ],
    structuredCards: {
      commute: [
        "Locho stalls cluster in Surat's old city (Bhagal, Athwa); auto from Surat station.",
        "Go before 10 am — the best stalls sell out by late morning.",
      ],
      food: [
        { name: "Surti Locho (Original)", detail: "The dish itself — butter, sev, masala, eaten hot with a spoon.", priceHint: "INR 70" },
        { name: "Ponk & Jowar Hurda (winter)", detail: "Tender roasted sorghum grains, Surat's other seasonal obsession.", priceHint: "INR 90" },
      ],
      activities: [
        "Do a Bhagal breakfast crawl: locho, then ghari from a heritage sweet shop.",
        "Watch the steamer theatrics — locho is scooped, never sliced.",
      ],
    },
    localVendors: [
      {
        id: "v-gem41-1",
        name: "Old City Locho Stall Row",
        category: "Food Vendor",
        specialty: "Generations-old locho counters near Bhagal",
        lat: 21.188,
        lng: 72.83851,
        contact: "+91 98254-94942",
      },
      {
        id: "v-gem41-2",
        name: "Surat Ghari Bhandar",
        category: "Food Vendor",
        specialty: "Heritage ghari & ponk sweets in the old city",
        lat: 21.1841,
        lng: 72.83431,
        contact: "+91 98385-98253",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Imitation 'locho' outside Surat is usually just crumbled khaman — in Surat, judge by the queue of locals.", lat: 21.1829, lng: 72.83421 },
      { tag: "Cultural Etiquette", message: "Stalls are tiny and fast; order, eat standing, move on — that's the ritual.", lat: 21.1885, lng: 72.83941 },
    ],
    mainstreamPopularityIndex: 13,
    vouchesCount: 25,
    verifiedCheckinsCount: 10,
    createdAt: "2026-11-09T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222042",
    authorId: "11111111-1111-4111-8111-111111111106",
    title: "Warli Villages of Palghar — Where the Paintings Live",
    region: "Deccan & Western Ghats",
    category: "Living Heritage",
    rawDescription:
      "In the Sahyadri foothill villages of Palghar where Warli art was born, mud-home walls still bloom with white rice-paste figures — tarpa dancers circling hand-in-hand, harvest scenes, the goddess Palghat — painted for weddings and harvests, not galleries. Artists paint entire house-fronts freehand with a chewed bamboo stick.",
    lat: 20.02662,
    lng: 73.25715,
    media: [
      {
        type: "image",
        url: "https://tribesindia.com/public/uploads/all/zscQM6CL9gxDBzImgmSVw6ijGxbg4V15OjTysSZJ.webp",
        aspect: "portrait",
        caption: "A Warli mural in its living village form",
      },
    ],
    structuredCards: {
      commute: [
        "Local train to Palghar, then shared jeeps toward Vikramgad–Jawhar villages.",
        "Book a village stay in advance — walk-ins are rare and homestays are family homes.",
      ],
      food: [
        { name: "Nachni Bhakri & Bamboo Shoot Curry", detail: "Finger-millet bhakri with seasonal bamboo-shoot curry at village homes.", priceHint: "INR 130" },
        { name: "Sol Kadhi & Ukdya Tandlacha Bhat", detail: "Kokum sol kadhi with hand-pounded rice, coastal-tribal style.", priceHint: "INR 110" },
      ],
      activities: [
        "Watch a wedding wall being painted start to finish by women artists.",
        "Join a tarpa dance evening during harvest season in the village square.",
      ],
    },
    localVendors: [
      {
        id: "v-gem42-1",
        name: "Jawhar Warli Homestay",
        category: "Homestay",
        specialty: "Mud-home stays with painting walks",
        lat: 20.02872,
        lng: 73.25905,
        contact: "+91 98261-14713",
      },
      {
        id: "v-gem42-2",
        name: "Warli Artist Collective, Vikramgad",
        category: "Artisan",
        specialty: "Original wall panels & canvases direct from artists",
        lat: 20.02482,
        lng: 73.25485,
        contact: "+91 98392-18024",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Murals are ritual art on private homes — photograph only with the family's permission.", lat: 20.02362, lng: 73.25475 },
      { tag: "Low Network", message: "Carry cash; village stays rarely have card or UPI signal strength.", lat: 20.02922, lng: 73.25995 },
    ],
    mainstreamPopularityIndex: 14,
    vouchesCount: 18,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-10T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222043",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Munroe Island — Canoe Country of Ashtamudi",
    region: "Malabar & Konkan",
    category: "Hidden Village",
    rawDescription:
      "A cluster of eight tiny islands where the Kallada River melts into Ashtamudi Lake, explored almost entirely by narrow wooden canoe through palm-tunnel canals. Coir-making, prawn farms and village life at water level — the same backwater magic as Alleppey with a fraction of the boats.",
    lat: 8.9955,
    lng: 76.61858,
    media: [
      {
        type: "image",
        url: "https://nomadsofindia.com/wp-content/uploads/2023/11/Backwaters-of-Munroe-Island.jpeg",
        aspect: "portrait",
        caption: "Canoe canals under Munroe Island's palm tunnels",
      },
    ],
    structuredCards: {
      commute: [
        "Train to Munroe Island station or drive from Kollam (27 km).",
        "Book a local canoe operator at the jetty — the canals are too narrow for houseboats.",
      ],
      food: [
        { name: "Karimeen Fry & Kallu Shop Meals", detail: "Pearl-spot fish fry with toddy-shop style tapioca and fish curry.", priceHint: "INR 260" },
        { name: "Kappa & Meen Curry", detail: "Boiled tapioca with fiery red fish curry at island homes.", priceHint: "INR 150" },
      ],
      activities: [
        "Sunrise canoe through the palm-tunnel canals as the island wakes.",
        "Watch coir being spun and retted in the backwater courtyards.",
      ],
    },
    localVendors: [
      {
        id: "v-gem43-1",
        name: "Munroe Canoe Collective",
        category: "Cultural Practitioner",
        specialty: "Village canoe tours run by island families",
        lat: 8.9976,
        lng: 76.62048,
        contact: "+91 98268-24484",
      },
      {
        id: "v-gem43-2",
        name: "Ashtamudi Island Homestay",
        category: "Homestay",
        specialty: "Waterside homes with home-cooked Kerala meals",
        lat: 8.9937,
        lng: 76.61628,
        contact: "+91 98399-27795",
      },
    ],
    safetyAlerts: [
      { tag: "Low Network", message: "Book your canoe the previous evening; walk-ins wait hours on weekends.", lat: 8.9925, lng: 76.61618 },
      { tag: "Avoid After Dark", message: "Canals are unlit and tides shift sandbars — no boating after sunset.", lat: 8.9981, lng: 76.62138 },
    ],
    mainstreamPopularityIndex: 16,
    vouchesCount: 24,
    verifiedCheckinsCount: 9,
    createdAt: "2026-11-11T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222044",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Aranmula — The Mirror That Isn't Glass",
    region: "Malabar & Konkan",
    category: "Sacred & Craft",
    rawDescription:
      "A temple village on the Pamba river famous for a mirror made of polished metal, not glass — its alloy recipe is a secret held by a handful of artisan families for centuries. The same village hosts the grand Vallasadya ritual feast and a snake-boat race tied to the ancient Parthasarathy temple.",
    lat: 9.3295,
    lng: 76.5738,
    media: [
      {
        type: "image",
        url: "https://cdn.shopify.com/s/files/1/1954/9241/products/image_d8362ca7-2423-4334-9aa0-dcff94c3a3a0_530x@2x.jpg?v=1606545022",
        aspect: "portrait",
        caption: "An Aranmula kannadi — polished metal, perfect reflection",
      },
    ],
    structuredCards: {
      commute: [
        "Nearest railhead Chengannur (10 km); taxis and buses to Aranmula village.",
        "Visit a kannadi workshop in the morning when polishing work happens.",
      ],
      food: [
        { name: "Vallasadya Sadya (seasonal)", detail: "The legendary ritual feast of 60+ dishes served to oarsmen at the temple.", priceHint: "INR 500" },
        { name: "Pamba River Fish Fry", detail: "River fish fry with Kerala meals at village hotels.", priceHint: "INR 220" },
      ],
      activities: [
        "Watch a kannadi mirror being cast and polished in a family workshop.",
        "See the snake boats resting in their sheds along the Pamba.",
      ],
    },
    localVendors: [
      {
        id: "v-gem44-1",
        name: "Aranmula Kannadi Heritage Workshop",
        category: "Artisan",
        specialty: "GI-tagged metal mirrors from the original artisan families",
        lat: 9.3316,
        lng: 76.5757,
        contact: "+91 98275-34255",
      },
      {
        id: "v-gem44-2",
        name: "Parthasarathy Temple Street Stalls",
        category: "Food Vendor",
        specialty: "Sadya meals and banana chips near the temple",
        lat: 9.3277,
        lng: 76.5715,
        contact: "+91 98406-37566",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Cheap 'Aranmula-style' mirrors sold online are glass — genuine kannadi is metal, heavy, and reflects without green tint.", lat: 9.3265, lng: 76.5714 },
      { tag: "Cultural Etiquette", message: "The alloy process is a family secret; workshops welcome watching, not filming the casting.", lat: 9.3321, lng: 76.5766 },
    ],
    mainstreamPopularityIndex: 12,
    vouchesCount: 19,
    verifiedCheckinsCount: 6,
    createdAt: "2026-11-12T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222045",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Pichavaram — The Mangrove Labyrinth",
    region: "Malabar & Konkan",
    category: "Nature & Trail",
    rawDescription:
      "One of the world's largest mangrove forests — roughly 1,100 hectares of emerald waterways near Chidambaram where a rowboat slips through root-canopy tunnels barely wider than the boat. Sunlight falls in shafts, and the channels teem with birds and fish nurseries.",
    lat: 11.43195,
    lng: 79.78056,
    media: [
      {
        type: "image",
        url: "https://content.jdmagicbox.com/v2/comp/cuddalore/t2/9999p4142.4142.181113165214.i7t2/catalogue/pichavaram-mangrove-forest-pichavaram-cuddalore-forests-mt2shl5ujo.jpg",
        aspect: "portrait",
        caption: "A rowboat inside Pichavaram's mangrove tunnels",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Chidambaram (16 km); TTDC boathouse is the entry point.",
        "Rowboats beat motorboats here — slower, quieter, and they fit the tunnels.",
      ],
      food: [
        { name: "Prawn Thokku & Rice", detail: "Coastal prawn masala with rice at boathouse-side eateries.", priceHint: "INR 240" },
        { name: "Nandu Soup", detail: "Peppery crab soup, the Coromandel coast's cold cure.", priceHint: "INR 120" },
      ],
      activities: [
        "Take the long rowboat route deep into the root-canopy tunnels.",
        "Birdwatch the backwater edge at dawn — herons, kingfishers, sea eagles.",
      ],
    },
    localVendors: [
      {
        id: "v-gem45-1",
        name: "TTDC Pichavaram Boathouse",
        category: "Cultural Practitioner",
        specialty: "Official rowboat hire with local boatmen",
        lat: 11.43405,
        lng: 79.78246,
        contact: "+91 98282-44026",
      },
      {
        id: "v-gem45-2",
        name: "Killai Fisherfolk Kitchen",
        category: "Food Vendor",
        specialty: "Seafood meals in the fishing village nearby",
        lat: 11.43015,
        lng: 79.77826,
        contact: "+91 98413-47337",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Boating stops by evening; tides govern tunnel routes — follow the boatman's call.", lat: 11.42895, lng: 79.77816 },
      { tag: "Low Network", message: "Carry cash for boat tickets; the boathouse connection is unreliable.", lat: 11.43455, lng: 79.78336 },
    ],
    mainstreamPopularityIndex: 15,
    vouchesCount: 22,
    verifiedCheckinsCount: 8,
    createdAt: "2026-11-13T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222046",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Kolli Hills — 70 Hairpins to the Sky",
    region: "Malabar & Konkan",
    category: "Nature & Trail",
    rawDescription:
      "A compact Eastern Ghats range in Namakkal reached by a legendary road of 70 continuous hairpin bends, opening into cool jackfruit highlands farmed by Malayali tribal communities. Hundreds of steps drop to the Agaya Gangai waterfall crashing through a gorge, below the ancient Arappaleeswarar temple.",
    lat: 11.2783,
    lng: 78.3715,
    media: [
      {
        type: "image",
        url: "https://img-mm.manoramaonline.com/content/dam/mm/mo/travel/travel-india/images/2025/2/1/kolli-hills.jpg",
        aspect: "portrait",
        caption: "Hairpin bends climbing into the Kolli highlands",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Namakkal (45 km) or Salem; the ghat road has 70 numbered hairpins.",
        "Semmedu is the hill headquarters — base there for falls and temple.",
      ],
      food: [
        { name: "Kolli Jackfruit & Pineapple", detail: "Hill-grown jackfruit and the famed Kolli pineapples at roadside stalls.", priceHint: "INR 80" },
        { name: "Millet Meals & Country Chicken", detail: "Tribal-style millet meals with nattu kozhi curry at Semmedu eateries.", priceHint: "INR 230" },
      ],
      activities: [
        "Descend the 1,000+ steps to Agaya Gangai falls and feel the gorge thunder.",
        "Ride the hairpins at dawn when mist pours over the bends.",
      ],
    },
    localVendors: [
      {
        id: "v-gem46-1",
        name: "Semmedu Hill Homestay",
        category: "Homestay",
        specialty: "Family stays among the jackfruit groves",
        lat: 11.2804,
        lng: 78.3734,
        contact: "+91 98289-53797",
      },
      {
        id: "v-gem46-2",
        name: "Kolli Farmers' Produce Stall",
        category: "Food Vendor",
        specialty: "Hill spices, honey & pineapples by tribal farmers",
        lat: 11.2765,
        lng: 78.3692,
        contact: "+91 98420-57108",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "The ghat road is steep and fog-prone; first-time drivers should descend before dark.", lat: 11.2753, lng: 78.3691 },
      { tag: "Low Network", message: "Carry cash and offline maps — coverage vanishes between bends.", lat: 11.2809, lng: 78.3743 },
    ],
    mainstreamPopularityIndex: 13,
    vouchesCount: 20,
    verifiedCheckinsCount: 7,
    createdAt: "2026-11-14T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222047",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Banavasi — Karnataka's First Capital",
    region: "Deccan & Western Ghats",
    category: "Living Heritage",
    rawDescription:
      "One of India's oldest living towns, capital of the Kadamba dynasty in the 4th century, wrapped around the stone-carved 9th-century Madhukeshwara Temple on the Varada river. Kannada's first great poet Pampa wrote here — and the town is equally loved for its sweet Banavasi pineapples sold along the temple streets.",
    lat: 14.53911,
    lng: 75.01678,
    media: [
      {
        type: "image",
        url: "https://web-cms.karnatakatourism.org/wp-content/uploads/2025/07/Madhukeshwara-Temple-Banavasi.jpg",
        aspect: "portrait",
        caption: "Madhukeshwara Temple in old Banavasi",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Sirsi (23 km) through areca and pepper country.",
        "Pair with Sahasralinga's river carvings near Sirsi on the same day.",
      ],
      food: [
        { name: "Banavasi Pineapple", detail: "The town's famed extra-sweet pineapples, sold sliced with chilli-salt.", priceHint: "INR 50" },
        { name: "Jolada Rotti Oota", detail: "North-Karnataka jowar roti meals at temple-street hotels.", priceHint: "INR 140" },
      ],
      activities: [
        "Circle the Madhukeshwara Temple reading its Chalukya-era stone screens.",
        "Walk to the Varada river ghats where the old capital's ferries ran.",
      ],
    },
    localVendors: [
      {
        id: "v-gem47-1",
        name: "Banavasi Temple Street Stalls",
        category: "Food Vendor",
        specialty: "Pineapple, flowers & prasadam sweets by local families",
        lat: 14.54121,
        lng: 75.01868,
        contact: "+91 98296-63568",
      },
      {
        id: "v-gem47-2",
        name: "Varada Riverside Homestay",
        category: "Homestay",
        specialty: "Heritage homes near the temple with farm meals",
        lat: 14.53731,
        lng: 75.01448,
        contact: "+91 98427-66879",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "The temple is in daily worship; leather belts and bags are left outside the sanctum.", lat: 14.53611, lng: 75.01438 },
      { tag: "Low Network", message: "Evenings are very quiet — arrange dinner with your stay in advance.", lat: 14.54171, lng: 75.01958 },
    ],
    mainstreamPopularityIndex: 10,
    vouchesCount: 15,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-15T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222048",
    authorId: "11111111-1111-4111-8111-111111111106",
    title: "Melukote — Temple Town of the Legendary Puliyogare",
    region: "Deccan & Western Ghats",
    category: "Regional Cuisine",
    rawDescription:
      "A hilltop temple town of the Cheluvanarayana Swamy temple and a famed Sanskrit academy — but food lovers come for one thing: Melukote puliyogare, tangy tamarind rice made as temple prasadam, so iconic its ready mix fills the streets below. Dawn at the Yoga Narasimha temple, then puliyogare and sakkare pongal on a banana leaf.",
    lat: 12.66202,
    lng: 76.64876,
    media: [
      {
        type: "image",
        url: "https://worldhindutemples.com/uploads/2024/10/1727765461_48dd9bd68e82ffae4a1f.jpg",
        aspect: "portrait",
        caption: "Cheluvanarayana Swamy temple, Melukote",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Mysuru (51 km) or Pandavapura (rail); KSRTC buses run through the day.",
        "Climb the Yoga Narasimha hill early — the steps heat up by noon.",
      ],
      food: [
        { name: "Melukote Puliyogare", detail: "The original — tamarind rice with the temple-town's signature spice mix.", priceHint: "INR 60" },
        { name: "Sakkare Pongal & Puliyogare Combo", detail: "Sweet jaggery pongal balancing the sour legend, on one leaf.", priceHint: "INR 80" },
      ],
      activities: [
        "Watch puliyogare being mixed in giant prasadam vessels at the temple kitchen.",
        "Explore the Sanskrit academy's manuscript library lanes above the tank.",
      ],
    },
    localVendors: [
      {
        id: "v-gem48-1",
        name: "Temple Prasadam Counter",
        category: "Food Vendor",
        specialty: "Puliyogare & pongal prasadam at the temple gate",
        lat: 12.66412,
        lng: 76.65066,
        contact: "+91 98303-73339",
      },
      {
        id: "v-gem48-2",
        name: "Melukote Mix Makers' Lane",
        category: "Artisan",
        specialty: "Family-run puliyogare mix shops below the hill",
        lat: 12.66022,
        lng: 76.64646,
        contact: "+91 98434-76640",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Temple dress code applies on the hill; prasadam queues are orderly — join, don't jump.", lat: 12.65902, lng: 76.64636 },
      { tag: "Scam Alert", message: "Every shop claims the 'original' mix — buy from the two oldest lanes near the temple steps.", lat: 12.66462, lng: 76.65156 },
    ],
    mainstreamPopularityIndex: 14,
    vouchesCount: 23,
    verifiedCheckinsCount: 9,
    createdAt: "2026-11-16T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222049",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Bobbili — Where Veenas Are Born",
    region: "Central India & Deccan",
    category: "Living Heritage",
    rawDescription:
      "In this former royal town in Vizianagaram district, Sarwasiddi artisan families carve an entire Saraswati veena from a single jackfruit-wood log — a GI-tagged craft patronised by the Bobbili rajas for over 300 years. Workshops double as living rooms, and miniature Bobbili veenas are among Andhra's most distinctive souvenirs.",
    lat: 18.57327,
    lng: 83.35878,
    media: [
      {
        type: "image",
        url: "https://www.dsource.in/sites/default/files/styles/mini_responsivecustom_user_tablet_1x/public/resource/veena-making-bobbili-andhra-pradesh/making-process/big-sized-veena/minigallery/19828/30.jpg?itok=DklI1DYz&timestamp=1621404950",
        aspect: "portrait",
        caption: "A Bobbili veena taking shape from one jackfruit log",
      },
    ],
    structuredCards: {
      commute: [
        "Bobbili has its own rail station; Vizianagaram is 55 km for bigger connections.",
        "Workshops line the old town — ask any shopkeeper to point you to a veena home.",
      ],
      food: [
        { name: "Andhra Meals & Gongura", detail: "Full Andhra meals with gongura pachadi at town hotels.", priceHint: "INR 160" },
        { name: "Bobbilipalem Sweets", detail: "Local jaggery sweets sold near the fort gate.", priceHint: "INR 70" },
      ],
      activities: [
        "Watch a veena body being hollowed from a single log in a family workshop.",
        "See the Bobbili fort gate and the rajas' durbar relics in the old town.",
      ],
    },
    localVendors: [
      {
        id: "v-gem49-1",
        name: "Sarwasiddi Veena Workshop",
        category: "Artisan",
        specialty: "Concert & miniature veenas carved by artisan families",
        lat: 18.57537,
        lng: 83.36068,
        contact: "+91 98310-83100",
      },
      {
        id: "v-gem49-2",
        name: "Bobbili Craft Bazaar",
        category: "Artisan",
        specialty: "Miniature veenas and palm-leaf craft near the fort",
        lat: 18.57147,
        lng: 83.35648,
        contact: "+91 98441-86411",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Workshops are homes; visits are by greeting and patience, not tickets.", lat: 18.57027, lng: 83.35638 },
      { tag: "Low Network", message: "Order miniatures in person — shipping promises from strangers are unreliable.", lat: 18.57587, lng: 83.36158 },
    ],
    mainstreamPopularityIndex: 8,
    vouchesCount: 12,
    verifiedCheckinsCount: 3,
    createdAt: "2026-11-17T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222050",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Nirmal — The Toy & Painting Town of Telangana",
    region: "Deccan & Western Ghats",
    category: "Living Heritage",
    rawDescription:
      "A 400-year-old craft town on the Hyderabad–Nagpur highway where Naqash artisans paint glowing Ramayana and Mahabharata scenes in natural dyes on wood panels, and carve feather-light toys from soft poniki wood. Entire lanes are workshops; both the paintings and the wooden craft carry GI tags.",
    lat: 19.08686,
    lng: 78.33978,
    media: [
      {
        type: "image",
        url: "https://www.tusktravel.com/blog/wp-content/uploads/2022/10/Nirmal-Toys-Telangana.jpg",
        aspect: "portrait",
        caption: "Nirmal's painted wooden craft in its home town",
      },
    ],
    structuredCards: {
      commute: [
        "NH-44 from Hyderabad (210 km) passes Nirmal — an easy highway stop.",
        "The craft lanes (Nakash galli) are a short walk from the bus stand.",
      ],
      food: [
        { name: "Telangana Pachi Pulusu & Bagara Rice", detail: "Raw tamarind rasam with bagara annam at town eateries.", priceHint: "INR 150" },
        { name: "Sakinalu & Sarva Pindi", detail: "Crisp rice-flour sakinalu, Telangana's festive snack.", priceHint: "INR 50" },
      ],
      activities: [
        "Watch a Naqash painter layer natural dyes on a Ramayana panel.",
        "Hold a poniki-wood toy — impossibly light, carved in the lane beside you.",
      ],
    },
    localVendors: [
      {
        id: "v-gem50-1",
        name: "Nakash Galli Painters",
        category: "Artisan",
        specialty: "Original Nirmal paintings from the artists' lane",
        lat: 19.08896,
        lng: 78.34168,
        contact: "+91 98317-92871",
      },
      {
        id: "v-gem50-2",
        name: "Nirmal Crafts Society Showroom",
        category: "Artisan",
        specialty: "GI-tagged toys & furniture by the artisan society",
        lat: 19.08506,
        lng: 78.33748,
        contact: "+91 98448-96182",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Highway souvenir shops sell printed copies as paintings — buy in the lane and check the wood back.", lat: 19.08386, lng: 78.33738 },
      { tag: "Cultural Etiquette", message: "Friday afternoons many workshops close for prayers; plan a morning visit.", lat: 19.08946, lng: 78.34258 },
    ],
    mainstreamPopularityIndex: 11,
    vouchesCount: 14,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-18T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222051",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Raghurajpur — The Village That Is a Canvas",
    region: "Bengal, Odisha & the East",
    category: "Living Heritage",
    rawDescription:
      "An entire Pattachitra painters' village near Puri where house walls, doors and verandas are covered in hand-painted gods, epics and folk motifs. Walk lane to lane watching artists grind natural pigments, paint on palm leaf and cloth, and carve stone — then buy a painting straight off the painter's porch.",
    lat: 20.0147,
    lng: 85.8258,
    media: [
      {
        type: "image",
        url: "https://caleidoscope.in/wp-content/uploads/2022/02/Offbeat-Places-in-Odisha-Raghurajpur-e1645786745575.jpg",
        aspect: "portrait",
        caption: "Painted houses of Raghurajpur's artist lane",
      },
    ],
    structuredCards: {
      commute: [
        "Auto or taxi from Puri (14 km) — a 25-minute ride most tourists never take.",
        "Mornings show the most artists at work on their porches.",
      ],
      food: [
        { name: "Odia Thali & Dalma", detail: "Dalma lentil-vegetable stew with rice and saga at village eateries.", priceHint: "INR 150" },
        { name: "Chhena Poda", detail: "Odisha's baked cheese dessert from Puri-side sweet shops.", priceHint: "INR 60" },
      ],
      activities: [
        "Commission a palm-leaf etching and watch your name woven into it.",
        "Walk both lanes comparing Pattachitra, palm-leaf and stone-carving homes.",
      ],
    },
    localVendors: [
      {
        id: "v-gem51-1",
        name: "Raghurajpur Painters' Porches",
        category: "Artisan",
        specialty: "Pattachitra & palm-leaf art direct from painter families",
        lat: 20.0168,
        lng: 85.8277,
        contact: "+91 98324-12642",
      },
      {
        id: "v-gem51-2",
        name: "Heritage Village Craft Cooperative",
        category: "Artisan",
        specialty: "Village-run store with fixed, fair prices",
        lat: 20.0129,
        lng: 85.8235,
        contact: "+91 98455-15953",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Touts at Puri station sell 'village tours' at 4x — hire an auto directly and pay artists, not middlemen.", lat: 20.0117, lng: 85.8234 },
      { tag: "Cultural Etiquette", message: "Homes are studios; knock and greet before stepping onto a painted porch.", lat: 20.0173, lng: 85.8286 },
    ],
    mainstreamPopularityIndex: 13,
    vouchesCount: 21,
    verifiedCheckinsCount: 7,
    createdAt: "2026-11-19T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222052",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Satkosia Gorge — The Mahanadi's Secret Canyon",
    region: "Bengal, Odisha & the East",
    category: "Nature & Trail",
    rawDescription:
      "The Mahanadi squeezes through a 22 km gorge of forested cliffs inside a tiger reserve — boat past sandbanks where gharials and mugger crocodiles sun themselves, camp by the river, and wake to hornbills over emerald water. One of India's deepest river canyons, and it stays nearly empty.",
    lat: 20.60543,
    lng: 84.77674,
    media: [
      {
        type: "image",
        url: "https://tripxl.com/blog/wp-content/uploads/2025/06/Satkosia-Gorge-Sanctuary-1.jpg",
        aspect: "portrait",
        caption: "The Mahanadi bending through Satkosia's gorge",
      },
    ],
    structuredCards: {
      commute: [
        "Enter via Tikarpada or Purunakot gates from Angul; forest permits at the gate.",
        "Book eco-camp stays (Satkosia Sands) online — walk-in beds rarely exist.",
      ],
      food: [
        { name: "River Fish Curry & Rice", detail: "Fresh Mahanadi fish curry at eco-camp kitchens.", priceHint: "INR 220" },
        { name: "Manda Pitha & Ghuguni", detail: "Steamed rice cakes with spiced peas, Odia breakfast style.", priceHint: "INR 60" },
      ],
      activities: [
        "Boat the gorge at dawn counting gharials on the sandbanks.",
        "Night-watch from the eco-camp deck — the gorge goes loud with jungle sound.",
      ],
    },
    localVendors: [
      {
        id: "v-gem52-1",
        name: "Satkosia Eco Camp",
        category: "Homestay",
        specialty: "Forest-department tents & cottages on the riverbank",
        lat: 20.60753,
        lng: 84.77864,
        contact: "+91 98331-22413",
      },
      {
        id: "v-gem52-2",
        name: "Tikarpada Boatmen's Group",
        category: "Cultural Practitioner",
        specialty: "Licensed gorge boat rides with local boatmen",
        lat: 20.60363,
        lng: 84.77444,
        contact: "+91 98462-25724",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Crocs and elephants share this river — no bank walks after sunset, ever.", lat: 20.60243, lng: 84.77434 },
      { tag: "Low Network", message: "Permits and camp bookings must be done before Angul; no signal inside the gorge.", lat: 20.60803, lng: 84.77954 },
    ],
    mainstreamPopularityIndex: 12,
    vouchesCount: 18,
    verifiedCheckinsCount: 6,
    createdAt: "2026-11-20T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222053",
    authorId: "11111111-1111-4111-8111-111111111105",
    title: "Charida — Village of a Thousand Masks",
    region: "Bengal, Odisha & the East",
    category: "Sacred & Craft",
    rawDescription:
      "A single village lane in Purulia lined with workshops where artisans mould, sun-dry and paint the ferocious papier-mâché masks of Chhau dance — Ravanas, Mahishasuras and goddesses with foot-high crowns. Watch a mask go from river clay to blazing colour in a day, and time it with a night Chhau performance.",
    lat: 23.2034,
    lng: 86.03389,
    media: [
      {
        type: "image",
        url: "https://banglalive.today/wp-content/uploads/2025/02/Chhau-Mask-Photo-Story_Pradipta-Chakraborty-6-682x1024.jpeg",
        aspect: "portrait",
        caption: "Chhau masks drying outside a Charida workshop",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Purulia town (30 km) toward Bagmundi, below the Ajodhya Hills.",
        "The mask lane is the village's main street — every doorway is a workshop.",
      ],
      food: [
        { name: "Posto Bata & Alu Jhinge", detail: "Poppy-seed paste with ridge gourd — Purulia home cooking.", priceHint: "INR 130" },
        { name: "Handia (handle with care)", detail: "Traditional rice beer at village haats — potent; one glass is plenty.", priceHint: "INR 40" },
      ],
      activities: [
        "Watch a mask's full day: clay, paper layers, sun, paint, crown.",
        "Stay for an evening Chhau rehearsal in the village akhra.",
      ],
    },
    localVendors: [
      {
        id: "v-gem53-1",
        name: "Charida Mask Makers' Lane",
        category: "Artisan",
        specialty: "Masks from the legendary Gambhir Singh lineage workshops",
        lat: 23.2055,
        lng: 86.03579,
        contact: "+91 98338-32184",
      },
      {
        id: "v-gem53-2",
        name: "Purulia Chhau Academy Stall",
        category: "Cultural Practitioner",
        specialty: "Performance-linked craft sales in the village",
        lat: 23.2016,
        lng: 86.03159,
        contact: "+91 98469-35495",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "Masks are sacred performance objects; ask before trying one on for a photo.", lat: 23.2004, lng: 86.03149 },
      { tag: "Scam Alert", message: "Town shops sell fiberglass copies — genuine Charida masks are papier-mâché, light and matte.", lat: 23.206, lng: 86.03669 },
    ],
    mainstreamPopularityIndex: 10,
    vouchesCount: 16,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-21T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222054",
    authorId: "11111111-1111-4111-8111-111111111106",
    title: "Joynagarer Moa — Bengal's Winter-Only Sweet",
    region: "Bengal, Odisha & the East",
    category: "Regional Cuisine",
    rawDescription:
      "A GI-tagged laddoo that exists only in winter: puffed Kanakchur rice bound with nolen gur (fresh date-palm jaggery), khoya, cashew, raisins and a whisper of cardamom, rolled by hand in Joynagar's sweet shops. It melts in days, so it never truly leaves the region — you have to come to it, in season.",
    lat: 22.17576,
    lng: 88.42039,
    media: [
      {
        type: "image",
        url: "https://images.slurrp.com/prodarticles/f8fexq3mlh.webp",
        aspect: "portrait",
        caption: "Joynagarer moa — winter in a laddoo",
      },
    ],
    structuredCards: {
      commute: [
        "Local train from Kolkata (Sealdah) to Joynagar Majilpur (~1.5 hrs).",
        "Season is roughly December–February; outside it, the real thing doesn't exist.",
      ],
      food: [
        { name: "Joynagarer Moa (Original)", detail: "The sweet itself — buy from shops displaying the GI tag in Joynagar town.", priceHint: "INR 120" },
        { name: "Nolen Gur Sandesh & Rosogolla", detail: "Date-palm jaggery versions of Bengal classics, same season, same shops.", priceHint: "INR 80" },
      ],
      activities: [
        "Watch moa being hand-rolled at dawn in a Joynagar sweet kitchen.",
        "See shiuli tappers climb date palms for the morning's gur harvest.",
      ],
    },
    localVendors: [
      {
        id: "v-gem54-1",
        name: "Joynagar Moa Bhandars",
        category: "Food Vendor",
        specialty: "GI-tagged moa from the town's heritage sweet shops",
        lat: 22.17786,
        lng: 88.42229,
        contact: "+91 98345-41955",
      },
      {
        id: "v-gem54-2",
        name: "Nolen Gur Collectors' Haat",
        category: "Food Vendor",
        specialty: "Fresh date-palm jaggery sold by tappers in winter mornings",
        lat: 22.17396,
        lng: 88.41809,
        contact: "+91 98476-45266",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Kolkata shops sell year-round imitations with essence — real moa is winter-only and Joynagar-made.", lat: 22.17276, lng: 88.41799 },
      { tag: "Cultural Etiquette", message: "Sweet kitchens start at 4 am; visits are welcome if you're buying, not just filming.", lat: 22.17836, lng: 88.42319 },
    ],
    mainstreamPopularityIndex: 11,
    vouchesCount: 17,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-22T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222055",
    authorId: "11111111-1111-4111-8111-111111111101",
    title: "Jitwarpur — Where Madhubani Is Actually Painted",
    region: "Bengal, Odisha & the East",
    category: "Living Heritage",
    rawDescription:
      "In Jitwarpur and its neighbouring Madhubani villages, Mithila women still paint entire walls and paper sheets with kohbar wedding murals, tree-of-life panels and Ramayana scenes in natural dyes and bamboo pens — an unbroken, women-led tradition you can watch at courtyard scale and learn in homestay workshops.",
    lat: 26.38892,
    lng: 86.06338,
    media: [
      {
        type: "image",
        url: "https://patnapress.com/wp-content/uploads/2026/08/mithila.jpg",
        aspect: "portrait",
        caption: "Mithila painting at courtyard scale in Jitwarpur",
      },
    ],
    structuredCards: {
      commute: [
        "Train to Madhubani, then auto to Jitwarpur village (15 mins).",
        "Homestay workshops need a day's notice — painting a kohbar can't be rushed.",
      ],
      food: [
        { name: "Maachh-Bhaat & Sarso", detail: "Mustard fish curry with rice, Mithila's celebratory plate.", priceHint: "INR 210" },
        { name: "Thekua & Pua", detail: "Jaggery thekua and sweet pua from village kitchens.", priceHint: "INR 50" },
      ],
      activities: [
        "Sit with a national-award-lineage artist as a kohbar mural takes shape.",
        "Try the bamboo-pen line work yourself in a homestay workshop.",
      ],
    },
    localVendors: [
      {
        id: "v-gem55-1",
        name: "Jitwarpur Artists' Homes",
        category: "Artisan",
        specialty: "Original Mithila paintings direct from women artists",
        lat: 26.39102,
        lng: 86.06528,
        contact: "+91 98352-51726",
      },
      {
        id: "v-gem55-2",
        name: "Madhubani Haat Collective",
        category: "Artisan",
        specialty: "Village collective store near the station road",
        lat: 26.38712,
        lng: 86.06108,
        contact: "+91 98483-55037",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "Printed 'Madhubani' fabric floods tourist shops — originals are hand-lined on handmade paper or walls.", lat: 26.38592, lng: 86.06098 },
      { tag: "Cultural Etiquette", message: "Artists are mostly women working at home; visits through homestays or the collective are best.", lat: 26.39152, lng: 86.06618 },
    ],
    mainstreamPopularityIndex: 12,
    vouchesCount: 15,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-23T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222056",
    authorId: "11111111-1111-4111-8111-111111111102",
    title: "Silao Khaja — The Ancient Flaky Sweet of Nalanda",
    region: "Bengal, Odisha & the East",
    category: "Regional Cuisine",
    rawDescription:
      "A GI-tagged pastry of dozens of whisper-thin layers, fried crisp and glazed, sold from a row of shops in one small town on the Rajgir road — legend traces it to offerings from the era of the Buddha and Mahavira, who both walked this land. Locals credit Silao's water and air for layers no copycat can match.",
    lat: 25.12591,
    lng: 85.45373,
    media: [
      {
        type: "image",
        url: "https://eatout-beta-wp.outlooktraveller.com/wp-content/uploads/2025/05/Untitled-design-8.jpg",
        aspect: "portrait",
        caption: "Silao khaja — dozens of layers, one small town",
      },
    ],
    structuredCards: {
      commute: [
        "Silao sits on the Rajgir–Nalanda road; buses and autos from Rajgir (8 km).",
        "Buy warm in the morning and eat within hours — khaja waits for no one.",
      ],
      food: [
        { name: "Silao Khaja (Original)", detail: "The layered legend itself, from the shop row in Silao town.", priceHint: "INR 90" },
        { name: "Litti Chokha (Rajgir side)", detail: "Bihar's other icon at Rajgir stalls on the same trip.", priceHint: "INR 70" },
      ],
      activities: [
        "Watch khaja dough being stretched into translucent sheets at a Silao shop.",
        "Pair the sweet run with Nalanda's ruins 15 minutes away — layers upon layers.",
      ],
    },
    localVendors: [
      {
        id: "v-gem56-1",
        name: "Silao Khaja Shop Row",
        category: "Food Vendor",
        specialty: "Generations-old khaja shops with GI-tagged boards",
        lat: 25.12801,
        lng: 85.45563,
        contact: "+91 98359-61497",
      },
      {
        id: "v-gem56-2",
        name: "Rajgir Hot-Spring Stalls",
        category: "Food Vendor",
        specialty: "Snacks and sweets near the kund complex",
        lat: 25.12411,
        lng: 85.45143,
        contact: "+91 98490-64808",
      },
    ],
    safetyAlerts: [
      { tag: "Scam Alert", message: "'Silao-style' khaja is sold across Bihar; the GI original comes only from Silao's shop row.", lat: 25.12291, lng: 85.45133 },
      { tag: "Cultural Etiquette", message: "Shops fry in open view — asking questions is welcome, touching the sheets is not.", lat: 25.12851, lng: 85.45653 },
    ],
    mainstreamPopularityIndex: 9,
    vouchesCount: 14,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-24T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222057",
    authorId: "11111111-1111-4111-8111-111111111103",
    title: "Lodh Falls — Jharkhand's Tallest, Hidden in Sal",
    region: "Bengal, Odisha & the East",
    category: "Nature & Trail",
    rawDescription:
      "The Burha River throws itself ~143 m off a cliff in a roaring multi-tiered cascade deep inside sal forest near the Chhattisgarh border in Latehar. A forest trail and viewpoints get you close enough for the spray; in monsoon the thunder is audible long before the falls appear.",
    lat: 23.4747,
    lng: 84.9388,
    media: [
      {
        type: "image",
        url: "https://adarbepari.com/wp-content/uploads/2019/08/lodh-waterfall-netarhat.jpg",
        aspect: "portrait",
        caption: "Lodh Falls dropping through the sal forest",
      },
    ],
    structuredCards: {
      commute: [
        "Base at Netarhat (40 km) or Mahuadanr; taxis from Latehar for the forest road.",
        "Monsoon is mightiest but the last stretch can slush out — check locally.",
      ],
      food: [
        { name: "Dhuska & Ghugni", detail: "Jharkhand's fried rice-lentil dhuska with spiced ghugni at Netarhat stalls.", priceHint: "INR 80" },
        { name: "Rugra (wild mushroom, seasonal)", detail: "Foraged rugra mushroom curry — a monsoon delicacy of the plateau.", priceHint: "INR 160" },
      ],
      activities: [
        "Take the forest trail to the lower viewpoint for the full 143 m drop.",
        "Sunrise at Netarhat's Magnolia Point the same trip — the plateau's other secret.",
      ],
    },
    localVendors: [
      {
        id: "v-gem57-1",
        name: "Netarhat Hill Homestays",
        category: "Homestay",
        specialty: "Simple plateau stays with falls-trip jeeps",
        lat: 23.4768,
        lng: 84.9407,
        contact: "+91 98366-71268",
      },
      {
        id: "v-gem57-2",
        name: "Mahuadanr Village Kitchen",
        category: "Food Vendor",
        specialty: "Home-style Jharkhandi meals near the falls road",
        lat: 23.4729,
        lng: 84.9365,
        contact: "+91 98497-74579",
      },
    ],
    safetyAlerts: [
      { tag: "Avoid After Dark", message: "Elephant movement is common on forest roads after dusk — be back in Netarhat by sunset.", lat: 23.4717, lng: 84.9364 },
      { tag: "Low Network", message: "No signal at the falls; fix your pickup time with the driver in advance.", lat: 23.4773, lng: 84.9416 },
    ],
    mainstreamPopularityIndex: 11,
    vouchesCount: 16,
    verifiedCheckinsCount: 5,
    createdAt: "2026-11-06T08:30:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222058",
    authorId: "11111111-1111-4111-8111-111111111104",
    title: "Mainpat — The Tibetan Plateau of Chhattisgarh",
    region: "Bengal, Odisha & the East",
    category: "Hidden Village",
    rawDescription:
      "A cool, misty plateau of rolling meadows, pine forests and flat-topped hills in Surguja, settled by Tibetan refugees since 1963 — monasteries, thangka painters and momos alongside tribal villages. Don't miss the Jaljali 'bouncing ground' that trampolines underfoot, the Ulta Pani stream that appears to flow uphill, and Tiger Point waterfall.",
    lat: 22.8419,
    lng: 83.3131,
    media: [
      {
        type: "image",
        url: "https://cms.patrika.com/wp-content/uploads/2025/07/mainpat.jpg?resize=1024,683",
        aspect: "portrait",
        caption: "Mainpat's meadows and monastery plateau",
      },
    ],
    structuredCards: {
      commute: [
        "Drive from Ambikapur (50 km) up the plateau ghat; buses are infrequent.",
        "Stay a night — the plateau's weather turns golden at both ends of the day.",
      ],
      food: [
        { name: "Momos & Thukpa at the Tibetan Camps", detail: "Refugee-settlement kitchens serving plateau-style Tibetan food.", priceHint: "INR 130" },
        { name: "Chawal Ke Cheela & Tomato Chutney", detail: "Chhattisgarhi rice cheela at tribal village stalls.", priceHint: "INR 60" },
      ],
      activities: [
        "Bounce on the Jaljali ground — the earth literally trampolines.",
        "Puzzle over Ulta Pani, where water and cars seem to roll uphill.",
      ],
    },
    localVendors: [
      {
        id: "v-gem58-1",
        name: "Mainpat Tibetan Camp Homestays",
        category: "Homestay",
        specialty: "Family stays inside the refugee settlements",
        lat: 22.844,
        lng: 83.315,
        contact: "+91 98373-81039",
      },
      {
        id: "v-gem58-2",
        name: "Thangka Painters of Mainpat",
        category: "Artisan",
        specialty: "Monastery-trained thangka artists selling studio pieces",
        lat: 22.8401,
        lng: 83.3108,
        contact: "+91 98504-84340",
      },
    ],
    safetyAlerts: [
      { tag: "Cultural Etiquette", message: "The settlements are refugee homes, not exhibits — ask before photographing people and monasteries.", lat: 22.8389, lng: 83.3107 },
      { tag: "Low Network", message: "Fog rolls in fast on the ghat; drive the descent before evening.", lat: 22.8445, lng: 83.3159 },
    ],
    mainstreamPopularityIndex: 10,
    vouchesCount: 15,
    verifiedCheckinsCount: 4,
    createdAt: "2026-11-07T08:30:00Z",
  },
];

// Normalize seeded places so all 18 entries carry Living Heritage tips, UPI handles, and Pathfinder+ verified alerts
export const SEED_PLACES: Place[] = SEED_PLACES_RAW.map((place) => ({
  ...place,
  structuredCards: {
    ...place.structuredCards,
    livingHeritage:
      place.structuredCards.livingHeritage && place.structuredCards.livingHeritage.length > 0
        ? place.structuredCards.livingHeritage
        : [
            `Engage directly with ${place.region} craft stewards and greet elders respectfully.`,
            "Leave zero plastic waste and follow local village footpath etiquette.",
          ],
  },
  localVendors: place.localVendors.map((v) => ({
    ...v,
    upiId: formatUpiHandle(v.name, v.upiId),
  })),
  safetyAlerts: place.safetyAlerts.map((a) => ({
    ...a,
    authorTier: a.authorTier ?? "Local Legend",
    verifiedBy: a.verifiedBy ?? [
      "11111111-1111-4111-8111-111111111101",
      "11111111-1111-4111-8111-111111111102",
    ],
    flaggedBy: a.flaggedBy ?? [],
  })),
}));

export const SEED_VOUCHES: VouchRecord[] = [
  {
    id: "33333333-3333-4333-8333-333333333001",
    placeId: "22222222-2222-4222-8222-222222222005",
    userId: "11111111-1111-4111-8111-111111111106",
    checkedInAt: null,
    vouchedAt: "2026-11-19T10:00:00Z",
    isVerifiedVisit: false,
    pointsAwarded: 10,
  },
];

export const SEED_BADGES: UserBadge[] = [
  {
    id: "44444444-4444-4444-8444-444444444001",
    userId: "11111111-1111-4111-8111-111111111101",
    badgeKey: "first_discovery",
    badgeName: "First Discovery",
    description: "Shared your first offbeat hidden gem with the community.",
    awardedAt: "2026-11-10T08:30:00Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444002",
    userId: "11111111-1111-4111-8111-111111111101",
    badgeKey: "local_legend",
    badgeName: "Local Legend",
    description: "Reached 300+ Trailblazer Points and unlocked priority visibility.",
    awardedAt: "2026-11-15T12:00:00Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444003",
    userId: "11111111-1111-4111-8111-111111111102",
    badgeKey: "first_discovery",
    badgeName: "First Discovery",
    description: "Shared your first offbeat hidden gem with the community.",
    awardedAt: "2026-11-11T09:15:00Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444004",
    userId: "11111111-1111-4111-8111-111111111102",
    badgeKey: "local_legend",
    badgeName: "Local Legend",
    description: "Reached 300+ Trailblazer Points and unlocked priority visibility.",
    awardedAt: "2026-11-16T09:10:00Z",
  },
];

export const SEED_GUIDE_REQUESTS: GuideRequest[] = [
  {
    id: "55555555-5555-4555-8555-555555555001",
    placeId: "22222222-2222-4222-8222-222222222001",
    guideId: "11111111-1111-4111-8111-111111111101",
    requesterId: "11111111-1111-4111-8111-111111111106",
    preferredDate: "2026-12-05",
    notes: "Arriving via morning HRTC bus; would love help finding Roghi cliff trail and local apricot mill.",
    status: "Accepted",
    createdAt: "2026-11-18T09:00:00Z",
  },
];
