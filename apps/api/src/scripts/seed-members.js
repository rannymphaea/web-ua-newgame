/**
 * NEWGAME Member Seed Script
 * Migrate 125 hardcoded members from members.html → Firestore
 * Run with: node apps/api/src/scripts/seed-members.js
 */
const admin = require('firebase-admin');

// Initialize with ADC or service account
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (serviceAccountPath) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  admin.initializeApp({ projectId: 'qr-absensi-unandnewgame' });
}

const db = admin.firestore();

const MEMBER_DATA = [
  {no:1,gen:"GEN 1",pillar:"Game Logic",id:"NG11001001GL",name:"Zulfi Ariyan",status:"ACTIVE",team:"Project"},
  {no:2,gen:"GEN 1",pillar:"Game Design",id:"NG11001001GD",name:"Annisa Revalina Harahap",status:"ACTIVE",team:"Project"},
  {no:4,gen:"GEN 1",pillar:"Game Logic",id:"NG11004005PG",name:"Dion Faizal Saputra",status:"NPC",team:"NPC"},
  {no:5,gen:"GEN 1",pillar:"Game Logic",id:"NG11005006PG",name:"Achmad Abidy R",status:"ACTIVE",team:"Training"},
  {no:6,gen:"GEN 1",pillar:"Game Logic",id:"NG11006008PG",name:"Rayhan Habibi",status:"AFK",team:""},
  {no:7,gen:"GEN 1",pillar:"Game Logic",id:"NG11007016PG",name:"Faridhatul Azhari",status:"AFK",team:""},
  {no:8,gen:"GEN 1",pillar:"Game Logic",id:"NG11008018PG",name:"Novalino",status:"AFK",team:""},
  {no:9,gen:"GEN 1",pillar:"Game Logic",id:"NG11009019PG",name:"Alfarizhi Fitra",status:"ACTIVE",team:""},
  {no:10,gen:"GEN 1",pillar:"Game Logic",id:"NG11010021PG",name:"Naila Faiza Inshyra",status:"ACTIVE",team:"Project"},
  {no:11,gen:"GEN 1",pillar:"Game Logic",id:"NG11011024PG",name:"Renaldi Alwean Saputra",status:"ACTIVE",team:"NPC"},
  {no:12,gen:"GEN 1",pillar:"Game Logic",id:"NG11012025PG",name:"Lexania Nazila",status:"ACTIVE",team:""},
  {no:13,gen:"GEN 1",pillar:"Game Logic",id:"NG11013027PG",name:"Adhiwiryafitra Rulino",status:"AFK",team:""},
  {no:14,gen:"GEN 1",pillar:"Game Logic",id:"NG11014029PG",name:"Elsa Syafitri",status:"ACTIVE",team:"Project"},
  {no:15,gen:"GEN 1",pillar:"Game Logic",id:"NG11015031PG",name:"Muhammad Rasyid Ridha",status:"ACTIVE",team:"Training"},
  {no:16,gen:"GEN 1",pillar:"Game Logic",id:"NG11016032PG",name:"Arib Jilham",status:"ACTIVE",team:"Training"},
  {no:17,gen:"GEN 1",pillar:"Game Logic",id:"NG11017033PG",name:"Ariq Hidayat",status:"RESIGN",team:""},
  {no:18,gen:"GEN 1",pillar:"Game Logic",id:"NG11018034PG",name:"Andi Dewa Aryazetna",status:"ACTIVE",team:"NewMember"},
  {no:19,gen:"GEN 1",pillar:"Game Logic",id:"NG11019037PG",name:"Nabila Tri Hapnesari Aresta",status:"ACTIVE",team:""},
  {no:20,gen:"GEN 1",pillar:"Game Logic",id:"NG11020038PG",name:"Haya Al Fitrah",status:"ACTIVE",team:"FamilyGame"},
  {no:21,gen:"GEN 1",pillar:"Game Logic",id:"NG11021039PG",name:"Muhammad Al Fath",status:"AFK",team:""},
  {no:22,gen:"GEN 1",pillar:"Game Logic",id:"NG11022046PG",name:"Raudhatul Jannah",status:"AFK",team:""},
  {no:23,gen:"GEN 1",pillar:"Game Logic",id:"NG11023048PG",name:"Olif Juansa Putra",status:"AFK",team:""},
  {no:24,gen:"GEN 1",pillar:"Game Logic",id:"NG11024049PG",name:"Naufal Hakim Zulian",status:"ACTIVE",team:"NPC"},
  {no:25,gen:"GEN 1",pillar:"Game Logic",id:"NG11025050PG",name:"Muhammad Riski Fahrezi",status:"ACTIVE",team:"NPC"},
  {no:26,gen:"GEN 1",pillar:"Game Logic",id:"NG11026051PG",name:"Nida Najwa Salimah",status:"AFK",team:""},
  {no:27,gen:"GEN 1",pillar:"Game Logic",id:"NG11027054PG",name:"Hanaviz",status:"AFK",team:""},
  {no:28,gen:"GEN 1",pillar:"Game Logic",id:"NG11028056PG",name:"Muhammad Abdul Malik Al-Khairi",status:"ACTIVE",team:"Project"},
  {no:29,gen:"GEN 1",pillar:"Game Logic",id:"NG11029057PG",name:"Andri Ramadani",status:"ACTIVE",team:"NPC"},
  {no:30,gen:"GEN 1",pillar:"Game Logic",id:"NG11030061PG",name:"Imbang Jayo Gampito",status:"ACTIVE",team:"Training"},
  {no:31,gen:"GEN 1",pillar:"Game Logic",id:"NG11031062PG",name:"Ade Naldia Putra",status:"AFK",team:"NPC"},
  {no:32,gen:"GEN 1",pillar:"Game Logic",id:"NG11032065PG",name:"Farhan Aufa",status:"ACTIVE",team:"NPC"},
  {no:33,gen:"GEN 1",pillar:"Game Logic",id:"NG11033066PG",name:"Ridho Dwi Syahputra",status:"ACTIVE",team:"NPC"},
  {no:34,gen:"GEN 1",pillar:"Game Logic",id:"NG11034067PG",name:"Fachri Akbar",status:"AFK",team:""},
  {no:35,gen:"GEN 1",pillar:"Game Logic",id:"NG11035068PG",name:"Muhammad Abrar Rayva",status:"AFK",team:""},
  {no:36,gen:"GEN 1",pillar:"Game Logic",id:"NG11036069PG",name:"Muhammad Fajri",status:"ACTIVE",team:"NPC"},
  {no:37,gen:"GEN 1",pillar:"Game Logic",id:"NG11037070PG",name:"Habiburrahman",status:"AFK",team:""},
  {no:38,gen:"GEN 1",pillar:"Game Logic",id:"NG11038071PG",name:"Verdi Akbar",status:"AFK",team:""},
  {no:39,gen:"GEN 1",pillar:"Game Logic",id:"NG11039072PG",name:"Fauzan Al Munawar",status:"AFK",team:""},
  {no:40,gen:"GEN 1",pillar:"Game Logic",id:"NG11040073PG",name:"Dani Muhammad Rizq",status:"ACTIVE",team:"Project"},
  {no:41,gen:"GEN 1",pillar:"Game Logic",id:"NG11041074PG",name:"Pandu Aryo",status:"AFK",team:""},
  {no:42,gen:"GEN 1",pillar:"Game Logic",id:"NG11042075PG",name:"Agil Rahman",status:"AFK",team:""},
  {no:43,gen:"GEN 1",pillar:"Game Logic",id:"NG11043077PG",name:"Alvin Emmanuel",status:"RESIGN",team:""},
  {no:44,gen:"GEN 1",pillar:"Game Logic",id:"NG11044078PG",name:"Farhan Hamid",status:"AFK",team:""},
  {no:45,gen:"GEN 1",pillar:"Game Logic",id:"NG11045081PG",name:"Syafira Suci Darma Putri",status:"GLORY",team:""},
  {no:46,gen:"GEN 1",pillar:"Game Logic",id:"NG12046083PG",name:"Aini Khuryati",status:"AFK",team:""},
  {no:47,gen:"GEN 1",pillar:"Game Design",id:"NG11004009GD",name:"Abdullah Azzam Assyafqi",status:"ACTIVE",team:"Core"},
  {no:48,gen:"GEN 1",pillar:"Game Design",id:"NG11005014GD",name:"Fajar Nur Alhamdi",status:"AFK",team:""},
  {no:49,gen:"GEN 1",pillar:"Game Design",id:"NG11006015GD",name:"Hamdi Al Syahzi",status:"AFK",team:""},
  {no:50,gen:"GEN 1",pillar:"Game Design",id:"NG11007017GD",name:"Rasyid Nugrahesa Riqua",status:"ACTIVE",team:""},
  {no:51,gen:"GEN 1",pillar:"Game Design",id:"NG11008020GD",name:"Muhammad Fawwaz Wiyoga",status:"AFK",team:""},
  {no:52,gen:"GEN 1",pillar:"Game Design",id:"NG11009022GD",name:"Fathurrahman Kamil",status:"NPC",team:"NPC"},
  {no:53,gen:"GEN 1",pillar:"Game Design",id:"NG11010023GD",name:"Muhammad Adam",status:"ACTIVE",team:"FamilyGame"},
  {no:54,gen:"GEN 1",pillar:"Game Design",id:"NG11011028GD",name:"Irham Alif Muhammad",status:"ACTIVE",team:"Project"},
  {no:55,gen:"GEN 1",pillar:"Game Design",id:"NG11012036GD",name:"Salsabila Qatrun Nisa",status:"ACTIVE",team:"Core"},
  {no:56,gen:"GEN 1",pillar:"Game Design",id:"NG11013040GD",name:"Velisa Dwi Sonia",status:"ACTIVE",team:"Core"},
  {no:57,gen:"GEN 1",pillar:"Game Design",id:"NG11014041GD",name:"Nailah Khaira Ahmad",status:"ACTIVE",team:"DesignCraft"},
  {no:58,gen:"GEN 1",pillar:"Game Design",id:"NG11015042GD",name:"Ayra Salsabillah Gunanto",status:"AFK",team:""},
  {no:59,gen:"GEN 1",pillar:"Game Design",id:"NG11016043GD",name:"Nabila Nurfatihatul Laila",status:"NPC",team:"NPC"},
  {no:60,gen:"GEN 1",pillar:"Game Design",id:"NG11017044GD",name:"M Agung Andani",status:"AFK",team:""},
  {no:61,gen:"GEN 1",pillar:"Game Design",id:"NG11018045GD",name:"Fadhilla Amalia",status:"ACTIVE",team:"FamilyGame"},
  {no:62,gen:"GEN 1",pillar:"Game Design",id:"NG11019047GD",name:"Riandi Arista Muhammad",status:"AFK",team:""},
  {no:63,gen:"GEN 1",pillar:"Game Design",id:"NG11020052GD",name:"Cece Novitrian",status:"ACTIVE",team:"Inventory"},
  {no:64,gen:"GEN 1",pillar:"Game Design",id:"NG11021053GD",name:"Mhd. Hasbi",status:"AFK",team:""},
  {no:65,gen:"GEN 1",pillar:"Game Design",id:"NG11022055GD",name:"Fahri Zamzami",status:"AFK",team:""},
  {no:66,gen:"GEN 1",pillar:"Game Design",id:"NG11023058GD",name:"Umar Maulana Fiqri",status:"AFK",team:""},
  {no:67,gen:"GEN 1",pillar:"Game Design",id:"NG11024060GD",name:"Howrine Rizqa Delarozy",status:"ACTIVE",team:"Training"},
  {no:68,gen:"GEN 1",pillar:"Game Design",id:"NG11025063GD",name:"Muhammad Rafi Asytar",status:"AFK",team:""},
  {no:69,gen:"GEN 1",pillar:"Game Design",id:"NG11026076GD",name:"Andi Tri Akira",status:"AFK",team:""},
  {no:70,gen:"GEN 1",pillar:"Game Design",id:"NG11027079GD",name:"Muhammad Rafly",status:"AFK",team:""},
  {no:71,gen:"GEN 1",pillar:"Game Design",id:"NG11028082GD",name:"Muhammad Rizki Efendi",status:"AFK",team:""},
  {no:72,gen:"GEN 1",pillar:"Game Sound",id:"NG11004004SF",name:"Aditya Prawira",status:"RESIGN",team:""},
  {no:73,gen:"GEN 1",pillar:"Game Sound",id:"NG11005007SF",name:"Hafizh Ikhwanul Muslim",status:"ACTIVE",team:"Project"},
  {no:74,gen:"GEN 1",pillar:"Game Sound",id:"NG11006010SF",name:"Emi Lazola",status:"ACTIVE",team:"NPC"},
  {no:75,gen:"GEN 1",pillar:"Game Sound",id:"NG11007011SF",name:"Muhammad Rizki Hapiz",status:"AFK",team:"NPC"},
  {no:76,gen:"GEN 1",pillar:"Game Sound",id:"NG11008012SF",name:"Muhammad Zia Ul-Haq",status:"ACTIVE",team:"Core"},
  {no:77,gen:"GEN 1",pillar:"Game Sound",id:"NG11009013SF",name:"Muhammad Zaky Alfareza",status:"AFK",team:"NPC"},
  {no:78,gen:"GEN 1",pillar:"Game Sound",id:"NG11010026SF",name:"Nur Hazizah Welyazhari",status:"ACTIVE",team:"FamilyGame"},
  {no:79,gen:"GEN 1",pillar:"Game Sound",id:"NG11011030SF",name:"Asyratul Mufidah Andini",status:"ACTIVE",team:""},
  {no:80,gen:"GEN 1",pillar:"Game Sound",id:"NG11012035SF",name:"Jilannisa Hanifa",status:"ACTIVE",team:""},
  {no:81,gen:"GEN 1",pillar:"Game Sound",id:"NG11013059SF",name:"Insanul Kamil",status:"ACTIVE",team:""},
  {no:82,gen:"GEN 1",pillar:"Game Sound",id:"NG11014064SF",name:"Adhitya Rizki Pratama",status:"AFK",team:""},
  {no:83,gen:"GEN 1",pillar:"Game Sound",id:"NG11015080SF",name:"Farel Azkira Pratama",status:"AFK",team:""},
  {no:84,gen:"GEN 2",pillar:"Game Design",id:"NG21029084GD",name:"Mutiara Azzahra",status:"ACTIVE",team:"DesignCraft"},
  {no:85,gen:"GEN 2",pillar:"Game Design",id:"NG21030085GD",name:"Nabilah Macika Parelia",status:"ACTIVE",team:"DesignCraft"},
  {no:86,gen:"GEN 2",pillar:"Game Design",id:"NG21031086GD",name:"Zakiyatur Rahmah",status:"ACTIVE",team:"Alliance"},
  {no:87,gen:"GEN 2",pillar:"Game Design",id:"NG21032087GD",name:"Yozi Al Gadri",status:"ACTIVE",team:"DesignCraft"},
  {no:88,gen:"GEN 2",pillar:"Game Design",id:"NG21033088GD",name:"Alyssa Calista Harahap",status:"ACTIVE",team:"DesignCraft"},
  {no:89,gen:"GEN 2",pillar:"Game Design",id:"NG21034089GD",name:"Fadhila Nurzi Hayati",status:"ACTIVE",team:"Project"},
  {no:90,gen:"GEN 2",pillar:"Game Design",id:"NG21035090GD",name:"Ridho Setiawan",status:"ACTIVE",team:"Inventory"},
  {no:91,gen:"GEN 2",pillar:"Game Design",id:"NG21036091GD",name:"Aisyah Nahril Ilmi",status:"ACTIVE",team:"DesignCraft"},
  {no:92,gen:"GEN 2",pillar:"Game Design",id:"NG21037092GD",name:"Nayla Mariza Syahyuda",status:"ACTIVE",team:"Inventory"},
  {no:93,gen:"GEN 2",pillar:"Game Design",id:"NG21038093GD",name:"Rayhan Hanif Rahmani",status:"ACTIVE",team:"DesignCraft"},
  {no:94,gen:"GEN 2",pillar:"Game Design",id:"NG21039094GD",name:"Chita Tri Afrianti",status:"ACTIVE",team:"Alliance"},
  {no:95,gen:"GEN 2",pillar:"Game Design",id:"NG21040095GD",name:"Hanna Zahra Insani Pristiwasa",status:"ACTIVE",team:""},
  {no:96,gen:"GEN 2",pillar:"Game Design",id:"NG21041096GD",name:"Syifa Khalishah Nugroho",status:"ACTIVE",team:"Inventory"},
  {no:97,gen:"GEN 2",pillar:"Game Design",id:"NG21042097GD",name:"Zaki Defano Irvan",status:"ACTIVE",team:""},
  {no:98,gen:"GEN 2",pillar:"Game Logic",id:"NG21047098PG",name:"Ysmayyl Kakajanov",status:"ACTIVE",team:"Training"},
  {no:99,gen:"GEN 2",pillar:"Game Logic",id:"NG21048099PG",name:"Muhammad Yasin Habiburrahman",status:"ACTIVE",team:"Training"},
  {no:100,gen:"GEN 2",pillar:"Game Logic",id:"NG21049100PG",name:"Az Zahrand Solichul Tajussalathin",status:"ACTIVE",team:"Inventory"},
  {no:101,gen:"GEN 2",pillar:"Game Logic",id:"NG21050101PG",name:"Muzaini Sandri",status:"ACTIVE",team:"FamilyGame"},
  {no:102,gen:"GEN 2",pillar:"Game Logic",id:"NG21051102PG",name:"Ilham Maulana Hasibuan",status:"ACTIVE",team:"FamilyGame"},
  {no:103,gen:"GEN 2",pillar:"Game Logic",id:"NG21052103PG",name:"Rafikhul Ramadhan",status:"ACTIVE",team:"Alliance"},
  {no:104,gen:"GEN 2",pillar:"Game Logic",id:"NG21053104PG",name:"Annafi Al Ghifari",status:"ACTIVE",team:""},
  {no:105,gen:"GEN 2",pillar:"Game Logic",id:"NG21054105PG",name:"Luthfi Ariffandi",status:"ACTIVE",team:"Inventory"},
  {no:106,gen:"GEN 2",pillar:"Game Logic",id:"NG21055106PG",name:"Khairi Ibnu Ramadhan",status:"ACTIVE",team:"DesignCraft"},
  {no:107,gen:"GEN 2",pillar:"Game Logic",id:"NG21056107PG",name:"Afif Naufal Zahran",status:"ACTIVE",team:"Training"},
  {no:108,gen:"GEN 2",pillar:"Game Logic",id:"NG21057108PG",name:"Muhammad Yusuf Alwi",status:"ACTIVE",team:"NewMember"},
  {no:109,gen:"GEN 2",pillar:"Game Logic",id:"NG21058109PG",name:"Fachrezi Putra Riandy",status:"ACTIVE",team:"NewMember"},
  {no:110,gen:"GEN 2",pillar:"Game Logic",id:"NG21059110PG",name:"Muhammad Zikra",status:"ACTIVE",team:"NewMember"},
  {no:111,gen:"GEN 2",pillar:"Game Logic",id:"NG21060111PG",name:"Faiz Fikri Satria",status:"ACTIVE",team:"Project"},
  {no:112,gen:"GEN 2",pillar:"Game Logic",id:"NG21061112PG",name:"Ahmad Adzani Gibran",status:"ACTIVE",team:"FamilyGame"},
  {no:113,gen:"GEN 2",pillar:"Game Logic",id:"NG21062113PG",name:"Muhammad Hans Nafis",status:"ACTIVE",team:"FamilyGame"},
  {no:114,gen:"GEN 2",pillar:"Game Logic",id:"NG21063114PG",name:"Rusydi 'Arif",status:"ACTIVE",team:"Alliance"},
  {no:115,gen:"GEN 2",pillar:"Game Logic",id:"NG21064115PG",name:"Zikri Amru Syuhada",status:"ACTIVE",team:"FamilyGame"},
  {no:116,gen:"GEN 2",pillar:"Game Logic",id:"NG21065116PG",name:"Haykal Muhammad Dahnil",status:"ACTIVE",team:"Inventory"},
  {no:117,gen:"GEN 2",pillar:"Game Logic",id:"NG21066117PG",name:"Zakira Athifah Mukhlis",status:"ACTIVE",team:"Inventory"},
  {no:118,gen:"GEN 2",pillar:"Game Logic",id:"NG21067118PG",name:"Muhammad Juang Keenan Purnatama Abindanie",status:"ACTIVE",team:"Alliance"},
  {no:119,gen:"GEN 2",pillar:"Game Logic",id:"NG21068119PG",name:"Fadhel Ibnu Yupardi",status:"ACTIVE",team:"NewMember"},
  {no:120,gen:"GEN 2",pillar:"Game Logic",id:"NG21069120PG",name:"Thaariq Salam",status:"ACTIVE",team:"DesignCraft"},
  {no:121,gen:"GEN 2",pillar:"Game Sound",id:"NG11016121SF",name:"Reyhan Abigail",status:"ACTIVE",team:"Alliance"},
  {no:122,gen:"GEN 2",pillar:"Game Sound",id:"NG11017122SF",name:"Habbiel Zidanu Arsa",status:"ACTIVE",team:"NewMember"},
  {no:123,gen:"GEN 2",pillar:"Game Sound",id:"NG11018123SF",name:"Hafizh Habibullah",status:"ACTIVE",team:""},
  {no:124,gen:"GEN 2",pillar:"Game Sound",id:"NG11019124SF",name:"Muhammad Zaky",status:"ACTIVE",team:"DesignCraft"},
  {no:125,gen:"GEN 2",pillar:"Game Sound",id:"NG11020125SF",name:"Raditya Wengki Maulana",status:"ACTIVE",team:"Inventory"},
];

async function seedMembers() {
  console.log(`🌱 Seeding ${MEMBER_DATA.length} members to Firestore...`);
  
  const batch = db.batch();
  let count = 0;

  for (const m of MEMBER_DATA) {
    const docRef = db.collection('members').doc(m.id);
    batch.set(docRef, {
      memberId: m.id,
      name: m.name,
      pillar: m.pillar,
      division: m.pillar,
      generation: m.gen,
      team: m.team || '',
      status: m.status.toLowerCase(),
      memberNo: m.no,
      xpCache: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    count++;
    // Firestore batch limit = 500
    if (count % 400 === 0) {
      await batch.commit();
      console.log(`  ✅ Committed ${count} members...`);
    }
  }

  await batch.commit();
  console.log(`✅ All ${count} members seeded to Firestore!`);
  process.exit(0);
}

seedMembers().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
