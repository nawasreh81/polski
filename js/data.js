/* Lesson content and word-form tables.
   Inside a Polish sentence, a word that changes form is written [[surface|lemmaId|g]].
   g = m (masculine), f (feminine), n (neuter), p (plural), x (verb without gender).
   For nouns g can be omitted; the lemma's gender is used. */
(function () {
  'use strict';

  const CASES = [
    { pl: 'Mianownik', ar: 'الفاعل: من؟ ماذا؟', frame: 'To jest …' },
    { pl: 'Dopełniacz', ar: 'النفي والملكية والكمية', frame: 'Nie ma …' },
    { pl: 'Celownik', ar: 'لِمَن؟ (أشكر، أعطي)', frame: 'Dziękuję …' },
    { pl: 'Biernik', ar: 'المفعول به (أحب، أرى)', frame: 'Widzę …' },
    { pl: 'Narzędnik', ar: 'مع … / بعد jestem', frame: 'z … / Jestem …' },
    { pl: 'Miejscownik', ar: 'في … / عن …', frame: 'o …' },
    { pl: 'Wołacz', ar: 'النداء: يا …', frame: '…!' }
  ];

  const PERSONS = ['ja', 'ty', 'on / ona / ono', 'my', 'wy', 'oni / one'];

  function noun(pl, ar, g, sg, plur, extra) {
    const o = { pos: 'noun', pl, ar, g, sg, plur };
    return Object.assign(o, extra || {});
  }

  // Adjective tables generated from the stem. kind 'hard' (piękny) or 'kg' (drogi).
  function adj(pl, ar, stem, virile, kind) {
    const i = kind === 'kg' ? 'i' : 'y';
    const e = kind === 'kg' ? 'ie' : 'e';
    const ego = kind === 'kg' ? 'iego' : 'ego';
    const emu = kind === 'kg' ? 'iemu' : 'emu';
    const ej = kind === 'kg' ? 'iej' : 'ej';
    const ym = kind === 'kg' ? 'im' : 'ym';
    const ych = kind === 'kg' ? 'ich' : 'ych';
    const ymi = kind === 'kg' ? 'imi' : 'ymi';
    const s = stem;
    return {
      pos: 'adj', pl, ar,
      m: [s + i, s + ego, s + emu, s + i + ' / ' + s + ego, s + ym, s + ym, s + i],
      f: [s + 'a', s + ej, s + ej, s + 'ą', s + 'ą', s + ej, s + 'a'],
      n: [s + e, s + ego, s + emu, s + e, s + ym, s + ym, s + e],
      pv: [virile, s + ych, s + ym, s + ych, s + ymi, s + ych, virile],
      pn: [s + e, s + ych, s + ym, s + e, s + ymi, s + ych, s + e]
    };
  }

  // Verb: present (or future for perfective verbs) plus past-tense stems.
  // past = masculine 3rd person singular (tęsknił), pastV = men's plural (tęsknili).
  function verb(pl, ar, pres, past, pastV, opts) {
    return Object.assign({ pos: 'verb', pl, ar, pres, past, pastV, presLabel: 'المضارع' }, opts || {});
  }

  const LEMMAS = {
    kochanie: noun('kochanie', 'حبيبتي / حبي', 'n',
      ['kochanie', 'kochania', 'kochaniu', 'kochanie', 'kochaniem', 'kochaniu', 'kochanie'],
      ['kochania', 'kochań', 'kochaniom', 'kochania', 'kochaniami', 'kochaniach', 'kochania']),
    skarb: noun('skarb', 'كنز (يقال للحبيب)', 'm',
      ['skarb', 'skarbu', 'skarbowi', 'skarb', 'skarbem', 'skarbie', 'skarbie'],
      ['skarby', 'skarbów', 'skarbom', 'skarby', 'skarbami', 'skarbach', 'skarby']),
    zona: noun('żona', 'زوجة', 'f',
      ['żona', 'żony', 'żonie', 'żonę', 'żoną', 'żonie', 'żono'],
      ['żony', 'żon', 'żonom', 'żony', 'żonami', 'żonach', 'żony']),
    milosc: noun('miłość', 'حب', 'f',
      ['miłość', 'miłości', 'miłości', 'miłość', 'miłością', 'miłości', 'miłości'],
      ['miłości', 'miłości', 'miłościom', 'miłości', 'miłościami', 'miłościach', 'miłości'],
      { countNote: 'كلمة "الحب" لا تُعدّ عادةً، فلا نقول "حبّان".' }),
    serce: noun('serce', 'قلب', 'n',
      ['serce', 'serca', 'sercu', 'serce', 'sercem', 'sercu', 'serce'],
      ['serca', 'serc', 'sercom', 'serca', 'sercami', 'sercach', 'serca']),
    dzien: noun('dzień', 'يوم', 'm',
      ['dzień', 'dnia', 'dniowi', 'dzień', 'dniem', 'dniu', 'dniu'],
      ['dni', 'dni', 'dniom', 'dni', 'dniami', 'dniach', 'dni']),
    zycie: noun('życie', 'حياة', 'n',
      ['życie', 'życia', 'życiu', 'życie', 'życiem', 'życiu', 'życie'],
      ['życia', 'żyć', 'życiom', 'życia', 'życiami', 'życiach', 'życia']),
    wieczor: noun('wieczór', 'مساء / أمسية', 'm',
      ['wieczór', 'wieczoru', 'wieczorowi', 'wieczór', 'wieczorem', 'wieczorze', 'wieczorze'],
      ['wieczory', 'wieczorów', 'wieczorom', 'wieczory', 'wieczorami', 'wieczorach', 'wieczory']),
    slonce: noun('słońce', 'شمس', 'n',
      ['słońce', 'słońca', 'słońcu', 'słońce', 'słońcem', 'słońcu', 'słońce'],
      ['słońca', 'słońc', 'słońcom', 'słońca', 'słońcami', 'słońcach', 'słońca']),
    gwiazda: noun('gwiazda', 'نجمة', 'f',
      ['gwiazda', 'gwiazdy', 'gwieździe', 'gwiazdę', 'gwiazdą', 'gwieździe', 'gwiazdo'],
      ['gwiazdy', 'gwiazd', 'gwiazdom', 'gwiazdy', 'gwiazdami', 'gwiazdach', 'gwiazdy']),
    niespodzianka: noun('niespodzianka', 'مفاجأة', 'f',
      ['niespodzianka', 'niespodzianki', 'niespodziance', 'niespodziankę', 'niespodzianką', 'niespodziance', 'niespodzianko'],
      ['niespodzianki', 'niespodzianek', 'niespodziankom', 'niespodzianki', 'niespodziankami', 'niespodziankach', 'niespodzianki']),
    kolacja: noun('kolacja', 'عشاء', 'f',
      ['kolacja', 'kolacji', 'kolacji', 'kolację', 'kolacją', 'kolacji', 'kolacjo'],
      ['kolacje', 'kolacji', 'kolacjom', 'kolacje', 'kolacjami', 'kolacjach', 'kolacje']),
    kawa: noun('kawa', 'قهوة', 'f',
      ['kawa', 'kawy', 'kawie', 'kawę', 'kawą', 'kawie', 'kawo'],
      ['kawy', 'kaw', 'kawom', 'kawy', 'kawami', 'kawach', 'kawy']),
    usmiech: noun('uśmiech', 'ابتسامة', 'm',
      ['uśmiech', 'uśmiechu', 'uśmiechowi', 'uśmiech', 'uśmiechem', 'uśmiechu', 'uśmiechu'],
      ['uśmiechy', 'uśmiechów', 'uśmiechom', 'uśmiechy', 'uśmiechami', 'uśmiechach', 'uśmiechy']),
    rodzina: noun('rodzina', 'عائلة', 'f',
      ['rodzina', 'rodziny', 'rodzinie', 'rodzinę', 'rodziną', 'rodzinie', 'rodzino'],
      ['rodziny', 'rodzin', 'rodzinom', 'rodziny', 'rodzinami', 'rodzinach', 'rodziny']),
    szkola: noun('szkoła', 'مدرسة', 'f',
      ['szkoła', 'szkoły', 'szkole', 'szkołę', 'szkołą', 'szkole', 'szkoło'],
      ['szkoły', 'szkół', 'szkołom', 'szkoły', 'szkołami', 'szkołach', 'szkoły']),
    zadanie: noun('zadanie', 'واجب / مهمة', 'n',
      ['zadanie', 'zadania', 'zadaniu', 'zadanie', 'zadaniem', 'zadaniu', 'zadanie'],
      ['zadania', 'zadań', 'zadaniom', 'zadania', 'zadaniami', 'zadaniach', 'zadania']),
    syn: noun('syn', 'ابن', 'm',
      ['syn', 'syna', 'synowi', 'syna', 'synem', 'synu', 'synu'],
      ['synowie', 'synów', 'synom', 'synów', 'synami', 'synach', 'synowie'],
      { num24: 'dwaj synowie / dwóch synów', num5: 'pięciu synów',
        countNote: 'مع الرجال تتغير الأرقام نفسها: dwaj / dwóch و pięciu.' }),
    przyjaciel: noun('przyjaciel', 'صديق', 'm',
      ['przyjaciel', 'przyjaciela', 'przyjacielowi', 'przyjaciela', 'przyjacielem', 'przyjacielu', 'przyjacielu'],
      ['przyjaciele', 'przyjaciół', 'przyjaciołom', 'przyjaciół', 'przyjaciółmi', 'przyjaciołach', 'przyjaciele'],
      { num24: 'dwaj przyjaciele / dwóch przyjaciół', num5: 'pięciu przyjaciół',
        countNote: 'مع الرجال تتغير الأرقام نفسها: dwaj / dwóch و pięciu.' }),
    mecz: noun('mecz', 'مباراة', 'm',
      ['mecz', 'meczu', 'meczowi', 'mecz', 'meczem', 'meczu', 'meczu'],
      ['mecze', 'meczów', 'meczom', 'mecze', 'meczami', 'meczach', 'mecze']),
    film: noun('film', 'فيلم', 'm',
      ['film', 'filmu', 'filmowi', 'film', 'filmem', 'filmie', 'filmie'],
      ['filmy', 'filmów', 'filmom', 'filmy', 'filmami', 'filmach', 'filmy']),

    piekny: adj('piękny', 'جميل', 'piękn', 'piękni'),
    dobry: adj('dobry', 'جيد / طيب', 'dobr', 'dobrzy'),
    szczesliwy: adj('szczęśliwy', 'سعيد', 'szczęśliw', 'szczęśliwi'),
    dumny: adj('dumny', 'فخور', 'dumn', 'dumni'),
    zmeczony: adj('zmęczony', 'متعب', 'zmęczon', 'zmęczeni'),
    wspanialy: adj('wspaniały', 'رائع', 'wspaniał', 'wspaniali'),
    drogi: adj('drogi', 'عزيز / غالٍ', 'drog', 'drodzy', 'kg'),
    madry: adj('mądry', 'ذكي / حكيم', 'mądr', 'mądrzy'),
    caly: adj('cały', 'كامل / طوال', 'cał', 'cali'),
    gotowy: adj('gotowy', 'جاهز', 'gotow', 'gotowi'),
    glodny: adj('głodny', 'جائع', 'głodn', 'głodni'),
    nowy: adj('nowy', 'جديد', 'now', 'nowi'),
    domowy: adj('domowy', 'منزلي', 'domow', 'domowi'),

    tesknic: verb('tęsknić', 'يشتاق', ['tęsknię', 'tęsknisz', 'tęskni', 'tęsknimy', 'tęsknicie', 'tęsknią'], 'tęsknił', 'tęsknili'),
    kochac: verb('kochać', 'يحب', ['kocham', 'kochasz', 'kocha', 'kochamy', 'kochacie', 'kochają'], 'kochał', 'kochali'),
    byc: verb('być', 'يكون', ['jestem', 'jesteś', 'jest', 'jesteśmy', 'jesteście', 'są'], 'był', 'byli'),
    miec: verb('mieć', 'يملك / عنده', ['mam', 'masz', 'ma', 'mamy', 'macie', 'mają'], 'miał', 'mieli'),
    myslec: verb('myśleć', 'يفكر', ['myślę', 'myślisz', 'myśli', 'myślimy', 'myślicie', 'myślą'], 'myślał', 'myśleli'),
    spac: verb('spać', 'ينام', ['śpię', 'śpisz', 'śpi', 'śpimy', 'śpicie', 'śpią'], 'spał', 'spali'),
    robic: verb('robić', 'يفعل / يعمل', ['robię', 'robisz', 'robi', 'robimy', 'robicie', 'robią'], 'robił', 'robili'),
    chciec: verb('chcieć', 'يريد', ['chcę', 'chcesz', 'chce', 'chcemy', 'chcecie', 'chcą'], 'chciał', 'chcieli'),
    zarezerwowac: verb('zarezerwować', 'يحجز', ['zarezerwuję', 'zarezerwujesz', 'zarezerwuje', 'zarezerwujemy', 'zarezerwujecie', 'zarezerwują'], 'zarezerwował', 'zarezerwowali',
      { presLabel: 'المستقبل', presNote: 'هذا فعل "تامّ": صيغته الحالية تعني المستقبل (سأحجز).' })
  };

  // Number forms for nouns (2–4 and 5+), unless set by hand.
  Object.keys(LEMMAS).forEach(function (k) {
    const L = LEMMAS[k];
    if (L.pos !== 'noun') return;
    if (!L.num24) L.num24 = (L.g === 'f' ? 'dwie ' : 'dwa ') + L.plur[0];
    if (!L.num5) L.num5 = 'pięć ' + L.plur[1];
  });

  const WIFE = { pl: 'Żona', ar: 'الزوجة' };
  const SON = { pl: 'Syn', ar: 'الابن' };
  const DAUGHTER = { pl: 'Córka', ar: 'البنت' };
  const NEIGHBOR = { pl: 'Sąsiadka', ar: 'الجارة' };

  const LESSONS = [
    {
      id: 'L1', title: 'جمل النجاة', sub: 'عندما لا تفهم ما يقال لك', unit: 'البداية', who: NEIGHBOR,
      phrases: [
        { pl: 'Przepraszam, nie rozumiem.', ar: 'عذراً، لا أفهم.', tr: 'بشيبراشام، نيي روزوميم' },
        { pl: 'Proszę powtórzyć.', ar: 'أعِد من فضلك.', tr: 'بروشي بوفتوجيتش', note: 'كلمة Proszę تعني "من فضلك"، وتصلح مع الجميع: الجيران والموظفين والغرباء.' },
        { pl: 'Proszę mówić wolniej.', ar: 'تكلّم ببطء أكثر من فضلك.', tr: 'بروشي موفيتش فولنيي' },
        { pl: 'Mówię trochę po polsku.', ar: 'أتكلم البولندية قليلاً.', tr: 'موفيي تروخي بو بولسكو' },
        { pl: 'Co to znaczy?', ar: 'ماذا يعني هذا؟', tr: 'تسو تو زناتشي؟' },
        { pl: 'Dziękuję bardzo!', ar: 'شكراً جزيلاً!', tr: 'دجينكويي باردزو' }
      ],
      dialog: [
        { c: 'Dzień dobry! Pan jest [[nowy|nowy|m]] tutaj?', ar: 'صباح الخير! هل أنت جديد هنا؟' },
        { u: 0 },
        { c: 'Pytam, czy pan tu mieszka od niedawna?', ar: 'أسألك: هل تسكن هنا منذ وقت قصير؟' },
        { u: 1 },
        { c: 'Czy pan tu mieszka od niedawna?', ar: 'هل تسكن هنا منذ وقت قصير؟' },
        { u: 2 },
        { c: 'Czy… pan… jest… [[nowy|nowy|m]]?', ar: 'هل… أنت… جديد؟' },
        { u: 3 },
        { c: 'Super! Witamy w naszym bloku!', ar: 'رائع! أهلاً بك في عمارتنا!' },
        { u: 4 },
        { c: 'Witamy to znaczy: ahlan wa sahlan!', ar: 'Witamy تعني: أهلاً وسهلاً!' },
        { u: 5 }
      ]
    },
    {
      id: 'L2', title: 'صباح الخير يا حبيبتي', sub: 'أول كلمات اليوم مع زوجتك', unit: 'الأسرة: الزوجة', who: WIFE,
      phrases: [
        { pl: 'Dzień dobry, [[kochanie|kochanie]].', ar: 'صباح الخير يا حبيبتي.', tr: 'جين دوبري، كوخانيي', note: 'kochanie كلمة محايدة، فتقولها للزوجة وتقولها الزوجة لك.' },
        { pl: 'Dobrze [[spałaś|spac|f]]?', ar: 'هل نمتِ جيداً؟', tr: 'دوبجي سباواش؟', note: 'spałaś للمرأة. لو سألت رجلاً تقول: spałeś.' },
        { pl: 'Jak się czujesz?', ar: 'كيف تشعرين؟', tr: 'ياك شيي تشوييش؟' },
        { pl: 'Zrobię ci [[kawę|kawa]].', ar: 'سأعدّ لكِ القهوة.', tr: 'زروبيي تشي كافي', note: 'kawa تصبح kawę لأنها مفعول به (Biernik).' },
        { pl: 'Wyglądasz pięknie.', ar: 'تبدين جميلة.', tr: 'فيغلونداش بيينكنيي' },
        { pl: 'Miłego [[dnia|dzien]]!', ar: 'يوماً سعيداً!', tr: 'ميويغو دنيا' }
      ],
      dialog: [
        { c: 'Dzień dobry!', ar: 'صباح الخير!' },
        { u: 0 },
        { c: 'Jeszcze jestem śpiąca…', ar: 'ما زلت نعسانة…' },
        { u: 1 },
        { c: 'Tak, ale krótko.', ar: 'نعم، لكن لوقت قصير.' },
        { u: 2 },
        { c: 'Trochę [[zmęczona|zmeczony|f]]. Potrzebuję [[kawy|kawa]]!', ar: 'متعبة قليلاً. أحتاج قهوة!' },
        { u: 3 },
        { c: 'Dziękuję, [[kochanie|kochanie]]! Jak wyglądam?', ar: 'شكراً يا حبيبي! كيف أبدو؟' },
        { u: 4 },
        { c: 'Muszę już iść do pracy.', ar: 'يجب أن أذهب إلى العمل الآن.' },
        { u: 5 }
      ]
    },
    {
      id: 'L3', title: 'كلمات الإعجاب', sub: 'امدح جمالها وابتسامتها', unit: 'الأسرة: الزوجة', who: WIFE,
      phrases: [
        { pl: 'Jesteś [[piękna|piekny|f]].', ar: 'أنتِ جميلة.', tr: 'يستيش بيينكنا', note: 'piękna للمؤنث، piękny للمذكر، piękne للمحايد.' },
        { pl: 'Masz [[piękny|piekny|m]] [[uśmiech|usmiech]].', ar: 'لديكِ ابتسامة جميلة.', tr: 'ماش بيينكني أوشمييخ', note: 'uśmiech مذكر في البولندية، لذلك الصفة piękny.' },
        { pl: '[[Kocham|kochac|x]] twój [[uśmiech|usmiech]].', ar: 'أحب ابتسامتك.', tr: 'كوخام تفوي أوشمييخ' },
        { pl: 'Jesteś dla mnie wszystkim.', ar: 'أنتِ كل شيء بالنسبة لي.', tr: 'يستيش دلا مني فشيستكيم' },
        { pl: 'Ślicznie dziś wyglądasz.', ar: 'تبدين رائعة اليوم.', tr: 'شليتشنيي دجيش فيغلونداش' },
        { pl: 'Masz [[piękne|piekny|p]] oczy.', ar: 'عيناكِ جميلتان.', tr: 'ماش بيينكني أوتشي', note: 'oczy (العينان) جمع، فالصفة بصيغة الجمع: piękne.' }
      ],
      dialog: [
        { c: '[[Kochanie|kochanie]], co myślisz o tej sukience?', ar: 'حبيبي، ما رأيك في هذا الفستان؟' },
        { u: 0 },
        { c: 'Naprawdę?', ar: 'حقاً؟' },
        { u: 5 },
        { c: 'Mówisz tak codziennie!', ar: 'تقول هذا كل يوم!' },
        { u: 4 },
        { c: 'Ojej, rumienię się!', ar: 'يا إلهي، احمرّ وجهي!' },
        { u: 1 },
        { c: 'Ty zawsze wiesz, co powiedzieć.', ar: 'أنت دائماً تعرف ماذا تقول.' },
        { u: 2 },
        { c: 'A ty jesteś moim [[kochaniem|kochanie]].', ar: 'وأنت حبيبي.' },
        { u: 3 }
      ]
    },
    {
      id: 'L4', title: 'الاشتياق والحب', sub: 'قل لها كم تحبها', unit: 'الأسرة: الزوجة', who: WIFE,
      phrases: [
        { pl: '[[Tęskniłem|tesknic|m]] za tobą.', ar: 'اشتقتُ إليكِ.', tr: 'تينسكنيويم زا توبوم', note: 'هذه صيغة الرجل. المرأة تقول: Tęskniłam.' },
        { pl: '[[Kocham|kochac|x]] cię.', ar: 'أحبكِ.', tr: 'كوخام تشي' },
        { pl: 'Bardzo cię [[kocham|kochac|x]].', ar: 'أحبكِ كثيراً.', tr: 'باردزو تشي كوخام' },
        { pl: '[[Myślę|myslec|x]] o tobie [[cały|caly|m]] [[dzień|dzien]].', ar: 'أفكر فيكِ طوال اليوم.', tr: 'ميشلي أو توبيي تساوي جين' },
        { pl: 'Jesteś moim [[skarbem|skarb]].', ar: 'أنتِ كنزي.', tr: 'يستيش مويم سكاربيم', note: 'بعد jestem / jesteś يأتي الاسم في حالة Narzędnik: skarb تصبح skarbem.' },
        { pl: 'Jesteś [[miłością|milosc]] mojego [[życia|zycie]].', ar: 'أنتِ حب حياتي.', tr: 'يستيش ميووشتشوم موييغو جيتشا' }
      ],
      dialog: [
        { c: 'Wróciłam! [[Tęskniłeś|tesknic|m]]?', ar: 'عدت! هل اشتقت لي؟' },
        { u: 0 },
        { c: 'Ja też [[tęskniłam|tesknic|f]]. Bardzo!', ar: 'وأنا أيضاً اشتقت. كثيراً!' },
        { u: 1 },
        { c: 'Ja ciebie też [[kocham|kochac|x]].', ar: 'وأنا أيضاً أحبك.' },
        { u: 2 },
        { c: '[[Myślałeś|myslec|m]] o mnie?', ar: 'هل فكرت بي؟' },
        { u: 3 },
        { c: 'Jesteś słodki.', ar: 'أنت لطيف.' },
        { u: 4 },
        { c: 'A ty jesteś moim mężem.', ar: 'وأنت زوجي.' },
        { u: 5 }
      ]
    },
    {
      id: 'L5', title: 'الشكر والتقدير', sub: 'قدّر ما تفعله لأجلك', unit: 'الأسرة: الزوجة', who: WIFE,
      phrases: [
        { pl: 'Dziękuję ci za wszystko.', ar: 'شكراً لكِ على كل شيء.', tr: 'دجينكويي تشي زا فشيستكو' },
        { pl: 'Jesteś [[wspaniałą|wspanialy|f]] [[żoną|zona]].', ar: 'أنتِ زوجة رائعة.', tr: 'يستيش فسبانياوم جونوم', note: 'بعد jesteś تأتي الصفة والاسم في Narzędnik: wspaniała żona تصبح wspaniałą żoną.' },
        { pl: 'Jestem z tobą [[szczęśliwy|szczesliwy|m]].', ar: 'أنا سعيد معكِ.', tr: 'يستيم ز توبوم شتشينشليفي', note: 'المرأة تقول: szczęśliwa.' },
        { pl: 'Doceniam wszystko, co [[robisz|robic|x]].', ar: 'أقدّر كل ما تفعلينه.', tr: 'دوتسينيام فشيستكو، تسو روبيش' },
        { pl: 'Bez ciebie nie dam rady.', ar: 'بدونكِ لا أستطيع.', tr: 'بيز تشيبيي نيي دام رادي' },
        { pl: 'Jesteś najlepsza.', ar: 'أنتِ الأفضل.', tr: 'يستيش نايليبشا', note: 'للمرأة najlepsza، وللرجل najlepszy.' }
      ],
      dialog: [
        { c: '[[Kolacja|kolacja]] gotowa!', ar: 'العشاء جاهز!' },
        { u: 0 },
        { c: 'Nie ma za co. Lubię dla ciebie gotować.', ar: 'لا شكر على واجب. أحب أن أطبخ لك.' },
        { u: 3 },
        { c: 'Smakuje ci?', ar: 'هل أعجبك الطعم؟' },
        { u: 5 },
        { c: 'Jesteś [[szczęśliwy|szczesliwy|m]]?', ar: 'هل أنت سعيد؟' },
        { u: 2 },
        { c: 'Ja też. Jesteśmy [[dobrą|dobry|f]] [[rodziną|rodzina]].', ar: 'وأنا أيضاً. نحن عائلة جيدة.' },
        { u: 1 },
        { c: 'Ty też jesteś [[wspaniały|wspanialy|m]].', ar: 'وأنت أيضاً رائع.' },
        { u: 4 }
      ]
    },
    {
      id: 'L6', title: 'دعوة رومانسية', sub: 'ادعُها إلى عشاء لكما وحدكما', unit: 'الأسرة: الزوجة', who: WIFE,
      phrases: [
        { pl: 'Chodźmy dziś na [[kolację|kolacja]].', ar: 'لنذهب الليلة إلى العشاء.', tr: 'خودجمي دجيش نا كولاتسيي' },
        { pl: 'Tylko ty i ja.', ar: 'أنتِ وأنا فقط.', tr: 'تيلكو تي إي يا' },
        { pl: '[[Mam|miec|x]] dla ciebie [[niespodziankę|niespodzianka]].', ar: 'عندي لكِ مفاجأة.', tr: 'مام دلا تشيبيي نيسبودجانكي' },
        { pl: '[[Zarezerwowałem|zarezerwowac|m]] stolik.', ar: 'حجزتُ طاولة.', tr: 'زاريزيرفوفاويم ستوليك', note: 'صيغة الرجل في الماضي تنتهي بـ łem. المرأة تقول: zarezerwowałam.' },
        { pl: 'Bądź [[gotowa|gotowy|f]] [[wieczorem|wieczor]].', ar: 'كوني جاهزة في المساء.', tr: 'بوندج غوتوفا فيتشوريم', note: 'wieczorem تعني "في المساء"، وهي wieczór في حالة Narzędnik.' },
        { pl: 'To będzie [[piękny|piekny|m]] [[wieczór|wieczor]].', ar: 'ستكون أمسية جميلة.', tr: 'تو بيندجيي بيينكني فيتشور' }
      ],
      dialog: [
        { c: 'Co [[robimy|robic|x]] dziś [[wieczorem|wieczor]]?', ar: 'ماذا سنفعل هذا المساء؟' },
        { u: 0 },
        { c: 'Z dziećmi?', ar: 'مع الأولاد؟' },
        { u: 1 },
        { c: 'Och, jak romantycznie!', ar: 'أوه، ما أروع هذا!' },
        { u: 2 },
        { c: 'Jaką [[niespodziankę|niespodzianka]]?', ar: 'أي مفاجأة؟' },
        { u: 3 },
        { c: 'W naszej ulubionej restauracji?', ar: 'في مطعمنا المفضل؟' },
        { u: 4 },
        { c: 'Już nie mogę się doczekać!', ar: 'لا أطيق الانتظار!' },
        { u: 5 }
      ]
    },
    {
      id: 'L7', title: 'كلام شاعري', sub: 'جمل من القلب للحظات الهادئة', unit: 'الأسرة: الزوجة', who: WIFE,
      phrases: [
        { pl: 'Jesteś moim [[słońcem|slonce]].', ar: 'أنتِ شمسي.', tr: 'يستيش مويم سووينتسيم' },
        { pl: 'Moje [[serce|serce]] bije tylko dla ciebie.', ar: 'قلبي ينبض لكِ وحدكِ.', tr: 'موييه سيرتسي بيييه تيلكو دلا تشيبيي' },
        { pl: 'Każdy [[dzień|dzien]] z tobą jest [[piękny|piekny|m]].', ar: 'كل يوم معكِ جميل.', tr: 'كاجدي جين ز توبوم يست بيينكني' },
        { pl: 'Twoje oczy są jak [[gwiazdy|gwiazda|p]].', ar: 'عيناكِ مثل النجوم.', tr: 'تفوييه أوتشي سوم ياك غفيازدي' },
        { pl: 'Z tobą czas się zatrzymuje.', ar: 'معكِ يتوقف الزمن.', tr: 'ز توبوم تشاس شيي زاتشيمويه' },
        { pl: '[[Chcę|chciec|x]] się z tobą zestarzeć.', ar: 'أريد أن أكبر في العمر معكِ.', tr: 'خيتسي شيي ز توبوم زيستاجيتش' }
      ],
      dialog: [
        { c: 'Spójrz, jakie [[piękne|piekny|n]] niebo!', ar: 'انظر، ما أجمل السماء!' },
        { u: 3 },
        { c: 'Jesteś dziś bardzo romantyczny.', ar: 'أنت رومانسي جداً اليوم.' },
        { u: 0 },
        { c: 'A ty moim księżycem.', ar: 'وأنت قمري.' },
        { u: 1 },
        { c: 'Naprawdę?', ar: 'حقاً؟' },
        { u: 2 },
        { c: 'Chciałabym, żeby ta chwila trwała wiecznie.', ar: 'أتمنى أن تدوم هذه اللحظة إلى الأبد.' },
        { u: 4 },
        { c: '[[Kocham|kochac|x]] cię, mój [[drogi|drogi|m]].', ar: 'أحبك يا عزيزي.' },
        { u: 5 }
      ]
    },
    {
      id: 'L8', title: 'الاعتذار والمصالحة', sub: 'كيف تصلح الأمور بعد خلاف', unit: 'الأسرة: الزوجة', who: WIFE,
      phrases: [
        { pl: 'Przepraszam, [[kochanie|kochanie]].', ar: 'آسف يا حبيبتي.', tr: 'بشيبراشام، كوخانيي' },
        { pl: 'Nie [[miałem|miec|m]] racji.', ar: 'لم أكن على حق.', tr: 'نيي مياويم راتسيي', note: 'المرأة تقول: Nie miałam racji.' },
        { pl: 'Nie [[chciałem|chciec|m]] cię zranić.', ar: 'لم أقصد أن أجرحكِ.', tr: 'نيي خشياويم تشي زرانيتش' },
        { pl: 'Wybacz mi, proszę.', ar: 'سامحيني من فضلك.', tr: 'فيباتش مي، بروشي' },
        { pl: 'Pogódźmy się.', ar: 'لنتصالح.', tr: 'بوغودجمي شيي' },
        { pl: '[[Kocham|kochac|x]] cię, nawet kiedy się kłócimy.', ar: 'أحبكِ حتى عندما نتشاجر.', tr: 'كوخام تشي، نافيت كييدي شيي كووتشيمي' }
      ],
      dialog: [
        { c: 'Jestem na ciebie zła.', ar: 'أنا غاضبة منك.' },
        { u: 0 },
        { c: 'Wczoraj [[byłeś|byc|m]] niemiły.', ar: 'أمس كنت غير لطيف.' },
        { u: 1 },
        { c: 'Bardzo mnie zraniłeś.', ar: 'جرحتني كثيراً.' },
        { u: 2 },
        { c: 'Hmm… Nie wiem.', ar: 'همم… لا أعرف.' },
        { u: 3 },
        { c: 'Dobrze, ale nie rób tak więcej.', ar: 'حسناً، لكن لا تفعل هذا مرة أخرى.' },
        { u: 4 },
        { c: 'Dobrze. Wybaczam ci.', ar: 'حسناً. أسامحك.' },
        { u: 5 },
        { c: 'Ja ciebie też, głuptasie.', ar: 'وأنا أيضاً أحبك يا مشاكس.' }
      ]
    },
    {
      id: 'L9', title: 'كيف كان يومك؟', sub: 'اسأل ابنك عن يومه ومدرسته', unit: 'الأسرة: الأولاد', who: SON,
      phrases: [
        { pl: 'Cześć! Jak [[było|byc|n]] w [[szkole|szkola]]?', ar: 'مرحباً! كيف كانت المدرسة؟', tr: 'تشيشتش! ياك بيوو ف شكولي؟', note: 'było بصيغة المحايد لأن السؤال عن "الحال" بشكل عام.' },
        { pl: 'Co dzisiaj [[robiłeś|robic|m]]?', ar: 'ماذا فعلت اليوم؟', tr: 'تسو دجيشاي روبيويش؟', note: 'للابن robiłeś، وللبنت robiłaś.' },
        { pl: 'Jesteś [[głodny|glodny|m]]?', ar: 'هل أنت جائع؟', tr: 'يستيش غوودني؟', note: 'للبنت: Jesteś głodna?' },
        { pl: '[[Masz|miec|x]] dużo [[zadań|zadanie|p]] [[domowych|domowy|p]]?', ar: 'هل عندك واجبات كثيرة؟', tr: 'ماش دوجو زادان دوموفيخ؟', note: 'بعد dużo (كثير) يأتي الاسم في Dopełniacz الجمع: zadania تصبح zadań.' },
        { pl: 'Opowiedz mi wszystko.', ar: 'احكِ لي كل شيء.', tr: 'أوبوفييدج مي فشيستكو' },
        { pl: 'Wszystko w porządku?', ar: 'هل كل شيء على ما يرام؟', tr: 'فشيستكو ف بوجوندكو؟' }
      ],
      dialog: [
        { c: 'Cześć, tato!', ar: 'مرحباً يا أبي!' },
        { u: 0 },
        { c: 'Normalnie. Trochę nudno.', ar: 'عادي. ممل قليلاً.' },
        { u: 1 },
        { c: '[[Mieliśmy|miec|p]] test z matmy.', ar: 'كان عندنا اختبار رياضيات.' },
        { u: 5 },
        { c: 'Tak. I mamy [[nowego|nowy|m]] nauczyciela!', ar: 'نعم. وعندنا معلم جديد!' },
        { u: 4 },
        { c: 'Jest fajny, ale daje dużo pracy.', ar: 'إنه لطيف، لكنه يعطي عملاً كثيراً.' },
        { u: 3 },
        { c: 'Tak, niestety…', ar: 'نعم، للأسف…' },
        { u: 2 },
        { c: 'Bardzo! Co jest na obiad?', ar: 'جداً! ماذا على الغداء؟' }
      ]
    },
    {
      id: 'L10', title: 'التشجيع والفخر', sub: 'كلمات تبني ثقة ابنك بنفسه', unit: 'الأسرة: الأولاد', who: SON,
      phrases: [
        { pl: 'Jestem z ciebie [[dumny|dumny|m]].', ar: 'أنا فخور بك.', tr: 'يستيم ز تشيبيي دومني', note: 'هذه صيغة الرجل. الأم تقول: dumna.' },
        { pl: '[[Dobra|dobry|f]] robota!', ar: 'عمل رائع!', tr: 'دوبرا روبوتا', note: 'robota (عمل) مؤنثة، لذلك dobra.' },
        { pl: 'Wierzę w ciebie.', ar: 'أنا أؤمن بك.', tr: 'فييجي ف تشيبيي' },
        { pl: 'Dasz radę!', ar: 'ستقدر عليها!', tr: 'داش رادي' },
        { pl: 'Jesteś bardzo [[mądry|madry|m]].', ar: 'أنت ذكي جداً.', tr: 'يستيش باردزو موندري', note: 'للبنت: mądra.' },
        { pl: '[[Kocham|kochac|x]] cię, [[synu|syn]].', ar: 'أحبك يا بني.', tr: 'كوخام تشي، سينو', note: 'synu صيغة النداء (Wołacz). للبنت تقول: córeczko.' }
      ],
      dialog: [
        { c: 'Tato, dostałem piątkę z testu!', ar: 'أبي، حصلت على علامة 5 في الاختبار!' },
        { u: 1 },
        { c: 'Dzięki! Uczyłem się [[cały|caly|m]] tydzień.', ar: 'شكراً! درست طوال الأسبوع.' },
        { u: 0 },
        { c: 'Ale jutro [[mam|miec|x]] trudny [[mecz|mecz]]…', ar: 'لكن غداً عندي مباراة صعبة…' },
        { u: 3 },
        { c: 'Nie wiem… Tamta drużyna jest silna.', ar: 'لا أعرف… ذلك الفريق قوي.' },
        { u: 2 },
        { c: '[[Myślisz|myslec|x]], że jestem [[dobry|dobry|m]]?', ar: 'هل تظن أنني جيد؟' },
        { u: 4 },
        { c: 'Dzięki, tato. Jesteś najlepszy!', ar: 'شكراً يا أبي. أنت الأفضل!' },
        { u: 5 }
      ]
    },
    {
      id: 'L11', title: 'الاهتمامات والخطط', sub: 'خطط لوقت جميل مع أولادك', unit: 'الأسرة: الأولاد', who: DAUGHTER,
      phrases: [
        { pl: 'Jaki [[film|film]] [[chcesz|chciec|x]] obejrzeć?', ar: 'أي فيلم تريد أن تشاهد؟', tr: 'ياكي فيلم خيتسيش أوبيجيتش؟' },
        { pl: 'Idziemy w sobotę na [[mecz|mecz]]?', ar: 'هل نذهب يوم السبت إلى المباراة؟', tr: 'إيدجيمي ف سوبوتي نا ميتش؟' },
        { pl: 'Zagramy razem?', ar: 'هل نلعب معاً؟', tr: 'زاغرامي رازيم؟' },
        { pl: 'Kim [[są|byc|p]] twoi [[przyjaciele|przyjaciel|p]]?', ar: 'من هم أصدقاؤك؟', tr: 'كيم سوم تفويي بشيياتشيليه؟' },
        { pl: 'Zjedzmy razem [[kolację|kolacja]].', ar: 'لنتناول العشاء معاً.', tr: 'زيادزمي رازيم كولاتسيي' },
        { pl: 'Spędzimy weekend z [[rodziną|rodzina]].', ar: 'سنقضي عطلة نهاية الأسبوع مع العائلة.', tr: 'سبيندجيمي ويكيند ز رودجينوم', note: 'بعد z (مع) يأتي الاسم في Narzędnik: rodzina تصبح rodziną.' }
      ],
      dialog: [
        { c: 'Tato, nudzi mi się.', ar: 'أبي، أشعر بالملل.' },
        { u: 0 },
        { c: 'Może komedię? Albo nie… wolę grać!', ar: 'ربما كوميديا؟ أو لا… أفضّل اللعب!' },
        { u: 2 },
        { c: 'Tak! Ale najpierw zadzwonię do [[przyjaciół|przyjaciel|p]].', ar: 'نعم! لكن أولاً سأتصل بأصدقائي.' },
        { u: 3 },
        { c: 'Ola i Kasia. Są bardzo miłe.', ar: 'أولا وكاشا. إنهما لطيفتان جداً.' },
        { u: 1 },
        { c: 'Super! A w niedzielę?', ar: 'رائع! ويوم الأحد؟' },
        { u: 5 },
        { c: 'Dobrze. Jestem [[głodna|glodny|f]]!', ar: 'حسناً. أنا جائعة!' },
        { u: 4 },
        { c: 'Zawołam mamę!', ar: 'سأنادي أمي!' }
      ]
    },
    {
      id: 'L12', title: 'تصبحين على خير', sub: 'كلمات هادئة في آخر اليوم', unit: 'الأسرة: الزوجة', who: WIFE,
      phrases: [
        { pl: 'Jesteś [[zmęczona|zmeczony|f]]?', ar: 'هل أنتِ متعبة؟', tr: 'يستيش زميتشونا؟' },
        { pl: 'Dziękuję za ten [[piękny|piekny|m]] [[dzień|dzien]].', ar: 'شكراً على هذا اليوم الجميل.', tr: 'دجينكويي زا تين بيينكني جين' },
        { pl: '[[Kocham|kochac|x]] cię coraz bardziej.', ar: 'أحبكِ أكثر فأكثر.', tr: 'كوخام تشي تسوراز بارديي' },
        { pl: 'Dobranoc, [[kochanie|kochanie]].', ar: 'تصبحين على خير يا حبيبتي.', tr: 'دوبرانوتس، كوخانيي' },
        { pl: 'Śpij dobrze.', ar: 'نامي جيداً.', tr: 'شبيي دوبجي' },
        { pl: 'Słodkich snów.', ar: 'أحلاماً سعيدة.', tr: 'سووتكيخ سنوف' }
      ],
      dialog: [
        { c: 'Uff, co za [[dzień|dzien]]!', ar: 'أوف، يا له من يوم!' },
        { u: 0 },
        { c: 'Trochę. Ale to [[był|byc|m]] [[dobry|dobry|m]] [[dzień|dzien]].', ar: 'قليلاً. لكنه كان يوماً جيداً.' },
        { u: 1 },
        { c: 'To ja dziękuję. [[Kocham|kochac|x]] cię.', ar: 'بل أنا من يشكرك. أحبك.' },
        { u: 2 },
        { c: 'Idę spać. Jestem śpiąca.', ar: 'سأذهب للنوم. أنا نعسانة.' },
        { u: 3 },
        { c: 'Dobranoc.', ar: 'تصبح على خير.' },
        { u: 4 },
        { c: 'Ty też, [[kochanie|kochanie]].', ar: 'وأنت أيضاً يا حبيبي.' },
        { u: 5 }
      ]
    }
  ];

  // Topics still to be written, shown as "coming" on the roadmap.
  const LATER = [
    { title: 'الحديث اليومي', sub: 'التعارف، الجيران، الأحاديث القصيرة' },
    { title: 'التسوق والمطعم', sub: 'الأرقام، الأسعار، الطلب' },
    { title: 'المواصلات والسكن', sub: 'الاتجاهات، التذاكر، الإيجار' }
  ];

  window.PL_DATA = { CASES, PERSONS, LEMMAS, LESSONS, LATER };
})();
