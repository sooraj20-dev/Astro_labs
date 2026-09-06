import { SmileIntensity } from '@/config/detectionConfig';

export interface MockLine {
  id: string;
  intensity: 'mild' | 'medium' | 'extreme';
  malayalam: string;
  transliteration: string;
  englishMeaning: string;
}

export const MOCK_LINES: MockLine[] = [
  // ==========================================
  // MILD SMILE LINES (15 Lines) - Smile Score 40-59
  // ==========================================
  {
    id: 'mild-01',
    intensity: 'mild',
    malayalam: 'എന്താ ചുണ്ടിലൊരു കള്ളച്ചിരി?',
    // Enthada chundiloru kallachiri?
    transliteration: 'Entha chundiloru kallachiri?',
    englishMeaning: 'Why that sneaky little smirk on your lips?',
  },
  {
    id: 'mild-02',
    intensity: 'mild',
    malayalam: 'മെല്ലെ ചിരിച്ചാൽ മതി, പല്ല് കൊഴിഞ്ഞു പോകും.',
    // Melle chirichaal mathi, pallu kozhinju pokum.
    transliteration: 'Melle chirichaal mathi, pallu kozhinju pokum.',
    englishMeaning: 'Smile gently, your teeth might fall out.',
  },
  {
    id: 'mild-03',
    intensity: 'mild',
    malayalam: 'ആഹാ, മുഖത്ത് ചെറിയൊരു വെളിച്ചം വീണല്ലോ!',
    // Aaha, mukhathu cheriyoru velicham veenallo!
    transliteration: 'Aaha, mukhathu cheriyoru velicham veenallo!',
    englishMeaning: 'Aha, a tiny ray of light just hit that serious face!',
  },
  {
    id: 'mild-04',
    intensity: 'mild',
    malayalam: 'കാര്യം പറ, എന്താ മനസ്സിൽ കുസൃതി?',
    // Kaaryam para, entha manassil kusrithi?
    transliteration: 'Kaaryam para, entha manassil kusrithi?',
    englishMeaning: 'Out with it, what mischief is brewing in your mind?',
  },
  {
    id: 'mild-05',
    intensity: 'mild',
    malayalam: 'ഈ ചിരി അത്ര പന്തിയല്ലല്ലോ മോനേ!',
    // Ee chiri athra panthiyallallo mone!
    transliteration: 'Ee chiri athra panthiyallallo mone!',
    englishMeaning: 'This smile doesn’t seem quite right, son!',
  },
  {
    id: 'mild-06',
    intensity: 'mild',
    malayalam: 'പോക്കറ്റിൽ പൈസ വല്ലതും വീണോ പെട്ടെന്ന്?',
    // Pocketil paisa vallathum veeno pettannu?
    transliteration: 'Pocketil paisa vallathum veeno pettannu?',
    englishMeaning: 'Did some cash magically drop into your pocket?',
  },
  {
    id: 'mild-07',
    intensity: 'mild',
    malayalam: 'വലിയ ഗൗരവക്കാരനാണെന്ന ഭാവമൊക്കെ പോയോ?',
    // Valiya gowravakkaarananenna bhaavamokke poyo?
    transliteration: 'Valiya gowravakkaarananenna bhaavamokke poyo?',
    englishMeaning: 'Did that stern tough-guy persona just evaporate?',
  },
  {
    id: 'mild-08',
    intensity: 'mild',
    malayalam: 'പോലീസ് വാച്ച് ചെയ്യുന്നുണ്ട്, ഒതുക്കിപ്പിടിച്ചോ.',
    // Police watch cheyyunnundu, othukkippidicho.
    transliteration: 'Police watch cheyyunnundu, othukkippidicho.',
    englishMeaning: 'Police is watching you, keep that smile under control.',
  },
  {
    id: 'mild-09',
    intensity: 'mild',
    malayalam: 'ചുണ്ടനങ്ങി, കുറ്റം സമ്മതിച്ചു കഴിഞ്ഞു!',
    // Chundanangi, kuttam sammathichu kazhinju!
    transliteration: 'Chundanangi, kuttam sammathichu kazhinju!',
    englishMeaning: 'Lips twitched, guilt has been officially admitted!',
  },
  {
    id: 'mild-10',
    intensity: 'mild',
    malayalam: 'എന്താ ലോട്ടറി അടിച്ച പോലെ ഒരു ഭാവം?',
    // Entha lottery adicha pole oru bhaavam?
    transliteration: 'Entha lottery adicha pole oru bhaavam?',
    englishMeaning: 'Why looking smug like you bagged the jackpot lottery?',
  },
  {
    id: 'mild-11',
    intensity: 'mild',
    malayalam: 'ആഹാ, കാറ്റ് പിടിച്ച ബലൂൺ പോലെ ചിരിക്കുന്നു!',
    // Aaha, kaattu pidicha balloon pole chirikkunnu!
    transliteration: 'Aaha, kaattu pidicha balloon pole chirikkunnu!',
    englishMeaning: 'Aha, puffing up like a balloon with that grin!',
  },
  {
    id: 'mild-12',
    intensity: 'mild',
    malayalam: 'ഒരു കാരണവുമില്ലാതെ ചിരിച്ചാൽ സംശയം തോന്നും.',
    // Oru kaaranavumillathe chirichaal samshayam thonnum.
    transliteration: 'Oru kaaranavumillathe chirichaal samshayam thonnum.',
    englishMeaning: 'Smiling without cause raises immediate police suspicion.',
  },
  {
    id: 'mild-13',
    intensity: 'mild',
    malayalam: 'കണ്ടാൽ മാന്യൻ, പക്ഷേ ചിരിയിൽ വില്ലത്തരം!',
    // Kandaal maanyan, pakshe chiriyil villatharam!
    transliteration: 'Kandaal maanyan, pakshe chiriyil villatharam!',
    englishMeaning: 'Looks respectable outside, but the smile reveals pure villainy!',
  },
  {
    id: 'mild-14',
    intensity: 'mild',
    malayalam: 'ഇത്ര നേരം സീരിയസ് ആയി നിന്നതല്ലേ?',
    // Ithra neram serious aayi ninnathalle?
    transliteration: 'Ithra neram serious aayi ninnathalle?',
    englishMeaning: 'Weren’t you pretending to be dead serious just a second ago?',
  },
  {
    id: 'mild-15',
    intensity: 'mild',
    malayalam: 'ആ ചുണ്ടിന്റെ കോണിലെ കളി ഞങ്ങൾ കണ്ടു!',
    // Aa chundinte konile kali njangal kandu!
    transliteration: 'Aa chundinte konile kali njangal kandu!',
    englishMeaning: 'We spotted that twitch at the edge of your lips!',
  },

  // ==========================================
  // MEDIUM SMILE LINES (15 Lines) - Smile Score 60-79
  // ==========================================
  {
    id: 'med-01',
    intensity: 'medium',
    malayalam: 'ഇവൻ എന്തോ കാര്യമായി ഒപ്പിച്ചിട്ടുണ്ട്!',
    // Ivan entho kaaryamaayi oppichittundu!
    transliteration: 'Ivan entho kaaryamaayi oppichittundu!',
    englishMeaning: 'This fellow has definitely executed some serious scam!',
  },
  {
    id: 'med-02',
    intensity: 'medium',
    malayalam: 'മതി ചിരിച്ചത്, ഇവിടെ ആരും തമാശ പറഞ്ഞില്ല!',
    // Mathi chirichathu, ivide aarum thamaasha paranjilla!
    transliteration: 'Mathi chirichathu, ivide aarum thamaasha paranjilla!',
    englishMeaning: 'Stop laughing, nobody cracked a joke here!',
  },
  {
    id: 'med-03',
    intensity: 'medium',
    malayalam: 'ഈ ചിരിക്ക് ഞാൻ ഒരു കേസ് ചാർജ്ജ് ചെയ്യും!',
    // Ee chirikku njan oru case charge cheyyum!
    transliteration: 'Ee chirikku njan oru case charge cheyyum!',
    englishMeaning: 'I am filing a criminal charge for this unauthorized smile!',
  },
  {
    id: 'med-04',
    intensity: 'medium',
    malayalam: 'അത്രക്ക് വലിയ സന്തോഷം ഇവിടെ ആർക്കും വേണ്ടാ!',
    // Athrakku valiya santhosham ivide aarkkum venda!
    transliteration: 'Athrakku valiya santhosham ivide aarkkum venda!',
    englishMeaning: 'Nobody permitted this much happiness in this precinct!',
  },
  {
    id: 'med-05',
    intensity: 'medium',
    malayalam: 'ചിരി കണ്ട് പേടി തോന്നുന്നു, എന്ത് പറ്റി?',
    // Chiri kandu pedi thonnunnu, enthu patti?
    transliteration: 'Chiri kandu pedi thonnunnu, enthu patti?',
    englishMeaning: 'That grin is creeping us out, what is wrong with you?',
  },
  {
    id: 'med-06',
    intensity: 'medium',
    malayalam: 'ഇതിപ്പോ ചിരിയാണോ അതോ കൊഞ്ഞനം കുത്തലാണോ?',
    // Ithippo chriyaano atho konjanam kuthalaano?
    transliteration: 'Ithippo chriyaano atho konjanam kuthalaano?',
    englishMeaning: 'Is that a smile or are you mocking the department?',
  },
  {
    id: 'med-07',
    intensity: 'medium',
    malayalam: 'നിന്റെ മനസ്സ് ശരിയല്ല മോനേ, പോലീസ് ഉറപ്പിച്ചു!',
    // Ninte manassu sariyalla mone, police urappichu!
    transliteration: 'Ninte manassu sariyalla mone, police urappichu!',
    englishMeaning: 'Your intentions are crooked, police confirms it!',
  },
  {
    id: 'med-08',
    intensity: 'medium',
    malayalam: 'ക്യാമറയുടെ മുന്നിൽ തന്നെ ഇളിക്കണം എന്ന് വല്ല നിർബന്ധവുമുണ്ടോ?',
    // Camerayude munnil thanne ilikkanam ennu valla nirbandhavumundo?
    transliteration: 'Camerayude munnil thanne ilikkanam ennu valla nirbandhavumundo?',
    englishMeaning: 'Is it mandatory to bare your teeth right at the surveillance camera?',
  },
  {
    id: 'med-09',
    intensity: 'medium',
    malayalam: 'ആരെ പറ്റിച്ച ചിരിയാടാ ഇത്?',
    // Aare patticha chriyaada ithu?
    transliteration: 'Aare patticha chriyaada ithu?',
    englishMeaning: 'Whom did you swindle to get a smile this wide?',
  },
  {
    id: 'med-10',
    intensity: 'medium',
    malayalam: 'നല്ല പുള്ളി! ചിരി കൊണ്ട് കോട്ട പണിയുകയാണോ?',
    // Nalla pulli! Chiri kondu kotta paniyukayaano?
    transliteration: 'Nalla pulli! Chiri kondu kotta paniyukayaano?',
    englishMeaning: 'Great guy! Trying to build a fortress out of smiles?',
  },
  {
    id: 'med-11',
    intensity: 'medium',
    malayalam: 'ചിരിയുടെ അളവ് പരിധി വിട്ടു, ഒന്നു കുറക്ക്!',
    // Chiriyude alavu paridhi vittu, onnu kurakku!
    transliteration: 'Chiriyude alavu paridhi vittu, onnu kurakku!',
    englishMeaning: 'Smile level breached permitted limits, tone it down!',
  },
  {
    id: 'med-12',
    intensity: 'medium',
    malayalam: 'സത്യം പറഞ്ഞോ, വേറെ ആരും കാണാതെ എന്താ ചെയ്തത്?',
    // Sathyam paranjo, vere aarum kaanathe entha cheythathu?
    transliteration: 'Sathyam paranjo, vere aarum kaanathe entha cheythathu?',
    englishMeaning: 'Confess! What did you do when no one was looking?',
  },
  {
    id: 'med-13',
    intensity: 'medium',
    malayalam: 'ആ പല്ലെല്ലാം കൂടി പുറത്തേക്ക് വരാൻ തിടുക്കം കൂട്ടുന്നു!',
    // Aa pallellaam koodi purathekku varaan thidukkam koottunnu!
    transliteration: 'Aa pallellaam koodi purathekku varaan thidukkam koottunnu!',
    englishMeaning: 'All those teeth are desperately rushing to jump out!',
  },
  {
    id: 'med-14',
    intensity: 'medium',
    malayalam: 'അടുത്ത മിനിറ്റിൽ കരയാൻ സാധ്യതയുണ്ട്!',
    // Adutha minuttil karayaan saadhyathayundu!
    transliteration: 'Adutha minuttil karayaan saadhyathayundu!',
    englishMeaning: 'Forensics predict high likelihood of crying within minutes!',
  },
  {
    id: 'med-15',
    intensity: 'medium',
    malayalam: 'ഇതൊരു സസ്‌പെൻഷൻ ഓർഡർ അർഹിക്കുന്ന ചിരിയാണ്!',
    // Ithoru suspension order arhikkunna chriyaanu!
    transliteration: 'Ithoru suspension order arhikkunna chriyaanu!',
    englishMeaning: 'This smile qualifies for an immediate suspension warrant!',
  },

  // ==========================================
  // EXTREME SMILE LINES (15 Lines) - Smile Score 80-100
  // ==========================================
  {
    id: 'ext-01',
    intensity: 'extreme',
    malayalam: 'അയ്യോ കൺട്രോൾ പോയി! വാ മൂട് മനുഷ്യാ!',
    // Ayyo control poyi! Vaa moodu manushyaa!
    transliteration: 'Ayyo control poyi! Vaa moodu manushyaa!',
    englishMeaning: 'Total loss of control! Shut your mouth, human!',
  },
  {
    id: 'ext-02',
    intensity: 'extreme',
    malayalam: 'ഭൂമി കുലുങ്ങുന്ന ചിരിയാണല്ലോ ഇത്!',
    // Bhoomi kulungunna chriyaanallo ithu!
    transliteration: 'Bhoomi kulungunna chriyaanallo ithu!',
    englishMeaning: 'This laugh is triggering seismic activity!',
  },
  {
    id: 'ext-03',
    intensity: 'extreme',
    malayalam: 'അടിയന്തര സാഹചര്യം! ഇവിടെ ചിരി സുനാമി വരുന്നു!',
    // Adiyanthara saahacharyam! Ivide chiri tsunami varunnu!
    transliteration: 'Adiyanthara saahacharyam! Ivide chiri tsunami varunnu!',
    englishMeaning: 'Red alert! A smile tsunami is crashing into the station!',
  },
  {
    id: 'ext-04',
    intensity: 'extreme',
    malayalam: 'ഇത്രയും ചിരിക്കാൻ നിനക്ക് നാണമില്ലേ സൂർത്തേ?',
    // Ithrayum chirikkaan ninakku naanamille soorthé?
    transliteration: 'Ithrayum chirikkaan ninakku naanamille soorthé?',
    englishMeaning: 'Do you feel no shame smiling this outrageously, friend?',
  },
  {
    id: 'ext-05',
    intensity: 'extreme',
    malayalam: 'താടിയെല്ല് തെറിച്ചു താഴെ വീഴാൻ സാധ്യത കാണുന്നു!',
    // Thaadiyellu therichu thaazhe veezhaan saadhyatha kaanunnu!
    transliteration: 'Thaadiyellu therichu thaazhe veezhaan saadhyatha kaanunnu!',
    englishMeaning: 'High risk of jaw dislocation detected on radar!',
  },
  {
    id: 'ext-06',
    intensity: 'extreme',
    malayalam: 'ആംബുലൻസ് വിളിക്കേണ്ടി വരും ഈ പോക്ക് പോയാൽ!',
    // Ambulance vilikkendi varum ee pokku poyaal!
    transliteration: 'Ambulance vilikkendi varum ee pokku poyaal!',
    englishMeaning: 'An ambulance dispatch will be required if this laughter persists!',
  },
  {
    id: 'ext-07',
    intensity: 'extreme',
    malayalam: 'നിർത്തടാ നിർത്തടാ, നാട് മുഴുവൻ കേൾക്കുന്നു!',
    // Nirthada nirthada, naadu muzhuvan kelkkunnu!
    transliteration: 'Nirthada nirthada, naadu muzhuvan kelkkunnu!',
    englishMeaning: 'Stop it, stop it! The entire district can hear you!',
  },
  {
    id: 'ext-08',
    intensity: 'extreme',
    malayalam: 'ഇവൻ ചിരിച്ച് ചിരിച്ച് ലോകം കൈപ്പിടിയിലാക്കുമോ?',
    // Ivan chirichu chirichu lokam kaippidiyilaakkumo?
    transliteration: 'Ivan chirichu chirichu lokam kaippidiyilaakkumo?',
    englishMeaning: 'Does this suspect plan to conquer the universe through chuckles?',
  },
  {
    id: 'ext-09',
    intensity: 'extreme',
    malayalam: 'ചിരി പോലീസ് റെയ്ഡ്! ഉടൻ കൈകൾ ഉയർത്തുക!',
    // Chiri Police Raid! Udan kaikal uyarthuka!
    transliteration: 'Chiri Police Raid! Udan kaikal uyarthuka!',
    englishMeaning: 'Chiri Police Raid in progress! Raise your hands immediately!',
  },
  {
    id: 'ext-10',
    intensity: 'extreme',
    malayalam: 'ഇത്രക്ക് ചിരിച്ചാൽ കണ്ണ് തന്നെ കാണാതാകും കേട്ടോ!',
    // Ithrakku chirichaal kannu thanne kaanaathaakum ketto!
    transliteration: 'Ithrakku chirichaal kannu thanne kaanaathaakum ketto!',
    englishMeaning: 'Smiling so hard both eyes have disappeared into your skull!',
  },
  {
    id: 'ext-11',
    intensity: 'extreme',
    malayalam: 'അന്തംവിട്ട ചിരി! ഇയാൾക്ക് ബോധം നഷ്ടപ്പെട്ടു കഴിഞ്ഞു!',
    // Anthamvitta chiri! Iyaalkku bodham nashtappettu kazhinju!
    transliteration: 'Anthamvitta chiri! Iyaalkku bodham nashtappettu kazhinju!',
    englishMeaning: 'Unhinged cackling! Subject has suffered acute loss of composure!',
  },
  {
    id: 'ext-12',
    intensity: 'extreme',
    malayalam: 'ഇത്ര സന്തോഷിക്കാൻ കേരളത്തിൽ എന്ത് സംഭവിച്ചു?',
    // Ithra santhoshikkaan Keralathil enthu sambhavichu?
    transliteration: 'Ithra santhoshikkaan Keralathil enthu sambhavichu?',
    englishMeaning: 'What miraculous occurrence took place in Kerala for this euphoria?',
  },
  {
    id: 'ext-13',
    intensity: 'extreme',
    malayalam: 'ഇറങ്ങി ഓടിക്കോ, ചിരി വെടിക്കെട്ട് പൊട്ടിത്തെറിച്ചു!',
    // Irangi odikko, chiri vedikkettu pottitherichu!
    transliteration: 'Irangi odikko, chiri vedikkettu pottitherichu!',
    englishMeaning: 'Evacuate immediately, the laughter dynamite just detonated!',
  },
  {
    id: 'ext-14',
    intensity: 'extreme',
    malayalam: 'പല്ലു ഡോക്ടർ പോലും ഇത്രയും പല്ല് ഒരുമിച്ച് കണ്ടിട്ടുണ്ടാവില്ല!',
    // Pallu doctor polum ithrayum pallu orumichu kandittundaavilla!
    transliteration: 'Pallu doctor polum ithrayum pallu orumichu kandittundaavilla!',
    englishMeaning: 'Even a certified dental surgeon has never seen this many teeth at once!',
  },
  {
    id: 'ext-15',
    intensity: 'extreme',
    malayalam: 'അറസ്റ്റ് വാറണ്ട് റെഡിയാണ്, ചിരി അടിയന്തരമായി നിർത്തിക്കോളൂ!',
    // Arrest warrant ready aaanu, chiri adiyantharamaayi nirthikkoloo!
    transliteration: 'Arrest warrant ready aaanu, chiri adiyantharamaayi nirthikkoloo!',
    englishMeaning: 'Arrest warrant issued! Cease smiling under police directive!',
  },
];
