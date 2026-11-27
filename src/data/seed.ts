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

export const SEED_PLACES: Place[] = [
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
        url: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-mountain-ridge-and-forest-42362-large.mp4",
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
        url: "https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-a-forest-2512-large.mp4",
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
        url: "https://assets.mixkit.co/videos/preview/mixkit-potter-working-on-clay-vessel-43235-large.mp4",
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
        url: "https://images.unsplash.com/photo-1513519245088-029cb4e57126?auto=format&fit=crop&w=900&q=80",
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
];

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
