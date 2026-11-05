/* The "similar letters" section. Each group: cards (one per sound), a key point,
   words to practice, and pairs where one sound changes the word.
   `family` links a group to the sound mistakes tracked in app.js. */
(function () {
  'use strict';

  window.PL_SOUNDS = [
    {
      id: 'z', family: 'z', title: 'ز و ژ', letters: 'z · ż · rz · ź',
      intro: 'ثلاثة أصوات متقاربة. الفرق في مكان اللسان.',
      cards: [
        { letter: 'z', sound: 'ز', like: 'مثل الزاي العربية، و z في كلمة zoo.', word: 'zupa', ar: 'شوربة', tr: 'زوبا' },
        { letter: 'ż / rz', sound: 'ژ', like: 'مثل s في كلمة measure، و j في الكلمة الفرنسية journal. اللسان للخلف قليلاً والشفتان مستديرتان.', word: 'żona', ar: 'زوجة', tr: 'ژونا' },
        { letter: 'ź / zi', sound: 'ز ناعمة', like: 'ز بلسان مرتفع نحو سقف الفم، كأنك ستقول "زي". أنعم من ژ.', word: 'zima', ar: 'شتاء', tr: 'زيما' }
      ],
      point: 'ż و rz صوت واحد تماماً، والفرق في الكتابة فقط: morze (بحر) و może (ربما) تُنطقان نفس النطق. لكن بعد p و t و k يُنطق rz مثل ش: przepraszam.',
      words: [
        { pl: 'zamek', ar: 'قلعة', tr: 'زاميك' },
        { pl: 'żona', ar: 'زوجة', tr: 'ژونا' },
        { pl: 'rzeka', ar: 'نهر', tr: 'ژيكا' },
        { pl: 'morze', ar: 'بحر', tr: 'موژي' },
        { pl: 'ziemia', ar: 'أرض', tr: 'زييميا' },
        { pl: 'źle', ar: 'بشكل سيئ', tr: 'زلي' }
      ],
      pairs: [{ a: 'zona', aAr: 'منطقة', b: 'żona', bAr: 'زوجة' }]
    },
    {
      id: 'dz', family: 'dz', title: 'دز و دژ و ج', letters: 'dz · dż · dź',
      intro: 'كل صوت هنا يبدأ بدال خفيفة، ثم ينتقل مباشرة إلى صوت ثانٍ، كأنهما صوت واحد متصل.',
      cards: [
        { letter: 'dz', sound: 'دز', like: 'د ثم ز بلا توقف، مثل ds في كلمة adds.', word: 'dzwon', ar: 'جرس', tr: 'دزفون' },
        { letter: 'dż', sound: 'دژ', like: 'مثل j في كلمة jeans، والجيم الفصيحة المعطشة.', word: 'dżem', ar: 'مربى', tr: 'دژيم' },
        { letter: 'dź / dzi', sound: 'ج ناعمة', like: 'جيم خفيفة واللسان مرتفع نحو سقف الفم، أنعم من dż.', word: 'dzień', ar: 'يوم', tr: 'جين' }
      ],
      point: 'لا تنطق dz كأنها ز فقط: يجب أن تسمع الدال في البداية. قارن dzwon (دزفون) مع zupa (زوبا).',
      words: [
        { pl: 'bardzo', ar: 'جداً', tr: 'باردزو' },
        { pl: 'pieniądze', ar: 'نقود', tr: 'بيينيوندزي' },
        { pl: 'dżungla', ar: 'غابة استوائية', tr: 'دژونغلا' },
        { pl: 'dziecko', ar: 'طفل', tr: 'جيتسكو' },
        { pl: 'dziękuję', ar: 'شكراً', tr: 'جينكويي' },
        { pl: 'dźwięk', ar: 'صوت', tr: 'جفيينك' }
      ],
      pairs: []
    },
    {
      id: 's', family: 's', title: 'س و ش', letters: 's · sz · ś',
      intro: 'في العربية ش واحدة، أما البولندية فلها نوعان، ويتغير معنى الكلمة بينهما.',
      cards: [
        { letter: 's', sound: 'س', like: 'مثل السين العربية.', word: 'syn', ar: 'ابن', tr: 'سين' },
        { letter: 'sz', sound: 'ش', like: 'مثل sh في كلمة shop. اللسان للخلف والشفتان مستديرتان قليلاً.', word: 'szkoła', ar: 'مدرسة', tr: 'شكووا' },
        { letter: 'ś / si', sound: 'ش ناعمة', like: 'ش بابتسامة خفيفة، واللسان مرتفع نحو سقف الفم.', word: 'śpij', ar: 'نَم', tr: 'شبيي' }
      ],
      point: 'حرف s وحده لا يُنطق ش أبداً، فاحذر من قراءة sz كأنها s.',
      words: [
        { pl: 'szafa', ar: 'خزانة', tr: 'شافا' },
        { pl: 'kasza', ar: 'عصيدة حبوب', tr: 'كاشا' },
        { pl: 'się', ar: 'نفسه', tr: 'شيي' },
        { pl: 'miłość', ar: 'حب', tr: 'ميووشتش' }
      ],
      pairs: [{ a: 'kasa', aAr: 'صندوق الدفع', b: 'kasza', bAr: 'عصيدة حبوب' }]
    },
    {
      id: 'c', family: 'c', title: 'تس و تش', letters: 'c · cz · ć',
      intro: 'حرف c في البولندية لا يُنطق أبداً مثل ك.',
      cards: [
        { letter: 'c', sound: 'تس', like: 'مثل ts في نهاية كلمة cats.', word: 'co', ar: 'ماذا', tr: 'تسو' },
        { letter: 'cz', sound: 'تش', like: 'مثل ch في كلمة church. اللسان للخلف.', word: 'czas', ar: 'وقت', tr: 'تشاس' },
        { letter: 'ć / ci', sound: 'تش ناعمة', like: 'تش بلسان مرتفع إلى الأمام وابتسامة خفيفة.', word: 'ciebie', ar: 'إياك', tr: 'تشيبيي' }
      ],
      point: 'الفرق بين cz و ć يشبه الفرق بين sz و ś: الأول أثقل، والثاني أنعم.',
      words: [
        { pl: 'noc', ar: 'ليل', tr: 'نوتس' },
        { pl: 'córka', ar: 'ابنة', tr: 'تسوركا' },
        { pl: 'czekaj', ar: 'انتظر', tr: 'تشيكاي' },
        { pl: 'cześć', ar: 'مرحباً', tr: 'تشيشتش' },
        { pl: 'być', ar: 'يكون', tr: 'بيتش' }
      ],
      pairs: [{ a: 'leci', aAr: 'يطير', b: 'leczy', bAr: 'يعالج' }]
    },
    {
      id: 'l', family: 'l', title: 'ل و و', letters: 'l · ł',
      intro: 'الخط الصغير على الحرف يغيّر صوته تماماً.',
      cards: [
        { letter: 'l', sound: 'ل', like: 'مثل اللام العربية.', word: 'las', ar: 'غابة', tr: 'لاس' },
        { letter: 'ł', sound: 'و', like: 'مثل w في كلمة water.', word: 'ładny', ar: 'جميل', tr: 'وادني' }
      ],
      point: 'حرف ł كثير جداً في أفعال الماضي، مثل był (كان) وتُنطق "بيو".',
      words: [
        { pl: 'lubię', ar: 'أحب', tr: 'لوبيي' },
        { pl: 'mały', ar: 'صغير', tr: 'ماوي' },
        { pl: 'miłość', ar: 'حب', tr: 'ميووشتش' },
        { pl: 'był', ar: 'كان', tr: 'بيو' }
      ],
      pairs: [{ a: 'lata', aAr: 'سنوات', b: 'łata', bAr: 'رقعة' }]
    },
    {
      id: 'an', family: 'an', title: 'الأصوات الأنفية', letters: 'ą · ę',
      intro: 'صوتان يخرج جزء منهما من الأنف، وليس لهما مقابل في العربية.',
      cards: [
        { letter: 'ą', sound: 'أون / أوم', like: 'قريب من on في الكلمة الفرنسية bon. قبل b و p يُنطق أوم.', word: 'są', ar: 'هم يكونون', tr: 'سوم' },
        { letter: 'ę', sound: 'إن / إم', like: 'قريب من in في الكلمة الفرنسية vin. قبل b و p يُنطق إم.', word: 'będzie', ar: 'سيكون', tr: 'بينجيي' }
      ],
      point: 'في آخر الكلمة يخف صوت ę كثيراً حتى يصبح مثل e: kawę تُنطق تقريباً كافي.',
      words: [
        { pl: 'mądry', ar: 'ذكي', tr: 'موندري' },
        { pl: 'ząb', ar: 'سن', tr: 'زومب' },
        { pl: 'ręka', ar: 'يد', tr: 'رينكا' },
        { pl: 'proszę', ar: 'من فضلك', tr: 'بروشي' }
      ],
      pairs: []
    },
    {
      id: 'iy', family: 'iy', title: 'ي القصيرة', letters: 'i · y',
      intro: 'هذان حرفان مختلفان، ويغيّران معنى الكلمة.',
      cards: [
        { letter: 'i', sound: 'ي', like: 'مثل ee في كلمة see، والياء العربية.', word: 'mi', ar: 'لي', tr: 'مي' },
        { letter: 'y', sound: 'بين ي وإ', like: 'قريب من i في كلمة sit، واللسان أبعد إلى الخلف من ياء see.', word: 'my', ar: 'نحن', tr: 'مي' }
      ],
      point: 'الكتابة بالعربية لا تُظهر هذا الفرق، فاعتمد على زر الاستماع هنا.',
      words: [
        { pl: 'syn', ar: 'ابن', tr: 'سين' },
        { pl: 'ty', ar: 'أنت', tr: 'تي' },
        { pl: 'piękny', ar: 'جميل', tr: 'بيينكني' }
      ],
      pairs: [{ a: 'miły', aAr: 'لطيف', b: 'mili', bAr: 'لطفاء' }]
    },
    {
      id: 'same', family: null, title: 'حروف مختلفة وصوت واحد', letters: 'h · ch · ó · u · w',
      intro: 'هنا لا يوجد فرق في النطق يجب أن تتعلمه، فالفرق في الكتابة فقط. ويهمك معرفتها حتى لا تنطقها خطأ.',
      cards: [
        { letter: 'h / ch', sound: 'خ', like: 'الحرفان يُنطقان خاءً خفيفة، مثل ch في الاسم الألماني Bach.', word: 'chleb', ar: 'خبز', tr: 'خليب' },
        { letter: 'ó / u', sound: 'أو', like: 'الحرفان يُنطقان نفس النطق، مثل oo في كلمة food لكن أقصر.', word: 'mój', ar: 'لي', tr: 'موي' },
        { letter: 'w', sound: 'ف ثقيلة', like: 'مثل v في كلمة very، ولا تُنطق مثل w الإنجليزية أبداً. في آخر الكلمة تُنطق ف.', word: 'woda', ar: 'ماء', tr: 'فودا' }
      ],
      point: 'حرف w في Kraków يُنطق ف: كراكوف.',
      words: [
        { pl: 'herbata', ar: 'شاي', tr: 'خيرباتا' },
        { pl: 'kawa', ar: 'قهوة', tr: 'كافا' },
        { pl: 'dom', ar: 'بيت', tr: 'دوم' },
        { pl: 'Kraków', ar: 'كراكوف', tr: 'كراكوف' }
      ],
      pairs: []
    }
  ];
})();
